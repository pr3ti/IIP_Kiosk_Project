const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ==================== EMAIL CONFIGURATION ====================
let emailTransporter;
let SENDER_EMAIL;

// Initialize email transporter
function initEmailService() {
    try {
        // Use environment variables for security
        const smtpUser = process.env.SMTP_USER || 'fyptestingg1@gmail.com';
        const smtpPass = process.env.SMTP_PASS || 'fyatjrlyybhzepxs';
        
        console.log('🔧 Initializing email service...');
        
        if (!smtpUser || !smtpPass) {
            console.warn('⚠️ SMTP credentials not configured. Email functionality will be disabled.');
            return false;
        }
        
        emailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        SENDER_EMAIL = smtpUser;
        
        // Verify connection asynchronously
        emailTransporter.verify((err, success) => {
            if (err) {
                console.error('❌ Email transporter error:', err.message);
                return false;
            } else {
                console.log('✅ Email transporter is ready to send emails');
                return true;
            }
        });
        
        console.log('📧 Email service initialized with user:', smtpUser);
        return true;
    } catch (error) {
        console.error('❌ Error initializing email service:', error.message);
        return false;
    }
}

// Send thank you email with photo attachment
async function sendThankYouEmail(name, email, photoFilename) {
    try {
        console.log(`📧 Preparing to send email to ${email}...`);
        
        if (!emailTransporter) {
            console.error('❌ Email transporter not initialized');
            return {
                success: false,
                error: 'Email transporter not initialized. Please check SMTP configuration.'
            };
        }
        
        if (!email || !email.includes('@')) {
            console.error('❌ Invalid email address:', email);
            return {
                success: false,
                error: 'Invalid email address'
            };
        }
        
        if (!photoFilename) {
            console.error('❌ No photo filename provided');
            return {
                success: false,
                error: 'No photo filename provided'
            };
        }
        
        // Determine photo path - check multiple possible locations
        let fullPhotoPath = null;
        const searchPaths = [
            path.join(__dirname, '..', 'uploads', 'photos', photoFilename),
            path.join(__dirname, '..', 'uploads', 'processed', photoFilename),
            path.join(__dirname, '..', 'uploads', photoFilename),
            path.join(__dirname, '..', '..', 'uploads', 'photos', photoFilename),
            path.join(__dirname, '..', '..', 'uploads', 'processed', photoFilename),
            path.join(__dirname, '..', '..', 'uploads', photoFilename)
        ];
        
        console.log('🔍 Searching for photo:', photoFilename);
        
        for (const photoPath of searchPaths) {
            if (fs.existsSync(photoPath)) {
                fullPhotoPath = photoPath;
                console.log(`✅ Found photo at: ${fullPhotoPath}`);
                break;
            }
        }
        
        if (!fullPhotoPath) {
            console.error('❌ Photo file not found. Searched in:');
            searchPaths.forEach(p => console.log('   -', p));
            return {
                success: false,
                error: 'Photo file not found. Please check if the file exists in uploads folder.'
            };
        }
        
        // Check file size
        try {
            const stats = fs.statSync(fullPhotoPath);
            const fileSizeInMB = stats.size / (1024 * 1024);
            console.log(`📏 Photo size: ${fileSizeInMB.toFixed(2)}MB`);
            
            if (fileSizeInMB > 25) {
                console.error(`❌ Photo file too large: ${fileSizeInMB.toFixed(2)}MB`);
                return {
                    success: false,
                    error: `Photo file too large (${fileSizeInMB.toFixed(2)}MB). Maximum size is 25MB.`
                };
            }
        } catch (err) {
            console.error('❌ Error checking file size:', err.message);
        }
        
        // Plain text version of email
        const textBody = `
Dear ${name},

Thank you for taking the time to visit our ESG Experience Centre and sharing your feedback.
Attached below is your commemorative photo from your visit.

We hope your experience has inspired you to take meaningful steps towards sustainability.

Warm regards,
ESG Centre Team
Republic Polytechnic

This is an automated email sent from the RP ESG kiosk system. Please do not reply to this message.
        `;

        // HTML email template
        const htmlBody = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for visiting RP ESG Centre</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color:#f5f5f5; padding:20px; margin:0;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
            <div style="background:#006937; color:#ffffff; padding:16px 24px;">
                <h2 style="margin:0; font-size:20px; font-weight:600;">Thank you for visiting the RP ESG Centre, ${name}!</h2>
            </div>

            <div style="padding:24px;">
                <p style="font-size:14px; color:#333; margin:0 0 16px 0;">
                    Dear ${name},
                </p>
                <p style="font-size:14px; color:#333; line-height:1.5; margin:0 0 16px 0;">
                    Thank you for taking the time to visit our ESG Experience Centre and sharing your feedback.
                    Attached below is your commemorative photo from your visit.
                </p>

                <div style="text-align:center; margin:24px 0; padding:16px; background:#f9f9f9; border-radius:4px;">
                    <p style="font-size:13px; color:#666; margin:0 0 12px 0; font-weight:600;">Your ESG Centre Memory</p>
                    <img src="cid:visit_photo" alt="Your RP ESG Centre memory" style="max-width:100%; height:auto; border-radius:4px; border:1px solid #ddd; max-height:400px;" />
                </div>

                <p style="font-size:13px; color:#555; line-height:1.5; margin:0 0 16px 0;">
                    We hope your experience has inspired you to take meaningful steps towards sustainability.
                    Your feedback helps us improve and create better experiences for future visitors.
                </p>

                <p style="font-size:13px; color:#555; margin-top:24px; padding-top:16px; border-top:1px solid #eee;">
                    Warm regards,<br/>
                    <strong style="color:#006937;">ESG Centre Team</strong><br/>
                    Republic Polytechnic
                </p>
            </div>

            <div style="background:#f0f0f0; padding:12px 24px; font-size:11px; color:#777; text-align:center; border-top:1px solid #ddd;">
                This is an automated email sent from the RP ESG kiosk system. Please do not reply to this message.
            </div>
        </div>
    </body>
</html>
        `;

        const mailOptions = {
            from: `"RP ESG Centre" <${SENDER_EMAIL}>`,
            to: email,
            replyTo: 'no-reply@rp.edu.sg',
            subject: `Thank you for visiting RP ESG Centre, ${name}!`,
            text: textBody,
            html: htmlBody,
            attachments: [
                {
                    filename: photoFilename,
                    path: fullPhotoPath,
                    cid: 'visit_photo',
                    contentType: 'image/jpeg'
                }
            ]
        };

        console.log(`📤 Sending email to: ${email}`);
        const info = await emailTransporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully!');
        console.log('📨 Message ID:', info.messageId);
        console.log('👤 Recipient:', email);
        
        return {
            success: true,
            messageId: info.messageId,
            email: email,
            photoFilename: photoFilename,
            recipientCount: info.accepted.length
        };
        
    } catch (err) {
        console.error('❌ Failed to send email:', err.message);
        console.error('Error details:', err);
        
        return {
            success: false,
            error: err.message,
            details: err.response || err.code || 'Unknown error'
        };
    }
}

// Send email and update database flag
async function sendEmailAndUpdateFlag(db, name, email, photoFilename) {
    try {
        console.log(`📧 Starting email process for ${email} with photo ${photoFilename}`);
        
        if (!db) {
            console.error('❌ Database connection not provided');
            return {
                success: false,
                error: 'Database connection not available'
            };
        }
        
        const result = await sendThankYouEmail(name, email, photoFilename);
        
        if (result.success) {
            // Update email_sent flag in database
            return new Promise((resolve, reject) => {
                const updateQuery = `
                    UPDATE feedback 
                    SET email_sent = 1, 
                        email_sent_at = CURRENT_TIMESTAMP 
                    WHERE photo_path LIKE ? 
                       OR processed_photo_path LIKE ? 
                       OR metadata LIKE ?
                `;
                
                db.run(
                    updateQuery,
                    [`%${photoFilename}%`, `%${photoFilename}%`, `%${photoFilename}%`],
                    function(err) {
                        if (err) {
                            console.error('❌ Error updating email_sent flag:', err.message);
                            // Still return success since email was sent
                            resolve({
                                ...result,
                                dbUpdated: false,
                                dbError: err.message
                            });
                        } else {
                            const changes = this.changes || 0;
                            console.log(`✅ Email sent flag updated in database`);
                            console.log(`📊 Rows affected: ${changes}`);
                            
                            resolve({
                                ...result,
                                dbUpdated: true,
                                rowsAffected: changes
                            });
                        }
                    }
                );
            });
        }
        
        return result;
        
    } catch (err) {
        console.error('❌ Error in sendEmailAndUpdateFlag:', err.message);
        return {
            success: false,
            error: err.message
        };
    }
}

// Test email function
async function testEmailService(testEmail = 'test@example.com') {
    try {
        console.log('🧪 Testing email service...');
        
        if (!emailTransporter) {
            console.log('🔄 Initializing email service...');
            const initialized = initEmailService();
            if (!initialized) {
                return {
                    success: false,
                    error: 'Failed to initialize email service'
                };
            }
        }
        
        // Verify connection
        const verifyResult = await emailTransporter.verify();
        console.log('✅ Email service verification passed');
        
        // Try to send a test email without attachment
        const testMailOptions = {
            from: `"RP ESG Centre" <${SENDER_EMAIL}>`,
            to: testEmail,
            subject: 'Test Email from RP ESG Centre',
            text: 'This is a test email from the RP ESG Centre system. If you receive this, email service is working correctly.',
            html: `
                <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
                    <h3 style="color:#006937;">Test Email from RP ESG Centre</h3>
                    <p>This is a test email from the RP ESG Centre system.</p>
                    <p>If you receive this, email service is working correctly.</p>
                    <p><strong>Server Time:</strong> ${new Date().toLocaleString()}</p>
                    <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;">
                    <p style="font-size:12px; color:#666;">This is an automated test message.</p>
                </div>
            `
        };
        
        console.log(`📤 Sending test email to: ${testEmail}`);
        const info = await emailTransporter.sendMail(testMailOptions);
        
        console.log('✅ Test email sent successfully!');
        console.log('📨 Message ID:', info.messageId);
        
        return {
            success: true,
            message: 'Email service is working correctly',
            messageId: info.messageId,
            recipient: testEmail,
            testTime: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Email service test failed:', error.message);
        console.error('Error details:', error);
        
        return {
            success: false,
            error: error.message,
            code: error.code,
            testTime: new Date().toISOString()
        };
    }
}

// Check if email can be sent (without actually sending)
async function checkEmailService() {
    try {
        if (!emailTransporter) {
            const initialized = initEmailService();
            if (!initialized) {
                return {
                    available: false,
                    error: 'Email service not initialized'
                };
            }
        }
        
        const isVerified = await emailTransporter.verify();
        return {
            available: true,
            verified: isVerified,
            sender: SENDER_EMAIL,
            service: 'gmail'
        };
    } catch (error) {
        return {
            available: false,
            error: error.message,
            sender: SENDER_EMAIL
        };
    }
}

module.exports = {
    initEmailService,
    sendThankYouEmail,
    sendEmailAndUpdateFlag,
    testEmailService,
    checkEmailService,
    emailTransporter,
    SENDER_EMAIL
};