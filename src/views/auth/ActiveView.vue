<template>
  <div class="email-verification">
    <div class="verification-card">
      <h1>邮箱认证</h1>
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>正在验证，请稍候...</p>
      </div>
      <div v-else class="message-container">
        <div v-if="success" class="status-message success">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p>验证成功！2秒后将跳转到首页...</p>
        </div>
        <div v-if="error" class="status-message error">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p>{{ errorMessage }} 2秒后将跳转到登录页...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const email = ref(route.query.email)
const token = ref(route.query.token)
const loading = ref(true)
const success = ref(false)
const error = ref(false)
const errorMessage = ref('')

const verifyEmail = async () => {
  const baseUrl = import.meta.env.VITE_APP_BASE_API
  const url = `${baseUrl}/user/active?email=${email.value}&token=${token.value}`
  
  try {
    const response = await axios.get(url)
    if (response.data.code === 0) {
      success.value = true
      setTimeout(() => {
        router.push({ name: 'homePage' })
      }, 2000)
    } else {
      throw new Error(response.data.message || '验证失败，请重试。')
    }
  } catch (err) {
    console.error('请求失败:', err)
    errorMessage.value = err.response?.data?.message || err.message || '验证失败，请重试。'
    error.value = true
    setTimeout(() => {
      router.push({ name: 'loginPage' })
    }, 2000)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  verifyEmail()
})
</script>

<style scoped>
.email-verification {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 3vw, 2rem);
  background: linear-gradient(135deg, #1a2a3a 0%, #2c5282 50%, #2b6cb0 100%);
  background-size: 300% 300%;
  animation: gradientShift 20s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.verification-card {
  background: rgba(255, 255, 255, 0.98);
  padding: clamp(2rem, 5vw, 2.5rem);
  border-radius: min(24px, 5vw);
  box-shadow: 
    0 10px 30px -5px rgba(0, 0, 0, 0.15),
    0 2px 8px -2px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(12px);
  width: 100%;
  max-width: 420px;
  text-align: center;
}

h1 {
  color: #2d3748;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  position: relative;
  display: inline-block;
}

h1::after {
  content: "";
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #3b82f6;
  border-radius: 2px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.message-container {
  margin-top: 1rem;
}

.status-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.status-message svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.status-message p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

.success {
  background: rgba(72, 187, 120, 0.1);
  color: #2f855a;
}

.error {
  background: rgba(245, 101, 101, 0.1);
  color: #c53030;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .verification-card {
    padding: 1.5rem;
    margin: 0 1rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .status-message {
    flex-direction: column;
    text-align: center;
    padding: 0.75rem;
  }
}

/* 横屏模式 */
@media (max-height: 600px) and (orientation: landscape) {
  .verification-card {
    padding: 1.25rem;
    margin: 0.5rem;
  }

  h1 {
    margin-bottom: 1.5rem;
  }
}</style>