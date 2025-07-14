<template>
  <div class="friend-requests">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="requests.length === 0" class="empty-container">
      <el-empty description="No friend requests" />
    </div>
    
    <div v-else class="requests-list">
      <div v-for="request in requests" :key="request.request_id" class="request-item">
        <el-card shadow="hover">
          <div class="request-content">
            <div class="user-info">
              <el-avatar :src="getFileUrl(request.avatar)" :size="50">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-details">
                <h4 class="username">{{ request.username }}</h4>
                <p v-if="request.bio" class="bio">{{ truncateText(request.bio, 100) }}</p>
                <p class="request-time">{{ fromNow(request.created_at) }}</p>
              </div>
            </div>
            
            <div class="request-actions">
              <el-button 
                type="primary" 
                @click="handleRespond(request.request_id, 'accept')"
              >
                <el-icon><Check /></el-icon>
                Accept
              </el-button>
              <el-button 
                @click="handleRespond(request.request_id, 'reject')"
              >
                <el-icon><Close /></el-icon>
                Decline
              </el-button>
              <el-button 
                text 
                @click="$router.push(`/user/${request.id}`)"
              >
                <el-icon><View /></el-icon>
                View Profile
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User, Check, Close, View } from '@element-plus/icons-vue'
import { getFileUrl, fromNow, truncateText } from '@/utils'

defineProps({
  requests: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['respond-request'])

const handleRespond = (requestId, action) => {
  emit('respond-request', requestId, action)
}
</script>

<style lang="scss" scoped>
.friend-requests {
  .loading-container,
  .empty-container {
    padding: 40px;
    text-align: center;
  }
  
  .requests-list {
    .request-item {
      margin-bottom: 15px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .request-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
          
          .user-details {
            .username {
              margin: 0 0 5px 0;
              color: #303133;
              font-size: 16px;
            }
            
            .bio {
              margin: 0 0 5px 0;
              color: #606266;
              font-size: 14px;
              line-height: 1.4;
            }
            
            .request-time {
              margin: 0;
              color: #909399;
              font-size: 12px;
            }
          }
        }
        
        .request-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
          
          .el-button {
            .el-icon {
              margin-right: 4px;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .request-content {
    flex-direction: column;
    align-items: stretch !important;
    gap: 15px;
    
    .request-actions {
      justify-content: center;
    }
  }
}
</style>
