# VersionIntel Production Deployment Guide
# ========================================

## 🚀 Production Deployment Steps

### Prerequisites

1. **Server Requirements**
   - Linux server (Ubuntu 20.04+ recommended) or Windows Server
   - Minimum 2 CPU cores, 4GB RAM, 20GB storage
   - Docker and Docker Compose installed
   - Domain name and SSL certificate (for HTTPS)

2. **Required Accounts**
   - GitHub account for OAuth setup
   - Optional: Google Cloud account for AI features

### Step 1: Server Setup

1. **Install Docker**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Setup Firewall**
   ```bash
   # Ubuntu UFW
   sudo ufw allow 22/tcp      # SSH
   sudo ufw allow 80/tcp      # HTTP
   sudo ufw allow 443/tcp     # HTTPS
   sudo ufw enable
   ```

### Step 2: GitHub OAuth Configuration

1. **Create Production OAuth App**
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Configure:
     - **Application name**: VersionIntel Production
     - **Homepage URL**: https://your-domain.com
     - **Authorization callback URL**: https://your-domain.com/auth/github/callback
   - Save Client ID and Client Secret

### Step 3: Production Configuration

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/versionintel.git
   cd versionintel
   ```

2. **Configure Environment**
   ```bash
   # Copy template
   cp .env.production.template .env.production
   
   # Edit configuration
   nano .env.production
   ```

3. **Update Configuration Values**
   ```bash
   # CRITICAL: Change these values
   SERVER_HOST=your-production-domain.com
   POSTGRES_PASSWORD=your-secure-db-password-min-16-chars
   SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
   JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   PRODUCTION_DOMAIN=your-production-domain.com
   ```

### Step 4: SSL Setup (Recommended)

1. **Using Certbot (Let's Encrypt)**
   ```bash
   # Install Certbot
   sudo apt install certbot
   
   # Get SSL certificate
   sudo certbot certonly --standalone -d your-domain.com
   
   # Copy certificates
   sudo mkdir -p ./ssl
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
   sudo chown -R $USER:$USER ./ssl
   ```

### Step 5: Deploy to Production

1. **Run Production Deployment**
   ```bash
   # Linux/macOS
   chmod +x deploy-production.sh
   ./deploy-production.sh
   
   # Windows
   deploy-production.bat
   ```

2. **Verify Deployment**
   ```bash
   # Check service status
   docker-compose -f docker-compose.production.yml ps
   
   # Check logs
   docker-compose -f docker-compose.production.yml logs -f
   
   # Test endpoints
   curl -f https://your-domain.com/health
   curl -f https://your-domain.com:8000/health
   ```

### Step 6: Post-Deployment Configuration

1. **Create Admin User**
   - Access your application at https://your-domain.com
   - Sign in with GitHub OAuth
   - Manually promote your user to admin in the database:
   ```sql
   UPDATE users SET role = 'admin' WHERE github_username = 'your-github-username';
   ```

2. **Setup Monitoring (Optional)**
   ```bash
   # View application logs
   docker-compose -f docker-compose.production.yml logs -f backend
   
   # Monitor resources
   docker stats
   ```

## 🔧 Production Management

### Daily Operations

1. **View Logs**
   ```bash
   docker-compose -f docker-compose.production.yml logs -f [service]
   ```

2. **Restart Services**
   ```bash
   docker-compose -f docker-compose.production.yml restart [service]
   ```

3. **Update Application**
   ```bash
   git pull origin main
   docker-compose -f docker-compose.production.yml build --no-cache
   docker-compose -f docker-compose.production.yml up -d
   ```

### Backup Strategy

1. **Database Backup**
   ```bash
   # Create backup
   docker-compose -f docker-compose.production.yml exec db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup-$(date +%Y%m%d).sql
   
   # Automated backup (add to crontab)
   0 2 * * * cd /path/to/versionintel && ./scripts/backup.sh
   ```

2. **Full System Backup**
   ```bash
   # Backup entire application directory
   tar -czf versionintel-backup-$(date +%Y%m%d).tar.gz /path/to/versionintel
   ```

## 🔒 Security Checklist

- [ ] Changed all default passwords
- [ ] Generated new secret keys
- [ ] Configured HTTPS with valid SSL certificate
- [ ] Updated GitHub OAuth callback URL
- [ ] Enabled firewall with minimal required ports
- [ ] Set up regular backups
- [ ] Configured security headers
- [ ] Updated all dependencies
- [ ] Removed demo/development accounts

## 🚨 Troubleshooting

### Common Issues

1. **Services Won't Start**
   ```bash
   # Check logs
   docker-compose -f docker-compose.production.yml logs
   
   # Verify configuration
   cat .env.production
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose -f docker-compose.production.yml exec db pg_isready
   
   # Reset database (WARNING: Data loss)
   docker-compose -f docker-compose.production.yml down -v
   docker-compose -f docker-compose.production.yml up -d
   ```

3. **GitHub OAuth Issues**
   - Verify callback URL matches exactly
   - Check client ID and secret are correct
   - Ensure HTTPS is properly configured

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX idx_users_github_id ON users(github_id);
   CREATE INDEX idx_products_vendor_id ON products(vendor_id);
   ```

2. **Resource Monitoring**
   ```bash
   # Monitor resource usage
   docker stats
   
   # Check disk usage
   df -h
   du -sh /var/lib/docker
   ```

## 📞 Support

For production support:
- Check logs: `docker-compose -f docker-compose.production.yml logs`
- Review documentation: `README.md` and `TROUBLESHOOTING.md`
- Create GitHub issue with deployment details

## 🔄 Updates and Maintenance

### Regular Maintenance

1. **Weekly Tasks**
   - Check service health
   - Review logs for errors
   - Update system packages
   - Verify backups

2. **Monthly Tasks**
   - Update Docker images
   - Review security patches
   - Clean up old logs
   - Performance review

3. **Quarterly Tasks**
   - Full security audit
   - Dependency updates
   - Infrastructure review
   - Disaster recovery test