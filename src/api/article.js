import axios from 'axios';
import { ArticleStatus } from '../pojo/article';
const baseURL = import.meta.env.VITE_APP_BASE_API;

// 获取每日推荐
export const getDailyRecommendations_get = async () => {
  const response = await axios.get(`${baseURL}/article/daily`, { 
    headers: { "Content-Type": "application/json" } 
  });
  return response.data.data;
};

// 上传文章
export const uploadArticle_post = async (token, title, content, coverImg, status) => {
  const response = await axios.post(`${baseURL}/article/create`, 
    { 
      title, 
      content, 
      coverImg, 
      status: status.toUpperCase() 
    }, 
    {
      headers: {
        Authorization: `Duel ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// 获取文章列表
export const getArticleList_get = async (page = 1, size = 10, category = '') => {
  const response = await axios.get(`${baseURL}/article/list`, {
    params: { page, size, category },
    headers: { "Content-Type": "application/json" }
  });
  return response.data.data;
};

// 获取文章详情
export const getArticleDetail_get = async (id) => {
  const response = await axios.get(`${baseURL}/article/${id}`, {
    headers: { "Content-Type": "application/json" }
  });
  return response.data.data;
};

// 更新文章
export const updateArticle_put = async (token, id, updates) => {
  const response = await axios.put(`${baseURL}/article/${id}`, 
    updates,
    {
      headers: {
        Authorization: `Duel ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// 删除文章
export const deleteArticle_delete = async (token, id) => {
  const response = await axios.delete(`${baseURL}/article/${id}`, {
    headers: {
      Authorization: `Duel ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

// 获取用户的文章列表
export const getUserArticles_get = async (token, status = '') => {
  const response = await axios.get(`${baseURL}/article/user`, {
    params: { status },
    headers: {
      Authorization: `Duel ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.data;
};