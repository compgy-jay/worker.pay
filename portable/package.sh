#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
DIST="$DIR/dist/ProjectHub"
VERSION=$(node -e "console.log(require('./package.json').version)")

echo "========================================"
echo "  ProjectHub - Building Distribution"
echo "========================================"
echo ""

# Clean
rm -rf dist

echo "[1/5] Installing dependencies..."
npm install

echo "[2/5] Building Next.js standalone..."
npx next build

echo "[3/5] Copying standalone output..."
mkdir -p "$DIST"
cp -r .next/standalone/.next "$DIST/"
cp -r .next/standalone/node_modules "$DIST/"
cp .next/standalone/package.json "$DIST/"
cp .next/standalone/server.js "$DIST/"
cp -r public "$DIST/public" 2>/dev/null || true

# Copy portable scripts
cp portable/start.sh "$DIST/"
cp portable/start.bat "$DIST/"
cp portable/README.txt "$DIST/"

# Copy DB (if exists) so first run has the schema
cp local.db "$DIST/" 2>/dev/null || true

echo "[4/5] Creating archives..."
cd dist

# Create tar.gz (Unix)
tar czf "ProjectHub-${VERSION}.tar.gz" ProjectHub/

# Create zip (Windows/Unix)
if command -v zip &>/dev/null; then
  zip -r "ProjectHub-${VERSION}.zip" ProjectHub/
fi

echo "[5/5] Complete!"
echo ""
echo "========================================"
echo "  DISTRIBUTION FILES"
echo "========================================"
ls -lh "ProjectHub-${VERSION}.tar.gz" 2>/dev/null || true
ls -lh "ProjectHub-${VERSION}.zip" 2>/dev/null || true
echo ""
echo "To install on another system:"
echo "  1. Extract the archive"
echo "  2. Run: ./ProjectHub/start.sh (Unix) or start.bat (Windows)"
echo "  3. Open http://localhost:3000"
echo "  4. Login: Admin / newday"
echo ""
echo "Prerequisites: Node.js 18+ on the target system"
echo "========================================"