# VersionIntel - Version Detection Research Platform

## 🚀 **Quick Deploy (1 Command)**

```bash
git clone <repository-url>
cd versionintel
chmod +x quick-deploy.sh
./quick-deploy.sh
```

**Access**: http://localhost:3000 | **Login**: GitHub OAuth only

---

## 📋 **Complete Setup Guide**

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions including:
- GitHub OAuth setup (Required)
- Server configuration
- Google AI integration (Optional)
- Production deployment
- Troubleshooting

## 🔐 **Quick GitHub OAuth Setup**

1. Go to: https://github.com/settings/developers
2. Create "New OAuth App":
   - **Name**: VersionIntel
   - **Homepage**: `http://YOUR_SERVER_IP:3000`
   - **Callback**: `http://YOUR_SERVER_IP:3000/auth/github/callback`
3. Copy Client ID and Secret to `.env` file

## 🎯 **What You Get**

- **Frontend**: Modern React application (Port 3000)
- **Backend**: Flask API with JWT auth (Port 8000)
- **Database**: PostgreSQL with auto-initialization
- **Authentication**: GitHub OAuth 2.0 (Required)
- **AI**: Google Gemini integration (Optional)
- **Docker**: Fully containerized deployment

## 🛠️ **Management**

```bash
# Status
docker-compose ps

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Update
git pull && ./deploy.sh
```

## 🌐 **Features**

- ✅ Secure GitHub OAuth 2.0 authentication
- ✅ Repository scanning and analysis
- ✅ Vulnerability detection with AI
- ✅ Dashboard with analytics
- ✅ RESTful API with documentation
- ✅ Production-ready deployment
- ✅ Automatic database initialization

## 📁 **Clean Project Structure**

```
versionintel/
├── backend/              # Flask API application
├── frontend/             # React frontend application
├── deploy.sh             # Universal deployment script
├── .env.template         # Environment configuration template
├── docker-compose.yml    # Container orchestration
├── SETUP.md             # Complete setup guide
└── generate-secrets.sh   # Secrets generator
```

## 🆘 **Quick Troubleshooting**

**Services won't start?**
```bash
docker-compose logs
```

**Database issues?**
```bash
docker-compose down --volumes
./deploy.sh
```

**Need fresh deployment?**
```bash
docker-compose down --volumes --remove-orphans
docker system prune -f
./deploy.sh
```

---

**🎉 VersionIntel - Production-ready with one command deployment!**