import test from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseBackend, ROSTER_SELECT } from './supabase.mjs';
import { createSaasServer } from './index.mjs';
import { MOCK_IDS } from './mock.mjs';
const token = 'opaque-test-access-token-123456789';
const key = 'test-anon-key';
const classId = '20000000-0000-4000-8000-000000000001';
const studentId = '30000000-0000-4000-8000-000000000001';
const userId = MOCK_IDS.teacher;
const nativeStudent = { id: studentId, nickname: 'Explorer', stars: 12, hero_id: null, avatar_id: 'rocket', completed_challenges: [], claimed_missions: [], unlocked_outfits: [], pin_hash: 'MUST_NOT_LEAK', email: 'MUST_NOT_LEAK' };
const nativeClass = { id: classId, name: 'Synthetic Class', school_id: MOCK_IDS.schoolA, teacher_id: userId, join_code: 'ABCDEF123456' };
function session(role = 'teacher') {
  return { userId, role, schoolId: role === 'platform_admin' ? null : MOCK_IDS.schoolA, studentId: role === 'student' ? studentId : null, ...(role === 'student' ? { student: nativeStudent, imported: false } : {}), subscription: role === 'platform_admin' ? null : { status: 'active', plan: 'manual', student_limit: 20, valid_until: '2099-01-01T00:00:00Z' }, canEarn: role !== 'platform_admin' };
}
function harness({ role = 'teacher', handler, sessionOverride } = {}) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    const parsed = new URL(url); const body = options.body ? JSON.parse(options.body) : undefined;
    const call = { path: parsed.pathname + parsed.search, pathname: parsed.pathname, params: parsed.searchParams, ...options, body }; calls.push(call);
    assert.equal(options.headers.apikey, key); assert.equal(options.headers.Authorization, `Bearer ${call.pathname === '/auth/v1/token' || call.pathname === '/auth/v1/signup' ? key : token}`);
    let result;
    if (call.pathname === '/auth/v1/user') result = { id: userId, email: 'private@example.com' };
    else if (call.pathname === '/rest/v1/rpc/saas_session') result = sessionOverride ?? session(role);
    else if (call.pathname === '/auth/v1/token' || call.pathname === '/auth/v1/signup') result = { access_token: token, refresh_token: 'refresh-only-server-response' };
    else if (call.pathname === '/auth/v1/logout') return new Response(null, { status: 204 });
    else result = handler ? await handler(call) : {};
    return result instanceof Response ? result : Response.json(result);
  };
  return { calls, backend: new SupabaseBackend({ url: 'https://test.supabase.invalid', key, fetchImpl }) };
}
function verifyProtected(calls) { assert.equal(calls[0].pathname, '/auth/v1/user'); assert.equal(calls[1].pathname, '/rest/v1/rpc/saas_session'); assert.deepEqual(calls[1].body, {}); }

test('staff uses password grant, then GoTrue user and canonical session; no staff self-role', async () => {
  const h = harness(); const result = await h.backend.handle('POST', '/staff/login', { email: 'teacher@example.com', password: 'secret' });
  assert.equal(h.calls[0].path, '/auth/v1/token?grant_type=password'); assert.deepEqual(h.calls[0].body, { email: 'teacher@example.com', password: 'secret' });
  verifyProtected(h.calls.slice(1)); assert.equal(result.accessToken, token); assert.deepEqual(result.session, { userId, role: 'teacher', schoolId: MOCK_IDS.schoolA, studentId: null });
  await assert.rejects(h.backend.handle('POST', '/staff/login', { email: 'a', password: 'b', role: 'platform_admin' }), error => error.code === 'invalid_input');
});

test('anonymous signup is exactly {}, followed by database PIN RPC and validated canonical student session', async () => {
  const h = harness({ role: 'student', handler: call => { assert.equal(call.pathname, '/rest/v1/rpc/student_login'); assert.deepEqual(call.body, { p_class_code: 'ABCDEF123456', p_nickname: 'Explorer', p_pin: '4827' }); return { ok: true, studentId, schoolId: MOCK_IDS.schoolA }; } });
  const result = await h.backend.handle('POST', '/student/login', { classCode: 'abcdef123456', nickname: 'Explorer', pin: '4827' });
  assert.equal(h.calls[0].pathname, '/auth/v1/signup'); assert.deepEqual(h.calls[0].body, {}); assert.equal(h.calls[1].pathname, '/rest/v1/rpc/student_login'); verifyProtected(h.calls.slice(2));
  assert.equal(result.session.role, 'student'); assert.equal(result.session.studentId, studentId);
  const canonical = await h.backend.handle('GET', '/session', {}, token); assert.equal(canonical.student.avatarId, 'rocket'); assert.equal(canonical.canEarn, true); assert.equal(canonical.imported, false); assert.doesNotMatch(JSON.stringify(canonical), /MUST_NOT_LEAK|private@example|pin_hash/);
});

test('failed database PIN RPC maps account rate-limit and cleans up the unbound Auth session', async () => {
  const h = harness({ role: 'student', handler: () => ({ ok: false, error: 'rate_limited' }) });
  await assert.rejects(h.backend.handle('POST', '/student/login', { classCode: 'ABCDEF123456', nickname: 'Explorer', pin: '0000' }), error => error.code === 'rate_limited' && error.status === 429);
  assert.deepEqual(h.calls.map(c => c.pathname), ['/auth/v1/signup', '/rest/v1/rpc/student_login', '/auth/v1/logout']);
});

test('class creation uses GoTrue-verified school/caller IDs and only explicit safe columns', async () => {
  const h = harness({ handler: call => {
    assert.equal(call.pathname, '/rest/v1/classes'); assert.equal(call.method, 'POST'); assert.equal(call.headers.Prefer, 'return=representation');
    assert.deepEqual(Object.keys(call.body).sort(), ['join_code', 'name', 'school_id', 'teacher_id']); assert.equal(call.body.school_id, MOCK_IDS.schoolA); assert.equal(call.body.teacher_id, userId); assert.match(call.body.join_code, /^[A-F0-9]{12}$/);
    assert.equal(call.params.get('select'), 'id,name,join_code,school_id,teacher_id'); return [{ ...nativeClass, join_code: call.body.join_code }];
  } });
  const result = await h.backend.handle('POST', '/classes', { name: 'Synthetic Class' }, token); verifyProtected(h.calls); assert.equal(result.class.schoolId, MOCK_IDS.schoolA); assert.ok(result.class.joinCode);
});

test('class listing and roster are tenant/owner constrained with explicit PIN-free snake-to-camel projection', async () => {
  const h = harness({ handler: call => {
    if (call.pathname === '/rest/v1/classes') { assert.equal(call.params.get('school_id'), `eq.${MOCK_IDS.schoolA}`); assert.equal(call.params.get('teacher_id'), `eq.${userId}`); return [nativeClass]; }
    assert.equal(call.pathname, '/rest/v1/students'); assert.equal(call.params.get('select'), ROSTER_SELECT); assert.doesNotMatch(ROSTER_SELECT, /pin_hash|\*/); assert.equal(call.params.get('class_id'), `eq.${classId}`); assert.equal(call.params.get('school_id'), `eq.${MOCK_IDS.schoolA}`); return [nativeStudent];
  } });
  const classes = await h.backend.handle('GET', '/classes', {}, token); assert.equal(classes.classes[0].joinCode, nativeClass.join_code);
  h.calls.length = 0; const roster = await h.backend.handle('GET', `/classes/${classId}/roster`, {}, token); verifyProtected(h.calls); assert.equal(roster.students[0].avatarId, 'rocket'); assert.doesNotMatch(JSON.stringify(roster), /MUST_NOT_LEAK|pin_hash|email/);
});

test('cross-row staff requests, students reading rosters and platform reading students are forbidden before child transport', async () => {
  for (const role of ['student', 'platform_admin']) {
    const h = harness({ role }); await assert.rejects(h.backend.handle('GET', `/classes/${classId}/roster`, {}, token), error => error.code === 'forbidden'); assert.equal(h.calls.length, 2);
  }
  const h = harness({ handler: () => [] }); await assert.rejects(h.backend.handle('GET', `/classes/${classId}/roster`, {}, token), error => error.code === 'forbidden'); assert.equal(h.calls.length, 3);
  const mismatch = harness({ sessionOverride: { ...session(), userId: MOCK_IDS.other } }); await assert.rejects(mismatch.backend.handle('GET', '/session', {}, token), error => error.code === 'forbidden');
});

test('enrollment sends only exact create_student args and maps DB duplicate errors', async () => {
  for (const error of [null, 'duplicate_nickname']) {
    const h = harness({ handler: call => {
      if (call.pathname === '/rest/v1/classes') return [nativeClass];
      assert.equal(call.pathname, '/rest/v1/rpc/create_student'); assert.deepEqual(call.body, { p_class_id: classId, p_nickname: 'Explorer', p_pin: '4827' }); return error ? { error } : { student: nativeStudent };
    } });
    const action = h.backend.handle('POST', `/classes/${classId}/students`, { nickname: 'Explorer', pin: '4827' }, token);
    if (error) await assert.rejects(action, e => e.code === error); else assert.doesNotMatch(JSON.stringify(await action), /MUST_NOT_LEAK/);
    verifyProtected(h.calls);
  }
});

test('import/action use exact RPC names and canonical outputs, while arbitrary stars never reach DB', async () => {
  const h = harness({ role: 'student', handler: call => {
    if (call.pathname === '/rest/v1/rpc/import_student_progress') { assert.equal(call.body.p_progress.stars, 28); assert.equal(call.body.p_progress.nickname, undefined); return { student: nativeStudent, canEarn: true, imported: true }; }
    assert.equal(call.pathname, '/rest/v1/rpc/apply_student_action'); assert.deepEqual(call.body, { p_action: { type: 'chooseHero', heroId: 'lubna' } }); return { student: { ...nativeStudent, hero_id: 'lubna' }, canEarn: true };
  } });
  const imported = await h.backend.handle('POST', '/student/import', { progress: { stars: 900 } }, token); assert.equal(imported.imported, true);
  const action = await h.backend.handle('POST', '/student/action', { type: 'chooseHero', heroId: 'lubna' }, token); assert.equal(action.student.heroId, 'lubna');
  const before = h.calls.length; await assert.rejects(h.backend.handle('POST', '/student/action', { type: 'addStars', amount: 900 }, token), error => error.code === 'invalid_input'); assert.equal(h.calls.length, before + 2);
});

test('expired GoTrue authorization returns session_expired and actual upstream failures never fall back to mock', async t => {
  const backend = new SupabaseBackend({ url: 'https://test.supabase.invalid', key, fetchImpl: async () => Response.json({ msg: 'private error' }, { status: 401 }) });
  await assert.rejects(backend.handle('GET', '/session', {}, token), error => error.code === 'session_expired');
  const server = await createSaasServer({ env: { SUPABASE_URL: 'https://test.supabase.invalid', SUPABASE_ANON_KEY: key }, fetchImpl: async () => { throw new Error('private upstream failure'); }, logger: () => {} });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const origin = `http://127.0.0.1:${server.address().port}/api/saas`;
  const config = await fetch(origin + '/config'); assert.deepEqual(await config.json(), { mode: 'supabase', configured: true });
  const res = await fetch(origin + '/staff/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'teacher@example.com', password: 'secret' }) }); assert.equal(res.status, 503); assert.deepEqual(await res.json(), { error: 'unavailable' }); assert.equal(server.backend.mode, 'supabase');
});

test('logout validates the existing GoTrue user then revokes with the same bearer and no cookies', async () => {
  const h = harness(); assert.deepEqual(await h.backend.handle('POST', '/logout', {}, token), { success: true }); verifyProtected(h.calls); assert.equal(h.calls[2].pathname, '/auth/v1/logout'); assert.equal(h.calls[2].body, undefined);
});

test('platform counts uses only platform_counts RPC and strips every non-count field', async () => {
  const h = harness({ role: 'platform_admin', handler: call => { assert.equal(call.pathname, '/rest/v1/rpc/platform_counts'); assert.deepEqual(call.body, {}); return { schoolCount: 2, classCount: 4, studentCount: 6, nicknames: ['MUST_NOT_LEAK'], schoolIds: ['MUST_NOT_LEAK'] }; } });
  assert.deepEqual(await h.backend.handle('GET', '/platform/counts', {}, token), { schoolCount: 2, classCount: 4, studentCount: 6 }); verifyProtected(h.calls); assert.equal(h.calls.length, 3);
  for (const role of ['teacher', 'school_admin', 'student']) { const other = harness({ role }); await assert.rejects(other.backend.handle('GET', '/platform/counts', {}, token), error => error.code === 'forbidden'); assert.equal(other.calls.length, 2); }
});

test('subscription metadata and RPC canEarn false cannot create a billing gate in revised scope', async () => {
  const h = harness({ role: 'student', sessionOverride: { ...session('student'), canEarn: false, subscription: { status: 'inactive', student_limit: 0, valid_until: '2000-01-01T00:00:00Z' } }, handler: call => { assert.equal(call.pathname, '/rest/v1/rpc/apply_student_action'); return { student: nativeStudent, canEarn: true }; } });
  const current = await h.backend.handle('GET', '/session', {}, token); assert.equal(current.canEarn, true); assert.equal(current.subscription, undefined);
  assert.equal((await h.backend.handle('POST', '/student/action', { type: 'chooseHero', heroId: 'lubna' }, token)).canEarn, true);
});

test('GoTrue 400 invalid-grant is invalid_credentials, not an upstream outage', async () => {
  const backend = new SupabaseBackend({ url: 'https://test.supabase.invalid', key, fetchImpl: async () => Response.json({ error: 'invalid_grant', code: 'invalid_credentials' }, { status: 400 }) });
  await assert.rejects(backend.handle('POST', '/staff/login', { email: 'teacher@example.com', password: 'wrong' }), error => error.code === 'invalid_credentials' && error.status === 401);
});
