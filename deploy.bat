@echo off
REM VersionIntel Universal Deployment Script for Windows
REM ===================================================
REM Works for both development and production environments
REM Usage: deploy.bat [dev|prod]

setlocal enabledelayedexpansion

REM Configuration
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=prod

REM Environment-specific configuration
if "%ENVIRONMENT%"=="dev" (
    set ENV_FILE=.env
    set COMPOSE_FILE=docker-compose.yml
    set FRONTEND_URL=http://localhost:3000
    set BACKEND_URL=http://localhost:5000
    echo [INFO] 🔧 Development Environment
) else (
    set ENV_FILE=.env.production
    set COMPOSE_FILE=docker-compose.production.yml
    set FRONTEND_URL=http://172.17.14.65:3000
    set BACKEND_URL=http://172.17.14.65:8000
    echo [INFO] 🚀 Production Environment
)

echo.
echo ═══════════════════════════════════
echo     VersionIntel Deployment
echo ═══════════════════════════════════
echo.

REM Check prerequisites
echo [INFO] Checking prerequisites...

docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not available.
    pause
    exit /b 1
)

echo [SUCCESS] Prerequisites OK

REM Environment setup
echo [INFO] Setting up environment...

if not exist "%ENV_FILE%" (
    echo [ERROR] Environment file %ENV_FILE% not found!
    echo [INFO] Please ensure the environment file exists with proper configuration.
    pause
    exit /b 1
)

echo [SUCCESS] Environment loaded from %ENV_FILE%

REM Confirmation
echo.
echo [WARNING] Deploy VersionIntel in %ENVIRONMENT% mode?
echo This will rebuild and restart all services.
set /p CONTINUE="Continue? (y/N): "
if /i not "%CONTINUE%"=="y" (
    echo [INFO] Deployment cancelled.
    pause
    exit /b 0
)

REM Deployment process
echo [INFO] Starting deployment...

REM Stop existing services
echo [INFO] Stopping existing services...
docker-compose -f "%COMPOSE_FILE%" down 2>nul

REM Clean up unused images
echo [INFO] Cleaning up unused Docker images...
docker image prune -f 2>nul

REM Build and start services
echo [INFO] Building and starting services...
if "%ENVIRONMENT%"=="prod" (
    docker-compose -f "%COMPOSE_FILE%" build --no-cache
) else (
    docker-compose -f "%COMPOSE_FILE%" build
)

docker-compose -f "%COMPOSE_FILE%" up -d

if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo [SUCCESS] Services deployed

REM Wait for services
echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Test backend health
set BACKEND_HEALTHY=false
for /L %%i in (1,1,10) do (
    curl -s -f "%BACKEND_URL%/health" >nul 2>&1
    if not errorlevel 1 (
        set BACKEND_HEALTHY=true
        goto :backend_ready
    )
    echo Waiting for backend... (%%i/10)
    timeout /t 3 /nobreak >nul
)
:backend_ready

if "%BACKEND_HEALTHY%"=="true" (
    echo [SUCCESS] Backend is healthy
) else (
    echo [WARNING] Backend health check timeout, but continuing...
)

REM Test frontend
set FRONTEND_HEALTHY=false
for /L %%i in (1,1,5) do (
    curl -s -f "%FRONTEND_URL%" >nul 2>&1
    if not errorlevel 1 (
        set FRONTEND_HEALTHY=true
        goto :frontend_ready
    )
    echo Waiting for frontend... (%%i/5)
    timeout /t 2 /nobreak >nul
)
:frontend_ready

if "%FRONTEND_HEALTHY%"=="true" (
    echo [SUCCESS] Frontend is healthy
) else (
    echo [WARNING] Frontend health check timeout, but continuing...
)

REM Show results
echo.
echo [INFO] Deployment Results:
echo ══════════════════════════════════
docker-compose -f "%COMPOSE_FILE%" ps

echo.
echo 🌐 Access URLs:
echo    Frontend: %FRONTEND_URL%
echo    Backend:  %BACKEND_URL%
echo    Health:   %BACKEND_URL%/health

if "%ENVIRONMENT%"=="prod" (
    echo.
    echo 🔐 IMPORTANT - GitHub OAuth Setup:
    echo    1. Go to: https://github.com/settings/developers
    echo    2. Find OAuth App: Iv23liGLM3AMR1Tl3af5
    echo    3. Update URLs:
    echo       - Homepage URL: %FRONTEND_URL%
    echo       - Callback URL: %FRONTEND_URL%/auth/github/callback
    echo.
    echo 📋 Default Admin Account:
    echo    Username: admin
    echo    Password: Admin@123
    echo    (Change password after first login)
)

echo.
echo 📋 Management Commands:
echo    Status:   docker-compose -f %COMPOSE_FILE% ps
echo    Logs:     docker-compose -f %COMPOSE_FILE% logs -f
echo    Restart:  docker-compose -f %COMPOSE_FILE% restart
echo    Stop:     docker-compose -f %COMPOSE_FILE% down

echo.
echo [SUCCESS] 🎉 Deployment Complete!

pause