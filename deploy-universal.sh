#!/bin/bash
# VersionIntel Universal Deployment Script
# =========================================
# Works for both local development and production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
ENVIRONMENT=${1:-production}  # Default to production, can be overridden
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="./backups"

# Set environment-specific configurations
if [ "$ENVIRONMENT" = "production" ]; then
    ENV_FILE=".env.production"
    COMPOSE_FILE="docker-compose.production.yml"
    log_info "🚀 Production Deployment Mode"
else
    ENV_FILE=".env"
    COMPOSE_FILE="docker-compose.yml"
    log_info "🔧 Local Development Mode"
fi

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

check_environment() {
    log_info "Checking environment configuration..."
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file ($ENV_FILE) not found!"
        if [ "$ENVIRONMENT" = "production" ]; then
            log_info "Please copy .env.production.template to $ENV_FILE and configure it."
        else
            log_info "Please copy env.example to $ENV_FILE and configure it."
        fi
        exit 1
    fi
    
    # Check for placeholder values in production
    if [ "$ENVIRONMENT" = "production" ] && grep -q "your-production-\|your-secure-\|your-github-" "$ENV_FILE"; then
        log_warning "Found placeholder values in $ENV_FILE"
        log_warning "Please update all placeholder values with actual production values."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    log_success "Environment configuration check passed"
}

create_env_if_missing() {
    if [ ! -f "$ENV_FILE" ]; then
        log_info "Creating default environment file: $ENV_FILE"
        
        if [ "$ENVIRONMENT" = "production" ]; then
            # Create production environment with current values
            cat > "$ENV_FILE" << 'EOF'
# VersionIntel Production Configuration
ENVIRONMENT=production
SERVER_HOST=172.17.14.65
PRODUCTION_DOMAIN=172.17.14.65

# Database Configuration
POSTGRES_USER=versionintel_prod
POSTGRES_PASSWORD=Hmynw4MukmG5Xhw_EMnBwinZLOUmdtwt
POSTGRES_DB=versionintel_production
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Flask Configuration
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

# CORS Configuration
CORS_ORIGINS=http://172.17.14.65:3000,http://localhost:3000

# Security
SECURITY_HEADERS=True
HTTPS_ONLY=False
SECURE_COOKIES=False

# Logging
LOG_LEVEL=INFO
LOG_FILE_PATH=/var/log/versionintel/app.log
EOF
        else
            # Create local development environment
            cat > "$ENV_FILE" << 'EOF'
# VersionIntel Local Development Configuration
ENVIRONMENT=development
SERVER_HOST=localhost
PRODUCTION_DOMAIN=localhost

# Database Configuration
POSTGRES_USER=versionintel
POSTGRES_PASSWORD=versionintel123
POSTGRES_DB=versionintel
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-key-change-in-production

# GitHub OAuth (Development)
GITHUB_CLIENT_ID=your-dev-github-client-id
GITHUB_CLIENT_SECRET=your-dev-github-client-secret

# Google AI
AI_PROVIDER=gemini
GOOGLE_API_KEY=AIzaSyBwD6qJ2jA9HJ-nOpjAMygnLF4RYhzGEUA
GOOGLE_MODEL=gemini-2.0-flash

# CORS Configuration
CORS_ORIGINS=http://localhost:3000

# Security
SECURITY_HEADERS=False
HTTPS_ONLY=False
SECURE_COOKIES=False

# Logging
LOG_LEVEL=DEBUG
LOG_FILE_PATH=./logs/app.log
EOF
        fi
        
        log_success "Created $ENV_FILE with default values"
        log_warning "Please review and update the configuration in $ENV_FILE"
    fi
}

backup_database() {
    log_info "Creating database backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Generate backup filename with timestamp
    BACKUP_FILE="$BACKUP_DIR/versionintel-backup-$(date +%Y%m%d-%H%M%S).sql"
    
    # Check if database container is running and database exists
    if docker-compose -f "$COMPOSE_FILE" ps db 2>/dev/null | grep -q "Up"; then
        log_info "Database container is running, checking if database exists..."
        
        # Check if database exists
        if docker-compose -f "$COMPOSE_FILE" exec -T db psql -U "$POSTGRES_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$POSTGRES_DB"; then
            log_info "Creating database backup: $BACKUP_FILE"
            if docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_FILE" 2>/dev/null; then
                log_success "Database backup created: $BACKUP_FILE"
            else
                log_warning "Backup failed, but continuing with deployment"
            fi
        else
            log_warning "Database '$POSTGRES_DB' doesn't exist yet, skipping backup (first deployment)"
        fi
    else
        log_warning "Database container not running, skipping backup"
    fi
}

build_images() {
    log_info "Building Docker images..."
    
    # Build images with appropriate optimizations
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f "$COMPOSE_FILE" build --no-cache --parallel
    else
        docker-compose -f "$COMPOSE_FILE" build
    fi
    
    log_success "Docker images built successfully"
}

deploy_services() {
    log_info "Deploying services..."
    
    # Stop existing services
    docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || true
    
    # Start services
    docker-compose -f "$COMPOSE_FILE" up -d
    
    log_success "Services deployed successfully"
}

wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    # Wait for database
    log_info "Waiting for database..."
    timeout 60 bash -c "until docker-compose -f \"$COMPOSE_FILE\" exec -T db pg_isready -U \"$POSTGRES_USER\" 2>/dev/null; do sleep 2; done" || {
        log_warning "Database took longer than expected to start, but continuing..."
    }
    
    # Wait for backend
    log_info "Waiting for backend..."
    if [ "$ENVIRONMENT" = "production" ]; then
        BACKEND_URL="http://localhost:8000"
    else
        BACKEND_URL="http://localhost:5000"
    fi
    
    timeout 120 bash -c "until curl -f $BACKEND_URL/health 2>/dev/null; do sleep 5; done" || {
        log_warning "Backend took longer than expected to start, but continuing..."
    }
    
    # Wait for frontend
    log_info "Waiting for frontend..."
    timeout 60 bash -c 'until curl -f http://localhost:3000 2>/dev/null; do sleep 3; done' || {
        log_warning "Frontend took longer than expected to start, but continuing..."
    }
    
    log_success "All services are ready"
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check service status
    echo "=== Service Status ==="
    docker-compose -f "$COMPOSE_FILE" ps
    echo "======================"
    
    # Check service health
    log_info "Checking service health..."
    
    # Backend health check
    if [ "$ENVIRONMENT" = "production" ]; then
        BACKEND_URL="http://localhost:8000"
    else
        BACKEND_URL="http://localhost:5000"
    fi
    
    if curl -f "$BACKEND_URL/health" &> /dev/null; then
        log_success "Backend is healthy"
    else
        log_warning "Backend health check failed, but service may still be starting"
    fi
    
    # Frontend health check
    if curl -f http://localhost:3000 &> /dev/null; then
        log_success "Frontend is healthy"
    else
        log_warning "Frontend health check failed, but service may still be starting"
    fi
    
    log_success "Deployment verification completed"
}

show_deployment_info() {
    echo ""
    log_info "🎉 Deployment Information:"
    echo "=================================="
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "🌐 Frontend: http://172.17.14.65:3000"
        echo "🔧 Backend:  http://172.17.14.65:8000"
        echo "🗄️  Database: 172.17.14.65:5432"
    else
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔧 Backend:  http://localhost:5000"
        echo "🗄️  Database: localhost:5432"
    fi
    echo "=================================="
    echo ""
    log_info "Useful Commands:"
    echo "  View logs:     docker-compose -f $COMPOSE_FILE logs -f"
    echo "  Stop services: docker-compose -f $COMPOSE_FILE down"
    echo "  Restart:       docker-compose -f $COMPOSE_FILE restart"
    echo "  Status:        docker-compose -f $COMPOSE_FILE ps"
    echo ""
    log_success "Deployment completed successfully!"
    echo ""
    log_info "🔐 Next Steps:"
    echo "1. Update GitHub OAuth URLs to match your domain"
    echo "2. Access the application and sign in with GitHub"
    echo "3. Promote your user to admin role in the database"
    echo "4. Test all functionality"
}

# Main deployment process
main() {
    echo ""
    log_info "🚀 Starting VersionIntel Deployment ($ENVIRONMENT mode)"
    echo "==========================================================="
    
    # Create environment file if missing
    create_env_if_missing
    
    # Load environment variables
    if [ -f "$ENV_FILE" ]; then
        set -a
        source "$ENV_FILE"
        set +a
    fi
    
    check_prerequisites
    check_environment
    
    # Ask for confirmation
    log_warning "This will deploy VersionIntel in $ENVIRONMENT mode."
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled."
        exit 0
    fi
    
    backup_database
    build_images
    deploy_services
    wait_for_services
    verify_deployment
    show_deployment_info
}

# Check if help is requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "VersionIntel Universal Deployment Script"
    echo "========================================"
    echo ""
    echo "Usage: $0 [environment]"
    echo ""
    echo "Environments:"
    echo "  production  - Deploy for production use (default)"
    echo "  development - Deploy for local development"
    echo ""
    echo "Examples:"
    echo "  $0                # Deploy in production mode"
    echo "  $0 production     # Deploy in production mode"
    echo "  $0 development    # Deploy in development mode"
    echo ""
    echo "Prerequisites:"
    echo "  - Docker and Docker Compose installed"
    echo "  - Environment file configured (.env.production or .env)"
    echo "  - GitHub OAuth app configured"
    exit 0
fi

# Run main function
main "$@"