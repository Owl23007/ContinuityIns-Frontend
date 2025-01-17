import { createStore } from 'vuex';
import axios from 'axios';

const store = createStore({
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('jwt-token') || '',
    isLoggedIn: !!localStorage.getItem('jwt-token') && !!JSON.parse(localStorage.getItem('user')),

  },

  mutations: {
    setCardSetting(state, mode) {
      state.CardSetting = mode;
    },
    setUser(state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    setToken(state, token) {
      state.token = token;
      localStorage.setItem('jwt-token', token);
    },
    logout(state) {
      state.token = '';
      state.user = null;
      state.isLoggedIn = false;
      localStorage.removeItem('user');
      localStorage.removeItem('jwt-token');
    },
    login(state, token) {
      state.token = token;
      state.isLoggedIn = true;
      localStorage.setItem('jwt-token', token);
    },
  },

  actions: {
    setCardSettingMode({ commit }, mode) {
      commit('setCardSetting', mode);
    },
    logout({ commit }) {
      commit('logout');
    },
    login({ commit }, token) {
      commit('login', token);
    },

    async fetchUserData({ commit }) {
      const token = localStorage.getItem('jwt-token');
      if (!token) {
        return;
      }
      try {
        const response = await axios.get(`${process.env.VUE_APP_BASE_API}/user/userinfo`, {
          headers: { Authorization: `Duel ${token}` }
        });
        commit('setUser', response.data.data);
        console.log('用户信息:', response.data.data);
       
      } catch (error) {
        console.error('获取用户信息失败:', error);
        commit('logout');
      }
    },
  },
  getters: {
    isLoggedIn: state => state.isLoggedIn,
  },
});

export default store;