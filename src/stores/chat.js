import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useConversationStore = defineStore('conversation', () => {
  // Initialize from localStorage if available
  const initialConversations = JSON.parse(localStorage.getItem('conversations') || '[]')
  const initialCurrentId = localStorage.getItem('currentConversationId') || null
  
  const conversations = ref(initialConversations)
  const currentConversationId = ref(initialCurrentId)

  // Save to localStorage when state changes
  watch(() => conversations.value, (newConversations) => {
    localStorage.setItem('conversations', JSON.stringify(newConversations))
  }, { deep: true })

  watch(() => currentConversationId.value, (newId) => {
    localStorage.setItem('currentConversationId', newId)
  })

  function createConversation() {
    const newConversation = {
      id: Date.now().toString(),
      name: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    conversations.value.unshift(newConversation)
    currentConversationId.value = newConversation.id
    return newConversation
  }

  function updateConversation(id, updates) {
    const index = conversations.value.findIndex(conv => conv.id === id)
    if (index !== -1) {
      conversations.value[index] = {
        ...conversations.value[index],
        ...updates,
        updatedAt: new Date()
      }
    }
  }

  function deleteConversation(id) {
    const index = conversations.value.findIndex(conv => conv.id === id)
    if (index !== -1) {
      conversations.value.splice(index, 1)
      if (currentConversationId.value === id) {
        currentConversationId.value = conversations.value[0]?.id || null
      }
    }
  }

  function getCurrentConversation() {
    return conversations.value.find(conv => conv.id === currentConversationId.value)
  }

  function addMessage(conversationId, message) {
    const conversation = conversations.value.find(conv => conv.id === conversationId)
    if (conversation) {
      conversation.messages.push(message)
      // 如果对话名称还是默认的"新对话"，则使用用户的第一条消息作为对话名称
      if (conversation.name === '新对话' && message.role === 'user') {
        conversation.name = message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '')
      }
      conversation.updatedAt = new Date()
      // 将最新的对话移到顶部
      const index = conversations.value.findIndex(conv => conv.id === conversationId)
      if (index > 0) {
        const [conv] = conversations.value.splice(index, 1)
        conversations.value.unshift(conv)
      }
    }
  }

  return {
    conversations,
    currentConversationId,
    createConversation,
    updateConversation,
    deleteConversation,
    getCurrentConversation,
    addMessage
  }
})