# Complete VersionIntel Rebuild with OAuth Fixes
Write-Host "🔧 Complete VersionIntel Rebuild with OAuth Fixes" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "1. Stopping all containers..." -ForegroundColor Yellow
docker-compose down -v

Write-Host "2. Removing old images..." -ForegroundColor Yellow
docker rmi versionintel-backend:latest versionintel-frontend:latest 2>$null
docker system prune -f

Write-Host "3. Verifying environment variables..." -ForegroundColor Yellow
$env_content = Get-Content .env
$postgres_password = ($env_content | Where-Object { $_ -match "POSTGRES_PASSWORD=" }) -replace "POSTGRES_PASSWORD=", ""
$database_url = ($env_content | Where-Object { $_ -match "DATABASE_URL=" }) -replace "DATABASE_URL=", ""
Write-Host "POSTGRES_PASSWORD: $postgres_password" -ForegroundColor Green
Write-Host "DATABASE_URL: $database_url" -ForegroundColor Green

Write-Host "4. Building containers with new environment..." -ForegroundColor Yellow
docker-compose build --no-cache

Write-Host "5. Starting database first..." -ForegroundColor Yellow
docker-compose up -d db

Write-Host "6. Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "7. Starting backend..." -ForegroundColor Yellow
docker-compose up -d backend

Write-Host "8. Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host "9. Starting frontend..." -ForegroundColor Yellow
docker-compose up -d frontend

Write-Host "10. Final check - container status:" -ForegroundColor Yellow
docker ps

Write-Host "11. Testing backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://172.17.14.65:8000/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend not ready yet" -ForegroundColor Red
}

Write-Host "12. Testing OAuth endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://172.17.14.65:8000/auth/github/login" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ OAuth endpoint ready" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ OAuth not ready yet" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Rebuild complete!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://172.17.14.65:3000" -ForegroundColor Cyan
Write-Host "🔗 Backend: http://172.17.14.65:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "If issues persist, check logs with:" -ForegroundColor Yellow
Write-Host "  docker logs versionintel_backend_1" -ForegroundColor Gray
Write-Host "  docker logs versionintel_frontend_1" -ForegroundColor Gray