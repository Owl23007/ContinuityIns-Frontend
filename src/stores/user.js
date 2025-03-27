import { defineStore } from 'pinia'
import { getOssPolicy_get, deleteAccount_post } from '@/api/user'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', {
  actions: {
    async getOssPolicy() {
      const authStore = useAuthStore()
      if (!authStore.token) return null
      
      try {
        const res = await getOssPolicy_get(authStore.token)
        if (res.code === 0) return res.data
        throw new Error(res.message || '获取 OSS Policy 失败')
      } catch (error) {
        throw new Error(error.message || '获取 OSS Policy 请求失败')
      }
    },

    async deleteAccount(password) {
      const authStore = useAuthStore()
      if (!authStore.token) return null

      try {
        const res = await deleteAccount_post(authStore.token, password)
        if (res.code === 0) {
          authStore.clearAuth()
          return true
        }
        throw new Error(res.message || '删除账户失败')
      } catch (error) {
        throw new Error(error.message || '删除账户请求失败')
      }
    }
  }
})