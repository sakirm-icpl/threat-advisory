# VersionIntel Deployment Guide

Complete deployment guide for VersionIntel covering local development, staging, and production environments.

## 📋 Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Security Hardening](#security-hardening)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

## 🏠 Local Development

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 13+
- Git

### Step-by-Step Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd versionintel
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/versionintel
export SECRET_KEY=your-secret-key-here
export JWT_SECRET_KEY=your-jwt-secret-here

# Run backend
python wsgi.py
```

#### 3. Database Setup
```bash
# Start PostgreSQL (if not already running)
# Linux: sudo systemctl start postgresql
# Mac: brew services start postgresql
# Windows: Start PostgreSQL service

# Create database
createdb versionintel

# Initialize database
cd backend
python init_database.py
```

#### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Start development server
npm start
```

#### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🐳 Docker Deployment

### Quick Start
```bash
# Clone and deploy
git clone <repository-url>
cd versionintel
./build-and-deploy.sh    # Linux/Mac
# OR
build-and-deploy.bat     # Windows
```

### Manual Docker Deployment
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Docker Commands Reference
```bash
# Service management
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose restart            # Restart services
docker-compose ps                 # Check status
docker-compose logs -f [service]  # View logs

# Development
docker-compose exec backend bash  # Backend shell
docker-compose exec db psql -U postgres -d versionintel  # Database access

# Maintenance
docker-compose pull               # Update images
docker system prune -f            # Clean up
```

## 🚀 Production Deployment

### Pre-Deployment Checklist

#### Security Requirements
- [ ] Change all default passwords
- [ ] Generate secure secret keys
- [ ] Configure SSL/TLS certificates
- [ ] Set up firewall rules
- [ ] Enable security monitoring

#### Infrastructure Requirements
- [ ] Server with 2GB+ RAM
- [ ] 10GB+ storage space
- [ ] Docker and Docker Compose installed
- [ ] Domain name configured
- [ ] SSL certificates obtained

### Server Setup

#### 1. System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git ufw fail2ban

# Configure firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

#### 2. Docker Installation
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 3. Application Deployment
```bash
# Clone repository
git clone <repository-url>
cd versionintel

# Generate secure keys
openssl rand -hex 32  # For SECRET_KEY
openssl rand -hex 32  # For JWT_SECRET_KEY

# Update docker-compose.yml with production settings
# (See Environment Configuration section)

# Deploy
./build-and-deploy.sh
```

### SSL/TLS Configuration

#### Using Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Nginx Reverse Proxy Configuration
```nginx
# /etc/nginx/sites-available/versionintel
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health checks
    location /health {
        proxy_pass http://localhost:8000/health;
        access_log off;
    }
}
```

## ⚙️ Environment Configuration

### Production Environment Variables

#### Backend (.env or docker-compose.yml)
```bash
# Security
SECRET_KEY=your-64-character-secret-key
JWT_SECRET_KEY=your-64-character-jwt-secret
JWT_ACCESS_TOKEN_EXPIRES=3600

# Database
DATABASE_URL=postgresql://username:password@db:5432/versionintel
POSTGRES_USER=versionintel_user
POSTGRES_PASSWORD=your-secure-database-password
POSTGRES_DB=versionintel

# External APIs
NVD_API_KEY=your-nvd-api-key

# Application
FLASK_ENV=production
FLASK_DEBUG=0
LOG_LEVEL=INFO
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_ENVIRONMENT=production
```

### Docker Compose Production Configuration
```yaml
version: '3.8'

services:
  db:
    image: postgres:13
    environment:
      POSTGRES_USER: versionintel_user
      POSTGRES_PASSWORD: your-secure-password
      POSTGRES_DB: versionintel
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "127.0.0.1:5432:5432"  # Only local access
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U versionintel_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    depends_on:
      db:
        condition: service_healthy
    environment:
      - FLASK_ENV=production
      - FLASK_DEBUG=0
      - SECRET_KEY=your-secret-key
      - JWT_SECRET_KEY=your-jwt-secret
      - DATABASE_URL=postgresql://versionintel_user:password@db:5432/versionintel
      - NVD_API_KEY=your-nvd-api-key
    ports:
      - "127.0.0.1:8000:5000"  # Only local access
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'

  frontend:
    build: ./frontend
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=https://your-domain.com/api
    ports:
      - "127.0.0.1:3000:3000"  # Only local access
    restart: unless-stopped

volumes:
  postgres_data:
```

## 🔒 Security Hardening

### Password Security
```bash
# Generate secure passwords
openssl rand -base64 32

# Change default admin password
# Access web interface and change admin password
```

### Database Security
```sql
-- Create dedicated user
CREATE USER versionintel_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE versionintel TO versionintel_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO versionintel_user;
```

### Container Security
```yaml
# Add to docker-compose.yml
services:
  backend:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/tmp
    user: "1000:1000"
```

### Network Security
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Install fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📊 Monitoring & Maintenance

### Health Monitoring
```bash
# Create health check script
#!/bin/bash
# /usr/local/bin/versionintel-health.sh

FRONTEND_URL="https://your-domain.com"
BACKEND_URL="https://your-domain.com/api/health"

# Check frontend
if curl -f $FRONTEND_URL > /dev/null 2>&1; then
    echo "Frontend: OK"
else
    echo "Frontend: FAILED"
    # Send alert
fi

# Check backend
if curl -f $BACKEND_URL > /dev/null 2>&1; then
    echo "Backend: OK"
else
    echo "Backend: FAILED"
    # Send alert
fi
```

### Automated Backups
```bash
#!/bin/bash
# /usr/local/bin/versionintel-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/versionintel"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T db pg_dump -U versionintel_user versionintel > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Clean old backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

### Log Management
```bash
# Configure log rotation
sudo tee /etc/logrotate.d/versionintel << EOF
/var/log/versionintel/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose restart backend
    endscript
}
EOF
```

### Performance Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor resource usage
docker stats

# Check disk usage
df -h
du -sh /var/lib/docker/volumes/versionintel_postgres_data
```

## 🔧 Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check Docker status
sudo systemctl status docker

# Check available ports
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000

# Check disk space
df -h

# Check memory
free -h
```

#### Database Issues
```bash
# Check database logs
docker-compose logs db

# Test database connection
docker-compose exec db psql -U versionintel_user -d versionintel -c "SELECT 1;"

# Reset database (WARNING: Data loss)
docker-compose down
docker volume rm versionintel_postgres_data
docker-compose up -d
```

#### Frontend Issues
```bash
# Check frontend logs
docker-compose logs frontend

# Verify API URL
docker-compose exec frontend env | grep REACT_APP_API_URL

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

#### Backend Issues
```bash
# Check backend logs
docker-compose logs backend

# Test backend health
curl -f http://localhost:8000/health

# Check environment variables
docker-compose exec backend env | grep -E "(SECRET_KEY|DATABASE_URL)"

# Restart backend
docker-compose restart backend
```

### Performance Issues

#### High Memory Usage
```bash
# Check memory usage
docker stats

# Optimize container limits
# Add to docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
```

#### Slow Database Queries
```bash
# Check database performance
docker-compose exec db psql -U versionintel_user -d versionintel -c "SELECT * FROM pg_stat_activity;"

# Analyze table statistics
docker-compose exec db psql -U versionintel_user -d versionintel -c "ANALYZE;"
```

### Recovery Procedures

#### Complete System Recovery
```bash
# Stop all services
docker-compose down

# Backup current data
docker-compose exec -T db pg_dump -U versionintel_user versionintel > recovery_backup.sql

# Restore from backup
docker-compose up -d db
sleep 10
docker-compose exec -T db psql -U versionintel_user -d versionintel < recovery_backup.sql

# Restart services
docker-compose up -d
```

#### Database Recovery
```bash
# Stop backend
docker-compose stop backend

# Restore database
docker-compose exec -T db psql -U versionintel_user -d versionintel < backup_file.sql

# Restart backend
docker-compose start backend
```

## 📞 Support

For additional support:
1. Check the troubleshooting section above
2. Review application logs: `docker-compose logs -f`
3. Verify system resources and network connectivity
4. Check the main README.md for quick fixes
5. Ensure all security requirements are met

## 🔄 Updates and Maintenance

### Regular Maintenance Schedule
- **Daily**: Health checks and log monitoring
- **Weekly**: Security updates and performance review
- **Monthly**: Database backups and system updates
- **Quarterly**: Full security audit and performance optimization

### Update Procedures
```bash
# Update application
git pull origin main
docker-compose build
docker-compose up -d

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
``` 