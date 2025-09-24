@echo off
REM VersionIntel Perfect Deployment Script (Windows)
REM ===============================================
REM Automatically deploys for local development or production
REM All secrets and configuration included

setlocal enabledelayedexpansion

REM Detect environment
set ENVIRONMENT=production
if "%1"=="local" set ENVIRONMENT=development
if "%1"=="dev" set ENVIRONMENT=development
if "%1"=="development" set ENVIRONMENT=development

REM Configuration
if "%ENVIRONMENT%"=="production" (
    set COMPOSE_FILE=docker-compose.production.yml
    set FRONTEND_PORT=3000
    set BACKEND_PORT=8000
    echo [INFO] 🚀 Production Deployment Mode
) else (
    set COMPOSE_FILE=docker-compose.yml
    set FRONTEND_PORT=3000
    set BACKEND_PORT=5000
    echo [INFO] 🔧 Local Development Mode
)

echo.
echo 🚀 VersionIntel Deployment Script
echo =================================
echo Usage: %0 [local^|production]
echo Default: production
echo.

REM Check prerequisites
echo [INFO] Checking prerequisites...

docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose not available.
    pause
    exit /b 1
)

echo [SUCCESS] Prerequisites OK

REM Create environment file with all secrets
echo [INFO] Creating environment configuration...

if "%ENVIRONMENT%"=="production" (
    echo # VersionIntel Production Configuration > .env.production
    echo ENVIRONMENT=production >> .env.production
    echo SERVER_HOST=172.17.14.65 >> .env.production
    echo PRODUCTION_DOMAIN=172.17.14.65 >> .env.production
    echo. >> .env.production
    echo # Database >> .env.production
    echo POSTGRES_USER=versionintel_prod >> .env.production
    echo POSTGRES_PASSWORD=Hmynw4MukmG5Xhw_EMnBwinZLOUmdtwt >> .env.production
    echo POSTGRES_DB=versionintel_production >> .env.production
    echo POSTGRES_HOST=db >> .env.production
    echo POSTGRES_PORT=5432 >> .env.production
    echo. >> .env.production
    echo # Flask >> .env.production
    echo FLASK_ENV=production >> .env.production
    echo FLASK_DEBUG=0 >> .env.production
    echo SECRET_KEY=f2396f2c6c33c2bbd04bfdab89e05ab7ef7ca3087ea1107bfce9986d933c81d9 >> .env.production
    echo JWT_SECRET_KEY=219f5a91b1c116abeeca9a54a8420c50fd29bec2f1d58c24251e9f28661602a2 >> .env.production
    echo. >> .env.production
    echo # GitHub OAuth >> .env.production
    echo GITHUB_CLIENT_ID=Iv23liGLM3AMR1Tl3af5 >> .env.production
    echo GITHUB_CLIENT_SECRET=c003b41d966a2888c40ebc309f28f19f8abceabd >> .env.production
    echo. >> .env.production
    echo # Google AI >> .env.production
    echo AI_PROVIDER=gemini >> .env.production
    echo GOOGLE_API_KEY=AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA >> .env.production
    echo GOOGLE_MODEL=gemini-2.0-flash >> .env.production
    echo. >> .env.production
    echo # CORS >> .env.production
    echo CORS_ORIGINS=http://172.17.14.65:3000,http://localhost:3000 >> .env.production
    echo. >> .env.production
    echo # Security >> .env.production
    echo SECURITY_HEADERS=True >> .env.production
    echo HTTPS_ONLY=False >> .env.production
    echo SECURE_COOKIES=False >> .env.production
    echo LOG_LEVEL=INFO >> .env.production
    
    echo [SUCCESS] Created .env.production with all secrets
) else (
    echo # VersionIntel Development Configuration > .env
    echo ENVIRONMENT=development >> .env
    echo SERVER_HOST=localhost >> .env
    echo PRODUCTION_DOMAIN=localhost >> .env
    echo. >> .env
    echo # Database >> .env
    echo POSTGRES_USER=versionintel >> .env
    echo POSTGRES_PASSWORD=versionintel123 >> .env
    echo POSTGRES_DB=versionintel >> .env
    echo POSTGRES_HOST=db >> .env
    echo POSTGRES_PORT=5432 >> .env
    echo. >> .env
    echo # Flask >> .env
    echo FLASK_ENV=development >> .env
    echo FLASK_DEBUG=1 >> .env
    echo SECRET_KEY=dev-secret-key-for-development-only >> .env
    echo JWT_SECRET_KEY=dev-jwt-secret-key-for-development-only >> .env
    echo. >> .env
    echo # GitHub OAuth (use your dev app) >> .env
    echo GITHUB_CLIENT_ID=Iv23liGLM3AMR1Tl3af5 >> .env
    echo GITHUB_CLIENT_SECRET=c003b41d966a2888c40ebc309f28f19f8abceabd >> .env
    echo. >> .env
    echo # Google AI >> .env
    echo AI_PROVIDER=gemini >> .env
    echo GOOGLE_API_KEY=AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA >> .env
    echo GOOGLE_MODEL=gemini-2.0-flash >> .env
    echo. >> .env
    echo # CORS >> .env
    echo CORS_ORIGINS=http://localhost:3000 >> .env
    echo. >> .env
    echo # Security >> .env
    echo SECURITY_HEADERS=False >> .env
    echo HTTPS_ONLY=False >> .env
    echo SECURE_COOKIES=False >> .env
    echo LOG_LEVEL=DEBUG >> .env
    
    echo [SUCCESS] Created .env for development
)

REM Ask for confirmation
echo [WARNING] Deploy VersionIntel in %ENVIRONMENT% mode?
set /p CONTINUE="Continue? (y/N): "
if /i not "%CONTINUE%"=="y" (
    echo [INFO] Cancelled.
    pause
    exit /b 0
)

echo [INFO] Starting deployment...

REM Create backup directory
if not exist "backups" mkdir backups

REM Backup existing database if it exists
docker-compose -f "%COMPOSE_FILE%" ps db 2>nul | find "Up" >nul
if not errorlevel 1 (
    echo [INFO] Backing up existing database...
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set BACKUP_DATE=%%c%%a%%b
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set BACKUP_TIME=%%a%%b
    set BACKUP_FILE=backups\backup-!BACKUP_DATE!-!BACKUP_TIME!.sql
    
    if "%ENVIRONMENT%"=="production" (
        docker-compose -f "%COMPOSE_FILE%" exec -T db pg_dump -U versionintel_prod versionintel_production > "!BACKUP_FILE!" 2>nul
    ) else (
        docker-compose -f "%COMPOSE_FILE%" exec -T db pg_dump -U versionintel versionintel > "!BACKUP_FILE!" 2>nul
    )
    
    if not errorlevel 1 (
        echo [SUCCESS] Database backed up to !BACKUP_FILE!
    ) else (
        echo [WARNING] Backup skipped (database may not exist yet)
    )
)

REM Stop existing services
echo [INFO] Stopping existing services...
docker-compose -f "%COMPOSE_FILE%" down 2>nul

REM Build and start
echo [INFO] Building and starting services...
if "%ENVIRONMENT%"=="production" (
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

REM Wait for services
echo [INFO] Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Show status
echo.
echo [INFO] Service Status:
docker-compose -f "%COMPOSE_FILE%" ps

REM Show URLs
echo.
echo [SUCCESS] 🎉 Deployment Complete!
echo ==========================
if "%ENVIRONMENT%"=="production" (
    echo 🌐 Frontend: http://172.17.14.65:%FRONTEND_PORT%
    echo 🔧 Backend:  http://172.17.14.65:%BACKEND_PORT%
) else (
    echo 🌐 Frontend: http://localhost:%FRONTEND_PORT%
    echo 🔧 Backend:  http://localhost:%BACKEND_PORT%
)
echo ==========================
echo.
echo 📋 Management Commands:
echo   Status:   docker-compose -f %COMPOSE_FILE% ps
echo   Logs:     docker-compose -f %COMPOSE_FILE% logs -f
echo   Stop:     docker-compose -f %COMPOSE_FILE% down
echo   Restart:  docker-compose -f %COMPOSE_FILE% restart
echo.

if "%ENVIRONMENT%"=="production" (
    echo 🔐 IMPORTANT: Update GitHub OAuth URLs to:
    echo    Homepage: http://172.17.14.65:3000
    echo    Callback: http://172.17.14.65:3000/auth/github/callback
    echo.
)

pause