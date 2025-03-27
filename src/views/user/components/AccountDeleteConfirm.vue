<template>
  <div class="account-delete-confirm">
    <div class="warning">
      <i class="warning-icon">⚠️</i>
      <div class="warning-text">
        <h4>此操作不可逆</h4>
        <p>注销后，您的所有个人数据将被永久删除，无法恢复。</p>
      </div>
    </div>
    
    <div class="form-group">
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
    
    <div class="confirm-text">
      <label>
        <input type="checkbox" v-model="confirmed" :disabled="isSubmitting">
        我确认注销此账户
      </label>
    </div>
    
    <div class="form-actions">
      <button type="button" class="cancel-btn" @click="$emit('cancel')" :disabled="isSubmitting">
        取消
      </button>
      <button 
        type="button" 
        class="danger-btn" 
        @click="handleDelete" 
        :disabled="!canDelete || isSubmitting"
      >
        {{ isSubmitting ? '正在注销...' : '注销账户' }}
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
  font-size: 1.5rem;
  margin-right: 1rem;
}

.warning-text h4 {
  margin: 0 0 0.5rem 0;
  color: #e74c3c;
}

.warning-text p {
  margin: 0;
  color: #555;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

input[type="password"]:focus {
  outline: none;
  border-color: #e74c3c;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

.confirm-text {
  margin-bottom: 2rem;
}

.confirm-text label {
  display: flex;
  align-items: center;
  font-weight: normal;
}

input[type="checkbox"] {
  margin-right: 0.5rem;
}

.error-message {
  color: #e74c3c;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-btn {
  background-color: #f2f2f2;
  color: #666;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #e6e6e6;
}

.danger-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.danger-btn:hover:not(:disabled) {
  background-color: #c0392b;
}

.danger-btn:disabled {
  background-color: #f5aea6;
  cursor: not-allowed;
}
</style>
