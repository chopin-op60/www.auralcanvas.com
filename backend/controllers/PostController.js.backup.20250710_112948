const BaseController = require('./BaseController');
const PostService = require('../services/PostService');
const CommentService = require('../services/CommentService');

class PostController extends BaseController {
    constructor() {
        super();
        this.postService = new PostService();
        this.commentService = new CommentService();
    }

    // 创建帖子
    createPost = this.handleAsync(async (req, res) => {
        const { title, description, content_type, content_text } = req.body;

        if (!title || !content_type) {
            return this.sendError(res, '标题和内容类型不能为空', 400);
        }

        try {
            const postData = {
                user_id: req.user.id,
                title,
                description,
                content_type,
                content_text: content_text || null,
                file_path: req.file ? `/uploads/${content_type}s/${req.file.filename}` : null
            };

            // 验证内容完整性
            if (content_type === 'text' && !content_text) {
                return this.sendError(res, '文本帖子必须包含内容', 400);
            }

            if ((content_type === 'image' || content_type === 'music') && !req.file) {
                return this.sendError(res, `${content_type === 'image' ? '图片' : '音乐'}帖子必须上传文件`, 400);
            }

            const post = await this.postService.createPost(postData);
            this.sendSuccess(res, post, '帖子创建成功', 201);
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });

    // 获取帖子列表
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

            this.sendSuccess(res, response, '获取帖子列表成功');
        } catch (error) {
            this.sendError(res, '获取帖子列表失败', 500, error.message);
        }
    });

    // 获取单个帖子详情
    getPost = this.handleAsync(async (req, res) => {
        const { id } = req.params;

        try {
            const post = await this.postService.getPostById(id);
            if (!post) {
                return this.sendError(res, '帖子不存在', 404);
            }

            this.sendSuccess(res, post, '获取帖子详情成功');
        } catch (error) {
            this.sendError(res, '获取帖子详情失败', 500, error.message);
        }
    });

    // 更新帖子
    updatePost = this.handleAsync(async (req, res) => {
        const { id } = req.params;
        const { title, description, content_text } = req.body;

        try {
            const updatedPost = await this.postService.updatePost(id, req.user.id, {
                title,
                description,
                content_text
            });

            this.sendSuccess(res, updatedPost, '帖子更新成功');
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });

    // 删除帖子
    deletePost = this.handleAsync(async (req, res) => {
        const { id } = req.params;

        try {
            await this.postService.deletePost(id, req.user.id);
            this.sendSuccess(res, null, '帖子删除成功');
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });

    // 点赞/取消点赞
    toggleLike = this.handleAsync(async (req, res) => {
        const { id } = req.params;

        try {
            const result = await this.postService.toggleLike(id, req.user.id);
            this.sendSuccess(res, result, result.liked ? '点赞成功' : '取消点赞成功');
        } catch (error) {
            this.sendError(res, '操作失败', 500, error.message);
        }
    });

    // 获取帖子评论
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

            this.sendSuccess(res, response, '获取评论列表成功');
        } catch (error) {
            this.sendError(res, '获取评论列表失败', 500, error.message);
        }
    });

    // 添加评论
    addComment = this.handleAsync(async (req, res) => {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return this.sendError(res, '评论内容不能为空', 400);
        }

        try {
            const comment = await this.commentService.createComment({
                post_id: id,
                user_id: req.user.id,
                content: content.trim()
            });

            this.sendSuccess(res, comment, '评论添加成功', 201);
        } catch (error) {
            this.sendError(res, '添加评论失败', 500, error.message);
        }
    });

    // 删除评论
    deleteComment = this.handleAsync(async (req, res) => {
        const { commentId } = req.params;

        try {
            await this.commentService.deleteComment(commentId, req.user.id);
            this.sendSuccess(res, null, '评论删除成功');
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });
}

module.exports = new PostController();
