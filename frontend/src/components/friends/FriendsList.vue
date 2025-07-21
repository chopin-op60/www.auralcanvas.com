<template>
  <div class="friends-list">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="friends.length === 0" class="empty-container">
      <el-empty description="No friends yet">
        <el-button type="primary" @click="$router.push('/friends?tab=search')">
          Find Friends
        </el-button>
      </el-empty>
    </div>
    
    <div v-else class="friends-grid">
      <div v-for="friend in friends" :key="friend.id" class="friend-card">
        <el-card class="friend-item" shadow="hover">
          <div class="friend-avatar">
            <el-avatar 
              :src="getFileUrl(friend.avatar)" 
              :size="60"
              class="clickable-avatar"
              @click="goToUserProfile(friend.id)"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          
          <div class="friend-info">
            <h3 
              class="friend-name clickable-username"
              @click="goToUserProfile(friend.id)"
            >
              {{ friend.username }}
            </h3>
            <p v-if="friend.bio" class="friend-bio">{{ truncateText(friend.bio, 60) }}</p>
            <p class="friend-since">Friends since {{ formatDate(friend.friendship_date, 'MMM YYYY') }}</p>
          </div>
          
          <div class="friend-actions">
            <el-button type="primary" text @click="emit('chat-with-friend', friend)">
              <el-icon><ChatDotRound /></el-icon>
              Message
            </el-button>
            <el-button @click="goToUserProfile(friend.id)">
              <el-icon><View /></el-icon>
              Profile
            </el-button>
            <el-button type="danger" text @click="handleRemoveFriend(friend)">
              <el-icon><Delete /></el-icon>
              Remove
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { User, ChatDotRound, View, Delete } from '@element-plus/icons-vue'
import { getFileUrl, formatDate, truncateText } from '@/utils'

const router = useRouter()

defineProps({
  friends: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['remove-friend', 'chat-with-friend'])

// 跳转到用户个人主页
const goToUserProfile = (userId) => {
  if (userId) {
    router.push(`/user/${userId}`)
  }
}

const handleRemoveFriend = async (friend) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to remove ${friend.username} from your friends?`,
      'Remove Friend',
      {
        confirmButtonText: 'Remove',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    emit('remove-friend', friend.id)
  } catch {
    // User cancelled
  }
}
</script>

<style lang="scss" scoped>
.friends-list {
  .loading-container,
  .empty-container {
    padding: 40px;
    text-align: center;
  }
  
  .friends-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    
    .friend-card {
      .friend-item {
        height: 100%;
        
        :deep(.el-card__body) {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px;
        }
      }
      
      .friend-avatar {
        margin-bottom: 15px;
        
        .clickable-avatar {
          cursor: pointer;
          transition: transform 0.2s ease;
          
          &:hover {
            transform: scale(1.05);
          }
        }
      }
      
      .friend-info {
        flex: 1;
        margin-bottom: 15px;
        
        .friend-name {
          margin: 0 0 8px 0;
          color: #303133;
          font-size: 16px;
          cursor: pointer;
          
          &:hover {
            color: #409EFF;
            text-decoration: underline;
          }
        }
        
        .friend-bio {
          margin: 0 0 8px 0;
          color: #606266;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .friend-since {
          margin: 0;
          color: #909399;
          font-size: 12px;
        }
      }
      
      .friend-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        
        .el-button {
          font-size: 12px;
          padding: 8px 12px;
          
          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .friends-grid {
    grid-template-columns: 1fr;
  }
}
</style>
