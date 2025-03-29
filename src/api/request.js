import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const baseURL = import.meta.env.VITE_APP_BASE_API;

// Create axios instance
const instance = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  validateStatus: status => status < 500 // Only reject if status >= 500
});

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add headers if content type is not set and not FormData
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Duel ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(new Error('请求配置错误'));
  }
);

// Add response interceptor
instance.interceptors.response.use(
  (response) => {
    // Check if the response indicates token expiry or unauthorized
    if (response.data?.code === 401) {
      const authStore = useAuthStore();
      authStore.clearAuth();
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }
    return response.data;
  },
  (error) => {
    if (!error.response) {
      // Network error
      return Promise.reject(new Error('网络连接失败，请检查网络后重试'));
    }
    
    if (error.response.status === 401) {
      const authStore = useAuthStore();
      authStore.clearAuth();
      return Promise.reject(new Error('未登录或登录已过期'));
    }

    if (error.response.status >= 500) {
      return Promise.reject(new Error('服务器错误，请稍后重试'));
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default instance;