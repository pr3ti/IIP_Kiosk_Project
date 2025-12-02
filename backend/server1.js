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

// ⬇️ Import tree routes and wire them to the shared DB
const { router: treeRoutes, setDatabase: setTreeDatabase } = require('./treeRoutes');

// Import cleanup module
const dataRetentionCleanup = require('./dataRetentionCleanup');

// Import QR code generation
const QRCode = require('qrcode');

const app = express();
const PORT = 3000;

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    
    for (const ifaceName in interfaces) {
        for (const iface of interfaces[ifaceName]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const localIP = getLocalIP();

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

// NEW: API endpoint to get server info (IP, protocol, QR code)
app.get('/api/server-info', (req, res) => {
    const protocol = sslOptions ? 'https' : 'http';
    const url = `${protocol}://${localIP}:${PORT}/feedback`;
    
    res.json({
        ip: localIP,
        port: PORT,
        protocol: protocol,
        url: url,
        httpsAvailable: sslOptions !== null
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
        server.listen(PORT, '0.0.0.0', () => {
            printServerInfo(true);
        });
    } else {
        // Start HTTP server (fallback)
        app.listen(PORT, '0.0.0.0', () => {
            printServerInfo(false);
        });
    }
}

function printServerInfo(isHttps) {
    const protocol = isHttps ? 'HTTPS' : 'HTTP';
    
    console.log('\n🌐 ============================================');
    console.log('   FEEDBACK KIOSK SERVER');
    console.log('============================================');
    console.log(`📡 Server IP: ${localIP}`);
    console.log(`🚀 ${protocol}: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}`);
    console.log(`📊 Feedback: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/feedback`);
    console.log(`🌳 Tree: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/tree`);
    console.log(`⚙️  Admin: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/admin`);
    console.log(`📅 Started: ${new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}`);
    console.log('🌏 Timezone: Singapore (UTC+8)');
    console.log(`📁 Database: ${path.join(__dirname, '../database/feedback.db')}`);
    console.log('============================================\n');
    
    console.log('📱 QR Code Information:');
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

// Start the server
startServer();