const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');

// 搜索用户（可选认证）
router.get('/search', auth, UserController.searchUsers);

// 获取用户信息（公开）
router.get('/:id', UserController.getUserById);

// 获取用户帖子（可选认证，用于获取点赞状态）
router.get('/:id/posts', auth, UserController.getUserPosts);

// 获取用户点赞的帖子（需要认证）
router.get('/:id/liked-posts', auth, UserController.getUserLikedPosts);

// 检查用户AI代理可用性（需要认证）
router.get('/:id/ai-availability', auth, UserController.checkUserAIAvailability);

module.exports = router;
