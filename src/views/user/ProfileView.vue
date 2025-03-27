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
            <img 
              :src="user.avatarImage || defaultAvatar" 
              alt="用户头像" 
              class="avatar" 
              @error="handleAvatarError">
          </div>
          
          <div class="user-info">
            <h2 class="user-name">{{ user.nickname || user.username }}</h2>
            <div class="info-item">
              <i class="fas fa-user"></i>
              <span><strong>用户名：</strong>{{ user.username }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-envelope"></i>
              <span><strong>邮箱：</strong>{{ user.email }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-comment"></i>
              <span><strong>签名：</strong>{{ user.signature || '暂无签名' }}</span>
            </div>
          </div>
        </div>

        <!-- 使用更新后的设置按钮组件 -->
        <profile-action-buttons 
          :disabled="isUpdating || isDeleting"
          @edit-profile="openModal('profile')" 
          @change-background="openModal('background')"
          @delete-account="openModal('logout')" 
          @change-avatar="openModal('avatar')" 
        />
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
      <modal-dialog v-if="activeModal === 'avatar'" title="更换头像" @close="closeModal">
        <avatar-uploader @avatar-updated="handleAvatarUpdated" @cancel="closeModal" :is-submitting="isUpdating" />
      </modal-dialog>

      <!-- 背景上传模态框 -->
      <modal-dialog v-if="activeModal === 'background'" title="更换背景" @close="closeModal">
        <background-uploader @background-updated="handleBackgroundUpdated" @cancel="closeModal"
          :is-submitting="isUpdating" />
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import defaultAvatar from '@/assets/image/default_avatar.png'
import defaultBackground from '@/assets/image/default_cover.jpg'

// Import components
import ModalDialog from '@/views/user/components/ModalDialog.vue'
import ProfileForm from '@/views/user/components/ProfileForm.vue'
import AvatarUploader from '@/views/user/components/AvatarUploader.vue'
import BackgroundUploader from '@/views/user/components/BackgroundUploader.vue'
import AccountDeleteConfirm from '@/views/user/components/AccountDeleteConfirm.vue'
import NotificationSystem from '@/components/common/NotificationSystem.vue'
import ProfileActionButtons from '@/views/user/components/ProfileActionButtons.vue'

const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()
const notificationSystem = ref(null)

// State variables
const loading = ref(true)
const user = computed(() => authStore.currentUser)
const activeModal = ref(null)
const isUpdating = ref(false)
const isDeleting = ref(false)
const backgroundImage = ref(defaultBackground)
const formData = reactive({
  nickname: '',
  signature: ''
})

// Initialize
onMounted(async () => {
  try {
    loading.value = true
    await authStore.fetchUserInfo()
    updateUserDataFromStore()
    // Pre-fetch OSS upload policy
    await userStore.getOssPolicy()
  } catch (error) {
    showNotification('获取用户信息失败', 'error')
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
})

// Watch for user data changes
watch(() => user.value, (newUser) => {
  if (newUser) {
    updateUserDataFromStore()
  }
}, { deep: true })

// Update local state from store
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
    await authStore.fetchUserInfo()
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

// Handle avatar update complete
function handleAvatarUpdated() {
  showNotification('头像更新成功', 'success')
  closeModal()
}

// Handle background update complete
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
    await userStore.deleteAccount(password)
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
  /* 增加最大宽度 */
  width: 100%;
  margin: 0 auto;
  /* 居中显示 */
  min-height: 100vh;
  /* 从90vh改为100vh，占满整个视口高度 */
  padding: 2rem;
  background-size: cover;
  background-position: center;
  position: relative;
  background-attachment: fixed;
  transition: background-image 0.5s ease;
}

.profile-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 15px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
  /* 增强阴影效果 */
  padding: 2.5rem;
  /* 稍微减小内边距 */
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  margin-top: 2rem;
  /* 添加顶部边距 */
}

.profile-title {
  color: #2c3e50;
  font-size: 2rem;
  /* 略微减小字号 */
  border-bottom: 3px solid #42b983;
  padding-bottom: 0.8rem;
  margin-bottom: 2rem;
  /* 减小底部边距 */
  font-weight: 600;
  text-align: center;
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
  border: 5px solid rgba(66, 185, 131, 0.2);
  border-radius: 50%;
  border-top-color: #42b983;
  animation: spin 1s ease-in-out infinite;
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
  /* 允许在小屏幕上换行 */
  gap: 2rem;
  margin: 1.5rem 0;
  align-items: center;
  justify-content: center;
  /* 居中显示 */
}

/* 更新头像样式 */
.avatar-container {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  background-color: #f8f8f8;
}

.user-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 280px;
  /* 确保在移动设备上有足够宽度 */
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.user-name {
  font-size: 1.7rem;
  margin-bottom: 1.2rem;
  color: #2c3e50;
  border-bottom: 2px dashed #ddd;
  padding-bottom: 0.5rem;
  text-align: center;
}

.info-item {
  margin: 0.6rem 0;
  font-size: 1.1rem;
  line-height: 1.5;
  display: flex;
  align-items: center;
  padding: 0.4rem 0;
}

.info-item i {
  width: 25px;
  color: #42b983;
  margin-right: 10px;
}

.error-container {
  color: #e74c3c;
}

.error-container a {
  color: #42b983;
  text-decoration: underline;
}

/* 添加响应式设计 */
@media (max-width: 768px) {
  .profile-card {
    padding: 1.5rem;
  }

  .avatar {
    width: 130px;
    height: 130px;
    border-width: 4px;
  }

  .profile-title {
    font-size: 1.7rem;
  }

  .user-name {
    font-size: 1.5rem;
  }

  .user-info {
    padding: 1rem;
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