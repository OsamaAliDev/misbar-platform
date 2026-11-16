import { randomUUID, randomBytes } from 'node:crypto';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fail, hashSecret, verifySecret, newToken, tokenHash, SESSION_TTL, ATTEMPT_WINDOW } from './security.mjs';
import { onlyKeys, nickname, pin, classCode, displayName, uuid, defaults, importProgress, applyAction, safeStudent, safeClass } from './progress.mjs';
export const MOCK_IDS = Object.freeze({ schoolA: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', schoolB: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', admin: '10000000-0000-4000-8000-000000000001', teacher: '10000000-0000-4000-8000-000000000002', schooladmin: '10000000-0000-4000-8000-000000000003', other: '10000000-0000-4000-8000-000000000004' });
const seeds = [ ['admin', 'admin@misbar.test', 'MockAdmin!2026', 'platform_admin', null], ['teacher', 'teacher@misbar.test', 'MockTeacher!2026', 'teacher', MOCK_IDS.schoolA], ['schooladmin', 'schooladmin@misbar.test', 'MockSchool!2026', 'school_admin', MOCK_IDS.schoolA], ['other', 'other@misbar.test', 'MockOther!2026', 'teacher', MOCK_IDS.schoolB] ];
export class MockBackend {
  static async create(options = {}) { const backend = new MockBackend(options); await backend.load(); return backend; }
  constructor({ file = new URL('../.data/saas.json', import.meta.url), now = Date.now, sessionTtl = SESSION_TTL } = {}) { Object.assign(this, { file, now, sessionTtl }); this.mode = 'mock'; this.sessions = new Map(); this.queue = Promise.resolve(); }
  async load() {
    try { this.data = JSON.parse(await readFile(this.file, 'utf8')); if (this.data.version !== 1) throw new Error('Unsupported mock data version'); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      this.data = { version: 1, schools: [{ id: MOCK_IDS.schoolA, name: 'Synthetic Mock School A' }, { id: MOCK_IDS.schoolB, name: 'Synthetic Mock School B' }], users: [], classes: [], students: [], attempts: {} };
      for (const [key, email, password, role, schoolId] of seeds) this.data.users.push({ id: MOCK_IDS[key], email, passwordHash: await hashSecret(password), role, schoolId });
      await this.save();
    }
    this.dummyHash = await hashSecret('not-a-real-credential');
  }
  async save() {
    const file = this.file instanceof URL ? this.file : String(this.file);
    await mkdir(this.file instanceof URL ? new URL('.', this.file) : dirname(file), { recursive: true, mode: 0o700 });
    const temp = this.file instanceof URL ? new URL(`${this.file.pathname}.tmp`, this.file) : `${file}.tmp`;
    await writeFile(temp, JSON.stringify(this.data, null, 2) + '\n', { mode: 0o600 }); await rename(temp, file);
  }
  atomic(fn) { const result = this.queue.then(fn); this.queue = result.catch(() => {}); return result; }
  async handle(method, path, body, token) { return this.atomic(() => this.route(method, path, body, token)); }
  session(token) {
    const hash = tokenHash(token ?? ''); const entry = this.sessions.get(hash);
    if (!entry || entry.expires <= this.now()) { this.sessions.delete(hash); fail('session_expired'); }
    const user = entry.studentId ? this.data.students.find(s => s.id === entry.studentId) : this.data.users.find(u => u.id === entry.userId);
    if (!user) fail('session_expired');
    return entry.studentId ? { userId: entry.userId, role: 'student', schoolId: user.schoolId, studentId: user.id } : { userId: user.id, role: user.role, schoolId: user.schoolId, studentId: null };
  }
  issue(session) {
    for (const [key, entry] of this.sessions) if (entry.expires <= this.now() || (session.studentId && entry.studentId === session.studentId)) this.sessions.delete(key);
    const accessToken = newToken(); this.sessions.set(tokenHash(accessToken), { ...session, expires: this.now() + this.sessionTtl }); return { accessToken, session };
  }
  role(session, roles) { if (!roles.includes(session.role)) fail('forbidden'); }
  classFor(session, id) {
    this.role(session, ['teacher', 'school_admin']); const row = this.data.classes.find(c => c.id === id);
    if (!row || row.schoolId !== session.schoolId || (session.role === 'teacher' && row.teacherId !== session.userId)) fail('forbidden'); return row;
  }
  canonical(session) {
    const student = session.studentId ? this.data.students.find(s => s.id === session.studentId) : null;
    return { mode: 'mock', ...session, ...(student ? { student: safeStudent(student), imported: !!student.imported } : {}), canEarn: !!session.schoolId && ['student', 'teacher', 'school_admin'].includes(session.role) };
  }
  checkAttempts(key) {
    for (const [id, attempt] of Object.entries(this.data.attempts)) if (attempt.until <= this.now()) delete this.data.attempts[id];
    if (this.data.attempts[key]?.count >= 5) fail('rate_limited');
  }
  async badAttempt(key) {
    const attempt = this.data.attempts[key] ?? { count: 0, until: this.now() + ATTEMPT_WINDOW }; attempt.count++;
    this.data.attempts[key] = attempt; await this.save(); fail(attempt.count >= 5 ? 'rate_limited' : 'invalid_credentials');
  }
  async staffLogin(body) {
    onlyKeys(body, ['email', 'password']); if (typeof body.email !== 'string' || body.email.length > 254 || typeof body.password !== 'string' || body.password.length > 256) fail('invalid_input');
    const email = body.email.trim().toLowerCase(); const key = tokenHash(`staff:${email}`); this.checkAttempts(key);
    const user = this.data.users.find(u => u.email === email); const ok = await verifySecret(body.password, user?.passwordHash ?? this.dummyHash);
    if (!ok || !user) return this.badAttempt(key); delete this.data.attempts[key]; await this.save();
    return this.issue({ userId: user.id, role: user.role, schoolId: user.schoolId, studentId: null });
  }
  async studentLogin(body) {
    onlyKeys(body, ['classCode', 'nickname', 'pin']); const code = classCode(body.classCode); const name = nickname(body.nickname); const secret = pin(body.pin);
    const key = tokenHash(`student:${code}:${name.toLocaleLowerCase('en-US')}`); this.checkAttempts(key);
    const classroom = this.data.classes.find(c => c.joinCode === code); const student = classroom && this.data.students.find(s => s.classId === classroom.id && s.nickname.toLocaleLowerCase('en-US') === name.toLocaleLowerCase('en-US'));
    const ok = await verifySecret(secret, student?.pin_hash ?? this.dummyHash); if (!ok || !student) return this.badAttempt(key);
    delete this.data.attempts[key]; await this.save(); return this.issue({ userId: student.authUserId, role: 'student', schoolId: student.schoolId, studentId: student.id });
  }
  async route(method, path, body, token) {
    if (method === 'GET' && path === '/config') return { mode: 'mock', configured: false };
    if (method === 'POST' && path === '/staff/login') return this.staffLogin(body);
    if (method === 'POST' && path === '/student/login') return this.studentLogin(body);
    const session = this.session(token);
    if (method === 'GET' && path === '/session') return this.canonical(session);
    if (method === 'POST' && path === '/logout') { this.sessions.delete(tokenHash(token)); return { success: true }; }
    if (path === '/classes' && method === 'GET') { this.role(session, ['teacher', 'school_admin']); return { classes: this.data.classes.filter(c => c.schoolId === session.schoolId && (session.role === 'school_admin' || c.teacherId === session.userId)).map(safeClass) }; }
    if (path === '/classes' && method === 'POST') {
      this.role(session, ['teacher', 'school_admin']); onlyKeys(body, ['name']); if (!session.schoolId) fail('forbidden');
      let joinCode; do { joinCode = randomBytes(6).toString('hex').toUpperCase(); } while (this.data.classes.some(c => c.joinCode === joinCode));
      const row = { id: randomUUID(), name: displayName(body.name), joinCode, schoolId: session.schoolId, teacherId: session.userId }; this.data.classes.push(row); await this.save(); return { class: safeClass(row) };
    }
    const match = /^\/classes\/([^/]+)\/(roster|students)$/.exec(path);
    if (match) {
      const classroom = this.classFor(session, uuid(match[1]));
      if (match[2] === 'roster' && method === 'GET') return { students: this.data.students.filter(s => s.classId === classroom.id).map(safeStudent) };
      if (match[2] === 'students' && method === 'POST') {
        onlyKeys(body, ['nickname', 'pin']); const name = nickname(body.nickname); const secret = pin(body.pin);
        if (this.data.students.some(s => s.classId === classroom.id && s.nickname.toLocaleLowerCase('en-US') === name.toLocaleLowerCase('en-US'))) fail('duplicate_nickname');
        const row = { id: randomUUID(), authUserId: randomUUID(), classId: classroom.id, schoolId: classroom.schoolId, nickname: name, pin_hash: await hashSecret(secret), imported: false, ...defaults() };
        this.data.students.push(row); await this.save(); return { student: safeStudent(row) };
      }
    }
    if (method === 'POST' && ['/student/import', '/student/action'].includes(path)) {
      this.role(session, ['student']); const row = this.data.students.find(s => s.id === session.studentId);
      if (path === '/student/import') {
        onlyKeys(body, ['progress']);
        if (!row.imported) {
          const progress = importProgress(body.progress); progress.stars = Math.max(row.stars, progress.stars);
          for (const key of ['completedChallenges', 'claimedMissions', 'unlockedOutfits']) progress[key] = [...new Set([...row[key], ...progress[key]])];
          progress.heroId ??= row.heroId; Object.assign(row, progress, { imported: true }); await this.save();
        }
        return { student: safeStudent(row), canEarn: true, imported: true };
      }
      Object.assign(row, applyAction(safeStudent(row), body)); await this.save(); return { student: safeStudent(row), canEarn: true };
    }
    if (method === 'GET' && path === '/platform/counts') { this.role(session, ['platform_admin']); return { schoolCount: this.data.schools.length, classCount: this.data.classes.length, studentCount: this.data.students.length }; }
    fail('not_found');
  }
}
