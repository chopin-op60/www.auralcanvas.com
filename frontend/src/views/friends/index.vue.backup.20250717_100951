<template>
  <div class="friends-page">
    <div class="page-header">
      <h1>Friends</h1>
      <el-button type="primary" @click="showAddFriendDialog = true">
        <el-icon><Plus /></el-icon>
        Add Friend
      </el-button>
    </div>
    
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="Friends" name="friends">
        <FriendsList 
          :friends="friends" 
          :loading="loading"
          @remove-friend="handleRemoveFriend"
          @chat-with-friend="handleChatWithFriend"
        />
      </el-tab-pane>
      
      <el-tab-pane name="requests">
        <template #label>
          Requests
          <el-badge v-if="requests.length > 0" :value="requests.length" class="tab-badge" />
        </template>
        <FriendRequests 
          :requests="requests"
          :loading="requestsLoading"
          @respond-request="handleRespondRequest"
        />
      </el-tab-pane>
    </el-tabs>
    
    <!-- Add Friend Dialog -->
    <el-dialog 
      v-model="showAddFriendDialog" 
      title="Add Friend" 
      width="500px"
    >
      <AddFriendForm @friend-added="handleFriendAdded" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getFriends, getFriendRequests, respondFriendRequest, removeFriend } from '@/api/friends'
import { createOrGetConversation } from '@/api/messages'
import FriendsList from '@/components/friends/FriendsList.vue'
import FriendRequests from '@/components/friends/FriendRequests.vue'
import AddFriendForm from '@/components/friends/AddFriendForm.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('friends')
const friends = ref([])
const requests = ref([])
const loading = ref(false)
const requestsLoading = ref(false)
const showAddFriendDialog = ref(false)

const handleTabChange = (tab) => {
  if (tab === 'requests') {
    loadFriendRequests()
  }
}

const loadFriends = async () => {
  loading.value = true
  try {
    const response = await getFriends()
    friends.value = response.data.friends || []
  } catch (error) {
    console.error('Failed to load friends:', error)
    ElMessage.error('Failed to load friends')
  } finally {
    loading.value = false
  }
}

const loadFriendRequests = async () => {
  requestsLoading.value = true
  try {
    const response = await getFriendRequests({ status: 'pending' })
    requests.value = response.data.requests || []
  } catch (error) {
    console.error('Failed to load friend requests:', error)
    ElMessage.error('Failed to load friend requests')
  } finally {
    requestsLoading.value = false
  }
}

const handleRemoveFriend = async (friendId) => {
  try {
    await removeFriend(friendId)
    ElMessage.success('Friend removed successfully')
    loadFriends()
  } catch (error) {
    console.error('Failed to remove friend:', error)
    ElMessage.error('Failed to remove friend')
  }
}

const handleRespondRequest = async (requestId, action) => {
  try {
    await respondFriendRequest(requestId, action)
    ElMessage.success(`Friend request ${action}`)
    loadFriendRequests()
    
    if (action === 'accept') {
      loadFriends()
    }
  } catch (error) {
    console.error('Failed to respond to friend request:', error)
    ElMessage.error('Failed to respond to friend request')
  }
}

const handleFriendAdded = () => {
  showAddFriendDialog.value = false
  loadFriends()
}

const handleChatWithFriend = async (friend) => {
  try {
    const response = await createOrGetConversation(friend.id)
    const conversationId = response.data.conversation.id
    router.push(`/messages/${conversationId}`)
  } catch (error) {
    console.error('Failed to create conversation:', error)
    ElMessage.error('Failed to start conversation')
  }
}

onMounted(() => {
  loadFriends()
  loadFriendRequests()
})
</script>

<style lang="scss" scoped>
.friends-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h1 {
    margin: 0;
    color: #303133;
  }
}

.tab-badge {
  margin-left: 8px;
}

:deep(.el-tabs__content) {
  padding-top: 20px;
}
</style>
