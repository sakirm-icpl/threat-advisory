#!/bin/bash

# VersionIntel One-Click Server Setup and Deployment
# This script sets up a fresh server and deploys VersionIntel automatically

set -e

echo "🚀 VersionIntel One-Click Server Setup & Deployment"
echo "=================================================="
echo ""

# Configuration variables (modify these for your setup)
REPO_URL="https://github.com/your-username/versionintel.git"  # Replace with your actual repo
SERVER_IP="172.17.14.65"  # Replace with your server IP
INSTALL_DIR="/opt/versionintel"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   print_status "Please run as a regular user with sudo privileges"
   exit 1
fi

print_status "Starting automated server setup and deployment..."

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    print_status "Docker installed successfully"
else
    print_status "Docker already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose already installed"
fi

# Start and enable Docker
print_status "Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Install Python 3 if not available
print_status "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    sudo apt install -y python3 python3-pip
    print_status "Python 3 installed"
else
    print_status "Python 3 already available"
fi

# Create installation directory
print_status "Creating installation directory..."
sudo mkdir -p $INSTALL_DIR
sudo chown $USER:$USER $INSTALL_DIR

# Clone or copy VersionIntel repository
print_status "Setting up VersionIntel application..."
cd $INSTALL_DIR

# If running from existing directory, copy files
if [ -f "../docker-compose.yml" ]; then
    print_status "Copying VersionIntel files from current directory..."
    cp -r ../* . 2>/dev/null || true
    cp -r ../.[^.]* . 2>/dev/null || true
else
    print_status "Cloning VersionIntel repository..."
    if [ ! -z "$REPO_URL" ] && [ "$REPO_URL" != "https://github.com/your-username/versionintel.git" ]; then
        git clone $REPO_URL .
    else
        print_error "Repository URL not configured. Please either:"
        print_status "1. Run this script from the VersionIntel directory, or"
        print_status "2. Set the REPO_URL variable in this script"
        exit 1
    fi
fi

# Make scripts executable
print_status "Setting up permissions..."
chmod +x *.sh 2>/dev/null || true

# Configure firewall (UFW)
print_status "Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 3000/tcp  # Frontend
    sudo ufw allow 8000/tcp  # Backend
    sudo ufw --force enable
    print_status "Firewall configured"
fi

# Run the automated deployment
print_status "Starting automated deployment..."
export SERVER_IP=$SERVER_IP
./automated-deploy.sh

# Setup systemd service for auto-start
print_status "Setting up system service for auto-start..."
sudo tee /etc/systemd/system/versionintel.service > /dev/null <<EOF
[Unit]
Description=VersionIntel Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/local/bin/docker-compose --env-file .env up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=$USER
Group=$USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable versionintel.service
print_status "System service configured for auto-start"

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/versionintel > /dev/null <<EOF
$INSTALL_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF

# Create backup script
print_status "Creating backup script..."
tee $INSTALL_DIR/backup.sh > /dev/null <<EOF
#!/bin/bash
# VersionIntel Backup Script

BACKUP_DIR="$INSTALL_DIR/backups"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Database backup
docker-compose exec -T db pg_dump -U \$POSTGRES_USER \$POSTGRES_DB > \$BACKUP_DIR/db_backup_\$DATE.sql

# Configuration backup
cp .env \$BACKUP_DIR/env_backup_\$DATE

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "env_backup_*" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF

chmod +x $INSTALL_DIR/backup.sh

# Setup daily backup cron job
print_status "Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * $INSTALL_DIR/backup.sh >> $INSTALL_DIR/backup.log 2>&1") | crontab -

# Create monitoring script
print_status "Creating monitoring script..."
tee $INSTALL_DIR/monitor.sh > /dev/null <<EOF
#!/bin/bash
# VersionIntel Health Monitor

cd $INSTALL_DIR

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "Services down, restarting..."
    docker-compose --env-file .env up -d
fi

# Check health endpoints
if ! curl -f http://$SERVER_IP:8000/health &> /dev/null; then
    echo "Backend health check failed"
    docker-compose restart backend
fi

if ! curl -f http://$SERVER_IP:3000 &> /dev/null; then
    echo "Frontend health check failed"
    docker-compose restart frontend
fi
EOF

chmod +x $INSTALL_DIR/monitor.sh

# Setup monitoring cron job (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * $INSTALL_DIR/monitor.sh >> $INSTALL_DIR/monitor.log 2>&1") | crontab -

# Display final summary
echo ""
echo "🎉 VersionIntel Server Setup Complete!"
echo "====================================="
echo ""
echo "🌐 ACCESS INFORMATION:"
echo "   Frontend:     http://$SERVER_IP:3000"
echo "   Backend API:  http://$SERVER_IP:8000"
echo "   API Docs:     http://$SERVER_IP:8000/docs"
echo ""
echo "🔐 DEFAULT LOGIN:"
echo "   Username: admin"
echo "   Password: Admin@1234"
echo "   ⚠️  CHANGE IMMEDIATELY AFTER FIRST LOGIN!"
echo ""
echo "📁 INSTALLATION:"
echo "   Directory:    $INSTALL_DIR"
echo "   Service:      systemctl status versionintel"
echo "   Logs:         docker-compose logs -f"
echo ""
echo "🔧 MANAGEMENT COMMANDS:"
echo "   Start:        sudo systemctl start versionintel"
echo "   Stop:         sudo systemctl stop versionintel"
echo "   Restart:      sudo systemctl restart versionintel"
echo "   Status:       sudo systemctl status versionintel"
echo ""
echo "💾 BACKUP & MONITORING:"
echo "   Manual backup:  $INSTALL_DIR/backup.sh"
echo "   Monitor health: $INSTALL_DIR/monitor.sh"
echo "   Backup logs:    $INSTALL_DIR/backup.log"
echo "   Monitor logs:   $INSTALL_DIR/monitor.log"
echo ""
echo "🔒 SECURITY:"
echo "   ✅ Firewall configured"
echo "   ✅ System service enabled"
echo "   ✅ Daily backups scheduled"
echo "   ✅ Health monitoring active"
echo "   ✅ Log rotation configured"
echo ""
print_warning "IMPORTANT NEXT STEPS:"
echo "   1. Change admin password immediately"
echo "   2. Configure SSL/TLS certificates"
echo "   3. Update DNS settings if needed"
echo "   4. Review and adjust firewall rules"
echo "   5. Set up external monitoring/alerting"
echo ""
echo "🚀 Your VersionIntel server is ready for production use!"
echo ""
echo "🔄 Note: If you see Docker permission errors, logout and login again."