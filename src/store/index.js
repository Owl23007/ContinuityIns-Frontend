// store/index.js
import { createStore } from 'vuex'
import {
  login_post,
  register_post,
  sendResetEmail_post,
  getUserInfo_get,
  validateToken_post,
  getOssPolicy_get
} from '@/api/user'

// 初始化状态
const initialState = () => ({
  token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null'),
  rememberMe: localStorage.getItem('rememberMe') === 'true'
})

export default createStore({
  state: initialState(),

  mutations: {
    SET_TOKEN(state, { token, rememberMe }) {
      // 清理所有旧 token
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')

      // 设置新存储
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('token', token)
      storage.setItem('rememberMe', rememberMe)

      // 更新状态
      state.token = token
      state.rememberMe = rememberMe

      // 清理相反存储的用户数据
      const oppositeStorage = rememberMe ? sessionStorage : localStorage
      oppositeStorage.removeItem('token')
      oppositeStorage.removeItem('user')
    },

    SET_USER(state, user) {
      state.user = user
      const storage = state.rememberMe ? localStorage : sessionStorage
      storage.setItem('user', JSON.stringify(user))
    },

    CLEAR_AUTH(state) {
      // 重置状态
      Object.assign(state, initialState())

      // 精准清除所有认证相关存储
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('rememberMe')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('rememberMe')
    }
  },

  actions: {
    async login({ commit }, { identifier, password, rememberMe }) {
      try {
        const res = await login_post(identifier, password)
        if (res.code !== 0) {
          throw new Error(res.message || '登录失败：未知错误')
        }

        // 提交 token
        commit('SET_TOKEN', {
          token: res.data,
          rememberMe
        })

        // 获取用户信息
        try {
          const userInfo = await this.dispatch('fetchUserInfo')
          return userInfo
        } catch (fetchError) {
          // 如果获取用户信息失败，回滚 token
          commit('CLEAR_AUTH')
          throw new Error('获取用户信息失败: ' + fetchError.message)
        }
      } catch (error) {
        commit('CLEAR_AUTH')
        throw error 
      }
    },

    async register({ commit }, { username, email, password }) {
      try {
        const res = await register_post(username, email, password)
        if (res.code === 0) return true
        throw new Error(res.message || '注册失败：服务器未返回成功状态')
      } catch (error) {
        throw new Error(error.message || '注册请求失败')
      }
    },

    async fetchUserInfo({ commit, state }) {
      if (!state.token) return null
      try {
        const res = await getUserInfo_get(state.token)
        if (res.code === 0) {
          commit('SET_USER', res.data)
          return res.data
        }
        throw new Error(res.message || '获取用户信息失败')
      } catch (error) {
        commit('CLEAR_AUTH')
        throw error
      }
    },

    async sendResetEmail({ commit }, email) {
      try {
        const res = await sendResetEmail_post(email)
        if (res.code === 0) return true
        throw new Error(res.message || '发送失败')
      } catch (error) {
        throw new Error(error.message || '邮件发送请求失败')
      }
    },

    logout({ commit }) {
      commit('CLEAR_AUTH')
    },

    async initializeAuth({ commit, dispatch }) {
      if (this.state.token) {
        try {
          // 先验证 Token 有效性
          await validateToken_post(this.state.token)
          // 再获取用户信息
          await dispatch('fetchUserInfo')
        } catch (error) {
          commit('CLEAR_AUTH')
        }
      }
    },

    async getOssPolicy({ state }) {
      if (!state.token) return null
      try {
        const res = await getOssPolicy_get(state.token)
        if (res.code === 0) return res.data
        throw new Error(res.message || '获取 OSS Policy 失败')
      } catch (error) {
        throw new Error(error.message || '获取 OSS Policy 请求失败')
      }
    }
  },

  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    userAvatar: state => state.user?.avatar || '/default-avatar.png'
  }
})