<template>
  <div class="modal-overlay" @mousedown="handleBackdropClick" ref="modalBackdrop">
    <div class="modal-container" :class="theme">
      <div class="modal-header">
        <h2 class="modal-title" :class="{ danger: theme === 'danger' }">{{ title }}</h2>
        <button class="close-button" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';

defineProps({
  title: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    default: 'default'
  }
});

const emit = defineEmits(['close']);
const modalBackdrop = ref(null);
const isCropping = ref(false);
let cropperElement = null;

// 添加监听器，检测是否在裁剪器上按下鼠标
onMounted(() => {
  document.addEventListener('mousedown', startCropTracking);
  document.addEventListener('mouseup', endCropTracking);

  // 延迟一下，确保模态框内容已渲染
  nextTick(() => {
    // 查找裁剪器元素（带有cropper类的元素）
    if (modalBackdrop.value) {
      cropperElement = modalBackdrop.value.querySelector('.cropper-container');
    }
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', startCropTracking);
  document.removeEventListener('mouseup', endCropTracking);
});

// 当开始在裁剪器上操作时设置标志
function startCropTracking(event) {
  if (cropperElement && cropperElement.contains(event.target)) {
    isCropping.value = true;
  }
}

// 操作完成时清除标志
function endCropTracking() {
  isCropping.value = false;
}

// 处理点击背景的事件
function handleBackdropClick(event) {
  // 如果点击的是背景遮罩本身，并且不是在裁剪过程中，则关闭模态框
  if (event.target === modalBackdrop.value && !isCropping.value) {
    event.preventDefault();
    emit('close');
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 90%;
  width: 500px;
  max-height: 85vh;
  /* 减小最大高度 */
  margin: 2rem auto;
  /* 添加上下边距 */
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transform: translateY(-2%);
  /* 略微向上偏移 */
  transition: all 0.3s ease;
}

/* 调整滚动条样式 */
.modal-container::-webkit-scrollbar {
  width: 6px;
}

.modal-container::-webkit-scrollbar-track {
  background: transparent;
}

.modal-container::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.5);
  border-radius: 3px;
}

.modal-container::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.8);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(226, 232, 240, 0.7);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
  padding: 0;
}

.modal-title.danger {
  color: #e74c3c;
}

.close-button {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(226, 232, 240, 0.5);
  color: #64748b;
  transform: rotate(90deg);
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.modal-content {
  margin-bottom: 1rem;
}

/* 动画效果 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    padding: 1.25rem;
    margin: 1rem auto;
    /* 移动端减小边距 */
    max-height: 90vh;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .close-button svg {
    width: 18px;
    height: 18px;
  }
}
</style>
