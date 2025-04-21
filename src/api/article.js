import { publicRequest, privateRequest } from "./http";

const transformArticleData = (article) => ({
  id: article.articleId,
  title: article.title,
  content: article.content,
  coverImg: article.coverImage,
  status: article.status,
  createTime: article.createTime,
  duration: article.duration,
  createUser: {
    id: article.userId,
  },
});

// 获取我的主页文章列表
export const getMyArticles_get = async () => {
  const res = await privateRequest("GET", "/article/profile");
  return { data: res.data.map(transformArticleData) };
};

// 获取我的全部文章列表
export const getMyArticlesList_get = async (page) => {
  const res = await privateRequest("GET", `/article/my?page=${page}`);
  // 修正：从 res.data.articles 获取数组
  const articles = res.data?.articles || [];
  return { data: articles.map(transformArticleData) };
};

// 获取用户的文章列表
export const getUserArticles_get = async (userId) => {
  const res = await privateRequest("GET", `/article/user/${userId}`);
  return { data: res.data.map(transformArticleData) };
};

// 获取文章详情
export const getArticleById_get = async (id) => {
  const res = await privateRequest("GET", `/article/${id}`);
  return { data: transformArticleData(res.data) };
};

// 创建文章
export const createArticle_post = async (articleData) => {
  // 适配后端字段，coverImg => coverImage, userId 由后端自动获取
  const data = {
    title: articleData.title,
    content: articleData.content,
    coverImage: articleData.coverImg,
    status: articleData.status,
  };
  // 过滤掉 undefined/null/空字符串字段，避免负载为 {}
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined || data[key] === null || data[key] === "") {
      delete data[key];
    }
  });
  const res = await privateRequest("POST", "/article/create", data);
  return { data: transformArticleData(res.data) };
};

// 更新文章
export const updateArticle_put = async (articleId, updates) => {
  const data = {
    title: updates.title,
    content: updates.content,
    coverImage: updates.coverImg,
    status: updates.status,
  };
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined || data[key] === null || data[key] === "") {
      delete data[key];
    }
  });
  const res = await privateRequest("PUT", `/article/${articleId}`, data);
  return { data: transformArticleData(res.data) };
};

// 更新文章状态
export const updateArticleStatus_put = async (articleId, status) => {
  const res = await privateRequest("PUT", `/article/${articleId}/status`, {
    status,
  });
  return { data: transformArticleData(res.data) };
};

// 删除文章
export const deleteArticle_delete = async (articleId) => {
  return privateRequest("DELETE", `/article/${articleId}`);
};
