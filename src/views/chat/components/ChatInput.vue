<template>
  <form @submit.prevent="handleSubmit" class="input-form">
    <div class="textarea-container">
      <textarea
        v-model="inputValue"
        ref="textareaRef"
        :disabled="disabled"
        placeholder="输入消息...(Shift+Enter换行)"
        class="input-field"
        @keydown.enter.exact.prevent="handleEnter"
        @keydown.shift.enter.exact.prevent="insertNewline"
        @input="adjustHeight"
      ></textarea>
    </div>
    <button
      type="button"
      :class="['smart-button', { 'abort-mode': disabled }]"
      @click="handleClick"
    >
      {{ disabled ? '停止生成' : '发送消息' }}
    </button>
  </form>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'abort'])

const inputValue = ref('')
const textareaRef = ref(null)

const handleSubmit = () => {
  if (props.disabled || !inputValue.value.trim()) return
  emit('submit', inputValue.value.trim())
  inputValue.value = ''
  adjustHeight()
}

const handleClick = () => {
  if (props.disabled) {
    emit('abort')
  } else {
    handleSubmit()
  }
}

const handleEnter = () => {
  if (!props.disabled && inputValue.value.trim()) {
    handleSubmit()
  }
}

const insertNewline = () => {
  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  inputValue.value = inputValue.value.substring(0, start) + '\n' + inputValue.value.substring(end)
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 1
    adjustHeight()
  })
}

const adjustHeight = () => {
  nextTick(() => {
    const textarea = textareaRef.value
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  })
}
</script>

<style scoped>
.input-form {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  padding: 12px;
  background: white;
  border-radius: 12px;
  position: relative;
  z-index: 1;
}

.textarea-container {
  flex: 1;
  position: relative;
  min-width: 0; /* 防止文本框在flex布局中溢出 */
}

.input-field {
  width: 100%;
  min-height: 44px;
  max-height: 120px; /* 限制最大高度，避免在移动端占用过多空间 */
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  resize: none;
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 15px;
  line-height: 1.6;
  transition: all 0.2s ease;
  background: #f9fafb;
  overflow-y: auto;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field::placeholder {
  color: #9ca3af;
}

.smart-button {
  height: 44px;
  padding: 0 28px;
  border: none;
  border-radius: 12px;
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.3px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.smart-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.smart-button:active {
  transform: translateY(0);
}

.smart-button.abort-mode {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.smart-button.abort-mode:hover {
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

@media (max-width: 640px) {
  .input-form {
    flex-direction: column;
    gap: 12px;
    padding: 8px;
  }

  .input-field {
    min-height: 80px;
    font-size: 16px;
  }

  .smart-button {
    width: 100%;
    justify-content: center;
  }
}

.chat-input-container {
  position: relative;
  width: 100%;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease;
}

textarea {
  flex: 1;
  min-height: 44px;
  max-height: 200px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  transition: all 0.3s ease;
  background: transparent;
}

textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.button-group {
  display: flex;
  gap: 8px;
  padding-bottom: 8px;
}

.send-button, .abort-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.send-button {
  background: #667eea;
  color: white;
}

.send-button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.abort-button {
  background: #f56565;
  color: white;
}

.abort-button:hover:not(:disabled) {
  background: #e53e3e;
  transform: translateY(-1px);
}

.button-group button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 快捷键提示 */
.shortcut-hint {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 12px;
  color: #a0aec0;
  pointer-events: none;
  opacity: 0.7;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .input-wrapper {
    flex-direction: column;
    gap: 8px;
  }
  
  textarea {
    min-height: 80px;
    font-size: 16px; /* 防止iOS自动缩放 */
  }
  
  .button-group {
    width: 100%;
    padding-bottom: 0;
  }
  
  .send-button, .abort-button {
    flex: 1;
    justify-content: center;
  }
  
  .shortcut-hint {
    display: none;
  }
}

@media (max-width: 768px) {
  .input-form {
    padding: 8px;
    gap: 8px;
  }
  
  .input-field {
    min-height: 44px;
    max-height: 100px;
    font-size: 16px; /* 防止iOS自动缩放 */
    padding: 10px 12px;
  }
  
  .smart-button {
    height: 40px;
    padding: 0 16px;
    font-size: 14px;
  }
}
</style>