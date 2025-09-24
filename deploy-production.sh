#!/bin/bash
# VersionIntel Production Deployment Script
# ==========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.production.yml"
BACKUP_DIR="./backups"

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
        log_error "Production environment file ($ENV_FILE) not found!"
        log_info "Please copy .env.production.template to $ENV_FILE and configure it."
        exit 1
    fi
    
    # Check for placeholder values
    if grep -q "your-production-" "$ENV_FILE"; then
        log_warning "Found placeholder values in $ENV_FILE"
        log_warning "Please update all 'your-production-*' values with actual production values."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    log_success "Environment configuration check passed"
}

backup_database() {
    log_info "Creating database backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Generate backup filename with timestamp
    BACKUP_FILE="$BACKUP_DIR/versionintel-backup-$(date +%Y%m%d-%H%M%S).sql"
    
    # Check if database container is running
    if docker-compose -f "$COMPOSE_FILE" ps db | grep -q "Up"; then
        log_info "Creating database backup: $BACKUP_FILE"
        docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_FILE"
        log_success "Database backup created: $BACKUP_FILE"
    else
        log_warning "Database container not running, skipping backup"
    fi
}

build_images() {
    log_info "Building production Docker images..."
    
    # Build images with production optimizations
    docker-compose -f "$COMPOSE_FILE" build --no-cache --parallel
    
    log_success "Docker images built successfully"
}

deploy_services() {
    log_info "Deploying production services..."
    
    # Stop existing services
    docker-compose -f "$COMPOSE_FILE" down
    
    # Start services with production configuration
    docker-compose -f "$COMPOSE_FILE" up -d
    
    log_success "Services deployed successfully"
}

wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    # Wait for database
    log_info "Waiting for database..."
    timeout 60 bash -c 'until docker-compose -f "$COMPOSE_FILE" exec db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do sleep 2; done'
    
    # Wait for backend
    log_info "Waiting for backend..."
    timeout 120 bash -c 'until curl -f http://localhost:8000/health; do sleep 5; done'
    
    # Wait for frontend
    log_info "Waiting for frontend..."
    timeout 60 bash -c 'until curl -f http://localhost:3000/health; do sleep 3; done'
    
    log_success "All services are ready"
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check service status
    docker-compose -f "$COMPOSE_FILE" ps
    
    # Check service health
    log_info "Checking service health..."
    
    # Backend health check
    if curl -f http://localhost:8000/health &> /dev/null; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    # Frontend health check
    if curl -f http://localhost:3000 &> /dev/null; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        return 1
    fi
    
    log_success "Deployment verification passed"
}

show_deployment_info() {
    log_info "Deployment Information:"
    echo "=================================="
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend:  http://localhost:8000"
    echo "🗄️  Database: localhost:5432"
    echo "=================================="
    echo ""
    log_info "Useful Commands:"
    echo "  View logs:     docker-compose -f $COMPOSE_FILE logs -f"
    echo "  Stop services: docker-compose -f $COMPOSE_FILE down"
    echo "  Restart:       docker-compose -f $COMPOSE_FILE restart"
    echo "  Status:        docker-compose -f $COMPOSE_FILE ps"
    echo ""
    log_success "Production deployment completed successfully!"
}

# Main deployment process
main() {
    log_info "🚀 Starting VersionIntel Production Deployment"
    echo "=============================================="
    
    # Load environment variables
    if [ -f "$ENV_FILE" ]; then
        set -a
        source "$ENV_FILE"
        set +a
    fi
    
    check_prerequisites
    check_environment
    
    # Ask for confirmation
    log_warning "This will deploy VersionIntel to production mode."
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

# Run main function
main "$@"