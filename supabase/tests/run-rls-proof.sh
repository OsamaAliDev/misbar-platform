#!/usr/bin/env bash
set -euo pipefail
# Explicitly local Unix socket only: no URL, remote credentials or environment DB.
# npm run test:rls needs no flags; the optional flag documents the local reset.
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
if [[ $# -gt 1 || ( -n "${1:-}" && "${1:-}" != "--reset-local-test-db" ) ]]; then
  printf '%s\n' 'Usage: bash supabase/tests/run-rls-proof.sh [--reset-local-test-db]' >&2
  exit 2
fi
printf '%s\n' 'LOCAL supplemental proof only (stub auth/JWT); real Supabase RLS NOT run.'
printf '%s\n' 'Scope: tenant ownership, student PIN security, aggregate platform counts; subscription gates/management deferred.'
printf '%s\n' 'Resetting ONLY local misbar_rls_test on PostgreSQL16 port5432 (synthetic data).'
sudo pg_ctlcluster 16 main start 2>/dev/null || sudo pg_ctlcluster 16 main status >/dev/null
if ! sudo -u postgres psql -X -h /var/run/postgresql -p 5432 -d postgres -Atqc "SELECT 1 FROM pg_database WHERE datname='misbar_rls_test'" | grep -qx 1; then
  sudo -u postgres createdb -h /var/run/postgresql -p 5432 misbar_rls_test
fi
bash "$ROOT/supabase/tests/run-regressions.sh"
sudo -u postgres psql -X -h /var/run/postgresql -p 5432 -d misbar_rls_test -v ON_ERROR_STOP=1 -f supabase/tests/bootstrap.sql -f supabase/migrations/20261116_saas_foundation.sql -f supabase/tests/rls-proof.sql
printf '%s\n' 'LOCAL supplemental RLS/RPC proof completed successfully; real Supabase RLS NOT run (credentials unavailable).'
