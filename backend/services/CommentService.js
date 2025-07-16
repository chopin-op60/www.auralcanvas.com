const BaseService = require('./BaseService');

class CommentService extends BaseService {
    constructor() {
        super('comments');
    }

    async createComment(commentData) {
        try {
            console.log('Creating comment with data:', commentData);
            
            const safePostId = parseInt(commentData.post_id);
            const safeUserId = parseInt(commentData.user_id);
            const content = commentData.content ? commentData.content.trim() : '';

            if (!content || content.length === 0) {
                throw new Error('Comment content cannot be empty');
            }

            // 创建评论
            const result = await this.create({
                post_id: safePostId,
                user_id: safeUserId,
                content: content
            });

            console.log('Comment created:', result.id);

            // 更新帖子评论计数
            await this.updatePostCommentsCount(safePostId);

            return result;
        } catch (error) {
            console.error('Error in createComment:', error);
            throw error;
        }
    }

    async getCommentsByPostId(postId, offset = 0, limit = 10) {
        try {
            const safePostId = parseInt(postId);
            const safeOffset = parseInt(offset);
            const safeLimit = parseInt(limit);

            console.log('Getting comments for post:', safePostId, 'offset:', safeOffset, 'limit:', safeLimit);

            // 使用字符串拼接避免参数问题
            const query = `
                SELECT 
                    c.*,
                    u.username,
                    u.avatar as user_avatar
                FROM comments c 
                JOIN users u ON c.user_id = u.id 
                WHERE c.post_id = ?
                ORDER BY c.created_at DESC 
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;
            
            const [rows] = await this.db.execute(query, [safePostId]);
            
            const countQuery = 'SELECT COUNT(*) as total FROM comments WHERE post_id = ?';
            const [countResult] = await this.db.execute(countQuery, [safePostId]);
            
            console.log('Found comments:', rows.length, 'Total:', countResult[0].total);
            
            return {
                data: rows,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('Error in getCommentsByPostId:', error);
            throw error;
        }
    }

    async deleteComment(id, userId) {
        try {
            const safeId = parseInt(id);
            const safeUserId = parseInt(userId);

            const comment = await this.findById(safeId);
            if (!comment) {
                throw new Error('Comment not found');
            }
            
            if (comment.user_id !== safeUserId) {
                throw new Error('Permission denied');
            }

            // 获取帖子ID用于更新计数
            const postId = comment.post_id;

            // 删除评论
            const result = await this.delete(safeId);

            // 更新帖子评论计数
            await this.updatePostCommentsCount(postId);

            console.log('Comment deleted:', safeId);
            return result;
        } catch (error) {
            console.error('Error in deleteComment:', error);
            throw error;
        }
    }

    // 更新帖子的评论计数
    async updatePostCommentsCount(postId) {
        try {
            const safePostId = parseInt(postId);

            const [countResult] = await this.db.execute(
                'SELECT COUNT(*) as count FROM comments WHERE post_id = ?',
                [safePostId]
            );

            await this.db.execute(
                'UPDATE posts SET comments_count = ? WHERE id = ?',
                [countResult[0].count, safePostId]
            );

            console.log('Updated post comments count:', countResult[0].count);
            return countResult[0].count;
        } catch (error) {
            console.error('Error in updatePostCommentsCount:', error);
            throw error;
        }
    }

    // 获取评论详情（包含用户信息）
    async getCommentById(id) {
        try {
            const safeId = parseInt(id);

            const query = `
                SELECT 
                    c.*,
                    u.username,
                    u.avatar as user_avatar
                FROM comments c 
                JOIN users u ON c.user_id = u.id 
                WHERE c.id = ?
            `;

            const [rows] = await this.db.execute(query, [safeId]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in getCommentById:', error);
            throw error;
        }
    }
}

module.exports = CommentService;
