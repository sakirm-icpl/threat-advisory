@echo off
REM Make a user an admin in VersionIntel Community Platform

echo ========================================
echo   VersionIntel Community Platform      
echo           Make User Admin             
echo ========================================

REM Check if we're in the right directory
if not exist "docker-compose.yml" (
    echo Error: docker-compose.yml not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

echo [INFO] Starting database container if not running...
docker-compose up -d db

echo [INFO] Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo [INFO] Running make admin script...
docker-compose run --rm backend python make_admin.py %*

echo [INFO] Script completed!

pause