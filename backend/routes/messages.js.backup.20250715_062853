const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');
const auth = require('../middleware/auth');

// All message routes require authentication
router.use(auth);

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Messages API is ready!',
        data: { message: 'Real-time messaging system' },
        timestamp: new Date().toISOString()
    });
});

// Conversation routes
router.get('/conversations', MessageController.getConversations);
router.post('/conversations/create', MessageController.createOrGetConversation);
router.get('/conversations/:conversationId/messages', MessageController.getConversationMessages);
router.put('/conversations/:conversationId/read', MessageController.markConversationAsRead);

// Message routes
router.post('/send', MessageController.sendMessage);
router.put('/:messageId/read', MessageController.markMessageAsRead);
router.get('/unread-count', MessageController.getUnreadCount);

module.exports = router;
