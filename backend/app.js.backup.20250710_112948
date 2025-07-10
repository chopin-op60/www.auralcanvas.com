const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// 安全中间件
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS 配置
app.use(cors({
    origin: ['https://www.auralcanvas.fun', 'http://localhost:8080', 'http://localhost:3000'],
    credentials: true
}));

// 请求解析中间件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制每个IP 15分钟内最多100个请求
    message: { message: '请求过于频繁，请稍后再试' }
});
app.use('/api', limiter);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));

// 404 处理
app.use('*', (req, res) => {
    res.status(404).json({ message: '接口不存在' });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    // Multer 错误处理
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: '文件大小超过限制' });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: '不支持的文件字段' });
    }
    
    res.status(500).json({ 
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? error.message : null
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
