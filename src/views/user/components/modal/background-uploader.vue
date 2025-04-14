<template>
  <div class="background-uploader">
    <div v-if="!selectedFile && !isUploading" class="file-upload-area" @click="triggerFileInput">
      <div class="upload-instructions">
        <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
          fill="none" stroke="#42b983" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <p>点击或拖拽图片到这里上传</p>
        <p class="upload-hint">推荐尺寸 1920×1080，支持 JPG, PNG 格式</p>
      </div>
      <input type="file" ref="fileInput" accept="image/jpeg,image/png" @change="handleFileSelect" class="file-input" />
    </div>

    <!-- 图片剪切区域 -->
    <div v-if="selectedFile && !isUploading" class="cropper-area">
      <image-cropper :image-file="selectedFile" :aspect-ratio="16 / 9" :min-width="100" :min-height="100"
        :lock-aspect-ratio="true" @crop-complete="handleCropComplete" @cancel="resetUpload" />
    </div>

    <div v-if="isUploading" class="uploading-feedback">
      <div class="spinner"></div>
      <p>正在上传背景图片...</p>
    </div>

    <div class="upload-error" v-if="uploadError">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e74c3c"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>{{ uploadError }}</p>
      <button @click="resetUpload" class="retry-button">重试</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import ImageCropper from '@/components/common/ImageCropper.vue';
import { uploadFile, validateFile } from '@/api/file';

const authStore = useAuthStore();
const emit = defineEmits(['background-updated', 'cancel']);

const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false
  },
  token: {
    type: String,
    required: true
  }
});

const fileInput = ref(null);
const selectedFile = ref(null);
const isUploading = ref(false);
const uploadError = ref('');

// 触发文件选择框
function triggerFileInput() {
  fileInput.value.click();
}

// 处理文件选择
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    try {
      validateFile(file, 'background');
      selectedFile.value = file;
      uploadError.value = '';
    } catch (error) {
      uploadError.value = error.message;
    }
  }
}

// 处理裁剪完成
async function handleCropComplete(cropResult) {
  if (!cropResult || !cropResult.file) {
    uploadError.value = '图片处理失败';
    return;
  }

  if (!props.token) {
    uploadError.value = '未登录，请重新登录后再试';
    return;
  }

  isUploading.value = true;
  uploadError.value = '';

  try {
    const { url: accessUrl } = await uploadFile(cropResult.file, "background");
    await authStore.updateUserProfile({ backgroundImage: accessUrl });
    emit('background-updated');
    return;
  } catch (error) {
    console.error('上传背景图片失败:', error);
    uploadError.value = error.message || '上传失败，请重试';
  } finally {
    isUploading.value = false;
  }
}

// 重置上传状态
function resetUpload() {
  selectedFile.value = null;
  uploadError.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}
</script>

<style scoped>
.background-uploader {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.file-upload-area {
  border: 2px dashed rgba(203, 213, 225, 0.6);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.file-upload-area:hover {
  border-color: #42b983;
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.file-upload-area.dragging {
  border-color: #42b983;
  background: rgba(66, 185, 131, 0.1);
}

.upload-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: rgba(66, 185, 131, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.upload-icon svg {
  width: 32px;
  height: 32px;
  color: #42b983;
}

.upload-text {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.9rem;
  color: var(--text-muted);
  max-width: 80%;
  margin: 0 auto;
}

.file-input {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}

.preview-container {
  margin-top: 1.5rem;
  text-align: center;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 12px;
}

.error-container {
  margin-top: 1rem;
  padding: 1.5rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-container svg {
  color: #e74c3c;
  width: 32px;
  height: 32px;
}

.error-container p {
  color: #e74c3c;
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

.retry-button {
  background: transparent;
  border: 2px solid #e74c3c;
  color: #e74c3c;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #e74c3c;
  color: white;
  transform: translateY(-2px);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border-radius: 16px;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(66, 185, 131, 0.1);
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  color: var(--text-secondary);
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .file-upload-area {
    padding: 1.5rem;
  }

  .upload-icon {
    width: 48px;
    height: 48px;
  }

  .upload-icon svg {
    width: 24px;
    height: 24px;
  }

  .upload-text {
    font-size: 1rem;
  }

  .upload-hint {
    max-width: 100%;
  }

  .preview-image {
    max-height: 200px;
  }

  .retry-button {
    width: 100%;
  }
}
</style>
