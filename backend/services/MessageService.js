const BaseService = require('./BaseService');

class MessageService extends BaseService {
    constructor() {
        super('messages');
    }

    // 获取用户的所有对话
    async getUserConversations(userId) {
        try {
            const safeUserId = parseInt(userId);
            console.log('Getting conversations for user:', safeUserId);
            
            const query = `
                SELECT 
                    c.id,
                    c.last_message_at,
                    c.created_at,
                    u.id as other_user_id,
                    u.username as other_user_username,
                    u.avatar as other_user_avatar,
                    u.bio as other_user_bio,
                    m.content as last_message,
                    COUNT(unread_m.id) as unread_count
                FROM conversations c
                JOIN users u ON (
                    CASE 
                        WHEN c.user1_id = ? THEN u.id = c.user2_id
                        ELSE u.id = c.user1_id
                    END
                )
                LEFT JOIN messages m ON m.conversation_id = c.id 
                    AND m.created_at = c.last_message_at
                LEFT JOIN messages unread_m ON unread_m.conversation_id = c.id 
                    AND unread_m.receiver_id = ? 
                    AND unread_m.is_read = FALSE
                WHERE c.user1_id = ? OR c.user2_id = ?
                GROUP BY c.id, u.id, m.content
                ORDER BY c.last_message_at DESC
            `;
            
            const [rows] = await this.db.execute(query, [safeUserId, safeUserId, safeUserId, safeUserId]);
            
            const conversations = rows.map(row => ({
                id: row.id,
                last_message_at: row.last_message_at,
                created_at: row.created_at,
                last_message: row.last_message,
                unread_count: row.unread_count,
                other_user: {
                    id: row.other_user_id,
                    username: row.other_user_username,
                    avatar: row.other_user_avatar,
                    bio: row.other_user_bio
                }
            }));
            
            console.log('Found conversations:', conversations.length);
            return conversations;
        } catch (error) {
            console.error('Error in getUserConversations:', error);
            throw error;
        }
    }

    // 获取对话中的消息 - 修复LIMIT参数问题
    async getConversationMessages(conversationId, offset = 0, limit = 50) {
        try {
            const safeConversationId = parseInt(conversationId);
            const safeOffset = parseInt(offset);
            const safeLimit = parseInt(limit);
            
            console.log('Getting messages for conversation:', { safeConversationId, safeOffset, safeLimit });
            
            // 使用字符串拼接避免LIMIT参数问题
            const query = `
                SELECT 
                    m.id,
                    m.conversation_id,
                    m.sender_id,
                    m.receiver_id,
                    m.content,
                    m.message_type,
                    m.is_read,
                    m.created_at,
                    u.username as sender_username,
                    u.avatar as sender_avatar
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.conversation_id = ?
                ORDER BY m.created_at ASC
                LIMIT ${safeLimit}
            `;
            
            console.log('Executing messages query:', query);
            const [messages] = await this.db.execute(query, [safeConversationId]);
            
            const countQuery = 'SELECT COUNT(*) as total FROM messages WHERE conversation_id = ?';
            const [countResult] = await this.db.execute(countQuery, [safeConversationId]);
            
            console.log('Found messages:', messages.length, 'Total:', countResult[0].total);
            
            return {
                data: messages,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('Error in getConversationMessages:', error);
            throw error;
        }
    }

    // 发送消息
    async sendMessage({ conversationId, senderId, receiverId, content, messageType = 'text' }) {
        try {
            const safeConversationId = parseInt(conversationId);
            const safeSenderId = parseInt(senderId);
            const safeReceiverId = parseInt(receiverId);
            
            console.log('Sending message:', { safeConversationId, safeSenderId, safeReceiverId, content });
            
            // 验证对话存在
            const [conversation] = await this.db.execute(
                'SELECT * FROM conversations WHERE id = ?',
                [safeConversationId]
            );
            
            if (conversation.length === 0) {
                throw new Error('Conversation not found');
            }

            // 确定接收者ID
            const conv = conversation[0];
            const actualReceiverId = safeReceiverId || (conv.user1_id === safeSenderId ? conv.user2_id : conv.user1_id);

            console.log('Actual receiver ID:', actualReceiverId);

            // 创建消息
            const message = await this.create({
                conversation_id: safeConversationId,
                sender_id: safeSenderId,
                receiver_id: actualReceiverId,
                content,
                message_type: messageType,
                is_read: false
            });

            console.log('Message created:', message.id);

            // 更新对话的最后消息时间
            await this.db.execute(
                'UPDATE conversations SET last_message_at = NOW() WHERE id = ?',
                [safeConversationId]
            );

            console.log('Updated conversation last_message_at');

            return message;
        } catch (error) {
            console.error('Error in sendMessage:', error);
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }

    // 创建或获取对话
    async createOrGetConversation(user1Id, user2Id) {
        try {
            const safeUser1Id = parseInt(user1Id);
            const safeUser2Id = parseInt(user2Id);
            
            console.log('Creating/getting conversation between:', safeUser1Id, 'and', safeUser2Id);
            
            // 确保user1Id < user2Id 以避免重复
            const [smallerId, largerId] = safeUser1Id < safeUser2Id ? [safeUser1Id, safeUser2Id] : [safeUser2Id, safeUser1Id];

            // 查找现有对话
            const [existing] = await this.db.execute(
                `SELECT * FROM conversations 
                 WHERE (user1_id = ? AND user2_id = ?) 
                 OR (user1_id = ? AND user2_id = ?)`,
                [smallerId, largerId, largerId, smallerId]
            );

            if (existing.length > 0) {
                console.log('Found existing conversation:', existing[0].id);
                return existing[0];
            }

            // 创建新对话
            const [result] = await this.db.execute(
                'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
                [smallerId, largerId]
            );

            const [newConversation] = await this.db.execute(
                'SELECT * FROM conversations WHERE id = ?',
                [result.insertId]
            );

            console.log('Created new conversation:', newConversation[0].id);
            return newConversation[0];
        } catch (error) {
            console.error('Error in createOrGetConversation:', error);
            throw error;
        }
    }

    // 检查用户是否有访问对话的权限
    async hasConversationAccess(conversationId, userId) {
        try {
            const safeConversationId = parseInt(conversationId);
            const safeUserId = parseInt(userId);
            
            const [conversation] = await this.db.execute(
                'SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
                [safeConversationId, safeUserId, safeUserId]
            );

            return conversation.length > 0;
        } catch (error) {
            console.error('Error in hasConversationAccess:', error);
            throw error;
        }
    }

    // 标记单条消息为已读
    async markMessageAsRead(messageId, userId) {
        try {
            const safeMessageId = parseInt(messageId);
            const safeUserId = parseInt(userId);
            
            const [result] = await this.db.execute(
                'UPDATE messages SET is_read = TRUE WHERE id = ? AND receiver_id = ?',
                [safeMessageId, safeUserId]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in markMessageAsRead:', error);
            throw error;
        }
    }

    // 标记对话中的所有消息为已读
    async markConversationAsRead(conversationId, userId) {
        try {
            const safeConversationId = parseInt(conversationId);
            const safeUserId = parseInt(userId);
            
            const [result] = await this.db.execute(
                'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND receiver_id = ?',
                [safeConversationId, safeUserId]
            );

            console.log('Marked', result.affectedRows, 'messages as read');
            return result.affectedRows;
        } catch (error) {
            console.error('Error in markConversationAsRead:', error);
            throw error;
        }
    }

    // 获取未读消息总数
    async getUnreadCount(userId) {
        try {
            const safeUserId = parseInt(userId);
            
            const [result] = await this.db.execute(
                'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE',
                [safeUserId]
            );

            return result[0].count;
        } catch (error) {
            console.error('Error in getUnreadCount:', error);
            throw error;
        }
    }
}

module.exports = MessageService;
