import service from './http';
import { getOssUrl_get } from "@/api/user.js";
import { useAuthStore } from "@/stores/auth";

export function validateFile(file, type) {
  if (!file.type.match(/^image\/(jpeg|png)$/)) {
    throw new Error('只支持 JPG 和 PNG 格式的图片');
  }

  let maxSize;
  switch (type) {
    case 'avatar':
      maxSize = 2 * 1024 * 1024; 
      break;
    case 'background':
    case 'article':
      maxSize = 10 * 1024 * 1024;
      break;
    default:
      maxSize = 5 * 1024 * 1024;
  }

  if (file.size > maxSize) {
    const sizeMB = maxSize / (1024 * 1024);
    throw new Error(`文件大小不能超过 ${sizeMB}MB`);
  }
  return true;
}

export const uploadFile = async (file, type) => {
  const res = await getOssUrl_get(type);
  
  if (res.code !== 0) {
    throw new Error("获取OSS直链失败");
  }

  const ossUrl = res.data;
  const formData = new FormData();
  
  formData.append('OSSAccessKeyId', ossUrl.OSSAccessKeyId);
  formData.append('signature', ossUrl.signature);
  formData.append('policy', ossUrl.policy);
  formData.append('x-oss-security-token', ossUrl.securityToken);

  const userId = useAuthStore().user?.userId;
  let fileName;
  
  switch (type) {
    case 'avatar':
    case 'background':
      fileName = `${type}/${type}-${userId}`; 
      break;
    case 'article':
      fileName = `${type}/${type}-${userId}-${Date.now()}`;
      break;
    default:
      throw new Error('不支持的上传类型');
  }

  formData.append('key', fileName);
  formData.append('file', file);

  try {
    const headers = {
      'x-oss-security-token': ossUrl.securityToken
    };
    await service.post(ossUrl.host, formData, { headers });
    return {
      url: fileName,
      key: fileName
    };
  } catch (error) {
    throw new Error('上传文件失败: ' + error.message);
  }
};
