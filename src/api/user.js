import sha256 from "crypto-js/sha256";
import { publicRequest, privateRequest, formRequest } from "./http";

// 密码加密处理
const encryptPassword = (password) => sha256(password).toString();

// 封装验证函数
const validateField = (value, alertMsg) => {
  if (!value) alert(alertMsg);
  return !!value;
};

// 导出API
export const register_post = (
  username,
  email,
  password,
  captchaCode,
  captchaId,
) => {
  if (
    !validateField(username, "请输入用户名") ||
    !validateField(email, "请输入邮箱") ||
    !validateField(password, "请输入密码") ||
    !validateField(captchaCode, "请输入验证码") ||
    !validateField(captchaId, "验证码ID不能为空")
  )
    return;

  return formRequest("POST", "/user/register", {
    username,
    email,
    password: encryptPassword(password),
    captchaCode,
    captchaId,
  });
};

export const login_post = (identifier, password) => {
  if (
    !validateField(identifier, "请输入用户名或邮箱") ||
    !validateField(password, "请输入密码")
  )
    return;

  return formRequest("POST", "/user/login", {
    identifier,
    password: encryptPassword(password),
  });
};

export const deleteAccount_post = (password) => {
  if (!validateField(password, "请输入密码")) return;
  return formRequest(
    "POST",
    "/user/deleteAcc",
    {
      password: encryptPassword(password),
    },
    true,
  );
};

export const getUserInfo_get = () => privateRequest("GET", "/user/userinfo");

export const getUserById_get = async (userId) => {
  return privateRequest("GET", `/user/${userId}`);
};

export const updateAvatar_patch = (avatarUrl) =>
  formRequest("PATCH", "/user/updateAvatar", { url: avatarUrl }, true);

export const updateBackground_patch = (backgroundUrl) =>
  formRequest("PATCH", "/user/updateBackground", { url: backgroundUrl }, true);

export const updateUserInfo_put = (nickname, signature) =>
  formRequest("PUT", "/user/update", { nickname, signature }, true);

export const sendResetEmail_post = (email) =>
  publicRequest("POST", "/user/sendResetEmail", { email });

export const validateToken_post = () =>
  privateRequest("POST", "/user/validateToken");

export const resetPassword_post = (email, token, password) =>
  publicRequest("POST", "/user/resetPassword", {
    email,
    token,
    password: encryptPassword(password),
  });

export const getOssUrl_get = (type) => {
  if (!["avatar", "background", "article"].includes(type)) {
    throw new Error("不支持的上传类型");
  }
  return privateRequest("GET", "/user/oss/policy", { type });
};
