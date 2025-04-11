<template>
  <main class="user-profile" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <section class="profile-card">


      <!-- 加载中提示改进 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-ripple">
          <div></div>
          <div></div>
        </div>
        <p class="loading-text">正在加载用户信息...</p>
      </div>

      <!-- 用户信息内容 -->
      <template v-else-if="user">
        <user-info-card :user="user" :is-own-profile="isOwnProfile" :default-avatar="defaultAvatar"
          @avatar-error="handleAvatarError" />

        <!-- 操作按钮和统计信息 -->
        <profile-action-buttons v-if="user" :disabled="isUpdating || isDeleting" :is-own-profile="isOwnProfile"
          :user-id="user.id" @edit-profile="openModal('profile')" @change-background="openModal('background')"
          @delete-account="openModal('logout')" @change-avatar="openModal('avatar')" />
      </template>

      <!-- 错误状态 -->
      <div v-else class="error-container">
        <i class="fas fa-exclamation-circle error-icon"></i>
        <p>获取用户信息失败，请<a @click="reloadUserInfo" href="javascript:void(0)">重试</a></p>
      </div>
    </section>

    <!-- 添加文章列表部分 -->
    <section v-if="user" class="articles-section">
      <div class="tab-header">
        <h2 class="section-title">{{ isOwnProfile ? '我的文章' : '发布的文章' }}</h2>
      </div>
      <profile-articles :user-id="user.id" :is-own-profile="isOwnProfile" />
    </section>

    <!-- 模态框 -->
    <Teleport to="body">
      <!-- 编辑资料模态框 -->
      <modal-dialog v-if="activeModal === 'profile'" title="编辑个人资料" @close="closeModal">
        <profile-form :nickname="formData.nickname" :signature="formData.signature" :is-submitting="isUpdating"
          @update="handleProfileUpdate" @cancel="closeModal" />
      </modal-dialog>

      <!-- 头像上传模态框 -->
      <modal-dialog v-if="activeModal === 'avatar' && authStore.token" title="更换头像" @close="closeModal">
        <avatar-uploader @avatar-updated="handleAvatarUpdated" @cancel="closeModal" :is-submitting="isUpdating"
          :token="authStore.token" />
      </modal-dialog>

      <!-- 背景上传模态框 -->
      <modal-dialog v-if="activeModal === 'background' && authStore.token" title="更换背景" @close="closeModal">
        <background-uploader @background-updated="handleBackgroundUpdated" @cancel="closeModal"
          :is-submitting="isUpdating" :token="authStore.token" />
      </modal-dialog>

      <!-- 注销账户模态框 -->
      <modal-dialog v-if="activeModal === 'logout'" title="账户注销" theme="danger" @close="closeModal">
        <account-delete-confirm @delete-account="performLogout" @cancel="closeModal" :is-submitting="isDeleting" />
      </modal-dialog>
    </Teleport>

    <!-- 通知消息 -->
    <notification-system ref="notificationSystem" />
  </main>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getUserById_get } from '@/api/user'
import defaultAvatar from '@/assets/image/default_avatar.png'
import defaultBackground from '@/assets/image/default_cover.jpg'

import ModalDialog from '@/views/user/components/ModalDialog.vue'
import ProfileForm from '@/views/user/components/ProfileForm.vue'
import AvatarUploader from '@/views/user/components/AvatarUploader.vue'
import BackgroundUploader from '@/views/user/components/BackgroundUploader.vue'
import AccountDeleteConfirm from '@/views/user/components/AccountDeleteConfirm.vue'
import NotificationSystem from '@/components/common/NotificationSystem.vue'
import ProfileActionButtons from '@/views/user/components/ProfileActionButtons.vue'
import ProfileArticles from './components/ProfileArticles.vue'
import UserInfoCard from './components/UserInfoCard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationSystem = ref(null)

const loading = ref(true)
const profileUser = ref(null)
const activeModal = ref(null)
const isUpdating = ref(false)
const isDeleting = ref(false)
const backgroundImage = ref(defaultBackground)
const formData = reactive({
  nickname: '',
  signature: ''
})

// 是否为当前用户的个人页面
const isOwnProfile = computed(() => {
  return !route.params.id || authStore.currentUser?.id === Number(route.params.id)
})

// 获取要显示的用户信息
const user = computed(() => {
  return isOwnProfile.value ? authStore.currentUser : profileUser.value
})

// 获取指定用户信息
const fetchUserProfile = async (userId) => {
  try {
    loading.value = true
    const response = await getUserById_get(authStore.token, userId)
    if (response.code === 0) {
      profileUser.value = response.data
      updateUserDataFromStore()
    } else {
      throw new Error(response.message || '获取用户信息失败')
    }
  } catch (error) {
    showNotification('获取用户信息失败: ' + error.message, 'error')
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    loading.value = true
    if (isOwnProfile.value) {
      await authStore.fetchUserInfo()
    } else {
      await fetchUserProfile(route.params.id)
    }
    updateUserDataFromStore()
  } catch (error) {
    showNotification('获取用户信息失败', 'error')
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
})

// 监听路由参数变化
watch(() => route.params.id, async (newId) => {
  if (newId && !isOwnProfile.value) {
    await fetchUserProfile(newId)
  } else if (!newId) {
    await authStore.fetchUserInfo()
  }
}, { immediate: true })

// 更新本地状态从存储或个人资料
function updateUserDataFromStore() {
  if (user.value) {
    formData.nickname = user.value.nickname || ''
    formData.signature = user.value.signature || ''
    backgroundImage.value = user.value.backgroundImage || defaultBackground
  }
}

// 重新加载用户信息
async function reloadUserInfo() {
  if (loading.value) return

  try {
    loading.value = true
    if (isOwnProfile.value) {
      await authStore.fetchUserInfo()
    } else if (route.params.id) {
      await fetchUserProfile(route.params.id)
    }
    updateUserDataFromStore()
    showNotification('刷新成功', 'success')
  } catch (error) {
    showNotification('获取用户信息失败，请稍后再试', 'error')
  } finally {
    loading.value = false
  }
}

//  处理头像加载错误
function handleAvatarError(e) {
  e.target.src = defaultAvatar
  showNotification('头像加载失败，已使用默认头像', 'warning')
}

// 添加背景图加载错误处理
const handleBackgroundError = () => {
  backgroundImage.value = defaultBackground
  showNotification('背景图片加载失败，已使用默认背景', 'warning')
}

// 打开模态框
function openModal(type) {
  activeModal.value = type
}

// 关闭模态框
function closeModal() {
  activeModal.value = null
}

// 处理个人资料更新
async function handleProfileUpdate(data) {
  if (isUpdating.value) return

  isUpdating.value = true
  try {
    await authStore.updateUserProfile(data)
    showNotification('个人资料更新成功', 'success')
    closeModal()
  } catch (error) {
    showNotification('更新失败: ' + (error.message || '未知错误'), 'error')
    console.error('更新用户资料失败:', error)
  } finally {
    isUpdating.value = false
  }
}

function handleAvatarUpdated() {
  showNotification('头像更新成功', 'success')
  closeModal()
}

function handleBackgroundUpdated(newBackground) {
  backgroundImage.value = newBackground
  showNotification('背景更新成功', 'success')
  closeModal()
}

// 处理账户注销
async function performLogout(password) {
  if (isDeleting.value) return

  isDeleting.value = true
  try {
    await authStore.deleteAccount(password)
    showNotification('账户已成功注销', 'success')
    await router.push('/auth')
  } catch (error) {
    showNotification('注销失败: ' + (error.message || '请检查密码'), 'error')
    console.error('注销账户失败:', error)
  } finally {
    isDeleting.value = false
    closeModal()
  }
}

// 显示通知消息
function showNotification(message, type = 'info') {
  if (notificationSystem.value) {
    notificationSystem.value.show(message, type)
  } else {
    console.warn('通知系统未初始化:', message)
  }
}
</script>

<style scoped>
.user-profile {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  /* 修改边距为居中 */
  min-height: 100vh;
  padding: 2rem;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  background-attachment: fixed;
  transition: background-image 0.5s ease;
  padding-top: calc(var(--header-height) + 1rem);
  z-index: 1;
  /* 移除 overflow: hidden */
}

.user-profile::before {
  content: '';
  position: fixed;
  /* 改回 fixed */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  /* 添加此行 */
  height: 100vh;
  /* 添加此行 */
  background-image: inherit;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  /* 添加此行 */
  z-index: -1;
  /* 移除 filter、transform 和其他模糊相关属性 */
}

/* 移除之前添加的 isolation 相关样式 */
.profile-card,
.articles-section {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.479);
  /* 降低不透明度 */
  backdrop-filter: blur(5px);
  /* 增加背景模糊效果 */
  -webkit-backdrop-filter: blur(5px);
}

.profile-card {
  background: rgba(255, 255, 255, 0.75);
  /* 降低不透明度 */
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  /* 更透明的边框 */
  padding: 2rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-card:hover {
  background: rgba(255, 255, 255, 0.85);
  /* 悬停时稍微不透明一些 */
  transform: translateY(-8px);
  box-shadow: 0 15px 45px rgba(31, 38, 135, 0.25);
}

.profile-title {
  color: var(--primary-color);
  font-size: 2rem;
  padding-bottom: 0.8rem;
  margin-bottom: 2rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.5px;
  position: relative;
  display: inline-block;
  width: 100%;
}

.profile-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #42b983, #3498db);
  border-radius: 2px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
  padding: 1.5rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(66, 185, 131, 0.1);
  border-radius: 50%;
  border-top-color: #42b983;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-container {
  color: #e74c3c;
}

.error-container a {
  color: #42b983;
  text-decoration: underline;
}

/* 新的加载动画样式 */
.loading-ripple {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}

.loading-ripple div {
  position: absolute;
  border: 4px solid var(--primary-color);
  opacity: 1;
  border-radius: 50%;
  animation: loading-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

.loading-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}

.loading-text {
  margin-top: 1rem;
  color: var(--primary-color);
  font-size: 1.1rem;
  font-weight: 500;
}

@keyframes loading-ripple {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 0;
  }

  4.9% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 0;
  }

  5% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }

  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}

/* 文章列表部分样式 */
.articles-section {
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.75);
  /* 降低不透明度 */
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  /* 更透明的边框 */
  padding: 2rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 在媒体查询中添加以下样式 */
@media (max-width: 768px) {
  .user-profile {
    padding: 1rem;
    padding-top: calc(var(--header-height) + 0.5rem);
    background-attachment: scroll;
    /* 移动端禁用固定背景 */
  }

  .user-profile::before {
    background-attachment: scroll;
  }

  .profile-card {
    padding: 1.5rem;
    margin-top: 1rem;
    z-index: 5;
  }

  .articles-section {
    padding: 1.5rem;
    margin-top: 1.5rem;
  }

  .section-title {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .user-profile {
    padding: 0.8rem;
  }

  .profile-card {
    padding: 1.2rem;
    border-radius: 15px;
  }
}
</style>