@echo off
REM VersionIntel Simple Deployment Script
REM ====================================

set ENV=%1
if "%ENV%"=="" set ENV=prod

echo 🚀 VersionIntel Deployment
echo ============================
echo.

REM Determine configuration
if "%ENV%"=="prod" (
    set COMPOSE_FILE=docker-compose.production.yml
    set ENV_FILE=.env.production
    echo 📋 Production Mode
) else if "%ENV%"=="production" (
    set COMPOSE_FILE=docker-compose.production.yml
    set ENV_FILE=.env.production
    echo 📋 Production Mode
) else (
    set COMPOSE_FILE=docker-compose.yml
    set ENV_FILE=.env
    echo 📋 Development Mode
)

REM Check environment file
if not exist "%ENV_FILE%" (
    echo ❌ Environment file %ENV_FILE% not found!
    pause
    exit /b 1
)

echo ✅ Using: %COMPOSE_FILE% with %ENV_FILE%
echo.

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose -f %COMPOSE_FILE% down --remove-orphans 2>nul

REM Remove old images for clean build
echo 🧹 Cleaning old images...
docker rmi versionintel_backend versionintel_frontend 2>nul

REM Build and start
echo 🔨 Building and starting services...
docker-compose -f %COMPOSE_FILE% --env-file %ENV_FILE% up -d --build

REM Wait for startup
echo ⏳ Waiting for services...
timeout /t 15 /nobreak >nul

REM Show status
echo 📊 Status:
docker ps

echo.
echo ✅ Deployment Complete!
echo.
echo 🌐 Access:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo.
echo 🔑 Default Login:
echo    Username: admin
echo    Password: Admin@123
echo.
echo 📝 View logs: docker-compose -f %COMPOSE_FILE% logs -f

pause