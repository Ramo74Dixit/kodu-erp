// In middleware/adminAuth.js

const jwt = require('jsonwebtoken');

// Admin Authorization Middleware
const isAdmin = (req, res, next) => {
    try {
        // Ensure user is authenticated (JWT token exists and is valid)
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        
        next(); // User is admin, continue to next middleware
    } catch (error) {
        console.error('Error in admin authorization middleware:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = isAdmin;
