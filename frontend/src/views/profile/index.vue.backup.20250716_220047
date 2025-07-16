<template>
  <div class="profile-page">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else class="profile-container">
      <!-- Cover Image -->
      <div class="cover-section">
        <div 
          class="cover-image"
          :style="{ backgroundImage: profile.cover_image ? `url(${getFileUrl(profile.cover_image)})` : 'none' }"
        >
          <div v-if="!profile.cover_image" class="default-cover">
            <el-icon><Picture /></el-icon>
            <p>No cover image</p>
          </div>
        </div>
      </div>
      
      <!-- Profile Info -->
      <div class="profile-info">
        <div class="avatar-section">
          <el-avatar 
            :src="profile.avatar ? getFileUrl(profile.avatar) : null" 
            :size="120"
            class="profile-avatar"
          >
            <el-icon><User /></el-icon>
          </el-avatar>
        </div>
        
        <div class="info-section">
          <h1 class="username">{{ profile.username }}</h1>
          <p v-if="profile.bio" class="bio">{{ profile.bio }}</p>
          
          <div class="meta-info">
            <div v-if="profile.location" class="meta-item">
              <el-icon><Location /></el-icon>
              <span>{{ profile.location }}</span>
            </div>
            <div v-if="profile.website" class="meta-item">
              <el-icon><Link /></el-icon>
              <a :href="profile.website" target="_blank">{{ profile.website }}</a>
            </div>
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>Joined {{ formatDate(profile.created_at, 'MMMM YYYY') }}</span>
            </div>
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <span class="number">{{ profile.posts_count || 0 }}</span>
              <span class="label">Posts</span>
            </div>
            <div class="stat-item">
              <span class="number">{{ profile.followers_count || 0 }}</span>
              <span class="label">Followers</span>
            </div>
            <div class="stat-item">
              <span class="number">{{ profile.following_count || 0 }}</span>
              <span class="label">Following</span>
            </div>
          </div>
        </div>
        
        <div class="actions-section">
          <el-button type="primary" @click="$router.push('/profile/edit')">
            <el-icon><Edit /></el-icon>
            Edit Profile
          </el-button>
        </div>
      </div>
      
      <!-- Posts Section -->
      <div class="posts-section">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <el-tab-pane label="My Posts" name="posts">
            <PostList 
              :posts="userPosts" 
              :loading="postsLoading" 
              @post-deleted="handlePostDeleted"
            />
          </el-tab-pane>
          <el-tab-pane label="Liked Posts" name="liked">
            <div class="coming-soon">
              <el-empty description="Coming soon..." />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getUserProfile } from '@/api/auth'
import { getUserPosts } from '@/api/users'
import { getFileUrl, formatDate } from '@/utils'
import PostList from '@/components/post/PostList.vue'

const userStore = useUserStore()
const loading = ref(true)
const postsLoading = ref(false)
const profile = ref({})
const userPosts = ref([])
const activeTab = ref('posts')

// Load profile data
const loadProfile = async () => {
  try {
    loading.value = true
    const response = await getUserProfile()
    profile.value = response.data
  } catch (error) {
    console.error('Failed to load profile:', error)
    ElMessage.error('Failed to load profile')
  } finally {
    loading.value = false
  }
}

// Load user posts
const loadUserPosts = async () => {
  try {
    postsLoading.value = true
    const response = await getUserPosts(userStore.userId, { limit: 20 })
    userPosts.value = response.data.posts || []
  } catch (error) {
    console.error('Failed to load user posts:', error)
    ElMessage.error('Failed to load posts')
  } finally {
    postsLoading.value = false
  }
}

// Handle post deleted
const handlePostDeleted = (deletedPostId) => {
  userPosts.value = userPosts.value.filter(post => post.id !== deletedPostId)
  // Update posts count
  if (profile.value.posts_count > 0) {
    profile.value.posts_count--
  }
}

onMounted(async () => {
  await loadProfile()
  await loadUserPosts()
})
</script>

<style lang="scss" scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
}

.loading-container {
  padding: 40px;
  background: white;
  border-radius: 12px;
}

.profile-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.cover-section {
  .cover-image {
    height: 200px;
    background-size: cover;
    background-position: center;
    background-color: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .default-cover {
      text-align: center;
      color: #909399;
      
      .el-icon {
        font-size: 48px;
        margin-bottom: 8px;
      }
      
      p {
        margin: 0;
        font-size: 14px;
      }
    }
  }
}

.profile-info {
  padding: 20px 30px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: start;
  position: relative;
  margin-top: -60px;
  
  .avatar-section {
    .profile-avatar {
      border: 4px solid white;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    }
  }
  
  .info-section {
    padding-top: 60px;
    
    .username {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      margin: 0 0 8px 0;
    }
    
    .bio {
      color: #606266;
      margin: 0 0 16px 0;
      line-height: 1.6;
      font-size: 16px;
    }
    
    .meta-info {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #909399;
        font-size: 14px;
        
        .el-icon {
          font-size: 16px;
        }
        
        a {
          color: #409EFF;
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
    
    .stats {
      display: flex;
      gap: 24px;
      
      .stat-item {
        text-align: center;
        
        .number {
          display: block;
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }
        
        .label {
          display: block;
          font-size: 12px;
          color: #909399;
          margin-top: 2px;
        }
      }
    }
  }
  
  .actions-section {
    padding-top: 60px;
    
    .el-button .el-icon {
      margin-right: 6px;
    }
  }
}

.posts-section {
  border-top: 1px solid #e4e7ed;
  
  .profile-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
      padding: 0 30px;
      background: #fafbfc;
    }
    
    :deep(.el-tabs__content) {
      padding: 20px 30px;
    }
  }
  
  .coming-soon {
    text-align: center;
    padding: 40px 20px;
  }
}

@media (max-width: 768px) {
  .profile-info {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 15px;
    padding: 20px 15px;
    
    .info-section,
    .actions-section {
      padding-top: 0;
    }
    
    .actions-section {
      .el-button {
        width: 100%;
      }
    }
  }
  
  .posts-section {
    .profile-tabs {
      :deep(.el-tabs__header) {
        padding: 0 15px;
      }
      
      :deep(.el-tabs__content) {
        padding: 20px 15px;
      }
    }
  }
}
</style>
