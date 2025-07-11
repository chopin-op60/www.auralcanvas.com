<template>
  <div class="app-layout">
    <!-- Top navigation -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <router-link to="/home" class="logo">
            <h1>AuralCanvas</h1>
          </router-link>
        </div>
        
        <div class="header-center">
          <el-input
            v-model="searchKeyword"
            placeholder="Search content or users..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="header-right">
          <template v-if="userStore.isLoggedIn">
            <el-button type="primary" @click="handleCreatePost">
              <el-icon><Plus /></el-icon>
              Create
            </el-button>
            
            <el-dropdown>
              <div class="user-avatar">
                <el-avatar 
                  :src="userStore.avatar ? getFileUrl(userStore.avatar) : null"
                  :size="32"
                >
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="username">{{ userStore.username }}</span>
              </div>
              
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push('/profile')">
                    <el-icon><User /></el-icon>
                    Profile
                  </el-dropdown-item>
                  <el-dropdown-item @click="router.push('/my-posts')">
                    <el-icon><Document /></el-icon>
                    My Posts
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>
                    Sign Out
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          
          <template v-else>
            <el-button @click="router.push('/login')">Sign In</el-button>
            <el-button type="primary" @click="router.push('/register')">Sign Up</el-button>
          </template>
        </div>
      </div>
    </header>
    
    <!-- Main content area -->
    <main class="app-main">
      <div class="main-content">
        <router-view />
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2024 AuralCanvas. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getFileUrl } from '@/utils'

const router = useRouter()
const userStore = useUserStore()
const searchKeyword = ref('')

// Search handling
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return
  
  // TODO: Implement search functionality
  ElMessage.info('Search feature coming soon...')
}

// Create post
const handleCreatePost = () => {
  router.push('/post/create')
}

// Sign out
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('Are you sure you want to sign out?', 'Confirm', {
      confirmButtonText: 'Sign Out',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
    
    userStore.logout()
    ElMessage.success('Signed out successfully')
    router.push('/home')
  } catch {
    // User cancelled
  }
}
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  position: sticky;
  top: 0;
  z-index: 1000;
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .header-left {
    .logo {
      text-decoration: none;
      color: #409EFF;
      
      h1 {
        font-size: 24px;
        font-weight: 700;
        margin: 0;
      }
    }
  }
  
  .header-center {
    flex: 1;
    max-width: 500px;
    margin: 0 40px;
    
    .search-input {
      width: 100%;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .user-avatar {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      .username {
        font-size: 14px;
        color: #303133;
      }
    }
  }
}

.app-main {
  flex: 1;
  background: #f5f7fa;
  
  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
}

.app-footer {
  background: #fff;
  border-top: 1px solid #e4e7ed;
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
    color: #909399;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .app-header {
    .header-content {
      padding: 0 15px;
      height: 50px;
    }
    
    .header-center {
      margin: 0 20px;
    }
    
    .header-left .logo h1 {
      font-size: 20px;
    }
    
    .user-avatar .username {
      display: none;
    }
  }
  
  .app-main .main-content {
    padding: 15px;
  }
}
</style>
