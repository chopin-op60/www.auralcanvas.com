const express = require('express');
const axios = require('axios');
const router = express.Router();

// AI脚本代理接口
router.get('/script/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        console.log('Proxying script:', filename);
        
        const response = await axios.get(`https://www.xingyunlink.com/js/${filename}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
            },
            timeout: 10000
        });
        
        // 设置正确的Content-Type和CORS头
        res.set({
            'Content-Type': 'application/javascript',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Cache-Control': 'public, max-age=3600'
        });
        
        res.send(response.data);
        
    } catch (error) {
        console.error('Script proxy error:', error.message);
        res.status(500).json({ 
            message: 'Failed to proxy script',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// AI聊天页面代理接口
router.get('/chat/*', async (req, res) => {
    try {
        const chatPath = req.path.replace('/chat/', '');
        const queryString = req.url.split('?')[1] || '';
        const fullUrl = `https://www.xingyunlink.com/chat/${chatPath}${queryString ? '?' + queryString : ''}`;
        
        console.log('Proxying chat page:', fullUrl);
        
        const response = await axios.get(fullUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
            },
            timeout: 15000
        });
        
        // 修改HTML中的相对路径为绝对路径
        let html = response.data;
        html = html.replace(/src="\/js\//g, 'src="https://www.xingyunlink.com/js/');
        html = html.replace(/href="\/css\//g, 'href="https://www.xingyunlink.com/css/');
        html = html.replace(/src="\/assets\//g, 'src="https://www.xingyunlink.com/assets/');
        
        res.set({
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
            'X-Frame-Options': 'ALLOWALL'
        });
        
        res.send(html);
        
    } catch (error) {
        console.error('Chat proxy error:', error.message);
        res.status(500).json({ 
            message: 'Failed to proxy chat page',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

module.exports = router;
