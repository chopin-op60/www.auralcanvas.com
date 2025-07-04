import request from '@/utils/request'

// 获取用户信息
export function getUser(id) {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

// 获取用户帖子
export function getUserPosts(id, params) {
  return request({
    url: `/users/${id}/posts`,
    method: 'get',
    params
  })
}

// 搜索用户
export function searchUsers(params) {
  return request({
    url: '/users/search',
    method: 'get',
    params
  })
}
