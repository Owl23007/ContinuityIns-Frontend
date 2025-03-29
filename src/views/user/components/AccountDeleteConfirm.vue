<template>
  <div class="account-delete-confirm delete-confirm">
    <div class="warning">
      <i class="warning-icon">⚠️</i>
      <div class="warning-text">
        <h4>此操作不可逆</h4>
        <p>注销后，您的所有个人数据将被永久删除，无法恢复。</p>
      </div>
    </div>
    
    <div class="form-group password-input">
      <label for="confirm-password">请输入密码确认操作</label>
      <input
        id="confirm-password"
        v-model="password"
        type="password"
        placeholder="输入您的登录密码"
        :disabled="isSubmitting"
      >
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
    
    <div class="confirm-text notice-text">
      <label>
        <input type="checkbox" v-model="confirmed" :disabled="isSubmitting">
        我确认注销此账户
      </label>
    </div>
    
    <div class="form-actions actions">
      <button type="button" class="cancel-btn" @click="$emit('cancel')" :disabled="isSubmitting">
        取消
      </button>
      <button 
        type="button" 
        class="danger-btn confirm-btn" 
        @click="handleDelete" 
        :disabled="!canDelete || isSubmitting"
      >
        <span v-if="isSubmitting" class="loader"></span>
        <span v-else>{{ '注销账户' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['delete-account', 'cancel']);

const password = ref('');
const confirmed = ref(false);
const error = ref('');

const canDelete = computed(() => {
  return password.value.length > 0 && confirmed.value;
});

function handleDelete() {
  if (!canDelete.value || props.isSubmitting) return;
  
  error.value = '';
  if (password.value.length < 6) {
    error.value = '密码格式不正确';
    return;
  }
  
  emit('delete-account', password.value);
}
</script>

<style scoped>
.account-delete-confirm {
  width: 100%;
}

.warning {
  display: flex;
  align-items: flex-start;
  background-color: #fff3f3;
  border: 1px solid #ffcccc;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.warning-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  color: #e74c3c;
  animation: pulse 2s infinite;
}

.warning-text {
  text-align: center;
  color: #e74c3c;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.notice-text {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 10px;
  border-left: 4px solid #e74c3c;
}

.password-input {
  margin-bottom: 2rem;
}

.password-input label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.password-input input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid rgba(203, 213, 225, 0.4);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.password-input input:focus {
  outline: none;
  border-color: #e74c3c;
  box-shadow: 0 0 0 4px rgba(231, 76, 60, 0.1);
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 0.8rem 1.6rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cancel-btn {
  background: transparent;
  color: var(--text-secondary);
  border: 2px solid rgba(203, 213, 225, 0.4);
}

.cancel-btn:hover {
  background: rgba(203, 213, 225, 0.2);
  border-color: rgba(203, 213, 225, 0.6);
}

.confirm-btn {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.confirm-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: 0.5s;
}

.confirm-btn:hover::before {
  left: 100%;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.confirm-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .confirm-btn {
    width: 100%;
  }

  .warning-icon {
    width: 48px;
    height: 48px;
  }
}
</style>
