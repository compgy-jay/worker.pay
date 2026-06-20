@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0.."
set DIST=dist\ProjectHub

echo ========================================
echo   ProjectHub - Building Distribution
echo ========================================
echo.

rem Clean
if exist dist rmdir /s /q dist

echo [1/5] Installing production dependencies...
call npm install

echo [2/5] Building Next.js standalone...
call npx next build

echo [3/5] Copying standalone output...
mkdir "%DIST%"
xcopy /E /I /Y .next\standalone\* "%DIST%\"
mkdir "%DIST%\.next\static"
xcopy /E /I /Y .next\static "%DIST%\.next\static"
if exist public (
  xcopy /E /I /Y public "%DIST%\public"
)

copy portable\start.bat "%DIST%\"
copy portable\README.txt "%DIST%\"
if exist local.db copy local.db "%DIST%\"

echo [4/5] Creating ZIP archive...
cd dist
powershell -Command "Compress-Archive -Path ProjectHub -DestinationPath ProjectHub-%npm_package_version%.zip"

echo [5/5] Complete!
echo.
echo Distribution: dist\ProjectHub-%npm_package_version%.zip
echo.
echo To install on another system:
echo   1. Extract the ZIP
echo   2. Double-click start.bat
echo   3. Open http://localhost:3000
echo   4. Login: Admin / newday
echo.
echo Prerequisites: Node.js 18+ on the target system
echo ========================================
pause