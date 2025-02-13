<template>
  <div class="user-profile" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <!-- 主内容区 -->
    <div class="profile-card">
      <h1 class="profile-title">个人主页</h1>
      <template v-if="initialized && user">
        <div class="profile-section">
          <div class="avatar-container">
            <img :src="user.avatarImage || defaultAvatar" alt="用户头像" class="avatar" @error="handleAvatarError">
          </div>
          <div class="user-info">
            <p><strong>用户名：</strong>{{ user.username }}</p>
            <p><strong>昵称：</strong>{{ user.nickname || '暂无昵称' }}</p>
            <p><strong>邮箱：</strong>{{ user.email }}</p>
            <p><strong>签名：</strong>{{ user.signature || '暂无签名' }}</p>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="openModal('profile')">编辑资料</button>
          <button @click="openModal('avatar')">更换头像</button>
          <button @click="openModal('background')">更换背景</button>
          <button @click="openModal('logout')" class="danger">注销账户</button>
        </div>
      </template>
      <p v-else>加载中...</p>
    </div>

    <!-- 编辑资料模态框 -->
    <div v-if="activeModal === 'profile'" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>编辑资料</h2>
        <form @submit.prevent="handleProfileUpdate">
          <div class="form-group">
            <label>昵称：
              <input type="text" v-model="formData.nickname" required maxlength="20">
            </label>
            <span class="counter">{{ formData.nickname.length }}/20</span>
          </div>
          <div class="form-group">
            <label>个性签名：
              <textarea v-model="formData.signature" maxlength="100"></textarea>
            </label>
            <span class="counter">{{ formData.signature.length }}/100</span>
          </div>
          <button type="submit" :disabled="isUpdating">
            {{ isUpdating ? '保存中...' : '保存更改' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 更换头像模态框 -->
    <div v-if="activeModal === 'avatar'" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>更换头像</h2>
        <div class="upload-options">
          <input type="file" accept="image/*" @change="handleFileUpload">
          <div class="url-upload">
            <input type="url" v-model="avatarUrl" placeholder="输入图片URL">
            <button @click="handleUrlSubmit">使用URL</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 注销确认模态框 -->
    <div v-if="activeModal === 'logout'" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>确认注销</h2>
        <div class="logout-confirm">
          <p>此操作将永久删除您的账户！</p>
          <input type="password" v-model="password" placeholder="请输入密码确认">
          <button @click="performLogout" :disabled="!password" class="danger">
            确认注销
          </button>
        </div>
      </div>
    </div>

    <!-- 更换背景模态框 -->
    <div v-if="activeModal === 'background'" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>更换背景</h2>
        <div class="upload-options">
          <input type="file" accept="image/*" @change="handleBackgroundUpload">
          <div class="url-upload">
            <input type="url" v-model="backgroundUrl" placeholder="输入背景图URL">
            <button @click="handleBackgroundUrlSubmit">使用URL</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, toRefs, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import defaultAvatar from '@/assets/image/default_avatar.png'
import defaultBackground from '@/assets/image/default_cover.jpg'

export default {
  setup() {
    const store = useStore()
    const router = useRouter()

    const state = reactive({
      activeModal: null,
      isUpdating: false,
      password: '',
      avatarUrl: '',
      backgroundUrl: '',
      formData: {
        nickname: '',
        signature: ''
      },
      backgroundImage: defaultBackground
    })

    const getOssConfig = async () => {
      // 获取 OSS 配置
      try {
        const res = await store.dispatch('getOssPolicy');
        return res;
      } catch (error) {
        alert('获取上传配置失败');
        throw error;
      }
    };

    const user = computed(() => store.state.user || {})
    const initialized = ref(false)

    onMounted(async () => {
      const res = await getOssConfig();
      console.log(res);
      if (!store.state.user) {
        await store.dispatch('fetchUserInfo')
      }
      initialized.value = true
      state.formData.nickname = user.value.nickname || ''
      state.formData.signature = user.value.signature || ''
      state.backgroundImage = user.value.backgroundImage || defaultBackground
    })

    const handleAvatarError = (e) => {
      e.target.src = defaultAvatar
    }

    const openModal = (type) => {
      state.activeModal = type
      console.log(state.activeModal)
    }

    const closeModal = () => {
      state.activeModal = null
      state.password = ''
      state.avatarUrl = ''
      state.backgroundUrl = ''
    }

    const validateImage = (file) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif']
      const maxSize = 2 * 1024 * 1024 // 2MB
      return validTypes.includes(file.type) && file.size <= maxSize
    }

    const handleProfileUpdate = async () => {
      try {
        state.isUpdating = true
        await store.dispatch('updateUserInfo', state.formData)
        state.user = store.state.user
        closeModal()
      } catch (error) {
        alert('更新失败')
      } finally {
        state.isUpdating = false
      }
    }

    const handleFileUpload = async (e) => {
      const file = e.target.files[0]
      if (!validateImage(file)) {
        alert('仅支持JPG/PNG格式，且小于2MB')
        return
      }

      try {
        state.isUpdating = true
        const formData = new FormData()
        formData.append('avatar', file)
        await store.dispatch('updateAvatar', formData)
        state.user = store.state.user
        closeModal()
      } catch (error) {
        alert('上传失败')
      } finally {
        state.isUpdating = false
      }
    }

    const handleUrlSubmit = async () => {
      try {
        state.isUpdating = true
        await store.dispatch('updateAvatar', { url: state.avatarUrl })
        state.user = store.state.user
        closeModal()
      } catch (error) {
        alert('URL更新失败')
      } finally {
        state.isUpdating = false
      }
    }

    const handleBackgroundUpload = async (e) => {
      const file = e.target.files[0]
      if (!validateImage(file)) {
        alert('仅支持JPG/PNG格式，且小于2MB')
        return
      }

      try {
        state.isUpdating = true
        const formData = new FormData()
        formData.append('background', file)
        await store.dispatch('updateBackground', formData)
        state.backgroundImage = URL.createObjectURL(file)
        state.user = store.state.user
        closeModal()
      } catch (error) {
        alert('上传失败')
      } finally {
        state.isUpdating = false
      }
    }

    const handleBackgroundUrlSubmit = async () => {
      try {
        state.isUpdating = true
        await store.dispatch('updateBackground', { url: state.backgroundUrl })
        state.backgroundImage = state.backgroundUrl
        state.user = store.state.user
        closeModal()
      } catch (error) {
        alert('URL更新失败')
      } finally {
        state.isUpdating = false
      }
    }

    const performLogout = async () => {
      try {
        await store.dispatch('deleteAccount', state.password)
        router.push('/home')
      } catch (error) {
        alert('注销失败，请检查密码')
        console.error(error)  
      }
    }

    return {
      ...toRefs(state),
      defaultAvatar,
      handleAvatarError,
      openModal,
      closeModal,
      handleProfileUpdate,
      handleFileUpload,
      handleUrlSubmit,
      handleBackgroundUpload,
      handleBackgroundUrlSubmit,
      performLogout,
      user,
      initialized,
    }
  }
}
</script>

<style scoped>
.user-profile {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  background-size: cover;
  background-position: center;
  position: relative;
}

.profile-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.profile-title {
  color: #333;
  border-bottom: 2px solid #42b983;
  padding-bottom: 1rem;
}

.profile-section {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

button:hover {
  background: #35a78c;
}

button.danger {
  background: #ff4444;
}

button.danger:hover {
  background: #d63f3f;
}

.modal {
  z-index:1001;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  z-index: 10000; /* 调整 z-index */
  background: white;
  padding: 2rem;
  border-radius: 8px;
  position: relative;
  max-width: 500px;
  width: 90%;
}

.close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  cursor: pointer;
}

.form-group {
  margin: 1rem 0;
}

.counter {
  display: block;
  text-align: right;
  font-size: 0.8rem;
  color: #666;
}

.upload-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.url-upload {
  display: flex;
  gap: 0.5rem;
}

input[type="file"] {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

@media (max-width: 768px) {
  .profile-section {
    flex-direction: column;
    align-items: center;
  }

  .avatar-container {
    margin-bottom: 1rem;
  }
}
</style>


