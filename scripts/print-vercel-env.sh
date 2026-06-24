#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${1:-worker-db}"

if ! command -v turso >/dev/null 2>&1; then
  echo "Install Turso CLI: https://docs.turso.tech/cli/introduction"
  exit 1
fi

echo "Using Turso database: $DB_NAME"
echo
echo "Add these to Vercel → Project → Settings → Environment Variables"
echo "(Production, Preview, and Development):"
echo
echo "DATABASE_URL=$(turso db show "$DB_NAME" --url)"
echo "DATABASE_AUTH_TOKEN=$(turso db tokens create "$DB_NAME")"
echo
echo "Then redeploy and open /api/health on your Vercel URL."
