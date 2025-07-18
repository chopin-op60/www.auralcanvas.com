<template>
  <div class="agent-discovery">
    <div class="discovery-header">
      <h3>Discover AI Agents</h3>
      <p>Chat with AI agents created by other users</p>
    </div>

    <div v-loading="loading" class="agents-grid">
      <div v-for="agent in agents" :key="agent.id" class="agent-card">
        <div class="agent-info">
          <el-avatar :src="getFileUrl(agent.avatar)" :size="50">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="info-content">
            <h4>{{ agent.agent_name || `${agent.username}'s AI Assistant` }}</h4>
            <p class="username">by {{ agent.username }}</p>
            <p v-if="agent.agent_description" class="description">
              {{ truncateText(agent.agent_description, 100) }}
            </p>
            <div class="agent-status">
              <el-tag size="small" type="success">
                <el-icon><ChatDotSquare /></el-icon>
                Active
              </el-tag>
            </div>
          </div>
        </div>
        <div class="agent-actions">
          <el-button type="primary" size="small" @click="chatWithAgent(agent)">
            <el-icon><ChatDotSquare /></el-icon>
            Start Chat
          </el-button>
        </div>
      </div>
    </div>

    <div v-if="agents.length === 0 && !loading" class="empty-state">
      <el-empty description="No public AI agents available yet">
        <template #description>
          <p>No public AI agents are available at the moment.</p>
          <p>Be the first to create and share your AI agent!</p>
        </template>
        <el-button type="primary" @click="$router.push('/ai')">
          Create Your AI Agent
        </el-button>
      </el-empty>
    </div>

    <!-- Chat Dialog with Isolation -->
    <el-dialog
      v-model="chatDialogVisible"
      :title="currentAgent?.agent_name || 'AI Chat'"
      width="90%"
      class="agent-chat-dialog"
      @close="cleanupChat"
    >
      <div class="chat-container">
        <div v-if="currentAgent?.external_script_code && sandboxUrl" class="iframe-sandbox">
          <iframe
            ref="isolatedChatIframe"
            :src="sandboxUrl"
            class="isolated-chat-iframe"
            
            allow="microphone"
          ></iframe>
        </div>
        <div v-else class="no-chat">
          <el-empty description="Chat interface not available" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { User, ChatDotSquare } from '@element-plus/icons-vue'
import { getPublicAgents, getUserAgent } from '@/api/ai'
import { getFileUrl, truncateText } from '@/utils'

const loading = ref(false)
const agents = ref([])
const chatDialogVisible = ref(false)
const currentAgent = ref(null)
const isolatedChatIframe = ref()
const sandboxUrl = ref('')

// 创建隔离的沙箱URL
const createSandboxUrl = (aiCode) => {
  console.log('Creating sandbox URL for discovery:', aiCode.substring(0, 100) + '...')
  
  if (aiCode.includes('<iframe')) {
    const srcMatch = aiCode.match(/src="([^"]*)"/)
    if (srcMatch) {
      console.log('Extracted iframe src for discovery:', srcMatch[1])
      return srcMatch[1]
    }
  } else if (aiCode.startsWith('http')) {
    console.log('Using direct URL for discovery:', aiCode)
    return aiCode
  }
  
  console.warn('Unknown AI code format in discovery')
  return ''
}

// 加载公开AI代理
const loadPublicAgents = async () => {
  loading.value = true
  try {
    console.log('Loading public agents...')
    const response = await getPublicAgents({ limit: 20 })
    agents.value = response.data.agents || []
    console.log('Loaded agents:', agents.value.length)
  } catch (error) {
    console.error('Failed to load public agents:', error)
    ElMessage.error('Failed to load AI agents')
  } finally {
    loading.value = false
  }
}

// 与AI代理对话
const chatWithAgent = async (agent) => {
  try {
    console.log('=== chatWithAgent called (Discovery with isolation) ===')
    console.log('Agent basic info:', agent)
    
    // 获取完整的代理信息
    const response = await getUserAgent(agent.user_id)
    currentAgent.value = response.data
    console.log('Full agent data:', currentAgent.value)
    
    if (!currentAgent.value.external_script_code) {
      console.error('No AI code found')
      ElMessage.error('Invalid AI chat configuration')
      return
    }
    
    // 创建隔离的沙箱URL
    const url = createSandboxUrl(currentAgent.value.external_script_code)
    if (!url) {
      ElMessage.error('Cannot create sandbox URL for AI chat')
      return
    }
    
    sandboxUrl.value = url
    chatDialogVisible.value = true
    
    console.log('Opening discovery chat in isolated environment:', url)
    ElMessage.success('AI chat loaded successfully')
    
  } catch (error) {
    console.error('Failed to access agent:', error)
    ElMessage.error('Cannot access this AI agent')
  }
}

// 清理聊天容器
const cleanupChat = () => {
  console.log('Discovery chat cleaned up')
  sandboxUrl.value = ''
  currentAgent.value = null
}

// 组件挂载时加载数据
import { onMounted } from 'vue'
onMounted(() => {
  loadPublicAgents()
})
</script>

<style lang="scss" scoped>
.agent-discovery {
  .discovery-header {
    text-align: center;
    margin-bottom: 30px;
    
    h3 {
      color: #303133;
      margin-bottom: 8px;
    }
    
    p {
      color: #909399;
      font-size: 14px;
    }
  }
  
  .agents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .agent-card {
    border: 1px solid #e4e7ed;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s;
    background: white;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #409eff;
      transform: translateY(-2px);
    }
    
    .agent-info {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
      
      .info-content {
        flex: 1;
        
        h4 {
          margin: 0 0 5px 0;
          color: #303133;
          font-size: 16px;
          font-weight: 600;
        }
        
        .username {
          margin: 0 0 8px 0;
          color: #909399;
          font-size: 12px;
        }
        
        .description {
          margin: 0 0 10px 0;
          color: #606266;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .agent-status {
          .el-tag {
            .el-icon {
              margin-right: 4px;
              font-size: 12px;
            }
          }
        }
      }
    }
    
    .agent-actions {
      text-align: right;
      
      .el-button {
        .el-icon {
          margin-right: 6px;
        }
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    
    .el-empty {
      :deep(.el-empty__description) {
        p {
          margin: 8px 0;
          color: #909399;
        }
      }
    }
  }
}

.agent-chat-dialog {
  .chat-container {
    height: 600px;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    overflow: hidden;
    background: #f8f9fa;
    
    .iframe-sandbox {
      height: 100%;
      width: 100%;
      
      .isolated-chat-iframe {
        width: 100%;
        height: 100%;
        border: none;
        background: white;
      }
    }
    
    .no-chat {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: white;
    }
  }
}

@media (max-width: 768px) {
  .agents-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .agent-card {
    padding: 15px;
    
    .agent-actions {
      text-align: center;
      
      .el-button {
        width: 100%;
      }
    }
  }
  
  .agent-chat-dialog {
    .chat-container {
      height: 400px;
    }
  }
}
</style>
