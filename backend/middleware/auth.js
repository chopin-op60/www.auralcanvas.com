const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Access denied, no token provided',
                timestamp: new Date().toISOString() 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await db.execute('SELECT id, username, email FROM users WHERE id = ?', [decoded.id]);
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token - user not found',
                timestamp: new Date().toISOString() 
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            success: false,
            message: 'Invalid token',
            timestamp: new Date().toISOString() 
        });
    }
};

module.exports = auth;
