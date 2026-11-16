import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { createSaasServer, backendConfiguration } from './index.mjs';
import { MockBackend, MOCK_IDS } from './mock.mjs';
import { PeerLimiter, BODY_LIMIT, tokenHash, hashSecret, verifySecret } from './security.mjs';
import { EXPERIMENTS } from '../src/data/experiments.js';
import { HERO_IDS } from './progress.mjs';

async function fixture(t, options = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'misbar-saas-')); const file = join(dir, 'saas.json'); const logs = [];
  let clock = Date.now();
  const backend = await MockBackend.create({ file, now: () => clock, ...options });
  const server = await createSaasServer({ backend, env: {}, logger: row => logs.push(row), ...options });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const call = async (method, path, body, token, headers = {}) => {
    const response = await fetch(origin + '/api/saas' + path, { method, headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, data: await response.json(), headers: response.headers };
  };
  const login = async (name = 'teacher') => {
    const passwords = { teacher: 'MockTeacher!2026', admin: 'MockAdmin!2026', schooladmin: 'MockSchool!2026', other: 'MockOther!2026' };
    const res = await call('POST', '/staff/login', { email: `${name}@misbar.test`, password: passwords[name] }); assert.equal(res.status, 200); return res.data.accessToken;
  };
  const classroom = async (token, name = 'Synthetic Class') => { const res = await call('POST', '/classes', { name }, token); assert.equal(res.status, 200); return res.data.class; };
  const enroll = async (token, cls, name = 'Explorer', pin = '4827') => { const res = await call('POST', `/classes/${cls.id}/students`, { nickname: name, pin }, token); assert.equal(res.status, 200); return res.data.student; };
  const studentLogin = async (cls, name = 'Explorer', pin = '4827') => { const res = await call('POST', '/student/login', { classCode: cls.joinCode, nickname: name, pin }); assert.equal(res.status, 200); return res.data.accessToken; };
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(dir, { recursive: true, force: true }); });
  return { dir, file, backend, server, origin, logs, call, login, classroom, enroll, studentLogin, advance: ms => { clock += ms; } };
}

test('configuration fails closed, including blanks; production mock requires explicit opt-in', () => {
  assert.deepEqual(backendConfiguration({}), { mode: 'mock' });
  for (const env of [{ SUPABASE_URL: 'http://localhost' }, { SUPABASE_ANON_KEY: 'key' }, { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, { ANON_KEY: '' }]) assert.throws(() => backendConfiguration(env), /Partial/);
  assert.throws(() => backendConfiguration({ NODE_ENV: 'production' }), /refused/);
  assert.equal(backendConfiguration({ NODE_ENV: 'production', ALLOW_MOCK: 'true' }).mode, 'mock');
  assert.equal(backendConfiguration({ SUPABASE_URL: 'http://localhost', ANON_KEY: 'key', NODE_ENV: 'production' }).mode, 'supabase');
});

test('async salted scrypt is verified in constant-time with non-plaintext storage', async () => {
  const a = await hashSecret('4827'); const b = await hashSecret('4827'); assert.notEqual(a, b);
  assert.equal(await verifySecret('4827', a), true); assert.equal(await verifySecret('9999', a), false); assert.equal(await verifySecret('4827', 'broken'), false);
});

test('staff roles, tenant isolation, ownership and platform aggregation enforce 403', async t => {
  const f = await fixture(t); const teacher = await f.login(); const other = await f.login('other'); const admin = await f.login('admin'); const schoolAdmin = await f.login('schooladmin');
  const a = await f.classroom(teacher); const b = await f.classroom(other); const sa = await f.classroom(schoolAdmin);
  await f.enroll(teacher, a); await f.enroll(other, b, 'OtherExplorer');
  assert.equal((await f.call('GET', `/classes/${b.id}/roster`, undefined, teacher)).status, 403);
  assert.equal((await f.call('GET', `/classes/${a.id}/roster`, undefined, other)).status, 403);
  assert.equal((await f.call('GET', `/classes/${sa.id}/roster`, undefined, teacher)).status, 403);
  assert.equal((await f.call('POST', `/classes/${b.id}/students`, { nickname: 'Intruder', pin: '4926' }, schoolAdmin)).status, 403);
  assert.equal((await f.call('GET', `/classes/${a.id}/roster`, undefined, admin)).status, 403);
  assert.equal((await f.call('GET', '/classes', undefined, admin)).status, 403);
  assert.equal((await f.call('GET', '/platform/counts', undefined, teacher)).status, 403);
  assert.equal((await f.call('GET', '/classes', undefined, teacher)).data.classes.length, 1);
  assert.equal((await f.call('GET', '/classes', undefined, schoolAdmin)).data.classes.length, 2);
  const schools = await f.call('GET', '/platform/counts', undefined, admin); assert.equal(schools.status, 200); assert.equal(schools.data.studentCount, 2);
  assert.doesNotMatch(JSON.stringify(schools.data), /Explorer|nickname|pin|completedChallenges/);
  const student = await f.studentLogin(a);
  for (const path of ['/classes', `/classes/${a.id}/roster`, `/classes/${b.id}/roster`, '/platform/counts']) assert.equal((await f.call('GET', path, undefined, student)).status, 403);
  assert.equal((await f.call('POST', '/student/action', { type: 'completeChallenge', experimentId: EXPERIMENTS[0].id, studentId: f.backend.data.students[1].id }, student)).status, 400);
  const session = await f.call('GET', '/session', undefined, student); assert.equal(session.data.student.nickname, 'Explorer'); assert.equal(session.data.studentId, f.backend.data.students[0].id);
});

test('PIN attempts are account-keyed, the fifth failure is 429 and attempts persist across restart', async t => {
  const f = await fixture(t); const teacher = await f.login(); const cls = await f.classroom(teacher); await f.enroll(teacher, cls);
  for (let i = 1; i <= 5; i++) {
    const res = await f.call('POST', '/student/login', { classCode: cls.joinCode.toLowerCase(), nickname: 'EXPLORER', pin: '0000' }, undefined, { 'X-Forwarded-For': `192.0.2.${i}` }); assert.equal(res.status, i === 5 ? 429 : 401);
  }
  assert.equal((await f.call('POST', '/student/login', { classCode: cls.joinCode, nickname: 'Explorer', pin: '4827' })).status, 429);
  const reloaded = await MockBackend.create({ file: f.file });
  await assert.rejects(reloaded.handle('POST', '/student/login', { classCode: cls.joinCode, nickname: 'Explorer', pin: '4827' }), error => error.code === 'rate_limited');
  f.advance(15 * 60000 + 1); await f.studentLogin(cls);
});

test('peer IP rate limiter deliberately ignores spoofed forwarded-for headers', async t => {
  const f = await fixture(t, { limiter: new PeerLimiter({ limit: 2 }) });
  for (let i = 0; i < 3; i++) {
    const res = await f.call('POST', '/staff/login', { email: 'nobody@misbar.test', password: 'bad' }, undefined, { 'X-Forwarded-For': `192.0.2.${i}` }); assert.equal(res.status, i === 2 ? 429 : 401);
  }
});

test('child fields/PIN never leak, nickname validation and duplicate enrollment are enforced', async t => {
  const f = await fixture(t); const teacher = await f.login(); const admin = await f.login('admin'); const cls = await f.classroom(teacher);
  for (const nickname of ['x', 'person@example.com', '1234567890', '<script>', 'a'.repeat(25), 'Name\nHidden']) assert.equal((await f.call('POST', `/classes/${cls.id}/students`, { nickname, pin: '4827' }, teacher)).status, 400);
  assert.equal((await f.call('POST', `/classes/${cls.id}/students`, { nickname: 'Explorer', pin: '4827', email: 'child@example.com' }, teacher)).status, 400);
  assert.equal((await f.call('POST', `/classes/${cls.id}/students`, { nickname: 'Explorer', pin: 4827 }, teacher)).status, 400);
  const results = await Promise.all(['Explorer', 'Scientist'].map(nickname => f.call('POST', `/classes/${cls.id}/students`, { nickname, pin: '4827' }, teacher)));
  assert.deepEqual(results.map(r => r.status), [200, 200]);
  const nick = results.find(r => r.status === 200).data.student.nickname;
  assert.equal((await f.call('POST', `/classes/${cls.id}/students`, { nickname: nick.toUpperCase(), pin: '5938' }, teacher)).data.error, 'duplicate_nickname');
  const token = await f.studentLogin(cls, nick); const session = await f.call('GET', '/session', undefined, token); const roster = await f.call('GET', `/classes/${cls.id}/roster`, undefined, teacher);
  assert.doesNotMatch(JSON.stringify([results, session.data, roster.data]), /pin_hash|passwordHash|authUserId|"pin"|4827/);
  const persisted = await readFile(f.file, 'utf8'); assert.match(persisted, /scrypt:/); assert.doesNotMatch(persisted, /"4827"|MockTeacher!2026|MockAdmin!2026|"pin"|"accessToken"/);
  assert.equal(f.backend.sessions.has(tokenHash(token)), true); assert.equal(f.backend.sessions.has(token), false);
});

test('once-only import preserves bounded validated guest progress, without renaming a child', async t => {
  const f = await fixture(t); const teacher = await f.login(); const cls = await f.classroom(teacher); await f.enroll(teacher, cls); const student = await f.studentLogin(cls);
  const first = await f.call('POST', '/student/import', { progress: { nickname: 'GuestNickname', stars: 900, heroId: 'lubna', completedChallenges: [EXPERIMENTS[0].id, 'unknown'], claimedMissions: ['first-discovery', 'science-tour', 'bad'], unlockedOutfits: ['lubna:4', 'bad:2'], avatarId: 'planet' } }, student);
  assert.equal(first.status, 200); assert.equal(first.data.imported, true); assert.equal(first.data.student.stars, 28); assert.equal(first.data.student.nickname, 'Explorer');
  assert.deepEqual(first.data.student.completedChallenges, [EXPERIMENTS[0].id]); assert.deepEqual(first.data.student.claimedMissions, ['first-discovery']); assert.deepEqual(first.data.student.unlockedOutfits, ['lubna:4']);
  const again = await f.call('POST', '/student/import', { progress: { stars: 0 } }, student); assert.deepEqual(again.data.student, first.data.student);
  const canonical = await f.call('GET', '/session', undefined, student); assert.equal(canonical.data.imported, true);
});

test('original six-challenge, three-mission, outfit thresholds and idempotency are authoritative', async t => {
  const f = await fixture(t); const teacher = await f.login(); const cls = await f.classroom(teacher); await f.enroll(teacher, cls); const token = await f.studentLogin(cls);
  const action = async body => { const res = await f.call('POST', '/student/action', body, token); assert.equal(res.status, 200); return res.data.student; };
  assert.equal((await action({ type: 'claimMission', missionId: 'first-discovery' })).stars, 12);
  assert.deepEqual((await action({ type: 'unlockOutfit', heroId: 'lubna', slot: 2 })).unlockedOutfits, []);
  let student = await action({ type: 'completeChallenge', experimentId: EXPERIMENTS[0].id }); assert.equal(student.stars, 13);
  assert.equal((await action({ type: 'completeChallenge', experimentId: EXPERIMENTS[0].id })).stars, 13);
  assert.equal((await action({ type: 'claimMission', missionId: 'first-discovery' })).stars, 15);
  assert.equal((await action({ type: 'claimMission', missionId: 'first-discovery' })).stars, 15);
  await action({ type: 'completeChallenge', experimentId: EXPERIMENTS[1].id });
  assert.deepEqual((await action({ type: 'unlockOutfit', heroId: 'lubna', slot: 2 })).unlockedOutfits, ['lubna:2']);
  await action({ type: 'claimMission', missionId: 'two-experiments' });
  for (const experiment of EXPERIMENTS.slice(2)) await action({ type: 'completeChallenge', experimentId: experiment.id });
  student = await action({ type: 'claimMission', missionId: 'science-tour' }); assert.equal(student.stars, 28);
  student = await action({ type: 'unlockOutfit', heroId: 'lubna', slot: 4 }); assert.equal(student.stars, 28); assert.ok(student.unlockedOutfits.includes('lubna:4'));
  assert.equal((await action({ type: 'chooseHero', heroId: 'sharara' })).heroId, 'sharara'); assert.equal((await action({ type: 'setAvatar', avatarId: 'atom' })).avatarId, 'atom');
  for (const body of [{ type: 'addStars', amount: 1000 }, { type: 'setNickname', nickname: 'Changed' }, { type: 'chooseHero', heroId: 'unknown' }, { type: 'completeChallenge', experimentId: 'unknown' }, { type: 'setAvatar', avatarId: 'phone', stars: 1000 }]) assert.equal((await f.call('POST', '/student/action', body, token)).status, 400);
  const heroSource = await readFile(new URL('../src/data/heroes.js', import.meta.url), 'utf8'); for (const id of HERO_IDS) assert.match(heroSource, new RegExp(`id: '${id}'`));
});

test('opaque session expiration, logout, student rebinding and restart all clear authorization', async t => {
  const f = await fixture(t); const staff = await f.login();
  assert.equal((await f.call('POST', '/logout', undefined, staff)).status, 200); assert.equal((await f.call('GET', '/session', undefined, staff)).data.error, 'session_expired');
  const teacher = await f.login(); const cls = await f.classroom(teacher); await f.enroll(teacher, cls); const first = await f.studentLogin(cls); const second = await f.studentLogin(cls); assert.notEqual(first, second);
  assert.equal((await f.call('GET', '/session', undefined, first)).status, 401);
  const restart = await MockBackend.create({ file: f.file }); await assert.rejects(restart.handle('GET', '/session', {}, second), error => error.code === 'session_expired');
  f.advance(12 * 3600000 + 1); const expired = await f.call('GET', '/session', undefined, second); assert.equal(expired.status, 401); assert.equal(expired.data.error, 'session_expired');
  assert.equal((await f.call('GET', '/session')).status, 401); assert.equal((await f.call('GET', '/session', undefined, 'not-a-token')).status, 401);
});

test('HTTP body limits, same origin, unknown routes, safe static fallback and redacted logging', async t => {
  const f = await fixture(t, { serveDist: true });
  const config = await f.call('GET', '/config'); assert.deepEqual(config.data, { mode: 'mock', configured: false }); assert.equal(config.headers.get('set-cookie'), null); assert.equal(config.headers.get('access-control-allow-origin'), null);
  assert.equal((await f.call('POST', '/staff/login', { email: 'a'.repeat(BODY_LIMIT), password: 'secret' })).status, 413);
  assert.equal((await f.call('POST', '/staff/login', { email: 'bad', password: 'secret' }, undefined, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await f.call('GET', '/unknown')).status, 404);
  const missingApi = await fetch(f.origin + '/api/nope', { headers: { Accept: 'text/html' } }); assert.equal(missingApi.status, 404); assert.match(missingApi.headers.get('content-type'), /json/);
  const missingAsset = await fetch(f.origin + '/assets/missing.js', { headers: { Accept: 'text/html' } }); assert.equal(missingAsset.status, 404);
  const teacher = await f.login(); const cls = await f.classroom(teacher); await f.call('GET', `/classes/${cls.id}/roster?secret=PII`, undefined, teacher);
  const logged = JSON.stringify(f.logs); assert.doesNotMatch(logged, /MockTeacher|password|Bearer|PII|teacher@|127\.0\.0\.1|Synthetic Class/); assert.doesNotMatch(logged, new RegExp(cls.id));
});

test('chunked bodies above 32 KiB receive JSON 413 and malformed JSON receives 400', async t => {
  const f = await fixture(t);
  const streamed = await new Promise((resolve, reject) => {
    const request = http.request(f.origin + '/api/saas/staff/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' } }, response => {
      let body = ''; response.on('data', chunk => { body += chunk; }); response.on('end', () => resolve({ status: response.statusCode, data: JSON.parse(body) }));
    });
    request.on('error', reject); request.write('{"email":"'); request.write('a'.repeat(BODY_LIMIT)); request.end('","password":"secret"}');
  });
  assert.equal(streamed.status, 413); assert.deepEqual(streamed.data, { error: 'invalid_input' });
  const malformed = await fetch(f.origin + '/api/saas/staff/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' }); assert.equal(malformed.status, 400);
});

test('first import cannot reset pre-existing one-time award markers or reduce canonical stars', async t => {
  const f = await fixture(t); const teacher = await f.login(); const cls = await f.classroom(teacher); await f.enroll(teacher, cls); const token = await f.studentLogin(cls);
  await f.call('POST', '/student/action', { type: 'completeChallenge', experimentId: EXPERIMENTS[0].id }, token);
  await f.call('POST', '/student/action', { type: 'claimMission', missionId: 'first-discovery' }, token);
  const imported = await f.call('POST', '/student/import', { progress: { stars: 0, completedChallenges: [], claimedMissions: [] } }, token);
  assert.equal(imported.data.student.stars, 15); assert.deepEqual(imported.data.student.completedChallenges, [EXPERIMENTS[0].id]); assert.deepEqual(imported.data.student.claimedMissions, ['first-discovery']);
  const repeated = await f.call('POST', '/student/action', { type: 'completeChallenge', experimentId: EXPERIMENTS[0].id }, token); assert.equal(repeated.data.student.stars, 15);
});

test('preserved proxy Host allows same-origin browser POST; forwarded headers cannot authorize another origin', async t => {
  const f = await fixture(t);
  const good = await f.call('POST', '/staff/login', { email: 'teacher@misbar.test', password: 'MockTeacher!2026' }, undefined, { Origin: f.origin }); assert.equal(good.status, 200);
  const bad = await f.call('POST', '/staff/login', { email: 'teacher@misbar.test', password: 'MockTeacher!2026' }, undefined, { Origin: 'https://evil.example', 'X-Forwarded-Host': 'evil.example', 'X-Forwarded-Proto': 'https' }); assert.equal(bad.status, 403);
  const csrf = await f.call('POST', '/staff/login', { email: 'teacher@misbar.test', password: 'MockTeacher!2026' }, undefined, { Origin: f.origin, 'Sec-Fetch-Site': 'cross-site' }); assert.equal(csrf.status, 403);
});

test('revised scope: inactive/zero-cap metadata does not gate earning/enrollment, and platform is counts-only', async t => {
  const f = await fixture(t); const teacher = await f.login(); const admin = await f.login('admin');
  Object.assign(f.backend.data.schools[0], { status: 'inactive', studentLimit: 0, validUntil: '2000-01-01T00:00:00Z' }); await f.backend.save();
  const cls = await f.classroom(teacher); await f.enroll(teacher, cls); await f.enroll(teacher, cls, 'Scientist'); const student = await f.studentLogin(cls);
  assert.equal((await f.call('GET', '/session', undefined, teacher)).data.canEarn, true); assert.equal((await f.call('GET', '/session', undefined, student)).data.canEarn, true);
  const imported = await f.call('POST', '/student/import', { progress: { stars: 12 } }, student); assert.equal(imported.status, 200);
  const action = await f.call('POST', '/student/action', { type: 'completeChallenge', experimentId: EXPERIMENTS[0].id }, student); assert.equal(action.status, 200); assert.equal(action.data.student.stars, 13);
  const counts = await f.call('GET', '/platform/counts', undefined, admin); assert.deepEqual(counts.data, { schoolCount: 2, classCount: 1, studentCount: 2 });
  for (const role of [teacher, student]) assert.equal((await f.call('GET', '/platform/counts', undefined, role)).status, 403);
  for (const [method, path] of [['GET', '/platform/schools'], ['POST', '/platform/schools'], ['PATCH', `/platform/schools/${MOCK_IDS.schoolA}`], ['POST', '/platform/staff']]) assert.equal((await f.call(method, path, method === 'GET' ? undefined : {}, admin)).status, 404);
});
