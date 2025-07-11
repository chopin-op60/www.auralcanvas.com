const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const auth = require('../middleware/auth');
const { upload, debugUpload } = require('../utils/fileUpload');

// Public routes
router.get('/test', (req, res) => {
    res.json({ 
        success: true,
        message: 'Mixed-content Posts API is ready!',
        data: { 
            message: 'Posts now support mixed content (text + images + audio)',
            features: ['Multi-file upload', 'Mixed content types', 'Media management'],
            supportedFormats: {
                images: ['JPEG', 'PNG', 'GIF', 'WebP'],
                audio: ['MP3', 'WAV', 'M4A', 'OGG', 'FLAC']
            }
        },
        timestamp: new Date().toISOString()
    });
});

router.get('/', PostController.getPosts);
router.get('/:id', PostController.getPost);

// Protected routes (require authentication)
// Enhanced with debug upload middleware
router.post('/', auth, debugUpload, PostController.createPost);
router.put('/:id', auth, PostController.updatePost);
router.delete('/:id', auth, PostController.deletePost);
router.post('/:id/like', auth, PostController.toggleLike);

// Comments routes
router.get('/:id/comments', PostController.getComments);
router.post('/:id/comments', auth, PostController.addComment);
router.delete('/comments/:commentId', auth, PostController.deleteComment);

module.exports = router;
