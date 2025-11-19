#!/bin/bash

echo "🌱 Setting up Enhanced Feedback Kiosk..."

# Create necessary directories
mkdir -p storage/{photos,temp,backups,logs}
mkdir -p frontend/css frontend/js
mkdir -p admin
mkdir -p assets/{backgrounds,logos,outputs,uploads}

# Create default assets if they don't exist
if [ ! -f "assets/backgrounds/background.jpg" ]; then
    echo "📷 Creating default background..."
    # This will be created by the image processor
fi

if [ ! -f "assets/logos/overlay.png" ]; then
    echo "🎨 Creating default overlay..."
    # This will be created by the image processor
fi

# Set secure permissions
chmod 700 storage/
chmod 700 storage/photos/
chmod 700 storage/temp/
chmod 700 storage/backups/
chmod 600 storage/logs/

# Create log rotation
sudo bash -c 'cat > /etc/logrotate.d/feedback-kiosk << EOF
/home/pi/dp_kiosk/storage/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 640 pi pi
}
EOF'

# Create systemd service
sudo bash -c 'cat > /etc/systemd/system/feedback-kiosk.service << EOF
[Unit]
Description=Feedback Kiosk Server
After=network.target
Wants=network.target

[Service]
Type=simple
User=pi
Group=pi
WorkingDirectory=/home/pi/dp_kiosk
Environment=NODE_ENV=production
ExecStart=/usr/bin/node backend/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=feedback-kiosk

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/home/pi/dp_kiosk/storage

[Install]
WantedBy=multi-user.target
EOF'

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable feedback-kiosk
sudo systemctl start feedback-kiosk

# Set up firewall (if ufw is available)
if command -v ufw &> /dev/null; then
    sudo ufw allow 3000/tcp comment "Feedback Kiosk"
    sudo ufw --force enable
fi

echo "✅ Enhanced setup complete!"
echo ""
echo "🎯 Access Points:"
echo "   Kiosk: http://localhost:3000"
echo "   Admin: http://localhost:3000/admin"
echo "   Tree: http://localhost:3000/tree"
echo ""
echo "🔐 Default Admin Credentials:"
echo "   System Admin: systemadmin / SystemAdmin123!"
echo "   IT Admin: admin / admin123"
echo "   IT Staff: staff / staff123"
echo ""
echo "⚠️  IMPORTANT: Change default passwords after first login!"
echo "📧 Email functionality is in mock mode - configure SMTP for production"