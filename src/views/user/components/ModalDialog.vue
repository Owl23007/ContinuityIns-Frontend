<template>
  <div class="modal-backdrop" @mousedown="handleBackdropClick" ref="modalBackdrop">
    <div class="modal-container" :class="theme">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button class="close-button" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">
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
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalFadeIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

.close-button:hover {
  color: #555;
}

.modal-body {
  padding: 1.5rem;
}

.modal-container.danger .modal-header {
  background-color: #ffebee;
  border-bottom-color: #ffcdd2;
}

.modal-container.danger .modal-header h2 {
  color: #d32f2f;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
}
</style>
