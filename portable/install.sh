#!/usr/bin/env bash
set -euo pipefail

echo "========================================"
echo "  ProjectHub - Offline Installer (Unix)"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Download and install Node.js from: https://nodejs.org/"
  echo "Choose the LTS version for your operating system."
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js 18+ is required. You have: $(node -v)"
  echo "Download from: https://nodejs.org/"
  exit 1
fi

echo "[1/3] Node.js $(node -v) detected ✓"
echo "[2/3] Installing dependencies..."
cd "$(dirname "$0")/.."
npm install 2>&1 | tail -1
echo "[3/3] Building application..."
npx next build 2>&1 | tail -5

echo ""
echo "========================================"
echo "  INSTALLATION COMPLETE!"
echo "========================================"
echo ""
echo "To start ProjectHub, run:"
echo "  ./portable/start.sh"
echo ""
echo "Then open: http://localhost:3000"
echo "Login: Admin / newday"
echo "========================================"