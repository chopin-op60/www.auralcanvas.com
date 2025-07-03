<template>
  <div class="home-page">
    <div class="welcome-banner">
      <h1>欢迎来到 AuralCanvas</h1>
      <p>分享您的创意，发现更多精彩内容</p>
    </div>
    
    <div class="content-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="最新" name="latest">
          <PostList :posts="posts" :loading="loading" />
        </el-tab-pane>
        <el-tab-pane label="热门" name="hot">
          <PostList :posts="posts" :loading="loading" />
        </el-tab-pane>
        <el-tab-pane label="关注" name="following" v-if="userStore.isLoggedIn">
          <PostList :posts="posts" :loading="loading" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import PostList from '@/components/post/PostList.vue'

const userStore = useUserStore()
const activeTab = ref('latest')
const posts = ref([])
const loading = ref(false)

// 切换标签页
const handleTabChange = (tab) => {
  console.log('切换到:', tab)
  // TODO: 根据标签页加载不同内容
}

// 加载帖子列表
const loadPosts = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取帖子
    // const response = await getPostList()
    // posts.value = response.data.posts
    
    // 临时数据
    posts.value = []
  } catch (error) {
    console.error('加载帖子失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPosts()
})
</script>

<style lang="scss" scoped>
.home-page {
  max-width: 800px;
  margin: 0 auto;
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
}

@media (max-width: 768px) {
  .welcome-banner {
    padding: 30px 15px;
    
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
}
</style>
