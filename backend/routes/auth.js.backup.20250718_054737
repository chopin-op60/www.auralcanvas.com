const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');
const profileUpload = require('../utils/profileUpload');

// 测试路由
router.get('/test', AuthController.test);
router.post('/test', AuthController.test);

// 公开路由（不需要认证）
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/verify', AuthController.verify);

// 需要认证的路由
router.get('/profile', auth, AuthController.profile);
router.put('/profile', auth, profileUpload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cover_image', maxCount: 1 }
]), AuthController.updateProfile);

module.exports = router;
