import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Cookies from 'js-cookie'
import { login, register, getUserProfile, verifyToken } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(Cookies.get('token') || '')
  const userInfo = ref(null)
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const userId = computed(() => userInfo.value?.id)
  const username = computed(() => userInfo.value?.username)
  const avatar = computed(() => userInfo.value?.avatar)

  // 设置Token
  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      Cookies.set('token', newToken, { expires: 7 })
    } else {
      Cookies.remove('token')
    }
  }

  // 设置用户信息
  function setUserInfo(info) {
    userInfo.value = info
  }

  // 登录
  async function userLogin(loginForm) {
    loading.value = true
    try {
      const response = await login(loginForm)
      const { token: newToken, user } = response.data
      
      setToken(newToken)
      setUserInfo(user)
      
      return response
    } finally {
      loading.value = false
    }
  }

  // 注册
  async function userRegister(registerForm) {
    loading.value = true
    try {
      const response = await register(registerForm)
      const { token: newToken, user } = response.data
      
      setToken(newToken)
      setUserInfo(user)
      
      return response
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    if (!token.value) return null
    
    try {
      const response = await getUserProfile()
      setUserInfo(response.data)
      return response.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      logout()
      return null
    }
  }

  // 验证Token有效性
  async function validateToken() {
    if (!token.value) return false
    
    try {
      const response = await verifyToken()
      setUserInfo(response.data)
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  // 退出登录
  function logout() {
    setToken('')
    setUserInfo(null)
  }

  // 更新用户信息
  function updateUserInfo(newInfo) {
    userInfo.value = { ...userInfo.value, ...newInfo }
  }

  return {
    // 状态
    token,
    userInfo,
    loading,
    
    // 计算属性
    isLoggedIn,
    userId,
    username,
    avatar,
    
    // 方法
    setToken,
    setUserInfo,
    userLogin,
    userRegister,
    fetchUserInfo,
    validateToken,
    logout,
    updateUserInfo
  }
})
