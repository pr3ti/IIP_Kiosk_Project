// ============================================================
// ADMINROUTES.JS - TABLE OF CONTENTS 
// ============================================================
// 
// 1. AUDIT LOGGING FUNCTIONS
//    function logAudit()              - Log admin actions to database with IP and user agent (DONE BY PRETI)
//
// 2. FILE UPLOAD CONFIGURATION
//    const storage = multer.diskStorage - Configure multer storage for overlay file uploads (DONE BY PRETI)
//    const upload = multer            - Handle PNG file uploads with validation (DONE BY PRETI)
//
// 3. AUTHENTICATION ROUTES
//    router.post('/login'             - Admin login with audit logging (DONE BY PRETI)
//    router.post('/logout-audit'      - Log admin logout with audit trail (DONE BY PRETI)
//
// 4. DASHBOARD ROUTES
//    router.get('/dashboard'          - Get dashboard statistics for last 1 month and recent activity (DONE BY PRETI)
//    router.get('/test-db'            - Test database connection and table counts (DONE BY PRETI)
//
// 5. FEEDBACK MANAGEMENT ROUTES
//    router.get('/feedback'           - Get all feedback with answers and pagination (DONE BY PRETI)
//    router.put('/feedback/:id'       - Update feedback entry with admin notes (DONE BY PRETI)
//    router.delete('/feedback/:id'    - Delete feedback with cascade and photo cleanup (DONE BY PRETI)
//    router.get('/feedback/:id/questions' - Get all feedback questions and answers (DONE BY PRETI)
// 
// 6. ARCHIVE MANAGEMENT ROUTES
//    router.get('/archive'            - Get archived feedback (older than 3 months) (DONE BY PRETI)
//    router.post('/archive/update-status' - Manually trigger archive status update (DONE BY PRETI)
//    router.get('/archive/stats'      - Archive Statistics [CHECK IF ITS NEEDED] (DONE BY PRETI)
//    router.post('/bulk-decrypt-archive' - Bulk decrypt archived emails with admin verification (DONE BY PRETI)
//    router.post('/download-archive-photos' - Download archived photos as ZIP (DONE BY PRETI)
//    router.get('/download-file/:filename' - Serve downloaded files from temp directory (DONE BY PRETI)
// 
// 7. ARCHIVE DELETION ROUTES (System Admin Only)
//    router.post('/archive/preview-deletion' - Preview deletion count before executing (System Admin only) (DONE BY PRETI)
//    router.post('/archive/delete-selected' - Permanently delete selected archived feedback (System Admin only) (DONE BY PRETI)
//    router.post('/archive/delete-by-date' - Permanently delete archived feedback by date range (System Admin only) (DONE BY PRETI)
// 
// 8. PHOTO ACCESS & EMAIL DECRYPTION ROUTES
//    router.post('/verify-photo-access' - Verify system admin password for photo access (DONE BY PRETI)
//    router.post('/decrypt-email'     - Decrypt email with system admin verification (DONE BY PRETI)
//
// 9. ADMIN USER MANAGEMENT ROUTES 
//    router.get('/users'              - Get all ACTIVE admin users (excludes soft-deleted) (DONE BY PRETI)
//    router.get('/users/deleted'      - Get all DELETED admin users (soft-deleted only) (DONE BY PRETI)
//    router.post('/users')            - Add new admin user with password hashing and full_name (DONE BY PRETI)
//    router.delete('/users/:id'       - Soft delete admin user (mark as deleted) (DONE BY PRETI)
//    router.post('/users/:id/restore' - Restore soft-deleted admin user (DONE BY PRETI)
//    router.delete('/users/:id/permanent' - Permanently delete soft-deleted user from database (DONE BY PRETI)
//    router.put('/users/:id'          - Update admin user details with validation (DONE BY PRETI)
//
// 10. DATA EXPORT MANAGEMENT ROUTES
//    router.post('/data-export/unlock' - Unlock data export with password verification (System Admin only) (DONE BY PRETI)
//
// 11. EXPORT/IMPORT ROUTES
//     router.get('/download-excel'    - Download feedback as CSV with decrypted emails (DONE BY PRETI)
//     router.get('/download-archive-excel' - Download archived feedback as CSV with decryption (DONE BY PRETI)
//     router.get('/download-photos'   - Download photos as ZIP archive (DONE BY PRETI)
//
// 12. OVERLAY MANAGEMENT ROUTES
//     router.get('/overlays'          - Get all overlay themes with display order (DONE BY PRETI)
//     router.post('/overlays'         - Add new overlay with file uploads (System Admin only) (DONE BY PRETI)
//     router.delete('/overlays/:id'   - Delete overlay and associated image files (DONE BY PRETI)
//
// 13. QUESTION MANAGEMENT ROUTES
//     router.get('/questions'         - Get all active questions with options (DONE BY PRETI)
//     router.post('/questions'        - Add new question with multiple choice options (DONE BY PRETI)
//     router.delete('/questions/:id'  - Delete question with soft/hard delete based on answers (DONE BY PRETI)
//     router.put('/questions/:id'     - Update question safely without breaking answers (DONE BY PRETI)
//
// 14. AUDIT LOGS ROUTES
//     router.get('/audit-logs'        - Get audit log entries with pagination (DONE BY PRETI)
//
// 15. HELPER FUNCTIONS
//     function deleteUserPhotos()     - Delete user photo files from filesystem (DONE BY PRETI)
//     function deleteOverlayFiles()   - Delete overlay image files from assets directory (DONE BY PRETI)
//     function checkDirectoryForPhotos() - Check if directory contains image files (DONE BY PRETI)
//     function createUploadsZip()     - Create ZIP archive of uploads directory (DONE BY PRETI)
//     function convertToCSV()         - Convert data array to CSV format (DONE BY PRETI)
//
// 16. SAVED THEMES ROUTES
//     router.get('/saved-themes'      - Get all saved themes for the current logged-in user (DONE BY PRETI)
//     router.post('/saved-themes'     - Save a new theme for the current user (DONE BY PRETI)
//     router.put('/saved-themes/:id/activate' - Set a saved theme as the active theme (DONE BY PRETI)
//     router.post('/saved-themes/deactivate-all' - Deactivate all themes for current user (DONE BY PRETI)
//     router.put('/saved-themes/:id'  - Update a saved theme (rename only) (DONE BY PRETI)
//     router.delete('/saved-themes/:id' - Delete a saved theme (DONE BY PRETI)
//     router.get('/saved-themes/active' - Get the currently active theme for the logged-in user (DONE BY PRETI)
//
// 17. VIP MANAGEMENT ROUTES
//     router.get('/vips'                - Get VIP list by status (active / deleted) with table check (DONE BY ZAH)
//     router.post('/vips'               - Add new VIP name (duplicate-safe, case-insensitive) (DONE BY ZAH)
//     router.patch('/vips/:id/delete'   - Soft delete VIP (mark is_deleted = 1) (DONE BY ZAH)
//     router.patch('/vips/:id/restore'  - Restore deleted VIP (mark is_deleted = 0) (DONE BY ZAH)

const express = require('express');
const router = express.Router();
const auth = require('./auth');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const emailService = require('./emailService');
const emailConfigStore = require('./emailConfigStore');


// ==================== 1. AUDIT LOGGING FUNCTIONS ====================

function logAudit(action, adminUsername, targetType = null, targetId = null, req = null) {
    // Only log important actions - customize this list as needed
    const importantActions = [
        'LOGIN', 'LOGOUT', 
        'DELETE_FEEDBACK', 'DELETE_USER', 'DELETE_OVERLAY', 'DELETE_QUESTION',
        'DELETE_ARCHIVE_SELECTED', 'DELETE_ARCHIVE_BY_DATE', 'DELETE_ARCHIVE_FAILED', 'DELETE_ARCHIVE_BY_DATE_FAILED',
        'ADD_USER', 'EDIT_USER',
        'ADD_OVERLAY', 
        'DOWNLOAD_EXCEL', 'DOWNLOAD_PHOTOS',
        'VIEW_ENCRYPTED_EMAIL',
        'SAVE_THEME', 'ACTIVATE_THEME', 'UPDATE_THEME', 'DELETE_THEME' 
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

// ==================== 2. FILE UPLOAD CONFIGURATION ====================

// Configure multer for file uploads
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

// ==================== 3. AUTHENTICATION ROUTES ====================

// In /login endpoint, replace or modify:
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    auth.loginUser(username, password, (err, user) => {
        if (err) {
            logAudit('LOGIN_FAILED', username, null, null, req);
            return res.status(401).json({ error: err.message });
        }
        
        // Store user in session
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };
        
        logAudit('LOGIN', username, null, null, req);
        res.json({ 
            success: true, 
            user: user,
            message: 'Login successful'
        });
    });
});

// Endpoint for logout logging
router.post('/logout-audit', (req, res) => {
    const { username } = req.body;
    if (username) {
        logAudit('LOGOUT', username, null, null, req);
    }
    
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.json({ success: true });
    });
});

// ==================== 4. DASHBOARD ROUTES ====================

// Dashboard data endpoint - to show only last 1 month of data
router.get('/dashboard', (req, res) => {
    console.log('📊 Fetching dashboard data (current month only)...');
    
    // Calculate current month start and end dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const currentMonthStartISO = currentMonthStart.toISOString();
    const currentMonthEndISO = currentMonthEnd.toISOString();
    
    // Get total visitors count (current month only)
    const totalVisitorsQuery = 'SELECT COUNT(*) as count FROM users WHERE last_visit >= ? AND last_visit <= ?';
    
    // Get today's visitors count
    const today = new Date().toISOString().split('T')[0];
    const todaysVisitorsQuery = 'SELECT COUNT(*) as count FROM users WHERE DATE(last_visit) = ?';
    
    // Get total feedback submissions (current month only)
    const feedbackSubmissionsQuery = 'SELECT COUNT(*) as count FROM feedback WHERE is_active = 1 AND created_at >= ? AND created_at <= ?';
    
    // Get users with email (current month only)
    const usersWithEmailQuery = 'SELECT COUNT(*) as count FROM users WHERE email_encrypted IS NOT NULL AND email_encrypted != "" AND last_visit >= ? AND last_visit <= ?';
    
    // Get recent submissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSubmissionsQuery = 'SELECT COUNT(*) as count FROM feedback WHERE created_at >= ? AND is_active = 1';

    // Execute all queries
    db.get(totalVisitorsQuery, [currentMonthStartISO, currentMonthEndISO], (err, totalVisitors) => {
        if (err) {
            console.error('❌ Error fetching total visitors:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        db.get(todaysVisitorsQuery, [today], (err, todaysVisitors) => {
            if (err) {
                console.error('❌ Error fetching today\'s visitors:', err);
                todaysVisitors = { count: 0 };
            }
            
            db.get(feedbackSubmissionsQuery, [currentMonthStartISO, currentMonthEndISO], (err, feedbackSubmissions) => {
                if (err) {
                    console.error('❌ Error fetching feedback submissions:', err);
                    feedbackSubmissions = { count: 0 };
                }
                
                db.get(usersWithEmailQuery, [currentMonthStartISO, currentMonthEndISO], (err, usersWithEmail) => {
                    if (err) {
                        console.error('❌ Error fetching users with email:', err);
                        usersWithEmail = { count: 0 };
                    }
                    
                    db.get(recentSubmissionsQuery, [sevenDaysAgo.toISOString()], (err, recentSubmissions) => {
                        if (err) {
                            console.error('❌ Error fetching recent submissions:', err);
                            recentSubmissions = { count: 0 };
                        }
                        
                        // Compile stats (current month only)
                        const stats = {
                            totalVisitors: totalVisitors?.count || 0,
                            todaysVisitors: todaysVisitors?.count || 0,
                            feedbackSubmissions: feedbackSubmissions?.count || 0,
                            usersWithEmail: usersWithEmail?.count || 0,
                            recentSubmissions: recentSubmissions?.count || 0
                        };
                        
                        console.log(`📊 Dashboard stats (${currentMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}):`, stats);
                        
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
        users_today: 'SELECT COUNT(*) as count FROM users WHERE DATE(last_visit) = CURDATE()'
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

// ==================== 5. FEEDBACK MANAGEMENT ROUTES ====================

// Get all feedback data - UPDATED with pagination (25 items per page)
router.get('/feedback', (req, res) => {
    console.log('🔍 Fetching ALL feedback data (pagination handled by frontend)...');
    
    // Get ALL feedback data (no LIMIT/OFFSET - frontend handles pagination like archive page)
    const query = `
        SELECT 
            f.id,
            u.name,
            u.email_encrypted,
            u.visit_count as visits,
            f.comment as pledge,
            f.data_retention,
            f.photo_path,
            f.processed_photo_path,
            f.created_at as date,
            f.admin_notes
        FROM feedback f
        JOIN users u ON f.user_id = u.id
        WHERE f.is_active = 1 AND f.archive_status = 'not_archived'
        ORDER BY f.created_at DESC
    `;
    
    db.all(query, [], (err, feedbackRows) => {
        if (err) {
            console.error('❌ Error fetching feedback data:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Database error: ' + err.message 
            });
        }
        
        // Now get question answers for each feedback
        const feedbackWithAnswers = [];
        let processed = 0;
        
        if (feedbackRows.length === 0) {
            console.log('✅ No feedback data found');
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
    const { comment, admin_notes } = req.body;  // Keep comment for pledge
    const query = 'UPDATE feedback SET comment = ?, admin_notes = ? WHERE id = ?';
    db.run(query, [comment, admin_notes, id], function(err) {
        if (err) {
            console.error('❌ Error updating feedback:', err);
            return res.status(500).json({ error: 'Failed to update feedback' });
        }
        
        res.json({ 
            success: true, 
            message: 'Feedback updated successfully',
            changes: this.changes 
        });
    });
});

// Delete feedback - with photo deletion and proper cascade
router.delete('/feedback/:id', async (req, res) => {
    const { id } = req.params;
    const username = req.headers['x-username'] || 'systemadmin';
    
    console.log('🗑️ Delete feedback request from:', username);
    
    // Get user role from database
    const getUserRoleQuery = 'SELECT role FROM admin_users WHERE username = ? AND is_active = 1';
    
    db.get(getUserRoleQuery, [username], (err, user) => {
        if (err) {
            console.error('❌ Error fetching user role:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user) {
            console.error('❌ User not found or inactive:', username);
            return res.status(401).json({ error: 'User not authorized' });
        }
        
        console.log('👤 User role:', user.role);
        
        // IT_staff CANNOT delete feedback
        if (user.role === 'IT_staff') {
            console.error('🚫 IT_staff user attempted to delete feedback:', username);
            logAudit('DELETE_FEEDBACK_DENIED', username, 'feedback', id, req);
            return res.status(403).json({ 
                success: false,
                error: 'Access Denied: IT Staff cannot delete feedback data.',
                role: user.role,
                hint: 'Only IT Admin and System Admin can delete feedback.'
            });
        }
        
        // IT_admin and system_admin CAN delete
        if (user.role !== 'IT_admin' && user.role !== 'system_admin') {
            console.error('❌ Unauthorized role attempted to delete:', user.role);
            logAudit('DELETE_FEEDBACK_DENIED', username, 'feedback', id, req);
            return res.status(403).json({ 
                success: false,
                error: 'Insufficient permissions to delete feedback.',
                role: user.role
            });
        }
        
        // Log the deletion attempt
        logAudit('DELETE_FEEDBACK', username, 'feedback', id, req);
        console.log('✅ Authorized deletion by:', username, '(', user.role, ')');
    
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
    }); // Close db.get callback
});

// Get question answers for specific feedback
router.get('/feedback/:id/questions', (req, res) => {
    const { id } = req.params;
    
    console.log(`📋 Fetching question answers for feedback ID: ${id}`);
    
    const query = `
        SELECT 
            fa.id,
            fa.question_id,
            fa.answer_value,
            fa.created_at,
            q.question_text,
            q.question_type,
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
    
    db.all(query, [id], (err, answers) => {
        if (err) {
            console.error('❌ Error fetching question answers:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Database error: ' + err.message 
            });
        }
        
        console.log(`✅ Found ${answers.length} answers for feedback ${id}`);
        
        res.json({
            success: true,
            answers: answers || []
        });
    });
});

// ==================== 6. ARCHIVE MANAGEMENT ROUTES ====================

// Get archived feedback (older than 3 months)
router.get('/archive', (req, res) => {
    console.log('📂 Fetching archived feedback data...');
    
    const query = `
        SELECT 
            f.id,
            u.name,
            u.email_encrypted,
            u.visit_count as visits,
            f.comment as pledge,
            f.data_retention,
            f.photo_path,
            f.processed_photo_path,
            f.created_at as date
        FROM feedback f
        JOIN users u ON f.user_id = u.id
        WHERE f.is_active = 1 AND f.archive_status = 'archived'
        ORDER BY f.created_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching archived feedback:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Database error: ' + err.message 
            });
        }
        
        console.log(`📂 Found ${rows.length} archived feedback entries`);
        res.json({
            success: true,
            feedback: rows
        });
    });
});

// Manually trigger archive status update
router.post('/archive/update-status', (req, res) => {
    console.log('⚡ Manually updating archive status...');
    
    // Call the MySQL stored procedure
    db.query('CALL update_archive_status()', [], (err) => {
        if (err) {
            console.error('❌ Error calling archive update procedure:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to update archive status: ' + err.message
            });
        }
        
        // Get counts after update
        const archivedCountQuery = 'SELECT COUNT(*) as count FROM feedback WHERE archive_status = "archived" AND is_active = 1';
        const activeCountQuery = 'SELECT COUNT(*) as count FROM feedback WHERE archive_status = "not_archived" AND is_active = 1';
        
        db.get(archivedCountQuery, [], (err, archivedResult) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to get archived count' 
                });
            }
            
            db.get(activeCountQuery, [], (err, activeResult) => {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Failed to get active count' 
                    });
                }
                
                console.log(`✅ Archive update complete - Archived: ${archivedResult.count}, Active: ${activeResult.count}`);
                res.json({
                    success: true,
                    archived: archivedResult.count,
                    active: activeResult.count
                });
            });
        });
    });
});

// Get archive statistics
router.get('/archive/stats', async (req, res) => {
    try {
        const [archivedCount] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM feedback 
            WHERE archive_status = 'archived' AND is_active = 1
        `);

        const [oldestArchived] = await pool.query(`
            SELECT MIN(created_at) as oldest_date 
            FROM feedback 
            WHERE archive_status = 'archived' AND is_active = 1
        `);

        res.json({
            success: true,
            total_archived: archivedCount[0].count,
            oldest_date: oldestArchived[0].oldest_date
        });
    } catch (error) {
        console.error('Error fetching archive stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch archive statistics'
        });
    }
});

// Bulk Decrypt Archive Emails
router.post('/bulk-decrypt-archive', async (req, res) => {
    try {
        const { username, password, emails } = req.body;
        
        if (!username || !password || !emails) {
            return res.json({ success: false, message: 'Missing required fields' });
        }
        
        // Verify admin password
        const [adminUsers] = await db.query(
            'SELECT * FROM admin_users WHERE username = ? AND is_active = 1',
            [username]
        );
        
        if (adminUsers.length === 0) {
            // Log failed attempt
            await db.query(
                'INSERT INTO audit_logs (action, admin_username, target_type, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
                ['ARCHIVE_BULK_DECRYPT_FAILED', username, 'archive_emails', req.ip, req.get('user-agent')]
            );
            
            return res.json({ success: false, message: 'User not found' });
        }
        
        const user = adminUsers[0];
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!passwordMatch) {
            // Log failed attempt
            await db.query(
                'INSERT INTO audit_logs (action, admin_username, target_type, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
                ['ARCHIVE_BULK_DECRYPT_FAILED', username, 'archive_emails', req.ip, req.get('user-agent')]
            );
            
            return res.json({ success: false, message: 'Invalid password' });
        }
        
        // Decrypt emails
        const decryptedEmails = {};
        
        for (const item of emails) {
            if (item.email_encrypted && item.email_encrypted.includes(':')) {
                try {
                    const decrypted = decryptEmail(item.email_encrypted);
                    if (decrypted) {
                        decryptedEmails[item.id] = decrypted;
                    }
                } catch (error) {
                    console.error(`Error decrypting email for ID ${item.id}:`, error);
                }
            }
        }
        
        // Log successful decryption
        await db.query(
            'INSERT INTO audit_logs (action, admin_username, target_type, target_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
            ['ARCHIVE_BULK_DECRYPT', username, 'archive_emails', Object.keys(decryptedEmails).length, req.ip, req.get('user-agent')]
        );
        
        res.json({
            success: true,
            decryptedEmails: decryptedEmails
        });
        
    } catch (error) {
        console.error('Error in bulk decrypt archive:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during decryption'
        });
    }
});

// Download Archive Photos (ZIP)
router.post('/download-archive-photos', async (req, res) => {
    try {
        const { username, feedbackIds } = req.body;
        
        if (!username || !feedbackIds || !Array.isArray(feedbackIds)) {
            return res.json({ success: false, message: 'Missing required fields' });
        }
        
        // Get photos for archived feedback
        const placeholders = feedbackIds.map(() => '?').join(',');
        const [feedbackData] = await db.query(
            `SELECT id, photo_path, processed_photo_path 
             FROM feedback 
             WHERE id IN (${placeholders}) AND archive_status = 'archived'`,
            feedbackIds
        );
        
        if (feedbackData.length === 0) {
            return res.json({ success: false, message: 'No photos found in archived feedback' });
        }
        
        // Collect all photo paths
        const photoPaths = [];
        for (const item of feedbackData) {
            if (item.photo_path) {
                photoPaths.push({
                    id: item.id,
                    type: 'raw',
                    path: path.join(__dirname, '..', 'uploads', item.photo_path)
                });
            }
            if (item.processed_photo_path) {
                photoPaths.push({
                    id: item.id,
                    type: 'processed',
                    path: path.join(__dirname, '..', 'uploads', item.processed_photo_path)
                });
            }
        }
        
        if (photoPaths.length === 0) {
            return res.json({ success: false, message: 'No photo files found' });
        }
        
        // Create ZIP file
        const zipFilename = `archived_photos_${Date.now()}.zip`;
        const zipPath = path.join(__dirname, '..', 'uploads', 'temp', zipFilename);
        
        // Ensure temp directory exists
        const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });
        
        output.on('close', async () => {
            // Log the download
            await db.query(
                'INSERT INTO audit_logs (action, admin_username, target_type, target_id, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
                ['ARCHIVE_PHOTOS_DOWNLOAD', username, 'archive_photos', photoPaths.length, req.ip, req.get('user-agent')]
            );
            
            res.json({
                success: true,
                zipPath: zipFilename,
                photoCount: photoPaths.length
            });
        });
        
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            res.status(500).json({
                success: false,
                message: 'Error creating ZIP file'
            });
        });
        
        archive.pipe(output);
        
        // Add photos to archive
        for (const photo of photoPaths) {
            if (fs.existsSync(photo.path)) {
                const filename = `feedback_${photo.id}_${photo.type}_${path.basename(photo.path)}`;
                archive.file(photo.path, { name: filename });
            }
        }
        
        archive.finalize();
        
    } catch (error) {
        console.error('Error downloading archive photos:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Download file (for ZIP downloads)
router.get('/download-file/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '..', 'uploads', 'temp', filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).send('File not found');
        }
        
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
            }
            
            // Delete temp file after download
            setTimeout(() => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }, 60000); // Delete after 1 minute
        });
        
    } catch (error) {
        console.error('Error in download-file:', error);
        res.status(500).send('Server error');
    }
});

// ==================== 7. ARCHIVE DELETION ROUTES (System Admin Only) ====================


// Preview deletion count before executing
// POST /api/admin/archive/preview-deletion
router.post('/archive/preview-deletion', auth.requireAuth, (req, res) => {
    const { feedbackIds, dateRange } = req.body;
    const userRole = req.session.user.role;
    
    // Only system_admin can delete
    if (userRole !== 'system_admin') {
        return res.status(403).json({
            success: false,
            error: 'Only System Administrators can delete archived data'
        });
    }
    
    let query;
    let params;
    
    if (feedbackIds && feedbackIds.length > 0) {
        // Preview for selected IDs
        const placeholders = feedbackIds.map(() => '?').join(',');
        query = `
            SELECT COUNT(*) as count
            FROM feedback
            WHERE id IN (${placeholders}) 
            AND archive_status = 'archived'
            AND is_active = 1
        `;
        params = feedbackIds;
    } else if (dateRange && dateRange.before) {
        // Preview for date range
        query = `
            SELECT COUNT(*) as count
            FROM feedback
            WHERE archive_status = 'archived'
            AND is_active = 1
            AND created_at < ?
        `;
        params = [dateRange.before];
    } else {
        return res.status(400).json({
            success: false,
            error: 'Either feedbackIds or dateRange must be provided'
        });
    }
    
    db.get(query, params, (err, result) => {
        if (err) {
            console.error('❌ Error previewing deletion:', err);
            return res.status(500).json({
                success: false,
                error: 'Database error: ' + err.message
            });
        }
        
        res.json({
            success: true,
            count: result.count
        });
    });
});


// Delete selected archived feedback (HARD DELETE)
// POST /api/admin/archive/delete-selected
router.post('/archive/delete-selected', auth.requireAuth, (req, res) => {
    const { feedbackIds, password } = req.body;
    const username = req.session.user.username;
    const userRole = req.session.user.role;
    
    // Only system_admin can delete
    if (userRole !== 'system_admin') {
        return res.status(403).json({
            success: false,
            error: 'Only System Administrators can delete archived data'
        });
    }
    
    // Validate inputs
    if (!feedbackIds || !Array.isArray(feedbackIds) || feedbackIds.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'No feedback IDs provided'
        });
    }
    
    if (!password) {
        return res.status(400).json({
            success: false,
            error: 'Password verification required'
        });
    }
    
    // Verify admin password
    auth.loginUser(username, password, (authErr, user) => {
        if (authErr) {
            // Log failed attempt
            logAudit('DELETE_ARCHIVE_FAILED', username, 'archived_feedback', null, req);
            return res.status(401).json({
                success: false,
                error: 'Invalid password'
            });
        }
        
        // Get feedback data before deletion (for photo cleanup and logging)
        const placeholders = feedbackIds.map(() => '?').join(',');
        const selectQuery = `
            SELECT f.id, f.user_id, f.photo_path, f.processed_photo_path, u.name, f.created_at
            FROM feedback f
            JOIN users u ON f.user_id = u.id
            WHERE f.id IN (${placeholders})
            AND f.archive_status = 'archived'
            AND f.is_active = 1
        `;
        
        db.all(selectQuery, feedbackIds, (selectErr, feedbackData) => {
            if (selectErr) {
                console.error('❌ Error fetching feedback for deletion:', selectErr);
                return res.status(500).json({
                    success: false,
                    error: 'Database error: ' + selectErr.message
                });
            }
            
            if (feedbackData.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No archived feedback found with the provided IDs'
                });
            }
            
            // Delete photos from filesystem
            feedbackData.forEach(feedback => {
                if (feedback.photo_path) {
                    const photoPath = path.join(__dirname, '..', 'uploads', feedback.photo_path);
                    if (fs.existsSync(photoPath)) {
                        try {
                            fs.unlinkSync(photoPath);
                            console.log(`🗑️ Deleted photo: ${feedback.photo_path}`);
                        } catch (err) {
                            console.error(`❌ Error deleting photo ${feedback.photo_path}:`, err);
                        }
                    }
                }
                
                if (feedback.processed_photo_path) {
                    const processedPath = path.join(__dirname, '..', 'uploads', feedback.processed_photo_path);
                    if (fs.existsSync(processedPath)) {
                        try {
                            fs.unlinkSync(processedPath);
                            console.log(`🗑️ Deleted processed photo: ${feedback.processed_photo_path}`);
                        } catch (err) {
                            console.error(`❌ Error deleting processed photo ${feedback.processed_photo_path}:`, err);
                        }
                    }
                }
            });
            
            // Hard delete feedback (CASCADE will delete feedback_answers)
            const deleteQuery = `
                DELETE FROM feedback
                WHERE id IN (${placeholders})
                AND archive_status = 'archived'
            `;
            
            db.run(deleteQuery, feedbackIds, function(deleteErr) {
                if (deleteErr) {
                    console.error('❌ Error deleting feedback:', deleteErr);
                    return res.status(500).json({
                        success: false,
                        error: 'Database error: ' + deleteErr.message
                    });
                }
                
                const deletedCount = this.changes;
                
                // Check for orphaned users and delete them
                const userIds = [...new Set(feedbackData.map(f => f.user_id))];
                const checkOrphanQuery = `
                    SELECT id FROM users
                    WHERE id IN (${userIds.map(() => '?').join(',')})
                    AND NOT EXISTS (
                        SELECT 1 FROM feedback WHERE user_id = users.id AND is_active = 1
                    )
                `;
                
                db.all(checkOrphanQuery, userIds, (orphanErr, orphanUsers) => {
                    if (!orphanErr && orphanUsers && orphanUsers.length > 0) {
                        const orphanIds = orphanUsers.map(u => u.id);
                        const deleteUsersQuery = `DELETE FROM users WHERE id IN (${orphanIds.map(() => '?').join(',')})`;
                        
                        db.run(deleteUsersQuery, orphanIds, (userDeleteErr) => {
                            if (!userDeleteErr) {
                                console.log(`🗑️ Deleted ${orphanIds.length} orphaned user(s)`);
                            }
                        });
                    }
                });
                
                // Log deletion
                logAudit('DELETE_ARCHIVE_SELECTED', username, 'archived_feedback', deletedCount, req);
                
                console.log(`✅ Successfully deleted ${deletedCount} archived feedback entries`);
                res.json({
                    success: true,
                    deletedCount: deletedCount,
                    message: `Successfully deleted ${deletedCount} archived feedback ${deletedCount === 1 ? 'entry' : 'entries'}`
                });
            });
        });
    });
});

// Delete archived feedback by date range (HARD DELETE)
// POST /api/admin/archive/delete-by-date
router.post('/archive/delete-by-date', auth.requireAuth, (req, res) => {
    const { beforeDate, password } = req.body;
    const username = req.session.user.username;
    const userRole = req.session.user.role;
    
    // Only system_admin can delete
    if (userRole !== 'system_admin') {
        return res.status(403).json({
            success: false,
            error: 'Only System Administrators can delete archived data'
        });
    }
    
    // Validate inputs
    if (!beforeDate) {
        return res.status(400).json({
            success: false,
            error: 'Date parameter required'
        });
    }
    
    if (!password) {
        return res.status(400).json({
            success: false,
            error: 'Password verification required'
        });
    }
    
    // Verify admin password
    auth.loginUser(username, password, (authErr, user) => {
        if (authErr) {
            // Log failed attempt
            logAudit('DELETE_ARCHIVE_BY_DATE_FAILED', username, 'archived_feedback', null, req);
            return res.status(401).json({
                success: false,
                error: 'Invalid password'
            });
        }
        
        // Get feedback data before deletion (for photo cleanup)
        const selectQuery = `
            SELECT f.id, f.user_id, f.photo_path, f.processed_photo_path, u.name, f.created_at
            FROM feedback f
            JOIN users u ON f.user_id = u.id
            WHERE f.archive_status = 'archived'
            AND f.is_active = 1
            AND f.created_at < ?
        `;
        
        db.all(selectQuery, [beforeDate], (selectErr, feedbackData) => {
            if (selectErr) {
                console.error('❌ Error fetching feedback for deletion:', selectErr);
                return res.status(500).json({
                    success: false,
                    error: 'Database error: ' + selectErr.message
                });
            }
            
            if (feedbackData.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No archived feedback found before the specified date'
                });
            }
            
            // Delete photos from filesystem
            let photosDeleted = 0;
            feedbackData.forEach(feedback => {
                if (feedback.photo_path) {
                    const photoPath = path.join(__dirname, '..', 'uploads', feedback.photo_path);
                    if (fs.existsSync(photoPath)) {
                        try {
                            fs.unlinkSync(photoPath);
                            photosDeleted++;
                            console.log(`🗑️ Deleted photo: ${feedback.photo_path}`);
                        } catch (err) {
                            console.error(`❌ Error deleting photo ${feedback.photo_path}:`, err);
                        }
                    }
                }
                
                if (feedback.processed_photo_path) {
                    const processedPath = path.join(__dirname, '..', 'uploads', feedback.processed_photo_path);
                    if (fs.existsSync(processedPath)) {
                        try {
                            fs.unlinkSync(processedPath);
                            photosDeleted++;
                            console.log(`🗑️ Deleted processed photo: ${feedback.processed_photo_path}`);
                        } catch (err) {
                            console.error(`❌ Error deleting processed photo ${feedback.processed_photo_path}:`, err);
                        }
                    }
                }
            });
            
            // Hard delete feedback
            const deleteQuery = `
                DELETE FROM feedback
                WHERE archive_status = 'archived'
                AND created_at < ?
            `;
            
            db.run(deleteQuery, [beforeDate], function(deleteErr) {
                if (deleteErr) {
                    console.error('❌ Error deleting feedback:', deleteErr);
                    return res.status(500).json({
                        success: false,
                        error: 'Database error: ' + deleteErr.message
                    });
                }
                
                const deletedCount = this.changes;
                
                // Check for orphaned users and delete them
                const userIds = [...new Set(feedbackData.map(f => f.user_id))];
                const checkOrphanQuery = `
                    SELECT id FROM users
                    WHERE id IN (${userIds.map(() => '?').join(',')})
                    AND NOT EXISTS (
                        SELECT 1 FROM feedback WHERE user_id = users.id AND is_active = 1
                    )
                `;
                
                db.all(checkOrphanQuery, userIds, (orphanErr, orphanUsers) => {
                    if (!orphanErr && orphanUsers && orphanUsers.length > 0) {
                        const orphanIds = orphanUsers.map(u => u.id);
                        const deleteUsersQuery = `DELETE FROM users WHERE id IN (${orphanIds.map(() => '?').join(',')})`;
                        
                        db.run(deleteUsersQuery, orphanIds, (userDeleteErr) => {
                            if (!userDeleteErr) {
                                console.log(`🗑️ Deleted ${orphanIds.length} orphaned user(s)`);
                            }
                        });
                    }
                });
                
                // Log deletion
                logAudit('DELETE_ARCHIVE_BY_DATE', username, 'archived_feedback', deletedCount, req);
                
                console.log(`✅ Successfully deleted ${deletedCount} archived feedback entries before ${beforeDate}`);
                console.log(`🗑️ Total photos deleted: ${photosDeleted}`);
                
                res.json({
                    success: true,
                    deletedCount: deletedCount,
                    photosDeleted: photosDeleted,
                    message: `Successfully deleted ${deletedCount} archived feedback ${deletedCount === 1 ? 'entry' : 'entries'}`
                });
            });
        });
    });
});

// ==================== 8. PHOTO ACCESS & EMAIL DECRYPTION ROUTES ====================

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

// POST /decrypt-email - Decrypt email (System Admin only)
router.post('/decrypt-email', (req, res) => {
    const { feedbackId, password, username: bodyUsername } = req.body;
    
    // Get username from body OR header (frontend sends it in header as 'x-username')
    const username = bodyUsername || req.headers['x-username'];
    
    if (!feedbackId) {
        return res.status(400).json({ error: 'Feedback ID required' });
    }
    
    if (!username) {
        return res.status(400).json({ error: 'Username not found. Please login again.' });
    }
    
    if (!password) {
        return res.status(400).json({ error: 'Password required' });
    }
    
    console.log('🔍 Debug - Decrypt email request:', { feedbackId, username });
    
    // Verify the user's password first
    auth.loginUser(username, password, (err, user) => {
        if (err) {
            console.error('❌ Password verification failed:', err);
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        console.log('👤 User authenticated, role:', user.role);
        
        // ONLY system_admin can decrypt emails
        if (user.role !== 'system_admin') {
            console.error('🚫 Non-admin user attempted to decrypt email:', username, '(', user.role, ')');
            logAudit('DECRYPT_EMAIL_DENIED', username, 'feedback', feedbackId, req);
            return res.status(403).json({ 
                success: false,
                error: 'Access Denied: Email decryption is only available to System Administrators.',
                role: user.role,
                hint: 'Only System Admins can decrypt emails.'
            });
        }
        
        console.log('✅ User authorized as system admin');
        
        // Get the encrypted email from database
        const query = `
            SELECT u.email_encrypted, u.id as user_id
            FROM feedback f 
            JOIN users u ON f.user_id = u.id 
            WHERE f.id = ?
        `;
        
    db.get(query, [feedbackId], (err, row) => {
            if (err) {
                console.error('❌ Error fetching encrypted email:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            console.log('🔍 Database query result:', row ? 'Found' : 'Not found');
            
            if (!row) {
                return res.status(404).json({ error: 'Feedback entry not found' });
            }
            
            if (!row.email_encrypted) {
                return res.status(404).json({ 
                    error: 'No encrypted email found for this feedback',
                    hint: 'The user may not have provided an email address'
                });
            }
            
            // Verify email is actually encrypted (should contain colons for iv:authTag:data)
            if (!row.email_encrypted.includes(':')) {
                console.error('⚠️ Email appears to be plain text, not encrypted');
                return res.status(500).json({ 
                    error: 'Email is not properly encrypted',
                    hint: 'Database migration may be required'
                });
            }
            
            // Decrypt the email using AES-256-GCM
            try {
                const decryptedEmail = auth.decryptEmail(row.email_encrypted);
                
                // Log the decryption action for audit
                logAudit('VIEW_ENCRYPTED_EMAIL', username, 'feedback', feedbackId, req);
                
                console.log('✅ Email decrypted successfully');
                
                res.json({
                    success: true,
                    decryptedEmail: decryptedEmail,
                    message: 'Email decrypted successfully'
                });
            } catch (decryptError) {
                console.error('❌ Email decryption failed:', decryptError);
                return res.status(500).json({ 
                    error: 'Failed to decrypt email',
                    details: 'The email may not be properly encrypted or the encryption key may be incorrect'
                });
            }
        });
    });
});

// ==================== 9. ADMIN USER MANAGEMENT ROUTES  ====================

// Get all ACTIVE admin users (excludes soft-deleted users)
router.get('/users', (req, res) => {
    console.log('👥 Fetching active admin users...');
    
    // First check if admin_users table exists
    const tableCheckQuery = `SELECT TABLE_NAME AS name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'admin_users'`;
    
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
        
        // SOFT DELETE: Only get users where is_deleted = 0 (active users)
        const query = `
            SELECT 
                id,
                username,
                full_name,
                role,
                is_active,
                created_at,
                last_login
            FROM admin_users 
            WHERE is_deleted = 0
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
            
            console.log(`✅ Found ${rows.length} active admin users`);
            
            // Ensure each user has required fields
            const users = rows.map(user => ({
                id: user.id,
                username: user.username || 'Unknown',
                full_name: user.full_name || user.username || 'Unknown',
                role: user.role || 'IT_staff',
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

// Get all DELETED admin users (soft-deleted only)
router.get('/users/deleted', (req, res) => {
    console.log('🗑️ Fetching deleted admin users...');
    
    // SOFT DELETE: Only get users where is_deleted = 1 (deleted users)
    const query = `
        SELECT 
            id,
            username,
            full_name,
            role,
            is_active,
            created_at,
            last_login,
            is_deleted,
            deleted_at,
            deleted_by
        FROM admin_users 
        WHERE is_deleted = 1
        ORDER BY deleted_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching deleted users:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Database error: ' + err.message 
            });
        }
        
        console.log(`✅ Found ${rows.length} deleted users`);
        
        const users = rows.map(user => ({
            id: user.id,
            username: user.username || 'Unknown',
            full_name: user.full_name || user.username || 'Unknown',
            role: user.role || 'IT_staff',
            department: 'IT',
            is_active: user.is_active !== undefined ? user.is_active : 1,
            created_at: user.created_at,
            last_login: user.last_login,
            is_deleted: user.is_deleted,
            deleted_at: user.deleted_at,
            deleted_by: user.deleted_by
        }));
        
        res.json({
            success: true,
            users: users,
            count: users.length
        });
    });
});

// Add new admin user to save full_name
router.post('/users', async (req, res) => {
    const { username, full_name, role, password } = req.body;
    const currentUsername = req.headers['x-username'] || 'systemadmin';
    
    logAudit('ADD_USER', currentUsername, 'user', null, req);

    console.log('➕ Adding new user:', { username, full_name, role, currentUsername });
    
    // First, check if current user is system admin
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1 AND is_deleted = 0';
    
    db.get(checkUserQuery, [currentUsername], async (err, currentUser) => {
        if (err) {
            console.error('❌ Error checking current user:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!currentUser || currentUser.role !== 'system_admin') {
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        // Validate input
        if (!username || !full_name || !password || !role) {
            return res.status(400).json({ error: 'Username, full name, password and role are required' });
        }
        
        const validRoles = ['system_admin', 'IT_admin', 'IT_staff'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Allowed roles: system_admin, IT_admin, IT_staff' });
        }
        
        // Check if username already exists (including soft-deleted users)
        const checkUsernameQuery = 'SELECT id, is_deleted FROM admin_users WHERE username = ?';
        
        db.get(checkUsernameQuery, [username], async (err, existingUser) => {
            if (err) {
                console.error('❌ Error checking username:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            if (existingUser) {
                if (existingUser.is_deleted === 1) {
                    return res.status(400).json({ error: 'Username exists in deleted users. Please permanently delete it first or restore it.' });
                } else {
                    return res.status(400).json({ error: 'Username already exists' });
                }
            }
            
            // Hash the password
            try {
                const hashedPassword = await auth.hashPassword(password);
                
                // Insert new user WITH full_name
                const insertQuery = `
                    INSERT INTO admin_users (username, full_name, password_hash, role, created_at, is_active, is_deleted)
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 1, 0)
                `;
                
                db.run(insertQuery, [username, full_name, hashedPassword, role], function(err) {
                    if (err) {
                        console.error('❌ Error inserting user:', err);
                        return res.status(500).json({ error: 'Database error: ' + err.message });
                    }
                    
                    console.log(`✅ New user added with ID: ${this.lastID}`);
                    
                    // Get the newly created user
                    const getUserQuery = 'SELECT id, username, full_name, role, created_at, is_active FROM admin_users WHERE id = ?';
                    
                    db.get(getUserQuery, [this.lastID], (err, newUser) => {
                        if (err) {
                            console.error('❌ Error fetching new user:', err);
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
                                full_name: newUser.full_name,
                                role: newUser.role,
                                is_active: newUser.is_active,
                                created_at: newUser.created_at
                            }
                        });
                    });
                });
            } catch (hashErr) {
                console.error('❌ Error hashing password:', hashErr);
                return res.status(500).json({ error: 'Failed to hash password' });
            }
        });
    });
});

// Delete admin user - SOFT DELETE (mark as deleted but keep in database)
router.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const username = req.headers['x-username'] || 'systemadmin';
    
    logAudit('DELETE_USER', username, 'user', id, req);
    
    console.log('🗑️ Attempting to SOFT DELETE user ID:', id, 'by:', username);
    
    // Check if current user is system admin
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1 AND is_deleted = 0';
    
    db.get(checkUserQuery, [username], (err, currentUser) => {
        if (err) {
            console.error('❌ Error checking current user:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!currentUser || currentUser.role !== 'system_admin') {
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        // Get target user info
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
            
            // Prevent deleting the root 'systemadmin' account
            if (targetUser.username === 'systemadmin') {
                return res.status(403).json({ error: 'Cannot delete the root systemadmin account' });
            }
            
            // SOFT DELETE - Update is_deleted flag instead of removing from database
            const deleteQuery = 'UPDATE admin_users SET is_deleted = 1, deleted_at = NOW(), deleted_by = ? WHERE id = ?';
            
            db.run(deleteQuery, [username, id], function(err) {
                if (err) {
                    console.error('❌ Error soft-deleting user:', err);
                    return res.status(500).json({ error: 'Database error: ' + err.message });
                }
                
                console.log('✅ User SOFT DELETED (marked as deleted):', { 
                    changes: this.changes,
                    id,
                    username: targetUser.username 
                });
                
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'User not found or already deleted' });
                }
                
                res.json({ 
                    success: true, 
                    message: 'User moved to deleted users (can be restored)',
                    deletedUser: {
                        id: targetUser.id,
                        username: targetUser.username,
                        role: targetUser.role
                    },
                    changes: this.changes 
                });
            });
        });
    });
});

// Restore deleted admin user (undo soft delete)
router.post('/users/:id/restore', (req, res) => {
    const { id } = req.params;
    const username = req.headers['x-username'] || 'systemadmin';
    
    logAudit('RESTORE_USER', username, 'user', id, req);
    
    console.log('🔄 Attempting to RESTORE user ID:', id, 'by:', username);
    
    // Check if current user is system admin
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1 AND is_deleted = 0';
    
    db.get(checkUserQuery, [username], (err, currentUser) => {
        if (err) {
            console.error('❌ Error checking current user:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!currentUser || currentUser.role !== 'system_admin') {
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        // Restore the user (clear soft delete flags)
        const restoreQuery = 'UPDATE admin_users SET is_deleted = 0, deleted_at = NULL, deleted_by = NULL WHERE id = ?';
        
        db.run(restoreQuery, [id], function(err) {
            if (err) {
                console.error('❌ Error restoring user:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found or already restored' });
            }
            
            console.log('✅ User RESTORED successfully:', { 
                userId: id,
                restoredBy: username,
                changes: this.changes 
            });
            
            res.json({ 
                success: true, 
                message: 'User restored successfully',
                changes: this.changes
            });
        });
    });
});

// Permanently delete a user (hard delete - only for soft-deleted users)
router.delete('/users/:id/permanent', (req, res) => {
    const { id } = req.params;
    const username = req.headers['x-username'] || 'systemadmin';
    
    logAudit('PERMANENT_DELETE_USER', username, 'user', id, req);
    
    console.log('🗑️ Attempting to PERMANENTLY DELETE user ID:', id, 'by:', username);
    
    // Check if current user is system admin
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1 AND is_deleted = 0';
    
    db.get(checkUserQuery, [username], (err, currentUser) => {
        if (err) {
            console.error('❌ Error checking current user:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!currentUser || currentUser.role !== 'system_admin') {
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        // Check if user is already soft-deleted
        const checkDeletedQuery = 'SELECT * FROM admin_users WHERE id = ? AND is_deleted = 1';
        
        db.get(checkDeletedQuery, [id], (err, deletedUser) => {
            if (err) {
                console.error('❌ Error checking deleted user:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            if (!deletedUser) {
                return res.status(400).json({ error: 'User must be soft-deleted first before permanent deletion' });
            }
            
            // Prevent deleting root account
            if (deletedUser.username === 'systemadmin') {
                return res.status(403).json({ error: 'Cannot permanently delete the root systemadmin account' });
            }
            
            // Permanently delete the user from database
            const permanentDeleteQuery = 'DELETE FROM admin_users WHERE id = ? AND is_deleted = 1';
            
            db.run(permanentDeleteQuery, [id], function(err) {
                if (err) {
                    console.error('❌ Error permanently deleting user:', err);
                    return res.status(500).json({ error: 'Database error: ' + err.message });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'User not found or not deleted' });
                }
                
                console.log('✅ User PERMANENTLY DELETED:', { 
                    userId: id,
                    username: deletedUser.username,
                    deletedBy: username,
                    changes: this.changes 
                });
                
                res.json({ 
                    success: true, 
                    message: 'User permanently deleted from database',
                    username: deletedUser.username,
                    changes: this.changes
                });
            });
        });
    });
});

// Update admin user and handle full_name
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, full_name, role, password } = req.body;
    const currentUsername = req.headers['x-username'] || 'systemadmin';
    logAudit('EDIT_USER', username, 'user', id, req);
    
    console.log('✏️ Updating admin user:', { id, username, full_name, role, currentUsername });
    
    // Check if current user is system admin
    const checkUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1 AND is_deleted = 0';
    
    db.get(checkUserQuery, [currentUsername], async (err, currentUser) => {
        if (err) {
            console.error('❌ Error checking current user:', err);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        if (!currentUser || currentUser.role !== 'system_admin') {
            return res.status(403).json({ error: 'Insufficient permissions. System Admin required.' });
        }
        
        // Get the target user
        const getTargetUserQuery = 'SELECT * FROM admin_users WHERE id = ?';
        
        db.get(getTargetUserQuery, [id], async (err, targetUser) => {
            if (err) {
                console.error('❌ Error fetching target user:', err);
                return res.status(500).json({ error: 'Database error: ' + err.message });
            }
            
            if (!targetUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Prevent modifying the root 'systemadmin' account
            if (targetUser.username === 'systemadmin' && targetUser.username !== currentUsername) {
                return res.status(403).json({ error: 'Cannot modify the root systemadmin account' });
            }
            
            if (role && !['system_admin', 'IT_admin', 'IT_staff'].includes(role)) {
                return res.status(400).json({ error: 'Invalid role. Allowed roles: system_admin, IT_admin, IT_staff' });
            }
            
            // Check if username already exists (for other users)
            if (username !== targetUser.username) {
                const checkUsernameQuery = 'SELECT id FROM admin_users WHERE username = ? AND id != ?';
                db.get(checkUsernameQuery, [username, id], async (err, existingUser) => {
                    if (err) {
                        console.error('❌ Error checking username:', err);
                        return res.status(500).json({ error: 'Database error: ' + err.message });
                    }
                    
                    if (existingUser) {
                        return res.status(400).json({ error: 'Username already exists' });
                    }
                    
                    await performUserUpdate();
                });
            } else {
                await performUserUpdate();
            }
            
            async function performUserUpdate() {
                // Build update query based on provided fields
                let updateQuery = 'UPDATE admin_users SET ';
                const updateParams = [];
                const updateFields = [];
                
                if (username !== targetUser.username) {
                    updateFields.push('username = ?');
                    updateParams.push(username);
                }
                
                if (full_name !== undefined) {
                    updateFields.push('full_name = ?');
                    updateParams.push(full_name);
                }
                
                if (role !== undefined) {
                    updateFields.push('role = ?');
                    updateParams.push(role);
                }
                
                if (password && password.trim() !== '') {
                    try {
                        const hashedPassword = await auth.hashPassword(password);
                        updateFields.push('password_hash = ?');
                        updateParams.push(hashedPassword);
                    } catch (hashErr) {
                        console.error('❌ Error hashing password:', hashErr);
                        return res.status(500).json({ error: 'Failed to hash password' });
                    }
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
                                full_name: updatedUser.full_name,
                                role: updatedUser.role
                            }
                        });
                    });
                });
            }
        });
    });
});

// ==================== 10. DATA EXPORT MANAGEMENT ROUTES ====================

// Unlock data export with password verification (System Admin only)
router.post('/data-export/unlock', (req, res) => {
    const { username, password } = req.body;
    
    console.log('🔓 Data export unlock attempt:', { username });
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false,
            error: 'Username and password required' 
        });
    }
    
    // First, get the user from database to check role
    const getUserQuery = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1';
    
    db.get(getUserQuery, [username], async (err, dbUser) => {
        if (err) {
            console.error('❌ Database error during unlock:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Server error' 
            });
        }
        
        if (!dbUser) {
            console.error('❌ Data export unlock failed - user not found');
            return res.status(401).json({ 
                success: false,
                error: 'Invalid credentials' 
            });
        }
        
        // Check if user has system_admin role BEFORE password verification
        if (dbUser.role !== 'system_admin') {
            console.error('❌ Data export unlock failed - insufficient permissions:', dbUser.role);
            return res.status(403).json({ 
                success: false,
                error: 'Access denied. System Administrator privileges required.' 
            });
        }
        
        // Now verify the password using bcrypt
        try {
            const bcrypt = require('bcrypt');
            const passwordMatch = await bcrypt.compare(password, dbUser.password_hash);
            
            if (!passwordMatch) {
                console.error('❌ Data export unlock failed - invalid password');
                return res.status(401).json({ 
                    success: false,
                    error: 'Invalid password' 
                });
            }
            
            // Log the successful unlock
            logAudit('DATA_EXPORT_UNLOCK', username, null, null, req);
            
            // Set session flags for data export unlock
            req.session.data_export_unlocked = true;
            req.session.data_export_unlock_time = new Date().toISOString();
            
            // Explicitly save session before responding
            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error('❌ Failed to save session:', saveErr);
                    return res.status(500).json({ 
                        success: false,
                        error: 'Failed to save session' 
                    });
                }
                
                console.log('✅ Data export unlocked for system admin:', username);
                console.log('✅ Session saved successfully');
                
                res.json({
                    success: true,
                    message: 'Data export unlocked',
                    expiresIn: 30,
                    user: {
                        username: dbUser.username,
                        role: dbUser.role
                    }
                });
            });
            
        } catch (bcryptError) {
            console.error('❌ Error verifying password:', bcryptError);
            res.status(500).json({ 
                success: false,
                error: 'Server error during authentication' 
            });
        }
    });
});

// ==================== 11. EXPORT/IMPORT ROUTES ====================

// Excel download endpoint with email decryption
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
        
        // Get all feedback data for Excel (excluding archived)
        const query = `
            SELECT 
                f.id,
                u.name,
                u.email_encrypted,
                u.visit_count as visits,
                f.comment as feedback,
                f.data_retention,
                f.photo_path,
                f.processed_photo_path,
                f.created_at as date,
                f.admin_notes
            FROM feedback f
            JOIN users u ON f.user_id = u.id
            WHERE f.is_active = 1 AND f.archive_status = 'not_archived'
            ORDER BY f.created_at DESC
        `;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('❌ Error fetching data for Excel:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            console.log(`📊 Processing ${rows.length} feedback records for Excel download...`);
            
            // Decrypt emails before converting to CSV
            const decryptedRows = rows.map(row => {
                let decryptedEmail = '';
                
                // Try to decrypt email if it exists
                if (row.email_encrypted) {
                    try {
                        decryptedEmail = auth.decryptEmail(row.email_encrypted);
                        console.log(`✅ Decrypted email for user: ${row.name}`);
                    } catch (error) {
                        console.error(`❌ Failed to decrypt email for user ${row.name}:`, error.message);
                        decryptedEmail = '[Decryption Failed]';
                    }
                }
                
                // Return row with decrypted email
                return {
                    ...row,
                    email_encrypted: decryptedEmail,
                    email: decryptedEmail
                };
            });
            
            console.log(`✅ Decrypted ${decryptedRows.filter(r => r.email).length} emails`);
            
            // Convert to CSV with decrypted emails
            const csvData = convertToCSV(decryptedRows.map(row => ({
                ID: row.id,
                Name: row.name || '',
                Email: row.email || '',
                Visits: row.visits || 0,
                Rating: row.rating || '',
                Feedback: row.feedback || '',
                'Data Retention (Days)': row.data_retention || 'Forever',
                'Photo Path': row.photo_path || '',
                'Processed Photo Path': row.processed_photo_path || '',
                Date: row.date,
                'Admin Notes': row.admin_notes || ''
            })));
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=feedback_data.csv');
            res.send(csvData);
            
            console.log(`✅ Excel download complete: ${decryptedRows.length} records sent`);
        });
    });
});

// Archive Excel download endpoint with email decryption
router.get('/download-archive-excel', (req, res) => {
    const { password } = req.query;
    const username = req.headers['x-username'] || 'systemadmin';
    logAudit('DOWNLOAD_ARCHIVE_EXCEL', username, null, null, req);
    
    if (!password) {
        return res.status(400).json({ error: 'Password required' });
    }
    
    // Verify the user's password and role
    auth.loginUser(username, password, (err, user) => {
        if (err || user.role !== 'system_admin') {
            return res.status(401).json({ error: 'Invalid password or insufficient permissions' });
        }
        
        // Get all archived feedback data
        const query = `
            SELECT 
                f.id,
                u.name,
                u.email_encrypted,
                u.visit_count as visits,
                f.comment as feedback,
                f.data_retention,
                f.photo_path,
                f.processed_photo_path,
                f.created_at as date,
                f.admin_notes,
                f.archive_status
            FROM feedback f
            JOIN users u ON f.user_id = u.id
            WHERE f.is_active = 1 AND f.archive_status = 'archived'
            ORDER BY f.created_at DESC
        `;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('❌ Error fetching archived data for Excel:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            console.log(`📊 Processing ${rows.length} archived feedback records for Excel download...`);
            
            // Decrypt emails before converting to CSV
            const decryptedRows = rows.map(row => {
                let decryptedEmail = '';
                
                // Try to decrypt email if it exists
                if (row.email_encrypted) {
                    try {
                        decryptedEmail = auth.decryptEmail(row.email_encrypted);
                        console.log(`✅ Decrypted email for archived user: ${row.name}`);
                    } catch (error) {
                        console.error(`❌ Failed to decrypt email for user ${row.name}:`, error.message);
                        decryptedEmail = '[Decryption Failed]';
                    }
                }
                
                // Return row with decrypted email
                return {
                    ...row,
                    email_encrypted: decryptedEmail,
                    email: decryptedEmail
                };
            });
            
            console.log(`✅ Decrypted ${decryptedRows.filter(r => r.email).length} emails from archive`);
            
            // Convert to CSV with decrypted emails
            const csvData = convertToCSV(decryptedRows.map(row => ({
                ID: row.id,
                Name: row.name || '',
                Email: row.email || '',
                Visits: row.visits || 0,
                Rating: row.rating || '',
                Feedback: row.feedback || '',
                'Data Retention (Days)': row.data_retention || 'Forever',
                'Photo Path': row.photo_path || '',
                'Processed Photo Path': row.processed_photo_path || '',
                Date: row.date,
                'Admin Notes': row.admin_notes || '',
                'Archive Status': row.archive_status || 'archived'
            })));
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=archived_feedback_data.csv');
            res.send(csvData);
            
            console.log(`✅ Archive Excel download complete: ${decryptedRows.length} records sent`);
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
        
        const uploadsPath = path.join(__dirname, '../uploads');
        
        console.log(`🔍 Looking for uploads at: ${uploadsPath}`);
        console.log(`🔍 Current directory: ${__dirname}`);
        console.log(`🔍 Resolved absolute path: ${path.resolve(uploadsPath)}`);
        
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
        console.error('❌ Error downloading photos:', error);
        res.status(500).json({ error: 'Error creating zip file: ' + error.message });
    }
});

// ==================== 12. OVERLAY MANAGEMENT ROUTES ====================

// Overlay list route
router.get('/overlays', (req, res) => {
    console.log('🎨 Fetching overlay data...');
    
    // First, check if the overlays table exists
    const tableCheckQuery = `
        SELECT TABLE_NAME AS name
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = 'overlays'
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

// Overlay addition endpoint
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
        const tableCheckQuery = `SELECT TABLE_NAME AS name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'overlays'`;
        
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

// Delete overlay endpoint
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

// ==================== 13. QUESTION MANAGEMENT ROUTES ====================

// Get all active questions with their options
router.get('/questions', (req, res) => {
    console.log('❓ Fetching questions data...');
    
    // First check if questions table exists
    const tableCheckQuery = `SELECT TABLE_NAME AS name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'questions'`;
    
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
            
            if (questions.length === 0) {
                return res.json({
                    success: true,
                    questions: []
                });
            }
            
            // Use Map to preserve order during async processing
            const questionsMap = new Map();
            let processed = 0;
            
            questions.forEach((question, index) => {
                // Initialize ALL questions in order first
                questionsMap.set(index, {
                    ...question,
                    options: []
                });
                
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
                            // Keep empty options array on error
                        } else {
                            // preserves original order
                            questionsMap.get(index).options = options;
                        }
                        
                        processed++;
                        
                        // Check if all async operations are complete
                        if (processed === questions.length) {
                            // Convert Map to Array while preserving order
                            const questionsWithOptions = Array.from(questionsMap.values());
                            res.json({
                                success: true,
                                questions: questionsWithOptions
                            });
                        }
                    });
                } else {
                    // Not a choice question, no options needed
                    // Already initialized with empty options array
                    processed++;
                    
                    // Check if all async operations are complete
                    if (processed === questions.length) {
                        // Convert Map to Array while preserving order
                        const questionsWithOptions = Array.from(questionsMap.values());
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
        const validTypes = ['text', 'yesno', 'rating', 'choice'];
        if (!validTypes.includes(question_type)) {
            return res.status(400).json({ error: 'Invalid question type. Valid types are: text, yesno, rating, choice' });
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
        db.beginTransaction( function(err) {
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
                    return db.rollback( () => {
                        res.status(500).json({ error: 'Database error: ' + err.message });
                    });
                }
                
                const questionId = this.lastID;
                console.log(`✅ Question added with ID: ${questionId}`);
                
                // If it's a choice question, insert options
                if (question_type === 'choice' && options && options.length > 0) {
                    // Use the helper function to insert options
                    let optionsInserted = 0;
                    let optionsError = null;
                    
                    options.forEach((option, index) => {
                        const insertOptionQuery = `
                            INSERT INTO question_options (question_id, option_label, display_order)
                            VALUES (?, ?, ?)
                        `;
                        
                        db.run(insertOptionQuery, [
                            questionId, 
                            option.option_label, 
                            option.display_order || index
                        ], function(err) {
                            if (err) {
                                console.error('❌ Error inserting option:', err);
                                optionsError = err;
                            } else {
                                console.log(`✅ Option added for question ${questionId}: "${option.option_label}"`);
                            }
                            
                            optionsInserted++;
                            
                            if (optionsInserted === options.length) {
                                if (optionsError) {
                                    return db.rollback( () => {
                                        res.status(500).json({ error: 'Failed to add question options: ' + optionsError.message });
                                    });
                                }
                                
                                // Commit transaction
                                db.commit( (err) => {
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
                            }
                        });
                    });
                } else {
                    // Commit transaction (no options to insert for non-choice questions)
                    db.commit( (err) => {
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
                // Soft delete keep question for historical data
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
                // No answers safe to hard delete (question and options)
                db.beginTransaction( function(err) {
                    if (err) {
                        console.error('❌ Error starting transaction:', err);
                        return res.status(500).json({ error: 'Database error: ' + err.message });
                    }
                    
                    // First delete any options for this question
                    const deleteOptionsQuery = 'DELETE FROM question_options WHERE question_id = ?';
                    
                    db.run(deleteOptionsQuery, [id], function(err) {
                        if (err) {
                            console.error('❌ Error deleting question options:', err);
                            return db.rollback( () => {
                                res.status(500).json({ error: 'Database error: ' + err.message });
                            });
                        }
                        
                        console.log(`✅ Deleted options for question ID: ${id}`);
                        
                        // Now delete the question
                        const deleteQuestionQuery = 'DELETE FROM questions WHERE id = ?';
                        
                        db.run(deleteQuestionQuery, [id], function(err) {
                            if (err) {
                                console.error('❌ Error deleting question:', err);
                                return db.rollback( () => {
                                    res.status(500).json({ error: 'Database error: ' + err.message });
                                });
                            }
                            
                            // Commit transaction
                            db.commit( (err) => {
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

// ==================== 14. AUDIT LOGS ROUTES ====================

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
            console.error('❌ Error fetching audit logs:', err);
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

// ==================== 15. HELPER FUNCTIONS ====================

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

// Helper function to check if directory contains photos
function checkDirectoryForPhotos(dirPath) {
    try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        console.log(`🔍 Checking directory: ${dirPath}`);
        
        for (const item of items) {
            if (item.isDirectory()) {
                console.log(`📂 Subdirectory found: ${item.name}`);
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
        console.error('❌ Error checking directory:', error);
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
            console.log(`🗜️ Adding directory to archive: ${uploadsPath}`);
            archive.directory(uploadsPath, false); // false = preserve relative paths
            
            // Add a readme file with information
            const readmeContent = `Uploads Backup
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

// ==================== 16. SAVED THEMES ROUTES ====================


// GET /api/admin/saved-themes
// Get all saved themes for the current logged-in user
router.get('/saved-themes', auth.requireAuth, (req, res) => {
    const adminUserId = req.session.user.id;
    
    const query = `
        SELECT 
            id,
            theme_name,
            theme_data,
            is_active,
            created_at,
            updated_at
        FROM saved_themes
        WHERE admin_user_id = ?
        ORDER BY is_active DESC, created_at DESC
    `;
    
    db.all(query, [adminUserId], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching saved themes:', err);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to load saved themes' 
            });
        }
        
        // Parse JSON theme_data for each theme
        const themes = rows.map(row => ({
            ...row,
            theme_data: typeof row.theme_data === 'string' 
                ? JSON.parse(row.theme_data) 
                : row.theme_data
        }));
        
        console.log(`✅ Loaded ${themes.length} saved themes for user ${adminUserId}`);
        res.json({ success: true, themes });
    });
});


// POST /api/admin/saved-themes
// Save a new theme for the current user
// Limit: 6 themes per user

router.post('/saved-themes', auth.requireAuth, (req, res) => {
    const adminUserId = req.session.user.id;
    const { theme_name, theme_data, is_active } = req.body;
    
    // Validate required fields
    if (!theme_name || !theme_data) {
        return res.status(400).json({ 
            success: false, 
            error: 'Theme name and theme data are required' 
        });
    }
    
    // Check current theme count for this user
    const countQuery = 'SELECT COUNT(*) as count FROM saved_themes WHERE admin_user_id = ?';
    
    db.get(countQuery, [adminUserId], (err, row) => {
        if (err) {
            console.error('❌ Error checking theme count:', err);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to check theme count' 
            });
        }
        
        if (row.count >= 6) {
            return res.status(400).json({ 
                success: false, 
                error: 'Maximum of 6 saved themes reached. Please delete a theme before adding a new one.' 
            });
        }
        
        // If this theme should be active, deactivate all other themes for this user
        if (is_active) {
            const deactivateQuery = 'UPDATE saved_themes SET is_active = 0 WHERE admin_user_id = ?';
            db.run(deactivateQuery, [adminUserId], (deactivateErr) => {
                if (deactivateErr) {
                    console.error('❌ Error deactivating themes:', deactivateErr);
                }
            });
        }
        
        // Insert the new theme
        const insertQuery = `
            INSERT INTO saved_themes (admin_user_id, theme_name, theme_data, is_active)
            VALUES (?, ?, ?, ?)
        `;
        
        const themeDataJson = JSON.stringify(theme_data);
        
        db.run(insertQuery, [adminUserId, theme_name, themeDataJson, is_active ? 1 : 0], function(insertErr) {
            if (insertErr) {
                console.error('❌ Error saving theme:', insertErr);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to save theme' 
                });
            }
            
            console.log(`✅ Theme "${theme_name}" saved successfully for user ${adminUserId}`);
            
            // Log audit trail
            logAudit('SAVE_THEME', req.session.user.username, 'saved_themes', this.lastID, req);
            
            res.json({ 
                success: true, 
                message: 'Theme saved successfully',
                theme_id: this.lastID
            });
        });
    });
});


// PUT /api/admin/saved-themes/:id/activate
// Set a saved theme as the active theme
router.put('/saved-themes/:id/activate', auth.requireAuth, (req, res) => {
    const adminUserId = req.session.user.id;
    const themeId = req.params.id;
    
    // Verify the theme belongs to this user
    const verifyQuery = 'SELECT id FROM saved_themes WHERE id = ? AND admin_user_id = ?';
    
    db.get(verifyQuery, [themeId, adminUserId], (err, row) => {
        if (err) {
            console.error('❌ Error verifying theme ownership:', err);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to verify theme' 
            });
        }
        
        if (!row) {
            return res.status(404).json({ 
                success: false, 
                error: 'Theme not found or access denied' 
            });
        }
        
        // Deactivate all themes for this user
        const deactivateQuery = 'UPDATE saved_themes SET is_active = 0 WHERE admin_user_id = ?';
        
        db.run(deactivateQuery, [adminUserId], (deactivateErr) => {
            if (deactivateErr) {
                console.error('❌ Error deactivating themes:', deactivateErr);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to deactivate themes' 
                });
            }
            
            // Activate the selected theme
            const activateQuery = 'UPDATE saved_themes SET is_active = 1 WHERE id = ?';
            
            db.run(activateQuery, [themeId], (activateErr) => {
                if (activateErr) {
                    console.error('❌ Error activating theme:', activateErr);
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Failed to activate theme' 
                    });
                }
                
                console.log(`✅ Theme ${themeId} activated for user ${adminUserId}`);
                
                // Log audit trail
                logAudit('ACTIVATE_THEME', req.session.user.username, 'saved_themes', themeId, req);
                
                res.json({ 
                    success: true, 
                    message: 'Theme activated successfully' 
                });
            });
        });
    });
});


// POST /api/admin/saved-themes/deactivate-all
// Deactivate all themes for current user
router.post('/saved-themes/deactivate-all', auth.requireAuth, (req, res) => {
    const adminUserId = req.session.user.id;
    
    const query = 'UPDATE saved_themes SET is_active = 0 WHERE admin_user_id = ?';
    
    db.run(query, [adminUserId], function(err) {
        if (err) {
            console.error('❌ Error deactivating themes:', err);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to deactivate themes' 
            });
        }
        
        console.log(`✅ Deactivated all themes for user ${adminUserId}`);
        
        // Log audit trail
        logAudit('DEACTIVATE_ALL_THEMES', req.session.user.username, 'saved_themes', null, req);
        
        res.json({ 
            success: true, 
            message: 'All themes deactivated',
            deactivated: this.changes
        });
    });
});


// PUT /api/admin/saved-themes/:id
// Update a saved theme (rename only)
router.put('/saved-themes/:id', auth.requireAuth, (req, res) => {
    const adminUserId = req.session.user.id;
    const themeId = req.params.id;
    const { theme_name } = req.body;
    
    if (!theme_name) {
        return res.status(400).json({ 
            success: false, 
            error: 'Theme name is required' 
        });
    }
    
    // Verify the theme belongs to this user
    const verifyQuery = 'SELECT id FROM saved_themes WHERE id = ? AND admin_user_id = ?';
    
    db.get(verifyQuery, [themeId, adminUserId], (err, row) => {
        if (err) {
            console.error('❌ Error verifying theme ownership:', err);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to verify theme' 
            });
        }
        
        if (!row) {
            return res.status(404).json({ 
                success: false, 
                error: 'Theme not found or access denied' 
            });
        }
        
        // Update theme name
        const updateQuery = 'UPDATE saved_themes SET theme_name = ? WHERE id = ?';
        
        db.run(updateQuery, [theme_name, themeId], (updateErr) => {
            if (updateErr) {
                console.error('❌ Error updating theme:', updateErr);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to update theme' 
                });
            }
            
            console.log(`✅ Theme ${themeId} renamed to "${theme_name}"`);
            
            // Log audit trail
            logAudit('UPDATE_THEME', req.session.user.username, 'saved_themes', themeId, req);
            
            res.json({ 
                success: true, 
                message: 'Theme updated successfully' 
            });
        });
    });
});

// DELETE /api/admin/saved-themes/:id
// Delete a saved theme
router.delete('/saved-themes/:id', auth.requireAuth, (req, res) => {
    const adminUserId = req.session.user.id;
    const themeId = req.params.id;
    
    // Verify the theme belongs to this user
    const verifyQuery = 'SELECT id, theme_name FROM saved_themes WHERE id = ? AND admin_user_id = ?';
    
    db.get(verifyQuery, [themeId, adminUserId], (err, row) => {
        if (err) {
            console.error('❌ Error verifying theme ownership:', err);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to verify theme' 
            });
        }
        
        if (!row) {
            return res.status(404).json({ 
                success: false, 
                error: 'Theme not found or access denied' 
            });
        }
        
        // Delete the theme
        const deleteQuery = 'DELETE FROM saved_themes WHERE id = ?';
        
        db.run(deleteQuery, [themeId], function(deleteErr) {
            if (deleteErr) {
                console.error('❌ Error deleting theme:', deleteErr);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to delete theme' 
                });
            }
            
            console.log(`✅ Theme "${row.theme_name}" deleted successfully`);
            
            // Log audit trail
            logAudit('DELETE_THEME', req.session.user.username, 'saved_themes', themeId, req);
            
            res.json({ 
                success: true, 
                message: 'Theme deleted successfully' 
            });
        });
    });
});


// GET /api/admin/saved-themes/active
// Get the currently active theme for the logged-in user
router.get('/saved-themes/active', auth.requireAuth, (req, res) => {
    const adminUserId = req.session.user.id;
    
    const query = `
        SELECT 
            id,
            theme_name,
            theme_data,
            created_at,
            updated_at
        FROM saved_themes
        WHERE admin_user_id = ? AND is_active = 1
        LIMIT 1
    `;
    
    db.get(query, [adminUserId], (err, row) => {
        if (err) {
            console.error('❌ Error fetching active theme:', err);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to load active theme' 
            });
        }
        
        if (!row) {
            return res.json({ 
                success: true, 
                theme: null,
                message: 'No active theme set'
            });
        }
        
        // Parse JSON theme_data
        const theme = {
            ...row,
            theme_data: typeof row.theme_data === 'string' 
                ? JSON.parse(row.theme_data) 
                : row.theme_data
        };
        
        console.log(`✅ Active theme loaded for user ${adminUserId}`);
        res.json({ success: true, theme });
    });
});

// ==================== 17. VIP MANAGEMENT ROUTES (DONE BY ZAH) ====================

// Get VIP list (Active only)
// GET /vips
router.get('/vips', (req, res) => {
    console.log('👑 Fetching VIP list...');

    // Check if vip_management table exists
    const tableCheckQuery = `
        SELECT TABLE_NAME AS name
        FROM information_schema.tables
        WHERE table_schema = DATABASE() AND table_name = 'vip_management'
    `;

    db.get(tableCheckQuery, [], (err, table) => {
        if (err) {
            console.error('❌ Error checking vip_management table:', err);
            return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
        }

        if (!table) {
            console.log('❌ vip_management table does not exist');
            return res.status(404).json({ success: false, error: 'VIP table not found. Please run database setup.' });
        }

        const query = `
            SELECT id, name, created_at
            FROM vip_management
            ORDER BY created_at DESC
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('❌ Error fetching VIPs:', err);
                return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
            }

            console.log(`✅ Found ${rows.length} VIP records`);

            const vips = rows.map(vip => ({
                id: vip.id,
                name: vip.name || 'Unknown',
                createdAt: vip.created_at
            }));

            return res.json({ success: true, vips, count: vips.length });
        });
    });
});

// Add VIP
// POST /vips { name: "Zaheera" }
router.post('/vips', (req, res) => {
    console.log('➕ Adding VIP...');

    const name = (req.body.name || '').trim();
    if (!name || name.length < 2) {
        return res.status(400).json({ success: false, error: 'VIP name is required' });
    }

    // With your table design, duplicates are already prevented by UNIQUE(name_lower)
    const insertQuery = `
        INSERT INTO vip_management (name)
        VALUES (?)
    `;

    db.run(insertQuery, [name], function (err) {
        if (err) {
            // Duplicate VIP (case-insensitive) -> MySQL duplicate key error
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, error: 'VIP already exists' });
            }

            console.error('❌ Error adding VIP:', err);
            return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
        }

        console.log(`✅ VIP added with ID: ${this.lastID}`);

        return res.json({
            success: true,
            message: 'VIP added successfully',
            vip: {
                id: this.lastID,
                name,
                createdAt: new Date().toISOString()
            }
        });
    });
});


// ==================== 18. FORM UI CONFIGURATION ====================
// Read + write feedback form UI settings 

const FORM_UI_CONFIG_PATH = path.join(__dirname, 'config', 'form-ui.json');

// GET /api/admin/form-ui
// Load current form UI configuration
router.get('/form-ui', auth.requireAuth, (req, res) => {
  try {
    if (!fs.existsSync(FORM_UI_CONFIG_PATH)) {
      return res.json({
        background: '',
        landingTitle: '',
        landingSubtitle: ''
      });
    }

    const raw = fs.readFileSync(FORM_UI_CONFIG_PATH, 'utf8');
    const data = JSON.parse(raw);
    res.json(data);
  } catch (error) {
    console.error('❌ Error reading form-ui.json:', error);
    res.status(500).json({ success: false, error: 'Failed to load form UI config' });
  }
});

// PUT /api/admin/form-ui
// Save/update form UI configuration
router.put('/form-ui', auth.requireAuth, (req, res) => {
  try {
    const { background, landingTitle, landingSubtitle } = req.body;

    // Basic validation (keeps it safe + prevents weird payloads)
    if (typeof background !== 'string' || background.length > 300) {
      return res.status(400).json({ success: false, error: 'Invalid background value' });
    }
    if (typeof landingTitle !== 'string' || landingTitle.length > 100) {
      return res.status(400).json({ success: false, error: 'Invalid landing title' });
    }
    if (typeof landingSubtitle !== 'string' || landingSubtitle.length > 200) {
      return res.status(400).json({ success: false, error: 'Invalid landing subtitle' });
    }

    const payload = {
      background: background.trim(),
      landingTitle: landingTitle.trim(),
      landingSubtitle: landingSubtitle.trim()
    };

    // Ensure config folder exists
    const dir = path.dirname(FORM_UI_CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(FORM_UI_CONFIG_PATH, JSON.stringify(payload, null, 2), 'utf8');

    // Optional: audit log (uses your existing audit logger)
    if (req.session?.user?.username) {
      logAudit('FORM_UI_UPDATED', req.session.user.username, 'config', 'form-ui', req);
    }

    res.json({ success: true, message: 'Form UI settings saved' });
  } catch (error) {
    console.error('❌ Error writing form-ui.json:', error);
    res.status(500).json({ success: false, error: 'Failed to save form UI config' });
  }
});

// ==================== 19. EMAIL MANAGEMENT ====================
// Get/Update SMTP config (Gmail / Outlook / Custom) without restarting server

router.get('/email-config', auth.requireAuth, (req, res) => {
  try {
    // Optional: return safe config (no real passwords)
    const safe = emailConfigStore.getSafeEmailConfig
      ? emailConfigStore.getSafeEmailConfig()
      : emailConfigStore.getEmailConfig();

    res.json({ success: true, config: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/email-config', auth.requireAuth, async (req, res) => {
  try {
    const incoming = req.body || {};

    // If frontend sends masked password "********" or empty, keep existing password
    const existing = emailConfigStore.getEmailConfig();
    const merged = structuredClone(existing);

    merged.provider = incoming.provider ?? merged.provider;
    merged.senderEmail = incoming.senderEmail ?? merged.senderEmail;

    if (merged.provider === 'gmail') {
      merged.gmail.user = incoming.gmail?.user ?? merged.gmail.user;
      const pass = incoming.gmail?.pass;
      if (pass && pass !== '********') merged.gmail.pass = pass;
    }

    if (merged.provider === 'outlook') {
      merged.outlook.user = incoming.outlook?.user ?? merged.outlook.user;
      const pass = incoming.outlook?.pass;
      if (pass && pass !== '********') merged.outlook.pass = pass;
    }

    if (merged.provider === 'custom') {
      merged.custom.host = incoming.custom?.host ?? merged.custom.host;
      merged.custom.port = incoming.custom?.port ?? merged.custom.port;
      merged.custom.secure = incoming.custom?.secure ?? merged.custom.secure;
      merged.custom.user = incoming.custom?.user ?? merged.custom.user;

      const pass = incoming.custom?.pass;
      if (pass && pass !== '********') merged.custom.pass = pass;
    }

    emailConfigStore.saveEmailConfig(merged);

    if (emailService.reloadEmailService) {
      await emailService.reloadEmailService(); // no restart
    }

    res.json({ success: true, message: 'Email config saved and reloaded.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/email-config/test', auth.requireAuth, async (req, res) => {
  try {
    const to = req.body?.to;
    if (!to) return res.status(400).json({ success: false, error: 'Missing "to" email.' });

    await emailService.testEmailService(to);
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 20. TIMER COUNTDOWN MANAGEMENT ROUTES (DONE BY BERNISSA) ====================

 // GET /api/admin/countdown-management
 // Returns: { success: true, countdown_seconds: number }

router.get('/countdown-management', auth.requireAuth, (req, res) => {
    const sql = `
        SELECT countdown_seconds
        FROM countdown_management
        WHERE id = 1
        LIMIT 1
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error('❌ Error loading countdown:', err);
            return res.status(500).json({
                success: false,
                error: 'Database error'
            });
        }

        const seconds = rows?.[0]?.countdown_seconds;
        const safeSeconds =
            Number.isInteger(seconds) && seconds >= 0 ? seconds : 3;

        return res.json({
            success: true,
            countdown_seconds: safeSeconds
        });
    });
});

// PUT /api/admin/countdown-management

router.put('/countdown-management', auth.requireAuth, (req, res) => {
    console.log('🔄 PUT /countdown-management - Updating countdown');
    
    // Get username from session
    const username = req.session?.user?.username;
    const seconds = Number(req.body?.countdown_seconds);

    console.log('📝 Request details:', {
        username: username,
        countdown_seconds: seconds,
        body: req.body
    });

    // Validate input
    if (!Number.isInteger(seconds) || seconds < 0) {
        console.log('❌ Invalid input received:', seconds);
        return res.status(400).json({
            success: false,
            error: 'countdown_seconds must be a whole number (>= 0)'
        });
    }

    console.log('✅ Valid input received:', seconds, 'seconds by user:', username);

    const sql = `
        UPDATE countdown_management
        SET countdown_seconds = ?, updated_by = ?
        WHERE id = 1
    `;

    db.query(sql, [seconds, username], (err, result) => {
        if (err) {
            console.error('❌ Database error saving countdown:', err);
            return res.status(500).json({
                success: false,
                error: 'Database error: ' + err.message
            });
        }

        console.log('✅ Countdown updated successfully:', {
            seconds: seconds,
            username: username,
            affectedRows: result.affectedRows
        });

        return res.json({
            success: true,
            countdown_seconds: seconds,
            message: 'Countdown updated successfully'
        });
    });
});

// ==================== 21. SERVER SCHEDULE MANAGEMENT ROUTES (DONE BY BERNISSA) ====================

// SERVER SCHEDULE MANAGEMENT (Config File Based)

// Config file location (readable/ writable by both Node.js and the schedule runner)
const SCHEDULE_CONFIG_PATH = process.env.SCHEDULE_CONFIG_PATH || path.join(__dirname, 'kiosk-schedules.json');

// Helper: Read schedules from config file
function readSchedulesConfig() {
  try {
    if (!fs.existsSync(SCHEDULE_CONFIG_PATH)) {
      // Create empty config if doesn't exist
      const emptyConfig = { schedules: [], last_updated: new Date().toLocaleString('sv-SE') };
      fs.writeFileSync(SCHEDULE_CONFIG_PATH, JSON.stringify(emptyConfig, null, 2));
      return emptyConfig;
    }
    
    const data = fs.readFileSync(SCHEDULE_CONFIG_PATH, 'utf8');
    return JSON.parse(data);
    
  } catch (err) {
    console.error('❌ Error reading schedules config:', err);
    return { schedules: [], last_updated: null };
  }
}

// Helper: Write schedules to config file
function writeSchedulesConfig(config) {
  try {
    config.last_updated = new Date().toLocaleString('sv-SE');
    fs.writeFileSync(SCHEDULE_CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (err) {
    console.error('❌ Error writing schedules config:', err);
    return false;
  }
}

// GET /api/admin/server-schedules
// Fetch all schedules
router.get('/server-schedules', auth.requireAuth, (req, res) => {
  console.log('📅 Fetching server schedules...');
  
  try {
    const config = readSchedulesConfig();
    
    console.log(`✅ Loaded ${config.schedules.length} schedules`);
    res.json({ 
      success: true, 
      schedules: config.schedules 
    });
    
  } catch (err) {
    console.error('❌ Error fetching schedules:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load schedules' 
    });
  }
});

// POST /api/admin/server-schedules
// Add new schedule
router.post('/server-schedules', auth.requireAuth, (req, res) => {
  const {
    schedule_name,
    schedule_type,
    start_time,
    end_time,
    days_of_week,
    specific_date,
    is_active
  } = req.body;
  
  const username = req.session?.user?.username || 'unknown';
  
  console.log('➕ Adding new schedule:', { schedule_name, schedule_type, username });
  
  // Validation
  if (!schedule_name || !schedule_type || !start_time || !end_time) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: schedule_name, schedule_type, start_time, end_time'
    });
  }
  
  const validScheduleTypes = ['daily', 'weekly', 'specific_date'];
  if (!validScheduleTypes.includes(schedule_type)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid schedule type. Must be: daily, weekly, or specific_date'
    });
  }
  
  if (schedule_type === 'weekly' && (!days_of_week || days_of_week.trim() === '')) {
    return res.status(400).json({
      success: false,
      error: 'Days of week are required for weekly schedules'
    });
  }
  
  if (schedule_type === 'specific_date' && !specific_date) {
    return res.status(400).json({
      success: false,
      error: 'Specific date is required for specific_date schedules'
    });
  }
  
  try {
    const config = readSchedulesConfig();
    
    // Check for duplicate names
    const duplicate = config.schedules.find(s => s.schedule_name === schedule_name);
    if (duplicate) {
      return res.status(400).json({
        success: false,
        error: `Schedule with name "${schedule_name}" already exists`
      });
    }
    
    // Create new schedule
    const newSchedule = {
      id: Date.now(), // ID generation
      schedule_name,
      schedule_type,
      start_time,
      end_time,
      days_of_week: days_of_week || null,
      specific_date: specific_date || null,
      is_active: is_active !== false, // Default to true
      created_by: username,
      created_at: new Date().toLocaleString('sv-SE')
    };
    
    config.schedules.push(newSchedule);
    
    if (!writeSchedulesConfig(config)) {
      throw new Error('Failed to write config file');
    }
    
    console.log(`✅ Schedule "${schedule_name}" added successfully`);
    
    res.json({
      success: true,
      message: 'Schedule created successfully',
      schedule: newSchedule
    });
    
  } catch (err) {
    console.error('❌ Error adding schedule:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create schedule'
    });
  }
});

// PUT /api/admin/server-schedules/:id
// Update existing schedule
router.put('/server-schedules/:id', auth.requireAuth, (req, res) => {
  const scheduleId = parseInt(req.params.id);
  const {
    schedule_name,
    schedule_type,
    start_time,
    end_time,
    days_of_week,
    specific_date,
    is_active
  } = req.body;
  
  console.log(`✏️  Updating schedule ID ${scheduleId}`);
  
  try {
    const config = readSchedulesConfig();
    const scheduleIndex = config.schedules.findIndex(s => s.id === scheduleId);
    
    if (scheduleIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      });
    }
    
    // Update schedule
    config.schedules[scheduleIndex] = {
      ...config.schedules[scheduleIndex],
      schedule_name: schedule_name || config.schedules[scheduleIndex].schedule_name,
      schedule_type: schedule_type || config.schedules[scheduleIndex].schedule_type,
      start_time: start_time || config.schedules[scheduleIndex].start_time,
      end_time: end_time || config.schedules[scheduleIndex].end_time,
      days_of_week: days_of_week !== undefined ? days_of_week : config.schedules[scheduleIndex].days_of_week,
      specific_date: specific_date !== undefined ? specific_date : config.schedules[scheduleIndex].specific_date,
      is_active: is_active !== undefined ? is_active : config.schedules[scheduleIndex].is_active,
      updated_at: new Date().toLocaleString('sv-SE')
    };
    
    if (!writeSchedulesConfig(config)) {
      throw new Error('Failed to write config file');
    }
    
    console.log(`✅ Schedule updated successfully`);
    
    res.json({
      success: true,
      message: 'Schedule updated successfully',
      schedule: config.schedules[scheduleIndex]
    });
    
  } catch (err) {
    console.error('❌ Error updating schedule:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update schedule'
    });
  }
});

// DELETE /api/admin/server-schedules/:id
// Delete schedule
router.delete('/server-schedules/:id', auth.requireAuth, (req, res) => {
  const scheduleId = parseInt(req.params.id);
  
  console.log(`🗑️  Deleting schedule ID ${scheduleId}`);
  
  try {
    const config = readSchedulesConfig();
    const originalLength = config.schedules.length;
    
    config.schedules = config.schedules.filter(s => s.id !== scheduleId);
    
    if (config.schedules.length === originalLength) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      });
    }
    
    if (!writeSchedulesConfig(config)) {
      throw new Error('Failed to write config file');
    }
    
    console.log(`✅ Schedule deleted successfully`);
    
    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
    
  } catch (err) {
    console.error('❌ Error deleting schedule:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete schedule'
    });
  }
});

// PUT /api/admin/server-schedules/:id/toggle
// Toggle schedule active status
router.put('/server-schedules/:id/toggle', auth.requireAuth, (req, res) => {
  const scheduleId = parseInt(req.params.id);
  const { is_active } = req.body;
  
  console.log(`🔄 Toggling schedule ID ${scheduleId} to ${is_active}`);
  
  try {
    const config = readSchedulesConfig();
    const schedule = config.schedules.find(s => s.id === scheduleId);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule not found'
      });
    }
    
    // Update active status
    schedule.is_active = is_active;
    schedule.updated_at = new Date().toLocaleString('sv-SE')
    
    if (!writeSchedulesConfig(config)) {
      throw new Error('Failed to write config file');
    }
    
    const status = is_active ? 'enabled' : 'disabled';
    console.log(`✅ Schedule ${status} successfully`);
    
    res.json({
      success: true,
      message: `Schedule ${status} successfully`
    });
    
  } catch (err) {
    console.error('❌ Error toggling schedule:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle schedule'
    });
  }
});

// POST /api/admin/server-schedules/enable-all
// Enable all schedules
router.post('/server-schedules/enable-all', auth.requireAuth, (req, res) => {
  console.log('✅ Enabling all schedules');
  
  try {
    const config = readSchedulesConfig();
    
    config.schedules.forEach(schedule => {
      schedule.is_active = true;
    });
    
    if (!writeSchedulesConfig(config)) {
      throw new Error('Failed to write config file');
    }
    
    res.json({
      success: true,
      message: `Enabled ${config.schedules.length} schedule(s)`,
      enabled_count: config.schedules.length
    });
    
  } catch (err) {
    console.error('❌ Error enabling schedules:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to enable schedules'
    });
  }
});

// POST /api/admin/server-schedules/disable-all
// Disable all schedules
router.post('/server-schedules/disable-all', auth.requireAuth, (req, res) => {
  console.log('⏸️  Disabling all schedules');
  
  try {
    const config = readSchedulesConfig();
    
    config.schedules.forEach(schedule => {
      schedule.is_active = false;
    });
    
    if (!writeSchedulesConfig(config)) {
      throw new Error('Failed to write config file');
    }
    
    res.json({
      success: true,
      message: `Disabled ${config.schedules.length} schedule(s)`,
      disabled_count: config.schedules.length
    });
    
  } catch (err) {
    console.error('❌ Error disabling schedules:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to disable schedules'
    });
  }
});

// POST /api/admin/server/start
// Manually start the kiosk service
router.post('/server/start', auth.requireAuth, (req, res) => {
  const { exec } = require('child_process');
  
  console.log('▶️  Manual server start requested');
  
  exec('sudo systemctl start kiosk.service', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Failed to start server:', stderr);
      return res.status(500).json({
        success: false,
        error: 'Failed to start server'
      });
    }
    
    console.log('✅ Server started successfully');
    res.json({
      success: true,
      message: 'Server started successfully'
    });
  });
});

// POST /api/admin/server/stop
// Manually stop the kiosk service
router.post('/server/stop', auth.requireAuth, (req, res) => {
  const { exec } = require('child_process');
  
  console.log('⏹️  Manual server stop requested');
  
  exec('sudo systemctl stop kiosk.service', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Failed to stop server:', stderr);
      return res.status(500).json({
        success: false,
        error: 'Failed to stop server'
      });
    }
    
    console.log('✅ Server stopped successfully');
    res.json({
      success: true,
      message: 'Server stopped successfully'
    });
  });
});


module.exports = router;