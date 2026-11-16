# Last updated: 2026-11-16 13:38 EET — Current step: 4 complete; 3/5/6/7 verification

| Step | Status | Commit hash | Evidence / limits |
|---|---|---|---|
| 1. Baseline and STATUS | Done (verified) | ce2b317 | Pinned install and fresh main source build passed; handoff/decisions/schema read; branch and STATUS created. |
| 2. Database migration | In progress | Pending step commit | No final acceptance claim yet. |
| 3. RLS isolation proof | In progress | Pending step commit | No final acceptance claim yet. |
| 4. Student PIN and staff email Auth | Done (verified) | this step commit (git log -- server) | 27/27 backend tests passed; mock browser teacher/student login and enrollment worked. Supabase calls tested with stubs only, NOT real Supabase. |
| 5. Guest/Supabase adapters and first import | In progress | Pending step commit | No final acceptance claim yet. |
| 6. Bilingual/theme-aware logins, classes and roster | In progress | ce2b317 (scope/status) | Bilingual school screens build; browser staff login and desktop height768 passed. Enrollment/flow and full viewport matrix pending. |
| 7. Final clean build, guest regression and school flow | Not started | Pending step commit | No final acceptance claim yet. |

## Doing now

The reduced-scope auth API passed27/27 tests, including server PIN hashing/rate limits, role/tenant ownership, exact Supabase transport stubs and no secret leakage. Saving auth step; real Supabase has NOT run. Browser flow already showed15→19 canonical school stars and teacher roster while guest storage stayed15.

Mode: **mock, not real Supabase**. Real Supabase RLS and Auth have NOT run.

## Remaining

2. [ ] Database migration.
3. [ ] RLS isolation proof.
5. [ ] Guest/Supabase adapters and first import.
6. [ ] Bilingual/theme-aware logins, classes and roster.
7. [ ] Final clean build, guest regression and school flow.

## Blockers and decisions I need from the owner

No decision is needed to finish the authorized mock. Real Supabase testing is unavailable until SUPABASE_URL and SUPABASE_ANON_KEY are supplied in ignored .env, the migration is applied and anonymous Auth is enabled. Secrets must not be committed. The local PostgreSQL proof is supplemental, not a remote Supabase result.

## How to resume

Pull origin/saas-foundation, read STATUS.md first, then DECISIONS.md, historical HANDOFF.md, supabase/schema.sql and docs/saas evidence. Do not recreate the branch from main or regenerate heroes. Use pnpm11.25.0 install --frozen-lockfile and pnpm build. For development start pnpm dev:api (internal3002) and pnpm dev (3000). Both Supabase values absent selects the labeled mock; partial configuration fails closed. Keep only the seven steps: no subscription gate, payments, parent accounts or analytics. Do not touch main or force-push. Reuse test evidence instead of repeating completed checks.
