# VersionIntel - Universal Setup Guide
# ====================================

## 🚀 **One-Command Deployment**

```bash
# Download and deploy
git clone <repository-url>
cd versionintel
cp .env.template .env
nano .env  # Configure your secrets
chmod +x deploy.sh
./deploy.sh
```

## 📋 **Prerequisites**

- **Docker** & **Docker Compose**
- **Git**
- **Linux/Ubuntu Server** (any distribution)

## 🔧 **Step-by-Step Setup**

### **1. Install Docker**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### **2. Clone Repository**
```bash
git clone <your-repository-url>
cd versionintel
```

### **3. Configure Environment**
```bash
# Copy template
cp .env.template .env

# Edit configuration
nano .env
```

### **4. Configure Secrets in .env**

```bash
# REQUIRED: Database Configuration
POSTGRES_USER=versionintel
POSTGRES_PASSWORD=your_secure_database_password_here
POSTGRES_DB=versionintel

# REQUIRED: Security Keys (Generate strong random keys)
SECRET_KEY=your_32_plus_character_secret_key_here
JWT_SECRET_KEY=your_32_plus_character_jwt_secret_here

# Server Configuration
SERVER_HOST=your.server.ip  # Replace with your server IP

# OPTIONAL: GitHub OAuth (for authentication)
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# OPTIONAL: Google AI (for AI features)
GOOGLE_API_KEY=your_google_ai_api_key

# CORS (Update with your domain/IP)
CORS_ORIGINS=http://your.server.ip:3000,http://your.server.ip:8000
```

### **5. Deploy**
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔐 **Secrets Management Guide**

### **Generate Secure Keys**
```bash
# Generate SECRET_KEY (32+ characters)
openssl rand -hex 32

# Generate JWT_SECRET_KEY (32+ characters)  
openssl rand -hex 32

# Generate secure database password
openssl rand -base64 32
```

### **GitHub OAuth Setup** (Optional)
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill details:
   - **Name**: VersionIntel
   - **Homepage URL**: `http://YOUR_SERVER_IP:3000`
   - **Callback URL**: `http://YOUR_SERVER_IP:3000/auth/github/callback`
4. Copy Client ID and Secret to `.env`

### **Google AI Setup** (Optional)
1. Go to: https://console.cloud.google.com/
2. Create new project or select existing
3. Enable "Generative AI API"
4. Create API key
5. Copy API key to `.env`

## 🌐 **Server Configuration Examples**

### **Local Development**
```bash
SERVER_HOST=localhost
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

### **Production Server**
```bash
SERVER_HOST=172.17.14.65  # Your server IP
CORS_ORIGINS=http://172.17.14.65:3000,http://172.17.14.65:8000
```

### **Domain Setup**
```bash
SERVER_HOST=versionintel.yourdomain.com
CORS_ORIGINS=https://versionintel.yourdomain.com
```

## 📊 **Post-Deployment**

### **Access Application**
- **Frontend**: http://YOUR_SERVER_IP:3000
- **Backend API**: http://YOUR_SERVER_IP:8000
- **Health Check**: http://YOUR_SERVER_IP:8000/health

### **Default Login**
- **Username**: admin
- **Password**: Admin@123

### **Management Commands**
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update application
git pull
./deploy.sh
```

## 🔒 **Security Checklist**

- [ ] Changed default database password
- [ ] Generated strong SECRET_KEY (32+ chars)
- [ ] Generated strong JWT_SECRET_KEY (32+ chars)
- [ ] Updated CORS_ORIGINS for your domain
- [ ] Changed default admin password after first login
- [ ] Configured GitHub OAuth with correct URLs
- [ ] Secured .env file permissions (`chmod 600 .env`)

## 🆘 **Troubleshooting**

### **Services Won't Start**
```bash
# Check logs
docker-compose logs

# Reset everything
docker-compose down --volumes
./deploy.sh
```

### **Database Connection Issues**
```bash
# Check database logs
docker-compose logs db

# Reset database
docker-compose down --volumes
docker volume rm versionintel_postgres_data
./deploy.sh
```

### **GitHub OAuth Issues**
- Verify callback URLs match exactly
- Check client ID and secret in .env
- Ensure CORS_ORIGINS includes your domain

## 📱 **Quick Commands**

```bash
# Full reset and redeploy
docker-compose down --volumes --remove-orphans
docker system prune -f
./deploy.sh

# Update only backend
docker-compose up -d --build backend

# Update only frontend  
docker-compose up -d --build frontend

# Backup database
docker-compose exec db pg_dump -U versionintel versionintel > backup.sql
```

---

## ✅ **Success Indicators**

✅ All containers healthy: `docker-compose ps`  
✅ Frontend loads: http://YOUR_SERVER_IP:3000  
✅ Backend responds: http://YOUR_SERVER_IP:8000/health  
✅ Can login with admin/Admin@123  
✅ GitHub OAuth works (if configured)  

**🎉 VersionIntel is now ready for production use!**