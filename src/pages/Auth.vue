<template>
  <div class="auth-container">
    <h2>{{ isLogin ? '登录' : '注册' }}</h2>
    <form @submit.prevent="isLogin ? login() : register()">
      <div class="form-group">
        <label for="username">{{ isLogin ? '用户名或邮箱' : '用户名' }}</label>
        <input type="text" id="username" v-model="username" :placeholder="isLogin ? '请输入用户名或邮箱' : '请输入用户名'" required />
      </div>
      <div class="form-group" v-if="!isLogin">
        <label for="email">邮箱</label>
        <input type="email" id="email" v-model="email" placeholder="请输入邮箱" required />
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="password" placeholder="请输入密码" required />
      </div>
      <button type="submit" class="submit-button">{{ isLogin ? '登录' : '注册' }}</button>
    </form>
    <button @click="toggleAuthMode" class="toggle-button">{{ isLogin ? '没有账号？注册' : '已有账号？登录' }}</button>

    <!-- 错误提示弹窗 -->
    <div v-if="showError" class="error-popup">
      <p>{{ errorMessage }}</p>
      <button @click="closeErrorPopup" class="close-button">关闭</button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login_post, register_post } from '@/api/user';
import store from '@/store/index';
import { getUserInfo_get } from '../api/user';

export default {
  setup() {
    const isLogin = ref(true);
    const username = ref('');
    const email = ref('');
    const password = ref('');
    const router = useRouter();

    const showError = ref(false);
    const errorMessage = ref('');

    const toggleAuthMode = () => {
      isLogin.value = !isLogin.value;
    };

    const closeErrorPopup = () => {
      showError.value = false;
      errorMessage.value = '';
    };

    const login = async () => {
      try {
        const res = await login_post(username.value, password.value);
        if (res.code === 0) {
          const token = res.data;
          store.commit('login', token);
          store.dispatch('fetchUserData');
          console.log('登录成功');
          router.push('/');
        } else {
          errorMessage.value = res.message;
          showError.value = true;
        }
      } catch (error) {
        errorMessage.value = '请求错误，请检查网络或联系管理员';
        showError.value = true;
      }
    };

    const register = async () => {
      try {
        const res = await register_post(username.value, email.value, password.value);
        if (res.code === 0) {
          errorMessage.value = res.data;
          showError.value = true;
          toggleAuthMode();
        } else {
          errorMessage.value = res.message;
          showError.value = true;
        }
      } catch (error) {
        errorMessage.value = '请求错误，请检查网络或联系管理员';
        showError.value = true;
      }
    };

    return {
      isLogin,
      username,
      email,
      password,
      toggleAuthMode,
      login,
      register,
      showError,
      errorMessage,
      closeErrorPopup
    };
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.submit-button, .toggle-button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 16px;
}

.submit-button:hover, .toggle-button:hover {
  background-color: #38a169;
}

.error-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.error-popup p {
  margin: 0 0 10px;
  color: #d9534f;
}

.close-button {
  padding: 10px;
  background-color: #d9534f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-button:hover {
  background-color: #c9302c;
}
</style>