<template>
  <div class="knowledge-config">
    <div class="config-header">
      <h3>Configure AI Knowledge Base</h3>
      <p>Select what information to include in your AI agent's knowledge base</p>
    </div>

    <el-form 
      v-loading="loading"
      :model="configForm" 
      label-width="200px"
      class="config-form"
    >
      <el-form-item label="Profile Information">
        <el-switch 
          v-model="configForm.include_profile_info"
          active-text="Include basic profile info (bio, location, etc.)"
        />
      </el-form-item>

      <el-form-item label="Posted Content">
        <el-switch 
          v-model="configForm.include_posts"
          active-text="Include your posts and their content"
        />
      </el-form-item>

      <el-form-item label="Comments Made">
        <el-switch 
          v-model="configForm.include_comments"
          active-text="Include comments you've made on posts"
        />
      </el-form-item>

      <el-form-item label="Liked Posts">
        <el-switch 
          v-model="configForm.include_liked_posts"
          active-text="Include posts you've liked (shows interests)"
        />
      </el-form-item>

      <el-form-item label="Media Information">
        <el-switch 
          v-model="configForm.include_media_info"
          active-text="Include summary of shared images/audio"
        />
      </el-form-item>

      <el-form-item label="Social Statistics">
        <el-switch 
          v-model="configForm.include_social_stats"
          active-text="Include follower counts and activity stats"
        />
      </el-form-item>

      <el-divider content-position="left">Date Range (Optional)</el-divider>

      <el-form-item label="From Date">
        <el-date-picker
          v-model="configForm.date_range_start"
          type="date"
          placeholder="Start date (leave empty for all)"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="To Date">
        <el-date-picker
          v-model="configForm.date_range_end"
          type="date"
          placeholder="End date (leave empty for all)"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item>
        <div class="config-actions">
          <el-button 
            type="primary" 
            :loading="saving"
            @click="saveConfiguration"
          >
            <el-icon><Check /></el-icon>
            Save Configuration
          </el-button>
          <el-button @click="previewKnowledgeData">
            <el-icon><View /></el-icon>
            Preview Data
          </el-button>
          <el-button 
            type="success"
            :loading="downloading"
            @click="downloadDocument"
          >
            <el-icon><Download /></el-icon>
            Download Document
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <!-- Preview Dialog -->
    <el-dialog
      v-model="previewDialogVisible"
      title="Knowledge Base Preview"
      width="80%"
      class="preview-dialog"
    >
      <div v-if="previewDataResult" class="preview-content">
        <div class="preview-section">
          <h4>User Info</h4>
          <pre>{{ JSON.stringify(previewDataResult.user_info, null, 2) }}</pre>
        </div>

        <div class="preview-section">
          <h4>Content Summary</h4>
          <ul>
            <li>Posts: {{ previewDataResult.posts_count }}</li>
            <li>Comments: {{ previewDataResult.comments_count }}</li>
            <li>Liked Posts: {{ previewDataResult.liked_posts_count }}</li>
          </ul>
        </div>

        <div v-if="previewDataResult.posts_sample?.length > 0" class="preview-section">
          <h4>Sample Posts</h4>
          <div v-for="(post, index) in previewDataResult.posts_sample" :key="post.id" class="sample-item">
            <strong>{{ post.title }}</strong>
            <p>{{ truncateText(post.content_text, 100) }}</p>
          </div>
        </div>

        <div v-if="previewDataResult.comments_sample?.length > 0" class="preview-section">
          <h4>Sample Comments</h4>
          <div v-for="(comment, index) in previewDataResult.comments_sample" :key="index" class="sample-item">
            <p>{{ truncateText(comment.content, 150) }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, View, Download } from '@element-plus/icons-vue'
import { 
  getKnowledgeSelection, 
  updateKnowledgeSelection, 
  previewKnowledgeBase,
  downloadKnowledgeDocument 
} from '@/api/ai'
import { truncateText } from '@/utils'

const loading = ref(false)
const saving = ref(false)
const downloading = ref(false)
const previewDialogVisible = ref(false)
const previewDataResult = ref(null)

const configForm = reactive({
  include_profile_info: true,
  include_posts: true,
  include_comments: true,
  include_liked_posts: false,
  include_media_info: true,
  include_social_stats: false,
  date_range_start: null,
  date_range_end: null
})

// 加载配置
const loadConfiguration = async () => {
  loading.value = true
  try {
    const response = await getKnowledgeSelection()
    Object.assign(configForm, response.data)
  } catch (error) {
    console.error('Failed to load configuration:', error)
    ElMessage.error('Failed to load configuration')
  } finally {
    loading.value = false
  }
}

// 保存配置
const saveConfiguration = async () => {
  saving.value = true
  try {
    await updateKnowledgeSelection(configForm)
    ElMessage.success('Configuration saved successfully')
  } catch (error) {
    console.error('Failed to save configuration:', error)
    ElMessage.error('Failed to save configuration')
  } finally {
    saving.value = false
  }
}

// 预览数据
const previewKnowledgeData = async () => {
  try {
    const response = await previewKnowledgeBase()
    previewDataResult.value = response.data
    previewDialogVisible.value = true
  } catch (error) {
    console.error('Failed to preview data:', error)
    ElMessage.error('Failed to preview data')
  }
}

// 下载文档 - 修复文件下载处理
const downloadDocument = async () => {
  try {
    await ElMessageBox.confirm(
      'This will generate and download your AI knowledge base document. Continue?',
      'Download Confirmation',
      { type: 'info' }
    )

    downloading.value = true
    
    console.log('Starting document download...')
    const response = await downloadKnowledgeDocument()
    
    console.log('Download response received:', {
      dataType: typeof response.data,
      dataSize: response.data ? response.data.size : 'unknown',
      headers: response.headers
    })
    
    // 检查响应是否包含有效的blob数据
    if (!response.data || !(response.data instanceof Blob)) {
      throw new Error('Invalid response data - not a valid file')
    }
    
    // 从响应头获取文件名，如果没有则使用默认名称
    let filename = `ai-knowledge-base-${Date.now()}.md`
    const contentDisposition = response.headers['content-disposition']
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }
    
    console.log('Creating blob and download link...')
    
    // 创建下载链接
    const blob = new Blob([response.data], { type: 'text/markdown' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    
    // 添加到DOM、点击、然后移除
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('Download completed successfully')
    ElMessage.success('Knowledge base document downloaded successfully')
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to download document:', error)
      ElMessage.error(`Failed to download document: ${error.message || 'Unknown error'}`)
    }
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  loadConfiguration()
})
</script>

<style lang="scss" scoped>
.knowledge-config {
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
  
  .config-form {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .config-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    
    .el-button .el-icon {
      margin-right: 6px;
    }
  }
}

.preview-dialog {
  .preview-content {
    .preview-section {
      margin-bottom: 20px;
      
      h4 {
        color: #409eff;
        margin-bottom: 10px;
      }
      
      pre {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 4px;
        font-size: 12px;
        overflow-x: auto;
      }
      
      ul {
        padding-left: 20px;
        
        li {
          margin-bottom: 5px;
        }
      }
      
      .sample-item {
        padding: 8px;
        background: #fafafa;
        border-radius: 4px;
        margin-bottom: 8px;
        
        strong {
          color: #303133;
        }
        
        p {
          margin: 4px 0 0 0;
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .config-actions {
    .el-button {
      width: 100%;
      margin-bottom: 8px;
    }
  }
}
</style>
