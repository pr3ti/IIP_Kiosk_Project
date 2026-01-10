// ============================================================
// SERVER.JS - TABLE OF CONTENTS
// ============================================================
// 
// 1. IMPORTS & INITIALIZATION
//    require('dotenv').config()        - Load environment variables (DONE BY PRETI)
//    const express                     - Express framework (DONE BY PRETI)
//    const https                       - HTTPS module (DONE BY PRETI)
//    const fs                          - File system module (DONE BY PRETI)
//    const path                        - Path module (DONE BY PRETI)
//    const session                     - Session management (DONE BY PRETI)
//    const db                          - Database connection (DONE BY PRETI)
//    const feedbackRoutes              - Feedback API routes 
//    const adminRoutes                 - Admin API routes (DONE BY PRETI)
//    const dataExportRoutes            - Data export routes (DONE BY PRETI)
//    const os                          - OS utilities (DONE BY PRETI)
//    const emailService                - Email service
//    const { router: treeRoutes, setDatabase: setTreeDatabase } - Tree routes with DB setter
//    const dataRetentionCleanup        - Cleanup module (DONE BY PRETI)
//    const QRCode                      - QR code generation (DONE BY PRETI)
//    const app = express()             - Express app instance (DONE BY PRETI)
//    const PORT = 3000                 - Server port (DONE BY PRETI)
//
// 2. NETWORK INTERFACE FUNCTIONS
//    function getAllNetworkIPs()       - Get all available network IPs (DONE BY PRETI)
//    function getSelectedIP()          - Get selected IP with priority logic (DONE BY PRETI)
//    function getInterfaceForIP()      - Get interface name for IP address (DONE BY PRETI)
//    const localIP                     - Selected IP address (DONE BY PRETI)
//    const interfaceName               - Interface name for selected IP (DONE BY PRETI)
//
// 3. SSL CERTIFICATE CONFIGURATION
//    const certsDir                    - SSL certificates directory (DONE BY PRETI)
//    const certPath                    - Certificate file path (DONE BY PRETI)
//    const keyPath                     - Key file path (DONE BY PRETI)
//    let sslOptions                    - SSL options storage (DONE BY PRETI)
//
// 4. MIDDLEWARE CONFIGURATION
//    app.use(express.json())           - JSON body parser (DONE BY PRETI)
//    app.use(express.urlencoded())     - URL-encoded body parser (DONE BY PRETI)
//    app.use(session())                - Session middleware (DONE BY PRETI)
//    app.use(express.static())         - Static file serving (DONE BY PRETI)
//    setTreeDatabase(db)               - Wire shared DB into tree routes
//
// 5. API ROUTES
//    app.use('/api/feedback', feedbackRoutes) - Feedback API routes (DONE BY PRETI)
//    app.use('/api/admin', adminRoutes) - Admin API routes (DONE BY PRETI)
//    app.use('/api/admin/data-export', dataExportRoutes) - Data export routes (DONE BY PRETI)
//    app.use('/api/tree', treeRoutes)  - Tree API routes
//    app.get('/api/network-interfaces') - Get all network interfaces (DONE BY PRETI)
//    app.get('/api/server-info')       - Get server info (IP, protocol, QR) (DONE BY PRETI)
//    app.get('/api/generate-qr')       - Generate QR code endpoint (DONE BY PRETI)
//    app.get('/api/test-db')           - Test database connection (DONE BY PRETI)
//    app.get('/api/test-email-service') - Test email service
//
// 6. PAGE ROUTES
//    app.get('/feedback')              - Serve feedback page 
//    app.get('/admin')                 - Serve admin page (DONE BY PRETI)
//    app.get('/tree')                  - Serve tree page
//    app.get('/')                      - Default redirect to feedback 
//
// 7. CERTIFICATE & SERVER FUNCTIONS
//    function generateSelfSignedCertificate() - Generate self-signed certificate (DONE BY PRETI)
//    function startServer()            - Start HTTP/HTTPS server (DONE BY PRETI)
//    function printServerInfo()        - Print server startup information (DONE BY PRETI)
// 
// 8. SERVER STARTUP & INITIALIZATION
//    Email service initialization      - Initialize email service 
//    Help command check                - Display help if --help flag present (DONE BY PRETI)
//    startServer()                     - Start the server (DONE BY PRETI)
//
// server.js - Main server file with HTTPS and IP detection

// ==================== 1. IMPORTS & INITIALIZATION ====================

require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const db = require('./db');
const feedbackRoutes = require('./feedbackRoutes');
const adminRoutes = require('./adminRoutes');
const dataExportRoutes = require('./dataExportRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const os = require('os');
const emailService = require('./emailService');

// Import tree routes and wire them to the shared DB
const { router: treeRoutes, setDatabase: setTreeDatabase } = require('./treeRoutes');

// Import cleanup module
const dataRetentionCleanup = require('./dataRetentionCleanup');

// Import QR code generation
const QRCode = require('qrcode');

const app = express();
const PORT = 3000;

// ==================== 2. NETWORK INTERFACE FUNCTIONS ====================

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

// ==================== 3. SSL CERTIFICATE CONFIGURATION ====================

// Check for existing SSL certificate or generate new one
// Updated paths to use certs/ folder
const certsDir = path.join(__dirname, 'certs');
const certPath = path.join(certsDir, 'selfsigned.pem');
const keyPath = path.join(certsDir, 'selfsigned.key');

let sslOptions = null;

// Try to load existing certificates
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    console.log('🔒 Using existing SSL certificates from certs/ folder');
    sslOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };
} else {
    // Auto-generate if missing
    console.log('🔒 Generating new SSL certificates...');
    try {
        const selfsigned = require('selfsigned');
        const attrs = [{ name: 'commonName', value: 'localhost' }];
        const pems = selfsigned.generate(attrs, { 
            days: 365,  // Valid for 1 year
            keySize: 2048 
        });
        
        // Create certs directory if it doesn't exist
        if (!fs.existsSync(certsDir)) {
            fs.mkdirSync(certsDir, { recursive: true });
            console.log('✅ Created certs/ directory');
        }
        
        fs.writeFileSync(certPath, pems.cert);
        fs.writeFileSync(keyPath, pems.private);
        
        sslOptions = {
            key: pems.private,
            cert: pems.cert
        };
        
        console.log('✅ SSL certificates generated in certs/ folder');
    } catch (error) {
        console.warn('⚠️  Could not generate SSL certificates');
        console.log('   Install: npm install selfsigned');
        console.log('   Running in HTTP mode instead');
    }
}

// ==================== 4. MIDDLEWARE CONFIGURATION ====================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware - set secure based on HTTPS availability
// app.use(session({
//     secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { 
//         secure: sslOptions !== null,
//         httpOnly: true,
//         maxAge: 1800000 // 30 minutes
//     }
// }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: true,  
    saveUninitialized: false,
    rolling: true,  
    cookie: { 
        secure: sslOptions !== null,
        httpOnly: true,
        maxAge: 1800000,
        sameSite: 'lax'  
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Wire the shared DB into the tree routes
setTreeDatabase(db);

// ==================== 5. API ROUTES ====================

app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/data-export', dataExportRoutes);
app.use('/api/leaderboard', leaderboardRoutes); 

// Tree API for the leaves (names from feedback.db)
app.use('/api/tree', treeRoutes);

// API endpoint to get all network interfaces
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

// API endpoint to get server info (IP, protocol, QR code)
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
        networkInterfaces: getAllNetworkIPs(),
        certsPath: sslOptions ? certsDir : null
    });
});

// Generate QR code endpoint
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
    db.query(
        "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ?",
        [process.env.DB_NAME || 'dp_kiosk_db'],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            res.json({
                message: 'MySQL database is working!',
                tables: results.length > 0 ? results.map(r => r.TABLE_NAME) : 'No tables found',
                database: process.env.DB_NAME || 'dp_kiosk_db'
            });
        }
    );
});

// ==================== 6. PAGE ROUTES ====================

app.get('/feedback', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/feedback/feedback.html'));
});

app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/Leaderboard/Leaderboard.html'));
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

// ==================== 7. CERTIFICATE & SERVER FUNCTIONS ====================

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
        
        // Create certs directory if it doesn't exist
        if (!fs.existsSync(certsDir)) {
            fs.mkdirSync(certsDir, { recursive: true });
        }
        
        // Update paths to write to certs folder
        fs.writeFileSync(certPath, pems.cert);
        fs.writeFileSync(keyPath, pems.private);
        
        console.log('✅ Self-signed certificate generated in certs/ folder');
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
    console.log(`🏆 Leaderboard: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/leaderboard`);
    console.log(`🌳 Tree: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/tree`);
    console.log(`⚙️  Admin: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/admin`);
    console.log(`📦 Data Export: ${isHttps ? 'https' : 'http'}://${localIP}:${PORT}/api/admin/data-export`); 
    console.log(`📅 Started: ${new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}`);
    console.log('🌏 Timezone: Singapore (UTC+8)');
    console.log(`🗄️  Database: MySQL (${process.env.DB_NAME || 'dp_kiosk_db'})`);
    console.log(`🔐 SSL Certificates: ${certsDir}/`);
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

// ==================== 8. SERVER STARTUP & INITIALIZATION ====================

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