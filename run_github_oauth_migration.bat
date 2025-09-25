@echo off
REM GitHub OAuth Database Migration Script for Windows
REM This script runs the database migration to add GitHub OAuth support

echo 🚀 Running GitHub OAuth Database Migration...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if the database container is running
docker-compose ps db | findstr "Up" >nul
if errorlevel 1 (
    echo 📦 Starting database container...
    docker-compose up -d db
    echo ⏳ Waiting for database to be ready...
    timeout /t 10 /nobreak >nul
)

REM Run the migration
echo 📊 Executing GitHub OAuth migration...
docker-compose exec -T db psql -U postgres -d versionintel -f /docker-entrypoint-initdb.d/migration_add_github_oauth.sql

if errorlevel 0 (
    echo ✅ GitHub OAuth migration completed successfully!
    echo.
    echo Next steps:
    echo 1. Update your .env files with GitHub OAuth credentials
    echo 2. Restart the services: docker-compose restart
    echo 3. Test the GitHub OAuth login
) else (
    echo ❌ Migration failed. Please check the error messages above.
    pause
    exit /b 1
)

pause