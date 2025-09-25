# VersionIntel - Version Detection Research Platform

## 🚀 **Quick Start (Any Server)**

```bash
git clone <repository-url>
cd versionintel
cp .env.template .env
nano .env  # Add your secrets
chmod +x deploy.sh
./deploy.sh
```

**Access**: http://localhost:3000 | **Login**: admin/Admin@123

---

## 📋 **Complete Setup Guide**

See [SETUP.md](SETUP.md) for detailed instructions including:
- Server prerequisites
- Secrets configuration
- GitHub OAuth setup
- Google AI integration
- Production deployment
- Troubleshooting

## 🔐 **Quick Secrets Generation**

```bash
chmod +x generate-secrets.sh
./generate-secrets.sh > .env
# Edit .env to update SERVER_HOST with your IP
```

## 🎯 **What You Get**

- **Frontend**: Modern React application (Port 3000)
- **Backend**: Flask API with JWT auth (Port 8000)
- **Database**: PostgreSQL with auto-initialization
- **OAuth**: GitHub authentication ready
- **AI**: Google Gemini integration
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

- ✅ User authentication with GitHub OAuth
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