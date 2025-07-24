# VersionIntel - Version Detection Research Platform

A comprehensive platform for managing internal version detection research for various service/web/OS applications. This platform allows you to record detection logic like banner grabbing techniques, version regex patterns (Python and Ruby), authentication requirements, and setup instructions per product/vendor.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### One-Command Deployment
```bash
git clone <repository-url>
cd versionintel
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

## 🚀 Features

- **Vendor Management**: Add, update, delete, and list vendors
- **Product Management**: Manage products with vendor associations and categories
- **Detection Methods**: Store and manage version detection logic with regex patterns
- **CVE Integration**: Search and analyze CVE data for security research
- **Setup Guides**: Document setup instructions with Docker images and VM requirements
- **Regex Testing**: Test Python and Ruby regex patterns against sample outputs
- **Authentication & Authorization**: JWT-based authentication with role-based access control
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
└── build-and-deploy.sh     # Deployment script
```

## 📖 Documentation

- **[Setup Guide](SETUP.md)** - Detailed installation and configuration
- **[Production Deployment](PRODUCTION_DEPLOYMENT.md)** - Production setup and security
- **[API Reference](http://localhost:8000/docs)** - Interactive API documentation
- **[Troubleshooting](#troubleshooting)** - Common issues and solutions

## 🔧 Development

### Local Development Setup
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt

# Frontend
cd frontend
npm install
npm start
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
```

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
chmod +x build-and-deploy.sh
```

## 🔐 Security Notes

- **Change default credentials** after first login
- **Update JWT secrets** in production
- **Enable HTTPS** for production deployments
- **Regular security updates** recommended

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 