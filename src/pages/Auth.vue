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
          <span class="icon">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user" class="svg-inline--fa fa-user"
              role="img" viewBox="0 0 448 512" width="16" height="16">
              <path fill="currentColor"
                d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3 0 498.7 13.3 512 29.7 512h388.6c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3h-91.4z" />
            </svg>
          </span>
        </div>

        <!-- 邮箱输入（注册模式） -->
        <div class="input-group" v-if="!isLogin">
          <input type="email" v-model="form.email" required :class="{ filled: form.email }" />
          <label>电子邮箱</label>
          <span class="icon">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="envelope"
              class="svg-inline--fa fa-envelope" role="img" viewBox="0 0 512 512" width="16" height="16">
              <path fill="currentColor"
                d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
            </svg>
          </span>
        </div>

        <!-- 密码输入 -->
        <div class="input-group">
          <input :type="showPassword ? 'text' : 'password'" v-model="form.password" required
            :class="{ filled: form.password }" />
          <label>密码</label>
          <span class="icon">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="lock" class="svg-inline--fa fa-lock"
              role="img" viewBox="0 0 448 512" width="16" height="16">
              <path fill="currentColor"
                d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z" />
            </svg>
          </span>
          <button type="button" class="password-toggle" @click="showPassword = !showPassword">
            <svg v-if="showPassword" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye-slash"
              class="svg-inline--fa fa-eye-slash" role="img" viewBox="0 0 640 512" width="16" height="16">
              <path fill="currentColor"
                d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.9-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z" />
            </svg>
            <svg v-else aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye"
              class="svg-inline--fa fa-eye" role="img" viewBox="0 0 576 512" width="16" height="16">
              <path fill="currentColor"
                d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.9-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
            </svg>
          </button>
        </div>



        <!-- 登录模式选项 -->
        <div v-if="isLogin" class="options">
          <a @click="showForgotPassword = true" style="cursor: pointer;">忘记密码？</a>
          <div class="remember-me">
            <input type="checkbox" v-model="rememberMe" id="remember-me" />
            <p>记住我</p>
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

    <!-- 忘记密码模态框 -->
    <transition name="modal-fade">
      <div v-if="showForgotPassword" class="modal-mask">
        <div class="modal-wrapper" @click.self="showForgotPassword = false">
          <div class="modal-container">
            <div class="modal-header">
              <div class="title-group">

                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="100" viewBox="0 0 24 24">
                  <path
                    d="M 7.4902344 4.9902344 C 2.9840088 4.7280273 -0.73828125 8.7070312 0.19921875 13.300781 C 0.69921875 16.100781 2.8992188 18.300781 5.6992188 18.800781 C 9.4018574 19.480858 12.758486 17.245602 13.748047 14 L 18 14 L 18 15 C 18 16.1 18.9 17 20 17 C 21.1 17 22 16.1 22 15 L 22 14 C 23.1 14 24 13.1 24 12 C 24 10.9 23.1 10 22 10 L 13.71875 10 C 12.945525 7.5812551 10.89522 5.6540158 8.4003906 5.0996094 C 8.0941406 5.0433594 7.7906494 5.0077148 7.4902344 4.9902344 z M 7 9 C 8.7 9 10 10.3 10 12 C 10 13.7 8.7 15 7 15 C 5.3 15 4 13.7 4 12 C 4 10.3 5.3 9 7 9 z">
                  </path>
                </svg>
                <h3>重置密码</h3>
              </div>
            </div>

            <div class="modal-content">
              <div class="input-group" :class="{ error: emailError }">
                <input type="email" v-model="resetEmail" required @input="validateEmail" @blur="validateEmail"
                  placeholder=" " />
                <label>注册邮箱地址</label>
                <span class="icon">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="envelope"
                    class="svg-inline--fa fa-envelope" role="img" viewBox="0 0 512 512" width="16" height="16">
                    <path fill="currentColor"
                      d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                  </svg>
                </span>
                <transition name="fade">
                  <div v-if="emailError" class="error-message">{{ emailError }}</div>
                </transition>
              </div>

              <div class="modal-actions">
                <button class="primary-btn" @click="sendResetEmail" :disabled="!!emailError || processingReset"
                  :class="{ 'has-error': emailError }">
                  <span v-if="!processingReset">发送重置邮件</span>
                  <div v-else class="mini-loader"></div>
                </button>
                <button class="secondary-btn" @click="showForgotPassword = false">
                  取消
                </button>
              </div>

              <div class="notice-text">
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="info-circle"
                  class="svg-inline--fa fa-info-circle" role="img" viewBox="0 0 512 512" width="14" height="14">
                  <path fill="currentColor"
                    d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
                </svg>
                将发送重置链接的邮件到您的注册邮箱
              </div>
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
/**
 * TODO:1.完成找回密码的功能 2.解决登出要两次的问题 3.对勾缺失 
 **/
// 导入依赖
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { sendResetEmail_post } from '@/api/user'

// 初始化
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

const form = reactive({
  identifier: '',
  email: '',
  password: ''
})

const message = reactive({
  content: '',
  type: 'error'
})

const emailError = ref('')

// 表单验证
const formValid = computed(() => {
  const { identifier, email, password } = form
  const basicCheck = identifier.trim() && password.length >= 8

  console.log('参数验证')
  return isLogin.value
    ? basicCheck
    : basicCheck && email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
})

// 方法
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!resetEmail.value.trim()) {
    emailError.value = '请输入邮箱地址'
    return false
  }
  if (!emailRegex.test(resetEmail.value)) {
    emailError.value = '邮箱格式不正确'
    return false
  }
  emailError.value = ''
  return true
}


const handleSubmit = async () => {
  if (formValid.value || processing.value) {
    console.log('参数验证失败')
    return
  }
  processing.value = true
  try {
    if (isLogin.value) {
      await store.dispatch('login', {
        identifier: form.identifier,
        password: form.password,
        rememberMe: rememberMe.value
      })

      const redirectPath = router.currentRoute?.query?.redirect || '/'
      router.replace(redirectPath)
      showMessage('登录成功', 'success')
    } else {
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

const sendResetEmail = async () => {
  if (!validateEmail()) return
  if (processingReset.value) return

  processingReset.value = true
  try {
    await sendResetEmail_post(resetEmail.value)
    showMessage('重置链接已发送至邮箱', 'success')
    showForgotPassword.value = false
    resetEmail.value = ''
  } catch (error) {
    showMessage(error.response?.data?.message || '发送失败，请稍后重试')
  } finally {
    processingReset.value = false
  }
}

// 辅助方法
const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
  resetForm()
}

const resetForm = () => {
  form.identifier = ''
  form.email = ''
  form.password = ''
}

const showMessage = (content, type = 'error') => {
  message.content = content
  message.type = type
  setTimeout(() => message.content = '', 3000)
}
</script>

<style scoped>
/* 新增图标样式 */
.icon svg {
  width: 16px;
  height: 16px;
  color: inherit;
}

.password-toggle svg {
  width: 18px;
  height: 18px;
  color: #a0aec0;
  transition: color 0.2s;
}

.password-toggle:hover svg {
  color: #667eea;
}

.modal-header svg.fa-key {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 10px;
  border-radius: 8px;

}

.notice-text svg {
  margin-right: 8px;
  flex-shrink: 0;
}

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
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
  gap: 1rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  position: relative;
}

.remember-me input[type="checkbox"] {
  margin: 0;
  padding: 5px;
  width: 16px;
  height: 16px;
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  appearance: none;
  -webkit-appearance: none;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
}

.remember-me input[type="checkbox"]:checked {
  background-color: #667eea;
  border-color: #667eea;
}

.remember-me input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  display: block;
  visibility: visible; 
}


.remember-me p {
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.2;
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

.modal-wrapper {
  width: 100%;
  height: 100%;
  max-width: 3500px;
  padding: 20px;
  align-items: middle;
}

.modal-container {
  margin: auto;
  margin-top: 15rem;
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transform: scale(0.95);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-header {
  max-height: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  color: #718096;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #667eea;
  transform: rotate(90deg);
}

.modal-content {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.primary-btn {
  flex: 1;
  padding: 0.8rem;
  min-width: 120px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}


.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #e2e8f0;
}

.secondary-btn {
  flex: 1;
  padding: 0.8rem;
  background: #f8f9fa;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.mini-loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

.modal-content .input-group {
  position: relative;
  margin-top: 1.5rem;
}

.modal-content input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.modal-content input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-content label {
  position: absolute;
  left: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
  pointer-events: none;
  transition: all 0.3s ease;
}

.modal-content input:focus~label,
.modal-content input:not(:placeholder-shown)~label {
  top: -0.6rem;
  left: 1rem;
  font-size: 0.8rem;
  background: white;
  padding: 0 0.5rem;
  color: #667eea;
}

.modal-content .icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

/* 动画效果 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
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
  z-index: 9999;
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

.modal-header .title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header .icon.fa-key {
  color: #667eea;
  font-size: 1.4rem;
  background: rgba(102, 126, 234, 0.1);
  padding: 10px;
  border-radius: 8px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  color: #2d3748;
}

.input-group.error input {
  border-color: #f56565;
  background: #fff5f5;
}

.input-group.error label {
  color: #f56565;
}

.error-message {
  color: #f56565;
  font-size: 0.85rem;
  margin-top: 4px;
  position: absolute;
  bottom: -20px;
  left: 2.5rem;
}

.notice-text {
  margin-top: 1.5rem;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #718096;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-text .fa-info-circle {
  color: #a0aec0;
  flex-shrink: 0;
}

.primary-btn.has-error {
  background: #e2e8f0;
  cursor: not-allowed;
  opacity: 0.7;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }
}
</style>

