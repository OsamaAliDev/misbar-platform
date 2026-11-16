\set ON_ERROR_STOP on
-- Synthetic fixture only. Assertions execute as real non-bypass client roles.
BEGIN;
CREATE SCHEMA saas_test;
GRANT USAGE ON SCHEMA saas_test TO anon,authenticated;
CREATE FUNCTION saas_test.ok(p_value boolean,p_message text) RETURNS void
LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
  IF p_value IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL: %',p_message; END IF;
  RAISE NOTICE 'PASS: %',p_message;
END $$;
CREATE FUNCTION saas_test.denied(p_sql text,p_message text) RETURNS void
LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
  BEGIN EXECUTE p_sql;
  EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'PASS: %',p_message; RETURN; END;
  RAISE EXCEPTION 'FAIL (expected 42501): %',p_message;
END $$;
CREATE FUNCTION saas_test.fk_denied(p_sql text,p_message text) RETURNS void
LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN
  BEGIN EXECUTE p_sql;
  EXCEPTION WHEN foreign_key_violation THEN RAISE NOTICE 'PASS: %',p_message; RETURN; END;
  RAISE EXCEPTION 'FAIL (expected FK violation): %',p_message;
END $$;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA saas_test TO anon,authenticated;

INSERT INTO auth.users(id,is_anonymous) VALUES
 ('11111111-1111-1111-1111-111111111111',false), -- teacher A1
 ('11222222-2222-2222-2222-222222222222',false), -- teacher A2
 ('11333333-3333-3333-3333-333333333333',false), -- school admin A
 ('21111111-1111-1111-1111-111111111111',false), -- teacher B
 ('99999999-9999-9999-9999-999999999999',false), -- platform admin
 ('12111111-1111-1111-1111-111111111111',true),  -- student A1
 ('12222222-2222-2222-2222-222222222222',true),  -- student A2
 ('22111111-1111-1111-1111-111111111111',true),  -- student B
 ('88888888-8888-8888-8888-888888888888',true),  -- unbound anon Auth
 ('77777777-7777-7777-7777-777777777777',true),  -- relogin anon Auth
 ('66666666-6666-6666-6666-666666666666',false); -- manual staff candidate
INSERT INTO public.schools(id,name) VALUES
 ('10000000-0000-0000-0000-000000000000','Synthetic school A'),
 ('20000000-0000-0000-0000-000000000000','Synthetic school B');
INSERT INTO public.subscriptions(school_id,plan,status,student_limit,valid_until)
 SELECT id,'manual','active',10,now()+interval '30 days' FROM public.schools;
INSERT INTO public.profiles(id,role,school_id) VALUES
 ('11111111-1111-1111-1111-111111111111','teacher','10000000-0000-0000-0000-000000000000'),
 ('11222222-2222-2222-2222-222222222222','teacher','10000000-0000-0000-0000-000000000000'),
 ('11333333-3333-3333-3333-333333333333','school_admin','10000000-0000-0000-0000-000000000000'),
 ('21111111-1111-1111-1111-111111111111','teacher','20000000-0000-0000-0000-000000000000'),
 ('99999999-9999-9999-9999-999999999999','platform_admin',NULL),
 ('12111111-1111-1111-1111-111111111111','student','10000000-0000-0000-0000-000000000000'),
 ('12222222-2222-2222-2222-222222222222','student','10000000-0000-0000-0000-000000000000'),
 ('22111111-1111-1111-1111-111111111111','student','20000000-0000-0000-0000-000000000000');
INSERT INTO public.classes(id,school_id,teacher_id,name,join_code) VALUES
 ('10111111-1111-1111-1111-111111111111','10000000-0000-0000-0000-000000000000','11111111-1111-1111-1111-111111111111','A1','CLASSA1'),
 ('10222222-2222-2222-2222-222222222222','10000000-0000-0000-0000-000000000000','11222222-2222-2222-2222-222222222222','A2','CLASSA2'),
 ('20111111-1111-1111-1111-111111111111','20000000-0000-0000-0000-000000000000','21111111-1111-1111-1111-111111111111','B1','CLASSB1');
INSERT INTO public.students(id,school_id,class_id,auth_user_id,nickname,pin_hash,stars,completed_challenges) VALUES
 ('13111111-1111-1111-1111-111111111111','10000000-0000-0000-0000-000000000000','10111111-1111-1111-1111-111111111111','12111111-1111-1111-1111-111111111111','Explorer A',extensions.crypt('1234',extensions.gen_salt('bf',12)),13,ARRAY['lever-balance']),
 ('13222222-2222-2222-2222-222222222222','10000000-0000-0000-0000-000000000000','10222222-2222-2222-2222-222222222222','12222222-2222-2222-2222-222222222222','Explorer A2',extensions.crypt('1234',extensions.gen_salt('bf',12)),13,ARRAY['lever-balance']),
 ('23111111-1111-1111-1111-111111111111','20000000-0000-0000-0000-000000000000','20111111-1111-1111-1111-111111111111','22111111-1111-1111-1111-111111111111','Explorer B',extensions.crypt('1234',extensions.gen_salt('bf',12)),13,ARRAY['lever-balance']);
INSERT INTO public.experiment_progress(student_id,school_id,experiment_id) SELECT id,school_id,'lever-balance' FROM public.students;
INSERT INTO public.events(event_name,payload,session_id) VALUES('legacy','{"synthetic":true}','legacy-only');

SELECT saas_test.ok((SELECT count(*)=8 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE (n.nspname='public' AND c.relname IN ('events','schools','profiles','classes','students','experiment_progress','subscriptions') OR n.nspname='saas_private' AND c.relname='pin_attempts') AND c.relrowsecurity),'all 7 public tables + private attempts have RLS');
SELECT saas_test.ok(NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid='saas_private.pin_attempts'::regclass),'attempts has no policies');
SELECT saas_test.ok((SELECT count(DISTINCT pin_hash)=3 AND bool_and(pin_hash LIKE '$2a$12$%' AND char_length(pin_hash)=60 AND extensions.crypt('1234',pin_hash)=pin_hash) FROM public.students),'PIN bcrypt cost12 with distinct salt and server verification');
SELECT saas_test.ok(NOT has_column_privilege('authenticated','public.students','pin_hash','SELECT') AND NOT has_column_privilege('anon','public.students','pin_hash','SELECT'),'pin_hash no client SELECT grant');
SELECT saas_test.ok(NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace,
 LATERAL aclexplode(COALESCE(p.proacl,acldefault('f',p.proowner))) acl
 WHERE n.nspname IN ('public','saas_private') AND (p.proname IN ('student_login','saas_session','create_student','import_student_progress','apply_student_action','platform_counts') OR n.nspname='saas_private') AND acl.grantee=0 AND acl.privilege_type='EXECUTE'),'no PUBLIC helper/RPC execution');
SELECT saas_test.ok(NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE (n.nspname='saas_private' OR n.nspname='public' AND p.proname IN ('student_login','saas_session','create_student','import_student_progress','apply_student_action','platform_counts')) AND NOT COALESCE(p.proconfig,'{}') @> ARRAY['search_path=pg_catalog']),'helper/RPC locked search_path');
SELECT saas_test.ok(NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('platform_schools','provision_school','set_school_subscription','assign_staff') OR n.nspname='saas_private' AND p.proname IN ('active_school','school_json')),'deferred management RPCs and subscription/metadata helpers absent');
SELECT saas_test.ok((SELECT count(*)=2 AND bool_and(NOT rolsuper AND NOT rolbypassrls) FROM pg_roles WHERE rolname IN ('anon','authenticated')),'client test roles have no superuser or RLS bypass');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims','{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated","is_anonymous":false}',true);
SELECT saas_test.ok((SELECT count(*)=1 FROM public.schools) AND (SELECT count(*)=1 FROM public.subscriptions) AND (SELECT count(*)=2 FROM public.profiles) AND (SELECT count(*)=1 FROM public.classes) AND (SELECT count(id)=1 FROM public.students) AND (SELECT count(*)=1 FROM public.experiment_progress),'teacher A all tenant boundaries + only own class/student/progress/profile');
SELECT saas_test.ok(NOT EXISTS (SELECT 1 FROM public.classes WHERE id='10222222-2222-2222-2222-222222222222') AND NOT EXISTS (SELECT 1 FROM public.students WHERE id='13222222-2222-2222-2222-222222222222'),'teacher A cannot read other teacher in same school');
SELECT saas_test.denied('SELECT * FROM public.events','teacher cannot read legacy events');
SELECT saas_test.denied('SELECT pin_hash FROM public.students','teacher cannot select pin_hash');
SELECT saas_test.denied('SELECT * FROM public.students','wildcard students cannot bypass column restriction');
SELECT saas_test.denied('SELECT * FROM saas_private.pin_attempts','teacher cannot read attempts');
SELECT saas_test.denied('SELECT saas_private.student_json(''23111111-1111-1111-1111-111111111111'')','private student JSON not executable');
SELECT saas_test.ok(public.create_student('10222222-2222-2222-2222-222222222222','Forbidden','1234')->>'error'='forbidden','teacher cannot enroll other teacher class');
SELECT saas_test.ok(public.create_student('20111111-1111-1111-1111-111111111111','Forbidden','1234')->>'error'='forbidden','teacher cannot enroll other tenant class');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','eXpLoReR a','1234')->>'error'='duplicate_nickname','case-insensitive nickname uniqueness');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111',repeat('X',25),'1234')->>'error'='invalid_input','nickname limited to24 characters');
-- Authorized direct RPC calls must enforce the HTTP pseudonym syntax too.
-- Keep accepted alias rows out of subsequent tenant/count assertions.
SAVEPOINT pseudonym_aliases;
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','kid@example.com','1234')->>'error'='invalid_input','direct authorized RPC rejects email nickname');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','0501234567','1234')->>'error'='invalid_input','direct authorized RPC rejects numeric phone nickname');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','٠٥٠١٢٣٤٥٦٧','1234')->>'error'='invalid_input','direct authorized RPC rejects Arabic-digit phone nickname');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','https://a.co','1234')->>'error'='invalid_input','direct authorized RPC rejects short URL nickname');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','A','1234')->>'error'='invalid_input','direct authorized RPC rejects one-character nickname');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111',E'Star\nKid','1234')->>'error'='invalid_input','direct authorized RPC rejects control character');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111',U&'Star\202EKid','1234')->>'error'='invalid_input','direct authorized RPC rejects bidi control');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','_.-123','1234')->>'error'='invalid_input','direct authorized RPC requires an actual letter');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111',NULL,'1234')->>'error'='invalid_input','direct authorized RPC rejects null nickname');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','مُستكشف_٧','1234')->'student'->>'nickname'='مُستكشف_٧','direct authorized RPC accepts Arabic alias with marks and digits');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','Star.Kid-7','1234')->'student'->>'nickname'='Star.Kid-7','direct authorized RPC accepts English alias');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','نجم Star_2','1234')->'student'->>'nickname'='نجم Star_2','direct authorized RPC accepts mixed Arabic English alias');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111',U&'  Cafe\0301_7  ','1234')->'student'->>'nickname'='Café_7','direct authorized RPC trims spaces and normalizes NFC');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','Café_7','1234')->>'error'='duplicate_nickname','NFC-equivalent alias cannot bypass uniqueness');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111',U&'\0009SpaceKid\00A0','1234')->'student'->>'nickname'='SpaceKid','direct authorized RPC matches HTTP edge whitespace trim');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111',U&'\+010400\+010401','1234')->'student'->>'nickname'=U&'\+010400\+010401','direct authorized RPC accepts supplementary Unicode letters');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111',repeat(U&'\+010400',13),'1234')->>'error'='invalid_input','direct authorized RPC matches HTTP UTF16 maximum length');
ROLLBACK TO SAVEPOINT pseudonym_aliases;
RELEASE SAVEPOINT pseudonym_aliases;
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','Invalid PIN','123')->>'error'='invalid_input','PIN exact4 digits');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','Enrolled','1234') ? 'student','owning teacher enrollment succeeds');
SELECT saas_test.denied('UPDATE public.profiles SET role=''platform_admin'' WHERE id=auth.uid()','staff cannot self-elevate profile role');
SELECT saas_test.denied('INSERT INTO public.profiles(id,role) VALUES(auth.uid(),''platform_admin'')','profile self-assignment forbidden');
SELECT saas_test.ok(public.student_login('CLASSA1','Explorer A','1234')->>'error'='forbidden','staff JWT cannot PIN login');
SELECT saas_test.ok(public.platform_counts()->>'error'='forbidden','teacher cannot read platform counts');
SELECT saas_test.ok(NOT (public.saas_session() ? 'subscription') AND public.saas_session()->>'canEarn'='false','staff session has no subscription details or student earning flag');
SELECT saas_test.denied('INSERT INTO public.classes(school_id,teacher_id,name,join_code) VALUES(''20000000-0000-0000-0000-000000000000'',''21111111-1111-1111-1111-111111111111'',''Cross tenant'',''CROSS01'')','teacher cannot insert another school class');
SELECT saas_test.denied('INSERT INTO public.classes(school_id,teacher_id,name,join_code) VALUES(''10000000-0000-0000-0000-000000000000'',''11222222-2222-2222-2222-222222222222'',''Other teacher'',''CROSS02'')','teacher cannot insert a class for another teacher');
WITH changed AS (UPDATE public.classes SET name='must not change' WHERE id IN ('10222222-2222-2222-2222-222222222222','20111111-1111-1111-1111-111111111111') RETURNING id) SELECT saas_test.ok((SELECT count(*)=0 FROM changed),'teacher cannot update another teacher or tenant class');
WITH changed AS (DELETE FROM public.classes WHERE id IN ('10222222-2222-2222-2222-222222222222','20111111-1111-1111-1111-111111111111') RETURNING id) SELECT saas_test.ok((SELECT count(*)=0 FROM changed),'teacher cannot delete another teacher or tenant class');
SELECT saas_test.denied('UPDATE public.subscriptions SET plan=''forged''','staff subscription table remains read-only');

SELECT set_config('request.jwt.claims','{"sub":"21111111-1111-1111-1111-111111111111","role":"authenticated","is_anonymous":false}',true);
SELECT saas_test.ok((SELECT count(*)=1 FROM public.schools WHERE id='20000000-0000-0000-0000-000000000000') AND (SELECT count(*)=1 FROM public.subscriptions) AND (SELECT count(*)=2 FROM public.profiles) AND (SELECT count(*)=1 FROM public.classes) AND (SELECT count(id)=1 FROM public.students) AND (SELECT count(*)=1 FROM public.experiment_progress),'teacher B reciprocal seven-table tenant isolation');
SELECT saas_test.denied('SELECT * FROM public.events','teacher B events denied');
SELECT set_config('request.jwt.claims','{"sub":"11333333-3333-3333-3333-333333333333","role":"authenticated","is_anonymous":false}',true);
SELECT saas_test.ok((SELECT count(*)=1 FROM public.schools) AND (SELECT count(*)=1 FROM public.subscriptions) AND (SELECT count(*)=5 FROM public.profiles) AND (SELECT count(*)=2 FROM public.classes) AND (SELECT count(id)=3 FROM public.students) AND (SELECT count(*)=2 FROM public.experiment_progress),'school admin sees all A, never B across all tenant tables');
SELECT saas_test.denied('SELECT * FROM public.events','school admin events denied');
SELECT saas_test.ok(public.create_student('10222222-2222-2222-2222-222222222222','Admin enrolled','4321') ? 'student','school admin enrollment within tenant');

SELECT set_config('request.jwt.claims','{"sub":"12111111-1111-1111-1111-111111111111","role":"authenticated","is_anonymous":true,"user_metadata":{"role":"platform_admin","school_id":"20000000-0000-0000-0000-000000000000"}}',true);
SELECT saas_test.ok((SELECT count(*)=0 FROM public.schools) AND (SELECT count(*)=0 FROM public.subscriptions) AND (SELECT count(*)=1 FROM public.profiles) AND (SELECT count(*)=0 FROM public.classes) AND (SELECT count(id)=1 FROM public.students) AND (SELECT count(*)=1 FROM public.experiment_progress),'student sees own row/progress/profile only; forged metadata ignored');
SELECT saas_test.denied('SELECT * FROM public.events','student events denied');
SELECT saas_test.ok(public.saas_session()->>'role'='student' AND public.saas_session()->>'canEarn'='true' AND NOT (public.saas_session() ? 'subscription') AND NOT (public.saas_session()->'student' ? 'pin_hash') AND NOT (public.saas_session()->'student' ? 'auth_user_id'),'sanitized student session no subscription/credential/identity leakage');
SELECT saas_test.denied('SELECT pin_hash FROM public.students','student cannot select own pin_hash');
SELECT saas_test.denied('UPDATE public.students SET stars=28 WHERE auth_user_id=auth.uid()','student direct SQL mutation denied');
SELECT saas_test.denied('INSERT INTO public.experiment_progress(student_id,school_id,experiment_id) VALUES(''13111111-1111-1111-1111-111111111111'',''10000000-0000-0000-0000-000000000000'',''planet-orbits'')','student direct progress insert denied');
SELECT saas_test.denied('UPDATE public.profiles SET role=''teacher'',school_id=''20000000-0000-0000-0000-000000000000'' WHERE id=auth.uid()','student profile escalation denied');
SELECT saas_test.ok(public.apply_student_action('{"type":"addStars","amount":999}')->>'error'='invalid_input','no arbitraryaddStars RPC');
SELECT saas_test.ok(public.apply_student_action('{"type":"completeChallenge","experimentId":"made-up"}')->>'error'='invalid_input','unknown challenge rejected');
SELECT saas_test.ok(public.apply_student_action('{"type":"claimMission","missionId":"science-tour"}')->>'error'='invalid_input','science-tour needs all3 original subject categories');
SELECT saas_test.ok(public.apply_student_action('{"type":"claimMission","missionId":"two-experiments"}')->>'error'='invalid_input','two-experiments original goal enforced');
SELECT saas_test.ok(public.apply_student_action('{"type":"chooseHero","heroId":"evil"}')->>'error'='invalid_input' AND public.apply_student_action('{"type":"setAvatar","avatarId":"url://photo"}')->>'error'='invalid_input','hero/avatar allowlists enforced');
SELECT saas_test.ok(public.apply_student_action('{"type":"unlockOutfit","heroId":"lubna","slot":2}')->>'error'='invalid_input','outfit2 threshold16 enforced');
SELECT saas_test.ok(public.apply_student_action('{"type":"completeChallenge","experimentId":"lever-balance"}')->'student'->>'stars'='13','duplicate challenge no extra star');
SELECT saas_test.ok(public.apply_student_action('{"type":"claimMission","missionId":"first-discovery"}')->'student'->>'stars'='15' AND public.apply_student_action('{"type":"claimMission","missionId":"first-discovery"}')->'student'->>'stars'='15','first-discovery +2 once');
SELECT saas_test.ok(public.apply_student_action('{"type":"completeChallenge","experimentId":"motion-acceleration"}')->'student'->>'stars'='16','canonical challenge +1');
SELECT saas_test.ok(public.apply_student_action('{"type":"unlockOutfit","heroId":"lubna","slot":2}')->'student'->'unlockedOutfits' ? 'lubna:2','outfit2 unlocks at16');
SELECT saas_test.ok(public.apply_student_action('{"type":"claimMission","missionId":"two-experiments"}')->'student'->>'stars'='19' AND public.apply_student_action('{"type":"claimMission","missionId":"two-experiments"}')->'student'->>'stars'='19','two-experiments +3 once');
SELECT saas_test.ok(public.apply_student_action('{"type":"unlockOutfit","heroId":"lubna","slot":3}')->>'error'='invalid_input','outfit3 blocked below22');
SELECT public.apply_student_action('{"type":"completeChallenge","experimentId":"planet-orbits"}');
SELECT public.apply_student_action('{"type":"completeChallenge","experimentId":"fractions-area"}');
SELECT saas_test.ok(public.apply_student_action('{"type":"claimMission","missionId":"science-tour"}')->'student'->>'stars'='26' AND public.apply_student_action('{"type":"claimMission","missionId":"science-tour"}')->'student'->>'stars'='26','science-tour +5 once across physics/math/astronomy');
SELECT saas_test.ok(public.apply_student_action('{"type":"unlockOutfit","heroId":"lubna","slot":3}')->'student'->'unlockedOutfits' ? 'lubna:3','outfit3 allowed above22');
SELECT saas_test.ok(public.apply_student_action('{"type":"unlockOutfit","heroId":"lubna","slot":4}')->>'error'='invalid_input','outfit4 blocked below28');
SELECT public.apply_student_action('{"type":"completeChallenge","experimentId":"light-refraction"}');
SELECT saas_test.ok(public.apply_student_action('{"type":"completeChallenge","experimentId":"matter-states"}')->'student'->>'stars'='28','all6 challenges + missions total28');
SELECT public.apply_student_action('{"type":"unlockOutfit","heroId":"lubna","slot":4}');
SELECT saas_test.ok(jsonb_array_length(public.apply_student_action('{"type":"unlockOutfit","heroId":"lubna","slot":4}')->'student'->'unlockedOutfits')=3,'duplicate outfit idempotent and threshold28');
SELECT saas_test.ok(public.apply_student_action('{"type":"chooseHero","heroId":"nour"}')->'student'->>'heroId'='nour' AND public.apply_student_action('{"type":"setAvatar","avatarId":"star"}')->'student'->>'avatarId'='star','validated hero/avatar mutation succeeds');
SELECT saas_test.ok((SELECT count(*)=6 FROM public.experiment_progress),'canonical six progress rows only');
SELECT saas_test.ok((SELECT sum(stars)=6 FROM public.experiment_progress),'per-experiment one-star rewards recorded');

SELECT set_config('request.jwt.claims','{"sub":"88888888-8888-8888-8888-888888888888","role":"authenticated","is_anonymous":true,"user_metadata":{"role":"platform_admin"}}',true);
SELECT saas_test.ok((SELECT count(*)=0 FROM public.schools) AND (SELECT count(*)=0 FROM public.subscriptions) AND (SELECT count(*)=0 FROM public.profiles) AND (SELECT count(*)=0 FROM public.classes) AND (SELECT count(id)=0 FROM public.students) AND (SELECT count(*)=0 FROM public.experiment_progress),'unbound anonymous Auth sees nothing across tenant tables');
SELECT saas_test.denied('SELECT * FROM public.events','unbound anonymous events denied');
SELECT saas_test.ok(public.saas_session()->>'error'='session_expired' AND public.platform_counts()->>'error'='forbidden','unbound JWT metadata cannot assign role');
SELECT saas_test.denied('UPDATE auth.users SET raw_user_meta_data=''{}''','client cannot write test auth tables through SQL');
DO $$ BEGIN FOR i IN 1..5 LOOP
  PERFORM saas_test.ok(public.student_login('classa1',' explorer a ','9999')->>'error'=CASE WHEN i=5 THEN 'rate_limited' ELSE 'invalid_credentials' END,'PIN failure persists #' || i);
END LOOP; END $$;
SELECT set_config('request.jwt.claims','{"sub":"77777777-7777-7777-7777-777777777777","role":"authenticated","is_anonymous":true}',true);
SELECT saas_test.ok(public.student_login('CLASSA1','Explorer A','1234')->>'error'='rate_limited','account key blocks correctPIN sixth attempt across authUIDs');
RESET ROLE;
SELECT saas_test.ok((SELECT failures=5 FROM saas_private.pin_attempts WHERE account_key=encode(extensions.digest('classa1'||chr(31)||'explorer a','sha256'),'hex')),'failed login counters committed within transaction, not exception rollback');
UPDATE saas_private.pin_attempts SET window_started=now()-interval '16 minutes';
SET LOCAL ROLE authenticated;
SELECT saas_test.ok(public.student_login('CLASSA1','Explorer A','1234')->>'ok'='true','15minute window expires and PIN login succeeds');
SELECT saas_test.ok(public.saas_session()->>'role'='student' AND (SELECT count(id)=1 FROM public.students),'successful PIN binds new anonymousUID');
SELECT set_config('request.jwt.claims','{"sub":"12111111-1111-1111-1111-111111111111","role":"authenticated","is_anonymous":true}',true);
SELECT saas_test.ok((SELECT count(id)=0 FROM public.students) AND (SELECT count(*)=0 FROM public.experiment_progress) AND (SELECT count(*)=0 FROM public.profiles) AND public.saas_session()->>'error'='session_expired','relogin oldUID childaccess/profile revoked');
RESET ROLE;
SELECT saas_test.ok(NOT EXISTS(SELECT 1 FROM public.profiles WHERE id='12111111-1111-1111-1111-111111111111'),'safe old student profile removed');

-- Subscription configuration and gating are deferred: no row must not block use.
DELETE FROM public.subscriptions WHERE school_id='10000000-0000-0000-0000-000000000000';
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims','{"sub":"12222222-2222-2222-2222-222222222222","role":"authenticated","is_anonymous":true}',true);
SELECT saas_test.ok(public.student_login('CLASSA2','Explorer A2','1234')->>'ok'='true','unconfigured subscription does not gate PIN login');
SELECT saas_test.ok(public.saas_session()->>'canEarn'='true' AND NOT (public.saas_session() ? 'subscription'),'unconfigured subscription does not gate student session or expose metadata');
SELECT saas_test.ok(public.apply_student_action('{"type":"chooseHero","heroId":"nour"}')->'student'->>'heroId'='nour','unconfigured subscription does not gate validated mutation');
SELECT saas_test.ok(public.apply_student_action('{"type":"completeChallenge","experimentId":"motion-acceleration"}')->'student'->>'stars'='14','unconfigured subscription does not gate earning stars');
SELECT saas_test.denied('UPDATE public.students SET stars=28 WHERE auth_user_id=auth.uid()','ungated actions still prohibit direct SQL mutation');
SELECT set_config('request.jwt.claims','{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated","is_anonymous":false}',true);
SELECT saas_test.ok((SELECT count(*)=0 FROM public.subscriptions),'owning staff can read subscription table with no configuration');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','Ungated enrollment','1234') ? 'student','unconfigured subscription does not gate enrollment');
WITH changed AS (INSERT INTO public.classes(school_id,teacher_id,name,join_code) VALUES('10000000-0000-0000-0000-000000000000',auth.uid(),'Ungated class','UNGATED1') RETURNING id) SELECT saas_test.ok((SELECT count(*)=1 FROM changed),'unconfigured subscription does not gate own class insert');
WITH changed AS (UPDATE public.classes SET name='Ungated class updated' WHERE join_code='UNGATED1' RETURNING id) SELECT saas_test.ok((SELECT count(*)=1 FROM changed),'unconfigured subscription does not gate own class update');
WITH changed AS (DELETE FROM public.classes WHERE join_code='UNGATED1' RETURNING id) SELECT saas_test.ok((SELECT count(*)=1 FROM changed),'unconfigured subscription does not gate own class delete');
SELECT set_config('request.jwt.claims','{"sub":"12222222-2222-2222-2222-222222222222","role":"authenticated","is_anonymous":true}',true);
SELECT saas_test.ok(public.import_student_progress('{"stars":29}')->>'error'='invalid_input' AND public.saas_session()->>'imported'='false','over28 import rejected without consuming onceflag');
SELECT saas_test.ok(public.import_student_progress('{"stars":28,"completedChallenges":["fake"]}')->>'error'='invalid_input','legacy import valid challenge IDs only');
SELECT saas_test.ok(public.import_student_progress('{"stars":28,"claimedMissions":["science-tour"]}')->>'error'='invalid_input','import original mission goals enforced');
SELECT saas_test.ok(public.import_student_progress('{"stars":15,"unlockedOutfits":["lubna:2"]}')->>'error'='invalid_input','import outfit threshold enforced');
SELECT saas_test.ok(public.import_student_progress('{"stars":28,"heroId":"nour","avatarId":"rocket","completedChallenges":["planet-orbits"],"claimedMissions":["first-discovery"],"unlockedOutfits":["nour:4"]}')->>'imported'='true','bounded valid legacy import succeeds once without subscription configuration');
SELECT saas_test.ok(public.import_student_progress('{"stars":0}')->'student'->>'stars'='28','second legacy import cannot reset canonical progress');
SELECT saas_test.ok(public.saas_session()->'student'->'completedChallenges' ? 'lever-balance','import preserves existing server award markers');

SELECT set_config('request.jwt.claims','{"sub":"99999999-9999-9999-9999-999999999999","role":"authenticated","is_anonymous":false}',true);
SELECT saas_test.ok((SELECT count(*)=0 FROM public.schools) AND (SELECT count(*)=0 FROM public.subscriptions) AND (SELECT count(*)=1 FROM public.profiles) AND (SELECT count(*)=0 FROM public.classes) AND (SELECT count(id)=0 FROM public.students) AND (SELECT count(*)=0 FROM public.experiment_progress),'platform admin aggregate-only, no tenant/child SQL rows');
SELECT saas_test.denied('SELECT * FROM public.events','platform admin events denied');
SELECT saas_test.denied('SELECT pin_hash FROM public.students','platform admin no PIN SELECT');
SELECT saas_test.ok(public.platform_counts()='{"schoolCount":2,"classCount":3,"studentCount":6}'::jsonb,'platform RPC returns exact numeric totals only, no school or child metadata');
SELECT saas_test.ok(public.create_student('10111111-1111-1111-1111-111111111111','Platform child','1234')->>'error'='forbidden' AND public.apply_student_action('{"type":"addStars"}')->>'error'='forbidden','platform cannot enroll/read or mutate children');
SELECT saas_test.denied('INSERT INTO public.schools(name) VALUES(''No client management'')','platform cannot provision schools through SQL');
SELECT saas_test.denied('UPDATE public.subscriptions SET status=''active''','platform cannot manage subscriptions through SQL');
SELECT saas_test.denied('INSERT INTO public.profiles(id,school_id,role) VALUES(''66666666-6666-6666-6666-666666666666'',''10000000-0000-0000-0000-000000000000'',''teacher'')','platform cannot assign staff through SQL');
SELECT saas_test.ok(NOT (public.saas_session() ? 'subscription') AND public.saas_session()->'student'='null'::jsonb,'platform session has no child or subscription metadata');

SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims','{"role":"anon"}',true);
SELECT saas_test.denied('SELECT * FROM public.schools','anon schools denied');
SELECT saas_test.denied('SELECT * FROM public.profiles','anon profiles denied');
SELECT saas_test.denied('SELECT * FROM public.classes','anon classes denied');
SELECT saas_test.denied('SELECT id FROM public.students','anon students denied');
SELECT saas_test.denied('SELECT * FROM public.experiment_progress','anon progress denied');
SELECT saas_test.denied('SELECT * FROM public.subscriptions','anon subscription denied');
SELECT saas_test.denied('SELECT * FROM public.events','anon legacy events reads closed');
SELECT saas_test.denied('INSERT INTO public.events(event_name,session_id) VALUES(''probe'',''probe'')','legacy anonymous ingestion closed');
SELECT saas_test.denied('SELECT public.student_login(''CLASSA1'',''Explorer A'',''1234'')','anon role cannot execute PIN login (anonymous Auth must use authenticated)');
SELECT saas_test.denied('SELECT public.platform_counts()','anon role cannot execute platform counts');
RESET ROLE;
-- Even privileged writes cannot bypass the nickname CHECK. Each failing UPDATE
-- rolls back in its exception subtransaction; existing student data is preserved.
DO $$ DECLARE bad text; BEGIN
  FOREACH bad IN ARRAY ARRAY['kid@example.com','0501234567','https://a.co','A',E'Star\nKid',U&'Star\202EKid',U&'Cafe\0301_7','_.-123'] LOOP
    BEGIN
      UPDATE public.students SET nickname=bad WHERE id='13111111-1111-1111-1111-111111111111';
    EXCEPTION WHEN check_violation THEN
      PERFORM saas_test.ok(true,'table nickname CHECK rejects ' || quote_literal(bad));
      CONTINUE;
    END;
    RAISE EXCEPTION 'FAIL: table nickname CHECK accepted %',quote_literal(bad);
  END LOOP;
END $$;
SELECT saas_test.fk_denied('INSERT INTO public.classes(school_id,teacher_id,name,join_code) VALUES(''10000000-0000-0000-0000-000000000000'',''21111111-1111-1111-1111-111111111111'',''badFK'',''BADFK1'')','classes teacher compositeFK cannot cross schools');
SELECT saas_test.fk_denied('INSERT INTO public.students(school_id,class_id,nickname,pin_hash) VALUES(''10000000-0000-0000-0000-000000000000'',''20111111-1111-1111-1111-111111111111'',''badFK'',extensions.crypt(''1234'',extensions.gen_salt(''bf'',12)))','student class compositeFK cannot cross schools');
SELECT saas_test.fk_denied('INSERT INTO public.experiment_progress(student_id,school_id,experiment_id) VALUES(''23111111-1111-1111-1111-111111111111'',''10000000-0000-0000-0000-000000000000'',''planet-orbits'')','progress student compositeFK cannot cross schools');
ROLLBACK;
\echo 'ALL Phase5A RLS/RPC assertions passed (synthetic fixture rolled back).'
