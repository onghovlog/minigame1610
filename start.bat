@echo off
title Web Multiverse Starter
echo Dang khoi dong Web Multiverse...
start "Web Multiverse Server" cmd /k "node server.js"

echo.
echo ======================================================
echo   DANG CHAY THANH CONG!
echo   - Link nguoi choi: http://localhost:3000/
echo   - Link Admin:      http://localhost:3000/admin.html
echo   - Link WiFi (LAN): http://192.168.1.8:3000/
echo ======================================================
echo.
timeout /t 2 >nul
start http://localhost:3000/
