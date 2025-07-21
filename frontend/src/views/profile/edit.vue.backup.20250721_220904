<template>
  <div class="edit-profile-page">
    <div class="edit-container">
      <div class="page-header">
        <h1>Edit Profile</h1>
        <p>Update your profile information</p>
      </div>

      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="120px"
        class="profile-form"
      >
        <!-- Cover Image Upload -->
        <el-form-item label="Cover Image">
          <div class="cover-upload-section">
            <div 
              class="cover-preview"
              :style="{ backgroundImage: coverPreview ? `url(${coverPreview})` : 'none' }"
            >
              <div v-if="!coverPreview" class="default-cover">
                <el-icon><Picture /></el-icon>
                <p>Upload cover image</p>
              </div>
              <div class="cover-actions">
                <el-upload
                  ref="coverUploadRef"
                  :auto-upload="false"
                  :show-file-list="false"
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                  :before-upload="beforeCoverUpload"
                  :on-change="handleCoverChange"
                >
                  <el-button type="primary" size="small">
                    <el-icon><Upload /></el-icon>
                    Change Cover
                  </el-button>
                </el-upload>
                <el-button v-if="coverPreview" size="small" @click="removeCover">
                  <el-icon><Delete /></el-icon>
                  Remove
                </el-button>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- Avatar Upload -->
        <el-form-item label="Avatar">
          <div class="avatar-upload-section">
            <el-avatar 
              :src="avatarPreview" 
              :size="80"
              class="avatar-preview"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="avatar-actions">
              <el-upload
                ref="avatarUploadRef"
                :auto-upload="false"
                :show-file-list="false"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                :before-upload="beforeAvatarUpload"
                :on-change="handleAvatarChange"
              >
                <el-button size="small">
                  <el-icon><Upload /></el-icon>
                  Change Avatar
                </el-button>
              </el-upload>
            </div>
          </div>
        </el-form-item>

        <!-- Basic Info -->
        <el-form-item label="Username" prop="username">
          <el-input
            v-model="profileForm.username"
            placeholder="Enter your username"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input
            v-model="profileForm.email"
            type="email"
            placeholder="Enter your email"
          />
        </el-form-item>

        <el-form-item label="Bio" prop="bio">
          <el-input
            v-model="profileForm.bio"
            type="textarea"
            :rows="4"
            placeholder="Tell us about yourself..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Location" prop="location">
          <el-input
            v-model="profileForm.location"
            placeholder="Where are you from?"
            maxlength="100"
          />
        </el-form-item>

        <el-form-item label="Website" prop="website">
          <el-input
            v-model="profileForm.website"
            placeholder="Your personal website (optional)"
            maxlength="255"
          />
        </el-form-item>

        <!-- Actions -->
        <el-form-item class="form-actions">
          <el-button 
            type="primary" 
            size="large"
            :loading="submitting" 
            @click="submitProfile"
          >
            <el-icon><Check /></el-icon>
            Save Changes
          </el-button>
          <el-button size="large" @click="resetForm">
            <el-icon><Refresh /></el-icon>
            Reset
          </el-button>
          <el-button size="large" @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
            Cancel
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserProfile, updateProfile } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { getFileUrl, validateEmail } from '@/utils'

const router = useRouter()
const userStore = useUserStore()

const profileFormRef = ref()
const avatarUploadRef = ref()
const coverUploadRef = ref()
const submitting = ref(false)

const profileForm = reactive({
  username: '',
  email: '',
  bio: '',
  location: '',
  website: ''
})

const profileRules = {
  username: [
    { required: true, message: 'Username is required', trigger: 'blur' },
    { min: 3, max: 50, message: 'Username must be 3-50 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (!validateEmail(value)) {
        callback(new Error('Please enter a valid email'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

const avatarPreview = ref('')
const coverPreview = ref('')
const avatarFile = ref(null)
const coverFile = ref(null)

// Load current profile data
const loadProfile = async () => {
  try {
    const response = await getUserProfile()
    const profile = response.data
    
    Object.assign(profileForm, {
      username: profile.username,
      email: profile.email,
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || ''
    })
    
    if (profile.avatar) {
      avatarPreview.value = getFileUrl(profile.avatar)
    }
    
    if (profile.cover_image) {
      coverPreview.value = getFileUrl(profile.cover_image)
    }
  } catch (error) {
    console.error('Failed to load profile:', error)
    ElMessage.error('Failed to load profile data')
  }
}

// Avatar upload handlers
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('Avatar must be an image!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('Avatar size cannot exceed 2MB!')
    return false
  }
  return false
}

const handleAvatarChange = (file) => {
  if (!file.raw) return
  
  avatarFile.value = file.raw
  avatarPreview.value = URL.createObjectURL(file.raw)
}

// Cover upload handlers
const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('Cover must be an image!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('Cover size cannot exceed 5MB!')
    return false
  }
  return false
}

const handleCoverChange = (file) => {
  if (!file.raw) return
  
  coverFile.value = file.raw
  coverPreview.value = URL.createObjectURL(file.raw)
}

const removeCover = () => {
  coverFile.value = null
  coverPreview.value = ''
  if (coverUploadRef.value) {
    coverUploadRef.value.clearFiles()
  }
}

// Submit profile
const submitProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    
    submitting.value = true
    
    const formData = new FormData()
    
    // Add text fields
    Object.keys(profileForm).forEach(key => {
      if (profileForm[key] !== null && profileForm[key] !== undefined) {
        formData.append(key, profileForm[key])
      }
    })
    
    // Add files
    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value)
    }
    if (coverFile.value) {
      formData.append('cover_image', coverFile.value)
    }

    await updateProfile(formData)
    
    // Update user store
    userStore.updateUserInfo({
      username: profileForm.username,
      avatar: avatarPreview.value
    })
    
    ElMessage.success('Profile updated successfully!')
    router.push('/profile')
    
  } catch (error) {
    console.error('Failed to update profile:', error)
    const errorMessage = error.response?.data?.message || 'Failed to update profile'
    ElMessage.error(errorMessage)
  } finally {
    submitting.value = false
  }
}

// Reset form
const resetForm = () => {
  if (profileFormRef.value) {
    profileFormRef.value.resetFields()
  }
  avatarFile.value = null
  coverFile.value = null
  loadProfile()
}

onMounted(() => {
  loadProfile()
})
</script>

<style lang="scss" scoped>
.edit-profile-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.edit-container {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 28px;
    color: #303133;
    margin-bottom: 8px;
    font-weight: 700;
  }
  
  p {
    color: #909399;
    font-size: 14px;
  }
}

.cover-upload-section {
  .cover-preview {
    height: 160px;
    background-size: cover;
    background-position: center;
    background-color: #f8f9fa;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    border: 2px dashed #dcdfe6;
    
    .default-cover {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #909399;
      
      .el-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }
      
      p {
        margin: 0;
        font-size: 14px;
      }
    }
    
    .cover-actions {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      gap: 8px;
    }
  }
}

.avatar-upload-section {
  display: flex;
  align-items: center;
  gap: 15px;
  
  .avatar-preview {
    border: 2px solid #e4e7ed;
  }
}

.form-actions {
  margin-top: 30px;
  text-align: center;
  
  .el-button {
    margin: 0 8px;
    
    .el-icon {
      margin-right: 6px;
    }
  }
}

@media (max-width: 768px) {
  .edit-profile-page {
    padding: 15px;
  }
  
  .edit-container {
    padding: 20px;
  }
  
  .form-actions .el-button {
    display: block;
    width: 100%;
    margin: 8px 0;
  }
}
</style>
