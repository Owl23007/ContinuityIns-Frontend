// src/utils/request.js
import axios from 'axios';
import store from '../store';
import router from '../router';

// 创建 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // 从环境变量中读取 URL
  timeout: 3000
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    if (store.state.token) {
      // 让每个请求携带 token
      config.headers['Authorization'] = `Duel ${store.state.token}`;
    }
    return config;
  },
  error => {
    // 对请求错误做些什么
    console.error(error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做些什么
    const res = response.data;
    if (res.code !== 20000) {
      // 如��响应码不是 20000，则认有错误
      console.error(res.message || 'Error');
      // 可以根据具体情况进行处理，比如显示错误提示
      return Promise.reject(new Error(res.message || 'Error'));
    } else {
      return res;
    }
  },
  error => {
    // 对响应错误做些什么
    console.error('err' + error);
    if (error.response && error.response.status === 401) {
      // 如果响应状态码是 401，表示未授权或 token 过期
      store.dispatch('logout');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default service;