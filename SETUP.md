# VersionIntel Setup Guide

Detailed installation and configuration guide for VersionIntel.

## System Requirements

- **Docker**: 20.10 or higher
- **Docker Compose**: 2.0 or higher
- **Git**: Latest version
- **Operating System**: Linux, macOS, or Windows
- **RAM**: Minimum 2GB available
- **Storage**: 1GB free space

## Installation Methods

### Method 1: Automated Deployment (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd versionintel

# Run deployment script
./build-and-deploy.sh    # Linux/Mac
build-and-deploy.bat     # Windows
```

### Method 2: Manual Docker Deployment

```bash
# Clone repository
git clone <repository-url>
cd versionintel

# Create frontend environment
echo "REACT_APP_API_URL=http://localhost:8000" > frontend/.env

# Build and start services
docker-compose up --build -d
```

## First Time Setup

1. **Access the application**: http://localhost:3000
2. **Login with default credentials**:
   - Username: `admin`
   - Password: `Admin@1234`
3. **Change default password** immediately after login
4. **Verify all services** are running: `docker-compose ps`

## 🛠️ Development Setup

For local development without Docker:

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 13+

### Backend Development
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/versionintel
python wsgi.py
```

### Frontend Development
```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:8000" > .env
npm start
```

### Database Setup
```bash
# Start database only
docker-compose up db -d

# Initialize database
cd backend && python init_database.py
```

## Configuration

### Environment Variables

#### Backend (docker-compose.yml)
```yaml
environment:
  - SECRET_KEY=your-secret-key
  - JWT_SECRET_KEY=your-jwt-secret
  - DATABASE_URL=postgresql://user:pass@host:port/db
  - NVD_API_KEY=your-nvd-api-key
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8000
```

## Troubleshooting

### Quick Fixes

**Port conflicts?**
```bash
# Modify ports in docker-compose.yml
ports:
  - "3001:3000"  # Frontend
  - "8001:5000"  # Backend
```

**Services not starting?**
```bash
# Check logs
docker-compose logs -f

# Restart services
docker-compose restart
```

**Permission errors?**
```bash
chmod +x build-and-deploy.sh
```

**Frontend can't reach backend?**
- Verify `REACT_APP_API_URL=http://localhost:8000` in `frontend/.env`

### Useful Commands

```bash
# Service management
docker-compose ps              # Check status
docker-compose logs -f         # View logs
docker-compose down            # Stop services
docker-compose restart         # Restart services

# Development
docker-compose exec backend bash    # Backend shell
docker-compose exec db psql -U postgres -d versionintel  # Database access
```

## Support

For issues:
1. Check service logs: `docker-compose logs -f`
2. Verify prerequisites are installed
3. Ensure ports are available
4. Review [Production Deployment](PRODUCTION_DEPLOYMENT.md) for advanced setup 