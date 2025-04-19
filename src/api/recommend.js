import { publicRequest, privateRequest } from './http';

// 获取每日推荐
export const getDailyRecommendations_get = async () => {
  const res = await publicRequest('GET', '/article/daily');
  return { data: res.data.map(transformArticleData) };
};


// 获取热门标签
export const getHotTags_get = async () => {
    const res = await publicRequest('GET', '/article/tags/hot');
    return res.data;
  };
  
  // 获取关注作者的最新文章
  export const getFollowedAuthorsArticles_get = async () => {
    const res = await privateRequest('GET', '/article/following');
    return { data: res.data.map(transformArticleData) };
  };
  
  // 按分类获取文章
  export const getArticlesByCategory_get = async (categoryId) => {
    const res = await publicRequest('GET', `/article/category/${categoryId}`);
    return { data: res.data.map(transformArticleData) };
  };
  
  // 按标签获取文章
  export const getArticlesByTag_get = async (tagId) => {
    const res = await publicRequest('GET', `/article/tag/${tagId}`);
    return { data: res.data.map(transformArticleData) };
  };
  
  // 获取最新文章
  export const getLatestArticles_get = async (page = 1, pageSize = 10) => {
    const res = await publicRequest('GET', `/article/latest?page=${page}&pageSize=${pageSize}`);
    return { 
      data: res.data.articles.map(transformArticleData),
      total: res.data.total,
      currentPage: page
    };
  };
  
  // 获取热门文章
  export const getHotArticles_get = async (page = 1, pageSize = 10) => {
    const res = await publicRequest('GET', `/article/hot?page=${page}&pageSize=${pageSize}`);
    return { 
      data: res.data.articles.map(transformArticleData),
      total: res.data.total,
      currentPage: page
    };
  };
  
  // 获取文章统计信息
  export const getArticleStats_get = async () => {
    const res = await publicRequest('GET', '/article/stats');
    return res.data;
  };
  
  // 获取用户文章推荐
  export const getUserRecommendations_get = async (page = 1, pageSize = 10) => {
    const res = await privateRequest('GET', `/recommend/daily?page=${page}&pageSize=${pageSize}`);
    return { 
      data: res.data.articles.map(transformArticleData),
      total: res.data.total,
      currentPage: page
    };
  };
  
  // 获取分类
  export const getCategories_get = async () => {
    const res = await publicRequest('GET', '/article/categories');
    return res.data;  
  };