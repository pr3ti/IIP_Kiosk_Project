// treeRoutes.js
const express = require('express');
const router = express.Router();

let db;

// Called from server.js to inject the shared SQLite connection
function setDatabase(database) {
    db = database;
}

// TREE GROWING ROUTE
router.get('/', (req, res) => {
    if (!db) {
        return res.status(500).json({ error: 'Database not initialized' });
    }

    const currentYear = new Date().getFullYear();

    // Query 1: Fetch individual submissions for leaves
    const leavesSql = `
        SELECT 
            u.name, 
            u.visit_count, 
            DATE_FORMAT(f.created_at, '%Y-%m-%dT%H:%i:%s') as created_at
        FROM feedback f
        JOIN users u ON f.user_id = u.id
        WHERE YEAR(f.created_at) = ?
          AND u.name IS NOT NULL
        ORDER BY f.created_at ASC
    `;

    // Query 2: Fetch total count to determine tree stage
    const countSql = `SELECT COUNT(*) as total FROM feedback WHERE YEAR(created_at) = ?`;

    db.query(leavesSql, [currentYear], (err, leaves) => {
        if (err) {
            console.error('Error fetching leaves:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        db.query(countSql, [currentYear], (err, countResult) => {
            if (err) {
                console.error('Error fetching count:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Return both datasets to the frontend
            res.json({
                visitors: leaves,
                totalSubmissions: countResult[0].total
            });
        });
    });
}); 

module.exports = { router, setDatabase };
