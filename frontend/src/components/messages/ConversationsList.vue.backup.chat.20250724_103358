<template>
  <div class="conversations-list">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="4" animated />
    </div>
    
    <div v-else-if="conversations.length === 0" class="empty-container">
      <el-empty description="No conversations yet">
        <el-button type="primary" @click="$router.push('/friends')">
          Start a conversation
        </el-button>
      </el-empty>
    </div>
    
    <div v-else class="conversations">
      <div 
        v-for="conversation in conversations" 
        :key="conversation.id"
        class="conversation-item"
        :class="{ 'active': conversation.id === activeConversation }"
        @click="selectConversation(conversation.id)"
      >
        <div class="conversation-avatar">
          <el-avatar 
            :src="getFileUrl(conversation.other_user.avatar)" 
            :size="45"
            class="clickable-avatar"
            @click.stop="goToUserProfile(conversation.other_user.id)"
          >
            <el-icon><User /></el-icon>
          </el-avatar>
          <span v-if="conversation.unread_count > 0" class="unread-badge">
            {{ conversation.unread_count }}
          </span>
        </div>
        
        <div class="conversation-info">
          <div class="conversation-header">
            <h4 
              class="user-name clickable-username"
              @click.stop="goToUserProfile(conversation.other_user.id)"
            >
              {{ conversation.other_user.username }}
            </h4>
            <span class="last-time">{{ fromNow(conversation.last_message_at) }}</span>
          </div>
          
          <div class="last-message">
            <p class="message-text">{{ truncateText(conversation.last_message || 'Start a conversation', 40) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User } from '@element-plus/icons-vue'
import { getFileUrl, fromNow, truncateText } from '@/utils'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  conversations: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  activeConversation: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['conversation-selected'])

const selectConversation = (conversationId) => {
  emit('conversation-selected', conversationId)
}

// 跳转到用户个人主页
const goToUserProfile = (userId) => {
  if (userId) {
    router.push(`/user/${userId}`)
  }
}
</script>

<style lang="scss" scoped>
.conversations-list {
  height: 100%;
  
  .loading-container,
  .empty-container {
    padding: 20px;
    text-align: center;
  }
  
  .conversations {
    .conversation-item {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      cursor: pointer;
      transition: background-color 0.3s;
      border-bottom: 1px solid #f5f7fa;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      &.active {
        background-color: #ecf5ff;
        border-right: 3px solid #409EFF;
      }
      
      .conversation-avatar {
        position: relative;
        margin-right: 12px;
        flex-shrink: 0;
        
        .clickable-avatar {
          cursor: pointer;
          transition: transform 0.2s ease;
          
          &:hover {
            transform: scale(1.05);
          }
        }
        
        .unread-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #f56c6c;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 16px;
          text-align: center;
          font-weight: 500;
        }
      }
      
      .conversation-info {
        flex: 1;
        overflow: hidden;
        
        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          
          .user-name {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #303133;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: pointer;
            
            &:hover {
              color: #409EFF;
              text-decoration: underline;
            }
          }
          
          .last-time {
            font-size: 11px;
            color: #909399;
            flex-shrink: 0;
            margin-left: 8px;
          }
        }
        
        .last-message {
          .message-text {
            margin: 0;
            font-size: 12px;
            color: #606266;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
}
</style>
