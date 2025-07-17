# VersionIntel Setup Guide

This guide will help you set up VersionIntel on your local machine or server.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd versionintel
```

### 2. Run the Application
```bash
# Option 1: Use the automated deployment script (recommended)
./deploy.sh

# Option 2: Manual deployment
docker-compose up --build -d
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 4. Login
- **Username**: `admin`
- **Password**: `Admin@1234`

⚠️ **Important**: Change the default password after first login!

## 🛠️ Development Setup

If you want to develop locally (without Docker):

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Linux/Mac
# or
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export FLASK_ENV=development
export FLASK_DEBUG=1
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/versionintel

# Run the application
python wsgi.py
```

### Frontend Development
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start development server
npm start
```

### Database Setup (for local development)
```bash
# Start only the database
docker-compose up db -d

# Initialize database
cd backend
python init_database.py
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
If you get port conflicts, you can modify the ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
  - "8001:5000"  # Change 8000 to 8001
```

#### 2. Database Connection Issues
If the backend can't connect to the database:
```bash
# Check if database container is running
docker-compose ps

# View database logs
docker-compose logs db

# Restart the database
docker-compose restart db
```

#### 3. Frontend Can't Connect to Backend
Check the `REACT_APP_API_URL` in `frontend/.env`:
```bash
# Should point to your backend URL
REACT_APP_API_URL=http://localhost:8000
```

#### 4. Permission Issues
If you get permission errors:
```bash
# Make deploy script executable
chmod +x deploy.sh

# Run with sudo if needed
sudo docker-compose up --build -d
```

#### 5. Python Environment Issues
If you get "externally-managed-environment" errors:
```bash
# Use virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Or use Docker (recommended)
docker-compose up --build -d
```

### Useful Commands

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose up --build -d

# Check service status
docker-compose ps

# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec db psql -U postgres -d versionintel
```

### Environment Variables

You can customize the application by setting environment variables:

#### Backend (in docker-compose.yml)
```yaml
environment:
  - SECRET_KEY=your-secret-key
  - JWT_SECRET_KEY=your-jwt-secret
  - DATABASE_URL=postgresql://user:pass@host:port/db
  - NVD_API_KEY=your-nvd-api-key
```

#### Frontend (in frontend/.env)
```bash
REACT_APP_API_URL=http://your-backend-url:8000
```

### Production Deployment

For production deployment:

1. **Change default passwords** in `docker-compose.yml`
2. **Update secret keys** for security
3. **Configure SSL/TLS** using a reverse proxy
4. **Set up proper firewall rules**
5. **Use environment-specific configuration**

### Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify all prerequisites are installed
3. Ensure ports are not in use by other applications
4. Check your network configuration

## Architecture

```
versionintel/
├── backend/          # Flask API (port 8000)
├── frontend/         # React App (port 3000)
├── db/              # Database initialization
├── docker-compose.yml
├── deploy.sh        # Automated deployment
└── README.md
```

The application uses:
- **PostgreSQL** for data storage
- **Flask** for the backend API
- **React** for the frontend
- **Docker** for containerization
- **Nginx** for serving the frontend 