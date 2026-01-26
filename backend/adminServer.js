// adminServer.js - Admin server (Admin UI + Admin API) on PORT 3002

require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const os = require('os');

const db = require('./db');
const adminRoutes = require('./adminRoutes');
const dataExportRoutes = require('./dataExportRoutes');
const emailService = require('./emailService');

// Data fetching for Tree + Leaderboard routes
const leaderboardRoutes = require('./leaderboardRoutes');
const { router: treeRoutes, setDatabase: setTreeDatabase } = require('./treeRoutes');

const app = express();
const PORT = 3002; 

// ==================== NETWORK INTERFACE FUNCTIONS ====================

function getAllNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const ifaceName in interfaces) {
    for (const iface of interfaces[ifaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({
          interface: ifaceName,
          address: iface.address,
          mac: iface.mac,
          cidr: iface.cidr,
        });
      }
    }
  }
  return ips;
}

function getSelectedIP() {
  let selectedIP = null;

  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith('--ip=')) {
      selectedIP = arg.split('=')[1];
      break;
    }
  }

  if (!selectedIP && process.env.SERVER_IP) {
    selectedIP = process.env.SERVER_IP;
  }

  if (selectedIP) {
    const availableIPs = getAllNetworkIPs();
    const isValidIP = availableIPs.some((ip) => ip.address === selectedIP);

    if (!isValidIP) {
      console.warn(`⚠️ Selected IP "${selectedIP}" is not available. Using first available IP instead.`);
      selectedIP = null;
    }
  }

  if (!selectedIP) {
    const availableIPs = getAllNetworkIPs();
    if (availableIPs.length > 0) {
      selectedIP = availableIPs[0].address;
      console.log(`📡 Using first available IP: ${selectedIP} (${availableIPs[0].interface})`);
    } else {
      selectedIP = 'localhost';
      console.log('⚠️ No network interfaces found. Using localhost');
    }
  }

  return selectedIP;
}

function getInterfaceForIP(ipAddress) {
  const interfaces = os.networkInterfaces();
  for (const ifaceName in interfaces) {
    for (const iface of interfaces[ifaceName]) {
      if (iface.family === 'IPv4' && iface.address === ipAddress) {
        return ifaceName;
      }
    }
  }
  return 'Unknown';
}

const localIP = getSelectedIP();
const interfaceName = getInterfaceForIP(localIP);

// ==================== SSL CERTIFICATE CONFIGURATION ====================

const certsDir = path.join(__dirname, 'certs');
const certPath = path.join(certsDir, 'selfsigned.pem');
const keyPath = path.join(certsDir, 'selfsigned.key');

let sslOptions = null;

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('🔒 Using existing SSL certificates from certs/ folder');
  sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
} else {
  console.log('🔒 Generating new SSL certificates...');
  try {
    const selfsigned = require('selfsigned');
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, { days: 365, keySize: 2048 });

    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
      console.log('✅ Created certs/ directory');
    }

    fs.writeFileSync(certPath, pems.cert);
    fs.writeFileSync(keyPath, pems.private);

    sslOptions = { key: pems.private, cert: pems.cert };
    console.log('✅ SSL certificates generated in certs/ folder');
  } catch (error) {
    console.warn('⚠️ Could not generate SSL certificates. Running in HTTP mode.');
  }
}

// ==================== MIDDLEWARE CONFIGURATION ====================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Admin must have sessions (auth middleware relies on req.session)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      secure: sslOptions !== null,
      httpOnly: true,
      maxAge: 1800000,
      sameSite: 'lax',
    },
  })
);

// Static files (admin html/css/js from frontend)
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Wire DB into treeRoutes (this is often why server.js works but adminServer doesn’t)
setTreeDatabase(db);

// ==================== API ROUTES (ADMIN) ====================

app.use('/api/admin', adminRoutes);
app.use('/api/admin/data-export', dataExportRoutes);

// Tree data fetching for Digital Tree tab
app.use('/api/tree', treeRoutes);

// Leaderboard data fetching for Leaderboard tab
app.use('/api/leaderboard', leaderboardRoutes);

// Optional test route (same as your server.js)
app.get('/api/test-db', (req, res) => {
  db.query(
    'SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ?',
    [process.env.DB_NAME || 'dp_kiosk_db'],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
      res.json({
        message: 'MySQL database is working!',
        tables: results.length > 0 ? results.map((r) => r.TABLE_NAME) : 'No tables found',
        database: process.env.DB_NAME || 'dp_kiosk_db',
      });
    }
  );
});

// Email test (same as your server.js)
app.get('/api/test-email-service', (req, res) => {
  const emailInitialized = emailService.initEmailService();
  if (emailInitialized) {
    res.json({
      success: true,
      message: 'Email service initialized',
      smtpUser: process.env.SMTP_USER || 'Using default',
    });
  } else {
    res.json({
      success: false,
      message: 'Email service failed to initialize',
      error: 'Check SMTP credentials',
    });
  }
});

// ==================== PAGE ROUTES (ADMIN) ====================

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/admin.html'));
});

app.get('/', (req, res) => {
  res.redirect('/admin');
});

// ==================== START SERVER ====================

function printServerInfo(isHttps) {
  console.log('\n🌐 ============================================');
  console.log('   ADMIN SERVER (Admin UI + Admin API)');
  console.log('============================================');
  console.log(`📡 Interface: ${interfaceName}`);
  console.log(`📡 IP: ${localIP}`);
  console.log(`🚀 URL: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}`);
  console.log(`⚙️ Admin: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/admin`);
  console.log(`📦 Data Export: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/api/admin/data-export`);
  console.log(`📅 Started: ${new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}`);
  console.log('============================================\n');
}

function startServer() {
  if (sslOptions) {
    const server = https.createServer(sslOptions, app);
    server.listen(PORT, localIP, () => printServerInfo(true));
  } else {
    app.listen(PORT, localIP, () => printServerInfo(false));
  }
}

// Initialize email service at startup (like your server.js)
const emailInitialized = emailService.initEmailService();
console.log(emailInitialized ? '📧 Email service initialized successfully' : '⚠️ Email service not initialized');

startServer();
