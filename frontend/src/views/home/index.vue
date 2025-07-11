<template>
  <div class="home-page">
    <div class="welcome-banner">
      <h1>Welcome to AuralCanvas</h1>
      <p>Share your creativity and discover amazing multimedia content</p>
    </div>
    
    <div class="content-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="Latest" name="latest">
          <PostList 
            :posts="posts" 
            :loading="loading" 
            @post-deleted="handlePostDeleted"
          />
        </el-tab-pane>
        <el-tab-pane label="Trending" name="trending">
          <PostList 
            :posts="posts" 
            :loading="loading" 
            @post-deleted="handlePostDeleted"
          />
        </el-tab-pane>
        <el-tab-pane label="Following" name="following" v-if="userStore.isLoggedIn">
          <PostList 
            :posts="posts" 
            :loading="loading" 
            @post-deleted="handlePostDeleted"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import PostList from '@/components/post/PostList.vue'
import { getPostList } from '@/api/posts'

const userStore = useUserStore()
const activeTab = ref('latest')
const posts = ref([])
const loading = ref(false)

// Switch tabs
const handleTabChange = async (tab) => {
  console.log('Switching to tab:', tab)
  activeTab.value = tab
  await loadPosts(tab)
}

// Load posts list
const loadPosts = async (tab = 'latest') => {
  console.log('Loading posts for tab:', tab)
  loading.value = true
  
  try {
    const params = {
      page: 1,
      limit: 20
    }
    
    // 根据tab类型添加不同参数
    switch (tab) {
      case 'trending':
        // TODO: 实现热门排序逻辑
        break
      case 'following':
        // TODO: 实现关注用户帖子筛选
        break
      case 'latest':
      default:
        // 默认按时间倒序
        break
    }
    
    const response = await getPostList(params)
    console.log('API response:', response)
    
    if (response.success && response.data) {
      posts.value = response.data.posts || []
      console.log('Loaded posts:', posts.value.length)
    } else {
      console.warn('Invalid response format:', response)
      posts.value = []
    }
  } catch (error) {
    console.error('Failed to load posts:', error)
    ElMessage.error('Failed to load posts, please try again')
    posts.value = []
  } finally {
    loading.value = false
  }
}

// 处理帖子删除后的刷新
const handlePostDeleted = (deletedPostId) => {
  console.log('Post deleted:', deletedPostId)
  
  // 从当前列表中移除已删除的帖子
  posts.value = posts.value.filter(post => post.id !== deletedPostId)
  
  // 如果列表变空，重新加载
  if (posts.value.length === 0) {
    loadPosts(activeTab.value)
  }
}

onMounted(() => {
  loadPosts('latest')
})
</script>

<style lang="scss" scoped>
.home-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-banner {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 30px;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    font-weight: 700;
  }
  
  p {
    font-size: 1.2rem;
    opacity: 0.9;
  }
}

.content-tabs {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

:deep(.el-tabs__content) {
  padding-top: 20px;
}

@media (max-width: 768px) {
  .home-page {
    padding: 10px;
  }
  
  .welcome-banner {
    padding: 30px 15px;
    margin-bottom: 20px;
    
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
  
  .content-tabs {
    padding: 15px;
  }
}
</style>
