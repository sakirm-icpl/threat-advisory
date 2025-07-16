# VersionIntel Production Deployment Guide

## 🚀 Production Deployment Checklist

### 1. Security Configuration

#### Environment Variables
Update the following in `docker-compose.yml`:

```yaml
environment:
  - SECRET_KEY=edd504d675db4fc15b1d4fd41be1d3845499b8ee220af6ceba475fd401f14380
  - JWT_SECRET_KEY=eec005cbfd76222973f0aa58c1d7fe357745d8c87354a0517ea54a444a87f60c
  - POSTGRES_PASSWORD=your-secure-database-password
```

#### Default Credentials
- **Admin User**: `admin` / `Admin@1234`
- **Database**: `postgres` / `postgres`

⚠️ **IMPORTANT**: Change all default passwords before production deployment!

### 2. Network Configuration

#### Firewall Rules
```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 3000  # Frontend
sudo ufw allow 8000  # Backend
sudo ufw allow 5432  # Database (if external access needed)
sudo ufw enable
```

#### SSL/TLS Configuration
For production, set up SSL/TLS using Nginx or a reverse proxy:

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

### 3. Database Configuration

#### PostgreSQL Security
```sql
-- Change default passwords
ALTER USER postgres PASSWORD 'your-secure-password';
ALTER USER versionintel PASSWORD 'your-secure-password';

-- Enable SSL
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/path/to/server.crt';
ALTER SYSTEM SET ssl_key_file = '/path/to/server.key';
```

#### Backup Strategy
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec db pg_dump -U postgres versionintel > backup_$DATE.sql
```

### 4. Monitoring & Logging

#### Health Checks
- Backend: `http://your-domain.com:8000/health`
- Frontend: `http://your-domain.com:3000`
- Metrics: `http://your-domain.com:8000/metrics`

#### Log Management
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Log rotation
sudo logrotate /etc/logrotate.d/versionintel
```

### 5. Performance Optimization

#### Docker Configuration
```yaml
# Add to docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

#### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_vendors_name ON vendors(name);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_methods_vendor_id ON methods(vendor_id);
```

### 6. Backup & Recovery

#### Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/versionintel"

mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T db pg_dump -U postgres versionintel > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz --exclude=node_modules --exclude=__pycache__ .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

#### Recovery Procedure
```bash
# Restore database
docker-compose exec -T db psql -U postgres versionintel < backup_20231201_120000.sql

# Restore application
tar -xzf app_backup_20231201_120000.tar.gz
docker-compose up --build -d
```

### 7. Security Hardening

#### Container Security
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
```

#### Application Security
- Enable HTTPS only
- Implement rate limiting
- Add input validation
- Use secure headers
- Regular security updates

### 8. Deployment Commands

#### Initial Deployment
```bash
# Clone repository
git clone <repository-url>
cd versionintel

# Update configuration
# Edit docker-compose.yml with production values

# Deploy
./deploy.sh
```

#### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Check status
docker-compose ps
docker-compose logs -f
```

### 9. Troubleshooting

#### Common Issues
1. **Database Connection Failed**
   ```bash
   docker-compose logs db
   docker-compose exec db psql -U postgres -c "\l"
   ```

2. **Backend Not Starting**
   ```bash
   docker-compose logs backend
   docker-compose exec backend python -c "import app; print('OK')"
   ```

3. **Frontend Not Loading**
   ```bash
   docker-compose logs frontend
   curl -I http://localhost:3000
   ```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Check database performance
docker-compose exec db psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### 10. Maintenance

#### Regular Tasks
- [ ] Weekly security updates
- [ ] Monthly database backups
- [ ] Quarterly performance reviews
- [ ] Annual security audits

#### Monitoring Alerts
- Set up monitoring for:
  - Service availability
  - Database performance
  - Disk space
  - Memory usage
  - Error rates

---

## 🎯 Quick Production Setup

1. **Update passwords** in `docker-compose.yml`
2. **Configure SSL/TLS** for HTTPS
3. **Set up monitoring** and alerts
4. **Create backup strategy**
5. **Test deployment** thoroughly
6. **Document procedures** for your team

For support, check the logs and health endpoints first, then refer to this guide. 