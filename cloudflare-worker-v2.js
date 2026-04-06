/**
 * TMAR CORS Proxy — Cloudflare Worker (v2)
 *
 * DUAL MODE:
 *   1. /v1/* routes → Anthropic API proxy (existing behavior, unchanged)
 *   2. ?url=<encoded_url> → Generic CORS proxy for allowed domains
 *
 * The generic proxy is used by tmar-updater.js to fetch upstream
 * source from redressright.me (which has no CORS headers).
 *
 * SETUP: Same as before — deploy to Cloudflare Workers.
 */

// ── Anthropic API proxy config ──
const ALLOWED_API_TARGETS = ['https://api.anthropic.com'];

// ── Generic CORS proxy config ──
// Only these domains can be proxied via ?url= parameter
const ALLOWED_PROXY_DOMAINS = [
  'redressright.me',
  'www.redressright.me',
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
  async fetch(request) {
    // Handle CORS preflight for all routes
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // ── Route 1: Generic CORS proxy (?url= parameter) ──
    const proxyTarget = url.searchParams.get('url');
    if (proxyTarget) {
      return handleGenericProxy(proxyTarget);
    }

    // ── Route 2: Anthropic API proxy (/v1/* passthrough) ──
    return handleAnthropicProxy(request, url);
  },
};

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
