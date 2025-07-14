const express = require('express');
const router = express.Router();

// 测试路由
router.get('/test', (req, res) => {
    res.json({ 
        success: true,
        message: 'Users controller working!',
        data: { message: 'Users module ready for development' },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
