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
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.input-container {
  position: relative;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border 0.3s;
}

input:focus,
textarea:focus {
  border-color: #42b983;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.char-counter {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  font-size: 0.8rem;
  color: #999;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.submit-btn {
  background: #42b983;
  color: white;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.submit-btn:hover {
  background: #3aa876;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
