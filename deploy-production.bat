@echo off
REM VersionIntel Production Deployment Script for Windows
REM =====================================================

setlocal enabledelayedexpansion

REM Configuration
set ENV_FILE=.env.production
set COMPOSE_FILE=docker-compose.production.yml
set BACKUP_DIR=.\backups

echo.
echo 🚀 VersionIntel Production Deployment
echo =====================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo ✅ Docker is running

REM Check if environment file exists
if not exist "%ENV_FILE%" (
    echo ❌ Production environment file (%ENV_FILE%) not found!
    echo ℹ️  Please copy .env.production.template to %ENV_FILE% and configure it.
    pause
    exit /b 1
)
echo ✅ Environment file exists

REM Check for placeholder values
findstr /C:"your-production-" "%ENV_FILE%" >nul
if not errorlevel 1 (
    echo ⚠️  Found placeholder values in %ENV_FILE%
    echo ⚠️  Please update all 'your-production-*' values with actual production values.
    set /p "continue=Continue anyway? (y/N): "
    if /i not "!continue!"=="y" exit /b 1
)

echo.
echo ⚠️  This will deploy VersionIntel to production mode.
set /p "deploy=Continue? (y/N): "
if /i not "!deploy!"=="y" (
    echo ℹ️  Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo ℹ️  Creating backup directory...
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo ℹ️  Stopping existing containers...
docker-compose -f "%COMPOSE_FILE%" down

echo ℹ️  Building production images...
docker-compose -f "%COMPOSE_FILE%" build --no-cache

echo ℹ️  Starting production services...
docker-compose -f "%COMPOSE_FILE%" up -d

echo ℹ️  Waiting for services to start...
timeout /t 10 /nobreak >nul

echo ℹ️  Checking service status...
docker-compose -f "%COMPOSE_FILE%" ps

echo.
echo 🎉 Production Deployment Complete!
echo ==================================
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:8000
echo 🗄️  Database: localhost:5432
echo ==================================
echo.
echo Useful Commands:
echo   View logs:     docker-compose -f %COMPOSE_FILE% logs -f
echo   Stop services: docker-compose -f %COMPOSE_FILE% down
echo   Restart:       docker-compose -f %COMPOSE_FILE% restart
echo   Status:        docker-compose -f %COMPOSE_FILE% ps
echo.

pause