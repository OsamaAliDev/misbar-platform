import { readJSON, writeJSON } from './storage.js';

export const GUEST_KEY = 'misbar:student:v1';
export const SESSION_KEY = 'misbar:saas:session:v1';
const API = '/api/saas';

export function readSession() {
  try {
    const value = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    return typeof value?.accessToken === 'string' ? value : null;
  } catch { return null; }
}
export function storeSession(value) {
  if (value) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken: value.accessToken }));
  else sessionStorage.removeItem(SESSION_KEY);
}
export class DataError extends Error {
  constructor(code, status) { super(code); this.code = code; this.status = status; }
}
export async function request(path, { method = 'GET', body, authenticated = true, signal } = {}) {
  const token = authenticated ? readSession()?.accessToken : null;
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`${API}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal, cache: 'no-store', credentials: 'omit' });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new DataError('unavailable', 503);
  }
  let data;
  try { data = await response.json(); } catch { throw new DataError('unavailable', response.status || 503); }
  if (!response.ok || data.error) throw new DataError(data.error || 'unavailable', response.status);
  return data;
}

/** Guest and school adapters share read/import/apply/save; only guests save snapshots. */
export function createLocalStorageAdapter({ sanitize, reduce, initial }) {
  return {
    kind: 'localStorage',
    async read() { return { student: sanitize(readJSON(GUEST_KEY) || initial), canEarn: true }; },
    async import(progress) { const student = sanitize(progress); writeJSON(GUEST_KEY, student); return { student, canEarn: true }; },
    async apply(action) {
      const { student } = await this.read();
      const next = reduce(student, action);
      writeJSON(GUEST_KEY, next);
      return { student: next, canEarn: true };
    },
    save(progress) { writeJSON(GUEST_KEY, sanitize(progress)); },
    peek() { return sanitize(readJSON(GUEST_KEY) || initial); },
  };
}

/** HTTP transport terminates in either real Supabase RPCs or the labeled local mock. */
export function createSupabaseAdapter() {
  return {
    kind: 'supabase',
    async read() { return request('/session'); },
    async import(progress) { return request('/student/import', { method: 'POST', body: { progress } }); },
    async apply(action) { return request('/student/action', { method: 'POST', body: action }); },
    save() { throw new DataError('forbidden', 403); },
  };
}
const call = (path, method, body) => request(path, { method, body });
export const schoolApi = Object.freeze({
  getClasses: () => request('/classes'),
  createClass: (name) => call('/classes', 'POST', typeof name === 'object' ? name : { name }),
  getRoster: (id) => request(`/classes/${encodeURIComponent(id)}/roster`),
  createStudent: (id, values) => call(`/classes/${encodeURIComponent(id)}/students`, 'POST', values),
  getCounts: () => request('/platform/counts'),
});
