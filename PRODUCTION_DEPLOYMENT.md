# VersionIntel Production Deployment Guide

Complete guide for deploying VersionIntel in production environments.

## 🚀 Pre-Deployment Checklist

### 1. Security Configuration

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

### 2. Server Setup

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

### 3. SSL/TLS Setup (Recommended)

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

### 4. Database Security
```sql
-- Change default passwords
ALTER USER postgres PASSWORD 'your-secure-password';
ALTER USER versionintel PASSWORD 'your-secure-password';
```

## 🚀 Deployment Process

### 1. Initial Deployment
```bash
# Clone and configure
git clone <repository-url>
cd versionintel

# Update production settings in docker-compose.yml
# - Change SECRET_KEY and JWT_SECRET_KEY
# - Update POSTGRES_PASSWORD
# - Set REACT_APP_API_URL to your domain

# Deploy
./build-and-deploy.sh
```

### 2. Post-Deployment Setup
```bash
# Verify services are running
docker-compose ps

# Check health endpoints
curl http://your-domain:8000/health
curl http://your-domain:3000

# Change default admin password via web interface
```

## 🔧 Production Optimizations

### Container Security
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

### Troubleshooting
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f [service_name]

# Restart services
docker-compose restart
```

## 🎯 Production Checklist

- [ ] Update all default passwords
- [ ] Configure SSL/TLS certificates
- [ ] Set up firewall rules
- [ ] Create backup procedures
- [ ] Test all functionality
- [ ] Monitor resource usage
- [ ] Document access procedures

For detailed troubleshooting, refer to the [Setup Guide](SETUP.md). 