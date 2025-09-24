#!/bin/bash
# Quick Fix for Backend Issues
# ============================

set -e

echo "🔧 Quick Fix: Backend Issues"
echo "============================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Fix 1: Stop current services
log_info "Stopping current services..."
docker-compose -f docker-compose.production.yml down

# Fix 2: Create the production database manually
log_info "Creating production database..."
docker run --rm \
  -e POSTGRES_PASSWORD=Hmynw4MukmG5Xhw_EMnBwinZLOUmdtwt \
  postgres:13-alpine \
  sh -c '
    echo "Starting temporary postgres to create database..."
    docker-entrypoint.sh postgres &
    sleep 10
    createdb -h localhost -U postgres versionintel_production || echo "Database may already exist"
    echo "Database creation attempted"
  ' || true

# Fix 3: Rebuild backend with gunicorn
log_info "Rebuilding backend with fixed Dockerfile..."
export $(cat .env.production | grep -v '^#' | xargs)
docker-compose -f docker-compose.production.yml build --no-cache backend

# Fix 4: Start services
log_info "Starting services..."
docker-compose -f docker-compose.production.yml up -d

# Fix 5: Wait and check
log_info "Waiting for services..."
sleep 20

log_info "Service status:"
docker-compose -f docker-compose.production.yml ps

# Fix 6: Test backend
log_info "Testing backend..."
for i in {1..10}; do
    if curl -s http://172.17.14.65:8000/health >/dev/null 2>&1; then
        log_success "Backend is healthy!"
        break
    fi
    echo "Attempt $i/10 - waiting..."
    sleep 3
done

echo ""
log_success "🎉 Quick fix complete!"
echo "📋 Check status: docker-compose -f docker-compose.production.yml ps"
echo "🌐 Frontend: http://172.17.14.65:3000"
echo "🔧 Backend: http://172.17.14.65:8000"