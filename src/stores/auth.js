import { defineStore } from 'pinia'
import {
  login_post,
  register_post,
  sendResetEmail_post,
  validateToken_post,
  getUserInfo_get,
  updateUserInfo_put,
  updateAvatar_patch,
  updateBackground_patch,
  deleteAccount_post,
} from '@/api/user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null'),
    rememberMe: localStorage.getItem('rememberMe') === 'true',
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
    userAvatar: (state) => {
      const avatarUrl = state.user?.avatarImage || '/default-avatar.png'
      // 如果是相对路径，直接返回
      if (avatarUrl.startsWith('/')) return avatarUrl
      // 强制使用 http 协议
      return avatarUrl.replace(/^(http|https):\/\//, 'http://')
    },
  },

  actions: {
    clearAuth() {
      // 清理token和用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')

      // 清理rememberMe状态
      this.token = null
      this.user = null
      this.rememberMe = false
    },

    setToken({ token, rememberMe }) {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')

      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('token', token)
      storage.setItem('rememberMe', rememberMe)

      this.token = token
      this.rememberMe = rememberMe

      const oppositeStorage = rememberMe ? sessionStorage : localStorage
      oppositeStorage.removeItem('token')
      oppositeStorage.removeItem('user')
    },

    // 添加处理URL的辅助函数
    _processUrl(url) {
      if (!url) return url
      if (url.startsWith('/')) return url
      // 强制使用 http 协议
      return url.replace(/^(http|https):\/\//, 'http://')
    },

    setUser(user) {
      // 处理用户头像和背景图片的URL
      if (user) {
        if (user.avatarImage) {
          user.avatarImage = this._processUrl(user.avatarImage)
        }
        if (user.backgroundImage) {
          user.backgroundImage = this._processUrl(user.backgroundImage)
        }
      }
      this.user = user
      const storage = this.rememberMe ? localStorage : sessionStorage
      storage.setItem('user', JSON.stringify(user))
    },

    async updateUserProfile({ nickname, signature, avatarImage, backgroundImage }) {
      if (!this.token) throw new Error('未登录')

      if (avatarImage) {
        // 处理头像URL
        avatarImage = this._processUrl(avatarImage)
        return this.updateAvatar(avatarImage)
      }

      if (backgroundImage) {
        // 处理背景图片URL
        backgroundImage = this._processUrl(backgroundImage)
        return this.updateBackground(backgroundImage)
      }

      //   更新用户信息
      try {
        const res = await updateUserInfo_put(nickname, signature)
        if (res.code === 0) {
          //  更新用户数据，使用新的昵称和签名
          this.setUser({ ...this.user, nickname, signature })
          return true
        }
        throw new Error(res.message || '更新失败')
      } catch (error) {
        throw new Error(error.message || '更新请求失败')
      }
    },

    async updateAvatar(avatarUrl) {
      if (!this.token) throw new Error('未登录')
      try {
        const res = await updateAvatar_patch(avatarUrl)
        if (res.code === 0) {
          // 更新用户数据，使用新的头像
          this.setUser({ ...this.user, avatar: avatarUrl })
          return true
        }
        throw new Error(res.message || '更新头像失败')
      } catch (error) {
        throw new Error(error.message || '更新头像请求失败')
      }
    },

    async updateBackground(backgroundUrl) {
      if (!this.token) throw new Error('未登录')
      try {
        const res = await updateBackground_patch(backgroundUrl)
        if (res.code === 0) {
          this.setUser({ ...this.user, backgroundImage: backgroundUrl })
          return true
        }
        throw new Error(res.message || '更新背景失败')
      } catch (error) {
        throw new Error(error.message || '更新背景请求失败')
      }
    },

    async login({ identifier, password, rememberMe }) {
      try {
        const res = await login_post(identifier, password)
        if (res.code !== 0) {
          throw new Error(res.message || '登录失败：未知错误')
        }

        this.setToken({
          token: res.data,
          rememberMe,
        })

        try {
          await this.fetchUserInfo()
        } catch (fetchError) {
          this.clearAuth()
          throw new Error('获取用户信息失败: ' + fetchError.message)
        }
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },

    async register({ username, email, password, captchaCode, captchaId }) {
      try {
        const res = await register_post(username, email, password, captchaCode, captchaId)
        if (res.code === 0) return true
        throw new Error(res.message || '注册失败：服务器未返回成功状态')
      } catch (error) {
        throw new Error(error.message || '注册请求失败')
      }
    },

    async fetchUserInfo() {
      if (!this.token) return null
      try {
        const res = await getUserInfo_get()
        if (res.code === 0) {
          this.setUser(res.data)
          return res.data
        }
        throw new Error(res.message || '获取用户信息失败')
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },

    async sendResetEmail(email) {
      try {
        const res = await sendResetEmail_post(email)
        if (res.code === 0) return true
        throw new Error(res.message || '发送失败')
      } catch (error) {
        throw new Error(error.message || '邮件发送请求失败')
      }
    },

    async deleteAccount(password) {
      if (!this.token) throw new Error('未登录')
      try {
        const res = await deleteAccount_post(this.token, password)
        if (res.code === 0) {
          this.clearAuth()
          return true
        }
        throw new Error(res.message || '账户注销失败')
      } catch (error) {
        throw new Error(error.message || '账户注销请求失败')
      }
    },

    logout() {
      this.clearAuth()
    },

    async initializeAuth() {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const rememberMe = localStorage.getItem('rememberMe') === 'true'

      if (token) {
        try {
          // 设置token状态
          this.setToken({ token, rememberMe })

          // 验证token有效性
          const validationResult = await validateToken_post()
          if (validationResult.code !== 0) {
            throw new Error('Token validation failed')
          }

          // 获取用户信息
          await this.fetchUserInfo()
          return true
        } catch (error) {
          console.error('Auth initialization failed:', error.message)
          this.clearAuth()
          return false
        }
      }
      return false
    },
  },
})
