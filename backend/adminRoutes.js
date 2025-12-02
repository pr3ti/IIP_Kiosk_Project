// ============================================================
// ADMINROUTES.JS - TABLE OF CONTENTS
// ============================================================
// 
// AUDIT LOGGING FUNCTIONS
//   - logAudit()                    - Log admin actions to database
//
// FILE UPLOAD CONFIGURATION
//   - multer storage configuration  - Configure file upload paths
//   - upload middleware             - Handle PNG file uploads
//
// AUTHENTICATION ROUTES
//   - POST /login                   - Admin login with audit logging
//   - POST /logout-audit            - Log admin logout
//
// DASHBOARD ROUTES
//   - GET /dashboard                - Get dashboard statistics
//   - GET /test-db                  - Test database connection
//
// FEEDBACK MANAGEMENT ROUTES
//   - GET /feedback                 - Get all feedback with answers
//   - PUT /feedback/:id             - Update feedback entry
//   - DELETE /feedback/:id          - Delete feedback with cascade
//
// PHOTO ACCESS & EMAIL DECRYPTION ROUTES
//   - POST /verify-photo-access     - Verify password for photo access
//   - POST /decrypt-email           - Decrypt email (System Admin only)
//
// ADMIN USER MANAGEMENT ROUTES
//   - GET /users                    - Get all admin users
//   - DELETE /users/:id             - Delete admin user (soft delete)
//   - POST /users                   - Add new admin user
//   - PUT /users/:id                - Update admin user details
//
// EXPORT/IMPORT ROUTES
//   - GET /download-excel           - Download feedback as Excel/CSV
//   - GET /download-photos          - Download photos as ZIP
//
// OVERLAY MANAGEMENT ROUTES
//   - GET /overlays                 - Get all overlay themes
//   - POST /overlays                - Add new overlay (System Admin only)
//   - DELETE /overlays/:id          - Delete overlay and files
//
// QUESTION MANAGEMENT ROUTES
//   - GET /questions                - Get all active questions with options
//   - POST /questions               - Add new question
//   - DELETE /questions/:id         - Delete question (soft/hard based on answers)
//   - PUT /questions/:id            - Update question safely
//
// AUDIT LOGS ROUTES
//   - GET /audit-logs               - Get audit log entries
//
// HELPER FUNCTIONS
//   - deleteUserPhotos()            - Delete user photo files from filesystem
//   - deleteOverlayFiles()          - Delete overlay image files
//   - insertQuestionOptions()       - Insert multiple choice options
//   - checkDirectoryForPhotos()     - Check if directory contains photos
//   - createUploadsZip()            - Create ZIP archive of uploads directory
//   - getDirectorySize()            - Calculate directory size
//   - convertToCSV()                - Convert data to CSV format
//
// ============================================================


const express = require('express');
const router = express.Router();
const auth = require('./auth');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==================== AUDIT LOGGING ====================

// Add this function at the top of adminRoutes.js, after other requires
function logAudit(action, adminUsername, targetType = null, targetId = null, req = null) {
    // Only log important actions - customize this list as needed
    const importantActions = [
        'LOGIN', 'LOGOUT', 
        'DELETE_FEEDBACK', 'DELETE_USER', 'DELETE_OVERLAY', 'DELETE_QUESTION',
        'ADD_USER', 'EDIT_USER',
        'ADD_OVERLAY', 
        'DOWNLOAD_EXCEL', 'DOWNLOAD_PHOTOS',
        'VIEW_ENCRYPTED_EMAIL'
    ];
    
    if (!importantActions.includes(action)) {
        return; // Skip unimportant actions
    }
    
    const ip = req ? req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress : 'unknown';
    const userAgent = req ? req.headers['user-agent'] : 'unknown';
    
    const query = `
        INSERT INTO audit_logs (action, admin_username, target_type, target_id, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    // Fire and forget - don't await
    db.run(query, [action, adminUsername, targetType, targetId, ip, userAgent], (err) => {
        if (err) console.error('Audit log failed:', err);
    });
}

// ==================== FILE UPLOAD CONFIGURATION ====================

// Configure multer for file uploads - CORRECTED PATHS
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let destFolder;
        if (file.fieldname === 'desktop_file') {
            destFolder = path.join(__dirname, '../assets/overlays/DesktopOverlay');
        } else if (file.fieldname === 'mobile_file') {
            destFolder = path.join(__dirname, '../assets/overlays/MobileOverlay');
        } else {
            return cb(new Error('Invalid file type'));
        }
        
        console.log('Saving file to:', destFolder); // Debug log
        
        // Ensure directory exists
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
            console.log('Created directory:', destFolder);
        }
        cb(null, destFolder);
    },
    filename: (req, file, cb) => {
        const themeId = req.body.theme_id;
        let filename;
        
        if (file.fieldname === 'desktop_file') {
            filename = `${themeId}ThemeDesktop.png`;
        } else if (file.fieldname === 'mobile_file') {
            filename = `${themeId}ThemeMobile.png`;
        } else {
            return cb(new Error('Invalid file type'));
        }
        
        console.log('Saving file as:', filename); // Debug log
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only PNG files are allowed'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// ==================== AUTHENTICATION ROUTES ====================

// In /login endpoint, replace or modify:
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    auth.loginUser(username, password, (err, user) => {
        if (err) {
            logAudit('LOGIN_FAILED', username, null, null, req);
            return res.status(401).json({ error: err.message });
        }
        
        logAudit('LOGIN', username, null, null, req);
        res.json({ 
            success: true, 
            user: user,
            message: 'Login successful'
        });
    });
});

// Add this endpoint for logout logging
router.post('/logout-audit', (req, res) => {
    const { username } = req.body;
    if (username) {
        logAudit('LOGOUT', username, null, null, req);
    }
    res.json({ success: true });
});

// ==================== DASHBOARD ROUTES ====================

// Dashboard data endpoint - SIMPLIFIED and FIXED
router.get('/dashboard', (req, res) => {
    console.log('📊 Fetching dashboard data...');
    
    // Get total visitors count
    const totalVisitorsQuery = 'SELECT COUNT(*) as count FROM users';
    
    // Get today's visitors count
    const today = new Date().toISOString().split('T')[0];
    const todaysVisitorsQuery = 'SELECT COUNT(*) as count FROM users WHERE date(last_visit) = ?';
    
    // Get total feedback submissions
    const feedbackSubmissionsQuery = 'SELECT COUNT(*) as count FROM feedback WHERE is_active = 1';
    
    // Get users with email
    const usersWithEmailQuery = 'SELECT COUNT(*) as count FROM users WHERE email IS NOT NULL AND email != ""';
    
    // Get recent submissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSubmissionsQuery = 'SELECT COUNT(*) as count FROM feedback WHERE created_at > datetime(?) AND is_active = 1';

    // Execute all queries
    db.get(totalVisitorsQuery, [], (err, totalVisitors) => {
        if (err) {
            console.error('❌ Error fetching total visitors:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        db.get(todaysVisitorsQuery, [today], (err, todaysVisitors) => {
            if (err) {
                console.error('❌ Error fetching today\'s visitors:', err);
                todaysVisitors = { count: 0 };
            }
            
            db.get(feedbackSubmissionsQuery, [], (err, feedbackSubmissions) => {
                if (err) {
                    console.error('❌ Error fetching feedback submissions:', err);
                    feedbackSubmissions = { count: 0 };
                }
                
                db.get(usersWithEmailQuery, [], (err, usersWithEmail) => {
                    if (err) {
                        console.error('❌ Error fetching users with email:', err);
                        usersWithEmail = { count: 0 };
                    }
                    
                    db.get(recentSubmissionsQuery, [sevenDaysAgo.toISOString()], (err, recentSubmissions) => {
                        if (err) {
                            console.error('❌ Error fetching recent submissions:', err);
                            recentSubmissions = { count: 0 };
                        }
                        
                        // Compile stats (removed averageRating)
                        const stats = {
                            totalVisitors: totalVisitors?.count || 0,
                            todaysVisitors: todaysVisitors?.count || 0,
                            feedbackSubmissions: feedbackSubmissions?.count || 0,
                            usersWithEmail: usersWithEmail?.count || 0,
                            recentSubmissions: recentSubmissions?.count || 0
                        };
                        
                        console.log('📊 Dashboard stats:', stats);
                        
                        const recentActivity = {
                            systemStatus: [
                                { label: 'Kiosk Status', value: 'ONLINE', badgeType: 'online' },
                                { label: 'Database', value: 'CONNECTED', badgeType: 'connected' },
                            ],
                            dataManagement: [
                                { label: 'Recent Submissions', value: stats.recentSubmissions + ' REQ', badgeType: 'warning' },
                                { label: 'Cleanup Status', value: 'ACTIVE', badgeType: 'active' }
                            ]
                        };
                        
                        res.json({
                            success: true,
                            stats: stats,
                            recentActivity: recentActivity
                        });
                    });
                });
            });
        });
    });
});

// Database test endpoint
router.get('/test-db', (req, res) => {
    console.log('🧪 Testing database connection...');
    
    // Test individual table counts
    const queries = {
        users: 'SELECT COUNT(*) as count FROM users',
        feedback: 'SELECT COUNT(*) as count FROM feedback WHERE is_active = 1',
        admin_users: 'SELECT COUNT(*) as count FROM admin_users',
        feedback_with_rating: 'SELECT COUNT(*) as count FROM feedback WHERE rating IS NOT NULL AND is_active = 1',
        users_today: 'SELECT COUNT(*) as count FROM users WHERE date(last_visit) = date("now")'
    };
    
    const results = {};
    const queryKeys = Object.keys(queries);
    let completed = 0;
    
    queryKeys.forEach(table => {
        db.get(queries[table], [], (err, result) => {
            if (err) {
                results[table] = { error: err.message };
            } else {
                results[table] = { count: result.count };
            }
            
            completed++;
            
            // When all queries are done
            if (completed === queryKeys.length) {
                console.log('📋 Database test results:', results);
                res.json({
                    success: true,
                    message: 'Database test completed',
                    results: results
                });
            }
        });
    });
});

// ==================== FEEDBACK MANAGEMENT ROUTES ====================

// Get all feedback data - UPDATED to use comment as pledge
router.get('/feedback', (req, res) => {
    console.log('📝 Fetching feedback data...');
    
    const query = `
        SELECT 
            f.id,
            u.name,
            u.email,
            u.email_encrypted,
            u.visit_count as visits,
            f.rating,
            f.comment as pledge,
            f.data_retention,
            f.photo_path,
            f.processed_photo_path,
            f.created_at as date,
            f.admin_notes
        FROM feedback f
        JOIN users u ON f.user_id = u.id
        WHERE f.is_active = 1
        ORDER BY f.created_at DESC
    `;
    
    db.all(query, [], (err, feedbackRows) => {
        if (err) {
            console.error('❌ Error fetching feedback data:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        // Now get question answers for each feedback
        const feedbackWithAnswers = [];
        let processed = 0;
        
        if (feedbackRows.length === 0) {
            return res.json({
                success: true,
                feedback: []
            });
        }
        
        feedbackRows.forEach(feedback => {
            // Get question answers for this feedback
            const answersQuery = `
                SELECT 
                    q.question_text,
                    q.question_type,
                    fa.answer_value,
                    qo.option_label
                FROM feedback_answers fa
                JOIN questions q ON fa.question_id = q.id
                LEFT JOIN question_options qo ON (
                    q.question_type = 'choice' 
                    AND fa.answer_value = qo.id
                )
                WHERE fa.feedback_id = ?
                ORDER BY q.display_order ASC
            `;
            
            db.all(answersQuery, [feedback.id], (err, answers) => {
                if (err) {
                    console.error('❌ Error fetching answers for feedback:', feedback.id, err);
                    // Continue without answers
                    feedbackWithAnswers.push({
                        ...feedback,
                        question_answers: []
                    });
                } else {
                    feedbackWithAnswers.push({
                        ...feedback,
                        question_answers: answers
                    });
                }
                
                processed++;
                
                if (processed === feedbackRows.length) {
                    console.log(`✅ Found ${feedbackWithAnswers.length} feedback entries with answers`);
                    
                    res.json({
                        success: true,
                        feedback: feedbackWithAnswers
                    });
                }
            });
        });
    });
});

// Update feedback
router.put('/feedback/:id', (req, res) => {
    const { id } = req.params;
    const { rating, comment, admin_notes } = req.body;
    
    const query = 'UPDATE feedback SET rating = ?, comment = ?, admin_notes = ? WHERE id = ?';
    
    db.run(query, [rating, comment, admin_notes, id], function(err) {
        if (err) {
            console.error('Error updating feedback:', err);
            return res.status(500).json({ error: 'Failed to update feedback' });
        }
        
        res.json({ 
            success: true, 
            message: 'Feedback updated successfully',
            changes: this.changes 
        });
    });
});

// Delete feedback - UPDATED with photo deletion and proper cascade
router.delete('/feedback/:id', async (req, res) => {
    const { id } = req.params;
    const username = req.headers['x-username'] || 'systemadmin';
    
    logAudit('DELETE_FEEDBACK', username, 'feedback', id, req);
    
    console.log('🗑️ Attempting to delete feedback ID:', id);
    
    try {
        // Step 1: Get feedback and user data BEFORE deletion (to get photo paths and user_id)
        const getFeedbackQuery = `
            SELECT 
                f.id,
                f.user_id,
                f.photo_path,
                f.processed_photo_path,
                u.name
            FROM feedback f
            LEFT JOIN users u ON f.user_id = u.id
            WHERE f.id = ?
        `;
        
        db.get(getFeedbackQuery, [id], (err, feedback) => {
            if (err) {
                console.error('❌ Error fetching feedback data:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            if (!feedback) {
                console.log('❌ Feedback not found');
                return res.status(404).json({ error: 'Feedback not found' });
            }
            
            console.log('📋 Feedback data retrieved:', {
                id: feedback.id,
                user_id: feedback.user_id,
                has_photo: !!feedback.photo_path,
                has_processed: !!feedback.processed_photo_path
            });
            
            // Step 2: Delete the user (this will CASCADE delete feedback and feedback_answers)
            const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
            
            db.run(deleteUserQuery, [feedback.user_id], function(err) {
                if (err) {
                    console.error('❌ Error deleting user:', err);
                    return res.status(500).json({ error: 'Failed to delete user: ' + err.message });
                }
                
                console.log('✅ User deleted successfully (CASCADE will delete feedback and answers):', {
                    user_id: feedback.user_id,
                    changes: this.changes
                });
                
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'User not found or already deleted' });
                }
                
                // Step 3: Delete associated photos from filesystem
                deleteUserPhotos(feedback, (photoError) => {
                    if (photoError) {
                        console.error('⚠️ Warning: Some photos could not be deleted:', photoError);
                        // Still return success since database deletion worked
                        return res.json({
                            success: true,
                            message: 'Feedback deleted successfully, but some photos could not be removed',
                            warning: photoError.message,
                            changes: this.changes
                        });
                    }
                    
                    console.log('✅ All photos deleted successfully');
                    res.json({
                        success: true,
                        message: 'Feedback and all associated data deleted successfully',
                        changes: this.changes
                    });
                });
            });
        });
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        res.status(500).json({ error: 'Unexpected error: ' + error.message });
    }
});

// ==================== PHOTO ACCESS & EMAIL DECRYPTION ROUTES ====================

// Verify system admin password for photo access
router.post('/verify-photo-access', (req, res) => {
    const { password } = req.body;
    const username = 'systemadmin';
    
    if (!password) {
        return res.status(400).json({ error: 'Password required' });
    }
    
    auth.loginUser(username, password, (err, user) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        res.json({ 
            success: true,
            message: 'Access granted'
        });
    });
});

// Fix the decrypt-email endpoint in adminRoutes.js
router.post('/decrypt-email', (req, res) => {
    const { feedbackId, password } = req.body;
    const username = req.headers['x-username'] || 'systemadmin';
    
    logAudit('VIEW_ENCRYPTED_EMAIL', username, 'feedback', feedbackId, req);
    
    if (!password) {
        return res.status(400).json({ error: 'Password required' });
    }
    
    if (!feedbackId) {
        return res.status(400).json({ error: 'Feedback ID required' });
    }
    
    console.log('🔍 Debug - Decrypt email request:', { feedbackId, username });
    
    // Verify the user's password first
    auth.loginUser(username, password, (err, user) => {
        if (err) {
            console.error('❌ Password verification failed:', err);
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        // Check if user is system admin
        if (user.role !== 'system_admin') {
            console.error('❌ User is not system admin:', user.role);
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        console.log('✅ User authenticated as system admin');
        
        // Get the encrypted email from database
        const query = `
            SELECT u.email_encrypted 
            FROM feedback f 
            JOIN users u ON f.user_id = u.id 
            WHERE f.id = ?
        `;
        
        db.get(query, [feedbackId], (err, row) => {
            if (err) {
                console.error('❌ Error fetching encrypted email:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            console.log('🔍 Database query result:', row);
            
            if (!row || !row.email_encrypted) {
                return res.status(404).json({ error: 'Encrypted email not found' });
            }
            
            // For now, return the encrypted email (in a real system, you'd decrypt it)
            // In production, you'd use proper encryption/decryption here
            res.json({
                success: true,
                decryptedEmail: row.email_encrypted, // This would be decrypted in real implementation
                message: 'Email decrypted successfully'
            });
        });
    });
});

// ==================== ADMIN USER MANAGEMENT ROUTES ====================

// Get all admin users - COMPLETELY FIXED VERSION
router.get('/users', (req, res) => {
    console.log('👥 Fetching admin users...');
    
    // First check if admin_users table exists
    const tableCheckQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name='admin_users'`;
    
    db.get(tableCheckQuery, [], (err, table) => {
        if (err) {
            console.error('❌ Error checking admin_users table:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Database error: ' + err.message 
            });
        }
        
        if (!table) {
            console.log('❌ admin_users table does not exist');
            return res.status(404).json({
                success: false,
                error: 'Admin users table not found. Please run database setup.'
            });
        }
        
        // CORRECTED QUERY - removed system_admin column since it doesn't exist
        const query = `
            SELECT 
                id,
                username,
                role,
                is_active,
                created_at,
                last_login
            FROM admin_users 
            ORDER BY created_at DESC
        `;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('❌ Error fetching admin users:', err);
                return res.status(500).json({ 
                    success: false,
                    error: 'Database error: ' + err.message 
                });
            }
            
            console.log(`✅ Found ${rows.length} admin users`);
            
            // Ensure each user has required fields
            const users = rows.map(user => ({
                id: user.id,
                username: user.username || 'Unknown',
                // Use username as full_name since full_name column doesn't exist
                full_name: user.username || 'Unknown',
                role: user.role || 'IT_staff',
                // Default to 'IT' for department since department column doesn't exist
                department: 'IT',
                is_active: user.is_active !== undefined ? user.is_active : 1,
                created_at: user.created_at,
                last_login: user.last_login
            }));
            
            res.json({
                success: true,
                users: users,
                count: users.length
            });
        });
    });
});

// Add this DELETE user endpoint (somewhere after line ~460)
router.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const username = req.headers['x-username'] || 'systemadmin';
    
    logAudit('DELETE_USER', username, 'user', id, req);
    
    console.log('🗑️ Attempting to delete user ID:', id, 'by:', username);
    
    // First, check if current user is system admin
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1';
    
    db.get(checkUserQuery, [username], (err, currentUser) => {
        if (err) {
            console.error('❌ Error checking current user:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!currentUser || currentUser.role !== 'system_admin') {
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        // Prevent deleting yourself
        const getTargetUserQuery = 'SELECT * FROM admin_users WHERE id = ?';
        
        db.get(getTargetUserQuery, [id], (err, targetUser) => {
            if (err) {
                console.error('❌ Error fetching target user:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            if (!targetUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Check if trying to delete yourself
            if (targetUser.username === username) {
                return res.status(400).json({ error: 'Cannot delete your own account' });
            }
            
            // Prevent deleting system admin users
            if (targetUser.role === 'system_admin') {
                return res.status(403).json({ error: 'Cannot delete System Admin users' });
            }
            
            // Soft delete (set is_active = 0) instead of hard delete
            const deleteQuery = 'UPDATE admin_users SET is_active = 0 WHERE id = ?';
            
            db.run(deleteQuery, [id], function(err) {
                if (err) {
                    console.error('❌ Error deleting user:', err);
                    return res.status(500).json({ error: 'Database error: ' + err.message });
                }
                
                console.log('✅ User soft-deleted:', { changes: this.changes, id });
                
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'User not found or already deleted' });
                }
                
                res.json({ 
                    success: true, 
                    message: 'User deleted successfully',
                    changes: this.changes 
                });
            });
        });
    });
});

// Add new admin user - NEW ROUTE
router.post('/users', (req, res) => {
    const { username, full_name, role, password } = req.body;
    const currentUsername = req.headers['x-username'] || 'systemadmin';
    
    logAudit('ADD_USER', currentUsername, 'user', null, req);

    console.log('➕ Adding new user:', { username, role, currentUsername });
    
    // First, check if current user is system admin
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1';
    
    db.get(checkUserQuery, [currentUsername], (err, currentUser) => {
        if (err) {
            console.error('❌ Error checking current user:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!currentUser || currentUser.role !== 'system_admin') {
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        // Validate input
        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password and role are required' });
        }
        
        // Validate role
        const validRoles = ['IT_admin', 'IT_staff'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Only IT_admin and IT_staff are allowed.' });
        }
        
        // Check if username already exists
        const checkUsernameQuery = 'SELECT id FROM admin_users WHERE username = ?';
        
        db.get(checkUsernameQuery, [username], (err, existingUser) => {
            if (err) {
                console.error('❌ Error checking username:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            
            // Hash the password
            const hashedPassword = auth.hashPassword(password);
            
            // Insert new user
            const insertQuery = `
                INSERT INTO admin_users (username, password_hash, role, created_at, is_active)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1)
            `;
            
            db.run(insertQuery, [username, hashedPassword, role], function(err) {
                if (err) {
                    console.error('❌ Error inserting user:', err);
                    return res.status(500).json({ error: 'Database error: ' + err.message });
                }
                
                console.log(`✅ New user added with ID: ${this.lastID}`);
                
                // Get the newly created user
                const getUserQuery = 'SELECT id, username, role, created_at, is_active FROM admin_users WHERE id = ?';
                
                db.get(getUserQuery, [this.lastID], (err, newUser) => {
                    if (err) {
                        console.error('❌ Error fetching new user:', err);
                        // Still return success but without user data
                        return res.json({
                            success: true,
                            message: 'User added successfully',
                            userId: this.lastID
                        });
                    }
                    
                    res.json({
                        success: true,
                        message: 'User added successfully',
                        user: {
                            id: newUser.id,
                            username: newUser.username,
                            role: newUser.role,
                            is_active: newUser.is_active,
                            created_at: newUser.created_at
                        }
                    });
                });
            });
        });
    });
});

// Update admin user - UPDATED to handle username changes
router.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { username, full_name, role, password } = req.body;
    const currentUsername = req.headers['x-username'] || 'systemadmin';
    logAudit('EDIT_USER', username, 'user', id, req);
    
    console.log('✏️ Updating admin user:', { id, username, role, currentUsername });
    
    // First, check if current user is system admin
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1';
    
    db.get(checkUserQuery, [currentUsername], (err, currentUser) => {
        if (err) {
            console.error('❌ Error checking current user:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!currentUser || currentUser.role !== 'system_admin') {
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        // Get the target user to check if they're system admin
        const getTargetUserQuery = 'SELECT * FROM admin_users WHERE id = ?';
        
        db.get(getTargetUserQuery, [id], (err, targetUser) => {
            if (err) {
                console.error('❌ Error fetching target user:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            if (!targetUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Prevent modifying system admin users unless it's self
            if (targetUser.role === 'system_admin' && targetUser.username !== currentUsername) {
                return res.status(403).json({ error: 'Cannot modify other System Admin users' });
            }
            
            // Check if username already exists (for other users)
            if (username !== targetUser.username) {
                const checkUsernameQuery = 'SELECT id FROM admin_users WHERE username = ? AND id != ?';
                db.get(checkUsernameQuery, [username, id], (err, existingUser) => {
                    if (err) {
                        console.error('❌ Error checking username:', err);
                        return res.status(500).json({ error: 'Database error: ' + err.message });
                    }
                    
                    if (existingUser) {
                        return res.status(400).json({ error: 'Username already exists' });
                    }
                    
                    // Continue with update if username is available
                    performUserUpdate();
                });
            } else {
                // Username not changed, continue with update
                performUserUpdate();
            }
            
            function performUserUpdate() {
                // Build update query based on provided fields
                let updateQuery = 'UPDATE admin_users SET ';
                const updateParams = [];
                const updateFields = [];
                
                // Update username if changed
                if (username !== targetUser.username) {
                    updateFields.push('username = ?');
                    updateParams.push(username);
                }
                
                // Update role (only for non-system-admin users or self)
                if (role !== undefined && (targetUser.role !== 'system_admin' || targetUser.username === currentUsername)) {
                    updateFields.push('role = ?');
                    updateParams.push(role);
                }
                
                if (password && password.trim() !== '') {
                    // Hash the new password
                    const hashedPassword = auth.hashPassword(password);
                    updateFields.push('password_hash = ?');
                    updateParams.push(hashedPassword);
                }
                
                if (updateFields.length === 0) {
                    return res.status(400).json({ error: 'No fields to update' });
                }
                
                updateQuery += updateFields.join(', ') + ' WHERE id = ?';
                updateParams.push(id);
                
                db.run(updateQuery, updateParams, function(err) {
                    if (err) {
                        console.error('❌ Error updating user:', err);
                        return res.status(500).json({ error: 'Failed to update user: ' + err.message });
                    }
                    
                    console.log('✅ User updated successfully:', { changes: this.changes, id });
                    
                    // Get the updated user data
                    const getUpdatedUserQuery = 'SELECT * FROM admin_users WHERE id = ?';
                    db.get(getUpdatedUserQuery, [id], (err, updatedUser) => {
                        if (err) {
                            console.error('❌ Error fetching updated user:', err);
                            // Still return success but without updated user data
                            return res.json({
                                success: true,
                                message: 'User updated successfully',
                                changes: this.changes
                            });
                        }
                        
                        res.json({
                            success: true,
                            message: 'User updated successfully',
                            changes: this.changes,
                            updatedUser: {
                                id: updatedUser.id,
                                username: updatedUser.username,
                                role: updatedUser.role
                            }
                        });
                    });
                });
            }
        });
    });
});

// ==================== EXPORT/IMPORT ROUTES ====================

// Excel download endpoint
router.get('/download-excel', (req, res) => {
    const { password } = req.query;
    const username = req.headers['x-username'] || 'systemadmin';
    logAudit('DOWNLOAD_EXCEL', username, null, null, req);
    
    if (!password) {
        return res.status(400).json({ error: 'Password required' });
    }
    
    // Verify the user's password and role
    auth.loginUser(username, password, (err, user) => {
        if (err || user.role !== 'system_admin') {
            return res.status(401).json({ error: 'Invalid password or insufficient permissions' });
        }
        
        // Get all feedback data for Excel
        const query = `
            SELECT 
                f.id,
                u.name,
                u.email,
                u.email_encrypted,
                u.visit_count as visits,
                f.rating,
                f.comment as feedback,
                f.data_retention,
                f.photo_path,
                f.processed_photo_path,
                f.created_at as date,
                f.admin_notes
            FROM feedback f
            JOIN users u ON f.user_id = u.id
            WHERE f.is_active = 1
            ORDER BY f.created_at DESC
        `;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error fetching data for Excel:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            // Convert to Excel format (simplified - you might want to use a library like exceljs)
            const csvData = convertToCSV(rows);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=feedback_data.csv');
            res.send(csvData);
        });
    });
});

// Update the download-photos endpoint in adminRoutes.js with correct path
router.get('/download-photos', async (req, res) => {
    const { password } = req.query;
    const username = req.headers['x-username'] || 'systemadmin';
    logAudit('DOWNLOAD_PHOTOS', username, null, null, req);
    
    if (!password) {
        return res.status(400).json({ error: 'Password required' });
    }
    
    try {
        // Verify the user's password and role
        const verifyUser = await new Promise((resolve, reject) => {
            auth.loginUser(username, password, (err, user) => {
                if (err) reject(err);
                else resolve(user);
            });
        });
        
        if (!verifyUser || verifyUser.role !== 'system_admin') {
            return res.status(401).json({ error: 'Invalid password or insufficient permissions' });
        }
        
        // FIXED PATH: Since adminRoutes.js is in backend/, go up 1 level to reach DP_KIOSK root
        const uploadsPath = path.join(__dirname, '../uploads');
        
        console.log(`📁 Looking for uploads at: ${uploadsPath}`);
        console.log(`📁 Current directory: ${__dirname}`);
        console.log(`📁 Resolved absolute path: ${path.resolve(uploadsPath)}`);
        
        // Check if uploads directory exists
        if (!fs.existsSync(uploadsPath)) {
            console.error(`❌ Uploads directory not found at: ${uploadsPath}`);
            
            // Debug: Check what's in the parent directory
            const parentDir = path.join(__dirname, '..');
            try {
                const files = fs.readdirSync(parentDir);
                console.log(`📂 Files in parent directory (${parentDir}):`, files);
            } catch (e) {
                console.error('Error reading parent directory:', e);
            }
            
            return res.status(404).json({ 
                error: 'Uploads directory not found. Please check server logs for details.' 
            });
        }
        
        // Check if uploads directory is empty
        const uploadsContent = fs.readdirSync(uploadsPath);
        console.log(`📂 Content of uploads directory:`, uploadsContent);
        
        if (uploadsContent.length === 0) {
            console.log('📂 uploads directory is empty');
            return res.status(404).json({ error: 'Uploads directory is empty' });
        }
        
        // Check each subdirectory for photos
        const hasPhotos = checkDirectoryForPhotos(uploadsPath);
        if (!hasPhotos) {
            console.log('📂 No image files found in uploads directory');
            return res.status(404).json({ error: 'No photos found in uploads directory' });
        }
        
        console.log(`📸 Creating ZIP of uploads directory: ${uploadsPath}`);
        
        // Create zip file of uploads directory
        const zipBuffer = await createUploadsZip(uploadsPath);
        
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=uploads_backup_' + new Date().toISOString().split('T')[0] + '.zip');
        res.setHeader('Content-Length', zipBuffer.length);
        res.send(zipBuffer);
        
    } catch (error) {
        console.error('Error downloading photos:', error);
        res.status(500).json({ error: 'Error creating zip file: ' + error.message });
    }
});

// ==================== OVERLAY MANAGEMENT ROUTES ====================

// Overlay list route
router.get('/overlays', (req, res) => {
    console.log('🎨 Fetching overlay data...');
    
    // First, check if the overlays table exists
    const tableCheckQuery = `
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='overlays'
    `;
    
    db.get(tableCheckQuery, [], (err, table) => {
        if (err) {
            console.error('❌ Error checking overlays table:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Database error: ' + err.message 
            });
        }
        
        if (!table) {
            console.log('❌ Overlays table does not exist');
            return res.json({
                success: true,
                overlays: [],
                message: 'Overlays table does not exist yet'
            });
        }
        
        // Table exists, now fetch the data
        const query = `
            SELECT 
                id,
                display_name,
                theme_id,
                desktop_filename,
                mobile_filename,
                display_order,
                created_at
            FROM overlays 
            ORDER BY display_order ASC
        `;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('❌ Error fetching overlays:', err);
                return res.status(500).json({ 
                    success: false,
                    error: 'Database error: ' + err.message 
                });
            }
            
            console.log(`✅ Found ${rows.length} overlays`);
            
            res.json({
                success: true,
                overlays: rows
            });
        });
    });
});

// CORRECTED Overlay addition endpoint - SINGLE VERSION
router.post('/overlays', upload.fields([
    { name: 'desktop_file', maxCount: 1 },
    { name: 'mobile_file', maxCount: 1 }
]), (req, res) => {
    const { display_name, theme_id } = req.body;
    const username = req.headers['x-username'] || 'systemadmin';

    logAudit('ADD_OVERLAY', username, 'overlay', null, req);
    
    console.log('🎨 Adding new overlay:', { display_name, theme_id, username });
    
    // First, check if user exists and has system_admin role
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1';
    
    db.get(checkUserQuery, [username], (err, user) => {
        if (err) {
            console.error('❌ Error checking user:', err);
            // Clean up uploaded files
            if (req.files) {
                Object.values(req.files).forEach(files => {
                    files.forEach(file => {
                        if (fs.existsSync(file.path)) {
                            fs.unlinkSync(file.path);
                        }
                    });
                });
            }
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!user || user.role !== 'system_admin') {
            // Clean up uploaded files if auth fails
            if (req.files) {
                Object.values(req.files).forEach(files => {
                    files.forEach(file => {
                        if (fs.existsSync(file.path)) {
                            fs.unlinkSync(file.path);
                        }
                    });
                });
            }
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        // Check if files were uploaded
        if (!req.files || !req.files.desktop_file || !req.files.mobile_file) {
            // Clean up any partially uploaded files
            if (req.files) {
                Object.values(req.files).forEach(files => {
                    files.forEach(file => {
                        if (fs.existsSync(file.path)) {
                            fs.unlinkSync(file.path);
                        }
                    });
                });
            }
            return res.status(400).json({ error: 'Both desktop and mobile overlay files are required' });
        }
        
        // Check if overlays table exists
        const tableCheckQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name='overlays'`;
        
        db.get(tableCheckQuery, [], (err, table) => {
            if (err) {
                console.error('❌ Error checking overlays table:', err);
                // Clean up files
                Object.values(req.files).forEach(files => {
                    files.forEach(file => {
                        if (fs.existsSync(file.path)) {
                            fs.unlinkSync(file.path);
                        }
                    });
                });
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            if (!table) {
                // Clean up files
                Object.values(req.files).forEach(files => {
                    files.forEach(file => {
                        if (fs.existsSync(file.path)) {
                            fs.unlinkSync(file.path);
                        }
                    });
                });
                return res.status(400).json({ error: 'Overlays table does not exist. Please run database setup first.' });
            }
            
            // Check current overlay count
            const countQuery = 'SELECT COUNT(*) as count FROM overlays';
            
            db.get(countQuery, [], (err, result) => {
                if (err) {
                    console.error('❌ Error counting overlays:', err);
                    // Clean up files
                    Object.values(req.files).forEach(files => {
                        files.forEach(file => {
                            if (fs.existsSync(file.path)) {
                                fs.unlinkSync(file.path);
                            }
                        });
                    });
                    return res.status(500).json({ error: 'Database error: ' + err.message });
                }
                
                // Enforce 6 overlay limit
                if (result.count >= 6) {
                    // Clean up files
                    Object.values(req.files).forEach(files => {
                        files.forEach(file => {
                            if (fs.existsSync(file.path)) {
                                fs.unlinkSync(file.path);
                            }
                        });
                    });
                    return res.status(400).json({ error: 'Maximum limit of 6 overlays reached. Cannot add more.' });
                }
                
                // Validate input
                if (!display_name || !theme_id) {
                    // Clean up files
                    Object.values(req.files).forEach(files => {
                        files.forEach(file => {
                            if (fs.existsSync(file.path)) {
                                fs.unlinkSync(file.path);
                            }
                        });
                    });
                    return res.status(400).json({ error: 'Display name and theme ID are required' });
                }
                
                // Validate theme_id format (lowercase letters and numbers only)
                if (!/^[a-z0-9]+$/.test(theme_id)) {
                    // Clean up files
                    Object.values(req.files).forEach(files => {
                        files.forEach(file => {
                            if (fs.existsSync(file.path)) {
                                fs.unlinkSync(file.path);
                            }
                        });
                    });
                    return res.status(400).json({ error: 'Theme ID must contain only lowercase letters and numbers, no spaces' });
                }
                
                // Check if theme_id already exists
                const checkThemeQuery = 'SELECT id FROM overlays WHERE theme_id = ?';
                
                db.get(checkThemeQuery, [theme_id], (err, existing) => {
                    if (err) {
                        console.error('❌ Error checking existing theme:', err);
                        // Clean up files
                        Object.values(req.files).forEach(files => {
                            files.forEach(file => {
                                if (fs.existsSync(file.path)) {
                                    fs.unlinkSync(file.path);
                                }
                            });
                        });
                        return res.status(500).json({ error: 'Database error: ' + err.message });
                    }
                    
                    if (existing) {
                        // Clean up files
                        Object.values(req.files).forEach(files => {
                            files.forEach(file => {
                                if (fs.existsSync(file.path)) {
                                    fs.unlinkSync(file.path);
                                }
                            });
                        });
                        return res.status(400).json({ error: 'Theme ID already exists. Please choose a different one.' });
                    }
                    
                    // Generate filenames
                    const desktop_filename = `/assets/overlays/DesktopOverlay/${theme_id}ThemeDesktop.png`;
                    const mobile_filename = `/assets/overlays/MobileOverlay/${theme_id}ThemeMobile.png`;
                    
                    // Get next display order
                    const maxOrderQuery = 'SELECT MAX(display_order) as max_order FROM overlays';
                    
                    db.get(maxOrderQuery, [], (err, result) => {
                        if (err) {
                            console.error('❌ Error getting max display order:', err);
                            // Clean up files
                            Object.values(req.files).forEach(files => {
                                files.forEach(file => {
                                    if (fs.existsSync(file.path)) {
                                        fs.unlinkSync(file.path);
                                    }
                                });
                            });
                            return res.status(500).json({ error: 'Database error: ' + err.message });
                        }
                        
                        const display_order = (result.max_order || 0) + 1;
                        
                        // Insert new overlay
                        const insertQuery = `
                            INSERT INTO overlays (display_name, theme_id, desktop_filename, mobile_filename, display_order, created_at)
                            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                        `;
                        
                        db.run(insertQuery, [display_name, theme_id, desktop_filename, mobile_filename, display_order], function(err) {
                            if (err) {
                                console.error('❌ Error inserting overlay:', err);
                                // Clean up files
                                Object.values(req.files).forEach(files => {
                                    files.forEach(file => {
                                        if (fs.existsSync(file.path)) {
                                            fs.unlinkSync(file.path);
                                        }
                                    });
                                });
                                return res.status(500).json({ error: 'Database error: ' + err.message });
                            }
                            
                            console.log(`✅ New overlay added with ID: ${this.lastID}`);
                            
                            res.json({
                                success: true,
                                message: 'Overlay added successfully',
                                overlay: {
                                    id: this.lastID,
                                    display_name,
                                    theme_id,
                                    desktop_filename,
                                    mobile_filename,
                                    display_order
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});

// Delete overlay endpoint - COMPLETE VERSION
router.delete('/overlays/:id', (req, res) => {
    const { id } = req.params;
    const username = req.headers['x-username'] || 'systemadmin';
    logAudit('DELETE_OVERLAY', username, 'overlay', id, req);
    
    console.log('🗑️ Attempting to delete overlay ID:', id);
    
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1';
    
    db.get(checkUserQuery, [username], (err, user) => {
        if (err) {
            console.error('❌ Error checking user:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!user || user.role !== 'system_admin') {
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        const getOverlayQuery = 'SELECT * FROM overlays WHERE id = ?';
        
        db.get(getOverlayQuery, [id], (err, overlay) => {
            if (err) {
                console.error('❌ Error fetching overlay data:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            if (!overlay) {
                return res.status(404).json({ error: 'Overlay not found' });
            }
            
            console.log('🔍 Overlay to delete:', overlay);
            
            const deleteQuery = 'DELETE FROM overlays WHERE id = ?';
            
            db.run(deleteQuery, [id], function(err) {
                if (err) {
                    console.error('❌ Error deleting overlay from database:', err);
                    return res.status(500).json({ error: 'Failed to delete overlay: ' + err.message });
                }
                
                console.log('✅ Overlay deleted from database:', {
                    changes: this.changes,
                    id: id
                });
                
                deleteOverlayFiles(overlay, (fileError) => {
                    if (fileError) {
                        console.error('❌ Error deleting overlay files:', fileError);
                        return res.json({
                            success: true,
                            message: 'Overlay deleted from database but some files could not be removed',
                            fileError: fileError.message,
                            changes: this.changes
                        });
                    }
                    
                    console.log('✅ Overlay files deleted successfully');
                    res.json({
                        success: true,
                        message: 'Overlay and associated files deleted successfully',
                        changes: this.changes
                    });
                });
            });
        });
    });
});

// ==================== QUESTION MANAGEMENT ROUTES ====================

// Get all active questions with their options
router.get('/questions', (req, res) => {
    console.log('❓ Fetching questions data...');
    
    // First check if questions table exists
    const tableCheckQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name='questions'`;
    
    db.get(tableCheckQuery, [], (err, table) => {
        if (err) {
            console.error('❌ Error checking questions table:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Database error: ' + err.message 
            });
        }
        
        if (!table) {
            console.log('❌ Questions table does not exist');
            return res.status(404).json({
                success: false,
                error: 'Questions table not found. Please run database setup.'
            });
        }
        
        // Get all active questions
        const questionsQuery = `
            SELECT 
                id,
                question_text,
                question_type,
                is_required,
                display_order,
                is_active,
                created_at
            FROM questions 
            WHERE is_active = 1
            ORDER BY display_order ASC, created_at ASC
        `;
        
        db.all(questionsQuery, [], (err, questions) => {
            if (err) {
                console.error('❌ Error fetching questions:', err);
                return res.status(500).json({ 
                    success: false,
                    error: 'Database error: ' + err.message 
                });
            }
            
            console.log(`✅ Found ${questions.length} questions`);
            
            // For each question, get its options if it's a choice type
            const questionsWithOptions = [];
            let processed = 0;
            
            if (questions.length === 0) {
                return res.json({
                    success: true,
                    questions: []
                });
            }
            
            questions.forEach(question => {
                if (question.question_type === 'choice') {
                    // Get options for this question
                    const optionsQuery = `
                        SELECT 
                            id,
                            question_id,
                            option_label,
                            display_order
                        FROM question_options 
                        WHERE question_id = ?
                        ORDER BY display_order ASC
                    `;
                    
                    db.all(optionsQuery, [question.id], (err, options) => {
                        if (err) {
                            console.error('❌ Error fetching options for question:', question.id, err);
                            // Continue without options
                            questionsWithOptions.push({
                                ...question,
                                options: []
                            });
                        } else {
                            questionsWithOptions.push({
                                ...question,
                                options: options
                            });
                        }
                        
                        processed++;
                        
                        if (processed === questions.length) {
                            // All questions processed
                            res.json({
                                success: true,
                                questions: questionsWithOptions
                            });
                        }
                    });
                } else {
                    // Not a choice question, no options needed
                    questionsWithOptions.push({
                        ...question,
                        options: []
                    });
                    processed++;
                    
                    if (processed === questions.length) {
                        // All questions processed
                        res.json({
                            success: true,
                            questions: questionsWithOptions
                        });
                    }
                }
            });
        });
    });
});

// Add new question
router.post('/questions', (req, res) => {
    const { question_text, question_type, display_order, is_required, is_active, options } = req.body;
    const username = req.headers['x-username'] || 'systemadmin';
    
    console.log('➕ Adding new question:', { 
        question_text, 
        question_type, 
        display_order, 
        is_required, 
        is_active, 
        options_count: options ? options.length : 0,
        username 
    });
    
    // First, check if user exists and has system_admin role
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1';
    
    db.get(checkUserQuery, [username], (err, user) => {
        if (err) {
            console.error('❌ Error checking user:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!user || user.role !== 'system_admin') {
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        // Validate input
        if (!question_text || !question_type) {
            return res.status(400).json({ error: 'Question text and type are required' });
        }
        
        // Validate question type
        const validTypes = ['text', 'yesno', 'stars', 'choice'];
        if (!validTypes.includes(question_type)) {
            return res.status(400).json({ error: 'Invalid question type' });
        }
        
        // Validate options for choice type
        if (question_type === 'choice') {
            if (!options || !Array.isArray(options) || options.length === 0) {
                return res.status(400).json({ error: 'Multiple choice questions require at least one option' });
            }
            
            // Validate each option
            for (const option of options) {
                if (!option.option_label || option.option_label.trim() === '') {
                    return res.status(400).json({ error: 'All options must have a label' });
                }
            }
        }
        
        // For non-choice questions, options should be empty or undefined
        if (question_type !== 'choice' && options && options.length > 0) {
            console.log('⚠️ Warning: Options provided for non-choice question type, ignoring options');
        }
        
        // Start transaction
        db.run('BEGIN TRANSACTION', function(err) {
            if (err) {
                console.error('❌ Error starting transaction:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            // Insert the question
            const insertQuestionQuery = `
                INSERT INTO questions (question_text, question_type, is_required, display_order, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `;
            
            db.run(insertQuestionQuery, [
                question_text, 
                question_type, 
                is_required ? 1 : 0, 
                display_order || 0, 
                is_active ? 1 : 0
            ], function(err) {
                if (err) {
                    console.error('❌ Error inserting question:', err);
                    return db.run('ROLLBACK', () => {
                        res.status(500).json({ error: 'Database error: ' + err.message });
                    });
                }
                
                const questionId = this.lastID;
                console.log(`✅ Question added with ID: ${questionId}`);
                
                // If it's a choice question, insert options
                if (question_type === 'choice' && options && options.length > 0) {
                    insertQuestionOptions(questionId, options, (err) => {
                        if (err) {
                            console.error('❌ Error inserting options:', err);
                            return db.run('ROLLBACK', () => {
                                res.status(500).json({ error: 'Failed to add question options' });
                            });
                        }
                        
                        // Commit transaction
                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('❌ Error committing transaction:', err);
                                return res.status(500).json({ error: 'Database error: ' + err.message });
                            }
                            
                            res.json({
                                success: true,
                                message: 'Question and options added successfully',
                                questionId: questionId
                            });
                        });
                    });
                } else {
                    // Commit transaction (no options to insert for non-choice questions)
                    db.run('COMMIT', (err) => {
                        if (err) {
                            console.error('❌ Error committing transaction:', err);
                            return res.status(500).json({ error: 'Database error: ' + err.message });
                        }
                        
                        res.json({
                            success: true,
                            message: 'Question added successfully',
                            questionId: questionId
                        });
                    });
                }
            });
        });
    });
});

// Delete question with soft-delete logic when answers exist
router.delete('/questions/:id', (req, res) => {
    const { id } = req.params;
    const username = req.headers['x-username'] || 'systemadmin';

    logAudit('DELETE_QUESTION', username, 'question', id, req);
    
    console.log('🗑️ Attempting to delete question ID:', id);
    
    // First, check if user exists and has system_admin role
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1';
    
    db.get(checkUserQuery, [username], (err, user) => {
        if (err) {
            console.error('❌ Error checking user:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!user || user.role !== 'system_admin') {
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        // Check if question has existing answers
        const checkAnswersQuery = 'SELECT COUNT(*) as answer_count FROM feedback_answers WHERE question_id = ?';
        
        db.get(checkAnswersQuery, [id], (err, result) => {
            if (err) {
                console.error('❌ Error checking question answers:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            const hasAnswers = result && result.answer_count > 0;
            
            if (hasAnswers) {
                // Soft delete - keep question for historical data
                const softDeleteQuery = 'UPDATE questions SET is_active = 0 WHERE id = ?';
                
                db.run(softDeleteQuery, [id], function(err) {
                    if (err) {
                        console.error('❌ Error soft-deleting question:', err);
                        return res.status(500).json({ error: 'Database error: ' + err.message });
                    }
                    
                    console.log(`✅ Question ID ${id} soft-deleted, historical answers preserved`);
                    
                    res.json({
                        success: true,
                        message: 'Question deactivated. Historical answers preserved.',
                        changes: this.changes
                    });
                });
            } else {
                // No answers - safe to hard delete (question and options)
                db.run('BEGIN TRANSACTION', function(err) {
                    if (err) {
                        console.error('❌ Error starting transaction:', err);
                        return res.status(500).json({ error: 'Database error: ' + err.message });
                    }
                    
                    // First delete any options for this question
                    const deleteOptionsQuery = 'DELETE FROM question_options WHERE question_id = ?';
                    
                    db.run(deleteOptionsQuery, [id], function(err) {
                        if (err) {
                            console.error('❌ Error deleting question options:', err);
                            return db.run('ROLLBACK', () => {
                                res.status(500).json({ error: 'Database error: ' + err.message });
                            });
                        }
                        
                        console.log(`✅ Deleted options for question ID: ${id}`);
                        
                        // Now delete the question
                        const deleteQuestionQuery = 'DELETE FROM questions WHERE id = ?';
                        
                        db.run(deleteQuestionQuery, [id], function(err) {
                            if (err) {
                                console.error('❌ Error deleting question:', err);
                                return db.run('ROLLBACK', () => {
                                    res.status(500).json({ error: 'Database error: ' + err.message });
                                });
                            }
                            
                            // Commit transaction
                            db.run('COMMIT', (err) => {
                                if (err) {
                                    console.error('❌ Error committing transaction:', err);
                                    return res.status(500).json({ error: 'Database error: ' + err.message });
                                }
                                
                                console.log(`✅ Question completely deleted (no historical answers): ${id}`);
                                
                                res.json({
                                    success: true,
                                    message: 'Question and associated options deleted successfully (no historical answers)',
                                    changes: this.changes
                                });
                            });
                        });
                    });
                });
            }
        });
    });
});

// Update question (safe edit)
router.put('/questions/:id', (req, res) => {
    const { id } = req.params;
    const { question_text, display_order, is_required, is_active } = req.body;
    const username = req.headers['x-username'] || 'systemadmin';
    
    console.log('✏️ Safe editing question ID:', id);
    
    // First, check if user exists and has system_admin role
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1';
    
    db.get(checkUserQuery, [username], (err, user) => {
        if (err) {
            console.error('❌ Error checking user:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!user || user.role !== 'system_admin') {
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        // Only allow safe fields to be updated
        const updateQuery = `
            UPDATE questions 
            SET question_text = ?, display_order = ?, is_required = ?, is_active = ?
            WHERE id = ?
        `;
        
        db.run(updateQuery, [
            question_text,
            display_order || 0,
            is_required ? 1 : 0,
            is_active ? 1 : 0,
            id
        ], function(err) {
            if (err) {
                console.error('❌ Error updating question:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            console.log('✅ Question updated safely:', { changes: this.changes, id });
            
            res.json({
                success: true,
                message: 'Question updated successfully (safe edit)',
                changes: this.changes
            });
        });
    });
});

// ==================== AUDIT LOGS ROUTES ====================

// Get audit logs
router.get('/audit-logs', (req, res) => {
    const { limit = 100, offset = 0 } = req.query;
    
    const query = `
        SELECT * FROM audit_logs 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    `;
    
    db.all(query, [parseInt(limit), parseInt(offset)], (err, logs) => {
        if (err) {
            console.error('Error fetching audit logs:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Get total count
        db.get('SELECT COUNT(*) as total FROM audit_logs', [], (err, countResult) => {
            if (err) {
                return res.json({ success: true, logs: logs, total: logs.length });
            }
            
            res.json({
                success: true,
                logs: logs,
                total: countResult.total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        });
    });
});

// ==================== HELPER FUNCTIONS ====================

// Helper function to delete user photos from filesystem
function deleteUserPhotos(feedback, callback) {
    const filesToDelete = [];
    
    // Add raw photo if exists
    if (feedback.photo_path) {
        // Handle both absolute and relative paths
        let photoFullPath;
        if (feedback.photo_path.startsWith('photos/')) {
            photoFullPath = path.join(__dirname, '../uploads', feedback.photo_path);
        } else {
            photoFullPath = path.join(__dirname, '../uploads/photos', path.basename(feedback.photo_path));
        }
        filesToDelete.push({
            path: photoFullPath,
            type: 'raw photo'
        });
    }
    
    // Add processed photo if exists
    if (feedback.processed_photo_path) {
        let processedFullPath;
        if (feedback.processed_photo_path.startsWith('processed/')) {
            processedFullPath = path.join(__dirname, '../uploads', feedback.processed_photo_path);
        } else {
            processedFullPath = path.join(__dirname, '../uploads/processed', path.basename(feedback.processed_photo_path));
        }
        filesToDelete.push({
            path: processedFullPath,
            type: 'processed photo'
        });
    }
    
    console.log('🗑️ Files to delete:', filesToDelete.map(f => f.path));
    
    if (filesToDelete.length === 0) {
        console.log('ℹ️ No photos to delete');
        return callback(null);
    }
    
    let deletedCount = 0;
    let errorOccurred = null;
    let processedCount = 0;
    
    filesToDelete.forEach(fileInfo => {
        if (fs.existsSync(fileInfo.path)) {
            try {
                fs.unlinkSync(fileInfo.path);
                console.log(`✅ Deleted ${fileInfo.type}:`, fileInfo.path);
                deletedCount++;
            } catch (error) {
                console.error(`❌ Error deleting ${fileInfo.type}:`, fileInfo.path, error);
                errorOccurred = error;
            }
        } else {
            console.log(`⚠️ ${fileInfo.type} not found, skipping:`, fileInfo.path);
        }
        
        processedCount++;
        
        // Call callback when all files are processed
        if (processedCount === filesToDelete.length) {
            console.log(`🗑️ Photo deletion complete: ${deletedCount}/${filesToDelete.length} files deleted`);
            callback(errorOccurred);
        }
    });
}

// Helper function to delete overlay files
function deleteOverlayFiles(overlay, callback) {
    const filesToDelete = [];
    
    if (overlay.desktop_filename) {
        const desktopFilename = path.basename(overlay.desktop_filename);
        const desktopFullPath = path.join(__dirname, '../assets/overlays/DesktopOverlay', desktopFilename);
        filesToDelete.push(desktopFullPath);
    }
    
    if (overlay.mobile_filename) {
        const mobileFilename = path.basename(overlay.mobile_filename);
        const mobileFullPath = path.join(__dirname, '../assets/overlays/MobileOverlay', mobileFilename);
        filesToDelete.push(mobileFullPath);
    }
    
    console.log('🗑️ Files to delete:', filesToDelete);
    
    let deletedCount = 0;
    let errorOccurred = null;
    
    if (filesToDelete.length === 0) {
        return callback(null);
    }
    
    filesToDelete.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log('✅ Deleted file:', filePath);
                deletedCount++;
            } catch (error) {
                console.error('❌ Error deleting file:', filePath, error);
                errorOccurred = error;
            }
        } else {
            console.log('⚠️ File not found, skipping:', filePath);
        }
    });
    
    console.log(`🗑️ Deleted ${deletedCount}/${filesToDelete.length} files`);
    callback(errorOccurred);
}

// Helper function to insert question options
function insertQuestionOptions(questionId, options, callback) {
    let inserted = 0;
    let errorOccurred = null;
    
    if (!options || options.length === 0) {
        return callback(null);
    }
    
    options.forEach(option => {
        const insertOptionQuery = `
            INSERT INTO question_options (question_id, option_label, display_order)
            VALUES (?, ?, ?)
        `;
        
        db.run(insertOptionQuery, [questionId, option.option_label, option.display_order || 0], function(err) {
            if (err) {
                console.error('❌ Error inserting option:', err);
                errorOccurred = err;
            } else {
                console.log(`✅ Option added for question ${questionId}`);
            }
            
            inserted++;
            
            if (inserted === options.length) {
                callback(errorOccurred);
            }
        });
    });
}

// Helper function to check if directory contains photos
function checkDirectoryForPhotos(dirPath) {
    try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        console.log(`🔍 Checking directory: ${dirPath}`);
        
        for (const item of items) {
            if (item.isDirectory()) {
                console.log(`📁 Subdirectory found: ${item.name}`);
                // Recursively check subdirectories
                const subDirPath = path.join(dirPath, item.name);
                if (checkDirectoryForPhotos(subDirPath)) {
                    return true;
                }
            } else if (item.isFile()) {
                // Check if it's an image file
                const ext = path.extname(item.name).toLowerCase();
                if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
                    console.log(`📸 Image file found: ${item.name} (${ext})`);
                    return true;
                } else {
                    console.log(`📄 Other file found: ${item.name} (${ext})`);
                }
            }
        }
        
        console.log(`📊 No image files found in ${dirPath}`);
        return false;
        
    } catch (error) {
        console.error('Error checking directory:', error);
        return false;
    }
}

// Helper function to create zip of uploads directory
async function createUploadsZip(uploadsPath) {
    const archiver = require('archiver');
    const { PassThrough } = require('stream');
    
    return new Promise((resolve, reject) => {
        console.log(`🗜️ Starting ZIP creation for: ${uploadsPath}`);
        
        // Create a buffer stream to collect the zip data
        const chunks = [];
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });
        
        const bufferStream = new PassThrough();
        
        // Track files added
        let filesAdded = 0;
        
        bufferStream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        
        bufferStream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            console.log(`✅ ZIP created: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB, ${filesAdded} files added`);
            resolve(buffer);
        });
        
        bufferStream.on('error', (err) => {
            console.error('❌ Buffer stream error:', err);
            reject(err);
        });
        
        // Pipe archive to buffer stream
        archive.pipe(bufferStream);
        
        // Handle archive events
        archive.on('entry', (entry) => {
            filesAdded++;
            console.log(`📄 Adding to ZIP: ${entry.name} (${entry.stats ? (entry.stats.size / 1024).toFixed(2) + ' KB' : 'size unknown'})`);
        });
        
        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.log('⚠️ Archive warning (file not found):', err.message);
            } else {
                console.log('⚠️ Archive warning:', err);
            }
        });
        
        archive.on('error', (err) => {
            console.error('❌ Archive error:', err);
            reject(err);
        });
        
        archive.on('progress', (progress) => {
            console.log(`📦 ZIP progress: ${progress.entries.processed} entries processed`);
        });
        
        try {
            // Add the entire uploads directory to the archive
            console.log(`🗜️ Adding directory to archive: ${uploadsPath}`);
            archive.directory(uploadsPath, false); // false = preserve relative paths
            
            // Add a readme file with information
            const readmeContent = `Uploads
                Generated: ${new Date().toISOString()}
                Source Directory: ${uploadsPath}

                Directory Structure:
                - uploads/photos/         - User selfies from feedback
                - uploads/processed/      - Photos with overlays applied

                Backup includes all files in the uploads directory.`;
            
            archive.append(readmeContent, { name: 'README.txt' });
            console.log('📄 Added README.txt to archive');
            
            // Finalize the archive
            archive.finalize();
            console.log('✅ Archive finalized');
            
        } catch (error) {
            console.error('❌ Error adding directory to archive:', error);
            reject(error);
        }
    });
}

// Helper function to get directory size
function getDirectorySize(dirPath) {
    try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        let totalSize = 0;
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item.name);
            
            if (item.isDirectory()) {
                totalSize += getDirectorySize(itemPath);
            } else if (item.isFile()) {
                const stats = fs.statSync(itemPath);
                totalSize += stats.size;
            }
        }
        
        if (totalSize < 1024) {
            return `${totalSize} bytes`;
        } else if (totalSize < 1024 * 1024) {
            return `${(totalSize / 1024).toFixed(2)} KB`;
        } else {
            return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
        }
    } catch (error) {
        console.error('Error getting directory size:', error);
        return 'Unknown size';
    }
}

// Helper function to convert data to CSV
function convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
        Object.values(row).map(field => 
            `"${String(field || '').replace(/"/g, '""')}"`
        ).join(',')
    );
    
    return [headers, ...rows].join('\n');
}

module.exports = router;