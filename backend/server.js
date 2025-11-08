const express = require('express');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const sharp = require('sharp');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// ==================== TEAM MEMBER ASSIGNMENTS ====================
// BERNISSA: Automatic Photo Capture - Edit auto-capture timing and high-res processing
// NADH: Email Automation - Edit email templates and content only
// ZAH: Digital Tree Integration - Edit tree visualization and animations
// 🚫  DO NOT MODIFY core security, database, or other code
// =================================================================

// Get the backend directory path
const backendDir = __dirname;
const projectRoot = path.join(backendDir, '..');

// Encryption Configuration
const ENCRYPTION_KEY = '12345678901234567890123456789012';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Cleanup Configuration - (20 * 1000) 20 seconds for testing (change to 7 * 24 * 60 * 60 * 1000 for 7 days)
const CLEANUP_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

console.log('🔐 Encryption configured successfully');
console.log('🔐 Key length:', ENCRYPTION_KEY.length); // Should show 32

// Encryption function
function encryptEmail(email) {
  if (!email || email.trim() === '') return null;

  try {
    // Ensure the key is exactly 32 bytes
    const keyBuffer = Buffer.from(ENCRYPTION_KEY);
    if (keyBuffer.length !== 32) {
      console.error('❌ Invalid key length:', keyBuffer.length);
      return null;
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

    let encrypted = cipher.update(email.trim(), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    return null;
  }
}

// Decryption function
function decryptEmail(encryptedEmail) {
  if (!encryptedEmail) return null;

  try {
    const parts = encryptedEmail.split(':');
    if (parts.length !== 2) {
      return null;
    }

    const keyBuffer = Buffer.from(ENCRYPTION_KEY);
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];

    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    return null;
  }
}

// Mask email for display (shows only first character) // do not edit
function maskEmail(email) {
  if (!email) return 'N/A';

  try {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return 'Invalid email';

    const maskedLocal =
      localPart.charAt(0) + '*'.repeat(Math.max(0, localPart.length - 1));
    return `${maskedLocal}@${domain}`;
  } catch (error) {
    console.error('❌ Email masking error:', error);
    return 'N/A';
  }
}

// ==================== AUDIT LOGS SYSTEM ====================

// Initialize audit logs array
let auditLogs = [];

// Function to add audit log entry
function addAuditLog(type, message, user = null, details = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: type,
    message: message,
    user: user,
    details: details
  };

  auditLogs.push(logEntry);

  // Keep only last 1000 logs to prevent memory issues
  if (auditLogs.length > 1000) {
    auditLogs = auditLogs.slice(-1000);
  }

  console.log(
    `📋 AUDIT: [${type}] ${message}${user ? ` - User: ${user}` : ''}`
  );
  return logEntry;
}

// Initialize with some sample logs if empty
if (auditLogs.length === 0) {
  addAuditLog('system', 'Audit log system initialized');
  addAuditLog('system', 'Server started successfully');
}

// ==================== AUTOMATIC CLEANUP SYSTEM FOR OUTPUT FOLDER ====================

// Function to delete old photos and emails - FIXED VERSION
function cleanupOldData() {
  console.log('🔄 Starting automatic cleanup of old photos and emails...');

  const cutoffTime = new Date(Date.now() - CLEANUP_INTERVAL_MS);
  console.log(`⏰ Cleanup cutoff time: ${cutoffTime.toISOString()}`);

  // FIXED: Find ALL feedback records older than cutoff time, not just those with photos/emails
  db.all(
    `SELECT f.id, f.photo_path, u.id as user_id, u.email, u.name,
            f.created_at as feedback_date
     FROM feedback f 
     JOIN users u ON f.user_id = u.id 
     WHERE f.created_at < ?`,
    [cutoffTime.toISOString()],
    (err, oldRecords) => {
      if (err) {
        console.error('❌ Error finding old records:', err);
        return;
      }

      console.log(
        `📋 Found ${oldRecords.length} records older than ${
          CLEANUP_INTERVAL_MS / 1000
        } seconds`
      );

      if (oldRecords.length === 0) {
        console.log('✅ No old records to clean up');
        return;
      }

      let photosDeleted = 0;
      let emailsRemoved = 0;

      oldRecords.forEach((record) => {
        console.log(
          `🔍 Processing record: User "${record.name}", Feedback ID: ${record.id}, Created: ${record.feedback_date}`
        );

        // Delete photo file if it exists
        if (
          record.photo_path &&
          record.photo_path !== 'null' &&
          record.photo_path.trim() !== ''
        ) {
          const photoFilename = path.basename(record.photo_path);
          const photoPath = path.join(
            backendDir,
            'assets',
            'outputs',
            photoFilename
          );

          if (fs.existsSync(photoPath)) {
            fs.unlink(photoPath, (err) => {
              if (err) {
                console.error('❌ Error deleting photo:', photoPath, err);
              } else {
                console.log('✅ Deleted photo:', photoFilename);
                photosDeleted++;
              }
            });
          } else {
            console.log(
              'ℹ️ Photo file not found (may already be deleted):',
              photoPath
            );
          }

          // Update feedback to mark photo as removed
          db.run(
            'UPDATE feedback SET photo_path = NULL WHERE id = ?',
            [record.id],
            function (err) {
              if (err) {
                console.error('❌ Error updating feedback photo path:', err);
              } else {
                console.log(
                  '✅ Updated feedback record to remove photo path for ID:',
                  record.id
                );
              }
            }
          );
        }

        // Remove email from user record if it exists
        if (record.email && record.email !== 'null' && record.email.trim() !== '') {
          db.run(
            'UPDATE users SET email = NULL WHERE id = ?',
            [record.user_id],
            function (err) {
              if (err) {
                console.error(
                  '❌ Error removing email for user:',
                  record.user_id,
                  err
                );
              } else {
                console.log('✅ Removed email for user ID:', record.user_id);
                emailsRemoved++;

                // Add audit log for cleanup
                addAuditLog(
                  'system',
                  `Auto-cleanup: Removed email and photo for user ${record.name}`,
                  'system',
                  {
                    userId: record.user_id,
                    feedbackId: record.id,
                    cleanupTime: new Date().toISOString(),
                    originalCreation: record.feedback_date
                  }
                );
              }
            }
          );
        }
      });

      console.log(
        `✅ Cleanup completed: ${photosDeleted} photos deleted, ${emailsRemoved} emails removed`
      );

      // Force refresh of all admin data
      forceAdminDataRefresh();
    }
  );
}

// ==================== UPLOADS FOLDER CLEANUP (Internal Storage Only) ====================

// Function to clean up old raw photos from uploads folder (doesn't affect database)
function cleanupUploadsFolder() {
  console.log('🔄 Starting cleanup of old raw photos from uploads folder...');

  const cutoffTime = new Date(Date.now() - CLEANUP_INTERVAL_MS);
  console.log(`⏰ Uploads cleanup cutoff time: ${cutoffTime.toISOString()}`);

  const uploadsDir = path.join(backendDir, 'assets', 'uploads');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('❌ Error reading uploads directory:', err);
      return;
    }

    console.log(`📁 Found ${files.length} files in uploads folder`);

    let uploadsDeleted = 0;
    let filesProcessed = 0;

    if (files.length === 0) {
      console.log('ℹ️ No files found in uploads directory');
      return;
    }

    files.forEach((uploadFile) => {
      // Only process uploaded photo files
      if (uploadFile.startsWith('upload-') && uploadFile.endsWith('.jpg')) {
        const uploadPath = path.join(uploadsDir, uploadFile);

        fs.stat(uploadPath, (err, stats) => {
          filesProcessed++;

          if (err) {
            console.error('❌ Error getting file stats:', uploadPath, err);
          } else if (stats.birthtime < cutoffTime) {
            // File is older than cutoff time, delete it
            fs.unlink(uploadPath, (err) => {
              if (err) {
                console.error(
                  '❌ Error deleting uploaded photo:',
                  uploadPath,
                  err
                );
              } else {
                console.log('✅ Deleted old raw uploaded photo:', uploadFile);
                uploadsDeleted++;

                // Add audit log for uploads cleanup
                addAuditLog(
                  'system',
                  `Uploads cleanup: Deleted raw photo ${uploadFile}`,
                  'system',
                  {
                    fileName: uploadFile,
                    fileAge:
                      Math.round(
                        (Date.now() - stats.birthtime.getTime()) / 1000
                      ) + ' seconds',
                    cleanupTime: new Date().toISOString()
                  }
                );
              }
            });
          } else {
            console.log(
              `ℹ️ Keeping recent raw photo: ${uploadFile} (${Math.round(
                (Date.now() - stats.birthtime.getTime()) / 1000
              )} seconds old)`
            );
          }

          // Log final results when all files are processed
          if (filesProcessed === files.length) {
            console.log(
              `✅ Uploads folder cleanup completed: ${uploadsDeleted} raw photos deleted`
            );

            if (uploadsDeleted > 0) {
              addAuditLog(
                'system',
                `Uploads cleanup: Deleted ${uploadsDeleted} old raw photos`,
                'system',
                {
                  filesDeleted: uploadsDeleted,
                  totalFiles: files.length,
                  cleanupTime: new Date().toISOString()
                }
              );
            }
          }
        });
      } else {
        filesProcessed++;
        console.log(`ℹ️ Skipping non-photo file: ${uploadFile}`);
      }
    });
  });
}

// Function to force admin data refresh
function forceAdminDataRefresh() {
  console.log('🔄 Force refreshing admin data after cleanup...');
  // This will be handled by the auto-refresh system in the admin panel
}

// Start the cleanup interval - FOR PRODUCTION
function startCleanupInterval() {
  console.log(
    `🔄 Starting cleanup interval: ${
      CLEANUP_INTERVAL_MS / 1000 / 60 / 60 / 24
    } days`
  );

  // Run immediately on startup (wait a bit for server to stabilize)
  setTimeout(() => {
    cleanupOldData(); // This cleans database records and processed photos
    cleanupUploadsFolder(); // This cleans raw uploads separately
  }, 30000); // Wait 30 seconds after startup

  // Then run both cleanups every 6 hours for production (instead of every 30 seconds)
  setInterval(() => {
    cleanupOldData(); // Database + processed photos
    cleanupUploadsFolder(); // Raw uploads only
  }, 6 * 60 * 60 * 1000); // Check every 6 hours for production

  console.log('✅ Both database and uploads folder cleanup systems are active');
}

// // Start the cleanup interval - MORE FREQUENT FOR TESTING
// function startCleanupInterval() {
//   console.log(`🔄 Starting cleanup interval: ${CLEANUP_INTERVAL_MS/1000} seconds`);
//
//   // Run immediately on startup (wait a bit for server to stabilize)
//   setTimeout(() => {
//     cleanupOldData(); // This cleans database records and processed photos
//     cleanupUploadsFolder(); // This cleans raw uploads separately
//   }, 10000); // Wait 10 seconds after startup
//
//   // Then run both cleanups every 30 seconds for testing
//   setInterval(() => {
//     cleanupOldData(); // Database + processed photos
//     cleanupUploadsFolder(); // Raw uploads only
//   }, 30 * 1000); // Check every 30 seconds for testing
//
//   console.log('✅ Both database and uploads folder cleanup systems are active');
// }

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(projectRoot, 'frontend')));
app.use('/admin', express.static(path.join(projectRoot, 'admin')));
app.use('/assets', express.static(path.join(backendDir, 'assets')));

// Root routes - MUST COME BEFORE API ROUTES
app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'frontend', 'index.html'));
});

app.get('/tree', (req, res) => {
  res.sendFile(path.join(projectRoot, 'frontend', 'tree.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(projectRoot, 'admin', 'admin.html'));
});

// Serve admin static files explicitly
app.use('/admin/static', express.static(path.join(projectRoot, 'admin')));
app.use('/admin/assets', express.static(path.join(backendDir, 'assets')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(backendDir, 'assets', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1e9);
    const uniqueId = `${timestamp}-${randomNum}`;

    req.fileUniqueId = uniqueId;

    cb(null, `upload-${uniqueId}.jpg`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Database setup
const dbPath = path.join(projectRoot, 'feedback.db');
console.log('📊 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Database initialization (USING email COLUMN - NOT CHANGING)
function initializeDatabase() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,  -- KEEPING AS 'email' FOR COMPATIBILITY
      visit_count INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_visit DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createFeedbackTable = `
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      rating INTEGER NOT NULL,
      feedback_text TEXT,
      pledge_text TEXT,
      photo_path TEXT,
      consent_given BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      email_sent BOOLEAN DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `;

  const createAdminUsersTable = `
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      full_name TEXT,
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    )
  `;

  // Audit log table for email decryption
  const createAuditLogTable = `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_user_id INTEGER,
      action TEXT NOT NULL,
      target_user_id INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (admin_user_id) REFERENCES admin_users (id)
    )
  `;

  db.serialize(() => {
    db.run(createUsersTable);
    db.run(createFeedbackTable);
    db.run(createAdminUsersTable);
    db.run(createAuditLogTable);
    createDefaultAdminUsers();
  });
}

function createDefaultAdminUsers() {
  const defaultUsers = [
    {
      username: 'systemadmin',
      password: 'SystemAdmin123!',
      role: 'system_admin',
      full_name: 'System Administrator',
      department: 'IT'
    },
    {
      username: 'admin',
      password: 'admin123',
      role: 'it_admin',
      full_name: 'IT Administrator',
      department: 'IT'
    },
    {
      username: 'staff',
      password: 'staff123',
      role: 'it_staff',
      full_name: 'IT Staff',
      department: 'IT'
    }
  ];

  defaultUsers.forEach((user) => {
    const passwordHash = bcrypt.hashSync(user.password, 12);

    db.run(
      `INSERT OR IGNORE INTO admin_users (username, password_hash, role, full_name, department) 
       VALUES (?, ?, ?, ?, ?)`,
      [user.username, passwordHash, user.role, user.full_name, user.department],
      function (err) {
        if (err) {
          console.error('❌ Error creating admin user:', user.username, err.message);
        } else if (this.changes > 0) {
          console.log(`✅ Created admin user: ${user.username}`);
        }
      }
    );
  });
}

// ==================== BERNISSA'S AUTO PHOTO CAPTURE SECTION ====================
// 🔧 BERNISSA: You can edit automatic capture timing and high-res processing here
// ✅ SAFE TO EDIT: Auto-capture delay, countdown timing, image quality settings
// 🚫 DO NOT MODIFY: Overlay application, file paths, database operations
//
// ==============================================================================
// ==================== IMAGE PROCESSING SERVICE ====================
// 🎯 BER NOTE: AI ENHANCEMENT INTEGRATION POINT
// 
// ✅ YOU CAN MODIFY THIS SECTION ONLY:
// - Add AI enhancement between photo capture and overlay
// - Connect to Digicam AI service in the processUserPhoto method
// - Modify the processing pipeline: CAPTURE → ENHANCE → OVERLAY
//
// ❌ DO NOT MODIFY:
// - Directory structure and file paths
// - Overlay creation and application
// - API endpoints and routing
// - Database operations and authentication
//
// 🔧 CURRENT FLOW: photo → overlay → save
// 🔧 DESIRED FLOW: photo → ENHANCE → overlay → save
//
// Image Processing Service
class ImageProcessor {
  constructor() {
    this.backendDir = backendDir;
    this.outputDir = path.join(backendDir, 'assets', 'outputs');
    this.uploadsDir = path.join(backendDir, 'assets', 'uploads');
    this.backgroundsDir = path.join(backendDir, 'assets', 'backgrounds');
    this.overlayPath = path.join(this.backgroundsDir, 'overlay.png');

    this.ensureDirectories();
    this.checkOverlayFile();
  }
// DO NOT MODIFY START
  ensureDirectories() {
    [this.outputDir, this.uploadsDir, this.backgroundsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      }
    });
  }

  checkOverlayFile() {
    if (!fs.existsSync(this.overlayPath)) {
      console.warn('⚠️ Overlay file not found:', this.overlayPath);
      console.log('📁 Creating a default overlay file...');
      this.createDefaultOverlay();
    } else {
      console.log('✅ Overlay file found:', this.overlayPath);
    }
  }

  createDefaultOverlay() {
    const overlaySvg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="overlayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(26, 95, 35,0.7);stop-opacity:0.7" />
            <stop offset="100%" style="stop-color:rgba(46, 204, 113,0.5);stop-opacity:0.5" />
          </linearGradient>
        </defs>
        
        <rect width="800" height="600" fill="url(#overlayGradient)"/>
        
        <text x="400" y="100" font-family="Arial" font-size="36" font-weight="bold" 
              text-anchor="middle" fill="white" opacity="0.9">
          Republic Polytechnic
        </text>
        
        <text x="400" y="140" font-family="Arial" font-size="24" 
              text-anchor="middle" fill="white" opacity="0.8">
          ESG Centre
        </text>
        
        <text x="400" y="550" font-family="Arial" font-size="20" font-weight="bold" 
              text-anchor="middle" fill="white" opacity="0.9">
          I visited the ESG Centre!
        </text>
        
        <text x="400" y="580" font-family="Arial" font-size="16" 
              text-anchor="middle" fill="white" opacity="0.7">
          ${new Date().toLocaleDateString()}
        </text>
      </svg>
    `;

    try {
      sharp(Buffer.from(overlaySvg))
        .png()
        .toFile(this.overlayPath)
        .then(() => console.log('✅ Created default overlay file'))
        .catch((err) => console.error('❌ Error creating overlay:', err));
    } catch (error) {
      console.error('❌ Failed to create overlay:', error);
    }
  }
// DO NOT MODIFY END

  async processUserPhoto(photoBuffer, userName = '', uniqueId = '') {
    try {
      const finalUniqueId =
        uniqueId || `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const outputFilename = `memory-${finalUniqueId}.jpg`;
      const outputPath = path.join(this.outputDir, outputFilename);

      console.log('🖼️ Processing photo for user:', userName, 'with ID:', finalUniqueId);


      // 🎯 BER: ADD AI ENHANCEMENT HERE
      // ==========================================
      // CURRENT: photoBuffer → overlay → save
      // DESIRED: photoBuffer → AI ENHANCE → overlay → save
      //
      // Example integration:
      // const enhancedBuffer = await this.enhanceWithAI(photoBuffer);
      // Then use enhancedBuffer instead of photoBuffer for overlay
      // ==========================================


      const overlayExists = fs.existsSync(this.overlayPath);

      if (!overlayExists) {
        console.warn('⚠️ Overlay file missing, using fallback processing');
        return await this.fallbackProcessing(
          photoBuffer,
          outputPath,
          outputFilename,
          finalUniqueId
        );
      }

      const originalMetadata = await sharp(photoBuffer).metadata();
      console.log(
        '📐 Original photo dimensions:',
        originalMetadata.width,
        'x',
        originalMetadata.height
      );

      // 🎯 BER: ENHANCE PHOTO BEFORE OVERLAY
      // const enhancedPhotoBuffer = await yourAIService.enhance(photoBuffer);
      // Then proceed with enhancedPhotoBuffer instead of photoBuffer

      const overlayBuffer = await sharp(this.overlayPath)
        .resize(originalMetadata.width, originalMetadata.height, {
          fit: 'cover'
        })
        .png()
        .toBuffer();

      await sharp(photoBuffer)
        .composite([
          {
            input: overlayBuffer,
            blend: 'over'
          }
        ])
        .jpeg({ quality: 95 })
        .toFile(outputPath);

      console.log('✅ Photo processed successfully with ID:', finalUniqueId);

      return {
        success: true,
        outputPath: outputPath,
        relativePath: `/assets/outputs/${outputFilename}`,
        message: 'Photo processed with RP overlay!',
        originalWidth: originalMetadata.width,
        originalHeight: originalMetadata.height
      };
    } catch (error) {
      console.error('❌ Error processing photo:', error);

      const finalUniqueId =
        uniqueId || `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const outputFilename = `memory-${finalUniqueId}.jpg`;
      const outputPath = path.join(this.outputDir, outputFilename);

      return await this.fallbackProcessing(
        photoBuffer,
        outputPath,
        outputFilename,
        finalUniqueId
      );
    }
  }

  async fallbackProcessing(photoBuffer, outputPath, outputFilename, uniqueId = '') {
    try {
      console.log('🔄 Using fallback photo processing for ID:', uniqueId);

      await sharp(photoBuffer).jpeg({ quality: 90 }).toFile(outputPath);

      const metadata = await sharp(photoBuffer).metadata();

      return {
        success: true,
        outputPath: outputPath,
        relativePath: `/assets/outputs/${outputFilename}`,
        message: 'Photo saved (fallback processing)',
        originalWidth: metadata.width,
        originalHeight: metadata.height
      };
    } catch (fallbackError) {
      console.error('❌ Fallback processing also failed:', fallbackError);
      return {
        success: false,
        error: 'Failed to process photo: ' + fallbackError.message
      };
    }
  }
}

// 🎯 BER: ADD YOUR AI ENHANCEMENT METHOD HERE
  // ==========================================
  // Example method structure:
  // async enhanceWithAI(photoBuffer) {
  //   // Connect to Digicam AI service
  //   // Process enhancement
  //   // Return enhanced photo buffer
  // }
  // ==========================================

  // ... rest of existing methods ...


const imageProcessor = new ImageProcessor();

// 🎯 TEAM NOTE: DO NOT MODIFY BELOW THIS LINE
// ==========================================
// Authentication, API routes, and database operations
// remain unchanged to maintain system stability
// ==========================================

// Admin Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());

    db.get(
      'SELECT * FROM admin_users WHERE id = ? AND username = ? AND is_active = 1',
      [tokenData.id, tokenData.username],
      (err, adminUser) => {
        if (err || !adminUser) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = adminUser;
        next();
      }
    );
  } catch (error) {
    res.status(401).json({ error: 'Invalid token format' });
  }
}

// Log email decryption action
function logEmailDecryption(adminUserId, targetUserId, req) {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';

  db.run(
    `INSERT INTO audit_logs (admin_user_id, action, target_user_id, ip_address, user_agent) 
     VALUES (?, ?, ?, ?, ?)`,
    [adminUserId, 'EMAIL_DECRYPTION', targetUserId, ipAddress, userAgent],
    function (err) {
      if (err) {
        console.error('❌ Error logging email decryption:', err);
      } else {
        console.log(
          `✅ Email decryption logged for admin ${adminUserId}, target user ${targetUserId}`
        );
      }
    }
  );
}

// ==================== ADMIN LOGIN ENDPOINT ====================

// Admin Login Endpoint
app.post('/api/admin/login', express.json(), (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required'
    });
  }

  db.get(
    'SELECT * FROM admin_users WHERE username = ? AND is_active = 1',
    [username],
    (err, adminUser) => {
      if (err) {
        console.error('❌ Database error during login:', err);
        return res.status(500).json({
          success: false,
          error: 'Database error'
        });
      }

      if (!adminUser) {
        return res.status(401).json({
          success: false,
          error: 'Invalid username or password'
        });
      }

      // Verify password
      const isValidPassword = bcrypt.compareSync(
        password,
        adminUser.password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid username or password'
        });
      }

      // Create token (simple base64 encoded user info)
      const tokenData = {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        timestamp: Date.now()
      };

      const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

      // Add audit log for login
      addAuditLog('system', `Admin user logged in: ${username}`, username, {
        role: adminUser.role,
        ip: req.ip
      });

      res.json({
        success: true,
        token: token,
        username: adminUser.username,
        role: adminUser.role,
        full_name: adminUser.full_name,
        department: adminUser.department
      });
    }
  );
});

// ==================== CLEANUP API ENDPOINTS ====================

// Manual outputs folder cleanup endpoint for testing
app.post('/api/admin/cleanup-now', authenticateToken, (req, res) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Only system administrators can trigger cleanup'
    });
  }

  console.log('🔄 Manual cleanup triggered by:', req.user.username);
  cleanupOldData();

  res.json({
    success: true,
    message: 'Cleanup process started manually'
  });
});

// Manual uploads folder cleanup endpoint
app.post('/api/admin/cleanup-uploads', authenticateToken, (req, res) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Only system administrators can trigger uploads cleanup'
    });
  }

  console.log('🔄 Manual uploads folder cleanup triggered by:', req.user.username);
  cleanupUploadsFolder();

  res.json({
    success: true,
    message: 'Uploads folder cleanup process started manually'
  });
});

// Get cleanup status
app.get('/api/admin/cleanup-status', authenticateToken, (req, res) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Only system administrators can view cleanup status'
    });
  }

  res.json({
    success: true,
    cleanupInterval: `${CLEANUP_INTERVAL_MS / 1000} seconds`,
    nextCleanup: 'Running every 30 seconds for testing',
    description:
      'Database records and processed photos are automatically deleted after the specified time. Raw uploads are also cleaned separately.',
    systems: [
      'Database cleanup: Removes emails and processed photo references',
      'Outputs folder: Deletes processed photos with RP overlay',
      'Uploads folder: Deletes raw uploaded photos (internal storage only)'
    ]
  });
});

// ==================== AUDIT LOGS API ENDPOINTS ====================

// Get audit logs
app.get('/api/admin/audit-logs', authenticateToken, (req, res) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only System Administrators can view audit logs.'
    });
  }

  try {
    res.json(auditLogs);
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit logs'
    });
  }
});

// Get detailed logs
app.get('/api/admin/detailed-logs', authenticateToken, (req, res) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only System Administrators can view detailed logs.'
    });
  }

  try {
    const { type, date } = req.query;
    let filteredLogs = auditLogs;

    // Filter by type if specified
    if (type && type !== 'all') {
      filteredLogs = filteredLogs.filter((log) => log.type === type);
    }

    // Filter by date if specified
    if (date) {
      filteredLogs = filteredLogs.filter((log) => {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return logDate === date;
      });
    }

    res.json(filteredLogs);
  } catch (error) {
    console.error('Error getting detailed logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve detailed logs'
    });
  }
});

// Get system info
app.get('/api/admin/system-info', authenticateToken, (req, res) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only System Administrators can view system info.'
    });
  }

  try {
    // Get real data from database
    db.get(
      "SELECT COUNT(*) as photoCount FROM feedback WHERE photo_path IS NOT NULL AND photo_path != ''",
      (err, photoRow) => {
        if (err) {
          console.error('Error getting photo count:', err);
          photoRow = { photoCount: 0 };
        }

        db.get('SELECT COUNT(*) as feedbackCount FROM feedback', (err, feedbackRow) => {
          if (err) {
            console.error('Error getting feedback count:', err);
            feedbackRow = { feedbackCount: 0 };
          }

          const systemInfo = {
            uptime: Math.floor(process.uptime()) + ' seconds',
            memoryUsage:
              Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            totalPhotos: photoRow.photoCount || 0,
            totalFeedback: feedbackRow.feedbackCount || 0,
            lastBackup: 'Never',
            activeSessions: 1
          };

          res.json(systemInfo);
        });
      }
    );
  } catch (error) {
    console.error('Error getting system info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system information'
    });
  }
});

// Clear audit logs
app.post('/api/admin/clear-logs', authenticateToken, (req, res) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only System Administrators can clear logs.'
    });
  }

  try {
    const logsCleared = auditLogs.length;
    auditLogs = [];

    // Add a log entry about the clearing
    addAuditLog(
      'system',
      `Audit logs cleared by ${req.user.username}`,
      req.user.username,
      {
        logsCleared: logsCleared
      }
    );

    res.json({
      success: true,
      message: `Cleared ${logsCleared} log entries`
    });
  } catch (error) {
    console.error('Error clearing audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear audit logs'
    });
  }
});

// Admin Stats
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  const queries = {
    totalVisitors: 'SELECT COUNT(DISTINCT id) as count FROM users',
    todayVisitors: `SELECT COUNT(DISTINCT id) as count FROM users WHERE date(last_visit) = date('now')`,
    totalFeedback: 'SELECT COUNT(*) as count FROM feedback',
    avgRating: 'SELECT AVG(rating) as avg FROM feedback WHERE rating > 0',
    photoConsent: 'SELECT COUNT(*) as count FROM feedback WHERE consent_given = 1 AND photo_path IS NOT NULL'
  };

  const results = {};
  let queriesCompleted = 0;

  Object.keys(queries).forEach((key) => {
    db.get(queries[key], [], (err, row) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        results[key] = 0;
      } else {
        results[key] = row.count || row.avg || 0;
      }

      queriesCompleted++;

      if (queriesCompleted === Object.keys(queries).length) {
        db.get('SELECT COUNT(*) as total FROM feedback', [], (err, totalRow) => {
          if (!err && totalRow.total > 0) {
            results.photoConsentRate = Math.round(
              (results.photoConsent / totalRow.total) * 100
            );
          } else {
            results.photoConsentRate = 0;
          }

          res.json(results);
        });
      }
    });
  });
});

// Get feedback data for admin (UPDATED to use 'email' column)
app.get('/api/admin/feedback-data', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      u.id as user_id,
      u.name,
      u.email,  -- USING 'email' COLUMN
      u.visit_count,
      u.last_visit,
      f.id as feedback_id,
      f.rating,
      f.feedback_text,
      f.pledge_text,
      f.photo_path,
      f.consent_given,
      f.created_at as feedback_date
    FROM users u
    JOIN feedback f ON u.id = f.user_id
    ORDER BY f.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching feedback data:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const processedRows = rows.map((row) => {
      let maskedEmail = 'N/A';
      if (row.email) {
        try {
          const decryptedEmail = decryptEmail(row.email);
          if (decryptedEmail) {
            maskedEmail = maskEmail(decryptedEmail);
          }
        } catch (error) {
          console.error('❌ Error processing email for user:', row.user_id, error);
        }
      }

      return {
        ...row,
        email_masked: maskedEmail,
        email: undefined // Don't send encrypted email to frontend
      };
    });

    res.json(processedRows);
  });
});

// Update feedback record (email is read-only)
app.put(
  '/api/admin/update-feedback/:id',
  authenticateToken,
  express.json(),
  (req, res) => {
    const recordId = req.params.id;
    const { name, rating, feedback, pledge } = req.body; // Remove email from destructuring

    if (req.user.role !== 'system_admin' && req.user.role !== 'it_admin') {
      return res.status(403).json({
        success: false,
        error:
          'Insufficient permissions. Only system administrators and IT administrators can edit records.'
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    db.get(
      'SELECT user_id FROM feedback WHERE id = ?',
      [recordId],
      (err, feedbackRow) => {
        if (err) {
          console.error('❌ Error finding feedback record:', err);
          return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (!feedbackRow) {
          return res.status(404).json({ success: false, error: 'Record not found' });
        }

        const userId = feedbackRow.user_id;

        // Update user table - ONLY update name, keep existing email
        db.run(
          'UPDATE users SET name = ? WHERE id = ?', // Only update name, not email
          [name.trim(), userId],
          function (err) {
            if (err) {
              console.error('❌ Error updating user:', err);
              return res.status(500).json({ success: false, error: 'Database error' });
            }

            db.run(
              `UPDATE feedback SET rating = ?, feedback_text = ?, pledge_text = ? 
               WHERE id = ?`,
              [rating, feedback || '', pledge || '', recordId],
              function (err) {
                if (err) {
                  console.error('❌ Error updating feedback:', err);
                  return res.status(500).json({ success: false, error: 'Database error' });
                }

                // Add audit log for feedback update
                addAuditLog(
                  'feedback',
                  `Feedback record updated by ${req.user.username}`,
                  req.user.username,
                  {
                    feedbackId: recordId,
                    userId: userId,
                    changes: { name, rating, feedback, pledge }
                  }
                );

                res.json({
                  success: true,
                  message: 'Record updated successfully'
                });
              }
            );
          }
        );
      }
    );
  }
);

// Delete feedback record
app.delete('/api/admin/delete-feedback/:id', authenticateToken, (req, res) => {
  const recordId = req.params.id;

  if (req.user.role !== 'system_admin' && req.user.role !== 'it_admin') {
    return res.status(403).json({
      success: false,
      error:
        'Insufficient permissions. Only system administrators and IT administrators can delete records.'
    });
  }

  db.get(
    'SELECT user_id FROM feedback WHERE id = ?',
    [recordId],
    (err, feedbackRow) => {
      if (err) {
        console.error('❌ Error finding feedback record:', err);
        return res.status(500).json({ success: false, error: 'Database error' });
      }

      if (!feedbackRow) {
        return res.status(404).json({ success: false, error: 'Record not found' });
      }

      const userId = feedbackRow.user_id;

      db.get(
        'SELECT COUNT(*) as count FROM feedback WHERE user_id = ?',
        [userId],
        (err, countRow) => {
          if (err) {
            console.error('❌ Error counting user feedback:', err);
            return res.status(500).json({ success: false, error: 'Database error' });
          }

          db.run('DELETE FROM feedback WHERE id = ?', [recordId], function (err) {
            if (err) {
              console.error('❌ Error deleting feedback:', err);
              return res.status(500).json({ success: false, error: 'Database error' });
            }

            // Add audit log for feedback deletion
            addAuditLog(
              'feedback',
              `Feedback record deleted by ${req.user.username}`,
              req.user.username,
              {
                feedbackId: recordId,
                userId: userId
              }
            );

            if (countRow.count === 1) {
              db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
                if (err) {
                  console.error('❌ Error deleting user:', err);
                }

                res.json({
                  success: true,
                  message: 'Record and user deleted successfully'
                });
              });
            } else {
              res.json({
                success: true,
                message: 'Record deleted successfully'
              });
            }
          });
        }
      );
    }
  );
});

// Get all admin users (system_admin only)
app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Only system administrators can access user management'
    });
  }

  db.all('SELECT * FROM admin_users ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching admin users:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create new admin user (system_admin only)
app.post('/api/admin/users', authenticateToken, express.json(), (req, res) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Only system administrators can create users'
    });
  }

  const { username, password, full_name, role, department, is_active } = req.body;

  if (!username || !password || !full_name || !role) {
    return res
      .status(400)
      .json({ success: false, error: 'Username, password, full name, and role are required' });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ success: false, error: 'Password must be at least 6 characters' });
  }

  const passwordHash = bcrypt.hashSync(password, 12);

  db.run(
    `INSERT INTO admin_users (username, password_hash, full_name, role, department, is_active) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, passwordHash, full_name, role, department || 'IT', is_active !== false],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ success: false, error: 'Username already exists' });
        }
        console.error('❌ Error creating admin user:', err);
        return res.status(500).json({ success: false, error: 'Database error' });
      }

      // Add audit log for user creation
      addAuditLog('system', `Admin user created by ${req.user.username}`, req.user.username, {
        newUser: username,
        role: role,
        createdBy: req.user.username
      });

      res.json({
        success: true,
        message: 'User created successfully',
        userId: this.lastID
      });
    }
  );
});

// Update admin user (system_admin only)
app.put('/api/admin/users/:id', authenticateToken, express.json(), (req, res) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Only system administrators can update users'
    });
  }

  const userId = req.params.id;
  const { username, password, full_name, role, department, is_active } = req.body;

  if (!username || !full_name || !role) {
    return res
      .status(400)
      .json({ success: false, error: 'Username, full name, and role are required' });
  }

  if (parseInt(userId) === req.user.id && (role !== req.user.role || is_active === false)) {
    return res.status(400).json({
      success: false,
      error: 'Cannot modify your own role or deactivate your own account'
    });
  }

  let query, params;
  if (password) {
    const passwordHash = bcrypt.hashSync(password, 12);
    query = `UPDATE admin_users SET username = ?, password_hash = ?, full_name = ?, role = ?, department = ?, is_active = ? WHERE id = ?`;
    params = [
      username,
      passwordHash,
      full_name,
      role,
      department || 'IT',
      is_active !== false,
      userId
    ];
  } else {
    query = `UPDATE admin_users SET username = ?, full_name = ?, role = ?, department = ?, is_active = ? WHERE id = ?`;
    params = [username, full_name, role, department || 'IT', is_active !== false, userId];
  }

  db.run(query, params, function (err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ success: false, error: 'Username already exists' });
      }
      console.error('❌ Error updating admin user:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Add audit log for user update
    addAuditLog('system', `Admin user updated by ${req.user.username}`, req.user.username, {
      updatedUser: username,
      role: role,
      updatedBy: req.user.username
    });

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  });
});

// Delete admin user (system_admin only)
app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Only system administrators can delete users'
    });
  }

  const userId = req.params.id;

  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete your own account'
    });
  }

  db.get('SELECT username FROM admin_users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('❌ Error finding user:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    db.run('DELETE FROM admin_users WHERE id = ?', [userId], function (err) {
      if (err) {
        console.error('❌ Error deleting admin user:', err);
        return res.status(500).json({ success: false, error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Add audit log for user deletion
      addAuditLog('system', `Admin user deleted by ${req.user.username}`, req.user.username, {
        deletedUser: user.username,
        deletedBy: req.user.username
      });

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    });
  });
});

// Email decryption endpoint
app.post('/api/admin/decrypt-email/:userId', authenticateToken, express.json(), (req, res) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: 'Only system administrators can decrypt emails'
    });
  }

  const { password } = req.body;
  const targetUserId = req.params.userId;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: 'Password is required'
    });
  }

  // Verify admin password
  const isValidPassword = bcrypt.compareSync(password, req.user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid password'
    });
  }

  // Get user's encrypted email
  db.get('SELECT email FROM users WHERE id = ?', [targetUserId], (err, user) => {
    if (err) {
      console.error('❌ Error fetching user email:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }

    if (!user || !user.email) {
      return res.status(404).json({
        success: false,
        error: 'User or email not found'
      });
    }

    // Decrypt the email
    const decryptedEmail = decryptEmail(user.email);
    if (!decryptedEmail) {
      return res.status(500).json({
        success: false,
        error: 'Failed to decrypt email'
      });
    }

    // Log the decryption action
    logEmailDecryption(req.user.id, targetUserId, req);

    // Add audit log for email decryption
    addAuditLog(
      'email',
      `Email decrypted by ${req.user.username} for user ${targetUserId}`,
      req.user.username,
      {
        targetUserId: targetUserId,
        adminUserId: req.user.id
      }
    );

    res.json({
      success: true,
      email: decryptedEmail
    });
  });
});

// Photo upload endpoint
app.post('/api/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No photo file received'
      });
    }

    console.log('📸 Processing photo upload for user:', req.body.userName || 'unknown');

    const photoBuffer = fs.readFileSync(req.file.path);
    const result = await imageProcessor.processUserPhoto(
      photoBuffer,
      req.body.userName,
      req.fileUniqueId
    );

    if (result.success) {
      console.log('✅ Photo processed successfully with ID:', req.fileUniqueId);

      // ✅ ADDED: Audit log entry for successful photo upload
      addAuditLog(
        'photo',
        `Photo uploaded for user: ${req.body.userName || 'unknown'}`,
        req.body.userName || 'unknown',
        {
          photoId: req.fileUniqueId,
          dimensions: result.dimensions || 'unknown',
          fileName: req.file.filename,
          compositePath: result.relativePath
        }
      );

      res.json({
        success: true,
        message: result.message || 'Photo processed with RP overlay!',
        compositeImage: result.relativePath,
        uploadedFile: `/assets/uploads/${req.file.filename}`,
        uniqueId: req.fileUniqueId
      });
    } else {
      // ✅ ADDED: Audit log entry for failed photo processing
      addAuditLog(
        'error',
        `Photo processing failed for user: ${req.body.userName || 'unknown'}`,
        req.body.userName || 'unknown',
        {
          photoId: req.fileUniqueId,
          error: result.error,
          fileName: req.file.filename
        }
      );

      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error processing photo:', error);

    // ✅ ADDED: Audit log entry for photo upload error
    addAuditLog(
      'error',
      `Photo upload failed for user: ${req.body.userName || 'unknown'}`,
      req.body.userName || 'unknown',
      {
        error: error.message,
        fileName: req.file ? req.file.filename : 'unknown'
      }
    );

    res.status(500).json({
      success: false,
      error: 'Failed to process photo: ' + error.message
    });
  }
});

// Submit feedback (UPDATED to encrypt email before saving)
app.post('/api/feedback', express.json(), async (req, res) => {
  const { name, email, rating, feedback, pledge, consent, photoUrl } = req.body;

  console.log('📝 Received feedback submission:', {
    name,
    email: email ? `${email.substring(0, 3)}...` : 'none',
    rating
  });

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Name is required'
    });
  }

  const nameRegex = /^[a-zA-Z0-9\s\-'.]{1,50}$/;
  if (!nameRegex.test(name.trim())) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid name'
    });
  }

  try {
    const timestamp = new Date().toISOString();

    // Encrypt email before storing
    const encryptedEmail = email ? encryptEmail(email.trim()) : null;
    console.log('🔐 Email encrypted:', encryptedEmail ? 'Yes' : 'No');

    db.get(
      'SELECT id, visit_count FROM users WHERE name = ?',
      [name.trim()],
      (err, existingUser) => {
        if (err) {
          console.error('❌ Database error checking user:', err);
          return res.status(500).json({
            success: false,
            error: 'Database error: ' + err.message
          });
        }

        const processUser = (userId) => {
          let storedPhotoPath = null;
          if (photoUrl) {
            const photoFilename = photoUrl.split('/').pop();
            storedPhotoPath = `/assets/outputs/${photoFilename}`;
          }

          db.run(
            `INSERT INTO feedback (user_id, rating, feedback_text, pledge_text, photo_path, consent_given, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              parseInt(rating) || 0,
              feedback || '',
              pledge || '',
              storedPhotoPath,
              consent === 'true' ? 1 : 0,
              timestamp
            ],
            function (err) {
              if (err) {
                console.error('❌ Error inserting feedback:', err);
                return res.status(500).json({
                  success: false,
                  error: 'Database error: ' + err.message
                });
              }

              const feedbackId = this.lastID;
              console.log('✅ Feedback inserted successfully for user:', name);

              // ✅ ADDED: Audit log entry for feedback submission
              addAuditLog('feedback', `Feedback submitted by ${name}`, name, {
                rating: parseInt(rating) || 0,
                hasPhoto: !!storedPhotoPath,
                emailProvided: !!email,
                feedbackId: feedbackId,
                userId: userId
              });

              if (email && storedPhotoPath) {
                setTimeout(() => {
                  sendEmailWithPhoto(email, name, storedPhotoPath);
                }, 1000);
              }

              res.json({
                success: true,
                message:
                  'Feedback submitted successfully' +
                  (email ? ' - Photo will be sent to your email!' : ''),
                visitCount: existingUser ? existingUser.visit_count + 1 : 1
              });
            }
          );
        };

        if (existingUser) {
          const newVisitCount = existingUser.visit_count + 1;
          const userId = existingUser.id;

          db.run(
            'UPDATE users SET visit_count = ?, last_visit = ?, email = ? WHERE id = ?', // USING 'email' COLUMN
            [newVisitCount, timestamp, encryptedEmail, userId],
            function (err) {
              if (err) {
                console.error('❌ Error updating user:', err);
                return res.status(500).json({
                  success: false,
                  error: 'Database error: ' + err.message
                });
              }

              processUser(userId);
            }
          );
        } else {
          db.run(
            `INSERT INTO users (name, email, visit_count, created_at, last_visit)  -- USING 'email' COLUMN
             VALUES (?, ?, 1, ?, ?)`,
            [name.trim(), encryptedEmail, timestamp, timestamp],
            function (err) {
              if (err) {
                console.error('❌ Error inserting user:', err);
                return res.status(500).json({
                  success: false,
                  error: 'Database error: ' + err.message
                });
              }

              const userId = this.lastID;
              processUser(userId);
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);

    // ✅ ADDED: Audit log entry for failed feedback submission
    addAuditLog('error', `Feedback submission failed for ${name}`, name, {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
});

// ==================== ZAH'S DIGITAL TREE INTEGRATION SECTION ====================
// 🔧 ZAHEERA: You can edit tree data processing and API responses here
// 
// ✅ SAFE TO EDIT IN THIS SECTION:
// - Tree data formatting and structure
// - Visitor statistics calculations
// - Response data organization for frontend
// - Additional tree-related metrics
//
// 🚫 DO NOT MODIFY:
// - Database connection and SQL queries
// - Authentication and admin endpoints
// - File upload and photo processing
// - Email system and encryption
//
// 💡 YOUR FOCUS AREAS:
// - Enhance tree data structure for better visualization
// - Add new visitor statistics and metrics
// - Optimize data formatting for frontend tree
// - Implement seasonal data calculations
//
// =========================================================================

// Get tree data do not edit
app.get('/api/tree', (req, res) => {
  db.all(
    `
      SELECT name, visit_count, last_visit 
      FROM users 
      ORDER BY last_visit DESC
      LIMIT 500
    `,
    [],
    (err, rows) => {
      if (err) {
        console.error('❌ Error getting tree data:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // ✅ ZAHEERA: SAFE TO MODIFY - Data formatting for tree
      // You can enhance the data structure here:
      // - Add calculated fields
      // - Format dates differently
      // - Include additional statistics
      // - Group data by time periods

      res.json(rows);
    }
  );
});

// QR Code generation //
app.get('/api/qrcode', async (req, res) => {
  try {
    const qrCodeData = await QRCode.toDataURL(`http://localhost:${PORT}`);
    res.json({ qrCode: qrCodeData, serverIp: 'localhost' });
  } catch (error) {
    console.error('❌ QR code generation failed:', error);
    res.status(500).json({ error: 'QR code generation failed' });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  db.get('SELECT COUNT(*) as userCount FROM users', (err, userResult) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    db.get('SELECT COUNT(*) as feedbackCount FROM feedback', (err, feedbackResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        usersCount: userResult.userCount,
        feedbackCount: feedbackResult.feedbackCount,
        database: dbPath
      });
    });
  });
});

// Debug database
app.get('/api/debug/db', (req, res) => {
  db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, tables) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    const tableInfo = {};
    let tablesProcessed = 0;

    if (tables.length === 0) {
      return res.json({ message: 'No tables found' });
    }

    tables.forEach((table) => {
      db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
        tableInfo[table.name] = columns;
        tablesProcessed++;

        if (tablesProcessed === tables.length) {
          res.json({
            database: dbPath,
            tables: tableInfo,
            tableCount: tables.length
          });
        }
      });
    });
  });
});

// Temporary photo processing endpoint
app.post('/api/process-photo-temporary', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No photo file received'
      });
    }

    console.log(
      '🔄 Processing photo temporarily for user:',
      req.body.userName || 'unknown'
    );

    const photoBuffer = fs.readFileSync(req.file.path);
    const result = await processPhotoTemporary(photoBuffer);

    fs.unlinkSync(req.file.path);

    if (result.success) {
      res.json({
        success: true,
        temporaryUrl: result.dataUrl,
        message: 'Photo processed temporarily with RP overlay!'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error processing temporary photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process photo: ' + error.message
    });
  }
});

// Temporary photo processing
async function processPhotoTemporary(photoBuffer) {
  try {
    console.log('🖼️ Processing photo temporarily with overlay...');

    const originalMetadata = await sharp(photoBuffer).metadata();
    console.log(
      '📐 Original photo dimensions:',
      originalMetadata.width,
      'x',
      originalMetadata.height
    );

    const overlayExists = fs.existsSync(imageProcessor.overlayPath);

    if (!overlayExists) {
      console.warn('⚠️ Overlay file missing, using fallback processing');
      return await fallbackTemporaryProcessing(photoBuffer);
    }

    const overlayBuffer = await sharp(imageProcessor.overlayPath)
      .resize(originalMetadata.width, originalMetadata.height, {
        fit: 'cover'
      })
      .png()
      .toBuffer();

    const processedBuffer = await sharp(photoBuffer)
      .composite([
        {
          input: overlayBuffer,
          blend: 'over'
        }
      ])
      .jpeg({ quality: 95 })
      .toBuffer();

    const dataUrl = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

    console.log('✅ Photo processed temporarily with overlay');

    return {
      success: true,
      dataUrl: dataUrl,
      message: 'Photo processed with RP overlay (temporary)!',
      originalWidth: originalMetadata.width,
      originalHeight: originalMetadata.height
    };
  } catch (error) {
    console.error('❌ Error processing temporary photo:', error);

    return await fallbackTemporaryProcessing(photoBuffer);
  }
}

// Fallback temporary processing
async function fallbackTemporaryProcessing(photoBuffer) {
  try {
    console.log('🔄 Using fallback temporary photo processing...');

    const processedBuffer = await sharp(photoBuffer).jpeg({ quality: 90 }).toBuffer();

    const metadata = await sharp(photoBuffer).metadata();

    const dataUrl = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

    return {
      success: true,
      dataUrl: dataUrl,
      message: 'Photo processed (fallback - temporary)',
      originalWidth: metadata.width,
      originalHeight: metadata.height
    };
  } catch (fallbackError) {
    console.error('❌ Fallback temporary processing also failed:', fallbackError);
    return {
      success: false,
      error: 'Failed to process photo: ' + fallbackError.message
    };
  }
}

// Cleanup endpoint for abandoned photos
app.delete('/api/cleanup-photos', (req, res) => {
  console.log('🔄 Photo cleanup triggered');
  res.json({ success: true, message: 'Cleanup completed' });
});

// ==================== NADH'S EMAIL FUNCTION ====================
// 🔧 NADH: You can edit email content and templates here
// ✅ SAFE TO EDIT: Email subject, message content, styling
// 🚫 DO NOT MODIFY: Email sending logic, file attachments
// ==============================================================

// ==================== EMAIL AUTOMATION SYSTEM ====================
// 🎯 NADH NOTE: EMAIL SERVICE INTEGRATION POINT
// 
// ⚠️ IMPORTANT: Emails are ENCRYPTED in database
// You MUST decrypt before sending emails!
//
// ✅ YOU CAN MODIFY THIS SECTION ONLY:
// - Replace mock email function with real email service
// - Add email templates, SMTP configuration, or third-party API
// - Handle email decryption before sending
//
// ❌ DO NOT MODIFY:
// - Encryption/decryption functions (encryptEmail, decryptEmail)
// - Database structure and email storage format
// - Email triggering logic and timing
//
// 🔧 CURRENT: Mock email simulation (console logs only)
// 🔧 DESIRED: Real email delivery with decrypted addresses
//
// 🚨 CRITICAL NOTE: 
// - Emails are stored ENCRYPTED in the database
// - You MUST decrypt emails before sending using decryptEmail() function
// - The email parameter passed to this function is ENCRYPTED
// - Do not modify the encryption system - it's for security compliance
//

// Email function
async function sendEmailWithPhoto(email, name, photoPath) {

// 🚨 IMPORTANT (NADH): 'email' parameter is ENCRYPTED - you must decrypt it first!
  // Use: const decryptedEmail = decryptEmail(email);
  // Then send to decryptedEmail instead of the encrypted 'email' parameter

  console.log(`📧 MOCK EMAIL: Would send to: ${email}`);
  console.log(`👋 Subject: Thank you ${name} for visiting RP ESG Centre!`);
  console.log(`🖼️ Photo: ${photoPath}`);
  console.log('✅ Email would be sent within 1 minute');

  const photoFilename = path.basename(photoPath);

// 🎯 NADH: KEEP THIS DATABASE UPDATE - IT MARKS EMAIL AS SENT
  // But implement real email success/failure handling

  db.run(
    `UPDATE feedback SET email_sent = 1 
     WHERE photo_path LIKE ?`,
    [`%${photoFilename}%`],
    (err) => {
      if (err) {
        console.error('❌ Error updating email_sent flag:', err);
      } else {
        console.log('✅ Email sent flag updated for photo:', photoFilename);
      }
    }
  );

// 🎯 NADH: IMPLEMENT REAL EMAIL SERVICE HERE
  // ==========================================
  // STEPS REQUIRED:
  // 1. Decrypt the email: const decryptedEmail = decryptEmail(email);
  // 2. Implement real email service (SMTP, SendGrid, etc.)
  // 3. Send email to decryptedEmail address
  // 4. Handle success/failure cases
  // 5. Keep database update logic for email_sent flag
  // ==========================================

  return true;
}

// 🎯 NADH NOTE: DO NOT MODIFY THE ENCRYPTION SYSTEM
// ==========================================
// Encryption/decryption functions are critical for security
// Emails are intentionally stored encrypted
// Your email service must handle decryption before sending
// ==========================================

// SIMPLE TEMPORARY: Force delete record ID 22
app.delete('/api/admin/force-delete-22', (req, res) => {
  const recordId = 22;

  console.log(`🔄 FORCE deleting record ID: ${recordId}`);

  // Just delete the feedback record, don't worry about the user
  db.run('DELETE FROM feedback WHERE id = ?', [recordId], function (err) {
    if (err) {
      console.error('❌ Error deleting feedback:', err);
      return res
        .status(500)
        .json({ success: false, error: 'Database error: ' + err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    console.log(`✅ Successfully force deleted feedback record ID: ${recordId}`);
    res.json({
      success: true,
      message: `Record ${recordId} force deleted successfully`,
      changes: this.changes
    });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎉 RP ESG Kiosk Server running on http://localhost:${PORT}`);
  console.log(`📊 Backend directory: ${backendDir}`);
  console.log(`📊 Project root: ${projectRoot}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`📸 Assets location: ${path.join(backendDir, 'assets')}`);
  console.log(
    `🖼️ Overlay path: ${path.join(backendDir, 'assets', 'backgrounds', 'overlay.png')}`
  );
  console.log(`🔐 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`🌳 Digital tree: http://localhost:${PORT}/tree`);
  console.log(`\n🔍 Debug endpoints:`);
  console.log(`   http://localhost:${PORT}/api/debug/db - Database info`);
  console.log(`   http://localhost:${PORT}/api/test - API test`);
  console.log(`\n🗑️  Cleanup System: ${CLEANUP_INTERVAL_MS / 1000} seconds`);
  console.log(
    `   http://localhost:${PORT}/api/admin/cleanup-status - Cleanup status`
  );
  console.log(`   http://localhost:${PORT}/api/admin/cleanup-now - Manual cleanup`);
  console.log(`\n🔐 Admin Login Credentials:`);
  console.log(`   System Admin: systemadmin / SystemAdmin123!`);
  console.log(`   IT Admin: admin / admin123`);
  console.log(`   IT Staff: staff / staff123`);

  // Start the cleanup system
  startCleanupInterval();
});

module.exports = app;

