# Last updated: 2026-11-16 13:48 EET — Current step: 7 targeted regression checks

| Step | Status | Commit hash | Evidence / limits |
|---|---|---|---|
| 1. Baseline and STATUS | Done (verified) | ce2b317 | Pinned install and fresh main source build passed; handoff/decisions/schema read; branch and STATUS created. |
| 2. Database migration | Done (verified) | db7eb02 | Local PostgreSQL migration applied; adding explicit experiment_progress.stars before final proof. Real Supabase deployment NOT run. |
| 3. RLS isolation proof | In progress | Pending step commit | No final acceptance claim yet. |
| 4. Student PIN and staff email Auth | Done (verified) | 4d21887 | 27/27 auth/API tests passed; real Supabase transport uses stubs only, NOT remote Auth. |
| 5. Guest/Supabase adapters and first import | Done (verified) | ada4373 | Actual mock8-stage school flow passed; guest15 stayed unchanged while school earned19 and re-login did not import again. |
| 6. Bilingual/theme-aware logins, classes and roster | Done (verified) | f20e705 | 80/80 mock-auth UI viewport cases plus browser enrollment/roster flow passed; lifecycle regression fixes being added under finalQA. |
| 7. Final clean build, guest regression and school flow | In progress | pending lifecycle/QA commit | Happy-path school/guest flows passed after fixes; targeted delayed-response checks and final clean production acceptance still pending. |

## Doing now

Auth guards now clear logout immediately, bind late results to login generation/captured token, and block guest writes during credential restoration. Full mock class/import/earn/roster flow and guest reward flow passed again using the real logout button. Targeted delayed-response tests and database pseudonym validation are finishing before the clean-clone production check.

Mode: **mock, not real Supabase**. Real Supabase RLS and Auth have NOT run.

## Remaining

3. [ ] RLS isolation proof.
7. [ ] Final clean build, guest regression and school flow.

## Blockers and decisions I need from the owner

No decision is needed to finish the authorized mock. Real Supabase testing is unavailable until SUPABASE_URL and SUPABASE_ANON_KEY are supplied in ignored .env, the migration is applied and anonymous Auth is enabled. Secrets must not be committed. The local PostgreSQL proof is supplemental, not a remote Supabase result.

## How to resume

Pull origin/saas-foundation, read STATUS.md first, then DECISIONS.md, historical HANDOFF.md, supabase/schema.sql and docs/saas evidence. Do not recreate the branch from main or regenerate heroes. Use pnpm11.25.0 install --frozen-lockfile and pnpm build. For development start pnpm dev:api (internal3002) and pnpm dev (3000). Both Supabase values absent selects the labeled mock; partial configuration fails closed. Keep only the seven steps: no subscription gate, payments, parent accounts or analytics. Do not touch main or force-push. Reuse test evidence instead of repeating completed checks.
