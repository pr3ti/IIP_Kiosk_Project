// db.js - Database connection (SIMPLE VERSION)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'feedback.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to existing SQLite database:', dbPath);
    }
});

module.exports = db;