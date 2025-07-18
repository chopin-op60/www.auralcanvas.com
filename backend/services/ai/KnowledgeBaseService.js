const BaseService = require('../BaseService');
const PostService = require('../PostService');
const CommentService = require('../CommentService');
const MediaService = require('../MediaService');

class KnowledgeBaseService extends BaseService {
    constructor() {
        super('ai_knowledge_selections');
        this.postService = new PostService();
        this.commentService = new CommentService();
        this.mediaService = new MediaService();
    }

    // 获取用户知识库选择配置
    async getUserKnowledgeSelection(userId) {
        try {
            const [rows] = await this.db.execute(
                'SELECT * FROM ai_knowledge_selections WHERE user_id = ?',
                [userId]
            );
            
            if (rows.length === 0) {
                // 创建默认配置
                return await this.createDefaultSelection(userId);
            }
            
            return rows[0];
        } catch (error) {
            throw new Error(`Failed to get knowledge selection: ${error.message}`);
        }
    }

    // 创建默认知识库选择
    async createDefaultSelection(userId) {
        const defaultSelection = {
            user_id: userId,
            include_posts: true,
            include_comments: true,
            include_liked_posts: false,
            include_media_info: true,
            include_social_stats: false,
            include_profile_info: true
        };

        return await this.create(defaultSelection);
    }

    // 更新知识库选择
    async updateKnowledgeSelection(userId, selectionData) {
        try {
            const existing = await this.getUserKnowledgeSelection(userId);
            
            const updateData = {
                include_posts: selectionData.include_posts || false,
                include_comments: selectionData.include_comments || false,
                include_liked_posts: selectionData.include_liked_posts || false,
                include_media_info: selectionData.include_media_info || false,
                include_social_stats: selectionData.include_social_stats || false,
                include_profile_info: selectionData.include_profile_info || false,
                date_range_start: selectionData.date_range_start || null,
                date_range_end: selectionData.date_range_end || null
            };

            return await this.update(existing.id, updateData);
        } catch (error) {
            throw new Error(`Failed to update knowledge selection: ${error.message}`);
        }
    }

    // 提取用户知识库内容
    async extractUserKnowledgeBase(userId) {
        try {
            console.log('Extracting knowledge base for user:', userId);
            
            const selection = await this.getUserKnowledgeSelection(userId);
            const knowledgeBase = {
                user_info: null,
                posts: [],
                comments: [],
                liked_posts: [],
                media_summary: [],
                social_stats: null,
                extraction_date: new Date().toISOString()
            };

            // 获取用户基本信息
            if (selection.include_profile_info) {
                knowledgeBase.user_info = await this.extractUserProfile(userId);
            }

            // 获取用户帖子
            if (selection.include_posts) {
                knowledgeBase.posts = await this.extractUserPosts(userId, selection);
            }

            // 获取用户评论
            if (selection.include_comments) {
                knowledgeBase.comments = await this.extractUserComments(userId, selection);
            }

            // 获取用户点赞的帖子
            if (selection.include_liked_posts) {
                knowledgeBase.liked_posts = await this.extractUserLikedPosts(userId, selection);
            }

            // 获取媒体信息摘要
            if (selection.include_media_info) {
                knowledgeBase.media_summary = await this.extractMediaSummary(userId);
            }

            // 获取社交统计
            if (selection.include_social_stats) {
                knowledgeBase.social_stats = await this.extractSocialStats(userId);
            }

            return knowledgeBase;
        } catch (error) {
            console.error('Error extracting knowledge base:', error);
            throw error;
        }
    }

    // 提取用户个人资料
    async extractUserProfile(userId) {
        try {
            const [rows] = await this.db.execute(
                `SELECT username, bio, location, website, 
                        posts_count, followers_count, following_count, created_at
                 FROM users WHERE id = ?`,
                [userId]
            );
            
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // 提取用户帖子内容
    async extractUserPosts(userId, selection) {
        try {
            let dateFilter = '';
            let params = [userId];

            if (selection.date_range_start || selection.date_range_end) {
                if (selection.date_range_start && selection.date_range_end) {
                    dateFilter = 'AND p.created_at BETWEEN ? AND ?';
                    params.push(selection.date_range_start, selection.date_range_end);
                } else if (selection.date_range_start) {
                    dateFilter = 'AND p.created_at >= ?';
                    params.push(selection.date_range_start);
                } else if (selection.date_range_end) {
                    dateFilter = 'AND p.created_at <= ?';
                    params.push(selection.date_range_end);
                }
            }

            const query = `
                SELECT 
                    p.id, p.title, p.description, p.content_text,
                    p.has_images, p.has_audio, p.media_count,
                    p.likes_count, p.comments_count, p.reposts_count,
                    p.created_at
                FROM posts p 
                WHERE p.user_id = ? ${dateFilter}
                ORDER BY p.created_at DESC
                LIMIT 200
            `;

            const [posts] = await this.db.execute(query, params);

            // 为每个帖子获取媒体信息
            for (const post of posts) {
                if (post.media_count > 0) {
                    const media = await this.mediaService.getMediaByPostId(post.id);
                    post.media_files = media.map(m => ({
                        type: m.media_type,
                        filename: m.file_name,
                        size: m.file_size
                    }));
                }
            }

            return posts;
        } catch (error) {
            throw error;
        }
    }

    // 提取用户评论
    async extractUserComments(userId, selection) {
        try {
            let dateFilter = '';
            let params = [userId];

            if (selection.date_range_start || selection.date_range_end) {
                if (selection.date_range_start && selection.date_range_end) {
                    dateFilter = 'AND c.created_at BETWEEN ? AND ?';
                    params.push(selection.date_range_start, selection.date_range_end);
                } else if (selection.date_range_start) {
                    dateFilter = 'AND c.created_at >= ?';
                    params.push(selection.date_range_start);
                } else if (selection.date_range_end) {
                    dateFilter = 'AND c.created_at <= ?';
                    params.push(selection.date_range_end);
                }
            }

            const query = `
                SELECT 
                    c.content, c.created_at,
                    p.title as post_title
                FROM comments c
                JOIN posts p ON c.post_id = p.id
                WHERE c.user_id = ? ${dateFilter}
                ORDER BY c.created_at DESC
                LIMIT 500
            `;

            const [comments] = await this.db.execute(query, params);
            return comments;
        } catch (error) {
            throw error;
        }
    }

    // 提取用户点赞的帖子
    async extractUserLikedPosts(userId, selection) {
        try {
            let dateFilter = '';
            let params = [userId];

            if (selection.date_range_start || selection.date_range_end) {
                if (selection.date_range_start && selection.date_range_end) {
                    dateFilter = 'AND l.created_at BETWEEN ? AND ?';
                    params.push(selection.date_range_start, selection.date_range_end);
                } else if (selection.date_range_start) {
                    dateFilter = 'AND l.created_at >= ?';
                    params.push(selection.date_range_start);
                } else if (selection.date_range_end) {
                    dateFilter = 'AND l.created_at <= ?';
                    params.push(selection.date_range_end);
                }
            }

            const query = `
                SELECT 
                    p.title, p.description, p.content_text,
                    u.username as author, l.created_at as liked_at
                FROM likes l
                JOIN posts p ON l.post_id = p.id  
                JOIN users u ON p.user_id = u.id
                WHERE l.user_id = ? ${dateFilter}
                ORDER BY l.created_at DESC
                LIMIT 100
            `;

            const [likedPosts] = await this.db.execute(query, params);
            return likedPosts;
        } catch (error) {
            throw error;
        }
    }

    // 提取媒体摘要
    async extractMediaSummary(userId) {
        try {
            const query = `
                SELECT 
                    pm.media_type,
                    COUNT(*) as count,
                    SUM(pm.file_size) as total_size
                FROM post_media pm
                JOIN posts p ON pm.post_id = p.id
                WHERE p.user_id = ?
                GROUP BY pm.media_type
            `;

            const [mediaSummary] = await this.db.execute(query, [userId]);
            return mediaSummary;
        } catch (error) {
            throw error;
        }
    }

    // 提取社交统计
    async extractSocialStats(userId) {
        try {
            const [stats] = await this.db.execute(
                `SELECT 
                    posts_count, followers_count, following_count
                 FROM users WHERE id = ?`,
                [userId]
            );

            // 获取总点赞数
            const [likesGiven] = await this.db.execute(
                'SELECT COUNT(*) as total_likes_given FROM likes WHERE user_id = ?',
                [userId]
            );

            // 获取总评论数
            const [commentsGiven] = await this.db.execute(
                'SELECT COUNT(*) as total_comments_given FROM comments WHERE user_id = ?',
                [userId]
            );

            return {
                ...stats[0],
                total_likes_given: likesGiven[0].total_likes_given,
                total_comments_given: commentsGiven[0].total_comments_given
            };
        } catch (error) {
            throw error;
        }
    }

    // 生成知识库文档
    async generateKnowledgeDocument(userId) {
        try {
            console.log('Generating knowledge document for user:', userId);
            
            const knowledgeBase = await this.extractUserKnowledgeBase(userId);
            const selection = await this.getUserKnowledgeSelection(userId);
            
            let document = '';
            
            // 文档头部
            document += `# AI Knowledge Base for ${knowledgeBase.user_info?.username || 'User'}\n\n`;
            document += `Generated on: ${new Date().toLocaleString()}\n\n`;
            document += `This document contains selected information about the user for AI agent training.\n\n`;
            
            // 用户信息
            if (selection.include_profile_info && knowledgeBase.user_info) {
                document += `## User Profile\n\n`;
                document += `- **Username**: ${knowledgeBase.user_info.username}\n`;
                if (knowledgeBase.user_info.bio) {
                    document += `- **Bio**: ${knowledgeBase.user_info.bio}\n`;
                }
                if (knowledgeBase.user_info.location) {
                    document += `- **Location**: ${knowledgeBase.user_info.location}\n`;
                }
                if (knowledgeBase.user_info.website) {
                    document += `- **Website**: ${knowledgeBase.user_info.website}\n`;
                }
                document += `- **Member since**: ${new Date(knowledgeBase.user_info.created_at).toDateString()}\n\n`;
            }

            // 社交统计
            if (selection.include_social_stats && knowledgeBase.social_stats) {
                document += `## Social Statistics\n\n`;
                document += `- **Posts**: ${knowledgeBase.social_stats.posts_count || 0}\n`;
                document += `- **Followers**: ${knowledgeBase.social_stats.followers_count || 0}\n`;
                document += `- **Following**: ${knowledgeBase.social_stats.following_count || 0}\n`;
                document += `- **Total Likes Given**: ${knowledgeBase.social_stats.total_likes_given || 0}\n`;
                document += `- **Total Comments Made**: ${knowledgeBase.social_stats.total_comments_given || 0}\n\n`;
            }

            // 用户帖子
            if (selection.include_posts && knowledgeBase.posts.length > 0) {
                document += `## User Posts (${knowledgeBase.posts.length} posts)\n\n`;
                knowledgeBase.posts.forEach((post, index) => {
                    document += `### Post ${index + 1}: ${post.title}\n`;
                    
                    if (post.description) {
                        document += `**Description**: ${post.description}\n\n`;
                    }
                    
                    if (post.content_text) {
                        document += `**Content**:\n${post.content_text}\n\n`;
                    }

                    if (post.media_files && post.media_files.length > 0) {
                        document += `**Media Files**: `;
                        const mediaTypes = post.media_files.map(m => m.type).join(', ');
                        document += `${post.media_files.length} files (${mediaTypes})\n\n`;
                    }

                    document += `**Engagement**: ${post.likes_count} likes, ${post.comments_count} comments, ${post.reposts_count} reposts\n`;
                    document += `**Posted**: ${new Date(post.created_at).toDateString()}\n\n`;
                    document += `---\n\n`;
                });
            }

            // 用户评论
            if (selection.include_comments && knowledgeBase.comments.length > 0) {
                document += `## User Comments (${knowledgeBase.comments.length} comments)\n\n`;
                knowledgeBase.comments.forEach((comment, index) => {
                    document += `**Comment ${index + 1}** on post "${comment.post_title}":\n`;
                    document += `${comment.content}\n`;
                    document += `*Commented on: ${new Date(comment.created_at).toDateString()}*\n\n`;
                });
                document += `---\n\n`;
            }

            // 点赞的帖子
            if (selection.include_liked_posts && knowledgeBase.liked_posts.length > 0) {
                document += `## Posts User Liked (${knowledgeBase.liked_posts.length} posts)\n\n`;
                document += `These posts indicate the user's interests and preferences:\n\n`;
                knowledgeBase.liked_posts.forEach((post, index) => {
                    document += `**${index + 1}.** "${post.title}" by ${post.author}\n`;
                    if (post.description) {
                        document += `Description: ${post.description}\n`;
                    }
                    document += `*Liked on: ${new Date(post.liked_at).toDateString()}*\n\n`;
                });
                document += `---\n\n`;
            }

            // 媒体摘要
            if (selection.include_media_info && knowledgeBase.media_summary.length > 0) {
                document += `## Media Sharing Summary\n\n`;
                knowledgeBase.media_summary.forEach(media => {
                    document += `- **${media.media_type}**: ${media.count} files, ${this.formatFileSize(media.total_size)} total\n`;
                });
                document += `\n`;
            }

            document += `---\n\n`;
            document += `*This document was automatically generated for AI agent training purposes. It represents the user's activity and preferences based on their selected data.*\n`;

            return document;
        } catch (error) {
            console.error('Error generating knowledge document:', error);
            throw error;
        }
    }

    // 文件大小格式化辅助函数
    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}

module.exports = KnowledgeBaseService;
