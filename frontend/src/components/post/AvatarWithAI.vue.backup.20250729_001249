<template>
  <div 
    class="avatar-with-ai"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 头像 -->
    <el-avatar 
      :src="getFileUrl(avatarUrl)" 
      :size="size"
      class="clickable-avatar"
      @click="goToUserProfile(userId)"
    >
      <el-icon><User /></el-icon>
    </el-avatar>
    
    <!-- AI对话按钮 -->
    <transition name="ai-button-fade">
      <div 
        v-if="showAIButton && hasActiveAgent"
        class="ai-chat-button"
        @click.stop="openAIChat"
        v-loading="aiLoading"
      >
        <el-icon><ChatDotSquare /></el-icon>
        <span>AI</span>
      </div>
    </transition>
    
    <!-- AI聊天对话框 -->
    <el-dialog
      v-model="chatDialogVisible"
      :title="agentInfo?.agent_name || `${username}'s AI Assistant`"
      width="90%"
      class="ai-chat-dialog"
      @close="cleanupChat"
    >
      <div class="chat-container">
        <div v-if="chatUrl" class="chat-iframe-container">
          <iframe
            :src="chatUrl"
            class="chat-iframe"
            frameborder="0"
            allow="microphone"
          ></iframe>
        </div>
        <div v-else class="loading-chat">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>Loading AI chat...</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, ChatDotSquare, Loading } from '@element-plus/icons-vue'
import { getFileUrl } from '@/utils'
import { useUserStore } from '@/stores/user'
import { checkUserAIAgent } from '@/api/users'
import { getUserAgent } from '@/api/ai'

const props = defineProps({
  userId: {
    type: [String, Number],
    required: true
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 40
  }
})

const router = useRouter()
const userStore = useUserStore()

// 状态管理
const showAIButton = ref(false)
const hasActiveAgent = ref(false)
const agentInfo = ref(null)
const chatDialogVisible = ref(false)
const chatUrl = ref('')
const aiLoading = ref(false)
const checkTimer = ref(null)

// 计算属性
const isCurrentUser = computed(() => 
  parseInt(props.userId) === parseInt(userStore.userId)
)

// 鼠标进入头像
const handleMouseEnter = async () => {
  // 清除之前的定时器
  if (checkTimer.value) {
    clearTimeout(checkTimer.value)
    checkTimer.value = null
  }
  
  // 如果是自己，不显示AI按钮
  if (isCurrentUser.value) {
    return
  }
  
  // 延迟检查，避免频繁API调用
  checkTimer.value = setTimeout(async () => {
    await checkAIAvailability()
    if (hasActiveAgent.value) {
      showAIButton.value = true
    }
  }, 300)
}

// 鼠标离开头像
const handleMouseLeave = () => {
  // 清除定时器
  if (checkTimer.value) {
    clearTimeout(checkTimer.value)
    checkTimer.value = null
  }
  
  // 延迟隐藏，给用户时间点击按钮
  setTimeout(() => {
    showAIButton.value = false
  }, 200)
}

// 检查AI可用性
const checkAIAvailability = async () => {
  if (!userStore.isLoggedIn || aiLoading.value) {
    return
  }
  
  try {
    aiLoading.value = true
    const response = await checkUserAIAgent(props.userId)
    
    if (response.success && response.data.hasActiveAgent) {
      hasActiveAgent.value = true
      agentInfo.value = response.data.agentInfo
    } else {
      hasActiveAgent.value = false
      agentInfo.value = null
    }
  } catch (error) {
    // 静默处理错误，不显示任何提示
    console.log('AI availability check failed:', error.message)
    hasActiveAgent.value = false
    agentInfo.value = null
  } finally {
    aiLoading.value = false
  }
}

// 点击头像跳转
const goToUserProfile = (userId) => {
  if (userId) {
    router.push(`/user/${userId}`)
  }
}

// 打开AI对话
const openAIChat = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('Please login to chat with AI')
    return
  }
  
  try {
    // 获取完整的AI代理信息
    const response = await getUserAgent(props.userId)
    const agentData = response.data
    
    if (!agentData.external_script_code) {
      ElMessage.error('AI chat is not available')
      return
    }
    
    // 创建聊天URL
    chatUrl.value = createChatUrl(agentData.external_script_code)
    chatDialogVisible.value = true
    
  } catch (error) {
    console.error('Failed to open AI chat:', error)
    ElMessage.error('Cannot access AI chat')
  }
}

// 创建聊天URL
const createChatUrl = (scriptCode) => {
  if (scriptCode.includes('<iframe')) {
    const srcMatch = scriptCode.match(/src="([^"]*)"/)
    if (srcMatch) {
      return srcMatch[1]
    }
  } else if (scriptCode.startsWith('http')) {
    return scriptCode
  }
  
  return ''
}

// 清理聊天
const cleanupChat = () => {
  chatUrl.value = ''
}

// 组件卸载时清理
onUnmounted(() => {
  if (checkTimer.value) {
    clearTimeout(checkTimer.value)
  }
})
</script>

<style lang="scss" scoped>
.avatar-with-ai {
  position: relative;
  display: inline-block;
  
  .clickable-avatar {
    cursor: pointer;
    transition: transform 0.2s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .ai-chat-button {
    position: absolute;
    top: 50%;
    left: calc(100% + 8px);
    transform: translateY(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 6px 10px;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    transition: all 0.2s ease;
    white-space: nowrap;
    z-index: 100;
    
    &:hover {
      transform: translateY(-50%) scale(1.05);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .el-icon {
      font-size: 14px;
    }
    
    span {
      font-size: 11px;
      font-weight: 600;
    }
  }
}

// 按钮动画
.ai-button-fade-enter-active,
.ai-button-fade-leave-active {
  transition: all 0.3s ease;
}

.ai-button-fade-enter-from {
  opacity: 0;
  transform: translateY(-50%) translateX(-10px);
}

.ai-button-fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-10px);
}

// 聊天对话框样式
.ai-chat-dialog {
  .chat-container {
    height: 600px;
    border: 1px solid #e4e7ed;
    border-radius: 12px;
    overflow: hidden;
    background: #f8f9fa;
    
    .chat-iframe-container {
      height: 100%;
      width: 100%;
      
      .chat-iframe {
        width: 100%;
        height: 100%;
        border: none;
        background: white;
        border-radius: 12px;
      }
    }
    
    .loading-chat {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #909399;
      gap: 12px;
      
      .loading-icon {
        font-size: 24px;
        animation: rotate 2s linear infinite;
      }
      
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .ai-chat-button {
    left: calc(100% + 4px) !important;
    padding: 4px 8px !important;
    font-size: 11px !important;
    
    .el-icon {
      font-size: 12px !important;
    }
    
    span {
      font-size: 10px !important;
    }
  }
  
  .ai-chat-dialog {
    .chat-container {
      height: 400px !important;
    }
  }
}
</style>
