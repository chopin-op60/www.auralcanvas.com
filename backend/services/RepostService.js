const BaseService = require('./BaseService');

class RepostService extends BaseService {
    constructor() {
        super('reposts');
    }

    // 创建转发
    async createRepost(userId, originalPostId, repostComment = null) {
        try {
            const safeUserId = parseInt(userId);
            const safeOriginalPostId = parseInt(originalPostId);

            console.log('Creating repost:', { safeUserId, safeOriginalPostId, repostComment });

            // 检查原帖是否存在
            const [originalPost] = await this.db.execute(
                'SELECT id, user_id FROM posts WHERE id = ?',
                [safeOriginalPostId]
            );

            if (originalPost.length === 0) {
                throw new Error('Original post not found');
            }

            // 检查是否已经转发过
            const [existingRepost] = await this.db.execute(
                'SELECT id FROM reposts WHERE user_id = ? AND original_post_id = ?',
                [safeUserId, safeOriginalPostId]
            );

            if (existingRepost.length > 0) {
                throw new Error('You have already reposted this post');
            }

            // 创建转发记录
            const repostData = {
                user_id: safeUserId,
                original_post_id: safeOriginalPostId,
                repost_comment: repostComment ? repostComment.trim() : null
            };

            const repost = await this.create(repostData);

            // 更新原帖转发计数
            await this.updatePostRepostsCount(safeOriginalPostId);

            console.log('Repost created:', repost.id);
            return repost;
        } catch (error) {
            console.error('Error in createRepost:', error);
            throw error;
        }
    }

    // 删除转发
    async deleteRepost(userId, originalPostId) {
        try {
            const safeUserId = parseInt(userId);
            const safeOriginalPostId = parseInt(originalPostId);

            console.log('Deleting repost:', { safeUserId, safeOriginalPostId });

            // 查找转发记录
            const [repost] = await this.db.execute(
                'SELECT id FROM reposts WHERE user_id = ? AND original_post_id = ?',
                [safeUserId, safeOriginalPostId]
            );

            if (repost.length === 0) {
                throw new Error('Repost not found');
            }

            // 删除转发记录
            await this.delete(repost[0].id);

            // 更新原帖转发计数
            await this.updatePostRepostsCount(safeOriginalPostId);

            console.log('Repost deleted:', repost[0].id);
            return true;
        } catch (error) {
            console.error('Error in deleteRepost:', error);
            throw error;
        }
    }

    // 检查用户是否已转发某帖子
    async getUserRepostStatus(userId, postId) {
        try {
            const safeUserId = parseInt(userId);
            const safePostId = parseInt(postId);

            const [repost] = await this.db.execute(
                'SELECT id FROM reposts WHERE user_id = ? AND original_post_id = ?',
                [safeUserId, safePostId]
            );

            return repost.length > 0;
        } catch (error) {
            console.error('Error in getUserRepostStatus:', error);
            throw error;
        }
    }

    // 批量获取用户转发状态
    async getUserRepostStatusBatch(postIds, userId) {
        try {
            if (!postIds || postIds.length === 0) return {};

            const safePostIds = postIds.map(id => parseInt(id));
            const safeUserId = parseInt(userId);

            const placeholders = safePostIds.map(() => '?').join(',');
            const query = `
                SELECT original_post_id 
                FROM reposts 
                WHERE original_post_id IN (${placeholders}) AND user_id = ?
            `;

            const [reposts] = await this.db.execute(query, [...safePostIds, safeUserId]);

            // 转换为对象格式 {postId: true/false}
            const result = {};
            safePostIds.forEach(postId => {
                result[postId] = reposts.some(repost => repost.original_post_id === postId);
            });

            return result;
        } catch (error) {
            console.error('Error in getUserRepostStatusBatch:', error);
            throw error;
        }
    }

    // 获取转发列表（包含转发者信息和原帖信息）
    async getRepostsWithDetails(offset = 0, limit = 10, userId = null) {
        try {
            const safeOffset = parseInt(offset);
            const safeLimit = parseInt(limit);

            let whereClause = '';
            let whereParams = [];

            if (userId) {
                whereClause = 'WHERE r.user_id = ?';
                whereParams = [parseInt(userId)];
            }

            const query = `
                SELECT 
                    r.id as repost_id,
                    r.user_id as reposter_id,
                    r.repost_comment,
                    r.created_at as repost_created_at,
                    ru.username as reposter_username,
                    ru.avatar as reposter_avatar,
                    p.id as original_post_id,
                    p.user_id as original_user_id,
                    p.title as original_title,
                    p.description as original_description,
                    p.content_text as original_content_text,
                    p.likes_count as original_likes_count,
                    p.comments_count as original_comments_count,
                    p.reposts_count as original_reposts_count,
                    p.created_at as original_created_at,
                    ou.username as original_username,
                    ou.avatar as original_user_avatar
                FROM reposts r
                JOIN users ru ON r.user_id = ru.id
                JOIN posts p ON r.original_post_id = p.id
                JOIN users ou ON p.user_id = ou.id
                ${whereClause}
                ORDER BY r.created_at DESC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;

            const [rows] = await this.db.execute(query, whereParams);

            const countQuery = `SELECT COUNT(*) as total FROM reposts r ${whereClause}`;
            const [countResult] = await this.db.execute(countQuery, whereParams);

            return {
                data: rows,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('Error in getRepostsWithDetails:', error);
            throw error;
        }
    }

    // 更新帖子的转发计数
    async updatePostRepostsCount(postId) {
        try {
            const safePostId = parseInt(postId);

            const [countResult] = await this.db.execute(
                'SELECT COUNT(*) as count FROM reposts WHERE original_post_id = ?',
                [safePostId]
            );

            await this.db.execute(
                'UPDATE posts SET reposts_count = ? WHERE id = ?',
                [countResult[0].count, safePostId]
            );

            console.log('Updated post reposts count:', countResult[0].count);
            return countResult[0].count;
        } catch (error) {
            console.error('Error in updatePostRepostsCount:', error);
            throw error;
        }
    }

    // 获取帖子的转发列表
    async getPostReposts(postId, offset = 0, limit = 20) {
        try {
            const safePostId = parseInt(postId);
            const safeOffset = parseInt(offset);
            const safeLimit = parseInt(limit);

            const query = `
                SELECT 
                    r.id,
                    r.repost_comment,
                    r.created_at,
                    u.id as user_id,
                    u.username,
                    u.avatar
                FROM reposts r
                JOIN users u ON r.user_id = u.id
                WHERE r.original_post_id = ?
                ORDER BY r.created_at DESC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;

            const [reposts] = await this.db.execute(query, [safePostId]);

            const countQuery = 'SELECT COUNT(*) as total FROM reposts WHERE original_post_id = ?';
            const [countResult] = await this.db.execute(countQuery, [safePostId]);

            return {
                data: reposts,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('Error in getPostReposts:', error);
            throw error;
        }
    }

    // 获取用户转发的帖子
    async getUserReposts(userId, offset = 0, limit = 10) {
        try {
            const safeUserId = parseInt(userId);
            const safeOffset = parseInt(offset);
            const safeLimit = parseInt(limit);

            console.log('Getting user reposts:', { safeUserId, safeOffset, safeLimit });

            const query = `
                SELECT 
                    r.id as repost_id,
                    r.repost_comment,
                    r.created_at as reposted_at,
                    p.*,
                    u.username,
                    u.avatar as user_avatar
                FROM reposts r
                JOIN posts p ON r.original_post_id = p.id
                JOIN users u ON p.user_id = u.id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;

            const [rows] = await this.db.execute(query, [safeUserId]);

            const countQuery = 'SELECT COUNT(*) as total FROM reposts WHERE user_id = ?';
            const [countResult] = await this.db.execute(countQuery, [safeUserId]);

            return {
                data: rows,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('Error in getUserReposts:', error);
            throw error;
        }
    }
}

module.exports = RepostService;
