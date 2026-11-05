@echo off
setlocal

echo ========================================
echo Character Studio Launcher
echo ========================================

echo.
echo [1/4] Cleaning orphan processes...

taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM character-studio-core.exe /T >nul 2>&1
taskkill /F /IM character-studio.exe /T >nul 2>&1

echo.
echo [2/4] Waiting for cleanup...
timeout /t 2 /nobreak >nul

echo.
echo [3/4] Entering src-tauri...

cd /d "%~dp0src-tauri"

echo.
echo [4/4] Starting Character Studio...

cargo tauri dev

:: Keep terminal open if the process exits with an error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Character Studio launch failed.
    echo Please review the logs above.
    pause
    exit /b %ERRORLEVEL%
)

echo [INFO] Character Studio closed successfully.
