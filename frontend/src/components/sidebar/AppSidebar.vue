<template>
  <div class="app-sidebar" :class="{ 'collapsed': collapsed }">
    <div class="sidebar-header">
      <el-button 
        type="text" 
        @click="toggleSidebar"
        class="collapse-btn"
      >
        <el-icon><Fold v-if="!collapsed" /><Expand v-else /></el-icon>
      </el-button>
    </div>
    
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/home" class="nav-link">
              <el-icon><House /></el-icon>
              <span v-if="!collapsed" class="nav-text">Home</span>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link to="/post/create" class="nav-link">
              <el-icon><Plus /></el-icon>
              <span v-if="!collapsed" class="nav-text">Create</span>
            </router-link>
          </li>
          
          <li v-if="userStore.isLoggedIn" class="nav-item">
            <router-link to="/friends" class="nav-link">
              <el-icon><User /></el-icon>
              <span v-if="!collapsed" class="nav-text">Friends</span>
              <el-badge 
                v-if="friendRequestCount > 0 && !collapsed" 
                :value="friendRequestCount" 
                class="friend-badge"
              />
            </router-link>
          </li>
          
          <li v-if="userStore.isLoggedIn" class="nav-item">
            <router-link to="/messages" class="nav-link">
              <el-icon><ChatDotRound /></el-icon>
              <span v-if="!collapsed" class="nav-text">Messages</span>
              <el-badge 
                v-if="unreadCount > 0 && !collapsed" 
                :value="unreadCount" 
                class="message-badge"
              />
            </router-link>
          </li>
          
          <li v-if="userStore.isLoggedIn" class="nav-item">
            <router-link to="/profile" class="nav-link">
              <el-icon><Avatar /></el-icon>
              <span v-if="!collapsed" class="nav-text">Profile</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { getUnreadCount } from '@/api/messages'
import { getFriendRequests } from '@/api/friends'
import { House, Plus, User, ChatDotRound, Avatar, Fold, Expand } from '@element-plus/icons-vue'

const userStore = useUserStore()
const appStore = useAppStore()

const collapsed = computed({
  get: () => !appStore.sidebar.opened,
  set: (val) => {
    if (val) {
      appStore.closeSidebar()
    } else {
      appStore.toggleSidebar()
    }
  }
})

const unreadCount = ref(0)
const friendRequestCount = ref(0)

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const loadUnreadCount = async () => {
  if (!userStore.isLoggedIn) return
  
  try {
    const response = await getUnreadCount()
    unreadCount.value = response.data.count || 0
  } catch (error) {
    console.error('Failed to load unread count:', error)
  }
}

const loadFriendRequests = async () => {
  if (!userStore.isLoggedIn) return
  
  try {
    const response = await getFriendRequests({ status: 'pending' })
    friendRequestCount.value = response.data.requests?.length || 0
  } catch (error) {
    console.error('Failed to load friend requests:', error)
  }
}

onMounted(() => {
  loadUnreadCount()
  loadFriendRequests()
  
  // 设置定时器定期更新未读消息数
  setInterval(() => {
    loadUnreadCount()
    loadFriendRequests()
  }, 30000) // 30秒更新一次
})
</script>

<style lang="scss" scoped>
.app-sidebar {
  width: 240px;
  height: 100vh;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  position: fixed;
  left: 0;
  top: 60px;
  z-index: 999;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &.collapsed {
    width: 64px;
  }
}

.sidebar-header {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  
  .collapse-btn {
    color: #909399;
    
    &:hover {
      color: #409EFF;
    }
  }
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.sidebar-nav {
  .nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
    
    .nav-item {
      margin-bottom: 4px;
      
      .nav-link {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        text-decoration: none;
        color: #606266;
        transition: all 0.3s ease;
        position: relative;
        
        &:hover {
          background-color: #f5f7fa;
          color: #409EFF;
        }
        
        &.router-link-active {
          background-color: #ecf5ff;
          color: #409EFF;
          border-right: 2px solid #409EFF;
        }
        
        .el-icon {
          font-size: 18px;
          margin-right: 12px;
          min-width: 18px;
        }
        
        .nav-text {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .friend-badge,
        .message-badge {
          margin-left: auto;
        }
      }
    }
  }
}

.collapsed {
  .nav-link {
    justify-content: center;
    padding: 12px 8px;
    
    .nav-text {
      display: none;
    }
    
    .el-icon {
      margin-right: 0;
    }
  }
}

@media (max-width: 768px) {
  .app-sidebar {
    transform: translateX(-100%);
    
    &.opened {
      transform: translateX(0);
    }
  }
}
</style>
