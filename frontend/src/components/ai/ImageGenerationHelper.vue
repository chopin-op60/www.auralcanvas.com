<template>
  <el-dialog
    v-model="visible"
    title="AI Creation Studio"
    class="ai-creation-dialog"
    @close="cleanupChat"
    :width="dialogWidth"
    :fullscreen="isFullscreen"
    :top="dialogTop"
    :center="true"
  >
    <div class="creation-content">
      <!-- 🔧 移除instruction区域，直接显示聊天界面 -->
      <div class="chat-container">
        <div class="isolated-frame-container">
          <iframe
            ref="helperFrame"
            :src="helperChatUrl"
            class="helper-iframe"
            allow="microphone"
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <div class="helper-footer">
        <el-button @click="closeHelper">
          <el-icon><Close /></el-icon>
          Close
        </el-button>
        <el-button type="primary" @click="openInNewTab">
          <el-icon><Link /></el-icon>
          Open in New Tab
        </el-button>
        <el-button 
          v-if="!isFullscreen" 
          type="info" 
          @click="toggleFullscreen"
        >
          <el-icon><FullScreen /></el-icon>
          Fullscreen
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { Close, Link, FullScreen } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const helperFrame = ref()
const isFullscreen = ref(false)

// 控制弹窗显示
const visible = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// 🔧 动态计算对话框的顶部位置，确保完全可见
const dialogTop = computed(() => {
  if (typeof window !== 'undefined') {
    const height = window.innerHeight
    
    // 根据屏幕高度计算合适的顶部边距
    if (height >= 1080) return '5vh'  // 大屏幕：更大边距
    if (height >= 900) return '4vh'   // 中等屏幕：中等边距
    if (height >= 700) return '3vh'   // 小屏幕：小边距
    
    return '2vh'  // 超小屏幕：最小边距
  }
  return '3vh'
})

// 🔧 保持原有的宽度设置
const dialogWidth = computed(() => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth
    
    // 手机端：全屏显示
    if (width < 768) return '95%'
    
    // 平板：较大尺寸
    if (width < 1024) return '80%'
    
    // 桌面端：大尺寸，但保持合理比例
    if (width < 1440) return '70%'
    
    // 大屏幕：固定最大宽度
    return '1100px'
  }
  return '70%'
})

// 🔧 监听对话框显示，自动滚动到顶部
watch(visible, async (newValue) => {
  if (newValue) {
    await nextTick()
    // 滚动到页面顶部，确保对话框完全可见
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
})

// AI创作工作室的URL
const imageGenerationAgentUrl = 'https://www.xingyunlink.com/chat/share?shareId=5xo4cuxvrxtiepkdb2ugh9yq&showHistory=0'

// 创建隔离的聊天URL
const helperChatUrl = computed(() => {
  const encodedUrl = encodeURIComponent(imageGenerationAgentUrl)
  return `/ai-chat/?url=${encodedUrl}`
})

// 关闭助手
const closeHelper = () => {
  visible.value = false
  isFullscreen.value = false
}

// 在新标签页打开
const openInNewTab = () => {
  window.open(imageGenerationAgentUrl, '_blank')
}

// 切换全屏模式
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// 清理聊天
const cleanupChat = () => {
  console.log('AI Creation Studio closed')
  isFullscreen.value = false
}
</script>

<style lang="scss" scoped>
.ai-creation-dialog {
  // 🔧 确保对话框在视窗内完全可见
  :deep(.el-dialog) {
    box-sizing: border-box;
    border-radius: 16px !important;
    overflow: hidden;
    // 🔧 重要：确保对话框不超出视窗
    margin-top: 0 !important;
    margin-bottom: 3vh !important;
    
    // 🔧 桌面端：调整高度确保完全可见
    @media (min-width: 1024px) {
      max-width: 1100px !important;
      width: 70vw !important;
      min-height: 75vh;
      max-height: 88vh; // 降低最大高度，确保底部可见
    }
    
    // 🔧 平板端：适中尺寸
    @media (min-width: 768px) and (max-width: 1023px) {
      width: 80vw !important;
      max-width: 850px !important;
      min-height: 70vh;
      max-height: 85vh;
    }
    
    // 🔧 手机端：调整高度
    @media (max-width: 767px) {
      width: 95vw !important;
      max-width: 95vw !important;
      min-height: 75vh;
      max-height: 88vh; // 确保底部可见
    }
  }
  
  // 🔧 全屏模式
  :deep(.el-dialog.is-fullscreen) {
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    border-radius: 0 !important;
    max-height: 100vh;
    top: 0 !important;
  }
  
  // 🔧 对话框头部样式
  :deep(.el-dialog__header) {
    padding: 18px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    flex-shrink: 0;
    
    .el-dialog__title {
      color: white;
      font-weight: 700;
      font-size: 20px;
    }
    
    .el-dialog__headerbtn .el-dialog__close {
      color: white;
      font-size: 20px;
      
      &:hover {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
    height: 100%;
  }
  
  .creation-content {
    display: flex;
    flex-direction: column;
    // 🔧 调整高度计算，确保完全可见
    height: clamp(600px, 75vh, 800px);
    overflow: hidden;
    box-sizing: border-box;
    
    // 桌面端：优化高度
    @media (min-width: 1024px) {
      height: clamp(700px, 80vh, 850px);
    }
    
    // 平板端：中等高度
    @media (min-width: 768px) and (max-width: 1023px) {
      height: clamp(550px, 75vh, 750px);
    }
    
    // 手机端：合理高度
    @media (max-width: 767px) {
      height: clamp(500px, 70vh, 700px);
    }
  }
  
  .chat-container {
    flex: 1;
    overflow: hidden;
    background: #f8f9fa;
    min-height: 0; // 重要：让flex子项可以收缩
    
    .isolated-frame-container {
      height: 100%;
      width: 100%;
      position: relative;
      
      .helper-iframe {
        width: 100%;
        height: 100%;
        border: none;
        display: block;
        box-sizing: border-box;
        background: white;
      }
    }
  }
  
  .helper-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 14px 24px;
    background: #fafbfc;
    border-top: 1px solid #e4e7ed;
    flex-shrink: 0;
    min-height: 56px;
    
    .el-button {
      font-size: 14px;
      padding: 9px 18px;
      
      .el-icon {
        margin-right: 5px;
      }
    }
  }
}

// 🔧 全屏模式特殊处理
.ai-creation-dialog:has(.el-dialog.is-fullscreen) {
  .creation-content {
    height: calc(100vh - 120px);
  }
  
  .helper-footer {
    padding: 18px 24px;
    min-height: 64px;
    
    .el-button {
      font-size: 15px;
      padding: 10px 20px;
    }
  }
}

// 🔧 大屏幕特殊优化
@media (min-width: 1440px) {
  .ai-creation-dialog {
    :deep(.el-dialog) {
      width: 1100px !important;
      max-width: 1100px !important;
      max-height: 90vh; // 确保大屏幕也不超出
    }
    
    .creation-content {
      height: clamp(750px, 82vh, 950px);
    }
    
    :deep(.el-dialog__header) {
      padding: 20px 28px;
      
      .el-dialog__title {
        font-size: 21px;
      }
    }
    
    .helper-footer {
      padding: 16px 28px;
      gap: 18px;
      
      .el-button {
        font-size: 14px;
        padding: 10px 20px;
      }
    }
  }
}

// 🔧 移动端优化
@media (max-width: 767px) {
  .ai-creation-dialog {
    :deep(.el-dialog) {
      margin-bottom: 2vh !important;
    }
    
    :deep(.el-dialog__header) {
      padding: 14px 18px;
      
      .el-dialog__title {
        font-size: 17px;
      }
      
      .el-dialog__headerbtn .el-dialog__close {
        font-size: 17px;
      }
    }
    
    .helper-footer {
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px 14px;
      
      .el-button {
        flex: 1;
        min-width: 90px;
        font-size: 12px;
        padding: 7px 14px;
        
        &:last-child {
          flex: 1 1 100%;
          margin-top: 3px;
        }
      }
    }
  }
}

// 🔧 超小屏幕适配
@media (max-width: 480px) {
  .ai-creation-dialog {
    :deep(.el-dialog) {
      width: 98vw !important;
      max-width: 98vw !important;
      min-height: 80vh;
      max-height: 92vh;
      margin-bottom: 1vh !important;
    }
    
    .creation-content {
      height: clamp(450px, 75vh, 650px);
    }
    
    :deep(.el-dialog__header) {
      padding: 12px 14px;
      
      .el-dialog__title {
        font-size: 15px;
      }
    }
    
    .helper-footer {
      padding: 8px 10px;
      min-height: 48px;
      
      .el-button {
        font-size: 11px;
        padding: 5px 10px;
      }
    }
  }
}

// 🔧 特殊高度适配
@media (max-height: 700px) {
  .ai-creation-dialog {
    .creation-content {
      height: 85vh !important;
    }
    
    :deep(.el-dialog) {
      max-height: 92vh !important;
      margin-bottom: 1vh !important;
    }
    
    :deep(.el-dialog__header) {
      padding: 12px 20px;
    }
    
    .helper-footer {
      padding: 10px 20px;
      min-height: 48px;
    }
  }
}

@media (min-height: 1000px) {
  .ai-creation-dialog {
    .creation-content {
      height: clamp(800px, 85vh, 1100px);
    }
    
    @media (min-width: 1024px) {
      :deep(.el-dialog) {
        max-height: 92vh;
      }
    }
  }
}

// 🔧 深色模式适配
@media (prefers-color-scheme: dark) {
  .ai-creation-dialog {
    :deep(.el-dialog) {
      background: #1d1d1d;
      border: 1px solid #404040;
    }
    
    .chat-container {
      background: #2d2d2d;
    }
    
    .helper-footer {
      background: #262626;
      border-top-color: #404040;
    }
  }
}

// 🔧 确保对话框始终在视窗内
.ai-creation-dialog {
  :deep(.el-dialog) {
    // 重要：使用固定定位确保可见性
    position: fixed !important;
    max-height: calc(100vh - 6vh) !important;
    overflow-y: auto;
  }
}
</style>
