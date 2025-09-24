@echo off
REM VersionIntel Universal Deployment Script for Windows
REM ====================================================
REM Works for both local development and production environments

setlocal enabledelayedexpansion

REM Default configuration
set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production

REM Set environment-specific configurations
if "%ENVIRONMENT%"=="production" (
    set ENV_FILE=.env.production
    set COMPOSE_FILE=docker-compose.production.yml
    echo [INFO] 🚀 Production Deployment Mode
) else (
    set ENV_FILE=.env
    set COMPOSE_FILE=docker-compose.yml
    echo [INFO] 🔧 Local Development Mode
)

REM Check prerequisites
echo [INFO] Checking prerequisites...

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not available. Please ensure Docker Desktop is properly installed.
    pause
    exit /b 1
)

echo [SUCCESS] Prerequisites check passed

REM Check environment file
echo [INFO] Checking environment configuration...

if not exist "%ENV_FILE%" (
    echo [INFO] Creating default environment file: %ENV_FILE%
    
    if "%ENVIRONMENT%"=="production" (
        echo # VersionIntel Production Configuration > "%ENV_FILE%"
        echo ENVIRONMENT=production >> "%ENV_FILE%"
        echo SERVER_HOST=172.17.14.65 >> "%ENV_FILE%"
        echo PRODUCTION_DOMAIN=172.17.14.65 >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # Database Configuration >> "%ENV_FILE%"
        echo POSTGRES_USER=versionintel_prod >> "%ENV_FILE%"
        echo POSTGRES_PASSWORD=Hmynw4MukmG5Xhw_EMnBwinZLOUmdtwt >> "%ENV_FILE%"
        echo POSTGRES_DB=versionintel_production >> "%ENV_FILE%"
        echo POSTGRES_HOST=db >> "%ENV_FILE%"
        echo POSTGRES_PORT=5432 >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # Flask Configuration >> "%ENV_FILE%"
        echo FLASK_ENV=production >> "%ENV_FILE%"
        echo FLASK_DEBUG=0 >> "%ENV_FILE%"
        echo SECRET_KEY=f2396f2c6c33c2bbd04bfdab89e05ab7ef7ca3087ea1107bfce9986d933c81d9 >> "%ENV_FILE%"
        echo JWT_SECRET_KEY=219f5a91b1c116abeeca9a54a8420c50fd29bec2f1d58c24251e9f28661602a2 >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # GitHub OAuth >> "%ENV_FILE%"
        echo GITHUB_CLIENT_ID=Iv23liGLM3AMR1Tl3af5 >> "%ENV_FILE%"
        echo GITHUB_CLIENT_SECRET=c003b41d966a2888c40ebc309f28f19f8abceabd >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # Google AI >> "%ENV_FILE%"
        echo AI_PROVIDER=gemini >> "%ENV_FILE%"
        echo GOOGLE_API_KEY=AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA >> "%ENV_FILE%"
        echo GOOGLE_MODEL=gemini-2.0-flash >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # CORS Configuration >> "%ENV_FILE%"
        echo CORS_ORIGINS=http://172.17.14.65:3000,http://localhost:3000 >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # Security >> "%ENV_FILE%"
        echo SECURITY_HEADERS=True >> "%ENV_FILE%"
        echo HTTPS_ONLY=False >> "%ENV_FILE%"
        echo SECURE_COOKIES=False >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # Logging >> "%ENV_FILE%"
        echo LOG_LEVEL=INFO >> "%ENV_FILE%"
        echo LOG_FILE_PATH=/var/log/versionintel/app.log >> "%ENV_FILE%"
    ) else (
        echo # VersionIntel Local Development Configuration > "%ENV_FILE%"
        echo ENVIRONMENT=development >> "%ENV_FILE%"
        echo SERVER_HOST=localhost >> "%ENV_FILE%"
        echo PRODUCTION_DOMAIN=localhost >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # Database Configuration >> "%ENV_FILE%"
        echo POSTGRES_USER=versionintel >> "%ENV_FILE%"
        echo POSTGRES_PASSWORD=versionintel123 >> "%ENV_FILE%"
        echo POSTGRES_DB=versionintel >> "%ENV_FILE%"
        echo POSTGRES_HOST=db >> "%ENV_FILE%"
        echo POSTGRES_PORT=5432 >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # Flask Configuration >> "%ENV_FILE%"
        echo FLASK_ENV=development >> "%ENV_FILE%"
        echo FLASK_DEBUG=1 >> "%ENV_FILE%"
        echo SECRET_KEY=dev-secret-key-change-in-production >> "%ENV_FILE%"
        echo JWT_SECRET_KEY=dev-jwt-secret-key-change-in-production >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # GitHub OAuth (Development) >> "%ENV_FILE%"
        echo GITHUB_CLIENT_ID=your-dev-github-client-id >> "%ENV_FILE%"
        echo GITHUB_CLIENT_SECRET=your-dev-github-client-secret >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # Google AI >> "%ENV_FILE%"
        echo AI_PROVIDER=gemini >> "%ENV_FILE%"
        echo GOOGLE_API_KEY=AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA >> "%ENV_FILE%"
        echo GOOGLE_MODEL=gemini-2.0-flash >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # CORS Configuration >> "%ENV_FILE%"
        echo CORS_ORIGINS=http://localhost:3000 >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # Security >> "%ENV_FILE%"
        echo SECURITY_HEADERS=False >> "%ENV_FILE%"
        echo HTTPS_ONLY=False >> "%ENV_FILE%"
        echo SECURE_COOKIES=False >> "%ENV_FILE%"
        echo. >> "%ENV_FILE%"
        echo # Logging >> "%ENV_FILE%"
        echo LOG_LEVEL=DEBUG >> "%ENV_FILE%"
        echo LOG_FILE_PATH=./logs/app.log >> "%ENV_FILE%"
    )
    
    echo [SUCCESS] Created %ENV_FILE% with default values
    echo [WARNING] Please review and update the configuration in %ENV_FILE%
)

echo [SUCCESS] Environment configuration check passed

REM Ask for confirmation
echo [WARNING] This will deploy VersionIntel in %ENVIRONMENT% mode.
set /p CONTINUE="Continue? (y/N): "
if /i not "%CONTINUE%"=="y" (
    echo [INFO] Deployment cancelled.
    pause
    exit /b 0
)

REM Create backup directory
if not exist "backups" mkdir backups

REM Backup database (if exists)
echo [INFO] Checking for existing database to backup...
docker-compose -f "%COMPOSE_FILE%" ps db 2>nul | find "Up" >nul
if not errorlevel 1 (
    echo [INFO] Database container is running, attempting backup...
    for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set BACKUP_DATE=%%d%%b%%c
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set BACKUP_TIME=%%a%%b
    set BACKUP_FILE=backups\versionintel-backup-!BACKUP_DATE!-!BACKUP_TIME!.sql
    docker-compose -f "%COMPOSE_FILE%" exec -T db pg_dump -U versionintel_prod versionintel_production > "!BACKUP_FILE!" 2>nul
    if not errorlevel 1 (
        echo [SUCCESS] Database backup created: !BACKUP_FILE!
    ) else (
        echo [WARNING] Backup failed or database doesn't exist yet (first deployment)
    )
) else (
    echo [WARNING] Database container not running, skipping backup
)

REM Build images
echo [INFO] Building Docker images...
if "%ENVIRONMENT%"=="production" (
    docker-compose -f "%COMPOSE_FILE%" build --no-cache
) else (
    docker-compose -f "%COMPOSE_FILE%" build
)

if errorlevel 1 (
    echo [ERROR] Failed to build Docker images
    pause
    exit /b 1
)

echo [SUCCESS] Docker images built successfully

REM Deploy services
echo [INFO] Deploying services...

REM Stop existing services
docker-compose -f "%COMPOSE_FILE%" down 2>nul

REM Start services
docker-compose -f "%COMPOSE_FILE%" up -d

if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo [SUCCESS] Services deployed successfully

REM Wait for services
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Show service status
echo [INFO] Service Status:
echo ====================
docker-compose -f "%COMPOSE_FILE%" ps
echo ====================

REM Show deployment info
echo.
echo [SUCCESS] 🎉 Deployment completed successfully!
echo.
echo Deployment Information:
echo ======================
if "%ENVIRONMENT%"=="production" (
    echo 🌐 Frontend: http://172.17.14.65:3000
    echo 🔧 Backend:  http://172.17.14.65:8000
    echo 🗄️  Database: 172.17.14.65:5432
) else (
    echo 🌐 Frontend: http://localhost:3000
    echo 🔧 Backend:  http://localhost:5000
    echo 🗄️  Database: localhost:5432
)
echo ======================
echo.
echo Useful Commands:
echo   View logs:     docker-compose -f %COMPOSE_FILE% logs -f
echo   Stop services: docker-compose -f %COMPOSE_FILE% down
echo   Restart:       docker-compose -f %COMPOSE_FILE% restart
echo   Status:        docker-compose -f %COMPOSE_FILE% ps
echo.
echo 🔐 Next Steps:
echo 1. Update GitHub OAuth URLs to match your domain
echo 2. Access the application and sign in with GitHub
echo 3. Promote your user to admin role in the database
echo 4. Test all functionality
echo.

pause