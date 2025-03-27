<template>
  <div class="message" :class="[role, { loading }]">
    <div class="message-content">
      <div v-if="loading" class="loading-animation">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <div v-else>
        <!-- 思考过程部分 -->
        <div v-if="reasoning" class="reasoning-section">
          <div class="reasoning-header" @click="toggleReasoning">
            <div class="header-left">
              <span>思考过程</span>
              <span v-if="!isThinking && reasoningTime" class="reasoning-time">
                {{ reasoningTime }}
              </span>
            </div>
            <div class="header-right">
              <div v-if="isThinking" class="thinking-indicator">
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
              </div>
              <svg 
                v-else
                class="arrow-icon" 
                :class="{ expanded: isReasoningExpanded }"
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
          <div 
            class="reasoning-content" 
            :class="{ expanded: isReasoningExpanded || isThinking }"
          >
            <div class="markdown-body" v-html="renderedReasoning"></div>
          </div>
        </div>

        <!-- 主要内容部分 -->
        <div class="markdown-body" v-html="renderedContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps({
  role: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  reasoning: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const isReasoningExpanded = ref(false)
const isThinking = ref(false)
const reasoningTime = ref('')
const reasoningStartTime = ref(null)

const toggleReasoning = () => {
  if (!isThinking.value) {
    isReasoningExpanded.value = !isReasoningExpanded.value
  }
}

const calculateThinkingTime = () => {
  if (!reasoningStartTime.value) return
  const duration = Date.now() - reasoningStartTime.value
  if (duration < 1000) {
    reasoningTime.value = '思考时间: <1秒'
  } else {
    reasoningTime.value = `思考时间: ${Math.round(duration / 1000)}秒`
  }
}

// 监听reasoning的变化
watch(() => props.reasoning, (newVal, oldVal) => {
  // 开始有新的思考内容
  if (newVal && !oldVal) {
    reasoningStartTime.value = Date.now()
    isThinking.value = true
    reasoningTime.value = ''  // 清除之前的思考时间
  }
  // 思考完成
  if (newVal && oldVal && newVal !== oldVal && !newVal.endsWith('...')) {
    isThinking.value = false
    calculateThinkingTime()
  }
}, { immediate: true })

const renderedContent = computed(() => renderMarkdown(props.content))
const renderedReasoning = computed(() => renderMarkdown(props.reasoning))
</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 24px;
  opacity: 0;
  transform: translateY(20px);
  animation: messageIn 0.3s ease forwards;
}

@keyframes messageIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-content {
  flex: 1;
  padding: 12px 16px;
  background: v-bind(messageBackground);
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.message-content:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: dotPulse 1.5s infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 60%, 100% { transform: scale(1); opacity: 0.4; }
  30% { transform: scale(1.2); opacity: 1; }
}

.reasoning-toggle {
  position: absolute;
  bottom: -24px;
  right: 0;
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s ease;
}

.message-content:hover .reasoning-toggle {
  opacity: 1;
}

.reasoning {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  font-size: 0.9em;
  color: #666;
  opacity: 0;
  transform: translateY(-10px);
  animation: reasoningIn 0.3s ease forwards;
}

@keyframes reasoningIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .message {
    margin-bottom: 16px;
  }
  
  .message-content {
    padding: 10px 14px;
  }
  
  .reasoning-toggle {
    opacity: 1;
    font-size: 11px;
  }
}

.message {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message.assistant {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.message.user {
  background: white;
  border: 1px solid #e2e8f0;
}

.loading-animation {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  justify-content: center;
}

.dot {
  width: 8px;
  height: 8px;
  background: #94a3b8;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
}

.reasoning-section {
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden; /* 确保内容不会溢出 */
}

.reasoning-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  cursor: pointer;
  color: #64748b;
  font-size: 0.9rem;
  user-select: none;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.reasoning-header:hover {
  background: #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reasoning-time {
  color: #94a3b8;
  font-size: 0.8rem;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.arrow-icon.expanded {
  transform: rotate(180deg);
}

.reasoning-content {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out, opacity 0.2s ease-out;
  padding: 0;
  margin: 0;
  border-top: 0;
  will-change: max-height;
}

.reasoning-content.expanded {
  max-height: 2000px; /* 设置一个较大的最大高度 */
  opacity: 1;
  padding: 1rem;
  margin-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.thinking-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.thinking-dot {
  width: 4px;
  height: 4px;
  background: #94a3b8;
  border-radius: 50%;
  animation: thinking 1.4s infinite ease-in-out;
}

.thinking-dot:nth-child(1) { animation-delay: -0.32s; }
.thinking-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes thinking {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

:deep(.markdown-body) {
  font-size: 14px;
  line-height: 1.6;
}
</style>