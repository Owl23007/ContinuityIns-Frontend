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

// 获取我的文章列表
export const getMyArticles_get = async () => {
  const res = await privateRequest('GET', '/article/profile');
  return { data: res.data.map(transformArticleData) };
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
  const data = {
    title: articleData.title,
    content: articleData.content,
    coverImage: articleData.coverImg,
    status: articleData.status
  };
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