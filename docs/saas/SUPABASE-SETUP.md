# Real Supabase setup — NOT executed in this run

The delivered foundation has been verified with a labeled local HTTP mock and supplemental PostgreSQL tests. **Real Supabase Auth, PostgREST and RLS have NOT been executed** because neither SUPABASE_URL nor SUPABASE_ANON_KEY was supplied. Do not treat the local proof as a hosted Supabase result.

## 1. Private server environment

Copy `.env.example` to the ignored `.env`. For real operation, uncomment and set both values below; they must be nonempty. Do not use VITE_ prefixes, commit `.env`, paste credentials into STATUS.md, or use a service-role key in the browser.

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_PROJECT_ANON_KEY
PORT=3000
ALLOW_MOCK=false
# If a trusted reverse proxy changes Host, set your exact public origin:
# APP_ORIGIN=https://your-existing-host.example
```

For local mock development, **omit both Supabase variables**, including the ANON_KEY alias. Setting blank or only one value fails closed. Run `pnpm dev:api` and `pnpm dev`; the school screens must visibly say local mock. An intentionally demonstrated production mock requires explicit `ALLOW_MOCK=true` and is not a school production database.

## 2. Schema and identity prerequisites

Use a nonproduction Supabase project for initial verification. If the original scaffold has not been applied, apply `supabase/schema.sql`, then **immediately** apply `supabase/migrations/20261116_saas_foundation.sql` as the trusted database owner. The forward migration closes the scaffold's old anonymous events access and enables RLS on all application tables. Do not run the old scaffold again after the migration, because it would restore its obsolete anonymous events policy.

The migration is a forward, one-time migration—not an idempotent seed. Existing profiles with unsupported/NULL/parent roles or populated legacy classes with no school mapping deliberately abort instead of silently changing identities or losing data. Resolve those records explicitly as the owner in a backup/test project before applying it. Do not rerun the local reset runner against a real database.

Enable **anonymous sign-ins** in Supabase Auth for children; children have no email, phone, legal-name or photo fields. Manually create and verify the staff email/password Auth accounts in Supabase's dashboard. Role metadata submitted by a client cannot provision a teacher or admin.

## 3. Trusted operator bootstrap example

Replace every UUID below with an existing Auth user ID copied from your own Supabase Auth dashboard. This is owner-only SQL, not an API endpoint or a new management screen. Never use placeholder IDs in production.

```sql
BEGIN;
-- Owner/platform administrator has no school binding and no child-row access.
INSERT INTO public.profiles(id, role, school_id, display_name)
VALUES ('REPLACE_PLATFORM_AUTH_UUID'::uuid, 'platform_admin', NULL, NULL);

-- Create one tenant and bind existing verified staff Auth identities.
WITH new_school AS (
  INSERT INTO public.schools(name) VALUES ('School display name') RETURNING id
)
INSERT INTO public.profiles(id, role, school_id, display_name)
SELECT 'REPLACE_TEACHER_AUTH_UUID'::uuid, 'teacher', id, NULL FROM new_school;

-- Optional existing school admin: use the created school UUID.
INSERT INTO public.profiles(id, role, school_id, display_name)
VALUES ('REPLACE_SCHOOL_ADMIN_AUTH_UUID'::uuid, 'school_admin',
        'REPLACE_CREATED_SCHOOL_UUID'::uuid, NULL);
COMMIT;
```

The subscriptions table is schema-only in this run. No subscription gate, capacity enforcement, online payment, parent account or analytics dashboard has been implemented. It is not necessary to insert a subscription for class creation, enrollment or earning stars.

## 4. Start and verify real operation

After supplying the private environment and applying the schema:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

`GET /api/saas/config` must return `{mode:"supabase",configured:true}`. It does not return keys. Log in through the teacher screen with a verified staff email account, create a class, record the generated join code, enroll a made-up nickname with a privately shared four-digit PIN, sign out, and log the child in through class code/nickname/PIN. Earn a challenge star through the experiment UI, then sign the teacher in and confirm the roster's stars/rank. Guest progress should remain unchanged when a child logs in/out; the first import is once per child.

## 5. RLS proof limits and safe execution

`supabase/tests/bootstrap.sql` and `run-rls-proof.sh` are **local test scaffolding only**: they create/reset an isolated test database and Auth/JWT stubs. Never execute either in a real Supabase project.

`supabase/tests/rls-proof.sql` is the synthetic assertion body. It assumes the migration is installed and is run as an owner capable of preparing fixtures and switching to non-bypass client roles; the fixture transaction rolls back. A hosted Supabase proof still requires a test-project-specific fixture/JWT setup and genuine Auth/PostgREST tests. It was **NOT run remotely here**. The local result is recorded in `rls-local-proof.txt`/`rls-local-summary.txt`, not claimed as remote evidence.

Before a real school pilot, verify actual GoTrue anonymous signup, email Auth, PostgREST grants/projections, cross-school reads/writes, other-teacher classes, child-only rows, persisted PIN lockout, role provisioning, first import, concurrent claims, and logout/rebinding. Arrange owner backups and deployment-specific abuse controls. The Node peer limiter does not trust forwarded IP headers; a reverse proxy may share one peer quota. CAPTCHA and appropriate network protection can be configured in Supabase separately.

Student nicknames must be pseudonyms chosen by staff. Syntax validation rejects contact-style strings and does not make it possible to detect whether a valid-looking nickname is actually a real name. Existing browser totals are an explicitly bounded legacy import concession, not an attestation that an experiment was performed.
