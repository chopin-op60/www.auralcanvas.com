<template>
  <div class="ai-agent-page">
    <div class="page-container">
      <div class="page-header">
        <h1>AI Agent Management</h1>
        <p>Create and manage your personal AI agent based on your social media activity</p>
      </div>

      <el-tabs v-model="activeTab" class="ai-tabs">
        <!-- Knowledge Base Configuration -->
        <el-tab-pane label="Knowledge Base" name="knowledge">
          <div class="tab-content">
            <KnowledgeBaseConfig />
          </div>
        </el-tab-pane>

        <!-- AI Agent Configuration -->
        <el-tab-pane label="Agent Setup" name="agent">
          <div class="tab-content">
            <AgentConfig />
          </div>
        </el-tab-pane>

        <!-- Discover Agents -->
        <el-tab-pane label="Discover Agents" name="discover">
          <div class="tab-content">
            <AgentDiscovery />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import KnowledgeBaseConfig from '@/components/ai/KnowledgeBaseConfig.vue'
import AgentConfig from '@/components/ai/AgentConfig.vue'
import AgentDiscovery from '@/components/ai/AgentDiscovery.vue'

const activeTab = ref('knowledge')
</script>

<style lang="scss" scoped>
.ai-agent-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.page-header {
  padding: 30px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  h1 {
    font-size: 28px;
    margin-bottom: 8px;
    font-weight: 700;
  }
  
  p {
    font-size: 16px;
    opacity: 0.9;
  }
}

.ai-tabs {
  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 30px;
    background: #fafbfc;
  }
  
  :deep(.el-tabs__content) {
    padding: 0;
  }
}

.tab-content {
  padding: 30px;
  min-height: 500px;
}

@media (max-width: 768px) {
  .ai-agent-page {
    padding: 15px;
  }
  
  .page-header {
    padding: 20px;
    
    h1 {
      font-size: 24px;
    }
    
    p {
      font-size: 14px;
    }
  }
  
  .ai-tabs {
    :deep(.el-tabs__header) {
      padding: 0 15px;
    }
  }
  
  .tab-content {
    padding: 20px 15px;
  }
}
</style>
