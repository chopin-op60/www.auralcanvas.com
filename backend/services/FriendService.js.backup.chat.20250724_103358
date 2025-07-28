const BaseService = require('./BaseService');

class FriendService extends BaseService {
    constructor() {
        super('friends');
    }

    // 获取好友列表 - 简化版本
    async getFriendsList(userId) {
        try {
            const query = `
                SELECT 
                    u.id,
                    u.username,
                    u.email,
                    u.avatar,
                    u.bio,
                    f.created_at as friendship_date
                FROM friends f
                JOIN users u ON (
                    CASE 
                        WHEN f.user_id = ? THEN u.id = f.friend_id
                        ELSE u.id = f.user_id
                    END
                )
                WHERE (f.user_id = ? OR f.friend_id = ?) 
                AND f.status = 'accepted'
                ORDER BY f.created_at DESC
            `;
            
            const [friends] = await this.db.execute(query, [userId, userId, userId]);
            return friends;
        } catch (error) {
            console.error('Error in getFriendsList:', error);
            throw error;
        }
    }

    // 搜索用户 - 使用字符串拼接避免参数问题
    async searchUsersForFriend(currentUserId, keyword, offset = 0, limit = 10) {
        try {
            console.log('Starting searchUsersForFriend with params:', { currentUserId, keyword, offset, limit });
            
            // 确保参数是正确的类型
            const safeUserId = parseInt(currentUserId);
            const safeLimit = parseInt(limit);
            const searchTerm = `%${keyword}%`;
            
            console.log('Converted params:', { safeUserId, safeLimit, searchTerm });
            
            // 使用字符串拼接来避免LIMIT参数问题
            const userQuery = `
                SELECT id, username, email, avatar, bio
                FROM users 
                WHERE (username LIKE ? OR email LIKE ?)
                AND id != ?
                ORDER BY username
                LIMIT ${safeLimit}
            `;
            
            console.log('Final query:', userQuery);
            console.log('Query params:', [searchTerm, searchTerm, safeUserId]);
            
            const [allUsers] = await this.db.execute(userQuery, [
                searchTerm, searchTerm, safeUserId
            ]);

            console.log('Found users:', allUsers.length, allUsers.map(u => u.username));

            // 获取总数
            const countQuery = `
                SELECT COUNT(*) as total
                FROM users 
                WHERE (username LIKE ? OR email LIKE ?)
                AND id != ?
            `;
            
            const [countResult] = await this.db.execute(countQuery, [
                searchTerm, searchTerm, safeUserId
            ]);

            const total = countResult[0].total;
            console.log('Total matching users:', total);

            return {
                data: allUsers,
                total: total
            };
        } catch (error) {
            console.error('Error in searchUsersForFriend:', error);
            throw error;
        }
    }

    // 发送好友请求
    async sendFriendRequest(fromUserId, toUserId) {
        try {
            const safeFromId = parseInt(fromUserId);
            const safeToId = parseInt(toUserId);
            
            console.log('Sending friend request from:', safeFromId, 'to:', safeToId);
            
            // 检查目标用户是否存在
            const [targetUser] = await this.db.execute(
                'SELECT id FROM users WHERE id = ?',
                [safeToId]
            );
            
            if (targetUser.length === 0) {
                throw new Error('User not found');
            }
            
            // 检查是否已存在好友关系
            const [existing] = await this.db.execute(
                `SELECT id, status FROM friends 
                 WHERE (user_id = ? AND friend_id = ?) 
                 OR (user_id = ? AND friend_id = ?)`,
                [safeFromId, safeToId, safeToId, safeFromId]
            );
            
            if (existing.length > 0) {
                const status = existing[0].status;
                if (status === 'accepted') {
                    throw new Error('Already friends');
                } else if (status === 'pending') {
                    throw new Error('Friend request already sent');
                } else if (status === 'blocked') {
                    throw new Error('Cannot send friend request');
                }
            }
            
            // 创建好友请求
            const result = await this.create({
                user_id: safeFromId,
                friend_id: safeToId,
                status: 'pending'
            });
            
            console.log('Friend request created:', result.id);
            return result;
        } catch (error) {
            console.error('Error in sendFriendRequest:', error);
            throw error;
        }
    }

    // 响应好友请求
    async respondToFriendRequest(requestId, responderId, action) {
        try {
            const safeRequestId = parseInt(requestId);
            const safeResponderId = parseInt(responderId);
            
            console.log('Responding to friend request:', { safeRequestId, safeResponderId, action });
            
            // 查找好友请求
            const [request] = await this.db.execute(
                'SELECT * FROM friends WHERE id = ? AND friend_id = ? AND status = ?',
                [safeRequestId, safeResponderId, 'pending']
            );
            
            if (request.length === 0) {
                throw new Error('Friend request not found or not pending');
            }
            
            if (action === 'accept') {
                // 更新请求状态为已接受
                await this.update(safeRequestId, { status: 'accepted' });
                console.log('Friend request accepted');
            } else if (action === 'reject') {
                // 删除请求记录
                await this.delete(safeRequestId);
                console.log('Friend request rejected and deleted');
            }
            
            return true;
        } catch (error) {
            console.error('Error in respondToFriendRequest:', error);
            throw error;
        }
    }

    // 获取好友请求列表
    async getFriendRequests(userId, status = 'pending') {
        try {
            const safeUserId = parseInt(userId);
            
            const query = `
                SELECT 
                    f.id as request_id,
                    f.status,
                    f.created_at,
                    u.id,
                    u.username,
                    u.email,
                    u.avatar,
                    u.bio
                FROM friends f
                JOIN users u ON f.user_id = u.id
                WHERE f.friend_id = ?
                AND f.status = ?
                ORDER BY f.created_at DESC
            `;
            
            const [requests] = await this.db.execute(query, [safeUserId, status]);
            return requests;
        } catch (error) {
            console.error('Error in getFriendRequests:', error);
            throw error;
        }
    }

    // 删除好友
    async removeFriend(userId, friendId) {
        try {
            const safeUserId = parseInt(userId);
            const safeFriendId = parseInt(friendId);
            
            // 查找好友关系
            const [friendship] = await this.db.execute(
                `SELECT id FROM friends 
                 WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
                 AND status = ?`,
                [safeUserId, safeFriendId, safeFriendId, safeUserId, 'accepted']
            );
            
            if (friendship.length === 0) {
                throw new Error('Friendship not found');
            }
            
            // 删除好友关系
            return await this.delete(friendship[0].id);
        } catch (error) {
            console.error('Error in removeFriend:', error);
            throw error;
        }
    }

    // 检查好友状态
    async getFriendStatus(userId, otherUserId) {
        try {
            const safeUserId = parseInt(userId);
            const safeOtherUserId = parseInt(otherUserId);
            
            const [relationship] = await this.db.execute(
                `SELECT status FROM friends 
                 WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
                [safeUserId, safeOtherUserId, safeOtherUserId, safeUserId]
            );
            
            if (relationship.length === 0) {
                return 'none';
            }
            
            return relationship[0].status;
        } catch (error) {
            console.error('Error in getFriendStatus:', error);
            throw error;
        }
    }
}

module.exports = FriendService;
