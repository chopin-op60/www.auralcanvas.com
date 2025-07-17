<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="Repost this post"
    width="500px"
    :before-close="handleClose"
    class="repost-dialog"
  >
    <div class="repost-content">
      <!-- 转发评论输入框 -->
      <div class="comment-section">
        <div class="user-info">
          <el-avatar 
            :src="getFileUrl(userStore.avatar)" 
            :size="40"
          >
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="username">{{ userStore.username }}</span>
        </div>
        
        <el-input
          v-model="repostComment"
          type="textarea"
          :rows="3"
          placeholder="Add your thoughts about this post... (optional)"
          maxlength="280"
          show-word-limit
          resize="none"
          class="comment-input"
        />
      </div>
      
      <!-- 原帖预览 -->
      <div class="original-post-preview">
        <div class="preview-header">
          <el-icon><Refresh /></el-icon>
          <span>Reposting</span>
        </div>
        
        <div class="original-post-card">
          <div class="post-header">
            <el-avatar 
              :src="getFileUrl(post.user_avatar)" 
              :size="32"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="post-user-info">
              <span class="username">{{ post.username }}</span>
              <span class="time">{{ fromNow(post.created_at) }}</span>
            </div>
          </div>
          
          <div class="post-content">
            <h4 class="post-title">{{ post.title }}</h4>
            <p v-if="post.description" class="post-description">
              {{ truncateText(post.description, 100) }}
            </p>
            <p v-if="post.content_text" class="post-text">
              {{ truncateText(post.content_text, 150) }}
            </p>
            
            <!-- 媒体文件预览 -->
            <div v-if="post.media && post.media.length > 0" class="media-preview">
              <div v-if="imageCount > 0" class="media-info">
                <el-icon><Picture /></el-icon>
                {{ imageCount }} image{{ imageCount > 1 ? 's' : '' }}
              </div>
              <div v-if="audioCount > 0" class="media-info">
                <el-icon><VideoPlay /></el-icon>
                {{ audioCount }} audio file{{ audioCount > 1 ? 's' : '' }}
              </div>
            </div>
          </div>
          
          <div class="post-stats">
            <span class="stat">
              <el-icon><StarFilled /></el-icon>
              {{ post.likes_count || 0 }}
            </span>
            <span class="stat">
              <el-icon><ChatDotSquare /></el-icon>
              {{ post.comments_count || 0 }}
            </span>
            <span class="stat">
              <el-icon><Share /></el-icon>
              {{ post.reposts_count || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button 
          type="primary" 
          @click="handleRepost"
          :loading="submitting"
        >
          <el-icon><Share /></el-icon>
          Repost
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  User, Refresh, Picture, VideoPlay, StarFilled, 
  ChatDotSquare, Share 
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getFileUrl, fromNow, truncateText } from '@/utils'
import { toggleRepost } from '@/api/posts'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'reposted'])

const userStore = useUserStore()
const repostComment = ref('')
const submitting = ref(false)

// 计算媒体文件数量
const imageCount = computed(() => {
  return props.post.media?.filter(m => m.media_type === 'image').length || 0
})

const audioCount = computed(() => {
  return props.post.media?.filter(m => m.media_type === 'audio').length || 0
})

const handleClose = () => {
  emit('update:visible', false)
  repostComment.value = ''
}

const handleRepost = async () => {
  submitting.value = true
  
  try {
    const data = repostComment.value.trim() ? 
      { comment: repostComment.value.trim() } : {}
    
    const response = await toggleRepost(props.post.id, data)
    
    ElMessage.success('Post reposted successfully!')
    
    emit('reposted', {
      postId: props.post.id,
      reposted: response.data.reposted,
      reposts_count: response.data.reposts_count,
      comment: repostComment.value.trim()
    })
    
    handleClose()
  } catch (error) {
    console.error('Failed to repost:', error)
    ElMessage.error(error.response?.data?.message || 'Failed to repost')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.repost-dialog {
  :deep(.el-dialog__header) {
    padding: 20px 20px 10px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  :deep(.el-dialog__body) {
    padding: 20px;
  }
  
  .repost-content {
    .comment-section {
      margin-bottom: 20px;
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        
        .username {
          font-weight: 600;
          color: #303133;
          font-size: 14px;
        }
      }
      
      .comment-input {
        :deep(.el-textarea__inner) {
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
        }
      }
    }
    
    .original-post-preview {
      .preview-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        color: #909399;
        font-size: 14px;
        
        .el-icon {
          font-size: 16px;
        }
      }
      
      .original-post-card {
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        padding: 16px;
        background: #fafbfc;
        
        .post-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          
          .post-user-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            
            .username {
              font-weight: 600;
              color: #303133;
              font-size: 13px;
            }
            
            .time {
              color: #909399;
              font-size: 11px;
            }
          }
        }
        
        .post-content {
          margin-bottom: 12px;
          
          .post-title {
            font-size: 15px;
            color: #303133;
            margin: 0 0 6px 0;
            font-weight: 600;
          }
          
          .post-description {
            font-size: 13px;
            color: #606266;
            margin: 0 0 8px 0;
            line-height: 1.4;
          }
          
          .post-text {
            font-size: 13px;
            color: #303133;
            margin: 0 0 8px 0;
            line-height: 1.4;
            background: white;
            padding: 8px 12px;
            border-radius: 6px;
          }
          
          .media-preview {
            display: flex;
            gap: 16px;
            
            .media-info {
              display: flex;
              align-items: center;
              gap: 4px;
              color: #909399;
              font-size: 12px;
              
              .el-icon {
                font-size: 14px;
              }
            }
          }
        }
        
        .post-stats {
          display: flex;
          gap: 16px;
          padding-top: 8px;
          border-top: 1px solid #e4e7ed;
          
          .stat {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #909399;
            font-size: 12px;
            
            .el-icon {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 15px 20px;
    border-top: 1px solid #f0f0f0;
    
    .el-button {
      .el-icon {
        margin-right: 6px;
      }
    }
  }
}

@media (max-width: 768px) {
  .repost-dialog {
    :deep(.el-dialog) {
      width: 95% !important;
      margin: 5vh auto;
    }
    
    .original-post-card {
      padding: 12px !important;
      
      .post-stats {
        gap: 12px !important;
      }
    }
  }
}
</style>
