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
        <!-- 修改个人信息标题区域 -->
        <div class="tab-header">
          <div class="header-left">
            <h2 class="section-title">
              <span class="title-icon">👤</span>
              个人信息
            </h2>
            <!-- 用户信息操作按钮 -->
            <div class="header-actions">
              <el-dropdown v-if="isOwnProfile" trigger="click" placement="bottom-end">
                <button class="settings-btn">
                  <el-icon>
                    <Setting />
                  </el-icon>
                  设置
                </button>
                <template #dropdown>
                  <el-dropdown-menu class="user-dropdown-menu">
                    <el-dropdown-item @click="openModal('profile')" class="dropdown-item">
                      <el-icon>
                        <Edit />
                      </el-icon> 编辑资料
                    </el-dropdown-item>
                    <el-dropdown-item @click="openModal('avatar')" class="dropdown-item">
                      <el-icon>
                        <Camera />
                      </el-icon> 更换头像
                    </el-dropdown-item>
                    <el-dropdown-item @click="openModal('background')" class="dropdown-item">
                      <el-icon>
                        <Picture />
                      </el-icon> 更换背景
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="openModal('logout')" class="dropdown-item danger-item">
                      <el-icon>
                        <UserFilled />
                      </el-icon> 注销账户
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <button v-else class="follow-btn" :class="{ 'is-following': isFollowing }" @click="handleFollow">
                <el-icon>
                  <template v-if="isFollowing">
                    <Check />
                  </template>
                  <template v-else>
                    <Plus />
                  </template>
                </el-icon>
                {{ isFollowing ? '已关注' : '关注' }}
              </button>
            </div>
          </div>
          <div class="section-divider"></div>
        </div>

        <user-info-card :user="user" :is-own-profile="isOwnProfile" :default-avatar="defaultAvatar"
          :is-updating="isUpdating" :is-deleting="isDeleting" @avatar-error="handleAvatarError"
          @edit-profile="openModal('profile')" @change-avatar="openModal('avatar')"
          @change-background="openModal('background')" @delete-account="openModal('logout')" />
      </template>

      <!-- 错误状态 -->
      <div v-else class="error-container">
        <i class="fas fa-exclamation-circle error-icon"></i>
        <p>获取用户信息失败，请<a @click="reloadUserInfo" href="javascript:void(0)">重试</a></p>
      </div>
    </section>

    <!-- 文章列表部分 -->
    <section v-if="user" class="articles-section">
      <div class="tab-header">
        <div class="header-left">
          <h2 class="section-title">
            <span class="title-icon">📝</span>
            {{ isOwnProfile ? '我的文章' : '发布的文章' }}
          </h2>
          <router-link :to="{
            name: 'articleList',
            query: { userId: route.params.id || user.id }
          }" class="view-all-btn">
            查看全部
            <el-icon>
              <ArrowRight />
            </el-icon>
          </router-link>
        </div>
        <div class="section-divider"></div>
      </div>
      <profile-articles :user-id="route.params.id || user.id" :is-own-profile="isOwnProfile" />
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
import { ArrowRight, Setting, Edit, Camera, Picture, UserFilled, Check, Plus } from '@element-plus/icons-vue'
import defaultAvatar from '@/assets/image/default_avatar.png'
import defaultBackground from '@/assets/image/default_cover.jpg'

import ModalDialog from '@/views/user/components/modal/modal-dialog.vue'
import ProfileForm from '@/views/user/components/modal/profile-from.vue'
import AvatarUploader from '@/views/user/components/modal/avatar-uploader.vue'
import BackgroundUploader from '@/views/user/components/modal/background-uploader.vue'
import AccountDeleteConfirm from '@/views/user/components/modal/delete-confirm-modal.vue'
import NotificationSystem from '@/components/common/NotificationSystem.vue'
import ProfileArticles from './components/article-list.vue'
import UserInfoCard from './components/card/userinfo-card.vue'

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
  return !route.params.id || authStore.user?.userId === Number(route.params.id)
})

// 获取要显示的用户信息
const user = computed(() => {
  return isOwnProfile.value ? authStore.user : profileUser.value
})

// 获取指定用户信息
const fetchUserProfile = async (userId) => {
  if (!userId) {
    showNotification('缺少用户ID参数', 'error')
    router.push('/404')
    return
  }

  try {
    loading.value = true
    const numericUserId = parseInt(userId, 10)
    if (isNaN(numericUserId)) {
      throw new Error('无效的用户ID')
    }

    const response = await getUserById_get(numericUserId)
    if (!response || response.code !== 0) {
      throw new Error(response?.message || '获取用户信息失败')
    }

    if (!response.data) {
      throw new Error('用户不存在')
    }

    profileUser.value = response.data
    updateUserDataFromStore()
  } catch (error) {
    console.error('获取用户信息失败:', error)
    showNotification(error.message || '获取用户信息失败', 'error')
    profileUser.value = null

    if (error.response?.status === 404 || error.message === '用户不存在') {
      router.push('/404')
    }
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
watch(() => route.params.id, async (newId, oldId) => {
  if (newId === oldId) return

  if (newId) {
    // 验证ID是否为有效数字
    const numericId = parseInt(newId, 10)
    if (isNaN(numericId)) {
      router.push('/404')
      return
    }

    if (!isOwnProfile.value) {
      await fetchUserProfile(numericId)
    }
  } else if (!newId && authStore.isAuthenticated) {
    await authStore.fetchUserInfo()
    updateUserDataFromStore()
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

// 添加关注状态
const isFollowing = ref(false)

// 添加关注处理函数
const handleFollow = async () => {
  if (!user.value?.id) {
    showNotification('用户信息不完整', 'error')
    return
  }

  try {
    isFollowing.value = !isFollowing.value
    // TODO: 调用关注/取消关注的 API
    showNotification(isFollowing.value ? '关注成功' : '已取消关注', 'success')
  } catch (error) {
    isFollowing.value = !isFollowing.value // 恢复状态
    showNotification(error.message || '操作失败', 'error')
  }
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
  background-attachment: fixed;
  transition: background-image 0.5s ease;
  padding-top: calc(var(--header-height) + 1rem);
  position: relative;
  z-index: 1;
}

.user-profile::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-image: inherit;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: -1;
}

.profile-card,
.articles-section {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.profile-card {
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.profile-title {
  color: var(--primary-color);
  font-size: 2rem;
  padding-bottom: 0.8rem;
  margin-bottom: 2rem;
  font-weight: 600;
  text-align: center;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
  padding: 1rem;
}

.error-container {
  color: #e74c3c;
}

.error-container a {
  color: #42b983;
  text-decoration: underline;
}

/* 加载动画样式 */
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
  margin-top: 0.5rem;
  /* 减小上边距 */
  border-radius: 12px;
  padding: 1.5rem;
}

.articles-grid {
  gap: 0.75rem;
  /* 减小卡片之间的间距 */
}

.tab-header {
  margin-bottom: 1rem;
  /* 减少下边距 */
}

.section-title {
  font-size: 1.4rem;
  /* 稍微减小字体大小 */
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  /* 减少下边距 */
  display: flex;
  align-items: center;
  gap: 0.3rem;
  /* 减少图标和文字的间距 */
}

.title-icon {
  font-size: 1.3rem;
  /* 调整图标大小 */
}

.section-divider {
  height: 1.5px;
  /* 减小分隔线高度 */
  background: linear-gradient(90deg, var(--primary-color) 0%, rgba(var(--primary-color-rgb), 0.1) 100%);
  margin-bottom: 1rem;
  /* 减少下边距 */
}

.header-left {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  /* 减少下边距 */
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  width: 100%;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0;
  /* 移除底部间距 */
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.1);
}

.view-all-btn i {
  font-size: 0.8rem;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .user-profile {
    padding: 1rem;
    padding-top: calc(var(--header-height) + 0.5rem);
    background-attachment: scroll;
  }

  .user-profile::before {
    background-attachment: scroll;
  }

  .profile-card,
  .articles-section {
    padding: 1.25rem;
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
    padding: 1rem;
    border-radius: 10px;
  }
}

.profile-actions {
  display: none;
}

.follow-btn,
.settings-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.follow-btn {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
}

.follow-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
}

.follow-btn.is-following {
  background: #f3f4f6;
  color: #4b5563;
}

.follow-btn.is-following:hover {
  background: #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-btn {
  background: #f3f4f6;
  color: #4b5563;
}

.settings-btn:hover {
  background: #e5e7eb;
}
</style>