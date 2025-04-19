import { publicRequest, privateRequest } from './http';

const transformArticleData = (article) => ({
  id: article.articleId,
  title: article.title,
  content: article.content,
  coverImg: article.coverImage,
  status: article.status,
  createTime: article.createTime,
  duration: article.duration,
  createUser: {
    id: article.userId
  }
});

// 获取每日推荐
export const getDailyRecommendations_get = async () => {
  const res = await publicRequest('GET', '/article/daily');
  return { data: res.data.map(transformArticleData) };
};

// 获取我的主页文章列表
export const getMyArticles_get = async () => {
  const res = await privateRequest('GET', '/article/profile');
  return { data: res.data.map(transformArticleData) };
};

// 获取我的全部文章列表
export const getMyArticlesList_get = async (page) => {
  const res = await privateRequest('GET', `/article/my?page=${page}`);
  // 修正：从 res.data.articles 获取数组
  const articles = res.data?.articles || [];
  return { data: articles.map(transformArticleData) };
};

// 获取用户的文章列表
export const getUserArticles_get = async (userId) => {
  const res = await privateRequest('GET', `/article/user/${userId}`);
  return { data: res.data.map(transformArticleData) };
};

// 获取文章详情
export const getArticleById_get = async (id) => {
  const res = await privateRequest('GET', `/article/${id}`);
  return { data: transformArticleData(res.data) };
};

// 创建文章
export const createArticle_post = async (articleData) => {
  // 适配后端字段，coverImg => coverImage, userId 由后端自动获取
  const data = {
    title: articleData.title,
    content: articleData.content,
    coverImage: articleData.coverImg,
    status: articleData.status
  };
  // 过滤掉 undefined/null/空字符串字段，避免负载为 {}
  Object.keys(data).forEach(key => {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      delete data[key];
    }
  });
  const res = await privateRequest('POST', '/article/create', data);
  return { data: transformArticleData(res.data) };
};

// 更新文章
export const updateArticle_put = async (articleId, updates) => {
  const data = {
    title: updates.title,
    content: updates.content,
    coverImage: updates.coverImg,
    status: updates.status
  };
  Object.keys(data).forEach(key => {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      delete data[key];
    }
  });
  const res = await privateRequest('PUT', `/article/${articleId}`, data);
  return { data: transformArticleData(res.data) };
};

// 更新文章状态
export const updateArticleStatus_put = async (articleId, status) => {
  const res = await privateRequest('PUT', `/article/${articleId}/status`, { status });
  return { data: transformArticleData(res.data) };
};

// 删除文章
export const deleteArticle_delete = async (articleId) => {
  return privateRequest('DELETE', `/article/${articleId}`);
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
  const res = await privateRequest('GET', `/article/recommend?page=${page}&pageSize=${pageSize}`);
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
  