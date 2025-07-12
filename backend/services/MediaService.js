const BaseService = require('./BaseService');
const path = require('path');
const fs = require('fs');

class MediaService extends BaseService {
    constructor() {
        super('post_media');
    }

    async saveMediaFiles(postId, files) {
        const mediaRecords = [];
        
        if (!files || files.length === 0) {
            return mediaRecords;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const mediaType = this.getMediaType(file.mimetype);
            
            const mediaData = {
                post_id: postId,
                media_type: mediaType,
                file_path: file.path.replace(/.*\/uploads/, '/uploads'),
                file_name: file.originalname,
                file_size: file.size,
                mime_type: file.mimetype,
                display_order: i
            };

            try {
                const mediaRecord = await this.create(mediaData);
                mediaRecords.push(mediaRecord);
                console.log('Media file saved:', mediaRecord);
            } catch (error) {
                console.error('Failed to save media file:', error);
                throw error;
            }
        }

        // 手动更新posts表统计数据
        await this.updatePostMediaStats(postId);
        return mediaRecords;
    }

    async updatePostMediaStats(postId) {
        try {
            const [stats] = await this.db.execute(
                `SELECT 
                    COUNT(*) as total_media,
                    SUM(CASE WHEN media_type = 'image' THEN 1 ELSE 0 END) as image_count,
                    SUM(CASE WHEN media_type = 'audio' THEN 1 ELSE 0 END) as audio_count
                FROM post_media 
                WHERE post_id = ?`,
                [postId]
            );

            const { total_media, image_count, audio_count } = stats[0];

            await this.db.execute(
                `UPDATE posts 
                SET 
                    has_images = ?,
                    has_audio = ?,
                    media_count = ?
                WHERE id = ?`,
                [image_count > 0, audio_count > 0, total_media, postId]
            );

            console.log('Updated post media stats:', { postId, total_media, image_count, audio_count });
        } catch (error) {
            console.error('Failed to update post media stats:', error);
            throw error;
        }
    }

    async getMediaByPostId(postId) {
        try {
            const [rows] = await this.db.execute(
                'SELECT * FROM post_media WHERE post_id = ? ORDER BY display_order, created_at',
                [postId]
            );
            return rows;
        } catch (error) {
            console.error('Failed to get media by post ID:', error);
            throw error;
        }
    }

    async deleteMediaByPostId(postId) {
        try {
            // Get media files first to delete physical files
            const mediaFiles = await this.getMediaByPostId(postId);
            
            // Delete physical files
            for (const media of mediaFiles) {
                const filePath = path.join(__dirname, '..', media.file_path);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log('Deleted file:', filePath);
                }
            }

            // Delete database records
            await this.db.execute(
                'DELETE FROM post_media WHERE post_id = ?',
                [postId]
            );

            // Update post stats
            await this.updatePostMediaStats(postId);
            return true;
        } catch (error) {
            console.error('Failed to delete media files:', error);
            throw error;
        }
    }

    getMediaType(mimetype) {
        if (mimetype.startsWith('image/')) {
            return 'image';
        } else if (mimetype.startsWith('audio/')) {
            return 'audio';
        }
        throw new Error(`Unsupported media type: ${mimetype}`);
    }
}

module.exports = MediaService;
