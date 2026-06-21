@echo off
setlocal
set DATABASE_URL=file:local.db
set PORT=3000
set HOST=0.0.0.0
cd /d "%~dp0"

if "%1"=="--prod" (
  echo ==== Production mode ====
  if not exist ".next" (
    echo Build not found. Running setup...
    call npm install
    call npx next build
  )
  echo    Open: http://localhost:%PORT%
  echo    Login: Admin / newday
  npx next start -p %PORT% -H %HOST%
  pause
  exit /b
)

echo ==== Development mode (hot reload) ====
echo    Open: http://localhost:%PORT%
echo    Login: Admin / newday
npx next dev -p %PORT% -H %HOST%
pause
