<template>
  <div class="profile-actions">


    <!-- 操作按钮部分 -->
    <div class="action-buttons">
      <button @click="$emit('change-avatar')" class="primary-btn" :disabled="disabled">
        <i class="fas fa-camera"></i> 更换头像
      </button>
      <button @click="$emit('edit-profile')" class="primary-btn" :disabled="disabled">
        <i class="fas fa-edit"></i> 编辑资料
      </button>
      <button @click="$emit('change-background')" class="primary-btn" :disabled="disabled">
        <i class="fas fa-image"></i> 更换背景
      </button>
      <button @click="$emit('delete-account')" class="danger-btn" :disabled="disabled">
        <i class="fas fa-user-times"></i> 注销账户
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import defaultAvatar from '@/assets/image/default_avatar.png';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  avatarSrc: {
    type: String,
    default: ''
  }
});

defineEmits(['edit-profile', 'change-background', 'delete-account', 'change-avatar']);

// 处理头像加载错误
function handleAvatarError(e) {
  e.target.src = defaultAvatar;
}
</script>

<style scoped>
.profile-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-top: 1.5rem;
}

/* 头像部分样式 */
.avatar-container {
  position: relative;
  margin-bottom: 0.5rem;
}

.avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid #fff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

/* 按钮部分样式 */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  width: 100%;
}

.primary-btn {
  background: linear-gradient(135deg, #42b983 0%, #38a571 100%);
  color: white;
  padding: 0.8rem 1.6rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.2);
}

.primary-btn i {
  margin-right: 8px;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #38a571 0%, #2d8a5f 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(66, 185, 131, 0.3);
}

.danger-btn {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  padding: 0.8rem 1.6rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.2);
}

.danger-btn i {
  margin-right: 8px;
}

.danger-btn:hover {
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 添加响应式设计 */
@media (max-width: 768px) {
  .avatar {
    width: 140px;
    height: 140px;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .primary-btn, .danger-btn {
    width: 100%;
  }
}
</style>
