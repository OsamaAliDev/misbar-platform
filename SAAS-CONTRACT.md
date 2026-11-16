# Phase 5A shared contract

Work only /home/ubuntu/misbar-work branch saas-foundation; plain JS/JSX/CSS. No publication or main push. No Supabase env currently. Existing Manus binding unavailable; use check-only build/node tests, no new project.

## Browser/server API

Browser accesses `/api/saas`. Every protected call uses `Authorization: Bearer <accessToken>` held in sessionStorage `misbar:saas:session:v1`. Do not store PIN/password. No cookies are used. Server accepts JSON max32KiB, same-origin, no wildcard CORS, never logs request bodies. Credentials server-side .env; browser only gets mode, not keys. Node built-in HTTP and crypto, Vite proxy3002 during dev, production server serves dist and API on PORT default3000.

- GET /config => {mode:'mock'|'supabase',configured:boolean}
- POST /staff/login {email,password} => {accessToken,refreshToken?,session:{userId,role,schoolId,studentId:null}}
- POST /student/login {classCode,nickname,pin} => same, session.role student
- GET /session => {mode,userId,role,schoolId,studentId,student?,subscription?,canEarn,imported?}
- POST /logout => success (revoke session)
- GET /classes => {classes:[{id,name,joinCode,schoolId,teacherId}]}
- POST /classes {name} => {class:{id,name,joinCode,schoolId,teacherId}}
- GET /classes/:id/roster => {students:[{id,nickname,stars,heroId,completedChallenges,claimedMissions,unlockedOutfits,avatarId}]}
- POST /classes/:id/students {nickname,pin} => {student}; enrollment allowed owning teacher/school_admin. Subscription gating/student-limit enforcement is deferred. PIN response omitted.
- POST /student/import {progress} => {student,canEarn,imported:true}; once per student, entire server canonical progress returned; Default guest stars12; validated IDs, bound stars<=28; legacy imported state not independently trustworthy (document once-only tradeoff).
- POST /student/action {type,experimentId?,heroId?,missionId?,slot?,avatarId?} => {student,canEarn}; types completeChallenge,claimMission,unlockOutfit,chooseHero,setAvatar ONLY. No arbitrary addStars or student nickname change; duplicate claims idempotent Original six experiments, three missions and thresholds used.

Error JSON {error:'invalid_credentials'|'rate_limited'|'forbidden'|'subscription_inactive'|'student_limit'|'duplicate_nickname'|'invalid_input'|'unavailable'|'session_expired'|'not_found'}, appropriate4xx/5xx. UI translates error codes. Server canEarn is true for a valid student identity; guests true. Subscriptions are schema-only with no gate in this run. rank derived config/game.js.

## Database / Supabase mode

Reuse legacy schema.sql STARTING POINT via additive forward migration; disable anonymous legacy events writes (no analytics). Preserve data; reject incompatible legacy roles rather than silently elevate. Tables schools/profiles/classes/students/experiment_progress/subscriptions and private PIN-attempt table. RLS EVERY table; revoke pin_hash reads from ALL client roles; students grant selected safe columns only. School staff scoped tenant; teacher only own classes/rosters; students only own student/progress row; platform admin no per-student table reads, aggregate/manual provisioning RPC only. Profiles not automatically self-writable.

Supabase staff auth email+password GoTrue. Students use Supabase anonymous Auth (no email/phone) then authenticated security-definer `student_login(p_class_code,p_nickname,p_pin)` validates PIN with DB pgcrypto bcrypt and account-key 5failed/15min limit; links auth.uid to students.auth_user_id only after success. Re-login can revoke previous identity by rebinding. Staff identity checked against authenticated JWT and profiles. Anonymous signups unbound can read NOTHING. Restrict student_login to anonymous claim; no student PII/metadata. Supabase anonymous sign-ins must be enabled (CAPTCHA optional deployment requirement).

Supabase RPC names and args:
- student_login(p_class_code text,p_nickname text,p_pin text) returns JSON {ok,error?,studentId?,schoolId?}
- saas_session() returns session JSON above from auth.uid/profile (includes sanitized student via helper)
- create_student(p_class_id uuid,p_nickname text,p_pin text) returns JSON {student}; enrollment validates staff and ownership
- import_student_progress(p_progress jsonb) returns JSON {student,canEarn,imported}
- apply_student_action(p_action jsonb) returns JSON {student,canEarn}
Classes CRUD via table PostgREST + owning RLS (server uses validated current auth.uid school and caller ID; random join code server). Rosters selected safe columns then map snake_case to camel. DB SQL RPC is source of truth for actions/import, no trusting browser totals.

## Frontend tasks

Parent owns data-access.js (localStorage adapter + HTTP-backed Supabase/mock adapter), SaasProvider/session integration, student reducer state, App/navigation/main/header access, route manifest and dev server.
Screens agent owns ONLY src/views/saas/*, src/i18n/locales/{ar,en}/saas.js. Screens use useSaas() exported parent state/saas.jsx: {mode,session,loading,error,api,loginStaff,loginStudent,logout,refreshSession}. api methods getClasses,createClass,getRoster,createStudent,getSchools,createSchool,setSubscription,assignStaff; all async. login methods return session. VIEWS STAFF_LOGIN='teacher-login', STUDENT_LOGIN='student-login', CLASSES='classes', ROSTER='class-roster' params.classId, PLATFORM='platform-admin'. Named exports TeacherLoginView,StudentLoginView,ClassesView,ClassRosterView,PlatformAdminView. All props {onNavigate(view,params)} plus ClassRosterView.classId. Screens show role denial/redirect, login forms no signup self-role, local mock banner and test staff credentials described below, create class with join code, enroll nick+4digitPIN no contact fields, roster stars/rank, platform school form/manual sub fields and assign existing staff UUID. Render headings id=view-heading tabindex=-1. Screens body only parent supplies header.

## Local mock

Mock is an HTTP server, not browser fake auth. Seed clearly labeled synthetic staff: admin@misbar.test / MockAdmin!2026, teacher@misbar.test / MockTeacher!2026, schooladmin@misbar.test / MockSchool!2026, other@misbar.test / MockOther!2026. Synthetic schoolsA/B and teacherB verify isolation. .data file ignored by Git; bcrypt not required mock (scrypt salt server-side). No hardcoded production accounts; refuse mock mode in NODE_ENV=production unless ALLOW_MOCK=true explicit. Never fallback to mock on actual Supabase error or partial credentials. Test engine PostgreSQL16 installed locally for executing migration/RLS with minimal auth schema stub, NOT remote Supabase.

## Superseding 13:31 scope

NO subscription gate, cap enforcement, manual management page/RPC, payments, parent accounts or analytics. Keep subscriptions table/RLS only. Platform_admin uses GET /platform/counts and platform_counts() returning global schoolCount/classCount/studentCount only. Owner provisions schools/staff profiles through trusted SQL, not a new UI. Student and staff screens: logins, class create and roster only. Latest pasted_content_2.txt governs; earlier gate references are historical and not implementation requirements.
