/**
 * TMAR CORS Proxy — Cloudflare Worker (v3)
 *
 * THREE MODES:
 *   1. /v1/* routes        → Anthropic API proxy (existing behavior, unchanged)
 *   2. ?url=<encoded_url>  → Generic CORS proxy for allowed domains
 *   3. POST /send-email    → Transactional email via Resend (requires RESEND_API_KEY secret)
 *
 * The generic proxy is used by tmar-updater.js to fetch upstream source from
 * redressright.me, and by the Entity Verification research engine (ev2SafeFetch
 * in TMAR-Accrual-Ledger.html) to reach SEC IAPD / CFPB, which refuse CORS directly.
 *
 * SETUP: Deploy via workers.cloudflare.com dashboard (paste this file). For email
 * sending, add a Worker secret named RESEND_API_KEY (Settings → Variables and Secrets)
 * with a Resend API key — https://resend.com. Without it, /send-email returns 501.
 */

// ── Anthropic API proxy config ──
const ALLOWED_API_TARGETS = ['https://api.anthropic.com'];

// ── Generic CORS proxy config ──
// Only these domains can be proxied via ?url= parameter
const ALLOWED_PROXY_DOMAINS = [
  'redressright.me',
  'www.redressright.me',
  'api.adviserinfo.sec.gov',
  'www.consumerfinance.gov',
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': [
    'Content-Type',
    'x-api-key',
    'anthropic-version',
    'anthropic-dangerous-request-allow-browser-headers',
    'anthropic-dangerous-direct-browser-access',
    'anthropic-beta',
    'Authorization',
  ].join(', '),
  'Access-Control-Expose-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight for all routes
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // ── Route 0: Send email (POST /send-email) ──
    if (request.method === 'POST' && url.pathname === '/send-email') {
      return handleSendEmail(request, env);
    }

    // ── Route 1: Generic CORS proxy (?url= parameter) ──
    // Must be checked before the health check below — a proxy request's pathname
    // is still '/' (the target URL lives in the query string), so checking
    // pathname === '/' first would swallow every proxy call as a health check.
    // (This is exactly what was happening before this fix: ?url= never reached
    // handleGenericProxy, so the generic proxy silently never worked.)
    const proxyTarget = url.searchParams.get('url');
    if (proxyTarget) {
      return handleGenericProxy(proxyTarget);
    }

    // ── Route 2: Health check (root GET, no query params) ──
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(
        JSON.stringify({ status: 'ok', service: 'TMAR CORS Proxy', version: 3 }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ── Route 3: Anthropic API proxy (/v1/* passthrough) ──
    return handleAnthropicProxy(request, url);
  },
};

// ── Send Email (Resend) ──
async function handleSendEmail(request, env) {
  if (!env || !env.RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Email sending not configured — add a RESEND_API_KEY Worker secret (see file header).' }),
      { status: 501, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }

  const to = payload.to;
  const subject = payload.subject || '(no subject)';
  const text = payload.body || payload.text || '';
  const from = payload.from || env.EMAIL_FROM || 'TMAR <onboarding@resend.dev>';

  if (!to) {
    return new Response(JSON.stringify({ error: '"to" is required' }), { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }

  try {
    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
    const bodyText = await resendResp.text();
    return new Response(bodyText, {
      status: resendResp.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Send failed', message: err.message }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
}

// ── Generic CORS Proxy (for redressright.me) ──
async function handleGenericProxy(targetUrlStr) {
  let targetUrl;
  try {
    targetUrl = new URL(targetUrlStr);
  } catch {
    return new Response('Invalid URL', { status: 400, headers: CORS_HEADERS });
  }

  // Security: only proxy allowed domains
  if (!ALLOWED_PROXY_DOMAINS.includes(targetUrl.hostname)) {
    return new Response(
      JSON.stringify({
        error: 'Domain not allowed',
        allowed: ALLOWED_PROXY_DOMAINS,
      }),
      { status: 403, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: { 'User-Agent': 'TMAR-Updater/1.0' },
    });

    const newHeaders = new Headers(response.headers);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Fetch failed', message: err.message }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
}

// ── Anthropic API Proxy (/v1/* passthrough) ──
async function handleAnthropicProxy(request, url) {
  const targetUrl = 'https://api.anthropic.com' + url.pathname + url.search;

  // Security: only proxy to Anthropic
  if (!ALLOWED_API_TARGETS.some((t) => targetUrl.startsWith(t))) {
    return new Response('Forbidden', { status: 403 });
  }

  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.delete('origin');
  forwardHeaders.delete('referer');
  forwardHeaders.set('anthropic-dangerous-direct-browser-access', 'true');

  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: forwardHeaders,
    body: request.body,
  });

  const response = await fetch(proxyRequest);

  const newHeaders = new Headers(response.headers);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
