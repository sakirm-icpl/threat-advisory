# Development Setup

This guide will help you set up a complete development environment for VersionIntel, including all tools, dependencies, and development workflows.

## Prerequisites

### Required Software

Before setting up the development environment, ensure you have the following installed:

#### Essential Tools
- **Python 3.9+**: Backend development
- **Node.js 16+**: Frontend development
- **PostgreSQL 13+**: Database development
- **Git**: Version control
- **Docker & Docker Compose**: Containerized development

#### Recommended Tools
- **VS Code**: IDE with excellent Python/React support
- **Postman**: API testing
- **PostgreSQL GUI**: Database administration (pgAdmin, DBeaver)
- **Redis**: Caching (for advanced features)

### Platform-Specific Installation

#### Linux (Ubuntu/Debian)
```bash
# Update package lists
sudo apt update

# Install Python and essential packages
sudo apt install python3.9 python3.9-dev python3-pip python3-venv

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Docker
sudo apt install docker.io docker-compose

# Install Git
sudo apt install git
```

#### macOS
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install python@3.9 node postgresql git docker docker-compose

# Start PostgreSQL service
brew services start postgresql
```

#### Windows
```powershell
# Install using Chocolatey (run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install packages
choco install python nodejs postgresql git docker-desktop
```

## Repository Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd versionintel

# Create development branch
git checkout -b development
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env.development

# Edit development configuration
nano .env.development
```

#### Development Environment Variables
```bash
# Development Configuration
FLASK_ENV=development
FLASK_DEBUG=1

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=versionintel_dev
POSTGRES_PASSWORD=dev_password
POSTGRES_DB=versionintel_dev

# Server Configuration
SERVER_HOST=localhost
BACKEND_PORT=8000
FRONTEND_PORT=3000

# CORS Configuration (allow dev ports)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000

# Security Keys (development only)
SECRET_KEY=development-secret-key-not-for-production
JWT_SECRET_KEY=development-jwt-secret-key-not-for-production

# GitHub OAuth (create separate dev app)
GITHUB_CLIENT_ID=your_dev_github_client_id
GITHUB_CLIENT_SECRET=your_dev_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback

# Google AI Configuration
GOOGLE_API_KEY=your_development_api_key

# NVD API Configuration
NVD_API_KEY=your_development_nvd_key
```

## Backend Development Setup

### 1. Python Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip
```

### 2. Install Dependencies

```bash
# Install production dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-test.txt

# Install additional development tools
pip install black flake8 mypy pytest-cov pre-commit
```

### 3. Database Setup

```bash
# Create development database
createdb versionintel_dev

# Run database migrations
python init_database.py

# Create test database
createdb versionintel_test
```

### 4. Development Server

```bash
# Start development server with auto-reload
python -m flask run --host=0.0.0.0 --port=8000 --debug

# Alternative: Use development script
python wsgi.py
```

### 5. Testing Setup

```bash
# Run all tests
python -m pytest

# Run tests with coverage
python -m pytest --cov=app

# Run specific test file
python -m pytest tests/test_auth.py

# Run tests in watch mode
python -m pytest-watch
```

## Frontend Development Setup

### 1. Node.js Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install development dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom eslint prettier
```

### 2. Environment Configuration

```bash
# Create frontend development environment
cat > .env.development << EOF
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GITHUB_CLIENT_ID=your_dev_github_client_id
REACT_APP_ENVIRONMENT=development
EOF
```

### 3. Development Server

```bash
# Start development server with hot reload
npm start

# Start on specific port
PORT=3001 npm start

# Start with HTTPS (if needed)
HTTPS=true npm start
```

### 4. Frontend Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/components/Dashboard.test.js
```

## Database Development

### 1. PostgreSQL Setup

```bash
# Start PostgreSQL service
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS

# Create development user
sudo -u postgres createuser --superuser versionintel_dev
sudo -u postgres psql -c "ALTER USER versionintel_dev PASSWORD 'dev_password';"

# Create databases
createdb -U versionintel_dev versionintel_dev
createdb -U versionintel_dev versionintel_test
```

### 2. Database Migrations

```bash
# Initialize Alembic (if not already done)
alembic init alembic

# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Downgrade to previous migration
alembic downgrade -1
```

### 3. Database Tools

```bash
# Connect to development database
psql -U versionintel_dev -d versionintel_dev

# Dump database for backup
pg_dump -U versionintel_dev versionintel_dev > backup.sql

# Restore database from backup
psql -U versionintel_dev versionintel_dev < backup.sql
```

## IDE Configuration

### VS Code Setup

#### Recommended Extensions
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.flake8",
    "ms-python.black-formatter",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-python.pylint",
    "ms-toolsai.jupyter"
  ]
}
```

#### VS Code Settings
```json
{
  "python.defaultInterpreterPath": "./backend/venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "files.associations": {
    "*.env": "plaintext"
  }
}
```

#### Launch Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Flask",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/wsgi.py",
      "env": {
        "FLASK_ENV": "development",
        "FLASK_DEBUG": "1"
      },
      "args": [],
      "jinja": true
    },
    {
      "name": "Python: Pytest",
      "type": "python",
      "request": "launch",
      "module": "pytest",
      "args": ["${workspaceFolder}/backend/tests"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Development Workflow

### 1. Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature: description"

# Push feature branch
git push origin feature/new-feature

# Create pull request (via GitHub interface)
```

### 2. Code Quality Tools

#### Pre-commit Hooks
```bash
# Install pre-commit
pip install pre-commit

# Install git hook scripts
pre-commit install

# Run against all files
pre-commit run --all-files
```

#### Pre-commit Configuration (`.pre-commit-config.yaml`)
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 22.10.0
    hooks:
      - id: black
        language_version: python3

  - repo: https://github.com/pycqa/flake8
    rev: 5.0.4
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.0-alpha.4
    hooks:
      - id: prettier
        files: \.(js|jsx|ts|tsx|json|css|md)$
```

### 3. Testing Strategy

#### Backend Testing
```bash
# Unit tests
python -m pytest tests/unit/

# Integration tests
python -m pytest tests/integration/

# API tests
python -m pytest tests/api/

# Test specific functionality
python -m pytest -k "test_auth"
```

#### Frontend Testing
```bash
# Unit tests
npm test -- --testPathPattern=src/components

# Integration tests
npm test -- --testPathPattern=src/integration

# E2E tests (if configured)
npm run test:e2e
```

### 4. Development Commands

#### Useful Scripts
```bash
# Backend development
./scripts/dev-backend.sh

# Frontend development
./scripts/dev-frontend.sh

# Run all tests
./scripts/test-all.sh

# Database reset
./scripts/reset-db.sh

# Code formatting
./scripts/format-code.sh
```

#### Package Scripts (`package.json`)
```json
{
  "scripts": {
    "dev": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/"
  }
}
```

## Debugging

### Backend Debugging

#### Flask Debug Mode
```python
# wsgi.py
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
```

#### Python Debugger
```python
# Add breakpoint in code
import pdb; pdb.set_trace()

# Or use newer breakpoint() function
breakpoint()
```

#### Logging Configuration
```python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s %(name)s %(message)s'
)
```

### Frontend Debugging

#### React Developer Tools
- Install React DevTools browser extension
- Use Components and Profiler tabs

#### Console Debugging
```javascript
// Add debugging statements
console.log('Debug info:', data);
console.table(array);
console.group('Group label');
```

#### Source Maps
Ensure source maps are enabled for debugging:
```json
{
  "scripts": {
    "start": "GENERATE_SOURCEMAP=true react-scripts start"
  }
}
```

## Performance Optimization

### Backend Optimization

#### Database Optimization
```python
# Use database indexes
# Add to models
class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), index=True)  # Indexed
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), index=True)
```

#### API Optimization
```python
# Use pagination for large datasets
@app.route('/api/products')
def get_products():
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    
    products = Product.query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'products': [p.to_dict() for p in products.items],
        'pagination': {
            'page': page,
            'pages': products.pages,
            'total': products.total
        }
    })
```

### Frontend Optimization

#### Code Splitting
```javascript
// Lazy load components
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./components/AdminPanel'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPanel />
    </Suspense>
  );
}
```

#### Performance Monitoring
```javascript
// Use React Profiler
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component:', id, 'Phase:', phase, 'Duration:', actualDuration);
}

<Profiler id="Dashboard" onRender={onRenderCallback}>
  <Dashboard />
</Profiler>
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :8000
netstat -tulpn | grep :8000

# Kill process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database exists
psql -l
```

#### Python Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Node.js Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

This development setup guide provides everything needed to start contributing to VersionIntel. The environment is designed to be productive, maintainable, and consistent across different development machines.