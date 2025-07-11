const BaseController = require('./BaseController');
const PostService = require('../services/PostService');
const CommentService = require('../services/CommentService');

class PostController extends BaseController {
    constructor() {
        super();
        this.postService = new PostService();
        this.commentService = new CommentService();
    }

    // Create mixed-content post
    createPost = this.handleAsync(async (req, res) => {
        console.log('Creating mixed-content post');
        console.log('Request body:', req.body);
        console.log('Uploaded files:', req.files ? req.files.length : 0);

        const { title, description, content_text } = req.body;

        if (!title || !title.trim()) {
            return this.sendError(res, 'Post title is required', 400);
        }

        try {
            // 准备帖子数据
            const postData = {
                user_id: req.user.id,
                title: title.trim(),
                description: description ? description.trim() : null,
                content_text: content_text ? content_text.trim() : null
            };

            console.log('Post data to save:', postData);
            console.log('Files to process:', req.files ? req.files.map(f => ({ name: f.originalname, size: f.size, type: f.mimetype })) : []);

            // 创建帖子（包括媒体文件处理）
            const post = await this.postService.createPost(postData, req.files);
            
            console.log('Mixed-content post created successfully:', post.id);
            this.sendSuccess(res, post, 'Post created successfully', 201);
        } catch (error) {
            console.error('Error creating mixed-content post:', error);
            this.sendError(res, error.message, 400);
        }
    });

    // Get post list (supports new data structure)  
    getPosts = this.handleAsync(async (req, res) => {
        const { page, limit, offset } = this.getPagination(req);
        const userId = req.query.user_id;

        try {
            const result = await this.postService.getPostsWithUserInfo(offset, limit, userId);
            
            const response = {
                posts: result.data,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            };

            this.sendSuccess(res, response, 'Post list retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to retrieve post list', 500, error.message);
        }
    });

    // Get single post details
    getPost = this.handleAsync(async (req, res) => {
        const { id } = req.params;

        try {
            const post = await this.postService.getPostById(id);
            if (!post) {
                return this.sendError(res, 'Post not found', 404);
            }

            this.sendSuccess(res, post, 'Post details retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to retrieve post details', 500, error.message);
        }
    });

    // Update post (text content only)
    updatePost = this.handleAsync(async (req, res) => {
        const { id } = req.params;
        const { title, description, content_text } = req.body;

        try {
            const updatedPost = await this.postService.updatePost(id, req.user.id, {
                title: title || null,
                description: description || null,
                content_text: content_text || null
            });

            this.sendSuccess(res, updatedPost, 'Post updated successfully');
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });

    // Delete post (includes media cleanup)
    deletePost = this.handleAsync(async (req, res) => {
        const { id } = req.params;

        try {
            await this.postService.deletePost(id, req.user.id);
            this.sendSuccess(res, null, 'Post deleted successfully');
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });

    // Like/unlike post (unchanged)
    toggleLike = this.handleAsync(async (req, res) => {
        const { id } = req.params;

        try {
            const result = await this.postService.toggleLike(id, req.user.id);
            this.sendSuccess(res, result, result.liked ? 'Post liked successfully' : 'Post unliked successfully');
        } catch (error) {
            this.sendError(res, 'Operation failed', 500, error.message);
        }
    });

    // Comment methods (unchanged)
    getComments = this.handleAsync(async (req, res) => {
        const { id } = req.params;
        const { page, limit, offset } = this.getPagination(req);

        try {
            const result = await this.commentService.getCommentsByPostId(id, offset, limit);
            
            const response = {
                comments: result.data,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            };

            this.sendSuccess(res, response, 'Comment list retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to retrieve comment list', 500, error.message);
        }
    });

    addComment = this.handleAsync(async (req, res) => {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return this.sendError(res, 'Comment content cannot be empty', 400);
        }

        try {
            const comment = await this.commentService.createComment({
                post_id: id,
                user_id: req.user.id,
                content: content.trim()
            });

            this.sendSuccess(res, comment, 'Comment added successfully', 201);
        } catch (error) {
            this.sendError(res, 'Failed to add comment', 500, error.message);
        }
    });

    deleteComment = this.handleAsync(async (req, res) => {
        const { commentId } = req.params;

        try {
            await this.commentService.deleteComment(commentId, req.user.id);
            this.sendSuccess(res, null, 'Comment deleted successfully');
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });
}

module.exports = new PostController();
