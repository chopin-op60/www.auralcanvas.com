import request from '@/utils/request'

// 获取对话列表
export function getConversations(params) {
  return request({
    url: '/messages/conversations',
    method: 'get',
    params
  })
}

// 获取对话消息
export function getConversationMessages(conversationId, params) {
  return request({
    url: `/messages/conversations/${conversationId}/messages`,
    method: 'get',
    params
  })
}

// 发送消息
export function sendMessage(data) {
  return request({
    url: '/messages/send',
    method: 'post',
    data
  })
}

// 标记消息为已读
export function markMessageAsRead(messageId) {
  return request({
    url: `/messages/${messageId}/read`,
    method: 'put'
  })
}

// 标记对话为已读
export function markConversationAsRead(conversationId) {
  return request({
    url: `/messages/conversations/${conversationId}/read`,
    method: 'put'
  })
}

// 创建或获取对话
export function createOrGetConversation(userId) {
  return request({
    url: '/messages/conversations/create',
    method: 'post',
    data: { userId }
  })
}

// 获取未读消息数量
export function getUnreadCount() {
  return request({
    url: '/messages/unread-count',
    method: 'get'
  })
}
