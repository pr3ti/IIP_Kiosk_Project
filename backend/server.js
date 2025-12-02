// server.js - Main server file with HTTPS and IP detection
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const db = require('./db');
const feedbackRoutes = require('./feedbackRoutes');
const adminRoutes = require('./adminRoutes');
const os = require('os');
const emailService = require('./emailService');

// ⬇️ Import tree routes and wire them to the shared DB
const { router: treeRoutes, setDatabase: setTreeDatabase } = require('./treeRoutes');

// Import cleanup module
const dataRetentionCleanup = require('./dataRetentionCleanup');

// Import QR code generation
const QRCode = require('qrcode');

const app = express();
const PORT = 3000;

// Get all available network interfaces and their IPs
function getAllNetworkIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    
    for (const ifaceName in interfaces) {
        for (const iface of interfaces[ifaceName]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push({
                    interface: ifaceName,
                    address: iface.address,
                    mac: iface.mac,
                    cidr: iface.cidr
                });
            }
        }
    }
    return ips;
}

// Get selected IP address
function getSelectedIP() {
    // Priority: Command line argument > Environment variable > First available IP
    let selectedIP = null;
    
    // Check command line arguments (e.g., node server.js --ip=192.168.1.100)
    const args = process.argv.slice(2);
    for (const arg of args) {
        if (arg.startsWith('--ip=')) {
            selectedIP = arg.split('=')[1];
            break;
        }
    }
    
    // Check environment variable
    if (!selectedIP && process.env.SERVER_IP) {
        selectedIP = process.env.SERVER_IP;
    }
    
    // Validate the selected IP is available
    if (selectedIP) {
        const availableIPs = getAllNetworkIPs();
        const isValidIP = availableIPs.some(ip => ip.address === selectedIP);
        
        if (!isValidIP) {
            console.warn(`⚠️  Selected IP "${selectedIP}" is not available on any network interface`);
            console.log('   Available IPs:');
            availableIPs.forEach(ip => {
                console.log(`   - ${ip.address} (${ip.interface})`);
            });
            console.log('   Using first available IP instead');
            selectedIP = null;
        }
    }
    
    // Use first available IP if none selected
    if (!selectedIP) {
        const availableIPs = getAllNetworkIPs();
        if (availableIPs.length > 0) {
            selectedIP = availableIPs[0].address;
            console.log(`📡 Using first available IP: ${selectedIP} (${availableIPs[0].interface})`);
        } else {
            selectedIP = 'localhost';
            console.log('⚠️  No network interfaces found. Using localhost');
        }
    }
    
    return selectedIP;
}

// Get interface name for the selected IP
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

// Check for existing SSL certificate or generate new one
const certPath = path.join(__dirname, 'selfsigned.pem');
const keyPath = path.join(__dirname, 'selfsigned.key');

let sslOptions = null;

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    // Use existing certificate
    sslOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };
} else {
    console.log('⚠️  SSL certificates not found. Running in HTTP mode.');
    console.log('   Run: npm install selfsigned');
    console.log('   Then modify server.js to generate certificates');
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware - set secure based on HTTPS availability
app.use(session({
    secret: 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: sslOptions !== null }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Wire the shared DB into the tree routes
setTreeDatabase(db);

// API routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Tree API for the leaves (names from feedback.db)
app.use('/api/tree', treeRoutes);

// NEW: API endpoint to get all network interfaces
app.get('/api/network-interfaces', (req, res) => {
    const interfaces = getAllNetworkIPs();
    res.json({
        interfaces: interfaces,
        current: {
            ip: localIP,
            interface: interfaceName,
            port: PORT
        }
    });
});

// NEW: API endpoint to get server info (IP, protocol, QR code)
app.get('/api/server-info', (req, res) => {
    const protocol = sslOptions ? 'https' : 'http';
    const url = `${protocol}://${localIP}:${PORT}/feedback`;
    
    res.json({
        ip: localIP,
        interface: interfaceName,
        port: PORT,
        protocol: protocol,
        url: url,
        httpsAvailable: sslOptions !== null,
        networkInterfaces: getAllNetworkIPs()
    });
});

// NEW: Generate QR code endpoint
app.get('/api/generate-qr', async (req, res) => {
    try {
        const protocol = sslOptions ? 'https' : 'http';
        const url = `${protocol}://${localIP}:${PORT}/feedback`;
        
        // Generate QR code as SVG (maintaining similar size to your dummy QR)
        const qrSvg = await QRCode.toString(url, {
            type: 'svg',
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 200,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        
        res.json({
            success: true,
            qrSvg: qrSvg,
            url: url,
            ip: localIP,
            interface: interfaceName,
            port: PORT
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate QR code' 
        });
    }
});

// Test route
app.get('/api/test-db', (req, res) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Database error: ' + err.message });
        } else {
            res.json({
                message: 'Database is working!',
                tables: row ? 'Tables exist' : 'No tables found',
                ip: localIP,
                interface: interfaceName,
                port: PORT,
                https: sslOptions !== null
            });
        }
    });
});

// Serve pages
app.get('/feedback', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/feedback/feedback.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/admin.html'));
});

// Tree page – assumes file: frontend/tree/tree.html
app.get('/tree', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/tree/tree.html'));
});

// Default redirect
app.get('/', (req, res) => {
    res.redirect('/feedback');
});

// Function to generate self-signed certificate if needed
function generateSelfSignedCertificate() {
    try {
        const selfsigned = require('selfsigned');
        console.log('🔐 Generating self-signed SSL certificate...');
        
        const attrs = [{ name: 'commonName', value: localIP }];
        const pems = selfsigned.generate(attrs, { 
            days: 365,
            keySize: 2048
        });
        
        fs.writeFileSync(certPath, pems.cert);
        fs.writeFileSync(keyPath, pems.private);
        
        console.log('✅ Self-signed certificate generated');
        return {
            key: pems.private,
            cert: pems.cert
        };
    } catch (error) {
        console.error('❌ Failed to generate SSL certificate:', error.message);
        console.log('💡 Install selfsigned package: npm install selfsigned');
        return null;
    }
}

// Start server
function startServer() {
    if (sslOptions) {
        // Start HTTPS server
        const server = https.createServer(sslOptions, app);
        server.listen(PORT, localIP, () => {
            printServerInfo(true);
        });
    } else {
        // Start HTTP server (fallback)
        app.listen(PORT, localIP, () => {
            printServerInfo(false);
        });
    }
}

function printServerInfo(isHttps) {
    const protocol = isHttps ? 'HTTPS' : 'HTTP';
    const availableIPs = getAllNetworkIPs();
    
    console.log('\n🌐 ============================================');
    console.log('   FEEDBACK KIOSK SERVER');
    console.log('============================================');
    console.log(`📡 Selected Interface: ${interfaceName}`);
    console.log(`📡 Selected IP: ${localIP}`);
    console.log(`🚀 ${protocol}: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}`);
    console.log(`📊 Feedback: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/feedback`);
    console.log(`🌳 Tree: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/tree`);
    console.log(`⚙️  Admin: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/admin`);
    console.log(`📅 Started: ${new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}`);
    console.log('🌏 Timezone: Singapore (UTC+8)');
    console.log(`📁 Database: ${path.join(__dirname, '../database/feedback.db')}`);
    console.log('============================================');
    
    console.log('\n🌐 Available Network Interfaces:');
    if (availableIPs.length > 0) {
        availableIPs.forEach(ip => {
            const indicator = ip.address === localIP ? '→ ' : '  ';
            console.log(`   ${indicator}${ip.address} (${ip.interface}) ${ip.cidr ? `[${ip.cidr}]` : ''}`);
        });
    } else {
        console.log('   No network interfaces found');
    }
    
    console.log('\n📱 QR Code Information:');
    console.log(`   Scan to access: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/feedback`);
    console.log(`   QR API: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/api/generate-qr`);
    console.log('============================================\n');

    // Initialize data retention cleanup system
    dataRetentionCleanup.initializeCleanup();
}

// Try to enable HTTPS if selfsigned package is available
try {
    require.resolve('selfsigned');
    
    if (!sslOptions) {
        // Generate certificate if selfsigned is available
        sslOptions = generateSelfSignedCertificate();
    }
} catch (error) {
    console.log('⚠️  "selfsigned" package not installed. Running in HTTP mode.');
    console.log('💡 For HTTPS, run: npm install selfsigned');
}

// Email test endpoint
app.get('/api/test-email-service', (req, res) => {
    const emailInitialized = emailService.initEmailService();
    if (emailInitialized) {
        res.json({ 
            success: true, 
            message: 'Email service initialized',
            smtpUser: process.env.SMTP_USER || 'Using default'
        });
    } else {
        res.json({ 
            success: false, 
            message: 'Email service failed to initialize',
            error: 'Check SMTP credentials'
        });
    }
});

// Initialize email service
const emailInitialized = emailService.initEmailService();
if (emailInitialized) {
    console.log('📧 Email service initialized successfully');
} else {
    console.log('⚠️ Email service not initialized - check SMTP credentials');
}

// Display help if requested
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log('\nUsage:');
    console.log('  node server.js [options]');
    console.log('\nOptions:');
    console.log('  --ip=<IP_ADDRESS>    Specify the IP address to bind to');
    console.log('  --help, -h           Show this help message');
    console.log('\nExamples:');
    console.log('  node server.js --ip=192.168.1.100');
    console.log('  node server.js --ip=10.0.0.5');
    console.log('\nEnvironment Variables:');
    console.log('  SERVER_IP=<IP_ADDRESS>  Specify IP via environment variable');
    console.log('  PORT=<PORT_NUMBER>      Change port (default: 3000)');
    console.log('\nAvailable IPs:');
    const availableIPs = getAllNetworkIPs();
    if (availableIPs.length > 0) {
        availableIPs.forEach(ip => {
            console.log(`  - ${ip.address} (${ip.interface})`);
        });
    } else {
        console.log('  No network interfaces found');
    }
    console.log('');
    process.exit(0);
}

// Start the server
startServer();