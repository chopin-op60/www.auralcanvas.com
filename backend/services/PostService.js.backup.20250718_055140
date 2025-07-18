const BaseService = require('./BaseService');
const MediaService = require('./MediaService');

class PostService extends BaseService {
    constructor() {
        super('posts');
        this.mediaService = new MediaService();
    }


    // 获取混合时间线（原创+转发帖子）
    async getPostsWithUserInfo(offset = 0, limit = 10, userId = null) {
        try {
            console.log('Fetching mixed timeline with params:', { offset, limit, userId });
            
            const safeOffset = parseInt(offset) || 0;
            const safeLimit = parseInt(limit) || 10;
            
            let query = '';
            let whereParams = [];
            
            if (userId) {
                // 查询特定用户的帖子（原创+转发）
                query = `
                    (
                        SELECT 
                            p.id,
                            p.user_id as original_user_id,
                            p.title,
                            p.description,
                            p.content_text,
                            p.has_images,
                            p.has_audio,
                            p.media_count,
                            p.likes_count,
                            p.comments_count,
                            p.reposts_count,
                            p.created_at,
                            p.updated_at,
                            u.username,
                            u.avatar as user_avatar,
                            NULL as is_repost,
                            NULL as repost_comment,
                            NULL as repost_user_id,
                            NULL as repost_username,
                            NULL as repost_avatar,
                            NULL as reposted_at,
                            p.created_at as sort_time
                        FROM posts p 
                        JOIN users u ON p.user_id = u.id
                        WHERE p.user_id = ?
                    )
                    UNION ALL
                    (
                        SELECT 
                            p.id,
                            p.user_id as original_user_id,
                            p.title,
                            p.description,
                            p.content_text,
                            p.has_images,
                            p.has_audio,
                            p.media_count,
                            p.likes_count,
                            p.comments_count,
                            p.reposts_count,
                            p.created_at,
                            p.updated_at,
                            u.username,
                            u.avatar as user_avatar,
                            TRUE as is_repost,
                            r.repost_comment,
                            r.user_id as repost_user_id,
                            ru.username as repost_username,
                            ru.avatar as repost_avatar,
                            r.created_at as reposted_at,
                            r.created_at as sort_time
                        FROM reposts r
                        JOIN posts p ON r.original_post_id = p.id
                        JOIN users u ON p.user_id = u.id
                        JOIN users ru ON r.user_id = ru.id
                        WHERE r.user_id = ?
                    )
                    ORDER BY sort_time DESC
                    LIMIT ${safeLimit} OFFSET ${safeOffset}
                `;
                whereParams = [parseInt(userId), parseInt(userId)];
            } else {
                // 查询所有帖子的时间线（原创+转发）
                query = `
                    (
                        SELECT 
                            p.id,
                            p.user_id as original_user_id,
                            p.title,
                            p.description,
                            p.content_text,
                            p.has_images,
                            p.has_audio,
                            p.media_count,
                            p.likes_count,
                            p.comments_count,
                            p.reposts_count,
                            p.created_at,
                            p.updated_at,
                            u.username,
                            u.avatar as user_avatar,
                            NULL as is_repost,
                            NULL as repost_comment,
                            NULL as repost_user_id,
                            NULL as repost_username,
                            NULL as repost_avatar,
                            NULL as reposted_at,
                            p.created_at as sort_time
                        FROM posts p 
                        JOIN users u ON p.user_id = u.id
                    )
                    UNION ALL
                    (
                        SELECT 
                            p.id,
                            p.user_id as original_user_id,
                            p.title,
                            p.description,
                            p.content_text,
                            p.has_images,
                            p.has_audio,
                            p.media_count,
                            p.likes_count,
                            p.comments_count,
                            p.reposts_count,
                            p.created_at,
                            p.updated_at,
                            u.username,
                            u.avatar as user_avatar,
                            TRUE as is_repost,
                            r.repost_comment,
                            r.user_id as repost_user_id,
                            ru.username as repost_username,
                            ru.avatar as repost_avatar,
                            r.created_at as reposted_at,
                            r.created_at as sort_time
                        FROM reposts r
                        JOIN posts p ON r.original_post_id = p.id
                        JOIN users u ON p.user_id = u.id
                        JOIN users ru ON r.user_id = ru.id
                    )
                    ORDER BY sort_time DESC
                    LIMIT ${safeLimit} OFFSET ${safeOffset}
                `;
                whereParams = [];
            }
            
            console.log('Executing mixed timeline query');
            const [rows] = await this.db.execute(query, whereParams);
            
            // 为每个帖子加载媒体文件
            const postsWithMedia = await Promise.all(
                rows.map(async (post) => {
                    const mediaFiles = await this.mediaService.getMediaByPostId(post.id);
                    return {
                        ...post,
                        media: mediaFiles,
                        actual_likes_count: post.likes_count || 0,
                        actual_comments_count: post.comments_count || 0,
                        actual_reposts_count: post.reposts_count || 0,
                        // 转发信息
                        is_repost: post.is_repost || false,
                        repost_comment: post.repost_comment || null,
                        repost_user: post.is_repost ? {
                            id: post.repost_user_id,
                            username: post.repost_username,
                            avatar: post.repost_avatar
                        } : null,
                        reposted_at: post.reposted_at || null,
                        // 原帖作者信息
                        original_user: {
                            id: post.original_user_id,
                            username: post.username,
                            avatar: post.user_avatar
                        }
                    };
                })
            );
            
            // 计算总数
            let countQuery = '';
            let countParams = [];
            
            if (userId) {
                countQuery = `
                    SELECT COUNT(*) as total FROM (
                        (SELECT id FROM posts WHERE user_id = ?)
                        UNION ALL
                        (SELECT original_post_id as id FROM reposts WHERE user_id = ?)
                    ) as combined
                `;
                countParams = [parseInt(userId), parseInt(userId)];
            } else {
                countQuery = `
                    SELECT COUNT(*) as total FROM (
                        (SELECT id FROM posts)
                        UNION ALL
                        (SELECT original_post_id as id FROM reposts)
                    ) as combined
                `;
                countParams = [];
            }
            
            const [countResult] = await this.db.execute(countQuery, countParams);
            
            console.log('Mixed timeline results:', { rowCount: postsWithMedia.length, total: countResult[0].total });
            
            return {
                data: postsWithMedia,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('Database error in getPostsWithUserInfo:', error);
            throw error;
        }
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
                likes_count: 0,
                comments_count: 0,
                reposts_count: 0
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
                    p.comments_count,
                    p.reposts_count,
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
                post.actual_comments_count = post.comments_count || 0;
                post.actual_reposts_count = post.reposts_count || 0;
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
            
            // 删除帖子记录 (级联删除会自动删除相关的转发、点赞、评论)
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

    // 获取用户点赞的帖子
    async getUserLikedPosts(userId, offset = 0, limit = 10) {
        try {
            const safeUserId = parseInt(userId);
            const safeOffset = parseInt(offset);
            const safeLimit = parseInt(limit);

            console.log('Getting liked posts for user:', safeUserId);

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
                    p.comments_count,
                    p.reposts_count,
                    p.created_at,
                    p.updated_at,
                    u.username,
                    u.avatar as user_avatar,
                    l.created_at as liked_at
                FROM posts p
                JOIN users u ON p.user_id = u.id
                JOIN likes l ON p.id = l.post_id
                WHERE l.user_id = ?
                ORDER BY l.created_at DESC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;

            const [rows] = await this.db.execute(query, [safeUserId]);

            // 为每个帖子加载媒体文件
            const postsWithMedia = await Promise.all(
                rows.map(async (post) => {
                    const mediaFiles = await this.mediaService.getMediaByPostId(post.id);
                    return {
                        ...post,
                        media: mediaFiles,
                        user_liked: true, // 这些都是用户点赞的帖子
                        actual_likes_count: post.likes_count || 0,
                        actual_comments_count: post.comments_count || 0,
                        actual_reposts_count: post.reposts_count || 0
                    };
                })
            );

            const countQuery = `
                SELECT COUNT(*) as total 
                FROM likes l 
                WHERE l.user_id = ?
            `;
            const [countResult] = await this.db.execute(countQuery, [safeUserId]);

            console.log('Found liked posts:', postsWithMedia.length, 'Total:', countResult[0].total);

            return {
                data: postsWithMedia,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('Error in getUserLikedPosts:', error);
            throw error;
        }
    }
}

module.exports = PostService;
