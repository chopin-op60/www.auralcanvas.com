const express = require('express');
const router = express.Router();

// 测试路由
router.get('/test', (req, res) => {
    res.json({ 
        success: true,
        message: 'Posts controller working!',
        data: { message: 'Posts module ready for development' },
        timestamp: new Date().toISOString()
    });
});

// 临时的帖子列表接口
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: '获取帖子列表成功',
        data: {
            posts: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
