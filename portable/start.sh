#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"
export DATABASE_URL="${DATABASE_URL:-file:local.db}"

echo "========================================"
echo "  ProjectHub - Starting Server"
echo "========================================"
echo "  Port:      $PORT"
echo "  Database:  $DATABASE_URL"
echo "  Mode:      Offline (local SQLite)"
echo "========================================"
echo ""
echo "Open: http://localhost:$PORT"
echo "Login: Admin / newday"
echo ""

if [ ! -d "$DIR/.next/standalone" ]; then
  echo "Build not found. Running build..."
  npm install && npx next build
fi

export PORT
exec node .next/standalone/server.js