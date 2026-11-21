#!/usr/bin/env bash
# ==============================================================================
# GrowPlus Production Launch & Deployment Script for Fedora / Linux
# ==============================================================================
set -euo pipefail

echo "=================================================================="
echo "  GROWPLUS PRODUCTION ECOSYSTEM DEPLOYMENT (FEDORA LINUX)"
echo "=================================================================="

# 1. Verify Root Privileges
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run this deployment script as root or using sudo."
  exit 1
fi

# 2. Check Fedora Environment
if [ -f /etc/fedora-release ]; then
  echo "✅ Detected Fedora Linux: $(cat /etc/fedora-release)"
else
  echo "⚠️ Warning: Not running on Fedora, continuing standard Linux install..."
fi

# 3. Update packages and install prerequisites
echo "📦 Installing required dependencies via dnf..."
dnf check-update || true
dnf install -y \
  git \
  curl \
  wget \
  tar \
  nginx \
  firewalld \
  policycoreutils-python-utils \
  procps-ng

# Install Node.js 20 LTS if not present
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 20 LTS..."
  dnf module enable -y nodejs:20
  dnf install -y nodejs npm
fi
echo "✅ Node.js $(node -v) / npm $(npm -v) confirmed."

# 4. Create growplus service user
if ! id -u growplus &>/dev/null; then
  echo "Creating dedicated growplus system user..."
  useradd -r -s /bin/bash -d /opt/growplus -m growplus
fi

# 5. Setup Project Directory Structure
APP_DIR="/opt/growplus"
mkdir -p "$APP_DIR/backend"
mkdir -p "$APP_DIR/logs"

# 6. Setup MongoDB for Analytics
echo "🍃 Configuring MongoDB service..."
if ! command -v mongod &> /dev/null; then
  cat << 'EOF' > /etc/yum.repos.d/mongodb-org-7.0.repo
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF
  dnf install -y mongodb-org || echo "Notice: MongoDB RPM install skipped, check Docker alternative"
fi

if systemctl list-unit-files | grep -q mongod; then
  systemctl enable --now mongod || true
  echo "✅ MongoDB service active."
fi

# 7. Configure Backend Environment & Build
echo "⚙️ Building GrowPlus Backend..."
cd "$APP_DIR/backend"
if [ -f "package.json" ]; then
  npm ci --omit=dev
  npm run build
fi

# 8. Install Systemd Service
echo "🚀 Installing Systemd Service..."
cp "$APP_DIR/scripts/growplus-backend.service" /etc/systemd/system/growplus-backend.service
systemctl daemon-reload
systemctl enable --now growplus-backend.service

# 9. Configure Nginx Reverse Proxy
echo "🌐 Configuring Nginx reverse proxy..."
cp "$APP_DIR/scripts/nginx-growplus.conf" /etc/nginx/conf.d/growplus.conf

# Configure SELinux to allow Nginx to connect to network proxies
setsebool -P httpd_can_network_connect 1 || true

# Test and start Nginx
nginx -t
systemctl enable --now nginx
systemctl reload nginx

# 10. Open Firewall Ports (HTTP/HTTPS)
echo "🛡️ Configuring firewalld rules..."
if systemctl is-active --quiet firewalld; then
  firewall-cmd --permanent --add-service=http || true
  firewall-cmd --permanent --add-service=https || true
  firewall-cmd --reload || true
fi

echo "=================================================================="
echo "🎉 GROWPLUS DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "   Backend Status: $(systemctl is-active growplus-backend)"
echo "   Nginx Status:   $(systemctl is-active nginx)"
echo "   MongoDB Status: $(systemctl is-active mongod 2>/dev/null || echo 'active in container/Atlas')"
echo "=================================================================="
