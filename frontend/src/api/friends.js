import request from '@/utils/request'

// 获取好友列表
export function getFriends(params) {
  return request({
    url: '/friends',
    method: 'get',
    params
  })
}

// 搜索用户（添加好友）
export function searchUsers(params) {
  return request({
    url: '/friends/search',
    method: 'get',
    params
  })
}

// 发送好友请求
export function sendFriendRequest(data) {
  return request({
    url: '/friends/request',
    method: 'post',
    data
  })
}

// 响应好友请求
export function respondFriendRequest(requestId, action) {
  return request({
    url: `/friends/request/${requestId}`,
    method: 'put',
    data: { action }
  })
}

// 获取好友请求列表
export function getFriendRequests(params) {
  return request({
    url: '/friends/requests',
    method: 'get',
    params
  })
}

// 删除好友
export function removeFriend(friendId) {
  return request({
    url: `/friends/${friendId}`,
    method: 'delete'
  })
}

// 检查好友状态
export function checkFriendStatus(userId) {
  return request({
    url: `/friends/status/${userId}`,
    method: 'get'
  })
}
