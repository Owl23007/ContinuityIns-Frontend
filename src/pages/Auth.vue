<template>
  <div class="auth-container">
    <div class="auth-card" :class="{ 'register-mode': !isLogin }">
      <div class="header">
        <h2>{{ isLogin ? '欢迎回来' : '加入我们' }}</h2>
        <div class="decorative-line"></div>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- 用户名输入 -->
        <div class="input-group">
          <input type="text" v-model="form.identifier" required :class="{ filled: form.identifier }" />
          <label>{{ isLogin ? '用户名/邮箱' : '用户名' }}</label>
          <i class="icon fas fa-user"></i>
        </div>

        <!-- 邮箱输入（注册模式） -->
        <div class="input-group" v-if="!isLogin">
          <input type="email" v-model="form.email" required :class="{ filled: form.email }" />
          <label>电子邮箱</label>
          <i class="icon fas fa-envelope"></i>
        </div>

        <!-- 密码输入 -->
        <div class="input-group">
          <input :type="showPassword ? 'text' : 'password'" v-model="form.password" required
            :class="{ filled: form.password }" />
          <label>密码</label>
          <i class="icon fas fa-lock"></i>
          <button type="button" class="password-toggle" @click="showPassword = !showPassword">
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>

        <!-- 登录模式选项 -->
        <div v-if="isLogin" class="options">
          <a @click="showForgotPassword = true">忘记密码？</a>
          <div class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <p style="writing-mode:inherit;min-width: 50px;">记住我</p>
          </div>

        </div>

        <button type="submit" class="submit-btn" :disabled="processing" :class="{ processing }">
          <span v-if="!processing">{{ isLogin ? '立即登录' : '注册账号' }}</span>
          <div v-else class="loader"></div>
        </button>
      </form>

      <div class="auth-footer">
        <span>{{ isLogin ? '新用户？' : '已有账号？' }}</span>
        <a @click="toggleAuthMode">{{ isLogin ? '创建账号' : '立即登录' }}</a>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <transition name="modal">
      <div v-if="showForgotPassword" class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <h3>重置密码</h3>
            <div class="input-group">
              <input type="email" v-model="resetEmail" placeholder="输入注册邮箱" required />
              <i class="fas fa-envelope"></i>
            </div>
            <div class="modal-actions">
              <button @click="sendResetEmail" :disabled="processingReset">
                {{ processingReset ? '发送中...' : '发送重置链接' }}
              </button>
              <button @click="showForgotPassword = false">取消</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 全局消息提示 -->
    <transition name="slide-down">
      <div v-if="message.content" class="global-message" :class="message.type">
        {{ message.content }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { sendResetEmail_post } from '@/api/user'

const store = useStore()
const router = useRouter()

// 响应式状态
const isLogin = ref(true)
const showPassword = ref(false)
const rememberMe = ref(false)
const processing = ref(false)
const showForgotPassword = ref(false)
const processingReset = ref(false)
const resetEmail = ref('')

// 表单数据
const form = reactive({
  identifier: '',
  email: '',
  password: ''
})

// 全局消息提示
const message = reactive({
  content: '',
  type: 'error' // 'success' | 'error'
})

// 表单验证
const formValid = computed(() => {
  if (isLogin.value) {
    // 登录模式
    // 用户名或邮箱不为空，密码不少于6位，且邮箱格式正确
    return form.identifier.trim() && form.password.length >= 6
  }
  return (
    form.identifier.trim() &&
    form.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,}$/) &&
    form.password.length >= 6
  )
})
const handleSubmit = async () => {
  if (!formValid.value || processing.value) return

  processing.value = true
  try {
    if (isLogin.value) {
      // 登录逻辑
      await store.dispatch('login', {
        identifier: form.identifier,
        password: form.password,
        rememberMe: rememberMe.value
      })

      // 安全获取跳转路径
      const redirectPath = router.currentRoute?.query?.redirect || '/'
      console.log('即将跳转到:', redirectPath)
      router.replace(redirectPath)
      showMessage('登录成功', 'success')
    } else {
      // 注册逻辑
      await store.dispatch('register', {
        username: form.identifier,
        email: form.email,
        password: form.password
      })

      showMessage('注册成功，请查看邮箱验证', 'success')
      toggleAuthMode()
    }
  } catch (error) {
    showMessage(error.message || '操作失败，请检查网络')
  } finally {
    processing.value = false
  }
}
// 忘记密码
const sendResetEmail = async () => {
  if (!resetEmail.value || processingReset.value) return

  processingReset.value = true
  try {
    await sendResetEmail_post(resetEmail.value)
    showMessage('重置链接已发送至邮箱', 'success')
    showForgotPassword.value = false
  } catch (error) {
    showMessage(error.message || '发送失败')
  } finally {
    processingReset.value = false
  }
}

// 辅助方法
const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
  resetForm()
}

// 重置表单
const resetForm = () => {
  form.identifier = ''
  form.email = ''
  form.password = ''
}

// 全局消息提示
let messageTimer = null
const showMessage = (content, type) => {
  message.content = content
  message.type = type
  clearTimeout(messageTimer)
  messageTimer = setTimeout(() => message.content = '', 3000)
}
</script>

<style scoped>
/* 基础样式 */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 450px;
  transition: transform 0.3s ease;
}

.auth-card.register-mode {
  transform: translateY(-10px);
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

h2 {
  color: #2d3748;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.decorative-line {
  width: 60px;
  height: 3px;
  background: #667eea;
  margin: 0 auto;
  border-radius: 2px;
}

/* 输入组样式 */
.input-group {
  position: relative;
  margin-bottom: 1.5rem;
}

input {
  width: 100%;
  padding: 1rem 1rem 1rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input.filled {
  border-color: #c3dafe;
}

label {
  position: absolute;
  left: 2.5rem;
  top: 1rem;
  color: #718096;
  pointer-events: none;
  transition: all 0.3s ease;
}

input:focus~label,
input.filled~label {
  top: -0.6rem;
  left: 1rem;
  font-size: 0.8rem;
  background: white;
  padding: 0 0.5rem;
  color: #667eea;
}

.icon {
  position: absolute;
  left: 1rem;
  top: 1rem;
  color: #a0aec0;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
}

/* 按钮样式 */
.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-btn.processing {
  opacity: 0.7;
  cursor: not-allowed;
}

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 其他元素 */
.options {
  display: flex;
  /*元素在同行*/
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
  align-items: center;
  /* 添加垂直居中 */
  gap: 1rem;
  /* 添加间距防止粘连 */
}

.remember-me {
  display: flex;
  /* 改为 flex 布局 */
  align-items: center;
  gap: 0.5rem;
  position: relative;
  /* 如果需要定位可以保留 */
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  /* 缩小间距 */
}

/* 原生复选框美化 */
.remember-me input[type="checkbox"] {
  margin: 0;
  padding: 5px 5px 5px 5px;
  /* 调整内边距 */
  width: 16px;
  /* 缩小尺寸 */
  height: 16px;
  /* 缩小尺寸 */
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  appearance: none;
  -webkit-appearance: none;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
  /* 防止被压缩 */
}

/* 选中状态 */
.remember-me input[type="checkbox"]:checked {
  background-color: #667eea;
  border-color: #667eea;
}

/* 勾选图标 */
.remember-me input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  left: 5px;
  /* 调整位置 */
  top: 2px;
  /* 调整位置 */
  width: 4px;
  /* 缩小勾选图标 */
  height: 8px;
  /* 缩小勾选图标 */
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* 文字样式调整 */
.remember-me p {
  font-size: 0.9rem;
  /* 缩小文字 */
  margin: 0;
  /* 移除默认边距 */
  line-height: 1.2;
  /* 紧凑行高 */
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: #718096;
}

.auth-footer a {
  color: #667eea;
  cursor: pointer;
  font-weight: 500;
}

/* 模态框样式 */
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
}

.modal-container {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 400px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* 消息提示 */
.global-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
}

.global-message.success {
  background: #48bb78;
}

.global-message.error {
  background: #f56565;
}

/* 过渡动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }
}
</style>