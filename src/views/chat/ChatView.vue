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

    <div class="input-section">
      <model-selector 
        v-model:modelId="selectedModel" 
        class="model-selector"
      />
      <chat-input
        :disabled="isLoading"
        @submit="handleMessageSubmit"
        @abort="handleAbort"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUpdated } from 'vue'
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

// 验证登录状态
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
    return
  }
  nextTick(() => {
    initCodeCopy()
  })
})

const { y } = useScroll(chatContainer)
const containerVisible = useElementVisibility(chatContainer)

async function autoScroll() {
  await nextTick()
  if (containerVisible.value) {
    y.value = chatContainer.value.scrollHeight
  }
}

async function processStream(response, aiIndex) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

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

        if (chunk === 'data:data: [DONE]') return

        if (chunk.startsWith('data:data:')) {
          try {
            const jsonStr = chunk.slice('data:data:'.length)
            if (jsonStr === '[DONE]') return
            const data = JSON.parse(jsonStr)
            const delta = data.choices[0].delta || {}

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
    }
  }
}

const handleMessageSubmit = async (messageText) => {
  if (!authStore.isAuthenticated) {
    router.push('/auth=?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))
    return
  }
  
  try {
    isLoading.value = true
    controller?.abort()
    controller = new AbortController()

    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: messageText
    })

    // 添加 AI 消息占位
    const aiIndex = messages.value.push({
      role: 'assistant',
      content: '',
      loading: true,
      reasoning: ''
    }) - 1

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
</script>

<style>
.chat-container {
  width: 100%;
  max-width: 100%;
  height: calc(100vh - var(--header-height));
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  position: relative;
}

.messages {
  flex: 1;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.8);
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  scroll-behavior: smooth;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.02);
  margin-bottom: 140px; /* 确保底部内容不被输入区域遮挡 */
}

.input-section {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--container-width);
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.03);
  padding: 16px;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.model-selector {
  margin-bottom: 12px;
}

.messages::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-track {
  background: transparent;
}

.messages::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
  transition: background 0.2s;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.markdown-body {
  font-size: 14px;
  line-height: 1.6;
}

.markdown-body pre {
  background-color: #ffffff;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.markdown-body code {
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  font-size: 12px;
  padding: 0.2em 0.4em;
  margin: 0;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
}

.code-block-wrapper {
  position: relative;
  margin: 12px 0;
  border-radius: 8px;
  overflow: hidden;
}

.copy-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1;
  cursor: pointer;
  opacity: 0;
}

.code-block-wrapper:hover .copy-btn {
  opacity: 1;
}

.copy-btn:hover {
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - var(--header-height));
    margin: 0;
    box-shadow: none;
  }

  .messages {
    padding: 16px;
    margin-bottom: 120px; /* 移动端调整底部间距 */
  }
  
  .input-section {
    padding: 12px;
    width: 100%;
    left: 0;
    transform: none;
    max-width: 100%;
  }
}
</style>