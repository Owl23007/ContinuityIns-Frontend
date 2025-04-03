<template>
  <div class="chat-container">
    <!-- 添加会话列表切换按钮 -->
    <button class="toggle-sessions-btn" @click="toggleSessionList" :title="isSessionListOpen ? '收起会话列表' : '展开会话列表'">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <!-- 会话列表组件 -->
    <chat-session-list :is-open="isSessionListOpen" @session-switched="handleSessionSwitch" />

    <div ref="chatContainer" class="messages" :class="{ 'with-session-list': isSessionListOpen }">
      <chat-message v-for="(msg, index) in messages" :key="index" :role="msg.role" :content="msg.content"
        :loading="msg.loading" :reasoning="msg.reasoning" />
    </div>

    <!-- 简化滚动控制按钮 -->
    <button v-show="showScrollBottom" class="scroll-btn" @click="scrollToBottom" title="滚动到底部"
      :class="{ 'with-session-list': isSessionListOpen }">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <div class="input-section" :class="{ 'with-session-list': isSessionListOpen }">
      <div class="input-container">
        <div class="input-left">
          <model-selector v-model:modelId="selectedModel" class="model-selector" />
        </div>
        <div class="input-right">
          <chat-input :disabled="isLoading" @submit="handleMessageSubmit" @abort="handleAbort" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUpdated, watch, onUnmounted } from 'vue'
import { useElementVisibility, useScroll } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'
import { initCodeCopy } from '@/utils/copy'
import ChatMessage from './components/ChatMessage.vue'
import ChatInput from './components/ChatInput.vue'
import ModelSelector from './components/ModelSelector.vue'
import ChatSessionList from './components/ChatSessionList.vue'

const router = useRouter()
const messages = ref([])
const isLoading = ref(false)
const chatContainer = ref(null)
let controller = null
const authStore = useAuthStore()
const chatStore = useChatStore()
const taskId = ref('')
const selectedModel = ref('')

// 初始化逻辑
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
    return
  }

  // 初始化界面和会话
  if (chatStore.chatSessions.length === 0) {
    // 如果没有会话，创建新会话
    const session = chatStore.createNewSession()
    selectedModel.value = session.modelId
  } else if (!chatStore.currentSessionId) {
    // 如果有会话但没有选中的会话，选择最新的会话
    chatStore.switchSession(chatStore.chatSessions[0].id)
    selectedModel.value = chatStore.currentSession.modelId
  } else {
    // 使用当前会话的模型
    selectedModel.value = chatStore.currentSession.modelId
  }

  nextTick(() => {
    initCodeCopy()
    chatContainer.value?.addEventListener('scroll', checkScrollPosition)
    checkScrollPosition()
  })
})

// 监听模型变化
watch(() => selectedModel.value, (newModel) => {
  if (chatStore.currentSession) {
    chatStore.setSessionModel(newModel)
  }
})

// 监听当前会话变化，更新选中的模型
watch(() => chatStore.currentSession, (newSession) => {
  if (newSession) {
    selectedModel.value = newSession.modelId
  }
}, { deep: true })

// 简化滚动控制逻辑
const showScrollBottom = ref(false)
const lastUserMessageTime = ref(0)
const isSessionListOpen = ref(false)

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

watch(() => chatStore.currentMessages, (newMessages) => {
  messages.value = newMessages
}, { deep: true })

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

      // 如果读取完成但没有收到任何内容，确保重置加载状态
      if (done) {
        if (isFirstChunk) {
          messages.value[aiIndex].loading = false
          chatStore.updateMessage(aiIndex, { loading: false })
        }
        break
      }

      buffer += decoder.decode(value, { stream: true })

      let boundary
      while ((boundary = buffer.indexOf('\n')) !== -1) {
        const chunk = buffer.slice(0, boundary).trim()
        buffer = buffer.slice(boundary + 1)

        if (!chunk) continue

        // 确保在流结束时重置加载状态
        if (chunk === 'data:data: [DONE]' || chunk === 'data: [DONE]') {
          messages.value[aiIndex].loading = false
          chatStore.updateMessage(aiIndex, { loading: false })
          return
        }

        if (chunk.startsWith('data:data:') || chunk.startsWith('data: ')) {
          try {
            const jsonStr = chunk.replace(/^data:data:|^data: /, '')
            if (jsonStr === '[DONE]') {
              messages.value[aiIndex].loading = false
              chatStore.updateMessage(aiIndex, { loading: false })
              return
            }

            const data = JSON.parse(jsonStr)
            const delta = data.choices[0].delta || {}

            // 收到第一个数据块时重置加载状态
            if (isFirstChunk) {
              messages.value[aiIndex].loading = false
              chatStore.updateMessage(aiIndex, { loading: false })
              isFirstChunk = false
            }

            messages.value[aiIndex] = {
              ...messages.value[aiIndex],
              content: (messages.value[aiIndex].content || '') + (delta.content || ''),
              reasoning: (messages.value[aiIndex].reasoning || '') + (delta.reasoning_content || '')
            }
            chatStore.updateMessage(aiIndex, {
              content: messages.value[aiIndex].content,
              reasoning: messages.value[aiIndex].reasoning
            })

            await autoScroll()
          } catch (error) {
            console.error('解析错误:', error)
            // 解析错误时也要重置加载状态
            messages.value[aiIndex].loading = false
            chatStore.updateMessage(aiIndex, { loading: false })
          }
        }
      }
    }
  } catch (error) {
    console.error('流处理错误:', error)
    // 确保在发生任何错误时都重置加载状态
    messages.value[aiIndex].loading = false
    chatStore.updateMessage(aiIndex, { loading: false })
    if (error.name !== 'AbortError') {
      showErrorToast('响应中断，请重试')
    }
  } finally {
    // 最后确保一定会重置加载状态
    messages.value[aiIndex].loading = false
    chatStore.updateMessage(aiIndex, { loading: false })
  }
}

const handleMessageSubmit = async (messageText) => {
  if (!authStore.isAuthenticated) {
    router.push('/auth?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
    return
  }

  lastUserMessageTime.value = Date.now()
  let aiIndex = -1

  try {
    isLoading.value = true
    controller?.abort()
    controller = new AbortController()

    // 添加消息到store
    const userMessage = {
      role: 'user',
      content: messageText
    }
    chatStore.addMessage(userMessage)

    // 添加 AI 消息占位
    const aiMessage = {
      role: 'assistant',
      content: '',
      loading: true,
      reasoning: ''
    }
    chatStore.addMessage(aiMessage)
    nextTick(() => {
      chatContainer.value.scrollTo({
        top: chatContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    })
    aiIndex = messages.value.length - 1

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

    if (!res.ok) {
      throw new Error('网络响应失败')
    }

    const data = await res.json()
    taskId.value = data.data

    const response = await fetch(`${import.meta.env.VITE_APP_BASE_API}/ai/${taskId.value}`, {
      headers: { 'Authorization': `Duel ${authStore.token}` },
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error('网络响应失败')
    }

    await processStream(response, aiIndex)
  } catch (error) {
    if (error.name === 'AbortError') {
      // 中断请求时，清除加载状态
      if (aiIndex !== -1) {
        chatStore.updateMessage(aiIndex, { loading: false })
      }
    } else {
      console.error('Error:', error)
      showErrorToast('请求失败，请检查网络后重试')
      // 请求失败时，清除加载状态
      if (aiIndex !== -1) {
        chatStore.updateMessage(aiIndex, { loading: false })
      }
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

      // 确保在中断时清除最后一条消息的加载状态
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.loading) {
        chatStore.updateMessage(messages.value.length - 1, { loading: false })
      }
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

// 切换会话列表显示状态
const toggleSessionList = () => {
  isSessionListOpen.value = !isSessionListOpen.value
}

// 处理会话切换
const handleSessionSwitch = async (sessionId) => {
  // 如果当前有正在进行的对话
  if (isLoading.value) {
    const confirmed = confirm('当前对话正在进行中，切换会话将中断当前对话，是否继续？')
    if (!confirmed) {
      return
    }
    // 中断当前请求
    await handleAbort()
  }

  if (sessionId) {
    chatStore.switchSession(sessionId)
  }

  // 移动端时关闭会话列表
  if (window.innerWidth <= 768) {
    isSessionListOpen.value = false
  }
}

// 优化移动端适配
const isMobile = ref(window.innerWidth <= 768)
const updateMobileState = () => {
  isMobile.value = window.innerWidth <= 768
  // 如果从移动端切换到桌面端，保持会话列表打开
  if (!isMobile.value) {
    isSessionListOpen.value = true
  }
}

// 监听窗口大小变化
window.addEventListener('resize', updateMobileState)
onMounted(() => {
  updateMobileState()
  // 桌面端默认展开会话列表
  if (!isMobile.value) {
    isSessionListOpen.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMobileState)
  window.removeEventListener('resize', checkScrollPosition)
  chatContainer.value?.removeEventListener('scroll', checkScrollPosition)
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

.messages.with-session-list {
  margin-left: 280px;
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

.input-section.with-session-list {
  margin-left: 280px;
  width: calc(100% - 280px);
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

.scroll-btn.with-session-list {
  margin-left: 280px;
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

/* 添加会话列表相关样式 */
.toggle-sessions-btn {
  position: fixed;
  top: calc(var(--header-height) + 1rem);
  left: 1rem;
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
  z-index: 91;
}

.toggle-sessions-btn:hover {
  background: rgba(var(--background-color-rgb), 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 1;
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

  .toggle-sessions-btn {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(51, 65, 85, 0.8);
  }

  .toggle-sessions-btn:hover {
    background: rgba(30, 41, 59, 0.95);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .messages {
    margin-bottom: 120px;
    padding: 0.5rem 0;
    margin-left: 0 !important;
    /* 确保移动端没有左边距 */
  }

  .messages.with-session-list {
    margin-left: 0;
  }

  .input-section {
    padding: 0.75rem 0;
    width: 100% !important;
    /* 确保移动端输入框占满宽度 */
    margin-left: 0 !important;
    bottom: 0;
  }

  .input-container {
    padding: 0 0.75rem;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 100%;
  }

  .input-left {
    width: 100%;
  }

  .input-right {
    width: 100%;
  }

  .scroll-btn {
    right: 1rem;
    bottom: 140px;
    width: 36px;
    height: 36px;
    margin-left: 0 !important;
  }

  .toggle-sessions-btn {
    top: calc(var(--header-height) + 0.75rem);
    left: 0.75rem;
    width: 36px;
    height: 36px;
    z-index: 1002;
    /* 确保按钮在会话列表上层 */
  }
}

/* 小屏幕手机适配 */
@media (max-width: 480px) {
  .messages {
    margin-bottom: 110px;
    padding: 0.5rem 0;
  }

  .input-section {
    padding: 0.5rem 0;
  }

  .input-container {
    padding: 0 0.5rem;
    gap: 0.5rem;
  }

  .toggle-sessions-btn {
    top: calc(var(--header-height) + 0.5rem);
    left: 0.5rem;
    width: 32px;
    height: 32px;
  }

  .scroll-btn {
    right: 0.75rem;
    bottom: 120px;
    width: 32px;
    height: 32px;
  }
}

/* 高度较低的设备（如横屏手机） */
@media (max-height: 500px) {
  .messages {
    margin-bottom: 100px;
  }

  .input-section {
    padding: 0.5rem 0;
  }

  .input-container {
    max-width: 100%;
  }
}
</style>