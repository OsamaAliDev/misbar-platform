# Last updated: 2026-11-16 13:32 EET — Current step: 2–6 implementation; revised scope applied

| Step | Status | Commit hash | Evidence / limits |
|---|---|---|---|
| 1. Baseline, handoff/decisions/schema read, branch and STATUS | Done (verified) | 34c6b88 | Fresh main source built successfully; pinned install succeeded. saas-foundation created from main e1bad49. |
| 2. Database migration | In progress | Pending step commit | SQL has run locally; now removing the subscription gate explicitly deferred by the latest guidance. |
| 3. RLS and isolation proof | In progress | Pending step commit | Local PostgreSQL proof exists. NOT run on real Supabase: SUPABASE_URL and SUPABASE_ANON_KEY are absent. |
| 4. Student PIN auth and staff email Auth | In progress | Pending step commit | Browser teacher login against the labeled mock was verified. Real Supabase Auth has NOT run. |
| 5. Guest/Supabase data-access adapters and once-only import | In progress | Pending step commit | Guest and school progress paths implemented; integrated flow still to run. |
| 6. Bilingual/theme-aware logins, classes and roster | In progress | Pending step commit | Build and desktop staff login succeeded; viewport matrix and enrollment flow remain. |
| 7. Final clean build, guest regression and school flow | Not started | Pending step commit | No final acceptance claim yet. |

## Doing now

Applying the newly attached seven-step scope. Subscription gating, student-limit enforcement and manual subscription-management screens/RPCs are deferred. The subscriptions schema and its RLS remain. Completing the local mock/Auth transport, secure PIN verification, once-only guest import and school UI; then running targeted browser and database checks. Mode: **mock, not real Supabase**.

## Remaining

1. Finish the revised SQL migration and local PostgreSQL isolation checks; clearly mark real Supabase RLS as NOT run.
2. Verify and commit the server-side PIN/email mock flows and Supabase transport contracts.
3. Verify once-only import and unchanged guest progress across login/logout.
4. Verify Arabic/English and light/night logins, class creation/join code and roster at desktop/tablet/phone widths.
5. Run a real browser flow against the mock: create class, enroll pseudonymous student, log in, earn stars, teacher sees stars/rank.
6. Clean install/build, guest regression, screenshots and final Verified / NOT verified report.
7. Push each small step and STATUS.md to saas-foundation only. Never touch main or force-push.

## Blockers and decisions I need from the owner

No decision is needed to continue the authorized local mock. Real Supabase execution is unavailable until the owner puts SUPABASE_URL and SUPABASE_ANON_KEY in the ignored .env, applies the migration and enables anonymous Auth. Secrets must not be committed. This does not block finishing the mock foundation.

## How to resume

Pull origin/saas-foundation and read STATUS.md first, then HANDOFF.md (historical), DECISIONS.md and supabase/schema.sql. Do not restart from main or regenerate existing assets. Read the current migration and docs/saas evidence before repeating tests. Use pnpm 11.25.0 install --frozen-lockfile and pnpm build. Start pnpm dev:api on internal3002 and pnpm dev on3000; mock is selected only when both Supabase values are missing. Keep the scope to the seven steps: no subscription gate, payments, parent accounts or analytics. Local PostgreSQL tests are supplemental, NOT remote Supabase verification.
