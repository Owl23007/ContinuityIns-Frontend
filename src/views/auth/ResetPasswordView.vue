<template>
    <div class="auth-container">
        <div class="auth-card">
            <div class="header">
                <h2>重置密码</h2>
                <div class="decorative-line"></div>
            </div>

            <form @submit.prevent="handleSubmit">
                <!-- 密码输入组 -->
                <div class="input-group">
                    <input :type="'text'" v-model="form.newPassword" required :class="{ filled: form.newPassword }" />
                    <label>新密码</label>
                </div>

                <!-- 密码强度条 -->
                <div class="password-strength" :data-strength="passwordStrength">
                    <div class="strength-bar"
                        :style="{ width: strengthPercentage + '%', backgroundColor: strengthColor }"></div>
                </div>
                <div class="strength-text" :style="{ color: strengthColor }">
                    {{ strengthText }}
                </div>

                <!-- 确认密码 -->
                <div class="input-group">
                    <input type="text" v-model="form.confirmPassword" required
                        :class="{ filled: form.confirmPassword }" />
                    <label>确认密码</label>
                </div>

                <!-- 操作按钮 -->
                <button type="submit" class="submit-btn" :disabled="processing" :class="{ processing }">
                    <span v-if="!processing">确认重置</span>
                    <div v-else class="loader"></div>
                </button>
            </form>
        </div>

        <!-- 全局消息提示 -->
        <transition name="slide-down">
            <div v-if="message.content" class="global-message" :class="message.type">
                {{ message.content }}
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 响应式状态
const form = reactive({ newPassword: '', confirmPassword: '' })
const processing = ref(false)
const message = reactive({ content: '', type: 'error' })

// 密码强度计算
const passwordStrength = computed(() => {
    if (!form.newPassword) return 0
    return score(form.newPassword)
})

const strengthPercentage = computed(() => {
    console.log((passwordStrength.value / 6) * 100)
    return (passwordStrength.value / 6) * 100
})

const strengthColor = computed(() => {
    if (passwordStrength.value <= 2) return '#f56565'
    if (passwordStrength.value <= 4) return '#f6ad55'
    return '#48bb78'
})

const strengthText = computed(() => {
    if (passwordStrength.value <= 2) return '弱'
    if (passwordStrength.value <= 4) return '中等'
    return '强'
})

const score = (password) => {
    let score = 0

    // 基础分 - 长度
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1

    // 字符类型多样性
    if (/[a-z]/.test(password)) score += 1  // 小写字母
    if (/[A-Z]/.test(password)) score += 1  // 大写字母
    if (/\d/.test(password)) score += 1     // 数字
    if (/[^a-zA-Z0-9]/.test(password)) score += 2  // 特殊字符加权

    // 复杂度奖励
    const types = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter(regex => regex.test(password)).length
    if (types >= 3) score += 1  // 使用3种及以上字符类型的奖励

    return score
}

// 提交处理
const handleSubmit = async () => {
    if (!validateForm()) return

    processing.value = true
    try {
        if (!route.query.email || !route.query.token) {
            throw new Error('重置链接无效')
        }

        const response = await authStore.resetPassword(
            route.query.email,
            route.query.token,
            form.newPassword
        )

        if (response.code === 0) {
            showMessage('密码重置成功，即将跳转到登录页面', 'success')
            setTimeout(() => router.push('/auth'), 2000)
        } else if (response.code === -1) {
            if (response.message.includes('token')) {
                showMessage('重置链接已过期，请重新申请', 'error')
                setTimeout(() => router.push('/auth'), 3000)
            } else {
                showMessage(response.message || '重置失败，请重试', 'error')
            }
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || '链接已失效或系统错误'
        showMessage(`操作失败：${errorMsg}`, 'error')
        if (errorMsg.includes('token') || errorMsg.includes('链接')) {
            setTimeout(() => router.push('/auth'), 3000)
        }
    } finally {
        processing.value = false
    }
}

// 表单验证
const validateForm = () => {
    // 密码强度验证
    if (passwordStrength.value < 4) {
        showMessage('密码强度不足，请确保：\n1. 长度至少8位\n2. 包含大小写字母和数字\n3. 建议使用特殊字符', 'error')
        return false
    }

    if (form.newPassword !== form.confirmPassword) {
        showMessage('两次输入的密码不一致', 'error')
        return false
    }

    return true
}

// 消息显示
const showMessage = (content, type = 'error') => {
    message.content = content
    message.type = type
    setTimeout(() => message.content = '', 3000)
}

// 初始校验
onMounted(() => {
    if (!route.query.email || !route.query.token) {
        showMessage('无效的密码重置链接', 'error')
    }
})
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
    transform: translateY(-80px);
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

/* 密码强度条 */
.password-strength {
    height: 4px;
    background: #e2e8f0;
    margin-top: 8px;
    border-radius: 2px;
    position: relative;
}

.strength-bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-text {
    margin-top: 4px;
    font-size: 0.75rem;
    text-align: right;
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

/* 全局消息提示 */
.global-message {
    position: fixed;
    top: 80px;
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
</style>