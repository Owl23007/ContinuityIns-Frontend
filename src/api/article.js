import axios from 'axios';
const baseURL = import.meta.env.VITE_APP_BASE_API;

export const getDailyRecommendations_get = async () => {
  //获取每日推荐
  const response = await axios.get(`${baseURL}/article/daily`, { headers: { "Content-Type": "application/json" } });
  return response.data.data;
};

export const uploadArticle_post = async (token, title, content, url , status) => {
  //上传文章
  const response = await axios.post(`${baseURL}/article/add`, { title, content, url, status }, {
    headers: {
      Authorization: `Duel ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}