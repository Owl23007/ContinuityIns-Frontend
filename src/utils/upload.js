import { uploadFile as apiUploadFile } from '@/api/file';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

/**
 * Validate file before upload
 * @param {File} file - The file to validate
 * @param {string} type - The type of upload ('avatar' or 'background')
 */
export function validateFile(file, type) {
  // Check file type
  if (!file.type.match(/^image\/(jpeg|png)$/)) {
    throw new Error('只支持 JPG 和 PNG 格式的图片');
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('文件大小不能超过 5MB');
  }

  // Additional checks for specific types
  if (type === 'background') {
    // Background images should be at least 1280x720
    const img = new Image();
    img.src = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width < 1280 || img.height < 720) {
          reject(new Error('背景图片尺寸至少需要 1280x720'));
        }
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('图片加载失败，请重试'));
      };
    });
  }
}

/**
 * Upload a file to the server
 * @param {File} file - The file to upload
 * @param {string} type - The type of upload ('avatar' or 'background')
 * @param {string} token - The authentication token
 * @returns {Promise<string>} The URL of the uploaded file
 * @throws {Error} If upload fails or validation fails 
 */
export async function uploadFile(file, type, token) {
  if (!file) {
    throw new Error('文件不能为空');
  }

  if (!type) {
    throw new Error('上传类型不能为空');
  }

  if (!token) {
    throw new Error('未登录或登录已过期');
  }
  
  try {
    // Validate file before upload
    await validateFile(file, type);
    
    // Upload file using API layer which handles OSS policy and signature
    const url = await apiUploadFile(file, type, token);
    return url;
  } catch (error) {
    console.error('上传失败:', error);
    throw error;
  }
}

/**
 * Download an image from URL and upload it to the server
 * @param {string} imageUrl - The URL of the image to download
 * @param {string} type - The type of upload ('avatar' or 'background')
 * @param {string} token - The authentication token
 * @returns {Promise<string>} The URL of the uploaded file on the server
 * @throws {Error} If download or upload fails
 */
export async function downloadAndUploadImage(imageUrl, type, token) {
  if (!imageUrl) {
    throw new Error('图片URL不能为空');
  }

  if (!type) {
    throw new Error('上传类型不能为空');
  }

  if (!token) {
    throw new Error('未登录或登录已过期');
  }
  
  try {
    // Fetch the image
    const response = await fetch(imageUrl, {
      mode: 'cors',
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      throw new Error(`无法下载图片: ${response.status} ${response.statusText}`);
    }
    
    // Get content type
    const contentType = response.headers.get('content-type') || 'image/png';
    if (!contentType.startsWith('image/')) {
      throw new Error('下载的内容不是图片');
    }
    
    // Convert to blob
    const blob = await response.blob();
    
    // Create file from blob
    const fileName = imageUrl.split('/').pop() || 'downloaded-image.png';
    const file = new File([blob], fileName, { type: contentType });
    
    // Upload the file using existing utility
    return await uploadFile(file, type, token);
  } catch (error) {
    console.error('下载并上传图片失败:', error);
    throw new Error(`处理图片失败: ${error.message || '未知错误'}`);
  }
}