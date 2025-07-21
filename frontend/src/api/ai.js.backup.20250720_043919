import request from '@/utils/request'

// 获取知识库选择配置
export function getKnowledgeSelection() {
  return request({
    url: '/ai/knowledge/selection',
    method: 'get'
  })
}

// 更新知识库选择
export function updateKnowledgeSelection(data) {
  return request({
    url: '/ai/knowledge/selection',
    method: 'put',
    data
  })
}

// 预览知识库内容
export function previewKnowledgeBase() {
  return request({
    url: '/ai/knowledge/preview',
    method: 'get'
  })
}

// 下载知识库文档
export function downloadKnowledgeDocument() {
  return request({
    url: '/ai/knowledge/download',
    method: 'get',
    responseType: 'blob'
  })
}

// 获取AI代理配置
export function getAgentConfig() {
  return request({
    url: '/ai/agent/config',
    method: 'get'
  })
}

// 更新AI代理配置
export function updateAgentConfig(data) {
  return request({
    url: '/ai/agent/config',
    method: 'put',
    data
  })
}

// 激活AI代理
export function activateAgent() {
  return request({
    url: '/ai/agent/activate',
    method: 'post'
  })
}

// 停用AI代理
export function deactivateAgent() {
  return request({
    url: '/ai/agent/deactivate',
    method: 'post'
  })
}

// 获取公开AI代理列表
export function getPublicAgents(params) {
  return request({
    url: '/ai/agents/public',
    method: 'get',
    params
  })
}

// 获取用户AI代理（供其他用户访问）
export function getUserAgent(userId) {
  return request({
    url: `/ai/agents/user/${userId}`,
    method: 'get'
  })
}
