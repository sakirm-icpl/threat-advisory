#!/bin/bash
# VersionIntel Simple Deployment Script (Linux/macOS) - REPLACED
# Use deploy-perfect.sh instead for the ultimate experience

echo "⚠️  This script has been replaced!"
echo "Use: ./deploy-perfect.sh [production|development]"
echo "The new script fixes all issues automatically!"
exit 1

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Detect environment
ENVIRONMENT="production"
if [[ "$1" == "local" || "$1" == "dev" || "$1" == "development" ]]; then
    ENVIRONMENT="development"
fi

# Configuration
if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.production.yml"
    FRONTEND_PORT=3000
    BACKEND_PORT=8000
    log_info "🚀 Production Deployment Mode"
else
    COMPOSE_FILE="docker-compose.yml"
    FRONTEND_PORT=3000
    BACKEND_PORT=5000
    log_info "🔧 Local Development Mode"
fi

# Create environment file with all secrets
create_env_file() {
    if [ "$ENVIRONMENT" = "production" ]; then
        cat > .env.production << 'EOF'
# VersionIntel Production Configuration
ENVIRONMENT=production
SERVER_HOST=172.17.14.65
PRODUCTION_DOMAIN=172.17.14.65

# Database
POSTGRES_USER=versionintel_prod
POSTGRES_PASSWORD=Hmynw4MukmG5Xhw_EMnBwinZLOUmdtwt
POSTGRES_DB=versionintel_production
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Flask
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=f2396f2c6c33c2bbd04bfdab89e05ab7ef7ca3087ea1107bfce9986d933c81d9
JWT_SECRET_KEY=219f5a91b1c116abeeca9a54a8420c50fd29bec2f1d58c24251e9f28661602a2

# GitHub OAuth
GITHUB_CLIENT_ID=Iv23liGLM3AMR1Tl3af5
GITHUB_CLIENT_SECRET=c003b41d966a2888c40ebc309f28f19f8abceabd

# Google AI
AI_PROVIDER=gemini
GOOGLE_API_KEY=AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA
GOOGLE_MODEL=gemini-2.0-flash

# CORS
CORS_ORIGINS=http://172.17.14.65:3000,http://localhost:3000

# Security
SECURITY_HEADERS=True
HTTPS_ONLY=False
SECURE_COOKIES=False
LOG_LEVEL=INFO
EOF
        chmod 600 .env.production
        log_success "Created .env.production with all secrets"
    else
        cat > .env << 'EOF'
# VersionIntel Development Configuration
ENVIRONMENT=development
SERVER_HOST=localhost
PRODUCTION_DOMAIN=localhost

# Database
POSTGRES_USER=versionintel
POSTGRES_PASSWORD=versionintel123
POSTGRES_DB=versionintel
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Flask
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=dev-secret-key-for-development-only
JWT_SECRET_KEY=dev-jwt-secret-key-for-development-only

# GitHub OAuth (use your dev app)
GITHUB_CLIENT_ID=Iv23liGLM3AMR1Tl3af5
GITHUB_CLIENT_SECRET=c003b41d966a2888c40ebc309f28f19f8abceabd

# Google AI
AI_PROVIDER=gemini
GOOGLE_API_KEY=AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA
GOOGLE_MODEL=gemini-2.0-flash

# CORS
CORS_ORIGINS=http://localhost:3000

# Security
SECURITY_HEADERS=False
HTTPS_ONLY=False
SECURE_COOKIES=False
LOG_LEVEL=DEBUG
EOF
        log_success "Created .env for development"
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker not installed. Install: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker not running. Please start Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose not installed."
        exit 1
    fi
    
    log_success "Prerequisites OK"
}

# Deploy
deploy() {
    log_info "Starting deployment..."
    
    # Create backup directory
    mkdir -p backups
    
    # Backup existing database if it exists
    if docker-compose -f "$COMPOSE_FILE" ps db 2>/dev/null | grep -q "Up"; then
        if [ "$ENVIRONMENT" = "production" ]; then
            DB_NAME="versionintel_production"
            DB_USER="versionintel_prod"
        else
            DB_NAME="versionintel"
            DB_USER="versionintel"
        fi
        
        BACKUP_FILE="backups/backup-$(date +%Y%m%d-%H%M%S).sql"
        if docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
            log_success "Database backed up to $BACKUP_FILE"
        else
            log_warning "Backup skipped (database may not exist yet)"
        fi
    fi
    
    # Stop existing services
    docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true
    
    # Build and start
    log_info "Building and starting services..."
    
    # Load environment variables for docker-compose
    if [ "$ENVIRONMENT" = "production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
        docker-compose -f "$COMPOSE_FILE" build --no-cache
    else
        export $(cat .env | grep -v '^#' | xargs)
        docker-compose -f "$COMPOSE_FILE" build
    fi
    
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services
    log_info "Waiting for services to start..."
    sleep 10
    
    # Show status
    echo ""
    log_info "Service Status:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    # Show URLs
    echo ""
    log_success "🎉 Deployment Complete!"
    echo "=========================="
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "🌐 Frontend: http://172.17.14.65:$FRONTEND_PORT"
        echo "🔧 Backend:  http://172.17.14.65:$BACKEND_PORT"
    else
        echo "🌐 Frontend: http://localhost:$FRONTEND_PORT"
        echo "🔧 Backend:  http://localhost:$BACKEND_PORT"
    fi
    echo "=========================="
    echo ""
    echo "📋 Management Commands:"
    echo "  Status:   docker-compose -f $COMPOSE_FILE ps"
    echo "  Logs:     docker-compose -f $COMPOSE_FILE logs -f"
    echo "  Stop:     docker-compose -f $COMPOSE_FILE down"
    echo "  Restart:  docker-compose -f $COMPOSE_FILE restart"
    echo ""
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "🔐 IMPORTANT: Update GitHub OAuth URLs to:"
        echo "   Homepage: http://172.17.14.65:3000"
        echo "   Callback: http://172.17.14.65:3000/auth/github/callback"
    fi
}

# Main
main() {
    echo ""
    log_info "🚀 VersionIntel Deployment Script"
    echo "================================="
    echo "Usage: $0 [local|production]"
    echo "Default: production"
    echo ""
    
    check_prerequisites
    create_env_file
    
    log_warning "Deploy VersionIntel in $ENVIRONMENT mode?"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cancelled."
        exit 0
    fi
    
    deploy
}

main "$@"