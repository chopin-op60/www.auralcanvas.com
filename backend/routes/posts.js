const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const auth = require('../middleware/auth');
const upload = require('../utils/fileUpload');

// Public routes
router.get('/test', (req, res) => {
    res.json({ 
        success: true,
        message: 'Posts API working!',
        data: { message: 'Posts module ready for development' },
        timestamp: new Date().toISOString()
    });
});

router.get('/', PostController.getPosts);
router.get('/:id', PostController.getPost);

// Protected routes (require authentication)
router.post('/', auth, upload.single('file'), PostController.createPost);
router.put('/:id', auth, PostController.updatePost);
router.delete('/:id', auth, PostController.deletePost);
router.post('/:id/like', auth, PostController.toggleLike);

// Comments routes
router.get('/:id/comments', PostController.getComments);
router.post('/:id/comments', auth, PostController.addComment);
router.delete('/comments/:commentId', auth, PostController.deleteComment);

module.exports = router;
