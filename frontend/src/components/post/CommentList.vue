<template>
  <div class="comment-list">
    <div v-if="loading && comments.length === 0" class="loading-container">
      <el-skeleton :rows="2" animated />
    </div>
    
    <div v-else-if="comments.length === 0" class="empty-container">
      <el-empty description="No comments yet" :image-size="80">
        <template #description>
          <span class="empty-text">Be the first to comment!</span>
        </template>
      </el-empty>
    </div>
    
    <div v-else class="comments-container">
      <div 
        v-for="comment in comments" 
        :key="comment.id" 
        class="comment-item"
      >
        <div class="comment-header">
          <div class="user-info">
            <el-avatar 
              :src="getFileUrl(comment.user_avatar)" 
              :size="32"
              class="user-avatar"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="user-details">
              <span class="username">{{ comment.username }}</span>
              <span class="time">{{ fromNow(comment.created_at) }}</span>
            </div>
          </div>
          
          <div v-if="canDelete(comment)" class="comment-actions">
            <el-dropdown trigger="click" @command="(command) => handleCommand(command, comment)">
              <el-button text size="small" circle>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="delete" class="delete-item">
                    <el-icon><Delete /></el-icon>
                    Delete
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <div class="comment-content">
          <p>{{ comment.content }}</p>
        </div>
      </div>
      
      <!-- 加载更多 -->
      <div v-if="hasMore" class="load-more-container">
        <el-button 
          v-if="!loading"
          text 
          @click="$emit('load-more')"
          class="load-more-btn"
        >
          Load more comments
        </el-button>
        <div v-else class="loading-more">
          <el-skeleton :rows="1" animated />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, MoreFilled, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getFileUrl, fromNow } from '@/utils'
import { deleteComment } from '@/api/posts'

const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['comment-deleted', 'load-more'])

const userStore = useUserStore()

const canDelete = (comment) => {
  return userStore.isLoggedIn && 
         userStore.userId && 
         comment.user_id === userStore.userId
}

const handleCommand = async (command, comment) => {
  if (command === 'delete') {
    await handleDelete(comment)
  }
}

const handleDelete = async (comment) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this comment?',
      'Delete Comment',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    await deleteComment(comment.id)
    ElMessage.success('Comment deleted successfully')
    emit('comment-deleted', comment.id)
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete comment:', error)
      const errorMessage = error.response?.data?.message || 'Failed to delete comment'
      ElMessage.error(errorMessage)
    }
  }
}
</script>

<style lang="scss" scoped>
.comment-list {
  .loading-container {
    padding: 20px 0;
  }
  
  .empty-container {
    padding: 30px 20px;
    text-align: center;
    
    .empty-text {
      color: #909399;
      font-size: 14px;
    }
  }
  
  .comments-container {
    .comment-item {
      padding: 16px 0;
      border-bottom: 1px solid #f5f7fa;
      
      &:last-child {
        border-bottom: none;
      }
      
      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          
          .user-avatar {
            flex-shrink: 0;
          }
          
          .user-details {
            display: flex;
            flex-direction: column;
            gap: 2px;
            
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
        
        .comment-actions {
          .el-button {
            color: #c0c4cc;
            
            &:hover {
              color: #909399;
            }
          }
        }
      }
      
      .comment-content {
        margin-left: 40px;
        
        p {
          margin: 0;
          color: #303133;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
    }
    
    .load-more-container {
      padding: 16px 0;
      text-align: center;
      
      .load-more-btn {
        color: #409EFF;
        font-size: 14px;
        
        &:hover {
          color: #66b1ff;
        }
      }
      
      .loading-more {
        padding: 0 20px;
      }
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

@media (max-width: 768px) {
  .comment-list {
    .comments-container {
      .comment-item {
        padding: 12px 0;
        
        .comment-header {
          .user-info {
            gap: 6px;
            
            .user-avatar {
              width: 28px;
              height: 28px;
            }
          }
        }
        
        .comment-content {
          margin-left: 34px;
          
          p {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
