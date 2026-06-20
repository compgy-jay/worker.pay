@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   ProjectHub - Offline Installer (Windows)
echo ========================================
echo.

rem Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo ERROR: Node.js is not installed.
  echo Download and install Node.js from: https://nodejs.org/
  echo Choose the LTS version for Windows.
  pause
  exit /b 1
)

for /f "tokens=1 delims=v." %%a in ('node -v') do set NODE_MAJOR=%%a
if %NODE_MAJOR% lss 18 (
  echo ERROR: Node.js 18+ is required. You have: %NODE_MAJOR%
  echo Download from: https://nodejs.org/
  pause
  exit /b 1
)

echo [1/3] Node.js detected: 
node -v
echo [2/3] Installing dependencies...
cd /d "%~dp0.."
call npm install
echo [3/3] Building application...
call npx next build

echo.
echo ========================================
echo   INSTALLATION COMPLETE!
echo ========================================
echo.
echo To start ProjectHub, double-click:
echo   portable\start.bat
echo.
echo Then open: http://localhost:3000
echo Login: Admin / newday
echo ========================================
pause