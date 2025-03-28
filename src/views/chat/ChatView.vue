<template>
  <div class="chat-container">
    <div ref="chatContainer" class="messages">
      <chat-message
        v-for="(msg, index) in messages"
        :key="index"
        :role="msg.role"
        :content="msg.content"
        :loading="msg.loading"
        :reasoning="msg.reasoning"
      />
    </div>

    <!-- 简化滚动控制按钮 -->
    <button 
      v-show="showScrollBottom"
      class="scroll-btn" 
      @click="scrollToBottom" 
      title="滚动到底部"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <div class="input-section">
      <div class="input-container">
        <div class="input-left">
          <model-selector 
            v-model:modelId="selectedModel" 
            class="model-selector"
          />
        </div>
        <div class="input-right">
          <chat-input
            :disabled="isLoading"
            @submit="handleMessageSubmit"
            @abort="handleAbort"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUpdated, watch, onUnmounted } from 'vue'
import { useElementVisibility, useScroll } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { initCodeCopy } from '@/utils/copy'
import ChatMessage from './components/ChatMessage.vue'
import ChatInput from './components/ChatInput.vue'
import ModelSelector from './components/ModelSelector.vue'

const router = useRouter()
const messages = ref([])
const isLoading = ref(false)
const chatContainer = ref(null)
let controller = null
const authStore = useAuthStore()
const taskId = ref('')
const selectedModel = ref('gpt-3.5-turbo')

// 简化滚动控制逻辑
const showScrollBottom = ref(false)
const lastUserMessageTime = ref(0)

const checkScrollPosition = () => {
  if (!chatContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = chatContainer.value
  
  // 当距离底部超过100px时显示滚动按钮
  showScrollBottom.value = (scrollHeight - scrollTop - clientHeight) > 100
}

// 验证登录状态
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
    return
  }
  nextTick(() => {
    initCodeCopy()
    chatContainer.value?.addEventListener('scroll', checkScrollPosition)
    checkScrollPosition()
  })
})

// 监听消息变化和窗口大小变化
watch(() => messages.value.length, () => {
  checkScrollPosition()
  autoScroll()
  nextTick(() => {
    initCodeCopy() // 确保在消息列表更新后重新初始化复制按钮
  })
})

window.addEventListener('resize', checkScrollPosition)
onUnmounted(() => {
  window.removeEventListener('resize', checkScrollPosition)
  chatContainer.value?.removeEventListener('scroll', checkScrollPosition)
})

const { y } = useScroll(chatContainer)
const containerVisible = useElementVisibility(chatContainer)

async function autoScroll() {
  await nextTick()
  if (containerVisible.value) {
    // 只有在以下情况才自动滚动到底部:
    // 1. 用户最近30秒内发送过消息
    // 2. 滚动条接近底部
    const now = Date.now()
    const scrollPosition = chatContainer.value.scrollTop + chatContainer.value.clientHeight
    const isNearBottom = chatContainer.value.scrollHeight - scrollPosition < 100
    
    if (now - lastUserMessageTime.value < 30000 || isNearBottom) {
      chatContainer.value.scrollTo({
        top: chatContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  }
}

async function processStream(response, aiIndex) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let isFirstChunk = true

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      let boundary
      while ((boundary = buffer.indexOf('\n')) !== -1) {
        const chunk = buffer.slice(0, boundary).trim()
        buffer = buffer.slice(boundary + 1)

        if (!chunk) continue

        if (chunk === 'data:data: [DONE]') {
          messages.value[aiIndex].loading = false
          return
        }

        if (chunk.startsWith('data:data:')) {
          try {
            const jsonStr = chunk.slice('data:data:'.length)
            if (jsonStr === '[DONE]') {
              messages.value[aiIndex].loading = false
              return
            }
            const data = JSON.parse(jsonStr)
            const delta = data.choices[0].delta || {}

            if (isFirstChunk) {
              messages.value[aiIndex].loading = false
              isFirstChunk = false
            }

            messages.value[aiIndex] = {
              ...messages.value[aiIndex],
              content: (messages.value[aiIndex].content || '') + (delta.content || ''),
              reasoning: (messages.value[aiIndex].reasoning || '') + (delta.reasoning_content || '')
            }

            await autoScroll()
          } catch (error) {
            console.error('解析错误:', error)
          }
        }
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('流处理错误:', error)
      showErrorToast('响应中断，请重试')
      messages.value[aiIndex].loading = false
    }
  }
}

const handleMessageSubmit = async (messageText) => {
  if (!authStore.isAuthenticated) {
    router.push('/auth?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
    return
  }
  
  lastUserMessageTime.value = Date.now()
  
  try {
    isLoading.value = true
    controller?.abort()
    controller = new AbortController()

    // 添加用户消息时自动滚动到底部
    messages.value.push({
      role: 'user',
      content: messageText
    })
    await autoScroll()

    // 添加 AI 消息占位
    const aiIndex = messages.value.push({
      role: 'assistant',
      content: '',
      loading: true,
      reasoning: ''
    }) - 1
    
    await autoScroll()

    const url = import.meta.env.VITE_APP_BASE_API + '/ai/chat'
    
    // 发送完整上下文
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Duel ${authStore.token}` 
      },
      body: JSON.stringify({
        messages: messages.value
          .filter(m => m.role !== 'assistant' || !m.loading)
          .map(({ loading, reasoning, ...rest }) => rest),
        model: selectedModel.value
      }),
      signal: controller.signal
    })
    
    const data = await res.json()
    taskId.value = data.data

    const response = await fetch(`${import.meta.env.VITE_APP_BASE_API}/ai/${taskId.value}`, {
      headers: { 'Authorization': `Duel ${authStore.token}` },
      signal: controller.signal
    })

    if (!response.ok) throw new Error('网络响应失败')

    messages.value[aiIndex] = {
      ...messages.value[aiIndex],
      loading: false
    }

    await processStream(response, aiIndex)
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error:', error)
      showErrorToast('请求失败，请检查网络后重试')
    }
  } finally {
    isLoading.value = false
  }
}

const handleAbort = async () => {
  if (controller) {
    try {
      await fetch(`${import.meta.env.VITE_APP_BASE_API}/ai/${taskId.value}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'text/plain', 'Authorization': `Duel ${authStore.token}` }
      })
    } catch (error) {
      console.error('停止请求失败:', error)
    } finally {
      controller.abort()
      isLoading.value = false
    }
  }
}

function showErrorToast(msg) {
  console.error(msg)
}

onUpdated(() => {
  nextTick(() => {
    initCodeCopy()
  })
})

// 简化滚动方法，只保留滚动到底部
const scrollToBottom = () => {
  chatContainer.value?.scrollTo({
    top: chatContainer.value.scrollHeight,
    behavior: 'smooth'
  })
}
</script>

<style>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height));
  background: rgba(var(--background-color-rgb), 0.95);
  position: relative;
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 1rem 0;
  contain: paint;
  margin-bottom: 140px;
}

.input-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(var(--background-color-rgb), 0.95);
  border-top: 1px solid var(--border-color);
  padding: 1rem 0;
  backdrop-filter: blur(8px);
  z-index: 100;
}

.input-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  display: flex;
  gap: 1rem;
}

.input-left {
  width: 180px;
  flex-shrink: 0;
}

.input-right {
  flex: 1;
}

/* 修改滚动按钮样式 */
.scroll-btn {
  position: fixed;
  right: 2rem;
  bottom: 160px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(var(--background-color-rgb), 0.8);
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  opacity: 0.8;
  z-index: 99;
}

.scroll-btn:hover {
  background: rgba(var(--background-color-rgb), 0.95);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 1;
}

.scroll-btn:active {
  transform: translateY(0);
}

.scroll-btn svg {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

/* 滚动条样式优化 */
.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: transparent;
}

.messages::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.5);
  border-radius: 3px;
  transition: all 0.2s ease;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.8);
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .messages::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.2);
  }
  
  .messages::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.4);
  }

  .input-section {
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  
  .scroll-btn {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(51, 65, 85, 0.8);
  }
  
  .scroll-btn:hover {
    background: rgba(30, 41, 59, 0.95);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .messages {
    margin-bottom: 120px;
    padding: 0.5rem 0;
  }

  .input-section {
    padding: 0.75rem 0;
  }

  .input-container {
    padding: 0 0.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .input-left {
    width: 100%;
  }

  .scroll-btn {
    right: 1rem;
    bottom: 140px;
    width: 36px;
    height: 36px;
  }
}
</style>