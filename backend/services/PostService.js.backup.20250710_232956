const BaseService = require('./BaseService');

class PostService extends BaseService {
    constructor() {
        super('posts');
    }

    async createPost(postData) {
        const validContentTypes = ['image', 'text', 'music'];
        if (!validContentTypes.includes(postData.content_type)) {
            throw new Error('无效的内容类型');
        }

        return await this.create(postData);
    }

    async getPostsWithUserInfo(offset, limit, userId = null) {
        let whereClause = '';
        let params = [];
        
        if (userId) {
            whereClause = 'WHERE p.user_id = ?';
            params = [userId];
        }

        const query = `
            SELECT 
                p.*,
                u.username,
                u.avatar as user_avatar,
                (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            ${whereClause}
            ORDER BY p.created_at DESC 
            LIMIT ? OFFSET ?
        `;
        
        const [rows] = await this.db.execute(query, [...params, limit, offset]);
        
        const countQuery = `SELECT COUNT(*) as total FROM posts p ${whereClause}`;
        const [countResult] = await this.db.execute(countQuery, params);
        
        return {
            data: rows,
            total: countResult[0].total
        };
    }

    async getPostById(id) {
        const query = `
            SELECT 
                p.*,
                u.username,
                u.avatar as user_avatar,
                (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.id = ?
        `;
        
        const [rows] = await this.db.execute(query, [id]);
        return rows[0] || null;
    }

    async updatePost(id, userId, updateData) {
        // 检查帖子是否存在且属于用户
        const post = await this.findById(id);
        if (!post) {
            throw new Error('帖子不存在');
        }
        
        if (post.user_id !== userId) {
            throw new Error('无权限编辑此帖子');
        }

        const allowedFields = ['title', 'description', 'content_text'];
        const filteredData = {};
        
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        return await this.update(id, filteredData);
    }

    async deletePost(id, userId) {
        const post = await this.findById(id);
        if (!post) {
            throw new Error('帖子不存在');
        }
        
        if (post.user_id !== userId) {
            throw new Error('无权限删除此帖子');
        }

        return await this.delete(id);
    }

    async toggleLike(postId, userId) {
        // 检查是否已点赞
        const [existingLike] = await this.db.execute(
            'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );

        if (existingLike.length > 0) {
            // 取消点赞
            await this.db.execute(
                'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
                [postId, userId]
            );
            return { liked: false };
        } else {
            // 添加点赞
            await this.db.execute(
                'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
                [postId, userId]
            );
            return { liked: true };
        }
    }
}

module.exports = PostService;
