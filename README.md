# VersionIntel - Version Detection Research Platform

A comprehensive platform for managing internal version detection research for various service/web/OS applications. This platform allows you to record detection logic like banner grabbing techniques, version regex patterns (Python and Ruby), authentication requirements, and setup instructions per product/vendor.

## 🚀 Quick Start

### Prerequisites
- **Docker**: 20.10 or higher
- **Docker Compose**: 2.0 or higher
- **Git**: Latest version
- **Operating System**: Linux, macOS, or Windows
- **RAM**: Minimum 2GB available
- **Storage**: 1GB free space

### One-Command Deployment
```bash
git clone <repository-url>
cd versionintel

# Create .env file with your configuration (see env.example)
cp env.example .env
# Edit .env file with your settings

# Run deployment
./deploy.sh    # Linux/Mac
# OR
deploy.bat     # Windows
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Default Login
- **Username**: `admin`
- **Password**: `Admin@1234`
- **⚠️ Important**: Change the default password after first login!

## 🎯 Features

- **Vendor Management**: Add, update, delete, and list vendors
- **Product Management**: Manage products with vendor associations and categories
- **Detection Methods**: Store and manage version detection logic with regex patterns
- **CVE Integration**: Search and analyze CVE data with intelligent query parsing (supports Vendor@Product format)
- **Setup Guides**: Document setup instructions with Docker images and VM requirements
- **Regex Testing**: Test Python and Ruby regex patterns against sample outputs
- **Authentication & Authorization**: GitHub OAuth 2.0 with role-based access control (Admin/Contributor roles)
- **Bulk Operations**: Import/export data in JSON/CSV/DOCX/PDF formats
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Modern Frontend**: React-based web interface with responsive design

## 🏗️ Architecture

```
versionintel/
├── backend/                 # Flask API Server (port 8000)
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── config.py       # Configuration
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── frontend/               # React Web Application (port 3000)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── contexts/       # React contexts
│   ├── package.json        # Node.js dependencies
│   └── Dockerfile
├── db/                     # Database initialization
├── docker-compose.yml      # Service orchestration
└── deploy.sh              # Deployment script
```

## 🔧 Development Setup

### Local Development (Without Docker)
```bash
# Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/versionintel
python wsgi.py

# Frontend Setup (in another terminal)
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:8000" > .env
npm start
```

### Database Setup for Development
```bash
# Start database only
docker-compose up db -d

# Initialize database
cd backend && python init_database.py
```

## 🚀 Production Deployment

### Pre-Deployment Checklist

**Critical Security Updates Required:**

```yaml
# Update docker-compose.yml environment variables
environment:
  - SECRET_KEY=generate-new-secure-key-here
  - JWT_SECRET_KEY=generate-new-jwt-secret-here
  - POSTGRES_PASSWORD=your-secure-database-password
```

**Default Credentials to Change:**
- Admin User: `admin` / `Admin@1234`
- Database: `postgres` / `postgres`

⚠️ **CRITICAL**: Change ALL default passwords before production deployment!

### Server Setup

#### Install Docker
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

#### Network Security
```bash
# Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### SSL/TLS Setup (Recommended)

#### Nginx Reverse Proxy
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Production Deployment
```bash
# Clone and configure
git clone <repository-url>
cd versionintel

# Update production settings in docker-compose.yml
# - Change SECRET_KEY and JWT_SECRET_KEY
# - Update POSTGRES_PASSWORD
# - Set REACT_APP_API_URL to your domain

# Deploy
deploy.sh
# OR on Windows
deploy.bat
```

### Production Optimizations
```yaml
# Add to docker-compose.yml
services:
  backend:
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

### Backup Strategy
```bash
#!/bin/bash
# Create automated backup script
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db pg_dump -U postgres versionintel > backup_$DATE.sql
```

## 🔍 Monitoring & Maintenance

### Health Checks
- Backend: `http://your-domain:8000/health`
- Frontend: `http://your-domain:3000`
- Metrics: `http://your-domain:8000/metrics`

### Regular Maintenance
- [ ] Weekly security updates
- [ ] Monthly database backups
- [ ] Quarterly performance reviews

## ⚠️ Troubleshooting

### Common Issues

**Services won't start?**
```bash
# Check Docker is running
docker --version
docker-compose --version

# Check logs
docker-compose logs -f
```

**Frontend can't reach backend?**
- Verify `frontend/.env` has correct `REACT_APP_API_URL=http://localhost:8000`
- Check backend is running: `docker-compose ps`

**Port conflicts?**
- Modify ports in `docker-compose.yml`
- Check port usage: `netstat -tulpn | grep :8000`

**Permission errors?**
```bash
chmod +x deploy.sh
```

**Database connection issues?**
```bash
# Check database status
docker-compose ps db

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

**Memory issues?**
```bash
# Check resource usage
docker stats

# Clean up Docker
docker system prune -f
```

### Useful Commands
```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f [service_name]

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec db psql -U postgres -d versionintel

# Rebuild and deploy
deploy.sh  # Linux/Mac
# OR
deploy.bat # Windows
```

## 🔐 Security Notes

- **Change default credentials** after first login
- **Update JWT secrets** in production
- **Enable HTTPS** for production deployments
- **Regular security updates** recommended
- **Set up proper firewall rules**
- **Use strong passwords** for all services

## 📚 API Documentation

Once the application is running, you can access:
- **Interactive API Docs**: http://localhost:8000/apidocs/
- **OpenAPI Schema**: http://localhost:8000/apispec_1.json
- **Complete RBAC Guide**: [RBAC_API_DOCUMENTATION.md](./RBAC_API_DOCUMENTATION.md)

### Authentication
**GitHub OAuth (Primary)**
```http
# Step 1: Initiate OAuth
GET /auth/github/login?redirect_uri=http://localhost:3000/auth/callback

# Step 2: Handle callback (returns JWT tokens)
GET /auth/github/callback?code=oauth_code
```

**Legacy Login (Deprecated)**
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@1234"
}
```

### Using Authentication
```http
Authorization: Bearer <your-jwt-token>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues:
1. Check service logs: `docker-compose logs -f`
2. Verify prerequisites are installed
3. Ensure ports are available
4. Review troubleshooting section above
5. Check the health endpoints

## 🎯 Production Checklist

- [ ] Update all default passwords
- [ ] Configure SSL/TLS certificates
- [ ] Set up firewall rules
- [ ] Create backup procedures
- [ ] Test all functionality
- [ ] Monitor resource usage
- [ ] Document access procedures
- [ ] Set up monitoring and alerting
- [ ] Configure log rotation
- [ ] Test disaster recovery procedures 