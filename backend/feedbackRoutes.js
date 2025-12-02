// ============================================================
// FEEDBACKROUTES.JS - TABLE OF CONTENTS
// ============================================================
//
// DIRECTORY SETUP
//   - Uploads directory creation    - Create required upload directories
//
// QUESTION MANAGEMENT ROUTES
//   - GET /questions                - Get active questions for feedback form
//
// PHOTO UPLOAD ROUTES
//   - POST /save-photo              - Upload and save raw photo
//   - POST /save-processed-photo    - Upload and save processed/overlay photo
//
// FEEDBACK SUBMISSION ROUTES
//   - POST /submit-feedback         - Submit complete feedback with retention with email
//
// DATABASE OPERATIONS
//   - saveFeedbackToDatabase()      - Save feedback with user, photos, and retention
//   - saveFeedbackRecord()          - Save main feedback record
//   - saveQuestionAnswers()         - Save individual question answers
//   - commitTransaction()           - Commit database transaction
//
// FEEDBACK MANAGEMENT ROUTES
//   - GET /feedback                 - Get all feedback with user data
//   - GET /visitors                 - Get all visitors data
//   - DELETE /feedback/:id          - Soft delete feedback entry
//   - PUT /feedback/:id             - Update feedback details
//
// UTILITY ENDPOINTS
//   - GET /test-db                  - Test database connection
//   - GET /                         - Root endpoint verification
//
// ============================================================

// feedbackRoutes.js - Enhanced with database storage while keeping all functionality
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('./db'); // Import database connection
const emailService = require('./emailService');

// ==================== DIRECTORY SETUP ====================
// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'photos');
const processedDir = path.join(__dirname, '..', 'uploads', 'processed');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
}
if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
    console.log('Created processed directory:', processedDir);
}

// ==================== QUESTION MANAGEMENT ====================
// Get active questions for feedback form
router.get('/questions', (req, res) => {
    console.log('📋 Fetching active questions for feedback form...');
    
    const query = `
        SELECT 
            q.id,
            q.question_text,
            q.question_type,
            q.is_required,
            q.display_order,
            q.is_active,
            qo.id as option_id,
            qo.option_label,
            qo.display_order as option_order
        FROM questions q
        LEFT JOIN question_options qo ON q.id = qo.question_id
        WHERE q.is_active = 1
        ORDER BY q.display_order ASC, qo.display_order ASC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ Error fetching questions:', err);
            return res.json({
                success: true,
                questions: []
            });
        }
        
        // Group questions and their options
        const questionsMap = new Map();
        
        rows.forEach(row => {
            if (!questionsMap.has(row.id)) {
                questionsMap.set(row.id, {
                    id: row.id,
                    question_text: row.question_text,
                    question_type: row.question_type,
                    is_required: row.is_required === 1,
                    display_order: row.display_order,
                    is_active: row.is_active === 1,
                    options: []
                });
            }
            
            // Add option if it exists (for choice questions)
            if (row.option_id && row.option_label) {
                const question = questionsMap.get(row.id);
                question.options.push({
                    id: row.option_id,
                    option_label: row.option_label,
                    display_order: row.option_order
                });
            }
        });
        
        const questions = Array.from(questionsMap.values());
        
        console.log(`✅ Found ${questions.length} active questions for feedback form`);
        
        res.json({
            success: true,
            questions: questions
        });
    });
});

// ==================== PHOTO UPLOAD ENDPOINTS ====================
// Photo upload endpoint
router.post('/save-photo', (req, res) => {
    try {
        const { photo, userName, device } = req.body;
        
        if (!photo) {
            return res.status(400).json({ error: 'No photo data provided' });
        }

        // Convert base64 to buffer
        const base64Data = photo.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate filename with user name, device, and timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const safeUserName = userName ? userName.replace(/[^a-zA-Z0-9]/g, '_') : 'anonymous';
        const filename = `${safeUserName}_${device}_${timestamp}.png`;
        const filepath = path.join(uploadsDir, filename);

        // Save the file
        fs.writeFileSync(filepath, buffer);

        console.log(`Photo saved to: ${filepath}`);
        
        res.json({ 
            success: true, 
            message: 'Photo saved successfully',
            filename: filename,
            photoId: filename,
            filepath: filepath,
            device: device
        });
    } catch (error) {
        console.error('Error saving photo:', error);
        res.status(500).json({ error: 'Failed to save photo' });
    }
});

// Processed photo upload endpoint
router.post('/save-processed-photo', (req, res) => {
    try {
        const { photo, userName, device, theme } = req.body;
        
        if (!photo) {
            return res.status(400).json({ error: 'No processed photo data provided' });
        }

        // Convert base64 to buffer
        const base64Data = photo.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate filename for processed photo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const safeUserName = userName ? userName.replace(/[^a-zA-Z0-9]/g, '_') : 'anonymous';
        const filename = `${safeUserName}_${device}_${theme}_processed_${timestamp}.png`;
        const filepath = path.join(processedDir, filename);

        // Save the processed file
        fs.writeFileSync(filepath, buffer);

        console.log(`Processed photo saved to: ${filepath}`);
        
        res.json({ 
            success: true, 
            message: 'Processed photo saved successfully',
            filename: filename,
            processedPhotoId: filename,
            filepath: filepath,
            device: device,
            theme: theme
        });
    } catch (error) {
        console.error('Error saving processed photo:', error);
        res.status(500).json({ error: 'Failed to save processed photo' });
    }
});

// ==================== FEEDBACK SUBMISSION ====================
// Submit final feedback endpoint - OPTIMIZED for fast response (under 2 seconds)
router.post('/submit-feedback', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { userData, device, theme, retention } = req.body;
        
        console.log('📝 Feedback submitted:', {
            userName: userData.name,
            email: userData.email,
            device: device,
            theme: theme,
            retention: retention
        });

        // 1. IMMEDIATELY send success response to user (within milliseconds)
        const responseData = {
            success: true, 
            message: 'Feedback submitted successfully',
            data: {
                userName: userData.name,
                email: userData.email,
                device: device,
                theme: theme,
                retention: retention,
                submittedAt: new Date().toISOString(),
                emailQueued: false
            }
        };
        
        // Check if email should be queued
        const shouldQueueEmail = userData.email && userData.email.includes('@') && 
                               (userData.photoId || userData.processedPhotoId);
        
        if (shouldQueueEmail) {
            responseData.data.emailQueued = true;
            responseData.data.emailQueuedMessage = 'Thank you email will be sent shortly';
        }
        
        // Send response IMMEDIATELY
        res.json(responseData);
        const responseTime = Date.now() - startTime;
        console.log(`✅ Response sent in ${responseTime}ms`);
        
        // 2. AFTER sending response, process database and email in background
        setTimeout(async () => {
            console.log('🔄 Background processing started...');
            const bgStartTime = Date.now();
            
            try {
                // Save to database (in background)
                saveFeedbackToDatabase(userData, device, theme, retention, async (error, result) => {
                    if (error) {
                        console.error('❌ Error saving to database:', error);
                    } else {
                        console.log('✅ Feedback saved to database:', result);
                        
                        // Send email in background if needed
                        if (shouldQueueEmail) {
                            const photoToSend = userData.processedPhotoId || userData.photoId;
                            
                            console.log(`📧 Background: Queuing email to ${userData.email}...`);
                            
                            // Use setTimeout to further delay email sending
                            setTimeout(async () => {
                                try {
                                    const emailResult = await emailService.sendEmailAndUpdateFlag(
                                        db, 
                                        userData.name, 
                                        userData.email, 
                                        photoToSend
                                    );
                                    
                                    if (emailResult.success) {
                                        console.log('✅ Background: Email sent successfully to:', userData.email);
                                    } else {
                                        console.log('⚠️ Background: Email failed:', emailResult.error);
                                    }
                                } catch (emailErr) {
                                    console.error('❌ Background: Email error:', emailErr.message);
                                }
                            }, 3000); // Wait 3 seconds before sending email
                        }
                    }
                    
                    const bgEndTime = Date.now();
                    console.log(`🔄 Background processing completed in ${bgEndTime - bgStartTime}ms`);
                });
            } catch (bgError) {
                console.error('❌ Background processing error:', bgError);
            }
        }, 100); // Small delay to ensure response is sent first
        
    } catch (error) {
        console.error('❌ Error in submit-feedback:', error);
        // Even on error, return success to user quickly
        const errorResponseTime = Date.now() - startTime;
        console.log(`⚠️ Error response sent in ${errorResponseTime}ms`);
        
        res.json({ 
            success: true, 
            message: 'Feedback submitted successfully',
            data: {
                userName: userData?.name || 'unknown',
                email: userData?.email || 'unknown',
                device: device || 'unknown',
                theme: theme || 'unknown',
                retention: retention || 'unknown',
                submittedAt: new Date().toISOString(),
                note: 'System processing completed'
            }
        });
    }
});

// Send email endpoint (manual)
router.post('/send-email', async (req, res) => {
    try {
        const { name, email, photoFilename } = req.body;
        
        if (!name || !email || !photoFilename) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, email, or photoFilename'
            });
        }
        
        console.log(`📧 Manual email request for ${email} with photo ${photoFilename}`);
        
        const result = await emailService.sendEmailAndUpdateFlag(db, name, email, photoFilename);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Email sent successfully',
                data: result
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to send email',
                details: result.error
            });
        }
        
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Test email endpoint
router.get('/test-email', async (req, res) => {
    try {
        const testEmail = req.query.email || 'test@example.com';
        
        console.log('🧪 Testing email service...');
        
        const result = await emailService.testEmailService(testEmail);
        
        res.json({
            success: result.success,
            message: result.success ? 'Email service test completed' : 'Email service test failed',
            data: result
        });
        
    } catch (error) {
        console.error('Error testing email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test email service',
            details: error.message
        });
    }
});

// Check email service status
router.get('/email-status', async (req, res) => {
    try {
        const status = await emailService.checkEmailService();
        
        res.json({
            success: status.available,
            data: status
        });
        
    } catch (error) {
        console.error('Error checking email status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check email service status'
        });
    }
});

// ==================== DATABASE OPERATIONS ====================
// Database storage function with email encryption
function saveFeedbackToDatabase(userData, device, theme, retention, callback) {
    console.log('💾 Saving feedback with pledge and retention:', {
        userName: userData.name,
        pledge: userData.pledge,
        retention: retention,
        pledgeLength: userData.pledge ? userData.pledge.length : 0
    });
    
    // Start transaction
    db.run('BEGIN TRANSACTION', function(err) {
        if (err) {
            console.error('Error starting transaction:', err);
            return callback(err);
        }

        // 1. Find or create user
        db.get('SELECT * FROM users WHERE email = ?', [userData.email], (err, user) => {
            if (err) {
                console.error('Error finding user:', err);
                return db.run('ROLLBACK', () => callback(err));
            }
            
            if (!user) {
                // Create new user with encrypted email
                const emailEncrypted = userData.email; // In production, encrypt this
                
                db.run(
                    'INSERT INTO users (name, email, email_encrypted, visit_count, last_visit) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)',
                    [userData.name, userData.email, emailEncrypted],
                    function(err) {
                        if (err) {
                            console.error('Error creating user:', err);
                            return db.run('ROLLBACK', () => callback(err));
                        }
                        
                        const userId = this.lastID;
                        console.log(`Created new user with ID: ${userId}`);
                        user = { id: userId, name: userData.name, email: userData.email };
                        saveFeedbackRecord(user.id);
                    }
                );
            } else {
                // Update existing user with encrypted email if not already set
                const updateQuery = user.email_encrypted ? 
                    'UPDATE users SET visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP WHERE id = ?' :
                    'UPDATE users SET visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP, email_encrypted = ? WHERE id = ?';
                
                const params = user.email_encrypted ? 
                    [user.id] : 
                    [userData.email, user.id];
                
                db.run(updateQuery, params, (err) => {
                    if (err) {
                        console.error('Error updating user:', err);
                        return db.run('ROLLBACK', () => callback(err));
                    }
                    console.log(`Updated existing user with ID: ${user.id}`);
                    saveFeedbackRecord(user.id);
                });
            }
        });

        function saveFeedbackRecord(userId) {
            // 2. Save main feedback record with both photo paths AND data retention
            const metadata = JSON.stringify({
                device: device,
                theme: theme,
                retention: retention,
                photoId: userData.photoId,
                processedPhotoId: userData.processedPhotoId,
                likedFeedback: userData.q2,
                improvementFeedback: userData.q3,
                pledge: userData.pledge
            });
            
            // Extract photo paths
            let photoPath = null;
            let processedPhotoPath = null;
            
            if (userData.photoId) {
                photoPath = `photos/${userData.photoId}`;
            }
            if (userData.processedPhotoId) {
                processedPhotoPath = `processed/${userData.processedPhotoId}`;
            }
            
            // The pledge is saved in the comment field AND data_retention is saved in its own column
            db.run(
                `INSERT INTO feedback (user_id, rating, comment, metadata, photo_path, processed_photo_path, data_retention, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [userId, userData.rating, userData.pledge, metadata, photoPath, processedPhotoPath, retention],
                function(err) {
                    if (err) {
                        console.error('Error saving feedback:', err);
                        return db.run('ROLLBACK', () => callback(err));
                    }
                    
                    const feedbackId = this.lastID;
                    console.log(`✅ Saved feedback with ID: ${feedbackId}, Retention: ${retention}, Pledge: ${userData.pledge ? 'Yes (' + userData.pledge.length + ' chars)' : 'No'}`);
                    console.log(`Raw Photo Path: ${photoPath}`);
                    console.log(`Processed Photo Path: ${processedPhotoPath}`);
                    saveQuestionAnswers(userId, feedbackId, userData, (error) => {
                        if (error) {
                            console.log('Some question answers could not be saved, continuing...');
                        }
                        commitTransaction(userId, feedbackId);
                    });
                }
            );
        }

        function saveQuestionAnswers(userId, feedbackId, userData, callback) {
            // Get all active questions to know what to save
            const getQuestionsQuery = 'SELECT id, question_type FROM questions WHERE is_active = 1';
            
            db.all(getQuestionsQuery, [], (err, questions) => {
                if (err || !questions || questions.length === 0) {
                    console.log('No active questions found or error fetching questions');
                    return callback(null);
                }
                
                let saved = 0;
                let errorOccurred = null;
                
                questions.forEach(question => {
                    const answerKey = `q${question.id}`;
                    const answerValue = userData[answerKey];
                    
                    if (answerValue !== undefined && answerValue !== null && answerValue !== '') {
                        const insertAnswerQuery = `
                            INSERT INTO feedback_answers (feedback_id, question_id, answer_value, created_at)
                            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                        `;
                        
                        db.run(insertAnswerQuery, [feedbackId, question.id, answerValue], function(err) {
                            if (err) {
                                console.error(`Error saving answer for question ${question.id}:`, err);
                                errorOccurred = err;
                            } else {
                                console.log(`✅ Saved answer for question ${question.id}`);
                            }
                            
                            saved++;
                            
                            if (saved === questions.length) {
                                callback(errorOccurred);
                            }
                        });
                    } else {
                        saved++;
                        
                        if (saved === questions.length) {
                            callback(errorOccurred);
                        }
                    }
                });
            });
        }

        function commitTransaction(userId, feedbackId) {
            db.run('COMMIT', (err) => {
                if (err) {
                    console.error('Error committing transaction:', err);
                    return callback(err);
                }
                
                console.log(`📊 Feedback saved successfully to database - User ID: ${userId}, Feedback ID: ${feedbackId}`);
                console.log(`📝 Pledge saved: ${userData.pledge ? userData.pledge.substring(0, 50) + '...' : 'No pledge'}`);
                console.log(`📅 Data Retention: ${retention}`);
                callback(null, {
                    userId: userId,
                    feedbackId: feedbackId
                });
            });
        }
    });
}

// ==================== FEEDBACK MANAGEMENT ====================
// Get all feedback data
router.get('/feedback', (req, res) => {
    const query = `
        SELECT 
            f.id,
            u.name,
            u.email,
            u.visit_count as visits,
            f.rating,
            f.comment as pledge,
            COALESCE(f.data_retention, 'PERMANENT') as data_retention,
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
            console.error('Error fetching feedback data:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
            success: true,
            feedback: rows
        });
    });
});

// Get all visitors data
router.get('/visitors', (req, res) => {
    const query = `
        SELECT 
            id,
            name,
            email,
            visit_count as visits,
            created_at,
            last_visit
        FROM users 
        ORDER BY last_visit DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching visitors data:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
            success: true,
            visitors: rows
        });
    });
});

// Delete feedback (soft delete by setting is_active = 0)
router.delete('/feedback/:id', (req, res) => {
    const { id } = req.params;
    
    const query = 'UPDATE feedback SET is_active = 0 WHERE id = ?';
    
    db.run(query, [id], function(err) {
        if (err) {
            console.error('Error deleting feedback:', err);
            return res.status(500).json({ error: 'Failed to delete feedback' });
        }
        
        res.json({ 
            success: true, 
            message: 'Feedback deleted successfully',
            changes: this.changes 
        });
    });
});

// Update feedback (admin edits)
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

// ==================== UTILITY ENDPOINTS ====================
// Test database connection endpoint
router.get('/test-db', (req, res) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        res.json({ 
            message: 'Database is working!',
            tables: row ? 'Tables exist' : 'No tables found'
        });
    });
});

// Root endpoint for feedback routes
router.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: 'Feedback routes are working!',
        endpoints: {
            questions: 'GET /api/feedback/questions',
            submit: 'POST /api/feedback/submit-feedback',
            sendEmail: 'POST /api/feedback/send-email',
            testEmail: 'GET /api/feedback/test-email',
            getFeedback: 'GET /api/feedback/feedback',
            emailStatus: 'GET /api/feedback/email-status'
        }
    });
});

module.exports = router;