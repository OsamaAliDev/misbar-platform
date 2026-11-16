import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MockBackend } from './mock.mjs';
import { SupabaseBackend } from './supabase.mjs';
import { ApiError, fail, bearer, readJSON, BODY_LIMIT, assertSameOrigin, PeerLimiter } from './security.mjs';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const routes = [
  ['GET', /^\/config$/], ['POST', /^\/staff\/login$/], ['POST', /^\/student\/login$/], ['GET', /^\/session$/], ['POST', /^\/logout$/],
  ['GET', /^\/classes$/], ['POST', /^\/classes$/], ['GET', /^\/classes\/[^/]+\/roster$/], ['POST', /^\/classes\/[^/]+\/students$/],
  ['POST', /^\/student\/import$/], ['POST', /^\/student\/action$/], ['GET', /^\/platform\/counts$/],
];
const publicPaths = new Set(['/config', '/staff/login', '/student/login']);
export function backendConfiguration(env = process.env) {
  const url = env.SUPABASE_URL?.trim(); const key = (env.SUPABASE_ANON_KEY ?? env.ANON_KEY)?.trim();
  const present = env.SUPABASE_URL !== undefined || env.SUPABASE_ANON_KEY !== undefined || env.ANON_KEY !== undefined;
  if (present && (!url || !key)) throw new Error('Partial Supabase configuration: both nonempty SUPABASE_URL and SUPABASE_ANON_KEY are required; mock fallback is disabled');
  if (present) return { mode: 'supabase', url, key };
  if (env.NODE_ENV === 'production' && env.ALLOW_MOCK !== 'true') throw new Error('Production mock mode refused; set real Supabase credentials or explicitly ALLOW_MOCK=true for a demonstration');
  return { mode: 'mock' };
}
export async function createBackend({ env = process.env, ...options } = {}) {
  const config = backendConfiguration(env);
  return config.mode === 'supabase' ? new SupabaseBackend({ ...config, fetchImpl: options.fetchImpl }) : MockBackend.create(options);
}
function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
  res.end(JSON.stringify(payload));
}
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2' };
async function serveStatic(req, res, pathname, distDir) {
  if (!['GET', 'HEAD'].includes(req.method) || pathname.startsWith('/api/') || pathname === '/api') return false;
  let decoded; try { decoded = decodeURIComponent(pathname); } catch { return false; }
  if (decoded.includes('\0') || decoded.includes('\\')) return false;
  const dist = resolve(distDir); let target = resolve(dist, `.${decoded}`);
  if (!target.startsWith(dist + sep) && target !== dist) return false;
  try {
    if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html');
    if (!(await stat(target)).isFile()) return false;
  } catch {
    // Missing API/assets must never receive SPA HTML. Navigation fallback only.
    if (extname(decoded) || decoded.startsWith('/assets/') || !req.headers.accept?.includes('text/html')) return false;
    target = resolve(dist, 'index.html');
    try { if (!(await stat(target)).isFile()) return false; } catch { return false; }
  }
  const body = await readFile(target);
  res.writeHead(200, { 'Content-Type': contentTypes[extname(target)] ?? 'application/octet-stream', 'Content-Length': body.length, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': extname(target) === '.html' ? 'no-cache' : 'public, max-age=3600' });
  res.end(req.method === 'HEAD' ? undefined : body); return true;
}
export async function createSaasServer({ backend, env = process.env, logger = line => console.log(JSON.stringify(line)), distDir = resolve(root, 'dist'), serveDist = env.NODE_ENV === 'production', limiter = new PeerLimiter(), ...backendOptions } = {}) {
  backend ??= await createBackend({ env, ...backendOptions });
  const server = http.createServer(async (req, res) => {
    const started = performance.now(); const requestId = randomUUID(); let loggedRoute = 'not_found';
    res.setHeader('X-Request-Id', requestId);
    // No request bodies, tokens, query strings, nicknames, user IDs or IPs are logged.
    res.on('finish', () => { try { logger({ requestId, method: req.method, route: loggedRoute, status: res.statusCode, durationMs: Math.round(performance.now() - started) }); } catch {} });
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname.startsWith('/api/saas/')) {
        const path = pathname.slice('/api/saas'.length); const matched = routes.find(([method, pattern]) => method === req.method && pattern.test(path));
        if (!matched) fail('not_found');
        loggedRoute = matched[1].source.replaceAll('[^/]+', ':id').replaceAll('\\/', '/').replaceAll('\\', '').replace(/^\^|\$$/g, '');
        assertSameOrigin(req, env.PUBLIC_ORIGIN ?? env.APP_ORIGIN);
        if (path.endsWith('/login')) limiter.consume(req.socket.remoteAddress ?? 'unknown'); // Deliberately ignore X-Forwarded-For.
        const token = publicPaths.has(path) ? undefined : bearer(req);
        if (Number(req.headers['content-length']) > BODY_LIMIT) { req.resume(); fail('invalid_input', 413); }
        const body = ['POST', 'PATCH'].includes(req.method) ? await readJSON(req) : {};
        const result = await backend.handle(req.method, path, body, token);
        json(res, 200, result); return;
      }
      if (serveDist && await serveStatic(req, res, pathname, distDir)) return;
      fail('not_found');
    } catch (error) {
      if (res.headersSent || res.destroyed) return;
      const known = error instanceof ApiError; json(res, known ? error.status : 503, { error: known ? error.code : 'unavailable' });
    }
  });
  server.requestTimeout = 15000; server.headersTimeout = 10000; server.keepAliveTimeout = 5000;
  server.backend = backend;
  return server;
}
export async function start({ env = process.env, dev = process.argv.includes('--dev'), ...options } = {}) {
  const value = env.API_PORT ?? (dev ? '3002' : (env.PORT ?? '3000'));
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535) throw new Error('Invalid server port');
  const server = await createSaasServer({ env, ...options });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(Number(value), env.HOST ?? (env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'), resolve); });
  console.log(`Misbar SaaS ${server.backend.mode} API listening on ${value}${server.backend.mode === 'mock' ? ' (synthetic LOCAL MOCK; not Supabase)' : ''}`);
  return server;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  start().catch(error => { console.error(error.message); process.exitCode = 1; });
}
