<template>
  <div class="email-verification">
    <h1>邮箱认证</h1>
    <div v-if="loading" class="loading-spinner">
      <p>正在验证，请稍候...</p>
    </div>
    <div v-else>
      <p v-if="success" class="success-message">验证成功！2秒后将跳转到首页...</p>
      <p v-if="error" class="error-message">{{ errorMessage }} 2秒后将跳转到登录页...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const email = ref(route.query.email);
    const token = ref(route.query.token);
    const loading = ref(true);
    const success = ref(false);
    const error = ref(false);
    const errorMessage = ref('');

    const verifyEmail = async () => {
      const baseUrl = import.meta.env.VITE_APP_BASE_API;
      const url = `${baseUrl}/user/active?email=${email.value}&token=${token.value}`;
      
      try {
        const response = await axios.get(url);
        if (response.data.code === 0) {
          success.value = true;
          setTimeout(() => {
            router.push({ name: 'homePage' }); // 2秒后重定向到首页
          }, 2000);
        } else {
          throw new Error(response.data.message || '验证失败，请重试。');
        }
      } catch (err) {
        console.error('请求失败:', err);
        errorMessage.value = err.response?.data?.message || err.message || '验证失败，请重试。';
        error.value = true;
        setTimeout(() => {
          router.push({ name: 'loginPage' });
        }, 2000); // 2秒后重定向到登录页
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      verifyEmail();
    });

    return {
      loading,
      success,
      error,
      errorMessage
    };
  }
};
</script>

<style>
.email-verification {
  text-align: center;
  margin-top: 50px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-message {
  color: green;
}

.error-message {
  color: red;
}
</style>