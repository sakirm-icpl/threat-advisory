# VersionIntel Perfect Production Deployment Steps
# ================================================

## 🎯 **DEPLOYMENT CHECKLIST - Follow Exactly**

### **STEP 1: Server Preparation** ⚙️

#### **1.1 Server Requirements**
- [ ] Linux server (Ubuntu 20.04+ recommended) or Windows Server
- [ ] Minimum: 2 CPU cores, 4GB RAM, 20GB storage
- [ ] Public IP address or domain name
- [ ] SSH access to server

#### **1.2 Install Docker (Ubuntu/Linux)**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Logout and login again for group changes to take effect
exit
```

#### **1.3 Configure Firewall**
```bash
# Allow required ports
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 3000/tcp    # Frontend
sudo ufw allow 8000/tcp    # Backend API
sudo ufw enable

# Verify firewall status
sudo ufw status
```

---

### **STEP 2: GitHub OAuth Setup** 🔐

#### **2.1 Create Production OAuth App**
1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in details:
   - **Application name**: `VersionIntel Production`
   - **Homepage URL**: `http://YOUR_SERVER_IP:3000` or `http://your-domain.com:3000`
   - **Authorization callback URL**: `http://YOUR_SERVER_IP:3000/auth/github/callback`
4. Click **"Register application"**
5. **SAVE**: Client ID and Client Secret (you'll need these)

#### **2.2 Record OAuth Details**
```
GitHub Client ID: ________________________________
GitHub Client Secret: ____________________________
```

---

### **STEP 3: Upload Application Code** 📂

#### **3.1 Transfer Code to Server**

**Option A: Clone from GitHub (Recommended)**
```bash
# On your server
git clone https://github.com/your-username/versionintel.git
cd versionintel
```

**Option B: Upload via SCP**
```bash
# From your local machine
scp -r c:\code\versionintel user@YOUR_SERVER_IP:/home/user/
```

#### **3.2 Verify Files**
```bash
# Check all files are present
ls -la
# Should see: docker-compose.production.yml, deploy-production.sh, .env.production.template
```

---

### **STEP 4: Configure Environment** 🔧

#### **4.1 Create Production Environment File**
```bash
# Copy template
cp .env.production.template .env.production

# Edit the file
nano .env.production
```

#### **4.2 Update Configuration Values**
Replace ALL the following values in `.env.production`:

```bash
# REQUIRED: Replace with your actual server IP or domain
SERVER_HOST=YOUR_SERVER_IP_OR_DOMAIN
PRODUCTION_DOMAIN=YOUR_SERVER_IP_OR_DOMAIN

# REQUIRED: Strong database password (minimum 16 characters)
POSTGRES_PASSWORD=YourSecurePassword2024!@#$

# REQUIRED: Generate new secret keys
# Run these commands to generate secure keys:
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
python3 -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"

# REQUIRED: Your GitHub OAuth credentials from Step 2
GITHUB_CLIENT_ID=your_github_client_id_from_step2
GITHUB_CLIENT_SECRET=your_github_client_secret_from_step2

# OPTIONAL: AI features (leave blank if not using)
GOOGLE_API_KEY=your_google_api_key_if_needed
NVD_API_KEY=your_nvd_api_key_if_needed
```

#### **4.3 Generate Secret Keys**
```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_hex(32))"

# Generate JWT_SECRET_KEY  
python3 -c "import secrets; print(secrets.token_hex(32))"

# Copy these values to your .env.production file
```

#### **4.4 Verify Configuration**
```bash
# Check your configuration (sensitive values will be hidden)
cat .env.production | grep -v "SECRET\|PASSWORD"
```

---

### **STEP 5: Deploy Application** 🚀

#### **5.1 Make Deployment Script Executable**
```bash
chmod +x deploy-production.sh
```

#### **5.2 Run Production Deployment**
```bash
# Start deployment
./deploy-production.sh

# The script will:
# - Check prerequisites
# - Build Docker images
# - Start all services
# - Verify deployment
```

#### **5.3 Monitor Deployment**
```bash
# Watch deployment progress
docker-compose -f docker-compose.production.yml logs -f

# Check service status
docker-compose -f docker-compose.production.yml ps
```

---

### **STEP 6: Verify Deployment** ✅

#### **6.1 Check Service Health**
```bash
# All services should show "Up" and "healthy"
docker-compose -f docker-compose.production.yml ps

# Expected output:
# versionintel-db-prod       Up (healthy)
# versionintel-backend-prod  Up (healthy)  
# versionintel-frontend-prod Up (healthy)
```

#### **6.2 Test Application Endpoints**
```bash
# Test backend health
curl http://localhost:8000/health
# Expected: {"status": "healthy"}

# Test frontend
curl http://localhost:3000
# Expected: HTML content

# Test from external network
curl http://YOUR_SERVER_IP:3000
curl http://YOUR_SERVER_IP:8000/health
```

#### **6.3 Access Your Application**
1. Open browser: `http://YOUR_SERVER_IP:3000`
2. You should see VersionIntel login page
3. Click "Sign in with GitHub"
4. Authorize the application
5. You should be logged in successfully

---

### **STEP 7: Post-Deployment Setup** 👤

#### **7.1 Create Admin User**
```bash
# Access the database
docker-compose -f docker-compose.production.yml exec db psql -U versionintel_prod -d versionintel_production

# Find your user ID (replace 'your-github-username')
SELECT id, github_username, role FROM users WHERE github_username = 'your-github-username';

# Promote to admin (replace USER_ID with actual ID)
UPDATE users SET role = 'admin' WHERE id = USER_ID;

# Verify admin role
SELECT id, github_username, role FROM users WHERE github_username = 'your-github-username';

# Exit database
\q
```

#### **7.2 Test Admin Features**
1. Refresh your browser
2. You should now see admin menu options
3. Test creating/editing products and vendors

---

### **STEP 8: Setup Monitoring & Backups** 📊

#### **8.1 Create Backup Directory**
```bash
mkdir -p /home/user/versionintel-backups
```

#### **8.2 Manual Database Backup**
```bash
# Create backup
docker-compose -f docker-compose.production.yml exec -T db pg_dump -U versionintel_prod versionintel_production > /home/user/versionintel-backups/backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup
ls -la /home/user/versionintel-backups/
```

#### **8.3 Setup Automated Backups (Optional)**
```bash
# Add to crontab for daily backups at 2 AM
crontab -e

# Add this line:
0 2 * * * cd /home/user/versionintel && docker-compose -f docker-compose.production.yml exec -T db pg_dump -U versionintel_prod versionintel_production > /home/user/versionintel-backups/backup-$(date +\%Y\%m\%d).sql
```

---

## 🎉 **DEPLOYMENT COMPLETE!**

### **Your Application URLs:**
- **Frontend**: `http://YOUR_SERVER_IP:3000`
- **Backend API**: `http://YOUR_SERVER_IP:8000`
- **API Documentation**: `http://YOUR_SERVER_IP:8000/docs`

### **Management Commands:**

#### **View Logs**
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend
```

#### **Restart Services**
```bash
# Restart all
docker-compose -f docker-compose.production.yml restart

# Restart specific service
docker-compose -f docker-compose.production.yml restart backend
```

#### **Stop/Start Application**
```bash
# Stop
docker-compose -f docker-compose.production.yml down

# Start
docker-compose -f docker-compose.production.yml up -d
```

#### **Update Application**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **Services Won't Start**
```bash
# Check logs for errors
docker-compose -f docker-compose.production.yml logs

# Check disk space
df -h

# Check if ports are available
sudo netstat -tulpn | grep -E ':(3000|8000|5432)'
```

#### **Database Connection Issues**
```bash
# Test database connection
docker-compose -f docker-compose.production.yml exec db pg_isready -U versionintel_prod

# Reset database (WARNING: Data loss)
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml up -d
```

#### **GitHub OAuth Issues**
- Verify callback URL exactly matches: `http://YOUR_SERVER_IP:3000/auth/github/callback`
- Check Client ID and Secret are correct in `.env.production`
- Ensure GitHub OAuth app is not in sandbox mode

### **Performance Optimization**
```bash
# Monitor resource usage
docker stats

# Clean up unused Docker resources
docker system prune -a
```

---

## 📞 **Support**

- **Logs Location**: Use `docker-compose -f docker-compose.production.yml logs`
- **Configuration**: Check `.env.production` file
- **Documentation**: See `TROUBLESHOOTING.md` for detailed issue resolution

**🎯 Your VersionIntel platform is now live and ready for production use!**