<template>
  <div class="post-card">
    <div class="post-header">
      <div class="user-info">
        <el-avatar :src="post.user_avatar" :size="40">
          <el-icon><User /></el-icon>
        </el-avatar>
        <div class="user-details">
          <div class="username">{{ post.username }}</div>
          <div class="time">{{ fromNow(post.created_at) }}</div>
        </div>
      </div>
      
      <!-- 作者操作菜单 -->
      <div v-if="canDelete" class="post-menu">
        <el-dropdown trigger="click" @command="handleCommand">
          <el-button text circle>
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="delete" class="delete-item">
                <el-icon><Delete /></el-icon>
                Delete Post
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <div class="post-content">
      <h3 class="post-title">{{ post.title }}</h3>
      <p v-if="post.description" class="post-description">{{ post.description }}</p>
      
      <!-- Text Content -->
      <div v-if="post.content_text" class="post-text">
        <p>{{ post.content_text }}</p>
      </div>
      
      <!-- Mixed Media Content -->
      <div v-if="post.media && post.media.length > 0" class="post-media">
        
        <!-- Images Section - Smart scaling -->
        <div v-if="imageFiles.length > 0" class="images-section">
          <div class="images-grid" :class="getImageGridClass()">
            <div 
              v-for="(media, index) in imageFiles" 
              :key="media.id" 
              class="image-item"
            >
              <el-image 
                :src="getFileUrl(media.file_path)" 
                fit="contain"
                :preview-src-list="getImageUrls()"
                :initial-index="index"
                preview-teleported
                class="media-image"
              />
            </div>
          </div>
        </div>
        
        <!-- Audio Files Section - Compact display -->
        <div v-if="audioFiles.length > 0" class="audio-section">
          <div class="audio-list">
            <div 
              v-for="media in audioFiles" 
              :key="media.id" 
              class="audio-item"
            >
              <div class="audio-header">
                <div class="audio-icon">
                  <el-icon><Microphone /></el-icon>
                </div>
                <div class="audio-info">
                  <span class="audio-name">{{ media.file_name }}</span>
                  <span class="audio-size">{{ formatFileSize(media.file_size) }}</span>
                </div>
              </div>
              <audio 
                :src="getFileUrl(media.file_path)" 
                controls 
                class="audio-player"
                preload="metadata"
              >
                Your browser does not support audio playback.
              </audio>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Content Type Indicators -->
      <div v-if="post.has_images || post.has_audio" class="content-indicators">
        <el-tag v-if="post.has_images" size="small" type="primary">
          <el-icon><Picture /></el-icon>
          {{ imageFiles.length }} {{ imageFiles.length === 1 ? 'Image' : 'Images' }}
        </el-tag>
        <el-tag v-if="post.has_audio" size="small" type="success">
          <el-icon><Microphone /></el-icon>
          {{ audioFiles.length }} Audio {{ audioFiles.length === 1 ? 'File' : 'Files' }}
        </el-tag>
        <el-tag v-if="post.content_text" size="small" type="info">
          <el-icon><Document /></el-icon>
          Text
        </el-tag>
      </div>
    </div>
    
    <div class="post-actions">
      <el-button text @click="handleLike">
        <el-icon><StarFilled /></el-icon>
        {{ post.likes_count || 0 }}
      </el-button>
      <el-button text @click="handleComment">
        <el-icon><ChatDotSquare /></el-icon>
        {{ post.comments_count || 0 }}
      </el-button>
      <el-button text @click="handleShare">
        <el-icon><Share /></el-icon>
        Share
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  User, StarFilled, ChatDotSquare, Share, MoreFilled, Delete,
  Microphone, Picture, Document 
} from '@element-plus/icons-vue'
import { fromNow, getFileUrl, formatFileSize } from '@/utils'
import { useUserStore } from '@/stores/user'
import { deletePost } from '@/api/posts'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['post-deleted'])
const userStore = useUserStore()

// 权限检查
const canDelete = computed(() => {
  return userStore.isLoggedIn && 
         userStore.userId && 
         props.post.user_id === userStore.userId
})

// 分离图片和音频文件
const imageFiles = computed(() => {
  return props.post.media?.filter(m => m.media_type === 'image') || []
})

const audioFiles = computed(() => {
  return props.post.media?.filter(m => m.media_type === 'audio') || []
})

// 图片网格样式
const getImageGridClass = () => {
  const count = imageFiles.value.length
  if (count === 1) return 'single-image'
  if (count === 2) return 'two-images'
  if (count === 3) return 'three-images'
  if (count === 4) return 'four-images'
  return 'many-images'
}

// 获取所有图片URL用于预览
const getImageUrls = () => {
  return imageFiles.value.map(m => getFileUrl(m.file_path))
}

// Event handlers
const handleCommand = async (command) => {
  if (command === 'delete') {
    await handleDelete();
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this post? This will also delete all associated media files. This action cannot be undone.',
      'Delete Post',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    );
    
    await deletePost(props.post.id);
    ElMessage.success('Post deleted successfully');
    emit('post-deleted', props.post.id);
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete post';
      ElMessage.error(errorMessage);
    }
  }
}

const handleLike = () => {
  console.log('Like clicked');
}

const handleComment = () => {
  console.log('Comment clicked');
}

const handleShare = () => {
  console.log('Share clicked');
}
</script>

<style lang="scss" scoped>
.post-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 15px;
    flex: 1;
    
    .user-details {
      .username {
        font-weight: 600;
        color: #303133;
        font-size: 14px;
      }
      
      .time {
        color: #909399;
        font-size: 12px;
      }
    }
  }
  
  .post-menu {
    margin-top: -5px;
    
    .el-button {
      color: #909399;
      
      &:hover {
        color: #303133;
        background: #f5f7fa;
      }
    }
  }
}

.post-content {
  .post-title {
    font-size: 18px;
    color: #303133;
    margin-bottom: 8px;
    font-weight: 600;
  }
  
  .post-description {
    color: #606266;
    margin-bottom: 15px;
    line-height: 1.6;
  }
  
  .post-text {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    
    p {
      color: #303133;
      line-height: 1.6;
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
  
  .post-media {
    margin-bottom: 15px;
    
    // Images Section - Smart aspect ratio handling
    .images-section {
      margin-bottom: 16px;
      
      .images-grid {
        display: grid;
        gap: 8px;
        border-radius: 12px;
        overflow: hidden;
        
        &.single-image {
          .image-item {
            .media-image {
              width: 100%;
              max-height: 500px;
              min-height: 200px;
              height: auto;
            }
          }
        }
        
        &.two-images {
          grid-template-columns: 1fr 1fr;
          
          .image-item .media-image {
            height: 250px;
            width: 100%;
          }
        }
        
        &.three-images {
          grid-template-columns: 1fr 1fr;
          
          .image-item:first-child {
            grid-row: span 2;
            
            .media-image {
              height: 300px;
              width: 100%;
            }
          }
          
          .image-item:not(:first-child) .media-image {
            height: 146px;
            width: 100%;
          }
        }
        
        &.four-images {
          grid-template-columns: 1fr 1fr;
          
          .image-item .media-image {
            height: 180px;
            width: 100%;
          }
        }
        
        &.many-images {
          grid-template-columns: repeat(3, 1fr);
          
          .image-item .media-image {
            height: 150px;
            width: 100%;
          }
        }
        
        .image-item {
          border-radius: 8px;
          overflow: hidden;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .media-image {
            cursor: pointer;
            transition: transform 0.2s;
            display: block;
            
            &:hover {
              transform: scale(1.02);
            }
            
            :deep(.el-image__inner) {
              object-fit: contain;
              width: 100%;
              height: 100%;
              max-width: 100%;
              max-height: 100%;
            }
            
            :deep(.el-image__error) {
              background: #f8f9fa;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #909399;
              font-size: 14px;
              width: 100%;
              height: 100%;
            }
          }
        }
      }
    }
    
    // Audio Section - Compact and elegant
    .audio-section {
      .audio-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        
        .audio-item {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
          border: 1px solid #e4e7ed;
          transition: all 0.2s;
          
          &:hover {
            border-color: #409EFF;
            background: #f0f9ff;
          }
          
          .audio-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            
            .audio-icon {
              margin-right: 10px;
              
              .el-icon {
                font-size: 18px;
                color: #409EFF;
              }
            }
            
            .audio-info {
              flex: 1;
              display: flex;
              align-items: center;
              gap: 8px;
              
              .audio-name {
                font-size: 14px;
                font-weight: 500;
                color: #303133;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
              }
              
              .audio-size {
                font-size: 12px;
                color: #909399;
                background: #fff;
                padding: 2px 6px;
                border-radius: 4px;
                flex-shrink: 0;
              }
            }
          }
          
          .audio-player {
            width: 100%;
            height: 32px;
            
            &::-webkit-media-controls-panel {
              background-color: #fff;
            }
          }
        }
      }
    }
  }
  
  .content-indicators {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
    
    .el-tag {
      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

.post-actions {
  display: flex;
  gap: 20px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
  
  .el-button {
    color: #909399;
    font-size: 14px;
    
    &:hover {
      color: #409EFF;
    }
    
    .el-icon {
      margin-right: 4px;
    }
  }
}

// 删除菜单样式
:deep(.delete-item) {
  color: #f56c6c;
  
  &:hover {
    background-color: #fef0f0;
    color: #f56c6c;
  }
  
  .el-icon {
    margin-right: 6px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .post-card {
    padding: 15px;
  }
  
  .post-content .post-media {
    .images-section .images-grid {
      &.three-images,
      &.four-images,
      &.many-images {
        grid-template-columns: 1fr !important;
        
        .image-item .media-image {
          height: auto !important;
          min-height: 200px;
          max-height: 350px;
        }
      }
      
      &.single-image .image-item .media-image {
        max-height: 400px !important;
        height: auto !important;
      }
      
      &.two-images .image-item .media-image {
        height: auto !important;
        min-height: 150px;
        max-height: 250px;
      }
    }
    
    .audio-section .audio-list .audio-item {
      padding: 10px;
      
      .audio-header .audio-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  }
  
  .content-indicators .el-tag {
    font-size: 11px;
  }
  
  .post-actions {
    gap: 15px;
    
    .el-button {
      font-size: 12px;
    }
  }
}
</style>
