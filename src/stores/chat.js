import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export const useChatStore = defineStore('chat', () => {
  // 聊天会话列表
  const chatSessions = ref([])
  // 当前会话ID
  const currentSessionId = ref('')

  // 获取当前会话
  const currentSession = computed(() => {
    if (!currentSessionId.value || chatSessions.value.length === 0) return null
    return chatSessions.value.find(session => session.id === currentSessionId.value) || null
  })

  // 当前会话的消息
  const currentMessages = computed(() => {
    return currentSession.value?.messages || []
  })

  // 创建新会话
  const createNewSession = (modelId = 'gpt-3.5-turbo') => {
    const newSession = {
      id: uuidv4(),
      title: '新的对话',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      modelId: modelId
    }
    chatSessions.value.unshift(newSession)
    currentSessionId.value = newSession.id
    return newSession
  }

  // 删除会话
  const deleteSession = (sessionId) => {
    const index = chatSessions.value.findIndex(s => s.id === sessionId)
    if (index === -1) return false

    // 如果删除的是当前会话，则切换到另一个会话
    if (currentSessionId.value === sessionId) {
      if (chatSessions.value.length > 1) {
        // 如果有其他会话，选择下一个或上一个
        const nextIndex = index === chatSessions.value.length - 1 ? index - 1 : index + 1
        currentSessionId.value = chatSessions.value[nextIndex].id
      } else {
        // 如果没有其他会话，创建一个新会话
        createNewSession()
      }
    }

    chatSessions.value.splice(index, 1)
    return true
  }

  // 添加消息到当前会话
  const addMessage = (message) => {
    // 如果没有会话，创建一个新的
    if (!currentSession.value) {
      createNewSession(message.modelId)
    }

    currentSession.value.messages.push(message)
    currentSession.value.updatedAt = new Date().toISOString()

    // 更新会话标题 - 使用第一条用户消息
    if (message.role === 'user' && currentSession.value.title === '新的对话' && currentSession.value.messages.length <= 2) {
      // 取前20个字符
      currentSession.value.title = message.content.substring(0, 20) + (message.content.length > 20 ? '...' : '')
    }

    return currentSession.value
  }

  // 更新消息
  const updateMessage = (index, messageUpdate) => {
    if (!currentSession.value || index >= currentSession.value.messages.length) return
    
    currentSession.value.messages[index] = {
      ...currentSession.value.messages[index],
      ...messageUpdate
    }
    
    currentSession.value.updatedAt = new Date().toISOString()
  }

  // 设置当前会话的模型
  const setSessionModel = (modelId) => {
    if (currentSession.value) {
      currentSession.value.modelId = modelId
    }
  }

  // 切换到指定会话
  const switchSession = (sessionId) => {
    const exists = chatSessions.value.some(s => s.id === sessionId)
    if (exists) {
      currentSessionId.value = sessionId
      return true
    }
    return false
  }

  return {
    chatSessions,
    currentSessionId,
    currentSession,
    currentMessages,
    createNewSession,
    deleteSession,
    addMessage,
    updateMessage,
    setSessionModel,
    switchSession
  }
})