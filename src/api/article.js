import axios from 'axios';
import { ArticleStatus } from '../pojo/article';
const baseURL = import.meta.env.VITE_APP_BASE_API;

// Transform API response to frontend model
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
  const response = await axios.get(`${baseURL}/article/daily`, { 
    headers: { "Content-Type": "application/json" } 
  });
  const articles = response.data.data.map(transformArticleData);
  return { data: articles };
};

// 获取我的文章列表
export const getMyArticles_get = async (token) => {
  const response = await axios.get(`${baseURL}/article/mine`, {
    headers: {
      Authorization: `Duel ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const articles = response.data.data.map(transformArticleData);
  return { data: articles };
};

// 获取用户的文章列表
export const getUserArticles_get = async (token, userId, status = '') => {
  let url = `${baseURL}/article/user/${userId}`;
  if (status) {
    url += `?status=${status}`;
  }
  const response = await axios.get(url, {
    headers: {
      Authorization: `Duel ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const articles = response.data.data.map(transformArticleData);
  return { data: articles };
};

// 获取文章详情
export const getArticleById_get = async (token, id) => {
  const response = await axios.get(`${baseURL}/article/${id}`, {
    headers: {
      Authorization: `Duel ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const article = transformArticleData(response.data.data);
  return { data: article };
};

// 创建文章
export const createArticle_post = async (token, articleData) => {
  const data = {
    title: articleData.title,
    content: articleData.content,
    coverImage: articleData.coverImg,
    status: articleData.status
  };
  
  const response = await axios.post(`${baseURL}/article/create`, 
    data,
    {
      headers: {
        Authorization: `Duel ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  const article = transformArticleData(response.data.data);
  return { data: article };
};

// 更新文章
export const updateArticle_put = async (token, articleId, updates) => {
  const data = {
    title: updates.title,
    content: updates.content,
    coverImage: updates.coverImg,
    status: updates.status
  };

  const response = await axios.put(`${baseURL}/article/${articleId}`, 
    data,
    {
      headers: {
        Authorization: `Duel ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  const article = transformArticleData(response.data.data);
  return { data: article };
};

// 更新文章状态
export const updateArticleStatus_put = async (token, articleId, status) => {
  const response = await axios.put(`${baseURL}/article/${articleId}/status`, 
    { status },
    {
      headers: {
        Authorization: `Duel ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  const article = transformArticleData(response.data.data);
  return { data: article };
};

// 删除文章
export const deleteArticle_delete = async (token, articleId) => {
  const response = await axios.delete(`${baseURL}/article/${articleId}`, {
    headers: {
      Authorization: `Duel ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};