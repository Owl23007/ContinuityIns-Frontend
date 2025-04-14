<template>
  <form @submit.prevent="handleSubmit" class="profile-form">
    <div class="form-group">
      <label for="nickname">昵称</label>
      <div class="input-container">
        <input 
          id="nickname"
          type="text" 
          v-model="form.nickname" 
          maxlength="20"
          placeholder="请输入昵称">
        <span class="char-counter">{{ form.nickname.length }}/20</span>
      </div>
    </div>
    
    <div class="form-group">
      <label for="signature">个性签名</label>
      <div class="input-container">
        <textarea 
          id="signature"
          v-model="form.signature" 
          maxlength="100"
          placeholder="写点什么吧..."></textarea>
        <span class="char-counter">{{ form.signature.length }}/100</span>
      </div>
    </div>
    
    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="cancel-btn">取消</button>
      <button type="submit" class="submit-btn" :disabled="isSubmitting || !hasChanges">
        {{ isSubmitting ? '保存中...' : '保存' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed } from 'vue';

const props = defineProps({
  nickname: {
    type: String,
    default: ''
  },
  signature: {
    type: String,
    default: ''
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['update', 'cancel']);

const form = reactive({
  nickname: props.nickname,
  signature: props.signature
});

const hasChanges = computed(() => {
  return form.nickname !== props.nickname || form.signature !== props.signature;
});

function handleSubmit() {
  if (!hasChanges.value || props.isSubmitting) return;
  
  emits('update', {
    nickname: form.nickname.trim(),
    signature: form.signature.trim()
  });
}
</script>

<style scoped>
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid rgba(203, 213, 225, 0.4);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  transition: all 0.3s ease;
  color: var(--text-primary);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b983;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(66, 185, 131, 0.1);
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.char-counter {
  position: absolute;
  right: 0.5rem;
  bottom: -1.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.char-counter.limit {
  color: #e74c3c;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

.submit-btn,
.cancel-btn {
  padding: 0.8rem 1.6rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn {
  background: linear-gradient(135deg, #42b983 0%, #3498db 100%);
  color: white;
  min-width: 120px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(66, 185, 131, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column-reverse;
  }

  .submit-btn,
  .cancel-btn {
    width: 100%;
    padding: 0.7rem 1rem;
  }
}
</style>
