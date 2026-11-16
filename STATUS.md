# Last updated: 2026-11-16 13:39 EET — Current step: 5 complete; 3/6/7 verification

| Step | Status | Commit hash | Evidence / limits |
|---|---|---|---|
| 1. Baseline and STATUS | Done (verified) | ce2b317 | Pinned install and fresh main source build passed; handoff/decisions/schema read; branch and STATUS created. |
| 2. Database migration | In progress | Pending step commit | No final acceptance claim yet. |
| 3. RLS isolation proof | In progress | Pending step commit | No final acceptance claim yet. |
| 4. Student PIN and staff email Auth | Done (verified) | 4d21887 | 27/27 auth/API tests passed; real Supabase transport uses stubs only, NOT remote Auth. |
| 5. Guest/Supabase adapters and first import | Done (verified) | this step commit (git log -- src/lib/data-access.js) | Mock browser8-stage flow passed, once-only import/re-login and guest isolation verified; guest12→19 regression also passed. |
| 6. Bilingual/theme-aware logins, classes and roster | In progress | ce2b317 (scope/status) | Bilingual school screens build; browser staff login and desktop height768 passed. Enrollment/flow and full viewport matrix pending. |
| 7. Final clean build, guest regression and school flow | Not started | Pending step commit | No final acceptance claim yet. |

## Doing now

Actual mock browser flow passed8 stages: guest earned15, teacher created a class/enrolled a pseudonymous student, first login imported15 once, school progress earned19, roster showed19/rank, re-login stayed19, and the original guest stayed15. Saving adapter/session step; subscription features remain deferred.

Mode: **mock, not real Supabase**. Real Supabase RLS and Auth have NOT run.

## Remaining

2. [ ] Database migration.
3. [ ] RLS isolation proof.
6. [ ] Bilingual/theme-aware logins, classes and roster.
7. [ ] Final clean build, guest regression and school flow.

## Blockers and decisions I need from the owner

No decision is needed to finish the authorized mock. Real Supabase testing is unavailable until SUPABASE_URL and SUPABASE_ANON_KEY are supplied in ignored .env, the migration is applied and anonymous Auth is enabled. Secrets must not be committed. The local PostgreSQL proof is supplemental, not a remote Supabase result.

## How to resume

Pull origin/saas-foundation, read STATUS.md first, then DECISIONS.md, historical HANDOFF.md, supabase/schema.sql and docs/saas evidence. Do not recreate the branch from main or regenerate heroes. Use pnpm11.25.0 install --frozen-lockfile and pnpm build. For development start pnpm dev:api (internal3002) and pnpm dev (3000). Both Supabase values absent selects the labeled mock; partial configuration fails closed. Keep only the seven steps: no subscription gate, payments, parent accounts or analytics. Do not touch main or force-push. Reuse test evidence instead of repeating completed checks.
