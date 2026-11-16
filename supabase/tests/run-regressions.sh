#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
PSQL=(sudo -u postgres psql -X -h /var/run/postgresql -p 5432 -d misbar_rls_test -v ON_ERROR_STOP=1)
TMP="$(mktemp -d)"
printf '%s\n' 'Running LOCAL PostgreSQL supplemental regressions only; real Supabase RLS NOT run.'
trap 'rc=$?; if [[ $rc != 0 ]]; then for log in "$TMP"/*.log; do echo "--- $log" >&2; tail -25 "$log" >&2; done; fi; rm -rf "$TMP"' EXIT
# Each bootstrap independently checks the database name and postgres owner.
"${PSQL[@]}" -f supabase/tests/bootstrap.sql > "$TMP/bootstrap.log" 2>&1
"${PSQL[@]}" -qc "INSERT INTO public.profiles(id,role) VALUES('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','parent')"
if "${PSQL[@]}" -f supabase/migrations/20261116_saas_foundation.sql > "$TMP/parent.log" 2>&1; then
  echo 'FAIL: legacy parent migration succeeded' >&2; exit 1
fi
grep -q 'unsupported legacy profile role' "$TMP/parent.log"
echo 'PASS: legacy parent clearly rejected; no elevation'
"${PSQL[@]}" -f supabase/tests/bootstrap.sql > "$TMP/bootstrap.log" 2>&1
"${PSQL[@]}" -qc "INSERT INTO public.profiles(id,role) VALUES('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','teacher'); INSERT INTO public.classes(teacher_id,name,join_code) VALUES('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Unmapped legacy','LEGACY')"
if "${PSQL[@]}" -f supabase/migrations/20261116_saas_foundation.sql > "$TMP/classes.log" 2>&1; then
  echo 'FAIL: unmapped legacy class migration succeeded' >&2; exit 1
fi
grep -q 'populated legacy classes have NULL school_id' "$TMP/classes.log"
echo 'PASS: populated legacy classes require explicit school mapping'
"${PSQL[@]}" -f supabase/tests/bootstrap.sql > "$TMP/bootstrap.log" 2>&1
"${PSQL[@]}" -qc "CREATE EXTENSION pgcrypto WITH SCHEMA public; INSERT INTO public.events(event_name,session_id) VALUES('synthetic-preservation','legacy')"
"${PSQL[@]}" -f supabase/migrations/20261116_saas_foundation.sql > "$TMP/migration.log" 2>&1
[[ "$("${PSQL[@]}" -Atqc "SELECT count(*) FROM public.events WHERE event_name='synthetic-preservation'")" == 1 ]]
[[ "$("${PSQL[@]}" -Atqc "SELECT saas_private.verify_pin('1234',saas_private.hash_pin('1234'))")" == t ]]
echo 'PASS: additive migration preserves events and existing public-schema pgcrypto'
# A completely separate autocommit psql per failure proves persistence, not merely
# visibility inside the transaction used by the main proof.
"${PSQL[@]}" -qc "INSERT INTO auth.users(id,is_anonymous) VALUES('88888888-8888-8888-8888-888888888888',true)"
CLAIMS='SET ROLE authenticated; SET request.jwt.claims = '\''{"sub":"88888888-8888-8888-8888-888888888888","role":"authenticated","is_anonymous":true}'\'';'
for i in 1 2 3 4 5; do
  expected=invalid_credentials
  if [[ "$i" == 5 ]]; then expected=rate_limited; fi
  [[ "$("${PSQL[@]}" -Atqc "$CLAIMS SELECT public.student_login('NONE00','Nobody','9999')->>'error'")" == "$expected" ]]
done
[[ "$("${PSQL[@]}" -Atqc 'SELECT failures FROM saas_private.pin_attempts')" == 5 ]]
[[ "$("${PSQL[@]}" -Atqc "$CLAIMS SELECT public.student_login('NONE00','Nobody','1234')->>'error'")" == rate_limited ]]
echo 'PASS: five PIN failures persist across separate committed requests; sixth rate limited'

"${PSQL[@]}" -q <<'SQL'
INSERT INTO auth.users(id,is_anonymous) VALUES
 ('91111111-1111-1111-1111-111111111111',false),
 ('92222222-2222-2222-2222-222222222222',true);
INSERT INTO public.schools(id,name) VALUES('90000000-0000-0000-0000-000000000000','Concurrency synthetic');
INSERT INTO public.profiles(id,school_id,role) VALUES('91111111-1111-1111-1111-111111111111','90000000-0000-0000-0000-000000000000','teacher');
-- No subscription configuration: enrollment and earning are deliberately ungated.
INSERT INTO public.classes(id,school_id,teacher_id,name,join_code) VALUES('93333333-3333-3333-3333-333333333333','90000000-0000-0000-0000-000000000000','91111111-1111-1111-1111-111111111111','Race','RACE00');
SQL
STAFF='SET ROLE authenticated; SET request.jwt.claims = '\''{"sub":"91111111-1111-1111-1111-111111111111","role":"authenticated","is_anonymous":false}'\'';'
"${PSQL[@]}" -Atqc "$STAFF SELECT public.create_student('93333333-3333-3333-3333-333333333333','Racer One','1234')" > "$TMP/enroll1" &
p1=$!
"${PSQL[@]}" -Atqc "$STAFF SELECT public.create_student('93333333-3333-3333-3333-333333333333','Racer Two','1234')" > "$TMP/enroll2" &
p2=$!
wait "$p1"; wait "$p2"
[[ "$("${PSQL[@]}" -Atqc "SELECT count(*) FROM public.students WHERE school_id='90000000-0000-0000-0000-000000000000'")" == 2 ]]
[[ "$("${PSQL[@]}" -Atqc 'SELECT count(*) FROM public.subscriptions')" == 0 ]]
[[ "$(cat "$TMP/enroll1" "$TMP/enroll2" | grep -c '"student":')" == 2 ]]
echo 'PASS: concurrent enrollment succeeds without subscription configuration'
"${PSQL[@]}" -qc "UPDATE public.students SET auth_user_id='92222222-2222-2222-2222-222222222222' WHERE school_id='90000000-0000-0000-0000-000000000000' AND nickname='Racer One'; INSERT INTO public.profiles(id,school_id,role) VALUES('92222222-2222-2222-2222-222222222222','90000000-0000-0000-0000-000000000000','student')"
STUDENT='SET ROLE authenticated; SET request.jwt.claims = '\''{"sub":"92222222-2222-2222-2222-222222222222","role":"authenticated","is_anonymous":true}'\'';'
"${PSQL[@]}" -Atqc "$STUDENT SELECT public.apply_student_action('{\"type\":\"completeChallenge\",\"experimentId\":\"motion-acceleration\"}')" > "$TMP/action1" &
p1=$!
"${PSQL[@]}" -Atqc "$STUDENT SELECT public.apply_student_action('{\"type\":\"completeChallenge\",\"experimentId\":\"motion-acceleration\"}')" > "$TMP/action2" &
p2=$!
wait "$p1"; wait "$p2"
[[ "$("${PSQL[@]}" -Atqc "SELECT stars FROM public.students WHERE auth_user_id='92222222-2222-2222-2222-222222222222'")" == 13 ]]
[[ "$("${PSQL[@]}" -Atqc "SELECT count(*) FROM public.experiment_progress WHERE school_id='90000000-0000-0000-0000-000000000000'")" == 1 ]]
echo 'PASS: concurrent duplicate challenge awards exactly +1 and one progress row'
# The caller resets again before the main RLS proof, removing these fixtures.
printf '%s\n' 'All 6 LOCAL supplemental regressions passed; real Supabase RLS NOT run.'
