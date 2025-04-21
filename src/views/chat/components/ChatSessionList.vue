<template>
  <div class="session-list" :class="{ 'session-list-open': isOpen }">
    <!-- 添加遮罩层，只在isOpen时才显示和捕获事件 -->
    <div
      class="session-list-overlay"
      @click="handleOverlayClick"
      v-if="isOpen"
    ></div>

    <div class="session-list-content">
      <div class="session-header">
        <h3>聊天记录</h3>
        <button class="new-chat-btn" @click="createNewChat" title="新建对话">
          <svg
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
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          新建对话
        </button>
      </div>

      <div class="sessions-container">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="session-item"
          :class="{ active: currentSessionId === session.id }"
          @click="switchSession(session.id)"
        >
          <div class="session-info">
            <span class="session-title">{{ session.title }}</span>
            <span class="session-time">{{
              formatTime(session.updatedAt)
            }}</span>
          </div>
          <button
            class="delete-btn"
            @click.stop="deleteSession(session.id)"
            title="删除对话"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useChatStore } from "@/stores/chat";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["session-switched"]);

const chatStore = useChatStore();
const { chatSessions, currentSessionId } = storeToRefs(chatStore);

const sessions = computed(() => {
  return chatSessions.value.sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  );
});

function createNewChat() {
  chatStore.createNewSession();
  emit("session-switched");
}

function switchSession(sessionId) {
  // 通知父组件进行会话切换，父组件会处理确认逻辑
  emit("session-switched", sessionId);
}

function deleteSession(sessionId) {
  if (confirm("确定要删除这个对话吗？")) {
    chatStore.deleteSession(sessionId);
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // 如果是今天
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  // 如果是昨天
  else if (diff < 48 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
    return "昨天";
  }
  // 如果是本周
  else if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = ["日", "一", "二", "三", "四", "五", "六"];
    return "星期" + days[date.getDay()];
  }
  // 其他情况显示完整日期
  else {
    return date.toLocaleDateString("zh-CN", {
      month: "numeric",
      day: "numeric",
    });
  }
}

// 添加遮罩层点击处理
function handleOverlayClick() {
  emit("session-switched");
}
</script>

<style scoped>
.session-list {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  z-index: 1000;
  /* 删除display: none，使用可见性控制替代 */
  visibility: hidden;
}

.session-list.session-list-open {
  visibility: visible;
}

.session-list-content {
  position: fixed;
  top: var(--header-height);
  left: 0;
  height: calc(100vh - var(--header-height));
  width: 280px;
  background: rgba(var(--background-color-rgb), 0.95);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  backdrop-filter: blur(8px);
  z-index: 1001;
}

.session-list-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  transition: opacity 0.3s ease;
  z-index: 1000;
  /* 确保遮罩层在未打开状态下不会阻止交互 */
  opacity: 1;
}

.session-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.new-chat-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: var(--secondary-color);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.new-chat-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

.sessions-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.session-item {
  padding: 0.75rem;
  margin: 0.25rem 0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
}

.session-item:hover {
  background: rgba(var(--hover-color-rgb), 0.1);
}

.session-item.active {
  background: rgba(var(--secondary-color-rgb), 0.1);
}

.session-info {
  flex: 1;
  min-width: 0;
  margin-right: 8px;
}

.session-title {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.delete-btn {
  opacity: 0;
  padding: 4px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.session-item:hover .delete-btn {
  opacity: 0.6;
}

.delete-btn:hover {
  opacity: 1 !important;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

@media (max-width: 768px) {
  .session-list-content {
    transform: translateX(-100%);
  }

  .session-list.session-list-open .session-list-content {
    transform: translateX(0);
  }
}

@media (min-width: 769px) {
  .session-list-overlay {
    display: none;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .session-item:hover {
    background: rgba(var(--hover-color-rgb), 0.15);
  }

  .session-item.active {
    background: rgba(var(--secondary-color-rgb), 0.15);
  }
}
</style>
