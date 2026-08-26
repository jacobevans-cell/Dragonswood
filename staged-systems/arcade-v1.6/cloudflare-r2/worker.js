// Public read-only R2 asset gateway.
// Bind the bucket as ASSETS in wrangler.toml. Never put R2 API keys in the website.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method Not Allowed', { status: 405 });

    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    if (!key || key.includes('..')) return new Response('Not Found', { status: 404 });
    const object = await env.ASSETS.get(key);
    if (!object) return new Response('Not Found', { status: 404, headers: corsHeaders() });

    const headers = new Headers(corsHeaders());
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=86400, s-maxage=604800');
    return new Response(request.method === 'HEAD' ? null : object.body, { headers });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Range',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  };
}
