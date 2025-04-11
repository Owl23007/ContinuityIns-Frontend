import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从存储中获取token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Duel ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response?.status === 401) {
      // token过期或无效，清除本地存储并重定向到登录页
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

// 封装GET请求
export const publicRequest = (method, url, data = null) => {
  const config = {
    method,
    url,
    [method.toLowerCase() === 'get' ? 'params' : 'data']: data
  }
  return service(config)
}

// 封装需要token的请求
export const privateRequest = (method, url, data = null) => {
  const config = {
    method,
    url,
    [method.toLowerCase() === 'get' ? 'params' : 'data']: data
  }
  return service(config)
}

// 封装表单请求
export const formRequest = (method, url, data = null, requiresAuth = false) => {
  const config = {
    method,
    url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    [method.toLowerCase() === 'get' ? 'params' : 'data']: new URLSearchParams(data)
  }

  if (requiresAuth) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Duel ${token}`
    }
  }

  return service(config)
}

export default service
