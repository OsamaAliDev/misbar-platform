# SaaS HTTP API — revised Phase 5A

This server implements authentication, school/class tenancy, safe enrollment, canonical student progress and an aggregate-only platform counts endpoint. **There are no subscription gates, student caps, payments, parent accounts, analytics, school-management API or platform dashboard in this run.** The database may retain a future subscription schema; this HTTP layer neither reads it into session responses nor enforces it.

## Start and configuration

Node 22+; built-in `http`, `crypto` and filesystem modules only. The parent-owned launch commands are:

```sh
# Vite runs separately on 3000 and proxies /api/saas to 127.0.0.1:3002.
# Proxy must preserve Host: changeOrigin: false.
API_PORT=3002 node --env-file-if-exists=.env server/index.mjs

# API plus existing compiled dist; default production port 3000.
NODE_ENV=production node --env-file-if-exists=.env server/index.mjs

node --test server/test*.mjs
```

`API_PORT` takes precedence over `PORT`; `--dev` selects 3002 when neither is specified, otherwise the default is 3000. `HOST` overrides binding: development defaults to `127.0.0.1`, production to `0.0.0.0`. Node loads `.env`; the server deliberately does not implement dotenv.

| Variable | Behavior |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Both must be present and nonempty to select Supabase. The anon key remains backend-only. |
| `ANON_KEY` | Alias used only when `SUPABASE_ANON_KEY` is absent. |
| `NODE_ENV=production` | Serves existing `dist`; refuses mock unless explicitly opted in. |
| `ALLOW_MOCK=true` | Explicit demonstration-only production mock opt-in. Other values do not opt in. |
| `APP_ORIGIN` | Explicit trusted public origin for a reverse proxy, e.g. `https://school.example`. Optional `PUBLIC_ORIGIN` alias takes precedence. |
| `API_PORT`, `PORT`, `HOST` | Listener settings above. |

Mock is selected **only if neither Supabase variable nor the alias is present**. Blank values count as present and fail closed. To run local mock, omit the Supabase variables rather than setting empty values. Partial/malformed configuration, existing corrupt mock storage and actual upstream failures never silently fall back or reseed.

Origin-bearing requests must match received Host, or the configured public origin. No development-origin exception or wildcard CORS is used. Forwarded Host/scheme/IP headers are untrusted and ignored. Vite should preserve Host; another reverse proxy should preserve Host or set `APP_ORIGIN`. Login peer limiting uses the direct socket IP, so a reverse proxy shares that peer limit unless a separately reviewed trusted-proxy policy is introduced.

## Authentication

All protected calls use `Authorization: Bearer <accessToken>`. The browser stores its session in `sessionStorage` key `misbar:saas:session:v1`; it must never persist PIN/password or hash a PIN. No cookies or Set-Cookie are used.

Logins return `{accessToken,refreshToken?,session:{userId,role,schoolId,studentId}}`. `GET /session` returns canonical `{mode,userId,role,schoolId,studentId,student?,imported?,canEarn}`. Valid students/teachers/school admins with a school have `canEarn:true`, independent of any subscription data; platform admins have no child-earning identity. Role and school are trusted server/database data, never form inputs.

`POST /logout` accepts an empty body without Content-Type and revokes the session. Expired, missing or invalid authorization returns HTTP 401 `{error:'session_expired'}`; browser must clear the stored session and require login. There is intentionally no refresh endpoint. A returned Supabase refresh token is not used in this phase.

## Routes

All paths are relative to `/api/saas`.

| Method/path | Body | Authorization/result |
| --- | --- | --- |
| `GET /config` | — | Public `{mode:'mock'|'supabase',configured:boolean}`; never keys. |
| `POST /staff/login` | `{email,password}` | Public login, trusted staff identity only. |
| `POST /student/login` | `{classCode,nickname,pin}` | Public login, bound student identity only. |
| `GET /session` | — | Canonical own authenticated session. |
| `POST /logout` | Empty or `{}` | `{success:true}`. |
| `GET /classes` | — | Teacher's own classes or school admin's own-school classes: `{classes}`. |
| `POST /classes` | `{name}` | Teacher/school admin: `{class}`. School/caller IDs and random join code are generated from verified identity, not browser input. |
| `GET /classes/:id/roster` | — | Owning teacher or same-school school admin: `{students}`. Cross-row and platform child access return 403. |
| `POST /classes/:id/students` | `{nickname,pin}` | Same ownership: `{student}`. No subscription or capacity checks. |
| `POST /student/import` | `{progress}` | Student's own row, once: `{student,canEarn:true,imported:true}`. |
| `POST /student/action` | Allowed action below | Student's own row: `{student,canEarn:true}`. |
| `GET /platform/counts` | — | Platform admin only: **only** `{schoolCount,classCount,studentCount}` global aggregates. No UI/dashboard. |

The former `/platform/schools` GET/POST/PATCH and `/platform/staff` POST routes do not exist and return 404. Staff/school provisioning is an owner-operated database/Auth setup, not a public management API.

Class shape: `{id,name,joinCode,schoolId,teacherId}`. Student shape: **only** `{id,nickname,stars,heroId,completedChallenges,claimedMissions,unlockedOutfits,avatarId}`. PIN hash, auth binding, child contact fields and persistence internals never appear in responses. Platform admins cannot list classes/rosters and receive no school-ID list, nicknames or progress.

Enrollment accepts only a nickname alias and a four-digit **string** PIN. Nicknames normalize/trim to 2–24 Unicode letters/marks/numbers, spaces, underscore, period or hyphen; numeric-only, contact-style and control/markup strings are rejected. Fields such as `realName`, `email`, `phone`, `schoolId`, `studentId`, `role` and `pin_hash` are rejected. A nickname is an alias, not an invitation to provide a child's real name. Class names are trimmed, nonempty, at most 80 characters, and reject control/markup characters.

Error JSON is only `{error:code}`. Errors: `invalid_input` 400; `invalid_credentials`/`session_expired` 401; `forbidden` 403; `not_found` 404; `duplicate_nickname` 409; `rate_limited` 429; `unavailable` 503. JSON body limit is 32 KiB, including streamed/chunked input; oversized bodies return 413 `invalid_input`, unsupported media types 415 `invalid_input`. Successful routes currently return 200.

## Canonical progress

Only these action shapes are accepted; extra fields are rejected:

```js
{ type: 'completeChallenge', experimentId }
{ type: 'claimMission', missionId }
{ type: 'unlockOutfit', heroId, slot }
{ type: 'chooseHero', heroId }
{ type: 'setAvatar', avatarId }
```

No `addStars`, nickname mutation, caller-supplied totals or target student/school IDs. Six known experiments award one star each once. Original `config/game.js` mission goals/rewards are used: 2/3/5 stars, with the science tour requiring physics, math and astronomy. Outfit slots 2/3/4 unlock at totals 16/22/28 without spending stars. Duplicate challenge/mission/outfit claims are idempotent; stars stay bounded to 28.

Mock imports the original pure game/experiment helpers. `heroes.js` is Vite-only (`import.meta.env`), so an explicit five-hero whitelist is checked against the source in tests.

First guest import is a documented **bounded legacy trust concession**, not proof the client earned stars. The HTTP layer validates shape, filters/deduplicates known IDs, keeps achieved mission claims and threshold-eligible outfits, and caps valid nonnegative guest totals at 28. Missing fields default to the original 12-star/rocket state. Guest nickname never replaces the enrolled alias. Existing server award markers and the greater current/imported total survive first import; subsequent imports return canonical progress without resetting state. Supabase RPC independently validates this data, including direct calls.

## Local mock only

`.data/saas.json` is ignored runtime data. It persists synthetic schools, trusted staff password hashes, students with salted async-scrypt PIN hashes, progress/import markers and SHA-256 account-keyed failed attempts. No plaintext PIN/password or access-token session is persisted. The directory/file are created with modes 0700/0600; full write transactions are serialized, including asynchronous hashing, to avoid duplicate enrollment and once-only progress races.

Mock access tokens are randomized; only SHA-256 token hashes live in memory. Sessions expire after 12 hours. Logout revokes; student re-login revokes the previous student session. **Restart logs out every mock session**, retaining schools/students/progress/attempts. Five bad PINs in 15 minutes lock the account; the fifth mock failure returns 429. Direct-peer IP limits complement persisted account-key limits and cannot be spoofed through forwarded headers.

These are **synthetic local mock credentials only**, not production Supabase seeds:

| Role | Email | Password | Stable user UUID |
| --- | --- | --- | --- |
| Platform admin | `admin@misbar.test` | `MockAdmin!2026` | `10000000-0000-4000-8000-000000000001` |
| School A teacher | `teacher@misbar.test` | `MockTeacher!2026` | `10000000-0000-4000-8000-000000000002` |
| School A admin | `schooladmin@misbar.test` | `MockSchool!2026` | `10000000-0000-4000-8000-000000000003` |
| School B teacher | `other@misbar.test` | `MockOther!2026` | `10000000-0000-4000-8000-000000000004` |

School A: `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa`; School B: `bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb`. No children or exposed demo PINs are seeded. Existing runtime files with obsolete subscription metadata remain readable, but that metadata has no API effect.

## Supabase setup and transport

Owner must apply the revised forward migration, enable GoTrue anonymous sign-ins, create staff Auth accounts in the Supabase dashboard, and bootstrap trusted profiles/school assignment through owner-only SQL. No service-role credential is needed by this server. Do not expose an end-user role/self-signup management path.

Staff login uses `/auth/v1/token?grant_type=password` with `{email,password}`. Student login calls `/auth/v1/signup` with exactly `{}`, then `student_login(p_class_code,p_nickname,p_pin)` under that anonymous Auth token. Failed binding performs best-effort logout without replacing the original error. GoTrue's 400 invalid-grant is mapped to `invalid_credentials`.

Every protected Supabase call first validates `/auth/v1/user`, invokes `saas_session()` and compares canonical `userId` with the verified GoTrue ID. Exact RPCs used are `student_login`, `saas_session`, `create_student`, `import_student_progress`, `apply_student_action` and **`platform_counts`**. Classes use PostgREST with verified school/caller IDs and RLS. Roster select is explicitly `id,nickname,stars,hero_id,completed_challenges,claimed_missions,unlocked_outfits,avatar_id`, never `*` or `pin_hash`; rows map to safe camelCase. DB account-key PIN throttling remains mandatory because direct RPC cannot rely on HTTP peer limits.

Production serves existing `dist` with the API. Unknown API routes and missing assets return JSON 404, never SPA HTML. Extensionless navigation accepting `text/html` can receive the SPA index. Logs contain only randomized request ID, method, templated route, status and duration; no body, credentials, token, user ID, IP, raw URL/query, child nickname or contacts.

## Evidence and limits

Final server suite: **27 tests, 27 passed, 0 failed, 0 skipped**; every `server/*.mjs` passed `node --check`. HTTP tests cover tenancy, roles, PIN throttling/persistence, same-origin/proxy behavior, body limits including chunked requests, canonical import/actions, privacy, restart/expiry/rebinding, counts-only platform access and absence of billing/cap enforcement. Supabase tests use injected fetch responses and a real local HTTP failure-mapping listener to check exact requests and error behavior.

These are **transport stubs, not remote Supabase verification**. No remote credentials were available. This server task did not operate the shared browser or execute the separate database-agent tests. The revised migration must expose `platform_counts` and remove former database gating before real operation.
