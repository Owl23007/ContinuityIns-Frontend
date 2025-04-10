<template>
  <div class="profile-actions">
    <!-- 操作按钮部分 -->
    <div class="action-buttons">
      <button class="primary-btn" @click="$emit('edit-profile')" :disabled="disabled">
        <i class="fas fa-edit"></i>
        编辑资料
      </button>

      <button class="primary-btn" @click="$emit('change-avatar')" :disabled="disabled">
        <i class="fas fa-camera"></i>
        更换头像
      </button>

      <button class="primary-btn" @click="$emit('change-background')" :disabled="disabled">
        <i class="fas fa-image"></i>
        更换背景
      </button>

      <button class="danger-btn" @click="$emit('delete-account')" :disabled="disabled">
        <i class="fas fa-trash-alt"></i>
        注销账户
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['edit-profile', 'change-background', 'delete-account', 'change-avatar']);
</script>

<style scoped>
.profile-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-top: 2.5rem;
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
  gap: 1.2rem;
  justify-content: center;
  width: 100%;
  padding: 0 1rem;
}

.primary-btn,
.danger-btn {
  position: relative;
  padding: 0.9rem 1.8rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  overflow: hidden;
}

.primary-btn {
  background: linear-gradient(135deg, #42b983 0%, #3498db 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.2);
}

.primary-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent);
  transition: 0.5s;
}

.primary-btn:hover::before {
  left: 100%;
}

.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(66, 185, 131, 0.3);
}

.primary-btn:active {
  transform: translateY(-1px);
}

.danger-btn {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.2);
}

.danger-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent);
  transition: 0.5s;
}

.danger-btn:hover::before {
  left: 100%;
}

.danger-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);
}

.danger-btn:active {
  transform: translateY(-1px);
}

.primary-btn i,
.danger-btn i {
  margin-right: 8px;
  font-size: 1.1rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

button:disabled::before {
  display: none;
}

/* 添加响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 1rem;
    padding: 0 0.5rem;
  }

  .primary-btn,
  .danger-btn {
    width: 100%;
    padding: 0.8rem 1.5rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .primary-btn,
  .danger-btn {
    width: 100%;
  }
}
</style>
