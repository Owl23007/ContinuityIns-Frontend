import http from './http'

const baseUrl = '/community'

// 获取话题列表
export const getTopics_get = (params) => {
  return http.get(`${baseUrl}/topics`, { params })
}

// 获取话题详情
export const getTopicById_get = (id) => {
  return http.get(`${baseUrl}/topic/${id}`)
}

// 创建新话题
export const createTopic_post = (data) => {
  return http.post(`${baseUrl}/topic`, data)
}

// 更新话题
export const updateTopic_put = (id, data) => {
  return http.put(`${baseUrl}/topic/${id}`, data)
}

// 删除话题
export const deleteTopic_delete = (id) => {
  return http.delete(`${baseUrl}/topic/${id}`)
}

// 获取话题评论
export const getTopicComments_get = (topicId, params) => {
  return http.get(`${baseUrl}/topic/${topicId}/comments`, { params })
}

// 添加评论
export const addComment_post = (topicId, data) => {
  return http.post(`${baseUrl}/topic/${topicId}/comment`, data)
}

// 删除评论
export const deleteComment_delete = (commentId) => {
  return http.delete(`${baseUrl}/comment/${commentId}`)
}

// 获取分类
export const getCategories_get = () => {
  return http.get(`${baseUrl}/categories`)
}