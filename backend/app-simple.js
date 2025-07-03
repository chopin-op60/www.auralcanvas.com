const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 基础中间件
app.use(cors());
app.use(express.json());

// 测试路由
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'AuralCanvas API is running'
    });
});

// 简单的认证路由
app.post('/api/auth/test', (req, res) => {
    res.json({ message: 'Auth endpoint working' });
});

// 简单的帖子路由
app.get('/api/posts/test', (req, res) => {
    res.json({ message: 'Posts endpoint working' });
});

// 错误处理
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ message: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
