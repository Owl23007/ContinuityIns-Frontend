<template>
  <Teleport to="body">
    <transition-group 
      name="notification" 
      tag="div" 
      class="notification-container"
    >
      <div 
        v-for="notification in notifications" 
        :key="notification.id" 
        class="notification" 
        :class="notification.type"
      >
        <span class="notification-icon">{{ getIcon(notification.type) }}</span>
        <span class="notification-message">{{ notification.message }}</span>
        <button class="notification-close" @click="close(notification.id)">
          &times;
        </button>
      </div>
    </transition-group>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const notifications = ref([]);
let nextId = 1;

// 显示通知
function show(message, type = 'info', duration = 3000) {
  const id = nextId++;
  
  const notification = {
    id,
    message,
    type
  };
  
  notifications.value.push(notification);
  
  // 自动关闭
  if (duration > 0) {
    setTimeout(() => {
      close(id);
    }, duration);
  }
  
  return id;
}

// 关闭通知
function close(id) {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
}

// 根据类型获取图标
function getIcon(type) {
  switch(type) {
    case 'success': return '✓';
    case 'error': return '✗';
    case 'warning': return '⚠';
    case 'info':
    default: return 'ℹ';
  }
}

// 暴露方法给父组件
defineExpose({
  show,
  close
});
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 80px; /* 改为顶部显示 */
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px; /* 增加最大宽度 */
  width: calc(100% - 40px); /* 响应式宽度 */
}

.notification {
  padding: 14px 16px; /* 增加内边距 */
  border-radius: 6px; /* 增加圆角 */
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15); /* 加强阴影效果 */
  display: flex;
  align-items: center;
  position: relative;
  animation: fadeIn 0.3s;
}

.notification-icon {
  margin-right: 12px;
  font-weight: bold;
  font-size: 16px; /* 增加图标大小 */
}

.notification-message {
  flex-grow: 1;
  padding-right: 30px;
  font-size: 14px; /* 设置消息字体大小 */
  line-height: 1.4;
}

.notification-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 20px; /* 增加关闭按钮大小 */
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.notification-close:hover {
  opacity: 1;
}

/* 通知类型样式 */
.success {
  background-color: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.warning {
  background-color: #fff3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
}

.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

/* 过渡动画 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 添加移动设备的响应式布局 */
@media (max-width: 768px) {
  .notification-container {
    bottom: 10px;
    right: 10px;
    width: calc(100% - 20px);
    max-width: none;
  }
  
  .notification {
    padding: 12px 14px;
  }
  
  .notification-message {
    font-size: 13px;
  }
}
</style>