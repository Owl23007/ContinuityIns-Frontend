<template>
  <div class="user-profile" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <!-- 主内容区 -->
    <div class="profile-card">
      <h1 class="profile-title">个人主页</h1>
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      <template v-else-if="user">
        <div class="profile-section">
          <!-- 头像显示部分 -->
          <div class="avatar-container">
            <img :src="user.avatarImage || defaultAvatar" alt="用户头像" class="avatar" @error="handleAvatarError">
          </div>

          <div class="user-info">
            <h2 class="user-name">{{ user.nickname || user.username }}</h2>
            <div class="info-item">
              <i class="fas fa-user"></i>
              <span><strong>用户名：</strong>{{ user.username }}</span>
            </div>
            <div class="info-item" v-if="isOwnProfile">
              <i class="fas fa-envelope"></i>
              <span><strong>邮箱：</strong>{{ user.email }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-comment"></i>
              <span><strong>签名：</strong>{{ user.signature || '暂无签名' }}</span>
            </div>
          </div>
        </div>

        <!-- 仅在查看自己的主页时显示设置按钮 -->
        <profile-action-buttons v-if="isOwnProfile" :disabled="isUpdating || isDeleting"
          @edit-profile="openModal('profile')" @change-background="openModal('background')"
          @delete-account="openModal('logout')" @change-avatar="openModal('avatar')" />
      </template>
      <div v-else class="error-container">
        <i class="fas fa-exclamation-circle error-icon"></i>
        <p>获取用户信息失败，请<a @click="reloadUserInfo" href="javascript:void(0)">重试</a></p>
      </div>
    </div>

    <!-- 模态框容器 -->
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
  </div>
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

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationSystem = ref(null)

// State variables
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

// Watch for route param changes
watch(() => route.params.id, async (newId) => {
  if (newId && !isOwnProfile.value) {
    await fetchUserProfile(newId)
  } else if (!newId) {
    await authStore.fetchUserInfo()
  }
}, { immediate: true })

// Update local state from store or profile
function updateUserDataFromStore() {
  if (user.value) {
    formData.nickname = user.value.nickname || ''
    formData.signature = user.value.signature || ''
    backgroundImage.value = user.value.backgroundImage || defaultBackground
  }
}

// Reload user info
async function reloadUserInfo() {
  loading.value = true
  try {
    if (isOwnProfile.value) {
      await authStore.fetchUserInfo()
    } else if (route.params.id) {
      await fetchUserProfile(route.params.id)
    }
    updateUserDataFromStore()
  } catch (error) {
    showNotification('获取用户信息失败', 'error')
  } finally {
    loading.value = false
  }
}

// Handle avatar load error
function handleAvatarError(e) {
  e.target.src = defaultAvatar
}

// Open modal
function openModal(type) {
  activeModal.value = type
}

// Close modal
function closeModal() {
  activeModal.value = null
}

// Update user profile
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

// Delete account
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

// Show notification
function showNotification(message, type = 'info') {
  notificationSystem.value.show(message, type)
}
</script>

<style scoped>
.user-profile {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  min-height: 100vh;
  padding: 2rem;
  background-size: cover;
  background-position: center;
  position: relative;
  background-attachment: fixed;
  transition: background-image 0.5s ease;
  background-color: rgba(var(--primary-color-rgb), 0.05);
}

.profile-card {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 2.5rem;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-top: 2rem;
  position: relative;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.2);
}

.profile-title {
  color: var(--primary-color);
  font-size: 2rem;
  border-bottom: 3px solid #42b983;
  padding-bottom: 0.8rem;
  margin-bottom: 2rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.5px;
  position: relative;
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

.profile-section {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin: 1.5rem 0;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.avatar-container {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
}

.avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  background-color: #f8f8f8;
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

.user-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 280px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.user-name {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(120deg, var(--primary-color), #3498db);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  text-align: center;
}

.info-item {
  margin: 1rem 0;
  font-size: 1.1rem;
  line-height: 1.5;
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateX(5px);
}

.info-item i {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #42b983, #3498db);
  border-radius: 8px;
  color: white;
  margin-right: 15px;
}

.info-item strong {
  color: var(--primary-color);
  margin-right: 8px;
  font-weight: 600;
}

.error-container {
  color: #e74c3c;
}

.error-container a {
  color: #42b983;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .user-profile {
    padding: 1rem;
  }

  .profile-card {
    padding: 1.5rem;
    margin-top: 1rem;
  }

  .profile-section {
    padding: 1rem;
  }

  .avatar {
    width: 140px;
    height: 140px;
  }

  .user-name {
    font-size: 1.5rem;
  }

  .info-item {
    padding: 0.6rem 0.8rem;
  }
}

@media (max-width: 480px) {
  .user-profile {
    padding: 1rem;
  }

  .profile-section {
    flex-direction: column;
    text-align: center;
  }

  .avatar-container {
    margin-bottom: 1rem;
  }

  .user-info {
    align-items: center;
    width: 100%;
  }

  .info-item {
    justify-content: center;
  }
}
</style>