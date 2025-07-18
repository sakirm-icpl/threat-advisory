# VersionIntel - Complete Version Detection Research Platform

A comprehensive platform for managing internal version detection research for various service/web/OS applications. This platform allows you to record detection logic like banner grabbing techniques, version regex patterns (Python and Ruby), authentication requirements, and setup instructions per product/vendor.

---

## 📖 Documentation

- **[Quick Setup Guide](SETUP.md)** - For new users getting started
- **[Production Deployment](PRODUCTION_DEPLOYMENT.md)** - For production server setup
- **[CVE Search Integration](CVE_SEARCH_INTEGRATION_SUMMARY.md)** - CVE integration details

## 🚀 Quick Start Options

### Option 1: Docker Deployment (Recommended)
```bash
git clone <repository-url>
cd versionintel
./deploy.sh
```

### Option 2: Local Development
```bash
git clone <repository-url>
cd versionintel
./dev-setup.sh  # Sets up Python venv and Node.js dependencies
```

---

## 🚀 Quick Start (One-Command Deployment)

### Prerequisites
- Docker and Docker Compose installed
- Git

### Deploy in 3 Steps
```bash
# 1. Clone the repository
git clone <repository-url>
cd versionintel

# 2. Run the deployment script (recommended)
./deploy.sh

# OR manually:
# docker-compose up --build -d
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Default Login
- **Username**: `admin`
- **Password**: `admin123`
- **⚠️ Important**: Change the default password after first login!

---

## 🚀 Features

- **Vendor Management**: Add, update, delete, and list vendors
- **Product Management**: Manage products with vendor associations and categories
- **Detection Methods**: Store and manage version detection logic with regex patterns
- **Setup Guides**: Document setup instructions with Docker images and VM requirements
- **Regex Testing**: Test Python and Ruby regex patterns against sample outputs
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Bulk Operations**: Comprehensive data management tools including:
  - Import/export data in JSON/CSV/DOCX/PDF formats
  - Backup/restore functionality
  - Data cleanup tools for orphaned records
  - Bulk delete operations with safety confirmations
  - Import preview before confirming changes
- **Monitoring**: Prometheus metrics and health checks
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Modern Frontend**: React-based web interface with responsive design
- **Markdown Support**: Rich text formatting for product descriptions and setup guides

---

## 🏗️ Architecture

```
versionintel/
├── backend/                 # Flask API Server (port 8000)
├── frontend/                # React Web Application (port 3000)
├── db/                      # Database initialization
├── docker-compose.yml       # Service orchestration
├── deploy.sh               # Automated deployment script
└── README.md
```

---

## 📋 Manual Deployment

If you prefer manual deployment or need to customize:

### 1. Clone and Setup
```bash
git clone <repository-url>
cd versionintel
```

### 2. Configure Environment (Optional)
The deployment script automatically creates the necessary environment files. If you need to customize:

**Frontend Environment** (`frontend/.env`):
```bash
REACT_APP_API_URL=http://localhost:8000
```

**Backend Environment** (in `docker-compose.yml`):
```yaml
    environment:
      - JWT_SECRET_KEY=eec005cbfd76222973f0aa58c1d7fe357745d8c87354a0517ea54a444a87f60c
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/versionintel
```

### 3. Build and Start
```bash
# Build and start all services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## 🚀 Production Deployment

### 1. Server Setup
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

### 2. Deploy Application
```bash
# Clone repository
git clone <repository-url>
cd versionintel

# Update frontend environment for production
echo "REACT_APP_API_URL=http://your-server-ip:8000" > frontend/.env

# Deploy
./deploy.sh
```

### 3. Configure Firewall (Optional)
```bash
# Allow necessary ports
sudo ufw allow 3000  # Frontend
sudo ufw allow 8000  # Backend
sudo ufw allow 22    # SSH
sudo ufw enable
```

### 4. Set Up Domain and HTTPS (Recommended)
Use Nginx as a reverse proxy with Let's Encrypt for HTTPS:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔧 Management Commands

```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f [service_name]

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update and rebuild
docker-compose up --build -d

# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec db psql -U postgres -d versionintel
```

---

## ⚠️ Troubleshooting

### Common Issues

**Frontend can't reach backend?**
- Check if `frontend/.env` has correct `REACT_APP_API_URL`
- Ensure backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`

**Port already in use?**
- Change ports in `docker-compose.yml`
- Check what's using the port: `sudo netstat -tulpn | grep :8000`

**Database connection issues?**
- Check database logs: `docker-compose logs db`
- Ensure database is healthy: `docker-compose ps`

**Permission denied on deploy.sh?**
```bash
chmod +x deploy.sh
```

### Getting Help
1. Check service logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Check health endpoints: http://localhost:8000/health
4. Review API documentation: http://localhost:8000/docs

---

## 📚 API Documentation

- **Interactive API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Metrics**: http://localhost:8000/metrics

---

## 🔐 Security

- Change default admin password after first login
- Use strong JWT secrets in production
- Enable HTTPS in production
- Regularly update dependencies

---

## 📝 Markdown Support

VersionIntel supports Markdown formatting for rich content creation. See `MARKDOWN_GUIDE.md` for detailed usage instructions.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 