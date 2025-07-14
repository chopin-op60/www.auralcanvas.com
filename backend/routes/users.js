const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// 测试路由
router.get('/test', (req, res) => {
    res.json({ 
        success: true,
        message: 'Users API is ready!',
        data: { message: 'Users module with profile support' },
        timestamp: new Date().toISOString()
    });
});

// 公开路由
router.get('/search', UserController.searchUsers);
router.get('/:id', UserController.getUserById);
router.get('/:id/posts', UserController.getUserPosts);

module.exports = router;
