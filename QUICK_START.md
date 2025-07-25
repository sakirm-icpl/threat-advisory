# VersionIntel Quick Start Guide

Get VersionIntel up and running in minutes with this quick start guide.

## 🚀 One-Command Deployment

### Prerequisites
- Docker and Docker Compose installed
- Git installed
- 2GB+ RAM available

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd versionintel

# Deploy with one command
./build-and-deploy.sh    # Linux/Mac
# OR
build-and-deploy.bat     # Windows
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Default Login
- **Username**: `admin`
- **Password**: `Admin@1234`
- **⚠️ Important**: Change the default password after first login!

## 📋 What You Get

### Core Features
- **Vendor Management**: Add and manage software vendors
- **Product Management**: Organize products by vendor
- **Detection Methods**: Store version detection logic and regex patterns
- **CVE Integration**: Search and analyze vulnerability data
- **Setup Guides**: Document installation procedures
- **Bulk Operations**: Import/export data in multiple formats
- **User Management**: Role-based access control

### Technical Stack
- **Backend**: Flask API with PostgreSQL database
- **Frontend**: React with Tailwind CSS
- **Containerization**: Docker and Docker Compose
- **Authentication**: JWT-based security
- **API Documentation**: Interactive Swagger/OpenAPI

## 🔧 Development Setup

### Local Development (Without Docker)
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python wsgi.py

# Frontend (in another terminal)
cd frontend
npm install
npm start
```

### Database Setup
```bash
# Start database only
docker-compose up db -d

# Initialize database
cd backend && python init_database.py
```

## 📚 Documentation

### Essential Reading
1. **[README.md](README.md)** - Main project documentation
2. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
3. **[API.md](API.md)** - Complete API reference
4. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Issue resolution

### Quick Commands
```bash
# Service management
docker-compose ps              # Check status
docker-compose logs -f         # View logs
docker-compose restart         # Restart services
docker-compose down            # Stop services

# Development
docker-compose exec backend bash    # Backend shell
docker-compose exec db psql -U postgres -d versionintel  # Database access
```

## 🚀 Production Deployment

### Quick Production Setup
```bash
# 1. Update security settings
# Edit docker-compose.yml and change default passwords

# 2. Deploy
./build-and-deploy.sh

# 3. Configure SSL (recommended)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Security Checklist
- [ ] Change default admin password
- [ ] Update JWT secrets
- [ ] Configure SSL/TLS
- [ ] Set up firewall rules
- [ ] Enable monitoring

## 🔍 Troubleshooting

### Common Issues
```bash
# Services not starting
docker-compose logs -f

# Port conflicts
netstat -tulpn | grep :8000

# Permission errors
chmod +x build-and-deploy.sh

# Database issues
docker-compose restart db
```

### Health Checks
```bash
# Check if services are running
curl http://localhost:8000/health
curl http://localhost:3000

# Check resource usage
docker stats
```

## 📞 Support

### Getting Help
1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Review service logs: `docker-compose logs -f`
3. Verify prerequisites are installed
4. Ensure ports are available

### Useful Information
- **System Requirements**: 2GB RAM, 1GB storage
- **Supported OS**: Linux, macOS, Windows
- **Docker Version**: 20.10+
- **Docker Compose**: 2.0+

## 🎯 Next Steps

### After Installation
1. **Explore the Interface**: Navigate through all sections
2. **Add Your First Vendor**: Start with a familiar software vendor
3. **Create Products**: Add products under your vendor
4. **Define Detection Methods**: Create version detection patterns
5. **Test CVE Search**: Try searching for vulnerabilities
6. **Import Data**: Use bulk operations for large datasets

### Customization
- **Branding**: Update logos and colors in frontend
- **Configuration**: Modify environment variables
- **Extensions**: Add custom detection methods
- **Integration**: Connect with external APIs

### Production Considerations
- **Backup Strategy**: Set up automated database backups
- **Monitoring**: Configure health checks and alerting
- **Scaling**: Plan for horizontal scaling if needed
- **Security**: Regular security audits and updates

---

**Need more help?** Check the comprehensive documentation in the other markdown files or review the troubleshooting guide for specific issues. 