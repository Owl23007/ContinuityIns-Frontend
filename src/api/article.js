import axios from 'axios';


export const addCategory_post = async (token, categoryName, categoryAlias) => {
  if (categoryName === '' || categoryAlias === '') {
    alert("请填写完整信息");
    return;
  }
  const response = await axios.post(`${process.env.VUE_APP_BASE_API}/category/add`,
    { categoryName, categoryAlias }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Duel ${token}`
    }
  });
  return response.data;
};

export const getCategory_get = async (token, categoryId) => {
  const response = await axios.get(`${process.env.VUE_APP_BASE_API}/category/getCategoryById`, {
    params: { categoryId },
    headers: { Authorization: `Duel ${token}` }
  });
  return response.data;
};

export const addArticle_post = async (token, title, content, coverImg, state, categoryId) => {
  if (title === '' || content === '' || coverImg === '') {
    alert("请填写完整信息");
    return false;
  }
  const response = await axios.post(`${process.env.VUE_APP_BASE_API}/article/add`,
    { title, content, coverImg, state, categoryId }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Duel ${token}`
    }
  });
  return response.data;
};

export const getArticleByID_get = async (token, articleId) => {
  const response = await axios.get(`${process.env.VUE_APP_BASE_API}/article/article`, {
    params: { articleId },
    headers: { Authorization: `Duel ${token}` }
  });
  return response.data;
};

export const deleteArticle_delete = async (token, articleId) => {
  const response = await axios.delete(`${process.env.VUE_APP_BASE_API}/article/delete`, {
    params: { articleId },
    headers: { Authorization: `Duel ${token}` }
  });
  return response.data;
};

export const getArticles_get = async (token, pageNum, pageSize) => {
  const response = await axios.get(`${process.env.VUE_APP_BASE_API}/article/list`, {
    params: { pageNum, pageSize },
    headers: { Authorization: `Duel ${token}` }
  });
  return response.data;
};

export const getUserArticles_get = async (token) => {
  const response = await axios.get(`${process.env.VUE_APP_BASE_API}/article/userArticle`, {
    headers: { Authorization: `Duel ${token}` }
  });
  return response.data;
};

export const getDailyRecommendations_get = async () => {
  const response = await axios.get('http://localhost:8081/article/daily', { headers: { "Content-Type": "application/json" } });
  console.log(response.data.data);
  return response.data.data;
  
};