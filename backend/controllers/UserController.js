const BaseController = require('./BaseController');
const UserService = require('../services/UserService');
const PostService = require('../services/PostService');
const LikeService = require('../services/LikeService');

class UserController extends BaseController {
    constructor() {
        super();
        this.userService = new UserService();
        this.postService = new PostService();
        this.likeService = new LikeService();
    }

    // 获取用户信息
    getUserById = this.handleAsync(async (req, res) => {
        const { id } = req.params;

        try {
            const user = await this.userService.getUserProfile(id);
            if (!user) {
                return this.sendError(res, 'User not found', 404);
            }

            this.sendSuccess(res, user, 'User profile retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to get user profile', 500, error.message);
        }
    });

    // 获取用户的帖子
    getUserPosts = this.handleAsync(async (req, res) => {
        const { id } = req.params;
        const { page, limit, offset } = this.getPagination(req);

        try {
            const result = await this.postService.getPostsWithUserInfo(offset, limit, id);
            
            // If current user is viewing, add like status
            if (req.user && req.user.id) {
                const postIds = result.data.map(post => post.id);
                const likeStatuses = await this.likeService.getUserLikeStatusBatch(postIds, req.user.id);
                
                result.data.forEach(post => {
                    post.user_liked = likeStatuses[post.id] || false;
                });
            }
            
            const response = {
                posts: result.data,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            };

            this.sendSuccess(res, response, 'User posts retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to get user posts', 500, error.message);
        }
    });

    // 获取用户点赞的帖子
    getUserLikedPosts = this.handleAsync(async (req, res) => {
        const { id } = req.params;
        const { page, limit, offset } = this.getPagination(req);

        try {
            const result = await this.postService.getUserLikedPosts(id, offset, limit);
            
            const response = {
                posts: result.data,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            };

            this.sendSuccess(res, response, 'User liked posts retrieved successfully');
        } catch (error) {
            console.error('Error getting user liked posts:', error);
            this.sendError(res, 'Failed to get liked posts', 500, error.message);
        }
    });

    // 搜索用户
    searchUsers = this.handleAsync(async (req, res) => {
        const { keyword } = req.query;
        const { page, limit, offset } = this.getPagination(req);

        if (!keyword || keyword.trim().length === 0) {
            return this.sendError(res, 'Search keyword is required', 400);
        }

        try {
            const searchTerm = `%${keyword.trim()}%`;
            
            // 使用字符串拼接避免LIMIT参数问题
            const userQuery = `
                SELECT id, username, email, avatar, created_at 
                FROM users 
                WHERE username LIKE ? OR email LIKE ? 
                ORDER BY created_at DESC 
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;
            
            const [users] = await this.userService.db.execute(userQuery, [searchTerm, searchTerm]);

            const [countResult] = await this.userService.db.execute(
                'SELECT COUNT(*) as total FROM users WHERE username LIKE ? OR email LIKE ?',
                [searchTerm, searchTerm]
            );

            const response = {
                users,
                pagination: {
                    page,
                    limit,
                    total: countResult[0].total,
                    totalPages: Math.ceil(countResult[0].total / limit)
                }
            };

            this.sendSuccess(res, response, 'User search completed successfully');
        } catch (error) {
            console.error('Error in searchUsers:', error);
            this.sendError(res, 'Search failed', 500, error.message);
        }
    });
}

module.exports = new UserController();
