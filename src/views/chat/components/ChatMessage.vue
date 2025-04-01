<template>
  <div class="message" :class="[role, { loading }]">
    <div class="avatar">
      <img v-if="role === 'user'" :src="userAvatar" alt="用户头像" @error="handleAvatarError">
      <img v-else :src="botAvatar" alt="AI头像">
    </div>
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
import { ref, computed, watch, onMounted, onUpdated } from 'vue'
import { renderMarkdownWithCopy } from '@/utils/markdown'
import { initCodeCopy } from '@/utils/copy'
import defaultAvatar from '@/assets/image/default_avatar.png'
import botAvatar from '@/assets/image/ai-girl.png'
import { useAuthStore } from '@/stores/auth'

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

const authStore = useAuthStore()
const userAvatar = computed(() => authStore.userAvatar || defaultAvatar)

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

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

const renderedContent = computed(() => renderMarkdownWithCopy(props.content))
const renderedReasoning = computed(() => renderMarkdownWithCopy(props.reasoning))

// 在内容更新后初始化复制按钮功能
onMounted(() => {
  initCodeCopy()
})

onUpdated(() => {
  initCodeCopy()
})
</script>

<style scoped>
.message {
  display: flex;
  margin: 1.5rem auto;
  max-width: 900px; /* 限制最大宽度 */
  width: 100%;
  padding: 0 1rem;
  opacity: 0;
  transform: translateY(20px);
  animation: messageIn 0.3s ease forwards;
  gap: 1rem;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

@keyframes messageIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  flex: 1;
  padding: 1rem 1.25rem;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  position: relative;
  max-width: calc(100% - 4rem); /* 确保内容不会溢出 */
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message.assistant .message-content {
  background: rgba(247, 249, 252, 0.8);
  border-color: rgba(226, 232, 240, 0.8);
}

.message.user .message-content {
  background: rgba(var(--secondary-color-rgb), 0.1);
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

/* 优化思考过程区域的样式 */
.reasoning-section {
  margin-bottom: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
}

.reasoning-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  cursor: pointer;
  background: rgba(247, 249, 252, 0.8);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
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
  transition: all 0.3s ease-out;
  padding: 0 1rem;
}

.reasoning-content.expanded {
  max-height: 2000px;
  opacity: 1;
  padding: 1rem;
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

/* Markdown内容样式优化 */
:deep(.markdown-body) {
  font-size: 0.95rem;
  line-height: 1.7;
  overflow-wrap: break-word;
}

:deep(.markdown-body pre) {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(240, 242, 245, 0.8) !important; /* 更高对比度的背景色 */
  border: 1px solid rgba(226, 232, 240, 0.8);
}

:deep(.markdown-body code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  background: rgba(45, 55, 72, 0.06);
  color: #333; /* 确保亮色主题下代码文本颜色够深 */
}

/* 代码块内的代码颜色增强 */
:deep(.hljs) {
  color: #383a42 !important; /* 确保代码颜色够深 */
}

/* 代码块复制按钮样式改进 */
:deep(.code-block-wrapper) {
  position: relative;
}

:deep(.copy-btn) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.75rem;
}

:deep(.copy-btn::after) {
  content: "复制";
  display: inline-block;
}

:deep(.code-block-wrapper:hover .copy-btn) {
  opacity: 1;
}

:deep(.copy-btn:hover) {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

:deep(.copy-btn:active) {
  transform: translateY(0);
}

:deep(.copy-btn.copied) {
  background: #10b981;
  color: white;
}

:deep(.copy-btn.copied::after) {
  content: "已复制";
}

:deep(.copy-btn.copied svg) {
  color: white;
}

/* 响应式布局优化 */
@media (max-width: 768px) {
  .message {
    margin: 1rem auto;
    padding: 0 0.5rem;
  }

  .message-content {
    padding: 0.875rem 1rem;
  }

  :deep(.markdown-body) {
    font-size: 0.9rem;
  }

  :deep(.markdown-body pre) {
    padding: 0.875rem;
    margin: 0.875rem 0;
  }
  
  .reasoning-header {
    padding: 0.625rem 0.875rem;
  }
  
  .reasoning-content.expanded {
    padding: 0.875rem;
  }
}

/* 深色模式支持优化 */
@media (prefers-color-scheme: dark) {
  .message.assistant .message-content {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(51, 65, 85, 0.8);
  }

  .message.user .message-content {
    background: rgba(30, 41, 59, 0.6);
  }

  .reasoning-section {
    border-color: rgba(51, 65, 85, 0.8);
    background: rgba(30, 41, 59, 0.6);
  }

  .reasoning-header {
    background: rgba(30, 41, 59, 0.8);
    border-bottom-color: rgba(51, 65, 85, 0.8);
  }

  :deep(.markdown-body pre) {
    background: rgba(30, 41, 59, 0.7) !important; /* 深色模式下更暗的背景 */
    border-color: rgba(51, 65, 85, 0.8);
  }

  :deep(.markdown-body code) {
    background: rgba(15, 23, 42, 0.4);
    color: #e2e8f0; /* 确保深色模式下代码文本颜色够亮 */
  }

  :deep(.hljs) {
    color: #abb2bf !important; /* 深色模式代码颜色 */
  }

  :deep(.copy-btn) {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(51, 65, 85, 0.8);
    color: #e2e8f0;
  }
  
  :deep(.copy-btn:hover) {
    background: rgba(51, 65, 85, 0.9);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  :deep(.copy-btn svg) {
    color: #e2e8f0;
  }
}
</style>