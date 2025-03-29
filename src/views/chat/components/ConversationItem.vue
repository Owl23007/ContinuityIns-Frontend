<template>
  <div 
    class="conversation-item" 
    :class="{ active: isActive }"
    @click="$emit('select')"
  >
    <div class="item-content">
      <div class="item-header">
        <div v-if="isEditing" class="edit-name">
          <input
            ref="nameInput"
            v-model="editingName"
            type="text"
            @keyup.enter="saveName"
            @blur="saveName"
            @keyup.esc="cancelEdit"
          />
        </div>
        <div v-else class="conversation-name" @dblclick="startEdit">
          {{ conversation.name }}
        </div>
        <div class="actions">
          <button 
            class="action-btn edit"
            title="重命名"
            @click.stop="startEdit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            class="action-btn delete"
            title="删除"
            @click.stop="confirmDelete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="item-meta">
        {{ formatDate(conversation.updatedAt) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  conversation: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'rename', 'delete'])

const isEditing = ref(false)
const editingName = ref('')
const nameInput = ref(null)

function startEdit() {
  editingName.value = props.conversation.name
  isEditing.value = true
  nextTick(() => {
    nameInput.value?.focus()
  })
}

function saveName() {
  if (editingName.value.trim()) {
    emit('rename', editingName.value.trim())
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

function confirmDelete() {
  if (confirm('确定要删除这个对话吗？')) {
    emit('delete')
  }
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  
  // 如果是今天
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  
  // 如果是昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }
  
  // 如果是这周
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  if (diff < oneWeek) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[d.getDay()]
  }
  
  // 其他情况显示日期
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}
</script>

<style scoped>
.conversation-item {
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  background: transparent;
}

.conversation-item:hover {
  background: rgba(var(--background-color-rgb), 0.6);
}

.conversation-item.active {
  background: rgba(var(--secondary-color-rgb), 0.1);
}

.item-content {
  width: 100%;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.conversation-name {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-name {
  flex: 1;
}

.edit-name input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background: rgba(var(--background-color-rgb), 0.8);
  color: var(--text-color);
}

.edit-name input:focus {
  outline: none;
  border-color: var(--secondary-color);
}

.actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.conversation-item:hover .actions {
  opacity: 1;
}

.action-btn {
  padding: 4px;
  border: none;
  background: transparent;
  color: var(--text-color);
  opacity: 0.6;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  opacity: 1;
  background: rgba(var(--background-color-rgb), 0.8);
}

.action-btn.delete:hover {
  color: #ef4444;
}

.item-meta {
  font-size: 0.8rem;
  color: var(--text-secondary-color);
  margin-top: 4px;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .conversation-item:hover {
    background: rgba(51, 65, 85, 0.4);
  }

  .conversation-item.active {
    background: rgba(59, 130, 246, 0.15);
  }

  .edit-name input {
    background: rgba(30, 41, 59, 0.8);
  }

  .action-btn:hover {
    background: rgba(30, 41, 59, 0.8);
  }
}
</style>