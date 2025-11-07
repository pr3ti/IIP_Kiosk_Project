const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'feedback.db');
const db = new sqlite3.Database(dbPath);

function runCleanup() {
    console.log('🧹 Starting automatic data cleanup...');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Delete photos older than 7 days
    db.all(
        `SELECT photo_path FROM feedback 
         WHERE created_at < ? AND photo_path IS NOT NULL`,
        [sevenDaysAgo.toISOString()],
        (err, rows) => {
            if (err) {
                console.error('❌ Error fetching old photos:', err);
                return;
            }
            
            let deletedPhotos = 0;
            rows.forEach(row => {
                if (row.photo_path) {
                    const photoPath = path.join(__dirname, '..', row.photo_path.replace('/assets/', ''));
                    if (fs.existsSync(photoPath)) {
                        try {
                            fs.unlinkSync(photoPath);
                            deletedPhotos++;
                            console.log('🗑️ Deleted old photo:', photoPath);
                        } catch (error) {
                            console.error('❌ Error deleting photo:', photoPath, error);
                        }
                    }
                }
            });
            
            // Remove email addresses from old records
            db.run(
                `UPDATE users SET email = NULL 
                 WHERE last_visit < ? AND email IS NOT NULL`,
                [sevenDaysAgo.toISOString()],
                function(err) {
                    if (err) {
                        console.error('❌ Error removing old emails:', err);
                    } else {
                        console.log(`✅ Removed emails from ${this.changes} old records`);
                    }
                    
                    // Clean up temporary uploads older than 1 day
                    const oneDayAgo = new Date();
                    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                    
                    const uploadsDir = path.join(__dirname, '..', 'assets', 'uploads');
                    if (fs.existsSync(uploadsDir)) {
                        fs.readdir(uploadsDir, (err, files) => {
                            if (err) {
                                console.error('❌ Error reading uploads directory:', err);
                                return;
                            }
                            
                            files.forEach(file => {
                                const filePath = path.join(uploadsDir, file);
                                const stats = fs.statSync(filePath);
                                if (stats.mtime < oneDayAgo) {
                                    fs.unlinkSync(filePath);
                                    console.log('🗑️ Deleted old upload:', file);
                                }
                            });
                            
                            console.log(`✅ Data cleanup completed. Deleted ${deletedPhotos} photos.`);
                            db.close();
                        });
                    } else {
                        console.log('✅ Data cleanup completed.');
                        db.close();
                    }
                }
            );
        }
    );
}

// Run if called directly
if (require.main === module) {
    runCleanup();
}

module.exports = { runCleanup };