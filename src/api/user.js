import axios from 'axios';
import sha256 from 'crypto-js/sha256';

// 从.env文件中获取VITE_APP_BASE_API的值
const baseURL = import.meta.env.VITE_APP_BASE_API;
const commonHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };

// 封装请求函数
const request = async (method, endpoint, data = {}, token) => {
  const headers = token ? { ...commonHeaders, Authorization: `Duel ${token}` } : commonHeaders;
  const response = await axios({
    method,
    url: `${baseURL}${endpoint}`,
    data: new URLSearchParams(data),
    headers,
    params: method === 'GET' ? data : undefined
  });
  return response.data;
};

// 封装验证函数
const validateField = (value, alertMsg) => {
  if (!value) alert(alertMsg);
  return !!value;
};

// 密码加密处理
const encryptPassword = (password) => sha256(password).toString();

// 导出API
export const register_post = (username, email, password) => {
  if (!validateField(username, '请输入用户名') ||
    !validateField(email, '请输入邮箱') ||
    !validateField(password, '请输入密码')) return;
  return request('POST', '/user/register', {
    username,
    email,
    password: encryptPassword(password)
  });
};

export const login_post = (identifier, password) => {
  if (!validateField(identifier, '请输入用户名或邮箱') ||
    !validateField(password, '请输入密码')) return;
  return request('POST', '/user/login', {
    identifier,
    password: encryptPassword(password)
  });
};

export const deleteAccount_post = (token, password) => {
  if (!validateField(password, '请输入密码')) return;
  return request('POST', '/user/deleteAcc', {
    password: encryptPassword(password)
  }, token);
};

export const getUserInfo_get = (token) =>
  request('GET', '/user/userinfo', {}, token);

export const getUserById_get = (token, userId) =>
  request('GET', `/user/${userId}`, {}, token);

const updateMedia = (endpoint, token, url) =>
  request('PATCH', endpoint, { url }, token);

export const updateAvatar_patch = (token, avatarUrl) =>
  request('PATCH', '/user/updateAvatar', { url: avatarUrl }, token);

export const updateBackground_patch = (token, backgroundUrl) =>
  request('PATCH', '/user/updateBackground', { url: backgroundUrl }, token);

export const updateUserInfo_put = (token, nickname, signature) =>
  request('PUT', '/user/update', { nickname, signature }, token);

//发送重置密码邮件
export const sendResetEmail_post = email =>
  request('POST', '/user/sendResetEmail', { email });

export const validateToken_post = async (token) => {
  try {
    const res = await request('POST', '/user/validateToken', { token }, token);
    return res.code === 0;
  } catch (error) {
    // 验证失败时主动清理存储
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    throw error;
  }
};

//重置密码
export const resetPassword_post = (email, token, password) =>
  request('POST', '/user/resetPassword', { 
    email, 
    token, 
    password: encryptPassword(password)
  });

//修改密码    
//获取OSS直链
export const getOssUrl_get = (type, token) => {
  if (!['avatar', 'background', 'article'].includes(type)) {
    throw new Error('不支持的上传类型');
  }
  return request('GET', '/user/oss/policy', { type }, token);
};
