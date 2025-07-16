const BaseService = require('./BaseService');

class CommentService extends BaseService {
    constructor() {
        super('comments');
    }

    async createComment(commentData) {
        return await this.create(commentData);
    }

    async getCommentsByPostId(postId, offset, limit) {
        const query = `
            SELECT 
                c.*,
                u.username,
                u.avatar as user_avatar
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.post_id = ?
            ORDER BY c.created_at DESC 
            LIMIT ? OFFSET ?
        `;
        
        const [rows] = await this.db.execute(query, [postId, limit, offset]);
        
        const countQuery = 'SELECT COUNT(*) as total FROM comments WHERE post_id = ?';
        const [countResult] = await this.db.execute(countQuery, [postId]);
        
        return {
            data: rows,
            total: countResult[0].total
        };
    }

    async deleteComment(id, userId) {
        const comment = await this.findById(id);
        if (!comment) {
            throw new Error('评论不存在');
        }
        
        if (comment.user_id !== userId) {
            throw new Error('无权限删除此评论');
        }

        return await this.delete(id);
    }
}

module.exports = CommentService;
