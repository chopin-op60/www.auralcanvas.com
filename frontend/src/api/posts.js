import request from '@/utils/request'

// 获取帖子列表
export function getPostList(params) {
  return request({
    url: '/posts',
    method: 'get',
    params
  })
}

// 获取单个帖子
export function getPost(id) {
  return request({
    url: `/posts/${id}`,
    method: 'get'
  })
}

// 创建帖子
export function createPost(data) {
  return request({
    url: '/posts',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 更新帖子
export function updatePost(id, data) {
  return request({
    url: `/posts/${id}`,
    method: 'put',
    data
  })
}

// 删除帖子
export function deletePost(id) {
  return request({
    url: `/posts/${id}`,
    method: 'delete'
  })
}

// 点赞/取消点赞
export function toggleLike(id) {
  return request({
    url: `/posts/${id}/like`,
    method: 'post'
  })
}

// 获取评论列表
export function getComments(postId, params) {
  return request({
    url: `/posts/${postId}/comments`,
    method: 'get',
    params
  })
}

// 添加评论
export function addComment(postId, data) {
  return request({
    url: `/posts/${postId}/comments`,
    method: 'post',
    data
  })
}

// 删除评论
export function deleteComment(commentId) {
  return request({
    url: `/posts/comments/${commentId}`,
    method: 'delete'
  })
}
