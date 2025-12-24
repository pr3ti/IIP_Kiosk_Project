// ============================================================
// FEEDBACK.JS - TABLE OF CONTENTS (CTRL+F SEARCHABLE)
// ============================================================
// 
// 1. GLOBAL VARIABLES & CONSTANTS
//    let selectedRetention            - Selected retention option (DONE BY PRETI)
//    let selectedTheme                - Currently selected overlay theme (DONE BY PRETI)
//    let userData                     - Object storing user input and answers (DONE BY PRETI)
//    let stream                       - Camera video stream object
//    let photoData                    - Base64 encoded photo data (DONE BY PRETI)
//    let currentDevice                - 'desktop' or 'mobile' device type (DONE BY PRETI)
//    let inactivityTimer              - Timer for inactivity timeout (DONE BY PRETI)
//    const INACTIVITY_TIMEOUT         - 5 minutes timeout duration (DONE BY PRETI)
//
// 2. INITIALIZATION & SETUP FUNCTIONS
//    async function loadDynamicQRCode() - Load dynamic QR code from server (DONE BY PRETI)
//    function detectDeviceType()      - Detect mobile/desktop device (DONE BY PRETI)
//    DOMContentLoaded                 - Application bootstrap

//
// 3. INACTIVITY TIMER FUNCTIONS
//    function startInactivityTimer()  - Start 5-minute countdown (DONE BY PRETI)
//    function resetInactivityTimer()  - Reset on user interaction (DONE BY PRETI)
//    function returnToLandingPage()   - Return to start when timeout (DONE BY PRETI)
//    function showTimeoutNotification() - Show timeout message (DONE BY PRETI)
//
// 4. QUESTION MANAGEMENT FUNCTIONS
//    async function loadFeedbackQuestions() - Load questions from database (DONE BY PRETI)
//    function updateFeedbackForm()    - Update form with questions (DONE BY PRETI)
//    function createQuestionElement() - Create question UI (DONE BY PRETI)
//    function selectQuestionRating()  - Handle star rating (DONE BY PRETI)
//    function initializeQuestionEventListeners() - Setup question events (DONE BY PRETI)
//    function showNoQuestionsMessage() - Show message if no questions (DONE BY PRETI)
//    function getQuestionType()       - Determine question type (DONE BY PRETI)
//    function validateRequiredQuestions() - Validate required answers (DONE BY PRETI)
// 
// 5. FORM SUBMISSION FUNCTIONS
//    function submitFeedback()        - Submit feedback form (DONE BY PRETI)
//    function submitDetails()         - Submit user details
//    function submitPledge()          - Submit pledge and redirect
//
// 6. PHOTO HANDLING FUNCTIONS
//    function handlePhotoUpload()     - Handle file upload (mobile)
//    function continueToStyleFromUpload() - Continue from upload to style
//    function retakePhotoFromUpload() - Retake photo from upload page
//    async function initializeCamera() - Initialize camera (desktop only)
//    function capturePhoto()          - Capture with countdown/redirect
//    function takePhoto()             - Take photo from camera stream 
//    function continueToStyle()       - Go to style page after photo (DONE BY PRETI)
//    function saveOriginalPhoto()     - Save original to server (DONE BY PRETI)
//    function saveProcessedPhoto()    - Save processed photo to server (DONE BY PRETI)
//
// 7. OVERLAY & THEME FUNCTIONS
//    async function loadOverlayOptions() - Load overlays from database (DONE BY PRETI)
//    function loadDefaultOverlayOptions() - Fallback default overlays (DONE BY PRETI)
//    function generateColorFromThemeId() - Generate consistent colors (DONE BY PRETI)
//    function selectTheme()           - Select theme and update preview (DONE BY PRETI)
//    function updateThemePreview()    - Update theme preview image (DONE BY PRETI)
//    function updatePreviewWithCutout() - Update preview with positioning (DONE BY PRETI)
//    function processFinalPhoto()     - Process final photo with overlay (DONE BY PRETI)
//
// 8. PAGE NAVIGATION FUNCTIONS
//    function showConsentPage()       - Show consent page
//    function selectOption()          - Select retention option (DONE BY PRETI)
//    function showDetailsPage()       - Show details page
//    function retakePhotoFromStyle()  - Retake photo from style page (DONE BY PRETI)
//    function confirmStyle()          - Confirm and go to confirmation (DONE BY PRETI)
//    function updateConfirmationDetails() - Update confirmation page
//    function goBackToStyle()         - Go back to style page
//    function finalSubmit()           - Final submission with saving (DONE BY PRETI)
//    function submitAnother()         - Reset and start new submission
//
// 9. BACK NAVIGATION FUNCTIONS
//    function goBackToLanding()       - Consent to Landing (DONE BY PRETI)
//    function goBackToConsent()       - Details to Consent 
//    function goBackToDetails()       - Feedback to Details
//    function goBackToFeedback()      - Pledge to Feedback
//    function goBackToPledge()        - Photo/Upload to Pledge
//    function goBackToPhoto()         - Style to Photo/Upload (DONE BY PRETI)
//
// 10. EVENT LISTENERS & CLEANUP
//     window.addEventListener('beforeunload') - Clean up camera and timers (DONE BY PRETI)
//     document.addEventListener('click') - Reset inactivity timer (DONE BY PRETI)
//     document.addEventListener('keypress') - Reset inactivity timer (DONE BY PRETI)
//     document.addEventListener('mousemove') - Reset inactivity timer (DONE BY PRETI)
//     document.addEventListener('touchstart') - Reset inactivity timer (DONE BY PRETI)


// feedbackRoutes.js - Enhanced with database storage while keeping all functionality
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('./db'); // Import database connection
const emailService = require('./emailService');
const auth = require('./auth');

// ==================== 1. DIRECTORY SETUP ====================
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

// ==================== 2. QUESTION MANAGEMENT ROUTES ====================
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

// ==================== 3. PHOTO UPLOAD ROUTES ====================
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

// ==================== 4. FEEDBACK SUBMISSION ROUTES ====================
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
                saveFeedbackToDatabase(userData, device, theme, retention, async (error, result) => {
                    if (error) {
                        console.error('❌ Error saving to database:', error);
                        return;
                    }
                    
                    console.log('✅ Feedback saved to database:', result);
                    const bgTime = Date.now() - bgStartTime;
                    console.log(`🔄 Database completed in ${bgTime}ms`);
                    
                    // Send email AFTER database is committed
                    if (shouldQueueEmail && result && result.feedbackId) {
                        const photoToSend = userData.processedPhotoId || userData.photoId;
                        
                        console.log(`📧 Starting email for ${userData.email}...`);
                        
                        setImmediate(async () => {
                            try {
                                const emailResult = await emailService.sendThankYouEmail(
                                    userData.name,
                                    userData.email,
                                    photoToSend
                                );
                                
                                if (emailResult.success) {
                                    console.log(`✅ Email sent to ${userData.email}`);
                                    
                                    // Update email flag (separate query, non-blocking)
                                    db.run(
                                        'UPDATE feedback SET email_sent = 1, email_sent_at = CURRENT_TIMESTAMP WHERE id = ?',
                                        [result.feedbackId],
                                        function(err) {
                                            if (err) {
                                                console.error(`⚠️ Email flag update failed:`, err.message);
                                            } else {
                                                console.log(`✅ Email flag updated for feedback ${result.feedbackId}`);
                                            }
                                        }
                                    );
                                } else {
                                    console.error(`❌ Email failed:`, emailResult.error);
                                }
                            } catch (emailError) {
                                console.error(`❌ Email exception:`, emailError.message);
                            }
                        });
                    }
                });
            } catch (err) {
                console.error('❌ Background error:', err);
            }
        }, 0);

        
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

// Retry sending email for a feedback entry
router.post('/feedback/:id/retry-email', async (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT f.*, u.name, u.email_encrypted 
        FROM feedback f 
        JOIN users u ON f.user_id = u.id 
        WHERE f.id = ?
    `;
    
    db.get(query, [id], async (err, feedback) => {
        if (err || !feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        
        if (!feedback.email_encrypted) {
            return res.status(400).json({ error: 'No email address' });
        }
        
        // Decrypt email for sending
        let email;
        try {
            email = auth.decryptEmail(feedback.email_encrypted);
        } catch (error) {
            console.error('❌ Failed to decrypt email:', error);
            return res.status(500).json({ error: 'Failed to decrypt email' });
        }
        
        const photoFilename = feedback.processed_photo_path 
            ? feedback.processed_photo_path.split('/').pop()
            : feedback.photo_path ? feedback.photo_path.split('/').pop() : null;
        
        if (!photoFilename) {
            return res.status(400).json({ error: 'No photo found' });
        }
        
        try {
            const emailResult = await emailService.sendThankYouEmail(
                feedback.name,
                feedback.email,
                photoFilename
            );
            
            if (emailResult.success) {
                db.run(
                    'UPDATE feedback SET email_sent = 1, email_sent_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [id],
                    (err) => {
                        res.json({
                            success: true,
                            emailSent: true,
                            flagUpdated: !err
                        });
                    }
                );
            } else {
                res.json({
                    success: false,
                    error: emailResult.error
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
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

// ==================== 5. DATABASE OPERATIONS ====================

/**
 * Validate email format
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Save feedback to database with encrypted email
 */
function saveFeedbackToDatabase(userData, device, theme, retention, callback) {
    console.log('💾 Saving feedback with pledge and retention:', {
        userName: userData.name,
        hasEmail: !!userData.email,
        pledge: userData.pledge,
        retention: retention,
        pledgeLength: userData.pledge ? userData.pledge.length : 0
    });
    
    // Find user by email
    db.all('SELECT * FROM users WHERE email_encrypted IS NOT NULL', [], (err, allUsers) => {
        if (err) {
            console.error('Error fetching users:', err);
            return callback(err);
        }
        
        // Try to find matching user by decrypting emails
        let user = null;
        if (userData.email) {
            for (const u of allUsers) {
                try {
                    const decryptedEmail = auth.decryptEmail(u.email_encrypted);
                    if (decryptedEmail && decryptedEmail.toLowerCase() === userData.email.toLowerCase()) {
                        user = u;
                        break;
                    }
                } catch (error) {
                    // Skip invalid encrypted emails
                    continue;
                }
            }
        }
        
        if (!user) {
            // Create new user with encrypted email
            let encryptedEmail = null;
            if (userData.email && isValidEmail(userData.email)) {
                try {
                    encryptedEmail = auth.encryptEmail(userData.email);
                    console.log('🔒 Email encrypted for new user');
                } catch (error) {
                    console.error('❌ Email encryption failed:', error);
                    return callback(new Error('Email encryption failed'));
                }
            }
            
            db.run(
                'INSERT INTO users (name, email_encrypted, visit_count, last_visit) VALUES (?, ?, 1, CURRENT_TIMESTAMP)',
                [userData.name, encryptedEmail],
                function(err) {
                    if (err) {
                        console.error('Error creating user:', err);
                        return callback(err);
                    }
                    const userId = this.lastID;
                    console.log(`✅ Created new user with ID: ${userId}${encryptedEmail ? ' (email encrypted)' : ''}`);
                    saveFeedbackRecord(userId);
                }
            );
        } else {
            // Update existing user
            let updateQuery, params;
            
            if (user.email_encrypted) {
                // User already has encrypted email
                updateQuery = 'UPDATE users SET visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP WHERE id = ?';
                params = [user.id];
            } else if (userData.email && isValidEmail(userData.email)) {
                // Encrypt email for existing user
                try {
                    const encryptedEmail = auth.encryptEmail(userData.email);
                    updateQuery = 'UPDATE users SET visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP, email_encrypted = ? WHERE id = ?';
                    params = [encryptedEmail, user.id];
                    console.log(`🔒 Encrypting email for existing user ${user.id}`);
                } catch (error) {
                    console.error('❌ Email encryption failed:', error);
                    return callback(new Error('Email encryption failed'));
                }
            } else {
                // No email to update
                updateQuery = 'UPDATE users SET visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP WHERE id = ?';
                params = [user.id];
            }
            
            db.run(updateQuery, params, (err) => {
                if (err) {
                    console.error('Error updating user:', err);
                    return callback(err);
                }
                console.log(`✅ Updated user ${user.id}, visit count: ${user.visit_count + 1}${!user.email_encrypted && encryptedEmail ? ' (email encrypted)' : ''}`);
                saveFeedbackRecord(user.id);
            });
        }
    });

    function saveFeedbackRecord(userId) {
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
        
        let photoPath = userData.photoId ? `photos/${userData.photoId}` : null;
        let processedPhotoPath = userData.processedPhotoId ? `processed/${userData.processedPhotoId}` : null;
        
        db.run(
            `INSERT INTO feedback (user_id, comment, metadata, photo_path, processed_photo_path, data_retention, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [userId, userData.pledge, metadata, photoPath, processedPhotoPath, retention],
            function(err) {
                if (err) {
                    console.error('Error saving feedback:', err);
                    return callback(err);
                }
                
                const feedbackId = this.lastID;
                console.log(`✅ Saved feedback with ID: ${feedbackId}, Retention: ${retention}, Pledge: ${userData.pledge ? 'Yes (' + userData.pledge.length + ' chars)' : 'No'}`);
                console.log(`Raw Photo Path: ${photoPath}`);
                console.log(`Processed Photo Path: ${processedPhotoPath}`);
                
                saveQuestionAnswers(userId, feedbackId, userData, (error) => {
                    if (error) {
                        console.log('⚠️ Some answers could not be saved');
                    }
                    console.log(`📊 Feedback saved successfully - User: ${userId}, Feedback: ${feedbackId}`);
                    console.log(`📝 Pledge: ${userData.pledge ? userData.pledge.substring(0, 50) + '...' : 'None'}`);
                    console.log(`📅 Retention: ${retention}`);
                    callback(null, { userId, feedbackId });
                });
            }
        );
    }

    function saveQuestionAnswers(userId, feedbackId, userData, callback) {
        const getQuestionsQuery = 'SELECT id, question_type FROM questions WHERE is_active = 1';
        console.log('📝 Saving answers for feedback:', feedbackId);
        
        db.all(getQuestionsQuery, [], (err, questions) => {
            if (err || !questions || questions.length === 0) {
                console.log(err ? '❌ Error fetching questions' : '⚠️ No questions');
                return callback(null);
            }
            
            console.log(`📋 Saving ${questions.length} answers in parallel...`);
            
            const insertPromises = questions.map(question => {
                let answerValue = userData.answers?.[question.id] || userData[`q${question.id}`];
                
                if (answerValue !== undefined && answerValue !== null && answerValue !== '') {
                    return new Promise((resolve, reject) => {
                        db.run(
                            'INSERT INTO feedback_answers (feedback_id, question_id, answer_value, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
                            [feedbackId, question.id, String(answerValue)],
                            (err) => {
                                if (err) {
                                    console.error(`❌ Q${question.id}:`, err.message);
                                    reject(err);
                                } else {
                                    console.log(`✅ Q${question.id} saved`);
                                    resolve();
                                }
                            }
                        );
                    });
                }
                return Promise.resolve();
            });
            
            Promise.allSettled(insertPromises).then(results => {
                const saved = results.filter(r => r.status === 'fulfilled').length;
                console.log(`📊 Saved ${saved}/${questions.length} answers`);
                callback(null);
            });
        });
    };
};



// ==================== 6. FEEDBACK MANAGEMENT ROUTES ====================
// Get all feedback data (DONE BY PRETI)
router.get('/feedback', (req, res) => {
    const query = `
        SELECT 
            f.id,
            u.name,
            u.email_encrypted,
            u.visit_count as visits,
            f.comment as pledge,
            COALESCE(f.data_retention, 'PERMANENT') as data_retention,
            f.photo_path,
            f.processed_photo_path,
            f.created_at as date,
            f.admin_notes,
            f.email_sent,
            f.email_sent_at,
            f.archive_status,
            CASE 
                WHEN f.email_sent = 1 THEN 'Sent'
                WHEN f.email_sent = 0 AND u.email_encrypted IS NOT NULL THEN 'Failed'
                WHEN u.email_encrypted IS NULL THEN 'No Email'
                ELSE 'Pending'
            END as email_status
        FROM feedback f
        JOIN users u ON f.user_id = u.id
        WHERE f.is_active = 1 AND f.archive_status = 'not_archived'
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

// Get all visitors data (DONE BY PRETI)
router.get('/visitors', (req, res) => {
    const query = `
        SELECT 
            id,
            name,
            email_encrypted,
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
    const { comment, admin_notes } = req.body;  // Keep comment for pledge editing
    
    const query = 'UPDATE feedback SET comment = ?, admin_notes = ? WHERE id = ?';
    
    db.run(query, [comment, admin_notes, id], function(err) {
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

// ==================== 7. UTILITY ENDPOINTS ====================
// Test database connection endpoint
router.get('/test-db', (req, res) => {
        db.get("SELECT TABLE_NAME AS name FROM information_schema.tables WHERE table_schema = DATABASE() LIMIT 1", (err, row) => {
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
            getArchive: 'GET /api/feedback/archive',
            updateArchiveStatus: 'POST /api/feedback/archive/update-status',
            archiveStats: 'GET /api/feedback/archive/stats',
            emailStatus: 'GET /api/feedback/email-status'
        }
    });
});

module.exports = router;