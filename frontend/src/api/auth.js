import request from '@/utils/request'

// 用户注册
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserProfile() {
  return request({
    url: '/auth/profile',
    method: 'get'
  })
}

// 更新用户资料
export function updateProfile(data) {
  return request({
    url: '/auth/profile',
    method: 'put',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 验证Token
export function verifyToken() {
  return request({
    url: '/auth/verify',
    method: 'get'
  })
}
