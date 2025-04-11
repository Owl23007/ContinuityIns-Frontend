<template>
  <div class="auth-container">
    <div class="auth-card" :class="{ 'register-mode': !uiState.isLogin }">
      <div class="header">
        <h2>{{ uiState.isLogin ? '欢迎回来' : '加入我们' }}</h2>
        <div class="decorative-line"></div>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- 用户名输入 -->
        <base-input v-model="formData.main.identifier" :label="uiState.isLogin ? '用户名/邮箱' : '用户名'" required>
          <template #icon>
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user" class="svg-inline--fa fa-user"
              role="img" viewBox="0 0 448 512" width="16" height="16">
              <path fill="currentColor"
                d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3 0 498.7 13.3 512 29.7 512h388.6c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3h-91.4z" />
            </svg>
          </template>
        </base-input>

        <!-- 邮箱输入（注册模式） -->
        <div class="input-group" :class="{ error: errors.email }" v-if="!uiState.isLogin">
          <input type="text" v-model="formData.main.email" required @input="validateEmail" @blur="validateEmail"
            :class="{ filled: formData.main.email }" />
          <label>电子邮箱</label>
          <span class="icon">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="envelope"
              class="svg-inline--fa fa-envelope" role="img" viewBox="0 0 512 512" width="16" height="16">
              <path fill="currentColor"
                d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
            </svg>
          </span>
          <transition name="fade">
            <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
          </transition>
        </div>

        <!-- 密码输入 -->
        <password-input v-model="formData.main.password" label="密码" required :has-error="!!errors.password"
          :error-message="errors.password" />

        <!-- 验证码输入框 -->
        <CaptchaInput v-if="!uiState.isLogin" v-model="formData.main.captcha" :image-url="uiState.captchaUrl"
          :has-error="!!errors.captcha" :error-message="errors.captcha" @refresh="refreshCaptcha" />

        <!-- 密码强度条 -->
        <PasswordStrength v-if="!uiState.isLogin" :password="formData.main.password" />

        <!-- 重复密码输入（注册模式） -->
        <div class="input-group" :class="{ error: errors.passwordConfirm }" v-if="!uiState.isLogin">
          <input :type="uiState.showPasswordConfirm ? 'text' : 'password'" v-model="formData.main.passwordConfirm"
            required @input="validatePasswordConfirm" @blur="validatePasswordConfirm"
            :class="{ filled: formData.main.passwordConfirm }" />
          <label>确认密码</label>
          <span class="icon">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="lock" class="svg-inline--fa fa-lock"
              role="img" viewBox="0 0 448 512" width="16" height="16">
              <path fill="currentColor"
                d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z" />
            </svg>
          </span>
          <transition name="fade">
            <div v-if="errors.passwordConfirm" class="error-message">{{ errors.passwordConfirm }}</div>
          </transition>
          <button type="button" class="password-toggle"
            @click="uiState.showPasswordConfirm = !uiState.showPasswordConfirm">
            <svg v-if="uiState.showPasswordConfirm" aria-hidden="true" focusable="false" data-prefix="fas"
              data-icon="eye-slash" class="svg-inline--fa fa-eye-slash" role="img" viewBox="0 0 640 512" width="16"
              height="16">
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
        <div v-if="uiState.isLogin" class="options">
          <a @click="uiState.showForgotPassword = true" style="cursor: pointer;">忘记密码？</a>
          <div class="remember-me">
            <input type="checkbox" v-model="uiState.rememberMe" id="remember-me" />
            <p>记住我</p>
            <span class="tooltip-icon">
              <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="info-circle"
                class="svg-inline--fa fa-info-circle" role="img" viewBox="0 0 512 512" width="14" height="14">
                <path fill="#718096"
                  d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 110c23.2 0 42 18.8 42 42s-18.8 42-42 42-42-18.8-42-42 18.8-42 42-42zm56 304h-112c-13.3 0-24-10.7-24-24s10.7-24 24-24h24v-88h-24c-13.3 0-24-10.7-24-24s10.7-24 24-24h64c13.3 0 24 10.7 24 24v112h24c13.3 0 24 10.7 24 24s-10.7 24-24 24z" />
              </svg>
              <span class="tooltip-text">将通过安全令牌保持登录状态，不会存储任何密码信息，请妥善保管密码！</span>
            </span>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="uiState.processing"
          :class="{ processing: uiState.processing }">
          <span v-if="!uiState.processing">{{ uiState.isLogin ? '立即登录' : '注册账号' }}</span>
          <div v-else class="loader"></div>
        </button>
      </form>

      <div class="auth-footer">
        <span>{{ uiState.isLogin ? '新用户？' : '已有账号？' }}</span>
        <a @click="toggleAuthMode">{{ uiState.isLogin ? '创建账号' : '立即登录' }}</a>
      </div>
    </div>

    <!-- 忘记密码模态框 -->
    <transition name="modal-fade">
      <div v-if="uiState.showForgotPassword" class="modal-mask">
        <div class="modal-wrapper" @click.self="uiState.showForgotPassword = false">
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
              <div class="input-group" :class="{ error: errors.resetEmail }">
                <input type="email" v-model="formData.reset.email" required @input="validateResetEmail"
                  @blur="validateResetEmail" :class="{ filled: formData.reset.email }" placeholder=" " />
                <label>注册邮箱地址</label>
                <span class="icon">
                  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="envelope"
                    class="svg-inline--fa fa-envelope" role="img" viewBox="0 0 512 512" width="16" height="16">
                    <path fill="currentColor"
                      d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
                  </svg>
                </span>
                <transition name="fade">
                  <div v-if="errors.resetEmail" class="error-message">{{ errors.resetEmail }}</div>
                </transition>
              </div>

              <div class="modal-actions">
                <button class="primary-btn" @click="sendResetEmail"
                  :disabled="!formData.reset.email || uiState.processingReset"
                  :class="{ 'has-error': errors.resetEmail }">
                  <span v-if="!uiState.processingReset">发送重置邮件</span>
                  <div v-else class="mini-loader"></div>
                </button>
                <button class="secondary-btn" @click="uiState.showForgotPassword = false">
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
import { ref, reactive, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sendResetEmail_post } from '@/api/user'
import { getCaptcha } from '@/api/captcha'
import BaseInput from './components/BaseInput.vue'
import PasswordInput from './components/PasswordInput.vue'
import CaptchaInput from './components/CaptchaInput.vue'
import PasswordStrength from './components/PasswordStrength.vue'

// 基础依赖
const authStore = useAuthStore()
const router = useRouter()

// 定时器管理
const timers = ref([])
const setTimer = (callback, delay = 3000) => {
  const timer = setTimeout(() => {
    callback()
    timers.value = timers.value.filter(t => t !== timer)
  }, delay)
  timers.value.push(timer)
}
const clearAllTimers = () => {
  timers.value.forEach(timer => clearTimeout(timer))
  timers.value = []
}

// 组件状态
const uiState = reactive({
  isLogin: true,
  showPassword: false,
  rememberMe: false,
  processing: false,
  showForgotPassword: false,
  processingReset: false,
  showPasswordConfirm: false,
  captchaUrl: '',
})

// 表单数据
const formData = reactive({
  main: {
    identifier: '',
    email: '',
    password: '',
    passwordConfirm: '',
    captcha: '',
  },
  reset: {
    email: ''
  }
})

// 错误状态
const errors = reactive({
  email: '',
  password: '',
  resetEmail: '',
  passwordConfirm: '',
  captcha: '',
})

// 消息提示
const message = reactive({
  content: '',
  type: 'error'
})

// 验证规则
const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value.trim()) return '请输入邮箱地址'
    if (!emailRegex.test(value)) return '邮箱格式不正确'
    return ''
  },
  password: (value) => {
    if (value.length < 8) return '密码长度不能少于8位'
    return ''
  },
  username: (value) => {
    if (!value.trim()) return '请输入用户名'
    if (value.length < 4) return '用户名不能少于4位'
    return ''
  }
}

// 主表单验证
const validateMainForm = () => {
  let isValid = true

  // 邮箱验证（注册模式）
  if (!uiState.isLogin) {
    const emailError = validators.email(formData.main.email)
    if (emailError) {
      errors.email = emailError
      isValid = false
      setTimer(() => errors.email = '')
    }
  }

  // 密码验证
  const passwordError = validators.password(formData.main.password)
  if (passwordError) {
    errors.password = passwordError
    isValid = false
    setTimer(() => errors.password = '')
  }

  // 用户名验证（注册模式）
  if (!uiState.isLogin) {
    const usernameError = validators.username(formData.main.identifier)
    if (usernameError) {
      errors.username = usernameError
      isValid = false
      setTimer(() => errors.username = '')
    }
  }

  // 确认密码验证（注册模式）
  if (!uiState.isLogin && !validatePasswordConfirm()) {
    isValid = false
  }

  // 验证码验证（注册模式）
  if (!uiState.isLogin && !validateCaptcha()) {
    isValid = false
  }

  // 基础字段验证
  if (!formData.main.identifier.trim() || !formData.main.password) {
    isValid = false
  }

  return isValid
}

// 重置邮箱验证
const validateResetEmail = () => {
  const error = validators.email(formData.reset.email)
  if (error) {
    errors.resetEmail = error
    setTimer(() => errors.resetEmail = '')
    return false
  }
  return true
}

// 添加确认密码验证方法
const validatePasswordConfirm = () => {
  if (!formData.main.passwordConfirm) {
    errors.passwordConfirm = '请确认密码'
    return false
  }
  if (formData.main.passwordConfirm !== formData.main.password) {
    errors.passwordConfirm = '两次输入的密码不一致'
    return false
  }
  errors.passwordConfirm = ''
  return true
}
// 验证码相关方法
const refreshCaptcha = async () => {
  try {
    // 先清空当前验证码url
    uiState.captchaUrl = ''
    const response = await getCaptcha()
    // 后端返回的是完整的 data URL，需要分离UUID和base64数据
    if (response) {
      // 保存UUID部分
      const uuid = response.data.split(':')[0]
      // 获取base64图片数据部分
      const imageData = response.data.split(':').slice(1).join(':')

      // 保存UUID到formData中供后续验证使用
      formData.main.captchaId = uuid
      // 设置验证码图片URL
      uiState.captchaUrl = imageData

      console.log('验证码获取成功', uuid)
    } else {
      throw new Error('验证码获取失败')
    }
  } catch (error) {
    showMessage(error.message || '获取验证码失败')
  }
}

const validateCaptcha = async () => {
  if (!formData.main.captcha) {
    errors.captcha = '请输入验证码'
    return false
  }
  if (formData.main.captcha.length !== 4) {
    console.log(formData.main.captcha.length)
    errors.captcha = '验证码长度不正确'
    return false
  }
  // 当验证码长度为4时，清除错误信息
  errors.captcha = ''
  return true
}

// 表单提交
const handleSubmit = async () => {
  if (!validateMainForm() || uiState.processing) {
    if (!validateMainForm()) showMessage('请填写完整信息')
    return
  }

  uiState.processing = true
  try {
    if (uiState.isLogin) {
      await handleLogin()
    } else {
      await handleRegister()
    }
  } catch (error) {
    showMessage(error.message || '操作失败，请检查网络')
  } finally {
    uiState.processing = false
  }
}

// 登录处理
const handleLogin = async () => {
  await authStore.login({
    identifier: formData.main.identifier,
    password: formData.main.password,
    rememberMe: uiState.rememberMe
  })
  const redirectPath = router.currentRoute?.query?.redirect || '/'
  router.replace(redirectPath)
  showMessage('登录成功', 'success')
}

// 注册处理
const handleRegister = async () => {
  try {
    await authStore.register({
      username: formData.main.identifier,
      email: formData.main.email,
      password: formData.main.password,
      captchaCode: formData.main.captcha,
      captchaId: formData.main.captchaId
    })
    showMessage('注册成功，请查看邮箱验证', 'success')
    toggleAuthMode()
  } catch (error) {
    showMessage(error.message || '注册失败，请重试')
    // 注册失败时刷新验证码
    refreshCaptcha()
  }
}

// 密码重置处理
const sendResetEmail = async () => {
  if (!validateResetEmail() || uiState.processingReset) return

  uiState.processingReset = true
  try {
    const res = await sendResetEmail_post(formData.reset.email)
    if (res.code === -1) throw new Error(res.message)

    showMessage('重置链接已发送至邮箱', 'success')
    uiState.showForgotPassword = false
    formData.reset.email = ''
    errors.resetEmail = ''
  } catch (error) {
    showMessage(error.message || '发送失败，请稍后重试')
  } finally {
    uiState.processingReset = false
  }
}

// 辅助函数
const toggleAuthMode = () => {
  uiState.isLogin = !uiState.isLogin
  resetMainForm()
}

const resetMainForm = () => {
  formData.main.identifier = ''
  formData.main.email = ''
  formData.main.password = ''
  formData.main.passwordConfirm = ''
  formData.main.captcha = ''
  clearErrors()
  if (!uiState.isLogin) {
    refreshCaptcha()
  }
}

const clearErrors = () => {
  errors.email = ''
  errors.password = ''
  errors.resetEmail = ''
  errors.passwordConfirm = ''
  errors.captcha = ''
}

const showMessage = (content, type = 'error') => {
  message.content = content
  message.type = type
  setTimer(() => message.content = '')
}

// 生命周期
onBeforeUnmount(() => {
  clearAllTimers()
})

// 自动验证重置邮箱
watch(
  () => formData.reset.email,
  () => validateResetEmail()
)

// 在注册模式切换时刷新验证码
watch(() => uiState.isLogin, (newVal) => {
  if (!newVal) {
    refreshCaptcha()
  }
})

</script>

<style src="./styles/login.css"></style>