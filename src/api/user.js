import axios from 'axios';
import sha256 from 'crypto-js/sha256';

export const register_post = async (username, email, password) => {
  if (username === '' || password === '' || email === '') {
    alert("请输入用户名、邮箱和密码。");
    return;
  }
  const encryptedPassword = sha256(password).toString();
  const response = await axios.post(`${import.meta.env.VITE_APP_BASE_API}/user/register`,
    { username, email, password: encryptedPassword }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const login_post = async (username, password) => {
  if (username === '' || password === '') {
    alert("请输入用户名或邮箱和密码。");
    return;
  }
  const encryptedPassword = sha256(password).toString();
  const response = await axios.post(`${import.meta.env.VITE_APP_BASE_API}/user/login`,
    { username, password: encryptedPassword }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const deleteAcc_delete = async (token, password) => {
  if (password === '') {
    alert("请输入密码。");
    return;
  }
  const encryptedPassword = sha256(password).toString();
  const response = await axios.post(`${import.meta.env.VITE_APP_BASE_API}/user/deleteAcc`,
    { password: encryptedPassword }, {
    headers: {
      Authorization: `Duel ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
};

export const getUserInfo_get = async (token, userId) => {
  const response = await axios.get(`${import.meta.env.VITE_APP_BASE_API}/user/userinfoById`, {
    params: { userId },
    headers: { Authorization: `Duel ${token}` }
  });
  return response.data;
};

export const updateAvatar_patch = async (token, avatar) => {
  const response = await axios.patch(`${import.meta.env.VITE_APP_BASE_API}/user/updateAvatar`,
    { url: avatar }, {
    headers: {
      Authorization: `Duel ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
};

export const updateBackground_patch = async (token, background) => {
  const response = await axios.patch(`${import.meta.env.VITE_APP_BASE_API}/user/updateBackground`,
    { url: background }, {
    headers: {
      Authorization: `Duel ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
};

export const updateUserInfo_put = async (token, nickname, signature) => {
  const response = await axios.put(`${import.meta.env.VITE_APP_BASE_API}/user/update`,
    { nickname, signature }, {
    headers: {
      Authorization: `Duel ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
};
