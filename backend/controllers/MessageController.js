const BaseController = require('./BaseController');
const MessageService = require('../services/MessageService');

class MessageController extends BaseController {
    constructor() {
        super();
        this.messageService = new MessageService();
    }

    // 获取用户的对话列表
    getConversations = this.handleAsync(async (req, res) => {
        try {
            const conversations = await this.messageService.getUserConversations(req.user.id);
            this.sendSuccess(res, conversations, 'Conversations retrieved successfully');
        } catch (error) {
            console.error('Error getting conversations:', error);
            this.sendError(res, 'Failed to get conversations', 500, error.message);
        }
    });

    // 获取对话中的消息
    getMessages = this.handleAsync(async (req, res) => {
        const { conversationId } = req.params;
        const { page, limit, offset } = this.getPagination(req);

        try {
            // 检查用户是否有访问权限
            const hasAccess = await this.messageService.hasConversationAccess(conversationId, req.user.id);
            if (!hasAccess) {
                return this.sendError(res, 'Access denied', 403);
            }

            const result = await this.messageService.getConversationMessages(conversationId, offset, limit);
            
            const response = {
                messages: result.data,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            };

            this.sendSuccess(res, response, 'Messages retrieved successfully');
        } catch (error) {
            console.error('Error getting messages:', error);
            this.sendError(res, 'Failed to get messages', 500, error.message);
        }
    });

    // 发送普通消息
    sendMessage = this.handleAsync(async (req, res) => {
        const { conversationId } = req.params;
        const { content, receiverId } = req.body;

        if (!content || content.trim().length === 0) {
            return this.sendError(res, 'Message content cannot be empty', 400);
        }

        if (content.trim().length > 1000) {
            return this.sendError(res, 'Message is too long (max 1000 characters)', 400);
        }

        try {
            const message = await this.messageService.sendMessage({
                conversationId,
                senderId: req.user.id,
                receiverId,
                content: content.trim()
            });

            this.sendSuccess(res, message, 'Message sent successfully', 201);
        } catch (error) {
            console.error('Error sending message:', error);
            this.sendError(res, 'Failed to send message', 500, error.message);
        }
    });

    // 分享帖子到对话
    sharePost = this.handleAsync(async (req, res) => {
        const { conversationId } = req.params;
        const { postId, comment, receiverId } = req.body;

        if (!postId) {
            return this.sendError(res, 'Post ID is required', 400);
        }

        if (comment && comment.length > 500) {
            return this.sendError(res, 'Comment is too long (max 500 characters)', 400);
        }

        try {
            const message = await this.messageService.sharePostToConversation({
                conversationId,
                senderId: req.user.id,
                receiverId,
                postId: parseInt(postId),
                comment: comment || null
            });

            this.sendSuccess(res, message, 'Post shared successfully', 201);
        } catch (error) {
            console.error('Error sharing post:', error);
            this.sendError(res, error.message, 400);
        }
    });

    // 创建或获取对话
    createConversation = this.handleAsync(async (req, res) => {
        const { userId } = req.body;

        if (!userId) {
            return this.sendError(res, 'User ID is required', 400);
        }

        if (parseInt(userId) === req.user.id) {
            return this.sendError(res, 'Cannot create conversation with yourself', 400);
        }

        try {
            const conversation = await this.messageService.createOrGetConversation(
                req.user.id,
                parseInt(userId)
            );

            this.sendSuccess(res, { conversation }, 'Conversation created/retrieved successfully', 201);
        } catch (error) {
            console.error('Error creating conversation:', error);
            this.sendError(res, 'Failed to create conversation', 500, error.message);
        }
    });

    // 标记对话为已读
    markAsRead = this.handleAsync(async (req, res) => {
        const { conversationId } = req.params;

        try {
            // 检查用户是否有访问权限
            const hasAccess = await this.messageService.hasConversationAccess(conversationId, req.user.id);
            if (!hasAccess) {
                return this.sendError(res, 'Access denied', 403);
            }

            const count = await this.messageService.markConversationAsRead(conversationId, req.user.id);
            this.sendSuccess(res, { markedCount: count }, 'Messages marked as read successfully');
        } catch (error) {
            console.error('Error marking as read:', error);
            this.sendError(res, 'Failed to mark messages as read', 500, error.message);
        }
    });

    // 获取未读消息数
    getUnreadCount = this.handleAsync(async (req, res) => {
        try {
            const count = await this.messageService.getUnreadCount(req.user.id);
            this.sendSuccess(res, { unreadCount: count }, 'Unread count retrieved successfully');
        } catch (error) {
            console.error('Error getting unread count:', error);
            this.sendError(res, 'Failed to get unread count', 500, error.message);
        }
    });
}

module.exports = new MessageController();
