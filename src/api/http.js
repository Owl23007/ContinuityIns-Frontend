import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const baseURL = import.meta.env.VITE_APP_BASE_API;

// 创建axios实例
const service = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 无需token的请求
export const publicRequest = async (method, url, data = {}) => {
  try {
    const config = {
      method,
      url,
      ...(method.toUpperCase() === 'GET' ? { params: data } : { data })
    };
    
    const response = await service(config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 需要token的请求
export const privateRequest = async (method, url, data = {}) => {
  const authStore = useAuthStore();
  if (!authStore.token) {
    throw new Error('未登录或登录已过期');
  }

  try {
    const config = {
      method,
      url,
      headers: {
        Authorization: `Duel ${authStore.token}`
      },
      ...(method.toUpperCase() === 'GET' ? { params: data } : { data })
    };
    
    const response = await service(config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 表单数据请求
export const formRequest = async (method, url, data = {}, needToken = false) => {
  try {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    if (needToken) {
      const authStore = useAuthStore();
      if (!authStore.token) {
        throw new Error('未登录或登录已过期');
      }
      headers.Authorization = `Duel ${authStore.token}`;
    }

    const config = {
      method,
      url,
      headers,
      data: new URLSearchParams(data)
    };
    
    const response = await service(config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// 错误处理函数
function handleError(error) {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        const authStore = useAuthStore();
        authStore.clearAuth();
        window.location.href = '/auth';
        break;
      case 403:
        throw new Error('没有权限访问该资源');
      case 404:
        throw new Error('请求的资源不存在');
      default:
        throw new Error(error.response.data?.message || '请求失败');
    }
  }
  throw error;
}

export default service;
