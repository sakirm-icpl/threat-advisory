# COMPLETE VERSIONINTEL SYSTEM RESET AND FIX
Write-Host "🔥 COMPLETE VERSIONINTEL SYSTEM RESET" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red

# 1. Stop everything
Write-Host "1. Stopping all containers..." -ForegroundColor Yellow
docker-compose down -v --remove-orphans

# 2. Clean Docker completely
Write-Host "2. Cleaning Docker system..." -ForegroundColor Yellow
docker system prune -af --volumes
try {
    docker rmi $(docker images -q) -f 2>$null
} catch {
    Write-Host "No images to remove" -ForegroundColor Gray
}

# 3. Verify environment
Write-Host "3. Verifying environment configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

$env_content = Get-Content .env
Write-Host "Database configuration:" -ForegroundColor Green
$env_content | Where-Object { $_ -match "POSTGRES_|DATABASE_" } | ForEach-Object { Write-Host "  $_" -ForegroundColor Cyan }

# 4. Build everything fresh
Write-Host "4. Building fresh containers (this may take several minutes)..." -ForegroundColor Yellow
docker-compose build --no-cache --pull

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# 5. Start database first
Write-Host "5. Starting database..." -ForegroundColor Yellow
docker-compose up -d db

# 6. Wait for database
Write-Host "6. Waiting for database to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# 7. Test database connection
Write-Host "7. Testing database connection..." -ForegroundColor Yellow
$dbTest = docker-compose exec -T db psql -U versionintel -d versionintel -c "SELECT 1;" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database connection failed" -ForegroundColor Red
    Write-Host "Database logs:" -ForegroundColor Yellow
    docker logs versionintel_db_1
    exit 1
} else {
    Write-Host "✅ Database connection successful" -ForegroundColor Green
}

# 8. Start backend
Write-Host "8. Starting backend..." -ForegroundColor Yellow
docker-compose up -d backend

# 9. Wait for backend
Write-Host "9. Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 10. Test backend health
Write-Host "10. Testing backend health..." -ForegroundColor Yellow
$healthCheck = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://172.17.14.65:8000/health" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend is healthy" -ForegroundColor Green
            $healthCheck = $true
            break
        }
    } catch {
        Write-Host "Attempt $i/10: Backend not ready yet..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}

if (!$healthCheck) {
    Write-Host "❌ Backend health check failed" -ForegroundColor Red
    Write-Host "Backend logs:" -ForegroundColor Yellow
    docker logs versionintel_backend_1 --tail 20
    exit 1
}

# 11. Start frontend
Write-Host "11. Starting frontend..." -ForegroundColor Yellow
docker-compose up -d frontend

# 12. Final verification
Write-Host "12. Final system verification..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "=== CONTAINER STATUS ===" -ForegroundColor Cyan
docker ps

Write-Host ""
Write-Host "=== TESTING ENDPOINTS ===" -ForegroundColor Cyan

# Test health
Write-Host "Health check:" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://172.17.14.65:8000/health" -UseBasicParsing
    Write-Host "✅ Health: $($healthResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test OAuth
Write-Host "OAuth login endpoint:" -ForegroundColor Yellow
try {
    $oauthResponse = Invoke-WebRequest -Uri "http://172.17.14.65:8000/auth/github/login" -UseBasicParsing
    Write-Host "✅ OAuth: $($oauthResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ OAuth failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test frontend
Write-Host "Frontend:" -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://172.17.14.65:3000" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Frontend: $($frontendResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 SYSTEM RESET COMPLETE!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://172.17.14.65:3000" -ForegroundColor Cyan
Write-Host "🔗 Backend: http://172.17.14.65:8000" -ForegroundColor Cyan
Write-Host "🗄️ Database: localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "If GitHub OAuth still fails:" -ForegroundColor Yellow
Write-Host "1. Check your GitHub OAuth app settings" -ForegroundColor Gray
Write-Host "2. Ensure callback URL is: http://172.17.14.65:3000/auth/github/callback" -ForegroundColor Gray
Write-Host "3. Check browser console for detailed errors" -ForegroundColor Gray