const BaseController = require('./BaseController');
const FriendService = require('../services/FriendService');

class FriendController extends BaseController {
    constructor() {
        super();
        this.friendService = new FriendService();
    }

    // 搜索用户（添加好友时使用）- 重点修复
    searchUsers = this.handleAsync(async (req, res) => {
        console.log('=== searchUsers called ===', { 
            query: req.query, 
            userId: req.user.id,
            ip: req.ip
        });

        const { keyword } = req.query;
        
        // 确保分页参数是正确的数字类型
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        console.log('Pagination params:', { page, limit, offset });

        if (!keyword || keyword.trim().length === 0) {
            console.log('Search keyword missing');
            return this.sendError(res, 'Search keyword is required', 400, 'Keyword parameter is empty');
        }

        try {
            console.log('Calling friendService.searchUsersForFriend with:', {
                userId: req.user.id,
                keyword: keyword.trim(),
                offset,
                limit
            });

            const result = await this.friendService.searchUsersForFriend(
                req.user.id, 
                keyword.trim(), 
                offset, 
                limit
            );
            
            console.log('Search result:', { 
                userCount: result.data.length, 
                total: result.total 
            });

            const response = {
                users: result.data,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            };

            this.sendSuccess(res, response, 'User search completed');
        } catch (error) {
            console.error('Error in searchUsers:', error);
            console.error('Error stack:', error.stack);
            this.sendError(res, 'Search failed', 500, error.message);
        }
    });

    // 其他方法保持不变
    getFriends = this.handleAsync(async (req, res) => {
        try {
            const friends = await this.friendService.getFriendsList(req.user.id);
            this.sendSuccess(res, { friends }, 'Friends list retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to get friends list', 500, error.message);
        }
    });

    sendFriendRequest = this.handleAsync(async (req, res) => {
        const { userId } = req.body;

        if (!userId) {
            return this.sendError(res, 'User ID is required', 400, 'userId field missing');
        }

        if (parseInt(userId) === req.user.id) {
            return this.sendError(res, 'Cannot send friend request to yourself', 400);
        }

        try {
            await this.friendService.sendFriendRequest(req.user.id, userId);
            this.sendSuccess(res, null, 'Friend request sent successfully');
        } catch (error) {
            this.sendError(res, error.message, 400, error.message);
        }
    });

    respondFriendRequest = this.handleAsync(async (req, res) => {
        const { requestId } = req.params;
        const { action } = req.body;

        if (!['accept', 'reject'].includes(action)) {
            return this.sendError(res, 'Invalid action. Must be accept or reject', 400);
        }

        try {
            await this.friendService.respondToFriendRequest(requestId, req.user.id, action);
            this.sendSuccess(res, null, `Friend request ${action}ed successfully`);
        } catch (error) {
            this.sendError(res, error.message, 400, error.message);
        }
    });

    getFriendRequests = this.handleAsync(async (req, res) => {
        const { status } = req.query;
        try {
            const requests = await this.friendService.getFriendRequests(req.user.id, status);
            this.sendSuccess(res, { requests }, 'Friend requests retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to get friend requests', 500, error.message);
        }
    });

    removeFriend = this.handleAsync(async (req, res) => {
        const { friendId } = req.params;
        try {
            await this.friendService.removeFriend(req.user.id, friendId);
            this.sendSuccess(res, null, 'Friend removed successfully');
        } catch (error) {
            this.sendError(res, error.message, 400, error.message);
        }
    });

    checkFriendStatus = this.handleAsync(async (req, res) => {
        const { userId } = req.params;
        try {
            const status = await this.friendService.getFriendStatus(req.user.id, userId);
            this.sendSuccess(res, { status }, 'Friend status retrieved');
        } catch (error) {
            this.sendError(res, 'Failed to check friend status', 500, error.message);
        }
    });
}

module.exports = new FriendController();
