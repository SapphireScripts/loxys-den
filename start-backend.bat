@echo off
echo Starting Loxys Den backend...
cd /d "%~dp0backend"

if not exist "node_modules\express" (
    echo Installing dependencies first...
    call npm install
    echo.
)

node server.js
pause
