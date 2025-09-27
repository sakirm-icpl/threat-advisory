#!/bin/bash

# Project Management Script
# This script provides various management commands for the VersionIntel project.

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show usage information
show_usage() {
    echo "VersionIntel Project Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy           Deploy the application (auto-detect platform)"
    echo "  deploy-linux     Deploy on Linux/Mac"
    echo "  deploy-windows   Deploy on Windows"
    echo "  test             Run all tests"
    echo "  test-backend     Run backend tests only"
    echo "  test-frontend    Run frontend tests only"
    echo "  lint             Run code linting"
    echo "  format           Format code (backend and frontend)"
    echo "  backup           Backup database"
    echo "  restore [file]   Restore database from backup"
    echo "  logs [service]   View service logs"
    echo "  status           Show service status"
    echo "  clean            Clean Docker resources"
    echo "  setup-dev        Setup development environment"
    echo "  docs             Generate/update documentation"
    echo "  help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 test --verbose"
    echo "  $0 logs backend"
    echo "  $0 backup"
    echo "  $0 restore backup_2024_01_01.sql"
}

# Deploy application
deploy_app() {
    print_info "Detecting platform and deploying..."
    
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
        print_info "Windows detected, running Windows deployment script"
        ./deploy-windows.bat
    else
        print_info "Linux/Mac detected, running Linux deployment script"
        ./deploy-linux.sh
    fi
}

# Run tests
run_tests() {
    local test_type="$1"
    local options="$2"
    
    print_info "Running tests: $test_type"
    
    case $test_type in
        "all")
            python tests/run_all_tests.py $options
            ;;
        "backend")
            python tests/run_all_tests.py --backend-only $options
            ;;
        "frontend")
            python tests/run_all_tests.py --frontend-only $options
            ;;
        *)
            print_error "Unknown test type: $test_type"
            exit 1
            ;;
    esac
}

# Run linting
run_lint() {
    print_info "Running code linting..."
    
    # Backend linting
    print_info "Linting backend code..."
    cd backend
    python -m flake8 app/ tests/ || print_warning "Backend linting issues found"
    cd ..
    
    # Frontend linting
    print_info "Linting frontend code..."
    cd frontend
    npm run lint || print_warning "Frontend linting issues found"
    cd ..
    
    print_success "Linting completed"
}

# Format code
format_code() {
    print_info "Formatting code..."
    
    # Backend formatting
    print_info "Formatting backend code..."
    cd backend
    python -m black app/ tests/
    cd ..
    
    # Frontend formatting
    print_info "Formatting frontend code..."
    cd frontend
    npm run format
    cd ..
    
    print_success "Code formatting completed"
}

# Backup database
backup_database() {
    local backup_file="backup_$(date +%Y_%m_%d_%H_%M_%S).sql"
    
    print_info "Creating database backup: $backup_file"
    
    docker-compose exec -T db pg_dump -U postgres versionintel > "$backup_file"
    
    if [ $? -eq 0 ]; then
        print_success "Database backup created: $backup_file"
    else
        print_error "Database backup failed"
        exit 1
    fi
}

# Restore database
restore_database() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file"
        echo "Usage: $0 restore [backup_file.sql]"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_info "Restoring database from: $backup_file"
    print_warning "This will overwrite the current database. Continue? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        docker-compose exec -T db psql -U postgres versionintel < "$backup_file"
        
        if [ $? -eq 0 ]; then
            print_success "Database restored successfully"
        else
            print_error "Database restore failed"
            exit 1
        fi
    else
        print_info "Database restore cancelled"
    fi
}

# View service logs
view_logs() {
    local service="$1"
    
    if [ -z "$service" ]; then
        print_info "Showing logs for all services"
        docker-compose logs -f
    else
        print_info "Showing logs for service: $service"
        docker-compose logs -f "$service"
    fi
}

# Show service status
show_status() {
    print_info "Service Status:"
    docker-compose ps
    
    echo ""
    print_info "System Health:"
    
    # Check if services are responding
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "Backend API: Healthy"
    else
        print_error "Backend API: Not responding"
    fi
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend: Healthy"
    else
        print_error "Frontend: Not responding"
    fi
}

# Clean Docker resources
clean_docker() {
    print_warning "This will remove all Docker containers, images, and volumes. Continue? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_info "Cleaning Docker resources..."
        
        docker-compose down -v --remove-orphans
        docker system prune -a -f
        docker volume prune -f
        
        print_success "Docker cleanup completed"
    else
        print_info "Docker cleanup cancelled"
    fi
}

# Setup development environment
setup_dev() {
    print_info "Setting up development environment..."
    
    # Check prerequisites
    command -v python3 >/dev/null 2>&1 || { print_error "Python 3 is required but not installed."; exit 1; }
    command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed."; exit 1; }
    command -v docker >/dev/null 2>&1 || { print_error "Docker is required but not installed."; exit 1; }
    
    # Setup backend
    print_info "Setting up backend development environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install -r requirements-test.txt
    cd ..
    
    # Setup frontend
    print_info "Setting up frontend development environment..."
    cd frontend
    npm install
    cd ..
    
    # Copy environment file if it doesn't exist
    if [ ! -f ".env" ]; then
        cp env.example .env
        print_warning "Environment file created. Please edit .env with your configuration."
    fi
    
    print_success "Development environment setup completed"
}

# Generate/update documentation
update_docs() {
    print_info "Updating documentation..."
    
    # Generate API documentation (if you have a script for this)
    # This could include generating OpenAPI specs, updating README, etc.
    
    print_info "Documentation update completed"
    print_info "Documentation available at: docs/"
}

# Main script logic
case "$1" in
    "deploy")
        deploy_app
        ;;
    "deploy-linux")
        ./deploy-linux.sh
        ;;
    "deploy-windows")
        ./deploy-windows.bat
        ;;
    "test")
        run_tests "all" "$2"
        ;;
    "test-backend")
        run_tests "backend" "$2"
        ;;
    "test-frontend")
        run_tests "frontend" "$2"
        ;;
    "lint")
        run_lint
        ;;
    "format")
        format_code
        ;;
    "backup")
        backup_database
        ;;
    "restore")
        restore_database "$2"
        ;;
    "logs")
        view_logs "$2"
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_docker
        ;;
    "setup-dev")
        setup_dev
        ;;
    "docs")
        update_docs
        ;;
    "help"|"--help"|"-h"|"")
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac