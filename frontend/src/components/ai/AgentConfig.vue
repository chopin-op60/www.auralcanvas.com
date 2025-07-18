<template>
  <div class="agent-config">
    <div class="config-header">
      <h3>AI Agent Configuration</h3>
      <p>Configure your AI agent settings and external platform integration</p>
    </div>

    <el-form 
      v-loading="loading"
      ref="agentFormRef"
      :model="agentForm"
      :rules="agentRules"
      label-width="160px"
      class="agent-form"
    >
      <!-- Agent Basic Info -->
      <div class="form-section">
        <h4>Basic Information</h4>
        
        <el-form-item label="Agent Name" prop="agent_name">
          <el-input
            v-model="agentForm.agent_name"
            placeholder="Give your AI agent a name"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Description" prop="agent_description">
          <el-input
            v-model="agentForm.agent_description"
            type="textarea"
            :rows="3"
            placeholder="Describe what your AI agent represents"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Privacy Level" prop="privacy_level">
          <el-select v-model="agentForm.privacy_level" style="width: 100%">
            <el-option label="Public - Anyone can chat" value="public" />
            <el-option label="Friends Only - Only friends can chat" value="friends" />
            <el-option label="Private - Only you can test" value="private" />
          </el-select>
        </el-form-item>
      </div>

      <!-- External Platform Integration -->
      <el-divider content-position="left">External Platform Integration</el-divider>
      
      <div class="form-section">
        <h4>AI Platform Setup</h4>
        <div class="setup-instructions">
          <el-alert
            title="Setup Instructions"
            type="info"
            show-icon
            :closable="false"
          >
            <ol>
              <li>First, configure and download your knowledge base from the "Knowledge Base" tab</li>
              <li>Go to an AI platform (like xingyunlink.com) and create a new agent</li>
              <li>Upload your knowledge base document to train the AI</li>
              <li>Copy the integration code (iframe recommended) provided by the platform</li>
              <li>Paste the code below and save your configuration</li>
            </ol>
          </el-alert>
        </div>

        <el-form-item label="Platform URL" prop="external_platform_url">
          <el-input
            v-model="agentForm.external_platform_url"
            placeholder="https://www.xingyunlink.com/chat/share?shareId=..."
            maxlength="500"
          />
        </el-form-item>

        <el-form-item label="Integration Code" prop="external_script_code">
          <el-input
            v-model="agentForm.external_script_code"
            type="textarea"
            :rows="8"
            placeholder="Paste the integration code from your AI platform here (iframe recommended)..."
          />
          <div class="code-help">
            <small>Supports both &lt;script&gt; tags and &lt;iframe&gt; tags from AI platforms</small>
            <div v-if="agentForm.external_script_code" class="code-info">
              <small>Code length: {{ agentForm.external_script_code.length }} characters</small>
              <small v-if="isIframeCode">- Type: iframe (recommended)</small>
              <small v-else-if="isScriptCode">- Type: script</small>
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- Agent Status -->
      <el-divider content-position="left">Agent Status</el-divider>
      
      <div class="status-section">
        <div class="status-display">
          <el-tag 
            :type="getStatusType(agentForm.status)" 
            size="large"
            effect="dark"
          >
            {{ getStatusText(agentForm.status) }}
          </el-tag>
          <div class="status-description">
            <p>{{ getStatusDescription(agentForm.status) }}</p>
          </div>
        </div>

        <div class="status-actions">
          <el-button
            v-if="agentForm.status === 'disabled' || agentForm.status === 'configured'"
            type="success"
            :disabled="!canActivate"
            @click="activateAgent"
          >
            <el-icon><VideoPlay /></el-icon>
            Activate Agent
          </el-button>
          
          <el-button
            v-if="agentForm.status === 'active'"
            type="warning"
            @click="deactivateAgent"
          >
            <el-icon><VideoPause /></el-icon>
            Deactivate Agent
          </el-button>

          <el-button @click="testAgent" :disabled="agentForm.status !== 'active'">
            <el-icon><ChatDotSquare /></el-icon>
            Test Chat
          </el-button>
        </div>
      </div>

      <!-- Form Actions -->
      <el-form-item class="form-actions">
        <el-button 
          type="primary" 
          :loading="saving"
          @click="saveConfiguration"
        >
          <el-icon><Check /></el-icon>
          Save Configuration
        </el-button>
        <el-button @click="resetForm">
          <el-icon><Refresh /></el-icon>
          Reset
        </el-button>
      </el-form-item>
    </el-form>

    <!-- AI Chat Test Dialog with Complete Isolation -->
    <el-dialog
      v-model="chatTestVisible"
      title="Test AI Agent"
      width="95%"
      class="chat-dialog"
      @close="cleanupTestChat"
    >
      <div class="chat-container">
        <div v-if="agentForm.external_script_code" class="isolated-frame-container">
          <iframe
            ref="isolatedFrame"
            :src="isolatedChatUrl"
            class="completely-isolated-iframe"
            
            allow="microphone"
          ></iframe>
        </div>
        <div v-else class="no-chat">
          <el-empty description="No AI integration configured" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Refresh, VideoPlay, VideoPause, ChatDotSquare } from '@element-plus/icons-vue'
import { 
  getAgentConfig, 
  updateAgentConfig, 
  activateAgent as activateAgentAPI,
  deactivateAgent as deactivateAgentAPI
} from '@/api/ai'

const agentFormRef = ref()
const loading = ref(false)
const saving = ref(false)
const chatTestVisible = ref(false)
const isolatedFrame = ref()
const isolatedChatUrl = ref('')

const agentForm = reactive({
  status: 'disabled',
  agent_name: '',
  agent_description: '',
  external_agent_id: '',
  external_script_code: '',
  external_platform_url: '',
  privacy_level: 'friends'
})

const agentRules = {
  agent_name: [
    { max: 100, message: 'Agent name cannot exceed 100 characters', trigger: 'blur' }
  ],
  agent_description: [
    { max: 500, message: 'Description cannot exceed 500 characters', trigger: 'blur' }
  ]
}

// 检测代码类型
const isIframeCode = computed(() => {
  return agentForm.external_script_code && agentForm.external_script_code.includes('<iframe')
})

const isScriptCode = computed(() => {
  return agentForm.external_script_code && agentForm.external_script_code.includes('<script')
})

// 计算是否可以激活
const canActivate = computed(() => {
  return agentForm.external_script_code && agentForm.external_script_code.trim().length > 0
})

// 状态显示函数
const getStatusType = (status) => {
  const types = {
    'disabled': 'info',
    'configured': 'warning', 
    'active': 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'disabled': 'Disabled',
    'configured': 'Configured',
    'active': 'Active'
  }
  return texts[status] || 'Unknown'
}

const getStatusDescription = (status) => {
  const descriptions = {
    'disabled': 'Agent is not configured yet. Add integration code to enable.',
    'configured': 'Agent is configured but not active. Click activate to make it available.',
    'active': 'Agent is active and available for chat based on privacy settings.'
  }
  return descriptions[status] || ''
}

// 创建完全隔离的聊天URL
const createIsolatedChatUrl = (aiCode) => {
  console.log('Creating completely isolated chat URL')
  
  let targetUrl = ''
  
  if (aiCode.includes('<iframe')) {
    const srcMatch = aiCode.match(/src="([^"]*)"/)
    if (srcMatch) {
      targetUrl = srcMatch[1]
    }
  } else if (aiCode.startsWith('http')) {
    targetUrl = aiCode
  }
  
  if (!targetUrl) {
    console.error('Could not extract URL from AI code')
    return ''
  }
  
  // 使用我们的隔离页面
  const encodedUrl = encodeURIComponent(targetUrl)
  const isolatedUrl = `/ai-chat/?url=${encodedUrl}`
  
  console.log('Created isolated chat URL:', isolatedUrl)
  return isolatedUrl
}

// 加载配置
const loadConfiguration = async () => {
  loading.value = true
  try {
    console.log('Loading agent configuration...')
    const response = await getAgentConfig()
    
    Object.keys(agentForm).forEach(key => {
      if (response.data.hasOwnProperty(key)) {
        agentForm[key] = response.data[key] || ''
      }
    })
    
  } catch (error) {
    console.error('Failed to load agent config:', error)
    ElMessage.error('Failed to load agent configuration')
  } finally {
    loading.value = false
  }
}

// 保存配置
const saveConfiguration = async () => {
  if (!agentFormRef.value) return
  
  try {
    await agentFormRef.value.validate()
    saving.value = true
    
    const dataToSend = {
      agent_name: agentForm.agent_name || null,
      agent_description: agentForm.agent_description || null,
      external_script_code: agentForm.external_script_code || null,
      external_platform_url: agentForm.external_platform_url || null,
      privacy_level: agentForm.privacy_level || 'friends'
    }
    
    console.log('Saving with complete isolation')
    await updateAgentConfig(dataToSend)
    ElMessage.success('Agent configuration saved successfully')
    await loadConfiguration()
    
  } catch (error) {
    console.error('Save error:', error)
    if (error.response) {
      ElMessage.error(error.response.data.message || 'Failed to save configuration')
    } else if (error !== 'validation failed') {
      ElMessage.error('Failed to save configuration')
    }
  } finally {
    saving.value = false
  }
}

// 激活Agent
const activateAgent = async () => {
  try {
    await ElMessageBox.confirm(
      'This will make your AI agent available for chat. Continue?',
      'Activate AI Agent',
      { type: 'warning' }
    )

    await activateAgentAPI()
    ElMessage.success('AI agent activated successfully')
    await loadConfiguration()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to activate agent')
    }
  }
}

// 停用Agent
const deactivateAgent = async () => {
  try {
    await ElMessageBox.confirm(
      'This will disable your AI agent and make it unavailable for chat. Continue?',
      'Deactivate AI Agent',
      { type: 'warning' }
    )

    await deactivateAgentAPI()
    ElMessage.success('AI agent deactivated')
    await loadConfiguration()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to deactivate agent')
    }
  }
}

// 测试AI对话 - 使用完全隔离的页面
const testAgent = async () => {
  if (!agentForm.external_script_code) {
    ElMessage.warning('No integration code configured')
    return
  }

  console.log('Opening test chat with complete isolation')
  
  const url = createIsolatedChatUrl(agentForm.external_script_code)
  if (!url) {
    ElMessage.error('Cannot create isolated chat URL')
    return
  }
  
  isolatedChatUrl.value = url
  chatTestVisible.value = true
  
  console.log('Using completely isolated page:', url)
  ElMessage.success('AI chat loaded in isolated environment')
}

// 清理测试聊天
const cleanupTestChat = () => {
  isolatedChatUrl.value = ''
}

// 重置表单
const resetForm = () => {
  if (agentFormRef.value) {
    agentFormRef.value.resetFields()
  }
  loadConfiguration()
}

onMounted(() => {
  loadConfiguration()
})
</script>

<style lang="scss" scoped>
.agent-config {
  .config-header {
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
  
  .agent-form {
    max-width: 700px;
    margin: 0 auto;
  }
  
  .form-section {
    margin-bottom: 20px;
    
    h4 {
      color: #409eff;
      margin-bottom: 15px;
    }
  }
  
  .setup-instructions {
    margin-bottom: 20px;
    
    ol {
      padding-left: 20px;
      line-height: 1.6;
      
      li {
        margin-bottom: 8px;
      }
    }
  }
  
  .code-help {
    margin-top: 5px;
    color: #909399;
    
    .code-info {
      margin-top: 5px;
      color: #67c23a;
    }
  }
  
  .status-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    
    .status-display {
      flex: 1;
      
      .status-description {
        margin-top: 8px;
        
        p {
          color: #606266;
          margin: 0;
          font-size: 14px;
        }
      }
    }
    
    .status-actions {
      display: flex;
      gap: 10px;
      
      .el-button .el-icon {
        margin-right: 6px;
      }
    }
  }
  
  .form-actions {
    margin-top: 30px;
    text-align: center;
    
    .el-button {
      margin: 0 8px;
      
      .el-icon {
        margin-right: 6px;
      }
    }
  }
}

.chat-dialog {
  .chat-container {
    height: 650px;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    overflow: hidden;
    
    .isolated-frame-container {
      height: 100%;
      width: 100%;
      
      .completely-isolated-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
    }
    
    .no-chat {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  }
}

@media (max-width: 768px) {
  .status-section {
    flex-direction: column;
    align-items: flex-start;
    
    .status-actions {
      width: 100%;
      
      .el-button {
        flex: 1;
      }
    }
  }
  
  .form-actions .el-button {
    width: 100%;
    margin: 8px 0;
  }
  
  .chat-dialog {
    .chat-container {
      height: 500px;
    }
  }
}
</style>
