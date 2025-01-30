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

// 导出API
export const register_post = (username, email, password) => {
  if (!validateField(username, '请输入用户名') || 
      !validateField(email, '请输入邮箱') || 
      !validateField(password, '请输入密码')) return;
  return request('POST', '/user/register', {
    username,
    email,
    password: sha256(password).toString()
  });
};

export const login_post = (identifier,password) => {
  if (!validateField(identifier, '请输入用户名或邮箱') || 
      !validateField(password, '请入密码')) return;
  return request('POST', '/user/login', {
    identifier,
    password: sha256(password).toString()
  });
};

export const deleteAcc_delete = (token, password) => {
  if (!validateField(password, '请输入密码')) return;
  return request('POST', '/user/deleteAcc', {
    password: sha256(password).toString()
  }, token);
};

export const getUserInfo_get = (token) => 
  request('GET', '/user/userinfo',{}, token);

const updateMedia = (endpoint, token, url) =>
  request('PATCH', endpoint, { url }, token);

export const updateAvatar_patch = (token, avatarUrl) => 
  request('PATCH', '/user/updateAvatar', { url: avatarUrl }, token);

export const updateBackground_patch = (token, background) =>
  updateMedia('/user/updateBackground', token, background);

export const updateUserInfo_put = (token, nickname, signature) =>
  request('PUT', '/user/update', { nickname, signature }, token);

//发送重置密码邮件
export const sendResetEmail_post = email => 
  request('POST', '/user/sendResetEmail', { email });

export const validateToken_post = (token) => 
  request('POST', '/user/validateToken', {}, token)

//获取OSS请求策略
export const getOssPolicy_get = (token) => 
  request('GET', '/user/oss/policy', {}, token);

