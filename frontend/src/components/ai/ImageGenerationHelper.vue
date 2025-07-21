<template>
  <el-dialog
    v-model="visible"
    title="AI Image Generation Helper"
    width="95%"
    class="image-helper-dialog"
    @close="cleanupChat"
  >
    <div class="helper-content">
      <div class="helper-header">
        <el-alert
          title="AI Image Generation Assistant"
          type="info"
          show-icon
          :closable="false"
        >
          <p>Chat with our AI to generate images and get creative suggestions for your post! The AI can help you:</p>
          <ul>
            <li>Generate custom images based on your descriptions</li>
            <li>Provide image URLs that you can use in your post</li>
            <li>Give you tips on writing better image prompts</li>
            <li>Suggest creative ideas for visual content</li>
          </ul>
        </el-alert>
      </div>

      <div class="chat-container">
        <div class="isolated-frame-container">
          <iframe
            ref="helperFrame"
            :src="helperChatUrl"
            class="helper-iframe"
            allow="microphone"
          ></iframe>
        </div>
      </div>

      <div class="helper-footer">
        <el-button @click="closeHelper">
          <el-icon><Close /></el-icon>
          Close Helper
        </el-button>
        <el-button type="primary" @click="openInNewTab">
          <el-icon><Link /></el-icon>
          Open in New Tab
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Close, Link } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const helperFrame = ref()

// 控制弹窗显示
const visible = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// AI图片生成助手的URL - 使用你提供的智能体
const imageGenerationAgentUrl = 'https://www.xingyunlink.com/chat/share?shareId=5xo4cuxvrxtiepkdb2ugh9yq&showHistory=0'

// 创建隔离的聊天URL
const helperChatUrl = computed(() => {
  const encodedUrl = encodeURIComponent(imageGenerationAgentUrl)
  return `/ai-chat/?url=${encodedUrl}`
})

// 关闭助手
const closeHelper = () => {
  visible.value = false
}

// 在新标签页打开
const openInNewTab = () => {
  window.open(imageGenerationAgentUrl, '_blank')
}

// 清理聊天
const cleanupChat = () => {
  // 清理操作在这里执行
  console.log('AI Image Generation Helper closed')
}
</script>

<style lang="scss" scoped>
.image-helper-dialog {
  .helper-content {
    display: flex;
    flex-direction: column;
    height: 700px;
  }
  
  .helper-header {
    margin-bottom: 20px;
    
    ul {
      margin-top: 10px;
      padding-left: 20px;
      
      li {
        margin: 5px 0;
        line-height: 1.5;
      }
    }
  }
  
  .chat-container {
    flex: 1;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
    
    .isolated-frame-container {
      height: 100%;
      width: 100%;
      
      .helper-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
    }
  }
  
  .helper-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    
    .el-button .el-icon {
      margin-right: 6px;
    }
  }
}

@media (max-width: 768px) {
  .image-helper-dialog {
    .helper-content {
      height: 600px;
    }
    
    .helper-footer {
      flex-direction: column;
      
      .el-button {
        width: 100%;
        margin-bottom: 8px;
      }
    }
  }
}
</style>
