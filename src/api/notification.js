import http from './http'

const baseUrl = '/notifications'

// 获取用户所有通知
export const getNotifications_get = (params) => {
  return http.get(`${baseUrl}`, { params })
}

// 标记通知为已读
export const markAsRead_put = (notificationId) => {
  return http.put(`${baseUrl}/${notificationId}/read`)
}

// 标记所有通知为已读
export const markAllAsRead_put = () => {
  return http.put(`${baseUrl}/read/all`)
}

// 删除通知
export const deleteNotification_delete = (notificationId) => {
  return http.delete(`${baseUrl}/${notificationId}`)
}

// 获取未读通知数量
export const getUnreadCount_get = () => {
  return http.get(`${baseUrl}/unread/count`)
}