<template>
  <div class="chat-window">
    <!-- Chat Header -->
    <div class="chat-header">
      <div class="user-info">
        <el-avatar :src="getFileUrl(conversation?.other_user?.avatar)" :size="35">
          <el-icon><User /></el-icon>
        </el-avatar>
        <div class="user-details">
          <h3 class="username">{{ conversation?.other_user?.username }}</h3>
          <span class="status">Online</span>
        </div>
      </div>
      
      <div class="chat-actions">
        <el-button type="text" @click="$router.push(`/user/${conversation?.other_user?.id}`)">
          <el-icon><User /></el-icon>
          Profile
        </el-button>
      </div>
    </div>
    
    <!-- Messages Area -->
    <div ref="messagesContainer" class="messages-container">
      <div v-if="messagesLoading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="messages.length === 0" class="empty-messages">
        <el-empty description="No messages yet. Start the conversation!" />
      </div>
      
      <div v-else class="messages-list">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message-item"
          :class="{ 'own-message': message.sender_id === userStore.userId }"
        >
          <div class="message-bubble">
            <p class="message-content">{{ message.content }}</p>
            <span class="message-time">{{ formatDate(message.created_at, 'HH:mm') }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Message Input -->
    <div class="message-input">
      <el-input
        v-model="newMessage"
        type="textarea"
        :rows="2"
        placeholder="Type a message..."
        @keydown.enter.prevent="handleSendMessage"
        @keydown.shift.enter="handleNewLine"
      />
      <el-button 
        type="primary" 
        :disabled="!newMessage.trim()"
        :loading="sending"
        @click="handleSendMessage"
      >
        <el-icon><Promotion /></el-icon>
        Send
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Promotion } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getConversationMessages, sendMessage, markConversationAsRead } from '@/api/messages'
import { getFileUrl, formatDate } from '@/utils'

const userStore = useUserStore()
const messagesContainer = ref(null)

const props = defineProps({
  conversationId: {
    type: Number,
    required: true
  },
  conversation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['message-sent'])

const messages = ref([])
const messagesLoading = ref(false)
const newMessage = ref('')
const sending = ref(false)

const loadMessages = async () => {
  if (!props.conversationId) return
  
  messagesLoading.value = true
  try {
    const response = await getConversationMessages(props.conversationId)
    messages.value = response.data.messages || []
    
    // 标记对话为已读
    await markConversationAsRead(props.conversationId)
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('Failed to load messages:', error)
    ElMessage.error('Failed to load messages')
  } finally {
    messagesLoading.value = false
  }
}

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return
  
  const messageContent = newMessage.value.trim()
  newMessage.value = ''
  sending.value = true
  
  try {
    const response = await sendMessage({
      conversationId: props.conversationId,
      receiverId: props.conversation?.other_user?.id,
      content: messageContent
    })
    
    // 添加新消息到列表
    messages.value.push(response.data.message)
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
    
    emit('message-sent')
  } catch (error) {
    console.error('Failed to send message:', error)
    ElMessage.error('Failed to send message')
    newMessage.value = messageContent // 恢复消息内容
  } finally {
    sending.value = false
  }
}

const handleNewLine = (event) => {
  // Shift + Enter 添加新行
  const textarea = event.target
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  newMessage.value = newMessage.value.substring(0, start) + '\n' + newMessage.value.substring(end)
  
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 1
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 监听对话ID变化
watch(() => props.conversationId, (newId) => {
  if (newId) {
    loadMessages()
  }
}, { immediate: true })

onMounted(() => {
  loadMessages()
})
</script>

<style lang="scss" scoped>
.chat-window {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .user-details {
      .username {
        margin: 0 0 2px 0;
        font-size: 16px;
        color: #303133;
      }
      
      .status {
        color: #67c23a;
        font-size: 12px;
      }
    }
  }
  
  .chat-actions {
    .el-button .el-icon {
      margin-right: 4px;
    }
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px 20px;
  background: #f8f9fa;
  
  .loading-container,
  .empty-messages {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .messages-list {
    .message-item {
      margin-bottom: 12px;
      display: flex;
      
      &.own-message {
        justify-content: flex-end;
        
        .message-bubble {
          background: #409EFF;
          color: white;
        }
      }
      
      .message-bubble {
        max-width: 70%;
        background: white;
        padding: 10px 14px;
        border-radius: 18px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        
        .message-content {
          margin: 0 0 4px 0;
          line-height: 1.4;
          font-size: 14px;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .message-time {
          font-size: 11px;
          opacity: 0.7;
        }
      }
    }
  }
}

.message-input {
  display: flex;
  gap: 12px;
  padding: 15px 20px;
  background: white;
  border-top: 1px solid #e4e7ed;
  align-items: flex-end;
  
  .el-textarea {
    flex: 1;
    
    :deep(.el-textarea__inner) {
      border-radius: 20px;
      resize: none;
    }
  }
  
  .el-button {
    border-radius: 20px;
    padding: 10px 20px;
    
    .el-icon {
      margin-right: 4px;
    }
  }
}

@media (max-width: 768px) {
  .chat-header {
    padding: 12px 15px;
  }
  
  .messages-container {
    padding: 12px 15px;
    
    .message-bubble {
      max-width: 85% !important;
    }
  }
  
  .message-input {
    padding: 12px 15px;
  }
}
</style>
