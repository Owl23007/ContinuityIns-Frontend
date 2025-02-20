<template>
  <div class="chat-container">
    <div ref="chatContainer" class="messages">
      <div v-for="(msg, index) in messages" :key="index" class="message">
        <div v-if="msg.role === 'user'" class="user-message bubble">
          {{ msg.content }}
        </div>
        <div v-else-if="msg.role === 'assistant'" class="ai-message bubble">
          <div v-if="msg.loading" class="loading">思考中...</div>
          <div v-else class="ai-response">
            <!-- 只在有思考内容时显示 -->
            <div 
              v-if="msg.reasoning?.trim()" 
              class="reasoning-content"
              :class="{ 'has-border': msg.content }"
            >
              <span class="reasoning-label">思考过程：</span>
              <div v-html="renderMarkdown(msg.reasoning)"></div>
            </div>

            <!-- 正式回答 -->
            <div 
              v-if="msg.content" 
              class="answer-content markdown-body"
              :class="{ 'has-margin': msg.reasoning?.trim() }"
              v-html="renderMarkdownWithCopy(msg.content)"
            >
            </div>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="input-form">
      <div class="textarea-container">
        <textarea
          v-model="userInput"
          ref="textareaRef"
          :disabled="isLoading"
          placeholder="输入消息...(Shift+Enter换行)"
          class="input-field"
          @keydown.enter.exact.prevent="handleEnter"
          @keydown.shift.enter.exact.prevent="insertNewline"
          @input="adjustHeight"
        ></textarea>
      </div>
      <button
        type="button"
        :class="['smart-button', { 'abort-mode': isLoading }]"
        @click="handleSmartClick"
      >
        {{ isLoading ? '停止生成' : '发送消息' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUpdated } from 'vue'
import { useElementVisibility, useScroll } from '@vueuse/core'
import { useStore } from 'vuex'
import { renderMarkdown, renderMarkdownWithCopy } from '@/utils/markdown'
import { initCodeCopy } from '@/utils/copy'

const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)
let controller = null
const store = useStore()
const taskId = ref('')

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

const sendMessage = async () => {
  if (isLoading.value || !userInput.value.trim()) return

  const messageToSend = userInput.value.trim()

  try {
    isLoading.value = true
    controller?.abort()
    controller = new AbortController()

    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: messageToSend
    })

    // 添加 AI 消息占位
    const aiIndex = messages.value.push({
      role: 'assistant',
      content: '',
      loading: true,
      reasoning: ''
    }) - 1

    userInput.value = ''

    const token = store.state.token
    const url = import.meta.env.VITE_APP_BASE_API + '/ai/chat'
    
    // 发送完整上下文
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Duel ${token}` 
      },
      body: JSON.stringify({
        messages: messages.value
          .filter(m => m.role !== 'assistant' || !m.loading)
          .map(({ loading, reasoning, ...rest }) => rest),
      }),
      signal: controller.signal
    })
    
    const data = await res.json()
    taskId.value = data.data

    const response = await fetch(`${import.meta.env.VITE_APP_BASE_API}/ai/${taskId.value}`, {
      headers: { 'Authorization': `Duel ${token}` },
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

const abort = async () => {
  if (controller) {
    try {
      const token = store.state.token
      await fetch(`${import.meta.env.VITE_APP_BASE_API}/ai/${taskId.value}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'text/plain', 'Authorization': `Duel ${token}` }
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

const textareaRef = ref(null)

const handleSmartClick = () => {
  if (isLoading.value) {
    abort()
  } else {
    sendMessage()
  }
}

// 调整高度函数
const adjustHeight = () => {
  nextTick(() => {
    const textarea = textareaRef.value
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  })
}

// 回车处理
const handleEnter = () => {
  if (!isLoading.value && userInput.value.trim()) {
    sendMessage()
  }
}

// 换行处理
const insertNewline = () => {
  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  userInput.value = userInput.value.substring(0, start) + '\n' + userInput.value.substring(end)
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 1
    adjustHeight()
  })
}

onMounted(() => {
  adjustHeight()
  nextTick(() => {
    initCodeCopy()
  })
})

onUpdated(()=>
{
  nextTick(()=>{
    initCodeCopy();
  })
})
</script>

<style>
.chat-container {
  max-width: 60%;
  margin: 0 auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.messages {
  height: 65vh;
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #eee;
  overflow-y: auto;
}

.message {
  margin: 1rem 0;
}

.user-message {
  text-align: right;
  background: #e3f2fd;
  padding: 0.5rem;
  border-radius: 4px;
}

.ai-message {
  text-align: left;
  background: #f5f7fa;
  padding: 0.5rem;
  border-radius: 4px;
}

.loading {
  color: #666;
  font-style: italic;
}

.ai-response {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reasoning-content {
  color: #666;
  font-size: 0.8em;
  line-height: 1.4;
  padding: 8px 12px;
  background: #f8f8f8;
  border-radius: 4px;
  position: relative;
}

.reasoning-content.has-border {
  border-bottom: 1px dashed #ddd;
  padding-bottom: 12px;
  margin-bottom: 8px;
}

.reasoning-label {
  color: #999;
  font-size: 0.85em;
  margin-right: 6px;
}

.answer-content {
  font-size: 0.95em;
  line-height: 1.6;
  padding: 8px 0;
}

.answer-content.has-margin {
  padding-top: 12px;
}

/* 优化现有样式 */
.bubble {
  padding: 12px 16px;
  margin: 8px 0;
  max-width: 85%;
  border-radius: 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-message.bubble {
  margin-left: auto;
  background: #e3f2fd;
  border-bottom-right-radius: 4px;
}

.ai-message.bubble {
  margin-right: auto;
  background: #f5f7fa;
  border-bottom-left-radius: 4px;
}

.loading {
  color: #888;
  font-size: 0.9em;
}

/* 新增的表单样式 */
.input-form {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
}

.textarea-container {
  flex: 1;
  position: relative;
}

.input-field {
  width: 100%;
  min-height: 44px;
  max-height: 200px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: none;
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 15px;
  line-height: 1.6;
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.smart-button {
  height: 44px;
  padding: 0 24px;
  border-radius: 8px;
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 15px;
  letter-spacing: 0.5px;
  background: #007bff;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.smart-button:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.smart-button:active {
  transform: translateY(0);
}

.smart-button.abort-mode {
  background: #dc3545;
}

.smart-button.abort-mode:hover {
  background: #c82333;
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
  white-space: pre-wrap;
  word-break: break-word;
}

.markdown-body pre code {
  background: rgb(255, 255, 255);
  padding: 0;
}

.markdown-body p {
  margin: 8px 0;
}

.markdown-body ul, 
.markdown-body ol {
  padding-left: 2em;
}

.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid #d0d7de;
  padding: 6px 13px;
}

.markdown-body tr:nth-child(2n) {
  background-color: #f6f8fa;
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
}

.copy-btn:hover {
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
</style>