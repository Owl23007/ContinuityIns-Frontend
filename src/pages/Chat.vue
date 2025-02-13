<template>
  <div class="chat-container">
    <div ref="chatContainer" class="messages">
      <div v-for="(msg, index) in messages" :key="index" class="message">
        <div v-if="msg.user" class="user-message bubble">
          {{ msg.text }}
        </div>
        <div v-else class="ai-message bubble">
          <div v-if="msg.loading" class="loading">思考中...</div>
          <div v-else class="ai-response">
            <!-- 思考过程 -->
            <div 
              v-if="msg.reasoning" 
              class="reasoning-content"
              :class="{ 'has-border': msg.text }"
            >
              <span class="reasoning-label">思考过程：</span>
              {{ msg.reasoning }}
            </div>

            <!-- 正式回答 -->
            <div 
              v-if="msg.text" 
              class="answer-content"
              :class="{ 'has-margin': msg.reasoning }"
            >
              {{ msg.text }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="sendMessage">
      <input v-model="userInput" :disabled="isLoading" placeholder="输入消息..." />
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? '发送中...' : '发送' }}
      </button>
      <button type="button" @click="abort">停止</button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useElementVisibility, useScroll } from '@vueuse/core'
import { OpenAI } from 'openai'

// 响应式状态
const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)
let controller = null

// 自动滚动处理
const { y } = useScroll(chatContainer)
const containerVisible = useElementVisibility(chatContainer)

async function autoScroll() {
  await nextTick()
  if (containerVisible.value) {
    y.value = chatContainer.value.scrollHeight
  }
}

// 处理流式响应
async function processStream(completion, aiIndex) {
  try {
    let fullReasoningContent = ''
    let fullAnswerContent = ''
    let isAnswering = false

    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta || {}

      // 检查是否有 reasoning_content 属性
      if (!('reasoning_content' in delta)) {
        continue
      }

      // 处理空内容情况
      if (!delta.reasoning_content && !delta.content) {
        continue
      }

      // 处理开始回答的情况
      if (!delta.reasoning_content && !isAnswering) {
        isAnswering = true
      }

      // 处理思考过程
      if (delta.reasoning_content) {
        fullReasoningContent += delta.reasoning_content
        messages.value[aiIndex] = {
          ...messages.value[aiIndex],
          reasoning: fullReasoningContent,
        }
      }
      // 处理回复内容
      else if (delta.content) {
        fullAnswerContent += delta.content
        messages.value[aiIndex] = {
          ...messages.value[aiIndex],
          text: fullAnswerContent,
        }
      }

      await autoScroll()
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Stream error:', error)
      showErrorToast('响应中断，请重试')
    }
  }
}

// 发送消息
const sendMessage = async () => {
  if (isLoading.value || !userInput.value.trim()) return

  try {
    isLoading.value = true
    controller?.abort()
    controller = new AbortController()

    // 添加用户消息
    messages.value.push({
      text: userInput.value.trim(),
      user: true
    })

    // 添加AI消息占位
    const aiIndex = messages.value.push({
      text: '',
      reasoning: '',
      loading: true,
      user: false
    }) - 1

    userInput.value = ''

    // 构建多轮对话上下文
    const contextMessages = messages.value.map(m => ({
      role: m.user ? 'user' : 'assistant',
      content: m.text
    }))
    contextMessages.push({ role: 'user', content: userInput.value.trim() })

    // 调用API
    const completion = await openai.chat.completions.create({
      model: "deepseek-r1",
      messages: contextMessages,
      stream: true,
    }, {
      signal: controller.signal
    })

    // 初始化AI消息
    messages.value[aiIndex] = {
      ...messages.value[aiIndex],
      loading: false
    }

    await processStream(completion, aiIndex)
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error:', error)
      showErrorToast('请求失败，请检查网络后重试')
    }
  } finally {
    isLoading.value = false
  }
}
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  dangerouslyAllowBrowser: true
});


const abort = () => {
  if (controller) {
    controller.abort()
    isLoading.value = false
  }
}

function showErrorToast(msg) {
  console.error(msg)
}
</script>

<style>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
}

.messages {
  height: 60vh;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  margin: 1rem 0;
}

.user-message {
  text-align: right;
  background: #f0f0f0;
  padding: 0.5rem;
  border-radius: 4px;
}

.ai-message {
  text-align: left;
  background: #e3f2fd;
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
}

.user-message.bubble {
  margin-left: auto;
}

.ai-message.bubble {
  margin-right: auto;
  background: #f5f7fa;
}

.loading {
  color: #888;
  font-size: 0.9em;
}
</style>