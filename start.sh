#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export DATABASE_URL="${DATABASE_URL:-file:local.db}"
if [ ! -d .next/standalone ]; then
  echo "Build not found. Running first-time setup..."
  npm install && npx next build
fi
PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"
echo "========================================"
echo "  ProjectHub - Starting"
echo "  Open: http://localhost:${PORT}"
echo "  Login: Admin / newday"
echo "========================================"
export PORT
exec node .next/standalone/server.js