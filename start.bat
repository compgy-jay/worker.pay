@echo off
setlocal
set DATABASE_URL=file:local.db
set PORT=3000
set HOST=0.0.0.0
cd /d "%~dp0"
if not exist ".next\standalone" (
  echo Build not found. Running first-time setup...
  call npm install
  call npx next build
)
echo ========================================
echo   ProjectHub - Starting
echo   Open: http://localhost:%PORT%
echo   Login: Admin / newday
echo ========================================
node .next\standalone\server.js
pause