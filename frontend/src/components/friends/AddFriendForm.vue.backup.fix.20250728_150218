<template>
  <div class="add-friend-form">
    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="Search users by username or email..."
        @keyup.enter="handleSearch"
        @input="handleInputChange"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="handleSearch">Search</el-button>
        </template>
      </el-input>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="searchResults.length === 0 && hasSearched" class="empty-container">
      <el-empty description="No users found" />
    </div>
    
    <div v-else-if="searchResults.length > 0" class="search-results">
      <div v-for="user in searchResults" :key="user.id" class="user-item">
        <el-card shadow="hover">
          <div class="user-content">
            <div class="user-info">
              <el-avatar :src="getFileUrl(user.avatar)" :size="40">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-details">
                <h4 class="username">{{ user.username }}</h4>
                <p v-if="user.bio" class="bio">{{ truncateText(user.bio, 60) }}</p>
              </div>
            </div>
            
            <div class="user-actions">
              <el-button 
                type="primary" 
                :loading="user.sending"
                @click="handleSendRequest(user)"
              >
                <el-icon><Plus /></el-icon>
                Add Friend
              </el-button>
              <el-button text @click="$router.push(`/user/${user.id}`)">
                <el-icon><View /></el-icon>
                View Profile
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          :page-size="pagination.limit"
          :total="pagination.total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, User, Plus, View } from '@element-plus/icons-vue'
import { searchUsers, sendFriendRequest } from '@/api/friends'
import { getFileUrl, truncateText } from '@/utils'
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['friend-added'])

const searchKeyword = ref('')
const searchResults = ref([])
const loading = ref(false)
const hasSearched = ref(false)

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const handleInputChange = () => {
  if (searchKeyword.value.trim() === '') {
    searchResults.value = []
    hasSearched.value = false
  }
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('Please enter a search keyword')
    return
  }
  
  loading.value = true
  hasSearched.value = true
  
  try {
    const response = await searchUsers({
      keyword: searchKeyword.value.trim(),
      page: pagination.page,
      limit: pagination.limit
    })
    
    searchResults.value = response.data.users.map(user => ({
      ...user,
      sending: false
    }))
    
    pagination.total = response.data.pagination.total
    pagination.totalPages = response.data.pagination.totalPages
  } catch (error) {
    console.error('Search failed:', error)
    ElMessage.error('Search failed, please try again')
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  pagination.page = page
  handleSearch()
}

const handleSendRequest = async (user) => {
  user.sending = true
  
  try {
    await sendFriendRequest({ userId: user.id })
    ElMessage.success(`Friend request sent to ${user.username}`)
    
    // 从搜索结果中移除这个用户
    const index = searchResults.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      searchResults.value.splice(index, 1)
    }
    
    emit('friend-added')
  } catch (error) {
    console.error('Failed to send friend request:', error)
    ElMessage.error(error.response?.data?.message || 'Failed to send friend request')
  } finally {
    user.sending = false
  }
}
</script>

<style lang="scss" scoped>
.add-friend-form {
  .search-section {
    margin-bottom: 20px;
  }
  
  .loading-container,
  .empty-container {
    padding: 40px;
    text-align: center;
  }
  
  .search-results {
    .user-item {
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .user-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          
          .user-details {
            .username {
              margin: 0 0 4px 0;
              color: #303133;
              font-size: 14px;
            }
            
            .bio {
              margin: 0;
              color: #606266;
              font-size: 12px;
              line-height: 1.4;
            }
          }
        }
        
        .user-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
          
          .el-button {
            font-size: 12px;
            
            .el-icon {
              margin-right: 4px;
            }
          }
        }
      }
    }
    
    .pagination-container {
      margin-top: 20px;
      text-align: center;
    }
  }
}

@media (max-width: 768px) {
  .user-content {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 12px;
    
    .user-actions {
      justify-content: center;
    }
  }
}
</style>
