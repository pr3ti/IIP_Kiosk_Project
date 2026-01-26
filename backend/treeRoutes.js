const express = require('express');
const router = express.Router();

let db;

function setDatabase(database) {
    db = database;
}

/**
 * GET /api/tree
 * Returns ARRAY of visitors from users table
 */
router.get('/', (req, res) => {
    if (!db) {
        console.error('❌ TreeRoutes: DB not initialized');
        return res.status(500).json([]);
    }

    // ✅ USERS TABLE (based on your screenshot)
    const sql = `
        SELECT
            name,
            visit_count,
            created_at
        FROM users
        ORDER BY created_at ASC
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error('❌ Tree route DB error:', err);
            return res.status(500).json([]);
        }

        const visitors = (Array.isArray(rows) ? rows : []).map(r => {
            const name = (r.name || '').trim();
            return {
                name,
                visit_count: Number(r.visit_count) || 1,
                created_at: r.created_at,
                isVip: name.toLowerCase().includes('vip') // testing
            };
        });

        res.json(visitors);
    });
});

module.exports = {
    router,
    setDatabase
};
