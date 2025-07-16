const BaseController = require('./BaseController');
const UserService = require('../services/UserService');
const PostService = require('../services/PostService');

class UserController extends BaseController {
    constructor() {
        super();
        this.userService = new UserService();
        this.postService = new PostService();
    }

    // 获取用户信息
    getUserById = this.handleAsync(async (req, res) => {
        const { id } = req.params;

        try {
            const user = await this.userService.getUserProfile(id);
            if (!user) {
                return this.sendError(res, '用户不存在', 404);
            }

            this.sendSuccess(res, user, '获取用户信息成功');
        } catch (error) {
            this.sendError(res, '获取用户信息失败', 500, error.message);
        }
    });

    // 获取用户的帖子
    getUserPosts = this.handleAsync(async (req, res) => {
        const { id } = req.params;
        const { page, limit, offset } = this.getPagination(req);

        try {
            const result = await this.postService.getPostsWithUserInfo(offset, limit, id);
            
            const response = {
                posts: result.data,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            };

            this.sendSuccess(res, response, '获取用户帖子成功');
        } catch (error) {
            this.sendError(res, '获取用户帖子失败', 500, error.message);
        }
    });

    // 搜索用户
    searchUsers = this.handleAsync(async (req, res) => {
        const { keyword } = req.query;
        const { page, limit, offset } = this.getPagination(req);

        if (!keyword || keyword.trim().length === 0) {
            return this.sendError(res, '搜索关键词不能为空', 400);
        }

        try {
            const searchTerm = `%${keyword.trim()}%`;
            const [users] = await this.userService.db.execute(
                `SELECT id, username, email, avatar, created_at 
                 FROM users 
                 WHERE username LIKE ? OR email LIKE ? 
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?`,
                [searchTerm, searchTerm, limit, offset]
            );

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

            this.sendSuccess(res, response, '搜索用户成功');
        } catch (error) {
            this.sendError(res, '搜索用户失败', 500, error.message);
        }
    });
}

module.exports = new UserController();
