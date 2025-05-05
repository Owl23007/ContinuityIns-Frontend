import { publicRequest, privateRequest } from './http'
import defaultCover from '@/assets/image/default_cover.png'

// 转换文章数据结构
const transformArticleData = (item) => {
  // 确保所有字段都有合理值
  const cover = item.cover || defaultCover
  const summary = item.summary
    ? item.content.substring(0, 100) + (item.content.length > 100 ? '...' : '')
    : '暂无摘要'

  return {
    id: item.article_id || 0,
    title: item.title || '无标题',
    cover: item.cover_image,
    summary: summary,
    author: item.author || `用户${item.user_id || '未知'}`,
    date: item.create_time || item.update_time || new Date().toISOString(),
    views: item.view_count || 0,
    likes: item.like_count || 0,
    collects: item.collection_count || item.comment_count || 0,
    // 保留原始数据用于调试
    _raw: item,
  }
}

/**
 * 获取每日推荐文章
 * @param {Object} params - 请求参数
 * @param {number} params.page - 页码，默认为1
 * @param {number} params.pageSize - 每页大小，默认为10，最大50
 * @returns {Promise} 包含推荐文章列表和分页信息的Promise
 */
export const fetchArticles = async (params = {}) => {
  const { page = 1, pageSize = 10, ...restParams } = params

  // 构建查询字符串
  const queryString = new URLSearchParams({
    page,
    pageSize,
    ...restParams,
  }).toString()

  const res = await publicRequest('GET', `/recommend/daily?${queryString}`)

  // 转换响应数据格式
  return {
    list: (res.data.articles || []).map(transformArticleData),
    total: res.data.total || 0,
    pageSize: res.data.pageSize || 10,
    page: res.data.page || 1,
  }
}

// 获取热门标签
export const getHotTags_get = async () => {
  const res = await publicRequest('GET', '/tag/hot')
  return res.data
}

// 获取关注作者的最新文章
export const getFollowedAuthorsArticles_get = async () => {
  const res = await privateRequest('GET', '/article/following')
  return { data: res.data.map(transformArticleData) }
}

// 按分类获取文章
export const getArticlesByCategory_get = async (categoryId) => {
  const res = await publicRequest('GET', `/article/category/${categoryId}`)
  return { data: res.data.map(transformArticleData) }
}

// 按标签获取文章
export const getArticlesByTag_get = async (tagId) => {
  const res = await publicRequest('GET', `/article/tag/${tagId}`)
  return { data: res.data.map(transformArticleData) }
}

// 获取最新文章
export const getLatestArticles_get = async (page = 1, pageSize = 10) => {
  const res = await publicRequest('GET', `/article/latest?page=${page}&pageSize=${pageSize}`)
  return {
    data: res.data.articles.map(transformArticleData),
    total: res.data.total,
    currentPage: page,
  }
}

// 获取热门文章
export const getHotArticles_get = async (page = 1, pageSize = 10) => {
  const res = await publicRequest('GET', `/tag/hot?page=${page}&pageSize=${pageSize}`)
  return {
    data: res.data.articles.map(transformArticleData),
    total: res.data.total,
    currentPage: page,
  }
}

// 获取文章统计信息
export const getArticleStats_get = async () => {
  const res = await publicRequest('GET', '/article/stats')
  return res.data
}

// 获取用户文章推荐
export const getUserRecommendations_get = async (page = 1, pageSize = 10) => {
  const res = await privateRequest('GET', `/recommend/daily?page=${page}&pageSize=${pageSize}`)
  return {
    data: res.data.articles.map(transformArticleData),
    total: res.data.total,
    currentPage: page,
  }
}

// 获取分类
export const getCategories_get = async () => {
  const res = await publicRequest('GET', '/article/categories')
  return res.data
}

// 搜索文章
export const searchArticles = async (keyword) => {
  const res = await publicRequest('GET', '/article/search', { params: { keyword } })
  return { data: res.data.map(transformArticleData) }
}

// 获取热门搜索关键词
export const getHotSearchKeywords_get = async () => {
  const res = await publicRequest('GET', '/search/hot')
  return res.data
}

export const searchContent = async (data) => {
  const res = await publicRequest('POST', '/search/content', data);
  return res.data;
};
