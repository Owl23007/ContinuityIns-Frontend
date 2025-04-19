import http from './http'

const baseUrl = '/favorites'

// 获取用户收藏列表
export const getFavorites_get = (params) => {
  return http.get(`${baseUrl}`, { params })
}

// 添加收藏
export const addFavorite_post = (data) => {
  return http.post(`${baseUrl}`, data)
}

// 删除收藏
export const removeFavorite_delete = (favoriteId) => {
  return http.delete(`${baseUrl}/${favoriteId}`)
}

// 检查文章是否已收藏
export const checkFavorite_get = (articleId) => {
  return http.get(`${baseUrl}/check/${articleId}`)
}