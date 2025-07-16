<template>
  <div class="comment-form">
    <div class="comment-input-area">
      <el-avatar 
        v-if="userStore.avatar" 
        :src="getFileUrl(userStore.avatar)" 
        :size="32"
        class="user-avatar"
      >
        <el-icon><User /></el-icon>
      </el-avatar>
      
      <div class="input-container">
        <el-input
          v-model="commentText"
          type="textarea"
          :rows="3"
          :placeholder="`Comment on ${username}'s post...`"
          maxlength="500"
          show-word-limit
          resize="none"
          @keydown.ctrl.enter="handleSubmit"
        />
        
        <div class="form-actions">
          <div class="shortcut-hint">
            <span>Ctrl + Enter to post</span>
          </div>
          <div class="action-buttons">
            <el-button 
              v-if="commentText.trim()" 
              text 
              @click="handleClear"
            >
              Cancel
            </el-button>
            <el-button 
              type="primary" 
              @click="handleSubmit"
              :loading="loading"
              :disabled="!commentText.trim() || commentText.length > 500"
            >
              Comment
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getFileUrl } from '@/utils'
import { addComment } from '@/api/posts'

const props = defineProps({
  postId: {
    type: [String, Number],
    required: true
  },
  username: {
    type: String,
    default: 'user'
  }
})

const emit = defineEmits(['comment-added'])

const userStore = useUserStore()
const commentText = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  if (!commentText.value.trim()) {
    ElMessage.warning('Please enter a comment')
    return
  }

  if (commentText.value.length > 500) {
    ElMessage.warning('Comment is too long')
    return
  }

  loading.value = true
  
  try {
    const response = await addComment(props.postId, {
      content: commentText.value.trim()
    })
    
    emit('comment-added', response.data)
    commentText.value = ''
    ElMessage.success('Comment posted successfully')
  } catch (error) {
    console.error('Failed to post comment:', error)
    ElMessage.error(error.response?.data?.message || 'Failed to post comment')
  } finally {
    loading.value = false
  }
}

const handleClear = () => {
  commentText.value = ''
}
</script>

<style lang="scss" scoped>
.comment-form {
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  
  .comment-input-area {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    
    .user-avatar {
      flex-shrink: 0;
      margin-top: 4px;
    }
    
    .input-container {
      flex: 1;
      
      .el-textarea {
        :deep(.el-textarea__inner) {
          border-radius: 8px;
          border-color: #e4e7ed;
          font-size: 14px;
          line-height: 1.5;
          resize: none;
          
          &:focus {
            border-color: #409EFF;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
          }
          
          &::placeholder {
            color: #c0c4cc;
          }
        }
        
        :deep(.el-input__count) {
          color: #909399;
          font-size: 12px;
        }
      }
      
      .form-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        
        .shortcut-hint {
          span {
            font-size: 12px;
            color: #909399;
          }
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
          
          .el-button {
            font-size: 14px;
            
            &.el-button--primary {
              padding: 8px 20px;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .comment-form {
    padding: 12px 0;
    
    .comment-input-area {
      gap: 8px;
      
      .user-avatar {
        width: 28px;
        height: 28px;
      }
      
      .input-container {
        .form-actions {
          .shortcut-hint {
            display: none;
          }
        }
      }
    }
  }
}
</style>
