import { publicRequest } from './http';
import service from './http';

// 获取图片验证码
export async function getCaptcha() {
  const response = await service({
    url: '/auth/captcha',
    method: 'get'
  });
  return response.data;
}

// 验证图片验证码
export function verifyCaptcha(code) {
  return publicRequest('POST', '/auth/verify-captcha', { code });
}
