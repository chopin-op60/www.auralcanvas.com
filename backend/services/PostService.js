const BaseService = require('./BaseService');
const MediaService = require('./MediaService');

class PostService extends BaseService {
    constructor() {
        super('posts');
        this.mediaService = new MediaService();
    }

    async createPost(postData, files = []) {
        try {
            console.log('Creating mixed-content post with data:', postData);
            console.log('Files to upload:', files ? files.length : 0);

            // 验证必填字段
            if (!postData.title || !postData.title.trim()) {
                throw new Error('Title is required');
            }

            if (!postData.user_id) {
                throw new Error('User ID is required');
            }

            // 验证内容完整性 - 至少需要文字或文件
            const hasTextContent = postData.content_text && postData.content_text.trim();
            const hasFiles = files && files.length > 0;

            if (!hasTextContent && !hasFiles) {
                throw new Error('Post must contain either text content or media files');
            }

            // 创建基本帖子记录
            const basicPostData = {
                user_id: postData.user_id,
                title: postData.title.trim(),
                description: postData.description ? postData.description.trim() : null,
                content_text: hasTextContent ? postData.content_text.trim() : null,
                likes_count: 0
            };

            const post = await this.create(basicPostData);
            console.log('Basic post created:', post.id);

            // 如果有文件，保存媒体文件
            if (hasFiles) {
                try {
                    await this.mediaService.saveMediaFiles(post.id, files);
                    console.log('Media files saved for post:', post.id);
                } catch (error) {
                    // 如果媒体文件保存失败，删除已创建的帖子
                    await this.delete(post.id);
                    throw new Error(`Failed to save media files: ${error.message}`);
                }
            }

            // 返回完整的帖子数据
            return await this.getPostById(post.id);
        } catch (error) {
            console.error('Database error in createPost:', error);
            throw error;
        }
    }

    async getPostsWithUserInfo(offset = 0, limit = 10, userId = null) {
        try {
            console.log('Fetching posts with params:', { offset, limit, userId });
            
            const safeOffset = parseInt(offset) || 0;
            const safeLimit = parseInt(limit) || 10;
            
            let whereClause = '';
            let whereParams = [];
            
            if (userId) {
                whereClause = 'WHERE p.user_id = ?';
                whereParams = [parseInt(userId)];
            }

            const query = `
                SELECT 
                    p.id,
                    p.user_id,
                    p.title,
                    p.description,
                    p.content_text,
                    p.has_images,
                    p.has_audio,
                    p.media_count,
                    p.likes_count,
                    p.created_at,
                    p.updated_at,
                    u.username,
                    u.avatar as user_avatar
                FROM posts p 
                JOIN users u ON p.user_id = u.id 
                ${whereClause}
                ORDER BY p.created_at DESC 
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;
            
            console.log('Executing query:', query.replace(/\s+/g, ' ').trim());
            
            const [rows] = await this.db.execute(query, whereParams);
            
            // 为每个帖子加载媒体文件
            const postsWithMedia = await Promise.all(
                rows.map(async (post) => {
                    const mediaFiles = await this.mediaService.getMediaByPostId(post.id);
                    return {
                        ...post,
                        media: mediaFiles,
                        actual_likes_count: post.likes_count || 0,
                        comments_count: 0
                    };
                })
            );
            
            const countQuery = `SELECT COUNT(*) as total FROM posts p ${whereClause}`;
            const [countResult] = await this.db.execute(countQuery, whereParams);
            
            console.log('Query results:', { rowCount: postsWithMedia.length, total: countResult[0].total });
            
            return {
                data: postsWithMedia,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('Database error in getPostsWithUserInfo:', error);
            throw error;
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
                    p.content_text,
                    p.has_images,
                    p.has_audio,
                    p.media_count,
                    p.likes_count,
                    p.created_at,
                    p.updated_at,
                    u.username,
                    u.avatar as user_avatar
                FROM posts p 
                JOIN users u ON p.user_id = u.id 
                WHERE p.id = ${parseInt(id)}
            `;
            
            const [rows] = await this.db.execute(query);
            const post = rows[0] || null;
            
            if (post) {
                // 加载媒体文件
                const mediaFiles = await this.mediaService.getMediaByPostId(post.id);
                post.media = mediaFiles;
                post.actual_likes_count = post.likes_count || 0;
                post.comments_count = 0;
            }
            
            return post;
        } catch (error) {
            console.error('Database error in getPostById:', error);
            throw new Error(`Failed to get post: ${error.message}`);
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

            // 删除媒体文件
            await this.mediaService.deleteMediaByPostId(id);
            
            // 删除帖子记录
            return await this.delete(id);
        } catch (error) {
            console.error('Database error in deletePost:', error);
            throw new Error(`Failed to delete post: ${error.message}`);
        }
    }

    async updatePost(id, userId, updateData) {
        try {
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
                    filteredData[field] = updateData[field] || null;
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

    async toggleLike(postId, userId) {
        try {
            const post = await this.findById(postId);
            if (!post) {
                throw new Error('Post not found');
            }

            const [existingLike] = await this.db.execute(
                'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
                [parseInt(postId), parseInt(userId)]
            );

            if (existingLike.length > 0) {
                await this.db.execute(
                    'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
                    [parseInt(postId), parseInt(userId)]
                );
                return { liked: false };
            } else {
                await this.db.execute(
                    'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
                    [parseInt(postId), parseInt(userId)]
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
