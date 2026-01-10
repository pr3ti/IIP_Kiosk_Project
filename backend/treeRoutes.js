// treeRoutes.js
const express = require('express');
const router = express.Router();

let db;

// Called from server.js to inject the shared SQLite connection
function setDatabase(database) {
    db = database;
}

// GET /api/tree
// Returns [{ name, visit_count }, ...] for current year users
router.get('/', (req, res) => {
    if (!db) {
        return res.status(500).json({ error: 'Database not initialized for tree routes' });
    }

    const currentYear = new Date().getFullYear().toString();

    const sql = `
        SELECT
            name,
            visit_count
        FROM users
        WHERE YEAR(created_at) = ?
          AND name IS NOT NULL
          AND name <> ''
        ORDER BY created_at ASC
    `;

    db.all(sql, [currentYear], (err, rows) => {
        if (err) {
            console.error('Error fetching tree data:', err);
            return res.status(500).json({ error: 'Database error fetching tree data' });
        }

        // Tree expects an array of visitors; UI only shows the name on the leaf
        res.json(rows);
    });
});

module.exports = { router, setDatabase };
