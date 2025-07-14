const express = require('express');
const router = express.Router();
const FriendController = require('../controllers/FriendController');
const auth = require('../middleware/auth');

// All friend routes require authentication
router.use(auth);

// Test route
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Friends API is ready!',
        data: { message: 'Friend management system' },
        timestamp: new Date().toISOString()
    });
});

// Friend management routes
router.get('/', FriendController.getFriends);
router.get('/search', FriendController.searchUsers);
router.post('/request', FriendController.sendFriendRequest);
router.put('/request/:requestId', FriendController.respondFriendRequest);
router.get('/requests', FriendController.getFriendRequests);
router.delete('/:friendId', FriendController.removeFriend);
router.get('/status/:userId', FriendController.checkFriendStatus);

module.exports = router;
