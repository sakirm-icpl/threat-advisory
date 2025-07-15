# VersionIntel - Complete Version Detection Research Platform

A comprehensive platform for managing internal version detection research for various service/web/OS applications. This platform allows you to record detection logic like banner grabbing techniques, version regex patterns (Python and Ruby), authentication requirements, and setup instructions per product/vendor.

---

## 🚀 Features

- **Vendor Management**: Add, update, delete, and list vendors
- **Product Management**: Manage products with vendor associations and categories
- **Detection Methods**: Store and manage version detection logic with regex patterns
- **Setup Guides**: Document setup instructions with Docker images and VM requirements
- **Regex Testing**: Test Python and Ruby regex patterns against sample outputs
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Bulk Operations**: Import/export data in JSON/CSV formats with backup/restore
- **Monitoring**: Prometheus metrics and health checks
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Modern Frontend**: React-based web interface with responsive design
- **Markdown Support**: Rich text formatting for product descriptions and setup guides

---

## 🏗️ Architecture

```
versionintel/
├── backend/                 # Flask API Server (port 8000)
├── frontend/                # React Web Application (port 3001)
├── db/                      # Database initialization
├── docker-compose.yml       # Service orchestration
└── README.md
```

---

## ⚡ Quick Start (Development)

### Prerequisites
- Docker and Docker Compose
- Git

### Installation (Development)
```bash
git clone <repository-url>
cd versionintel
docker-compose up --build
```

### Access (Development)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 🚀 Production Deployment Guide (Ubuntu)

### Prerequisites
- Ubuntu server (20.04+ recommended)
- Docker and Docker Compose installed
- (Optional) Domain name for HTTPS

### 1. Clone the repository
```bash
git clone <repository-url>
cd versionintel
```

### 2. Configure Frontend Environment

**Important:** Create a `.env` file in the `frontend/` directory with the correct backend API URL:

```bash
# Create the .env file
echo "REACT_APP_API_URL=http://your-server-ip:8000" > frontend/.env
```

Replace `your-server-ip` with your actual server IP address or domain name.

### 3. Update Environment Variables (Optional)

Edit `docker-compose.yml` as needed:
- **Backend runs on port 8000**
- **Frontend runs on port 3000**
- Set strong secrets for JWT and database

Example (in `docker-compose.yml`):
```yaml
services:
  backend:
    environment:
      - FLASK_ENV=production
      - JWT_SECRET_KEY=your-secure-secret-key
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/versionintel
    ports:
      - "8000:5000"
  frontend:
    ports:
      - "3000:3000"
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: versionintel
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
```

### 4. Build and Start Services

**Option A: Automated Deployment (Recommended)**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Option B: Manual Deployment**
```bash
sudo docker-compose up -d --build
```

### 5. Access the Application
- **Frontend**: http://your-server-ip:3000
- **Backend API**: http://your-server-ip:8000
- **API Documentation**: http://your-server-ip:8000/docs
- **Health Check**: http://your-server-ip:8000/health
- **Metrics**: http://your-server-ip:8000/metrics

### 6. (Recommended) Set Up Nginx as a Reverse Proxy
- Use Nginx to route your domain to the frontend/backend and enable HTTPS (Let's Encrypt).
- Example Nginx config:
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
- Use Certbot for HTTPS: https://certbot.eff.org/

### 7. First-Time Login
- **Username**: `admin`
- **Password**: `admin123`
- **Important:** Change the default admin password after first login for security.

---

## ⚠️ Troubleshooting

- **Frontend can't reach backend?**
  - Make sure you've created the `frontend/.env` file with the correct `REACT_APP_API_URL`.
  - The URL should point to your backend: `http://your-server-ip:8000`.
  - Ensure backend is running and port 8000 is open.
- **Port already in use?**
  - Change the exposed port in `docker-compose.yml` (e.g., `8001:8000` for backend, `3002:3000` for frontend).
- **CORS errors?**
  - Ensure backend CORS config allows your frontend domain or IP.
- **Database connection issues?**
  - Check `DATABASE_URL` and ensure the database service is healthy.

---

## 📚 API Documentation

- **API Docs**: `/docs` on backend (e.g., http://your-server-ip:8000/docs)
- **Health**: `/health`
- **Metrics**: `/metrics`

---

## 🔐 Security

- Set strong secrets for JWT and database in production.
- Change the default admin password after first login.
- Use HTTPS in production.

## 📝 Markdown Support

VersionIntel supports Markdown formatting for product descriptions and setup guide instructions. This allows you to create rich, well-formatted content with:

- **Bold** and *italic* text
- Headers and subheaders
- Bullet points and numbered lists
- Code blocks and inline code
- Links and tables
- Blockquotes

See `MARKDOWN_GUIDE.md` for detailed usage instructions and examples.

---

## 🆘 Support

- Create an issue on GitHub
- Check the API documentation at `/docs` 