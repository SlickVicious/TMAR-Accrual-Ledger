/**
 * TMAR CORS Proxy — Cloudflare Worker
 *
 * Deploy this to Cloudflare Workers (free tier: 100k req/day).
 * It proxies requests to api.anthropic.com and adds CORS headers
 * so the app can call Anthropic directly from GitHub Pages.
 *
 * SETUP (takes ~3 minutes):
 *   1. Go to https://workers.cloudflare.com  (free account)
 *   2. Create a new Worker
 *   3. Paste this entire file into the editor
 *   4. Click "Deploy"
 *   5. Copy the worker URL (e.g. https://tmar-proxy.yourname.workers.dev)
 *   6. In TMAR → EON Sidebar → API Keys → CORS Proxy URL → paste the URL → Save All Keys
 */

const ALLOWED_TARGETS = ['https://api.anthropic.com'];

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
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    // Route /v1/* → api.anthropic.com/v1/*
    const targetUrl = 'https://api.anthropic.com' + url.pathname + url.search;

    // Security: only proxy to Anthropic
    const target = new URL(targetUrl);
    if (!ALLOWED_TARGETS.some(t => targetUrl.startsWith(t))) {
      return new Response('Forbidden', { status: 403 });
    }

    // Build clean headers for Anthropic — strip Origin/Referer (browser flags),
    // inject the required direct-browser-access header server-side
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

    // Clone response and inject CORS headers
    const newHeaders = new Headers(response.headers);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
