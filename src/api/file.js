import request from './request';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { useAuthStore } from '@/stores/auth.js';

// Create OSS upload instance with same base config
const createOssInstance = (endpoint) => {
  return axios.create({
    baseURL: endpoint.startsWith('http') ? endpoint : `https://${endpoint}`,
    timeout: 60000, // Increase timeout for file uploads
    withCredentials: false, // Set to false for OSS uploads
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });
};

export const getOssPolicy = async (type, token) => {
  if (!type) {
    throw new Error('上传类型不能为空');
  }
  if (!token) {
    throw new Error('未登录或登录已过期');
  }

  try {
    const response = await request.get(`/user/oss/policy`, {
      params: { type },
      headers: {
        Authorization: `Duel ${token}`
      }
    });
    
    // Validate the response data
    if (response.code === 0 && response.data) {
      // Verify required fields are present
      const { accessKeyId, accessKeySecret, securityToken, endPoint, bucketName, path } = response.data;
      
      if (!accessKeyId || !accessKeySecret || !securityToken || !endPoint || !bucketName) {
        throw new Error('OSS策略数据不完整');
      }
      
      return response.data;
    }
    throw new Error(response.message || '获取上传凭证失败');
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('未登录或登录已过期');
    }
    if (!error.response) {
      throw new Error('网络连接失败，请检查网络后重试');
    }
    throw new Error(error.message || '获取上传策略失败');
  }
};

// 生成OSS所需的Policy
const generatePolicy = (expiration) => {
  const policyObj = {
    expiration: expiration, // ISO 格式的过期时间
    conditions: [
      ['content-length-range', 0, 10485760] // 10MB 最大限制
    ]
  };
  return btoa(JSON.stringify(policyObj));
};

// 生成签名
const generateSignature = (policy, accessKeySecret) => {
  return CryptoJS.HmacSHA1(policy, accessKeySecret).toString(CryptoJS.enc.Base64);
};

export const uploadFile = async (file, type, token) => {
  if (!file) throw new Error('文件不能为空');
  if (!type) throw new Error('上传类型不能为空');
  if (!token) throw new Error('未登录或登录已过期');

  try {
    // 获取OSS上传策略
    const ossPolicy = await getOssPolicy(type, token);
    

    const authStore = useAuthStore();
    const userid = authStore.user.userId;
    const fileName = `${userid}-${type}`;
    const key = `${ossPolicy.path}/${fileName}`;

    // 创建OSS专用实例
    const endpoint = `https://${ossPolicy.bucketName}.${ossPolicy.endPoint}`;
    const ossClient = createOssInstance(endpoint);

    // 从后端获取的STS凭证
    const { accessKeyId, accessKeySecret, securityToken, expiration } = ossPolicy;

    // 生成策略和签名
    const policy = generatePolicy(expiration);
    const signature = generateSignature(policy, accessKeySecret);

    // 构建表单数据
    const formData = new FormData();
    formData.append('key', key);
    formData.append('OSSAccessKeyId', accessKeyId);
    formData.append('policy', policy);
    formData.append('signature', signature);
    formData.append('success_action_status', '200');

    // 如果有STS Token，添加到请求中
    if (securityToken) {
      formData.append('x-oss-security-token', securityToken);
    }
    
    // 添加文件到最后
    formData.append('file', file);
    
    try {
      const uploadResponse = await ossClient.post('/', formData);
      
      if (uploadResponse.status === 200) {
        // 返回可访问地址
        // 使用自定义域名或者默认OSS域名构建完整URL
        const baseUrl = import.meta.env.VITE_OSS_CUSTOM_DOMAIN || `https://${ossPolicy.bucketName}.${ossPolicy.endPoint}`;
        return `${baseUrl}/${key}`;
      } else {
        throw new Error('上传失败: ' + uploadResponse.statusText);
      }
    } catch (uploadError) {
      console.error('OSS上传错误:', uploadError);
      if (!uploadError.response) {
        throw new Error('网络连接失败，请检查网络后重试');
      }
      throw new Error(uploadError.response?.data?.message || '文件上传失败');
    }
  } catch (error) {
    console.error('文件上传流程错误:', error);
    if (error.response?.status === 401) {
      throw new Error('未登录或登录已过期');
    }
    throw new Error(error.message || '上传失败');
  }
};
