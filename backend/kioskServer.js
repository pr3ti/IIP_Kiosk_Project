// DONE BY PRETI

require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const os = require('os');

const db = require('./db');
const feedbackRoutes = require('./feedbackRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const emailService = require('./emailService');

const { router: treeRoutes, setDatabase: setTreeDatabase } = require('./treeRoutes');
const dataRetentionCleanup = require('./dataRetentionCleanup');
const QRCode = require('qrcode');

const app = express();
const PORT = 3001;

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

// Optional: kiosk may not need session, but safe to keep if any route uses it
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

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Wire DB into tree routes
setTreeDatabase(db);

// ==================== API ROUTES (KIOSK) ====================

app.use('/api/feedback', feedbackRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tree', treeRoutes);

// Network info
app.get('/api/network-interfaces', (req, res) => {
  res.json({
    interfaces: getAllNetworkIPs(),
    current: { ip: localIP, interface: interfaceName, port: PORT },
  });
});

// Server info
app.get('/api/server-info', (req, res) => {
  const protocol = sslOptions ? 'https' : 'http';
  const url = `${protocol}://${localIP}:${PORT}/feedback`;

  res.json({
    ip: localIP,
    interface: interfaceName,
    port: PORT,
    protocol,
    url,
    httpsAvailable: sslOptions !== null,
    networkInterfaces: getAllNetworkIPs(),
    certsPath: sslOptions ? certsDir : null,
  });
});

// QR code (for feedback URL)
app.get('/api/generate-qr', async (req, res) => {
  try {
    const protocol = sslOptions ? 'https' : 'http';
    const url = `${protocol}://${localIP}:${PORT}/feedback`;

    const qrSvg = await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: { dark: '#000000', light: '#ffffff' },
    });

    res.json({ success: true, qrSvg, url, ip: localIP, interface: interfaceName, port: PORT });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ success: false, error: 'Failed to generate QR code' });
  }
});

// Test database connection
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

// Email test endpoint
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

// ==================== PAGE ROUTES (KIOSK) ====================

app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/feedback/feedback.html'));
});

app.get('/pledgeboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Leaderboard/Leaderboard.html'));
});

app.get('/tree', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/tree/tree.html'));
});

app.get('/', (req, res) => {
  res.redirect('/feedback');
});

// ==================== START SERVER ====================

function printServerInfo(isHttps) {
  console.log('\n🌐 ============================================');
  console.log('   KIOSK SERVER (Feedback/Leaderboard/Tree)');
  console.log('============================================');
  console.log(`📡 Interface: ${interfaceName}`);
  console.log(`📡 IP: ${localIP}`);
  console.log(`🚀 URL: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}`);
  console.log(`📊 Feedback: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/feedback`);
  console.log(`🏆 Pledgeboard: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/pledgeboard`);
  console.log(`🌳 Tree: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/tree`);
  console.log(`📅 Started: ${new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}`);
  console.log('============================================\n');

  dataRetentionCleanup.initializeCleanup();
}

function startServer() {
  if (sslOptions) {
    const server = https.createServer(sslOptions, app);
    server.listen(PORT, localIP, () => printServerInfo(true));
  } else {
    app.listen(PORT, localIP, () => printServerInfo(false));
  }
}

// Initialize email service at startup
const emailInitialized = emailService.initEmailService();
console.log(emailInitialized ? '📧 Email service initialized successfully' : '⚠️ Email service not initialized');

startServer();
