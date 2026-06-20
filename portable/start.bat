@echo off
setlocal

set PORT=3000
set HOST=0.0.0.0
set DATABASE_URL=file:local.db

echo ========================================
echo   ProjectHub - Starting Server
echo ========================================
echo   Port:      %PORT%
echo   Database:  %DATABASE_URL%
echo   Mode:      Offline (local SQLite)
echo ========================================
echo.
echo Open: http://localhost:%PORT%
echo Login: Admin / newday
echo.

cd /d "%~dp0.."

if not exist ".next\standalone" (
  echo Build not found. Running build...
  call npm install
  call npx next build
)

node .next\standalone\server.js
pause