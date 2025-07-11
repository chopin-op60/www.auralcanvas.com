<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>Join AuralCanvas</h1>
        <p>Create your account and start sharing your creativity</p>
      </div>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="auth-form"
        @keyup.enter="handleSubmit"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="Username"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="Email address"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="Password"
            size="large"
            :prefix-icon="Lock"
            show-password
            @input="checkPasswordStrength"
          />
          <div v-if="registerForm.password" class="password-strength">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :class="passwordStrength.level"
                :style="{ width: passwordStrength.width }"
              ></div>
            </div>
            <span class="strength-text">{{ passwordStrength.text }}</span>
          </div>
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="Confirm password"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="auth-button"
            :loading="loading"
            @click="handleSubmit"
          >
            Sign Up
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="auth-footer">
        <p>
          Already have an account?
          <router-link to="/login" class="auth-link">Sign in now</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { validateEmail, validatePassword } from '@/utils'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref()
const loading = ref(false)

// Form data
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Password strength
const passwordStrength = computed(() => {
  const result = validatePassword(registerForm.password)
  const levels = ['weak', 'medium', 'strong', 'very-strong']
  const texts = ['Weak', 'Medium', 'Strong', 'Very Strong']
  const widths = ['25%', '50%', '75%', '100%']
  
  return {
    level: levels[result.strength - 1] || 'weak',
    text: texts[result.strength - 1] || 'Weak',
    width: widths[result.strength - 1] || '25%'
  }
})

// Check password strength
const checkPasswordStrength = () => {
  // Trigger reactive update
}

// Custom validators
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please confirm your password'))
  } else if (value !== registerForm.password) {
    callback(new Error('Passwords do not match'))
  } else {
    callback()
  }
}

// Form validation rules
const registerRules = {
  username: [
    { required: true, message: 'Please enter a username', trigger: 'blur' },
    { min: 3, max: 20, message: 'Username must be 3 to 20 characters', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers and underscores', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter an email address', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!validateEmail(value)) {
          callback(new Error('Please enter a valid email address'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  password: [
    { required: true, message: 'Please enter a password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// Submit registration
const handleSubmit = async () => {
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    
    loading.value = true
    await userStore.userRegister({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    })
    
    ElMessage.success('Registration successful, welcome to AuralCanvas!')
    router.push('/home')
    
  } catch (error) {
    console.error('Registration failed:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    font-size: 28px;
    color: #303133;
    margin-bottom: 10px;
  }
  
  p {
    color: #909399;
    font-size: 14px;
  }
}

.auth-form {
  .auth-button {
    width: 100%;
    height: 50px;
    font-size: 16px;
    border-radius: 25px;
  }
  
  .password-strength {
    margin-top: 5px;
    
    .strength-bar {
      width: 100%;
      height: 4px;
      background: #f0f0f0;
      border-radius: 2px;
      overflow: hidden;
      
      .strength-fill {
        height: 100%;
        transition: width 0.3s, background-color 0.3s;
        
        &.weak { background: #f56c6c; }
        &.medium { background: #e6a23c; }
        &.strong { background: #67c23a; }
        &.very-strong { background: #409eff; }
      }
    }
    
    .strength-text {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
  
  p {
    color: #909399;
    font-size: 14px;
  }
  
  .auth-link {
    color: #409EFF;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 30px 20px;
  }
  
  .auth-header h1 {
    font-size: 24px;
  }
}
</style>
