const BaseController = require('./BaseController');
const MessageService = require('../services/MessageService');

class MessageController extends BaseController {
    constructor() {
        super();
        this.messageService = new MessageService();
    }

    // 获取对话列表
    getConversations = this.handleAsync(async (req, res) => {
        try {
            const conversations = await this.messageService.getUserConversations(req.user.id);
            this.sendSuccess(res, { conversations }, 'Conversations retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to get conversations', 500, error.message);
        }
    });

    // 获取对话消息
    getConversationMessages = this.handleAsync(async (req, res) => {
        const { conversationId } = req.params;
        const { page, limit, offset } = this.getPagination(req);

        try {
            // 验证用户是否属于此对话
            const hasAccess = await this.messageService.hasConversationAccess(conversationId, req.user.id);
            if (!hasAccess) {
                return this.sendError(res, 'Access denied to this conversation', 403);
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
            this.sendError(res, 'Failed to get messages', 500, error.message);
        }
    });

    // 发送消息
    sendMessage = this.handleAsync(async (req, res) => {
        const { conversationId, receiverId, content } = req.body;

        if (!content || content.trim().length === 0) {
            return this.sendError(res, 'Message content is required', 400);
        }

        try {
            let finalConversationId = conversationId;

            // 如果没有对话ID但有接收者ID，创建对话
            if (!conversationId && receiverId) {
                const conversation = await this.messageService.createOrGetConversation(req.user.id, receiverId);
                finalConversationId = conversation.id;
            }

            if (!finalConversationId) {
                return this.sendError(res, 'Conversation ID or receiver ID is required', 400);
            }

            // 验证用户是否属于此对话
            const hasAccess = await this.messageService.hasConversationAccess(finalConversationId, req.user.id);
            if (!hasAccess) {
                return this.sendError(res, 'Access denied to this conversation', 403);
            }

            const message = await this.messageService.sendMessage({
                conversationId: finalConversationId,
                senderId: req.user.id,
                receiverId: receiverId,
                content: content.trim()
            });

            this.sendSuccess(res, { message }, 'Message sent successfully', 201);
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });

    // 创建或获取对话
    createOrGetConversation = this.handleAsync(async (req, res) => {
        const { userId } = req.body;

        if (!userId) {
            return this.sendError(res, 'User ID is required', 400);
        }

        if (userId === req.user.id) {
            return this.sendError(res, 'Cannot create conversation with yourself', 400);
        }

        try {
            const conversation = await this.messageService.createOrGetConversation(req.user.id, userId);
            this.sendSuccess(res, { conversation }, 'Conversation created/retrieved successfully');
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });

    // 标记消息为已读
    markMessageAsRead = this.handleAsync(async (req, res) => {
        const { messageId } = req.params;

        try {
            await this.messageService.markMessageAsRead(messageId, req.user.id);
            this.sendSuccess(res, null, 'Message marked as read');
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });

    // 标记对话为已读
    markConversationAsRead = this.handleAsync(async (req, res) => {
        const { conversationId } = req.params;

        try {
            await this.messageService.markConversationAsRead(conversationId, req.user.id);
            this.sendSuccess(res, null, 'Conversation marked as read');
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });

    // 获取未读消息数量
    getUnreadCount = this.handleAsync(async (req, res) => {
        try {
            const count = await this.messageService.getUnreadCount(req.user.id);
            this.sendSuccess(res, { count }, 'Unread count retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to get unread count', 500, error.message);
        }
    });
}

module.exports = new MessageController();
