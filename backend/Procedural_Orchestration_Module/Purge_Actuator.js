// WHOLE FILE DONE BY PRETI

// ============================================================
// PURGE_ACTUATOR.JS - TABLE OF CONTENTS (CTRL+F SEARCHABLE)
// ============================================================
// 
// 1. IMPORTS & CONFIGURATION
//    require('dotenv')                - Environment variables (DONE BY PRETI)
//    const mysql                      - MySQL database library (DONE BY PRETI)
//    const readline                   - Terminal input interface (DONE BY PRETI)
//    const db                         - Database connection instance (DONE BY PRETI)
//    const rl                         - Readline interface instance (DONE BY PRETI)
//
// 2. DATABASE CONNECTION & DATA PURGE
//    db.connect()                     - Connect to database and show counts (DONE BY PRETI)
//    Query user count                 - Get current user count (DONE BY PRETI)
//    Query feedback count             - Get current feedback count (DONE BY PRETI)
//    Confirmation prompt              - Ask user to confirm deletion (DONE BY PRETI)
//    DELETE feedback                  - Delete all feedback entries (DONE BY PRETI)
//    DELETE users                     - Delete all user entries (DONE BY PRETI)
//    Reset auto-increment             - Reset table auto-increment counters (DONE BY PRETI)
//
// ============================================================
// DESCRIPTION:
// Utility script to completely purge all test data from the database.
// Deletes all users and feedback, resets auto-increment counters.
// 
// USAGE: node Purge_Actuator.js
// WARNING: This action CANNOT be undone! All data will be lost.
// ============================================================

// ==================== 1. IMPORTS & CONFIGURATION ====================

// Load environment variables from .env file
require('dotenv').config();

// MySQL database library for database operations
const mysql = require('mysql2');

// Terminal input interface for confirmation prompts
const readline = require('readline');

// Database connection instance using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'kiosk_user',
    password: process.env.DB_PASSWORD || 'kiosk123',
    database: process.env.DB_NAME || 'dp_kiosk_db'
});

// Readline interface instance for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('='.repeat(60));
console.log('⚠️  CLEAR ALL TEST DATA');
console.log('='.repeat(60));
console.log('');
console.log('This will DELETE ALL feedback and user data from your database!');
console.log('');

// ==================== 2. DATABASE CONNECTION & DATA PURGE ====================

// Connect to database and display current data counts
db.connect((err) => {
    if (err) {
        console.log('❌ Database connection failed:', err.message);
        process.exit(1);
    }
    
    // Get current count of users in database
    db.query('SELECT COUNT(*) as users FROM users', (err, userResult) => {
        if (err) {
            console.log('❌ Query failed:', err.message);
            db.end();
            process.exit(1);
        }
        
        // Get current count of feedback entries in database
        db.query('SELECT COUNT(*) as feedback FROM feedback', (err, feedbackResult) => {
            if (err) {
                console.log('❌ Query failed:', err.message);
                db.end();
                process.exit(1);
            }
            
            const userCount = userResult[0].users;
            const feedbackCount = feedbackResult[0].feedback;
            
            console.log('📊 Current Database Contents:');
            console.log(`   Users: ${userCount}`);
            console.log(`   Feedback: ${feedbackCount}`);
            console.log('');
            console.log('⚠️  WARNING: This action CANNOT be undone!');
            console.log('');
            
            // Prompt user to confirm data deletion
            rl.question('Are you sure you want to delete ALL data? (yes/no): ', (answer) => {
                if (answer.toLowerCase() !== 'yes') {
                    console.log('');
                    console.log('✅ Cancelled. No data was deleted.');
                    rl.close();
                    db.end();
                    return;
                }
                
                console.log('');
                console.log('🗑️  Deleting all data...');
                
                // Delete all feedback entries (must be deleted first due to foreign key)
                db.query('DELETE FROM feedback', (err, result) => {
                    if (err) {
                        console.log('❌ Failed to delete feedback:', err.message);
                        rl.close();
                        db.end();
                        return;
                    }
                    
                    console.log(`   ✅ Deleted ${result.affectedRows} feedback entries`);
                    
                    // Delete all user entries
                    db.query('DELETE FROM users', (err, result) => {
                        if (err) {
                            console.log('❌ Failed to delete users:', err.message);
                            rl.close();
                            db.end();
                            return;
                        }
                        
                        console.log(`   ✅ Deleted ${result.affectedRows} users`);
                        
                        // Reset auto-increment counter for feedback table
                        db.query('ALTER TABLE feedback AUTO_INCREMENT = 1', (err) => {
                            if (!err) console.log('   ✅ Reset feedback auto-increment');
                            
                            // Reset auto-increment counter for users table
                            db.query('ALTER TABLE users AUTO_INCREMENT = 1', (err) => {
                                if (!err) console.log('   ✅ Reset users auto-increment');
                                
                                console.log('');
                                console.log('='.repeat(60));
                                console.log('✅ ALL DATA CLEARED SUCCESSFULLY!');
                                console.log('='.repeat(60));
                                console.log('');
                                console.log('📊 Database is now empty and ready for fresh data.');
                                console.log('');
                                console.log('Next steps:');
                                console.log('   1. Run: node generate_test_data.js');
                                console.log('   2. Generate 500 new test entries');
                                console.log('   3. Test your admin panel!');
                                console.log('');
                                
                                rl.close();
                                db.end();
                            });
                        });
                    });
                });
            });
        });
    });
});