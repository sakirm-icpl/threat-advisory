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

### 2. Update Environment Variables

Edit `docker-compose.yml` as needed:
- **Backend runs on port 8000**
- **Frontend runs on port 3001**
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
      - "8000:8000"
  frontend:
    environment:
      - REACT_APP_API_URL=http://backend:8000
    ports:
      - "3001:3000"
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: versionintel
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
```

### 3. Build and Start Services
```bash
sudo docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://your-server-ip:3001
- **Backend API**: http://your-server-ip:8000
- **API Documentation**: http://your-server-ip:8000/docs
- **Health Check**: http://your-server-ip:8000/health
- **Metrics**: http://your-server-ip:8000/metrics

### 5. (Recommended) Set Up Nginx as a Reverse Proxy
- Use Nginx to route your domain to the frontend/backend and enable HTTPS (Let's Encrypt).
- Example Nginx config:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
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

### 6. First-Time Login
- **Username**: `admin`
- **Password**: `admin123`
- **Important:** Change the default admin password after first login for security.

---

## ⚠️ Troubleshooting

- **Frontend can't reach backend?**
  - Make sure `REACT_APP_API_URL` in Docker Compose is set to `http://backend:8000` (for Docker Compose) or `http://localhost:8000` (for local dev).
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

---

## 🆘 Support

- Create an issue on GitHub
- Check the API documentation at `/docs` 