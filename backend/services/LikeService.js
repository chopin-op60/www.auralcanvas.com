const BaseService = require('./BaseService');

class LikeService extends BaseService {
    constructor() {
        super('likes');
    }

    // 切换点赞状态
    async toggleLike(postId, userId) {
        try {
            const safePostId = parseInt(postId);
            const safeUserId = parseInt(userId);

            console.log('Toggling like for post:', safePostId, 'user:', safeUserId);

            // 检查帖子是否存在
            const [post] = await this.db.execute(
                'SELECT id FROM posts WHERE id = ?',
                [safePostId]
            );

            if (post.length === 0) {
                throw new Error('Post not found');
            }

            // 检查是否已点赞
            const [existingLike] = await this.db.execute(
                'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
                [safePostId, safeUserId]
            );

            let isLiked = false;

            if (existingLike.length > 0) {
                // 取消点赞
                await this.db.execute(
                    'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
                    [safePostId, safeUserId]
                );
                isLiked = false;
                console.log('Like removed');
            } else {
                // 添加点赞
                await this.db.execute(
                    'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
                    [safePostId, safeUserId]
                );
                isLiked = true;
                console.log('Like added');
            }

            // 更新帖子点赞计数
            await this.updatePostLikeCount(safePostId);

            // 获取最新点赞数
            const [likesCount] = await this.db.execute(
                'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
                [safePostId]
            );

            return {
                liked: isLiked,
                likes_count: likesCount[0].count
            };
        } catch (error) {
            console.error('Error in toggleLike:', error);
            throw error;
        }
    }

    // 获取用户对帖子的点赞状态
    async getUserLikeStatus(postId, userId) {
        try {
            const safePostId = parseInt(postId);
            const safeUserId = parseInt(userId);

            const [like] = await this.db.execute(
                'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
                [safePostId, safeUserId]
            );

            return like.length > 0;
        } catch (error) {
            console.error('Error in getUserLikeStatus:', error);
            throw error;
        }
    }

    // 获取帖子点赞列表
    async getPostLikes(postId, offset = 0, limit = 20) {
        try {
            const safePostId = parseInt(postId);
            const safeOffset = parseInt(offset);
            const safeLimit = parseInt(limit);

            const query = `
                SELECT 
                    l.id,
                    l.created_at,
                    u.id as user_id,
                    u.username,
                    u.avatar
                FROM likes l
                JOIN users u ON l.user_id = u.id
                WHERE l.post_id = ?
                ORDER BY l.created_at DESC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;

            const [likes] = await this.db.execute(query, [safePostId]);

            const countQuery = 'SELECT COUNT(*) as total FROM likes WHERE post_id = ?';
            const [countResult] = await this.db.execute(countQuery, [safePostId]);

            return {
                data: likes,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('Error in getPostLikes:', error);
            throw error;
        }
    }

    // 更新帖子的点赞计数
    async updatePostLikeCount(postId) {
        try {
            const safePostId = parseInt(postId);

            const [countResult] = await this.db.execute(
                'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
                [safePostId]
            );

            await this.db.execute(
                'UPDATE posts SET likes_count = ? WHERE id = ?',
                [countResult[0].count, safePostId]
            );

            console.log('Updated post likes count:', countResult[0].count);
            return countResult[0].count;
        } catch (error) {
            console.error('Error in updatePostLikeCount:', error);
            throw error;
        }
    }

    // 批量获取用户对多个帖子的点赞状态
    async getUserLikeStatusBatch(postIds, userId) {
        try {
            if (!postIds || postIds.length === 0) return {};

            const safePostIds = postIds.map(id => parseInt(id));
            const safeUserId = parseInt(userId);

            const placeholders = safePostIds.map(() => '?').join(',');
            const query = `
                SELECT post_id 
                FROM likes 
                WHERE post_id IN (${placeholders}) AND user_id = ?
            `;

            const [likes] = await this.db.execute(query, [...safePostIds, safeUserId]);

            // 转换为对象格式 {postId: true/false}
            const result = {};
            safePostIds.forEach(postId => {
                result[postId] = likes.some(like => like.post_id === postId);
            });

            return result;
        } catch (error) {
            console.error('Error in getUserLikeStatusBatch:', error);
            throw error;
        }
    }
}

module.exports = LikeService;
