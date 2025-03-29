import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'chat-sessions'
const CURRENT_SESSION_KEY = 'current-session-id'

export const useChatStore = defineStore('chat', () => {
  // 从localStorage加载数据
  const savedSessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const savedCurrentId = localStorage.getItem(CURRENT_SESSION_KEY)

  // 聊天会话列表
  const chatSessions = ref(savedSessions)
  // 当前会话ID
  const currentSessionId = ref(savedCurrentId || '')

  // 获取当前会话
  const currentSession = computed(() => {
    if (!currentSessionId.value || chatSessions.value.length === 0) return null
    return chatSessions.value.find(session => session.id === currentSessionId.value) || null
  })

  // 当前会话的消息
  const currentMessages = computed(() => {
    return currentSession.value?.messages || []
  })

  // 保存到localStorage
  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions.value))
    localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId.value)
  }

  // 创建新会话
  const createNewSession = (modelId = 'deepseek-v3') => {
    // 在创建新会话前，确保当前会话的所有消息加载状态都被重置
    const currentSession = chatSessions.value.find(s => s.id === currentSessionId.value)
    if (currentSession) {
      currentSession.messages = currentSession.messages.map(msg => ({
        ...msg,
        loading: false
      }))
    }

    const newSession = {
      id: Date.now().toString(),
      title: '新的对话',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      modelId: modelId
    }
    chatSessions.value.unshift(newSession)
    currentSessionId.value = newSession.id
    saveToStorage()
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
    saveToStorage()
    return true
  }

  // 添加消息到当前会话
  const addMessage = (message) => {
    // 如果没有会话，创建一个新的
    if (!currentSession.value) {
      createNewSession()
    }

    currentSession.value.messages.push(message)
    currentSession.value.updatedAt = new Date().toISOString()

    // 更新会话标题 - 使用第一条用户消息
    if (message.role === 'user' && currentSession.value.title === '新的对话' && currentSession.value.messages.length <= 2) {
      // 取前20个字符
      currentSession.value.title = message.content.substring(0, 20) + (message.content.length > 20 ? '...' : '')
    }

    saveToStorage()
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
    saveToStorage()
  }

  // 设置当前会话的模型
  const setSessionModel = (modelId) => {
    if (currentSession.value) {
      currentSession.value.modelId = modelId
      saveToStorage()
    }
  }

  // 切换到指定会话
  const switchSession = (sessionId) => {
    const exists = chatSessions.value.some(s => s.id === sessionId)
    if (exists) {
      // 在切换会话前，确保当前会话的所有消息加载状态都被重置
      const currentSession = chatSessions.value.find(s => s.id === currentSessionId.value)
      if (currentSession) {
        currentSession.messages = currentSession.messages.map(msg => ({
          ...msg,
          loading: false
        }))
      }
      
      currentSessionId.value = sessionId
      saveToStorage()
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