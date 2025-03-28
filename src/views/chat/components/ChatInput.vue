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
        @keydown.up.prevent="showPreviousMessage"
        @keydown.down.prevent="showNextMessage"
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
const messageHistory = ref([])
const currentHistoryIndex = ref(-1)
const tempInput = ref('') // 存储未发送的输入

const handleSubmit = () => {
  if (props.disabled || !inputValue.value.trim()) return
  
  // 添加到历史记录
  messageHistory.value.unshift(inputValue.value.trim())
  // 限制历史记录数量，防止占用过多内存
  if (messageHistory.value.length > 50) {
    messageHistory.value.pop()
  }
  
  emit('submit', inputValue.value.trim())
  inputValue.value = ''
  currentHistoryIndex.value = -1 // 重置历史记录索引
  tempInput.value = '' // 清空临时输入
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

const scrollToMessage = (index) => {
  const messages = document.querySelectorAll('.message')
  if (messages && messages.length > 0) {
    // 计算需要滚动到的消息的位置
    // 用户消息在数组中是交替出现的，所以索引需要乘2
    const targetIndex = messages.length - 1 - (index * 2)
    if (targetIndex >= 0 && messages[targetIndex]) {
      messages[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}

const showPreviousMessage = () => {
  if (messageHistory.value.length === 0) return
  
  if (currentHistoryIndex.value === -1) {
    // 保存当前未发送的输入
    tempInput.value = inputValue.value
  }
  
  currentHistoryIndex.value = Math.min(
    currentHistoryIndex.value + 1,
    messageHistory.value.length - 1
  )
  
  inputValue.value = messageHistory.value[currentHistoryIndex.value]
  nextTick(() => {
    adjustHeight()
    // 将光标移动到末尾
    const textarea = textareaRef.value
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length
    // 滚动到对应的消息
    scrollToMessage(currentHistoryIndex.value)
  })
}

const showNextMessage = () => {
  if (currentHistoryIndex.value === -1) return
  
  currentHistoryIndex.value--
  
  if (currentHistoryIndex.value === -1) {
    // 恢复未发送的输入
    inputValue.value = tempInput.value
  } else {
    inputValue.value = messageHistory.value[currentHistoryIndex.value]
  }
  
  nextTick(() => {
    adjustHeight()
    // 将光标移动到末尾
    const textarea = textareaRef.value
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length
    // 如果不是恢复到编辑状态，滚动到对应消息
    if (currentHistoryIndex.value !== -1) {
      scrollToMessage(currentHistoryIndex.value)
    }
  })
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
  padding: 0;
  position: relative;
  width: 100%;
}

.textarea-container {
  flex: 1;
  position: relative;
  min-width: 0;
}

.input-field {
  width: 100%;
  min-height: 44px;
  max-height: 200px;
  padding: 12px 16px;
  padding-right: 44px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  resize: none;
  font-size: 0.95rem;
  line-height: 1.5;
  background: rgba(var(--background-color-rgb), 0.6);
  color: var(--text-color);
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--secondary-color);
  background: rgba(var(--background-color-rgb), 0.8);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.smart-button {
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 10px;
  background: var(--secondary-color);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.smart-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.smart-button:active {
  transform: translateY(0);
}

.smart-button.abort-mode {
  background: #ef4444;
}

.smart-button.abort-mode:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .input-form {
    gap: 12px;
  }

  .input-field {
    font-size: 16px;
    padding: 10px 14px;
    padding-right: 40px;
    min-height: 40px;
  }

  .smart-button {
    height: 40px;
    padding: 0 16px;
    font-size: 0.9rem;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .input-field {
    background: rgba(30, 41, 59, 0.6);
    border-color: rgba(51, 65, 85, 0.8);
  }

  .input-field:focus {
    background: rgba(30, 41, 59, 0.8);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  }
}
</style>