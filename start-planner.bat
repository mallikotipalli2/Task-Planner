@echo off
:: Daily Planner — Auto-Start Script
:: Starts the Vite dev server in background and opens the browser.

cd /d "%~dp0"

:: Check if server is already running on port 3000
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    :: Server already running, just open the browser
    start "" http://localhost:3000
    exit /b
)

:: Start the dev server silently in the background
start "" /min cmd /c "cd /d "%~dp0" && npx vite --port 3000"

:: Wait a moment for the server to spin up
timeout /t 3 /nobreak >nul

:: Open in default browser
start "" http://localhost:3000
