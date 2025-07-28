const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');
const auth = require('../middleware/auth');

// All message routes require authentication
router.use(auth);

// 对话管理
router.get('/conversations', MessageController.getConversations);
router.post('/conversations', MessageController.createConversation);

// 消息管理
router.get('/conversations/:conversationId/messages', MessageController.getMessages);
router.post('/conversations/:conversationId/messages', MessageController.sendMessage);
router.post('/conversations/:conversationId/share-post', MessageController.sharePost);
router.put('/conversations/:conversationId/read', MessageController.markAsRead);

// 未读数量
router.get('/unread-count', MessageController.getUnreadCount);

module.exports = router;
