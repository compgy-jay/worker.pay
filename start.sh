#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

export DATABASE_URL="${DATABASE_URL:-file:local.db}"
PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"

if [ "${1:-}" = "--prod" ]; then
  echo "==> Production mode"
  if [ ! -d .next ]; then
    echo "Build not found. Running build..."
    npm install && npx next build
  fi
  echo "    Open: http://localhost:${PORT}"
  echo "    Login: Admin / newday"
  exec npx next start -p "$PORT" -H "$HOST"
fi

echo "==> Development mode (hot reload)"
echo "    Open: http://localhost:${PORT}"
echo "    Login: Admin / newday"
npx next dev -p "$PORT" -H "$HOST"
