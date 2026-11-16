import { randomBytes } from 'node:crypto';
import { fail, ApiError } from './security.mjs';
import { onlyKeys, nickname, pin, classCode, displayName, uuid, importProgress, validateAction, safeStudent, safeClass } from './progress.mjs';
const knownErrors = new Set(['invalid_credentials', 'rate_limited', 'forbidden', 'duplicate_nickname', 'invalid_input', 'unavailable', 'session_expired', 'not_found']);
const CLASS_SELECT = 'id,name,join_code,school_id,teacher_id';
export const ROSTER_SELECT = 'id,nickname,stars,hero_id,completed_challenges,claimed_missions,unlocked_outfits,avatar_id';
function canonicalSession(raw) {
  if (!raw || typeof raw !== 'object') fail('forbidden');
  const role = raw.role; const userId = raw.userId ?? raw.user_id;
  if (!['teacher', 'school_admin', 'student', 'platform_admin'].includes(role) || !userId) fail('forbidden');
  const studentId = raw.studentId ?? raw.student_id ?? null; const schoolId = raw.schoolId ?? raw.school_id ?? null;
  if (role === 'student' && (!studentId || !schoolId || !raw.student)) fail('forbidden');
  if (['teacher', 'school_admin'].includes(role) && !schoolId) fail('forbidden');
  return { mode: 'supabase', userId, role, schoolId, studentId, ...(raw.student ? { student: safeStudent(raw.student), imported: !!raw.imported } : {}), canEarn: !!schoolId && ['student', 'teacher', 'school_admin'].includes(role) };
}
function canonicalResult(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail('unavailable');
  if (raw.error) fail(knownErrors.has(raw.error) ? raw.error : 'unavailable');
  if (raw.ok === false) fail('forbidden');
  if (raw.student) return { student: safeStudent(raw.student), ...(raw.canEarn !== undefined || raw.can_earn !== undefined ? { canEarn: raw.canEarn === true || raw.can_earn === true } : {}), ...(raw.imported !== undefined ? { imported: raw.imported === true } : {}) };
  return raw;
}
export class SupabaseBackend {
  constructor({ url, key, fetchImpl = globalThis.fetch }) {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error('Invalid SUPABASE_URL');
    if (!key) throw new Error('Missing SUPABASE_ANON_KEY');
    this.url = parsed.href.replace(/\/$/, ''); this.key = key; this.fetch = fetchImpl; this.mode = 'supabase';
  }
  async request(path, { method = 'GET', token, body, headers = {}, login = false } = {}) {
    let response;
    try {
      response = await this.fetch(`${this.url}${path}`, { method, headers: { apikey: this.key, Authorization: `Bearer ${token ?? this.key}`, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(10000) });
    } catch { fail('unavailable'); }
    const text = await response.text(); let data;
    try { data = text ? JSON.parse(text) : {}; } catch { fail('unavailable'); }
    if (!response.ok) {
      if (response.status === 429) fail('rate_limited');
      if (response.status === 401 || response.status === 403 && path.startsWith('/auth/')) fail(login ? 'invalid_credentials' : 'session_expired');
      if (login && path.startsWith('/auth/v1/token') && response.status === 400 && (data?.code === 'invalid_credentials' || data?.error === 'invalid_grant')) fail('invalid_credentials');
      const message = data?.message;
      if (knownErrors.has(message)) fail(message);
      if (response.status === 403) fail('forbidden');
      fail('unavailable');
    }
    return data;
  }
  async rpc(name, args, token) {
    const raw = await this.request(`/rest/v1/rpc/${name}`, { method: 'POST', token, body: args });
    if (name === 'saas_session') {
      if (raw?.error) fail(knownErrors.has(raw.error) ? raw.error : 'unavailable');
      return raw;
    }
    const result = canonicalResult(raw);
    if (name === 'platform_counts') {
      const counts = { schoolCount: result.schoolCount ?? result.school_count, classCount: result.classCount ?? result.class_count, studentCount: result.studentCount ?? result.student_count };
      if (Object.values(counts).some(value => !Number.isInteger(value) || value < 0)) fail('unavailable');
      return counts;
    }
    return result;
  }
  async session(token) {
    const user = await this.request('/auth/v1/user', { token });
    if (!user.id) fail('session_expired');
    const session = canonicalSession(await this.rpc('saas_session', {}, token));
    if (session.userId !== user.id) fail('forbidden');
    return session;
  }
  role(session, roles) { if (!roles.includes(session.role)) fail('forbidden'); }
  async loginResult(auth, expectedRole) {
    if (!auth.access_token) fail('invalid_credentials');
    const canonical = await this.session(auth.access_token);
    if (expectedRole === 'student' ? canonical.role !== 'student' : !['teacher', 'school_admin', 'platform_admin'].includes(canonical.role)) fail('forbidden');
    return { accessToken: auth.access_token, ...(auth.refresh_token ? { refreshToken: auth.refresh_token } : {}), session: { userId: canonical.userId, role: canonical.role, schoolId: canonical.schoolId, studentId: canonical.studentId } };
  }
  async classFor(session, id, token) {
    this.role(session, ['teacher', 'school_admin']); uuid(id);
    const query = new URLSearchParams({ select: CLASS_SELECT, id: `eq.${id}`, school_id: `eq.${session.schoolId}`, ...(session.role === 'teacher' ? { teacher_id: `eq.${session.userId}` } : {}) });
    const rows = await this.request(`/rest/v1/classes?${query}`, { token });
    if (!Array.isArray(rows) || rows.length !== 1) fail('forbidden');
    const row = safeClass(rows[0]);
    if (row.schoolId !== session.schoolId || (session.role === 'teacher' && row.teacherId !== session.userId)) fail('forbidden');
    return row;
  }
  async handle(method, path, body, token) {
    if (method === 'GET' && path === '/config') return { mode: 'supabase', configured: true };
    if (method === 'POST' && path === '/staff/login') {
      onlyKeys(body, ['email', 'password']);
      if (typeof body.email !== 'string' || body.email.length > 254 || typeof body.password !== 'string' || body.password.length > 256) fail('invalid_input');
      const auth = await this.request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: body.email.trim(), password: body.password }, login: true });
      return this.loginResult(auth, 'staff');
    }
    if (method === 'POST' && path === '/student/login') {
      onlyKeys(body, ['classCode', 'nickname', 'pin']);
      const args = { p_class_code: classCode(body.classCode), p_nickname: nickname(body.nickname), p_pin: pin(body.pin) };
      const auth = await this.request('/auth/v1/signup', { method: 'POST', body: {}, login: true });
      if (!auth.access_token) fail('unavailable');
      try { await this.rpc('student_login', args, auth.access_token); return await this.loginResult(auth, 'student'); }
      catch (error) {
        // Discard anonymous identities that never bound; cleanup failure never changes the original denial.
        try { await this.request('/auth/v1/logout', { method: 'POST', token: auth.access_token }); } catch {}
        throw error;
      }
    }
    const session = await this.session(token);
    if (method === 'GET' && path === '/session') return session;
    if (method === 'POST' && path === '/logout') { await this.request('/auth/v1/logout', { method: 'POST', token }); return { success: true }; }
    if (path === '/classes' && method === 'GET') {
      this.role(session, ['teacher', 'school_admin']);
      const query = new URLSearchParams({ select: CLASS_SELECT, school_id: `eq.${session.schoolId}`, ...(session.role === 'teacher' ? { teacher_id: `eq.${session.userId}` } : {}), order: 'created_at.asc' });
      const rows = await this.request(`/rest/v1/classes?${query}`, { token });
      if (!Array.isArray(rows)) fail('unavailable');
      return { classes: rows.filter(row => row.school_id === session.schoolId && (session.role === 'school_admin' || row.teacher_id === session.userId)).map(safeClass) };
    }
    if (path === '/classes' && method === 'POST') {
      this.role(session, ['teacher', 'school_admin']); onlyKeys(body, ['name']);
      const rows = await this.request(`/rest/v1/classes?select=${CLASS_SELECT}`, { method: 'POST', token, headers: { Prefer: 'return=representation' }, body: { name: displayName(body.name), school_id: session.schoolId, teacher_id: session.userId, join_code: randomBytes(6).toString('hex').toUpperCase() } });
      if (!Array.isArray(rows) || rows.length !== 1) fail('unavailable');
      return { class: safeClass(rows[0]) };
    }
    const classMatch = /^\/classes\/([^/]+)\/(roster|students)$/.exec(path);
    if (classMatch) {
      await this.classFor(session, classMatch[1], token);
      if (classMatch[2] === 'roster' && method === 'GET') {
        const query = new URLSearchParams({ select: ROSTER_SELECT, class_id: `eq.${classMatch[1]}`, school_id: `eq.${session.schoolId}`, order: 'nickname.asc' });
        const rows = await this.request(`/rest/v1/students?${query}`, { token });
        if (!Array.isArray(rows)) fail('unavailable');
        return { students: rows.map(safeStudent) };
      }
      if (classMatch[2] === 'students' && method === 'POST') { onlyKeys(body, ['nickname', 'pin']); return this.rpc('create_student', { p_class_id: classMatch[1], p_nickname: nickname(body.nickname), p_pin: pin(body.pin) }, token); }
    }
    if (path === '/student/import' && method === 'POST') {
      this.role(session, ['student']); onlyKeys(body, ['progress']);
      return this.rpc('import_student_progress', { p_progress: importProgress(body.progress) }, token);
    }
    if (path === '/student/action' && method === 'POST') { this.role(session, ['student']); return this.rpc('apply_student_action', { p_action: validateAction(body) }, token); }
    if (path === '/platform/counts' && method === 'GET') { this.role(session, ['platform_admin']); return this.rpc('platform_counts', {}, token); }
    fail('not_found');
  }
}
