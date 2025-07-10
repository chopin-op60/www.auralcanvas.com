<template>
  <div class="app-layout">
    <!-- 顶部导航 -->
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
            placeholder="搜索内容或用户..."
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
              创建
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
                    个人资料
                  </el-dropdown-item>
                  <el-dropdown-item @click="router.push('/my-posts')">
                    <el-icon><Document /></el-icon>
                    我的帖子
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          
          <template v-else>
            <el-button @click="router.push('/login')">登录</el-button>
            <el-button type="primary" @click="router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="app-main">
      <div class="main-content">
        <router-view />
      </div>
    </main>
    
    <!-- 底部 -->
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

// 搜索处理
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return
  
  // TODO: 实现搜索功能
  ElMessage.info('搜索功能开发中...')
}

// 创建帖子
const handleCreatePost = () => {
  router.push('/post/create')
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/home')
  } catch {
    // 用户取消
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
