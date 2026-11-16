\set ON_ERROR_STOP on
-- DESTRUCTIVE local test fixture. Never run on an application database.
DO $$ BEGIN
  IF current_database() <> 'misbar_rls_test' OR current_user <> 'postgres' THEN
    RAISE EXCEPTION 'bootstrap is restricted to postgres on local misbar_rls_test';
  END IF;
END $$;
DROP SCHEMA IF EXISTS saas_test CASCADE;
DROP SCHEMA IF EXISTS saas_private CASCADE;
DROP SCHEMA IF EXISTS public CASCADE;
DROP SCHEMA IF EXISTS auth CASCADE;
DROP SCHEMA IF EXISTS extensions CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO PUBLIC;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN NOSUPERUSER NOBYPASSRLS; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN NOSUPERUSER NOBYPASSRLS; END IF;
END $$;
CREATE SCHEMA auth;
CREATE TABLE auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_anonymous boolean NOT NULL DEFAULT false,
  raw_user_meta_data jsonb NOT NULL DEFAULT '{}',
  raw_app_meta_data jsonb NOT NULL DEFAULT '{}'
);
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE SET search_path=pg_catalog AS $$
  SELECT COALESCE(NULLIF(current_setting('request.jwt.claims',true),''),'{}')::jsonb
$$;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE SET search_path=pg_catalog AS $$
  SELECT NULLIF(auth.jwt()->>'sub','')::uuid
$$;
REVOKE ALL ON auth.users FROM PUBLIC,anon,authenticated;
GRANT USAGE ON SCHEMA auth TO anon,authenticated;
GRANT EXECUTE ON FUNCTION auth.uid(),auth.jwt() TO anon,authenticated;
\ir ../schema.sql
