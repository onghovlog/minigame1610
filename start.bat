@echo off
title Web Multiverse Starter
echo Dang khoi dong Web Multiverse...
echo 1. Chay Mock API Backend (Port 3000)...
start "JSON Server API" cmd /k "npx --yes json-server@0.17.4 --watch db.json --port 3000 --host 0.0.0.0"

echo 2. Chay Frontend Server (Port 5000)...
start "Frontend Web Server" cmd /k "npx --yes serve -l 5000 ."

echo.
echo ======================================================
echo   DANG CHAY THANH CONG!
echo   - Link nguoi choi: http://localhost:5000/
echo   - Link Admin:      http://localhost:5000/admin.html
echo   - Link WiFi (LAN): http://192.168.1.8:5000/
echo ======================================================
echo.
timeout /t 3 >nul
start http://localhost:5000/
