import { randomBytes, createHash, timingSafeEqual, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
export const BODY_LIMIT = 32 * 1024;
export const SESSION_TTL = 12 * 60 * 60 * 1000;
export const ATTEMPT_WINDOW = 15 * 60 * 1000;
const statuses = { invalid_credentials: 401, rate_limited: 429, forbidden: 403, duplicate_nickname: 409, invalid_input: 400, unavailable: 503, session_expired: 401, not_found: 404 };
export class ApiError extends Error {
  constructor(code, status = statuses[code] ?? 500) { super(code); this.code = code; this.status = status; }
}
export function fail(code, status) { throw new ApiError(code, status); }
export async function hashSecret(secret) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(secret, salt, 64);
  return `scrypt:${salt}:${hash.toString('hex')}`;
}
export async function verifySecret(secret, encoded) {
  const [kind, salt, hex] = String(encoded ?? '').split(':');
  if (kind !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt ?? '') || !/^[a-f0-9]{128}$/.test(hex ?? '')) return false;
  const actual = await scrypt(secret, salt, 64);
  return timingSafeEqual(actual, Buffer.from(hex, 'hex'));
}
export function tokenHash(token) { return createHash('sha256').update(token).digest('hex'); }
export function newToken() { return randomBytes(32).toString('base64url'); }
export function bearer(req) {
  const match = /^Bearer ([A-Za-z0-9._~-]{20,8192})$/.exec(req.headers.authorization ?? '');
  if (!match) fail('session_expired');
  return match[1];
}
export class PeerLimiter {
  constructor({ now = Date.now, limit = 60, window = ATTEMPT_WINDOW, maxEntries = 10000 } = {}) { Object.assign(this, { now, limit, window, maxEntries }); this.entries = new Map(); }
  consume(peer) {
    const now = this.now();
    for (const [key, entry] of this.entries) if (entry.until <= now) this.entries.delete(key);
    let entry = this.entries.get(peer);
    if (!entry) {
      if (this.entries.size >= this.maxEntries) fail('rate_limited');
      entry = { until: now + this.window, count: 0 }; this.entries.set(peer, entry);
    }
    if (++entry.count > this.limit) fail('rate_limited');
  }
}
export async function readJSON(req) {
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > BODY_LIMIT) fail('invalid_input', 413);
    chunks.push(chunk);
  }
  if (!size) return {};
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] ?? '')) fail('invalid_input', 415);
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail('invalid_input');
    return value;
  } catch { fail('invalid_input'); }
}
export function assertSameOrigin(req, configuredOrigin) {
  if (req.headers['sec-fetch-site'] === 'cross-site') fail('forbidden');
  const origin = req.headers.origin;
  if (!origin) return;
  let parsed;
  try { parsed = new URL(origin); } catch { fail('forbidden'); }
  if (configuredOrigin) {
    if (parsed.origin !== new URL(configuredOrigin).origin) fail('forbidden');
  } else if (parsed.host !== req.headers.host || !['http:', 'https:'].includes(parsed.protocol)) fail('forbidden');
}
