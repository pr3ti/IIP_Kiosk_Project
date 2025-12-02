// auth.js - Authentication middleware and functions
const db = require('./db');

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
}

// Middleware to check if user has admin role
function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'system_admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
}

// Login function - UPDATED for password_hash column
function loginUser(username, password, callback) {
    const query = 'SELECT * FROM admin_users WHERE username = ? AND password_hash = ? AND is_active = 1';
    
    db.get(query, [username, password], (err, row) => {
        if (err) {
            console.error('Database error during login:', err);
            return callback(err, null);
        }
        
        if (row) {
            // Return user data without password
            const user = {
                id: row.id,
                username: row.username,
                role: row.role
            };
            callback(null, user);
        } else {
            callback(new Error('Invalid username or password'), null);
        }
    });
}

// Get all admin users
function getAdminUsers(callback) {
    const query = 'SELECT id, username, role, last_login, created_at, is_active FROM admin_users ORDER BY id';
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error fetching admin users:', err);
            return callback(err, null);
        }
        callback(null, rows);
    });
}

// Add new admin user
function addAdminUser(username, password, role, callback) {
    const query = 'INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)';
    
    db.run(query, [username, password, role], function(err) {
        if (err) {
            console.error('Database error adding admin user:', err);
            return callback(err, null);
        }
        callback(null, { id: this.lastID, username, role });
    });
}

// Update admin user
function updateAdminUser(id, username, password, role, callback) {
    let query, params;
    
    if (password) {
        query = 'UPDATE admin_users SET username = ?, password_hash = ?, role = ? WHERE id = ?';
        params = [username, password, role, id];
    } else {
        query = 'UPDATE admin_users SET username = ?, role = ? WHERE id = ?';
        params = [username, role, id];
    }
    
    db.run(query, params, function(err) {
        if (err) {
            console.error('Database error updating admin user:', err);
            return callback(err, null);
        }
        callback(null, { changes: this.changes });
    });
}

// Delete admin user
function deleteAdminUser(id, callback) {
    const query = 'DELETE FROM admin_users WHERE id = ?';
    
    db.run(query, [id], function(err) {
        if (err) {
            console.error('Database error deleting admin user:', err);
            return callback(err, null);
        }
        callback(null, { changes: this.changes });
    });
}

module.exports = {
    requireAuth,
    requireAdmin,
    loginUser,
    getAdminUsers,
    addAdminUser,
    updateAdminUser,
    deleteAdminUser
};