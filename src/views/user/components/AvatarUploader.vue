<template>
  <div class="avatar-uploader">
    <div v-if="!selectedFile && !isUploading" class="file-upload-area">
      <div class="upload-instructions">
        <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
          fill="none" stroke="#42b983" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p>点击或拖拽图片到这里上传</p>
        <p class="upload-hint">支持 JPG, PNG 格式图片</p>
      </div>
      <input type="file" ref="fileInput" accept="image/jpeg,image/png" @change="handleFileSelect" class="file-input" />
    </div>

    <!-- 图片剪切区域 -->
    <div v-if="selectedFile && !isUploading" class="cropper-area">
      <image-cropper :image-file="selectedFile" :aspect-ratio="1" :circular-crop="true" :min-width="100"
        :min-height="100" :lock-aspect-ratio="true" @crop-complete="handleCropComplete" @cancel="resetUpload" />
    </div>

    <div v-if="isUploading" class="uploading-feedback">
      <div class="spinner"></div>
      <p>正在上传头像...</p>
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

const emit = defineEmits(['avatar-updated', 'cancel']);

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

// 选择文件
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    try {
      validateFile(file, 'avatar');
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
    const { url: accessUrl } = await uploadFile(cropResult.file, "avatar");
    await authStore.updateAvatar(accessUrl);
    emit('avatar-updated');
    return;
  } catch (error) {
    console.error('上传头像失败:', error);
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
.avatar-uploader {
  width: 100%;
  max-width: 500px;
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
  border-radius: 50%;
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
}

.preview-container {
  margin-top: 1.5rem;
  text-align: center;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-container {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.error-container svg {
  color: #e74c3c;
}

.error-container p {
  color: #e74c3c;
  margin: 0;
}

.retry-button {
  background: transparent;
  border: 2px solid #e74c3c;
  color: #e74c3c;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #e74c3c;
  color: white;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(66, 185, 131, 0.1);
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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

  .preview-image {
    max-width: 150px;
    max-height: 150px;
  }
}
</style>
