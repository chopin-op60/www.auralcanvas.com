const BaseService = require('./BaseService');

class PostService extends BaseService {
    constructor() {
        super('posts');
    }

    async createPost(postData) {
        const validContentTypes = ['image', 'text', 'music'];
        if (!validContentTypes.includes(postData.content_type)) {
            throw new Error('Invalid content type');
        }

        // Validate required fields
        if (!postData.title || !postData.title.trim()) {
            throw new Error('Title is required');
        }

        if (!postData.user_id) {
            throw new Error('User ID is required');
        }

        // Ensure content completeness
        if (postData.content_type === 'text' && (!postData.content_text || !postData.content_text.trim())) {
            throw new Error('Text content is required for text posts');
        }

        if ((postData.content_type === 'image' || postData.content_type === 'music') && !postData.file_path) {
            throw new Error('File is required for image and music posts');
        }

        try {
            const result = await this.create(postData);
            console.log('Post created successfully:', result);
            return result;
        } catch (error) {
            console.error('Database error in createPost:', error);
            throw new Error(`Failed to create post: ${error.message}`);
        }
    }

    async getPostsWithUserInfo(offset = 0, limit = 10, userId = null) {
        try {
            let whereClause = '';
            let params = [];
            
            if (userId) {
                whereClause = 'WHERE p.user_id = ?';
                params = [userId];
            }

            const query = `
                SELECT 
                    p.id,
                    p.user_id,
                    p.title,
                    p.description,
                    p.content_type,
                    p.file_path,
                    p.content_text,
                    p.likes_count,
                    p.created_at,
                    p.updated_at,
                    u.username,
                    u.avatar as user_avatar,
                    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as actual_likes_count,
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
        } catch (error) {
            console.error('Database error in getPostsWithUserInfo:', error);
            throw new Error(`Failed to get posts: ${error.message}`);
        }
    }

    async getPostById(id) {
        try {
            const query = `
                SELECT 
                    p.id,
                    p.user_id,
                    p.title,
                    p.description,
                    p.content_type,
                    p.file_path,
                    p.content_text,
                    p.likes_count,
                    p.created_at,
                    p.updated_at,
                    u.username,
                    u.avatar as user_avatar,
                    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as actual_likes_count,
                    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count
                FROM posts p 
                JOIN users u ON p.user_id = u.id 
                WHERE p.id = ?
            `;
            
            const [rows] = await this.db.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Database error in getPostById:', error);
            throw new Error(`Failed to get post: ${error.message}`);
        }
    }

    async updatePost(id, userId, updateData) {
        try {
            // Check if post exists and belongs to user
            const post = await this.findById(id);
            if (!post) {
                throw new Error('Post not found');
            }
            
            if (post.user_id !== userId) {
                throw new Error('Unauthorized to edit this post');
            }

            const allowedFields = ['title', 'description', 'content_text'];
            const filteredData = {};
            
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            }

            if (Object.keys(filteredData).length === 0) {
                throw new Error('No valid fields to update');
            }

            return await this.update(id, filteredData);
        } catch (error) {
            console.error('Database error in updatePost:', error);
            throw new Error(`Failed to update post: ${error.message}`);
        }
    }

    async deletePost(id, userId) {
        try {
            const post = await this.findById(id);
            if (!post) {
                throw new Error('Post not found');
            }
            
            if (post.user_id !== userId) {
                throw new Error('Unauthorized to delete this post');
            }

            return await this.delete(id);
        } catch (error) {
            console.error('Database error in deletePost:', error);
            throw new Error(`Failed to delete post: ${error.message}`);
        }
    }

    async toggleLike(postId, userId) {
        try {
            // Check if post exists
            const post = await this.findById(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            // Check if already liked
            const [existingLike] = await this.db.execute(
                'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
                [postId, userId]
            );

            if (existingLike.length > 0) {
                // Remove like
                await this.db.execute(
                    'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
                    [postId, userId]
                );
                return { liked: false };
            } else {
                // Add like
                await this.db.execute(
                    'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
                    [postId, userId]
                );
                return { liked: true };
            }
        } catch (error) {
            console.error('Database error in toggleLike:', error);
            throw new Error(`Failed to toggle like: ${error.message}`);
        }
    }
}

module.exports = PostService;
