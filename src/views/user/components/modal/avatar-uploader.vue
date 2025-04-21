<template>
  <div
    class="avatar-uploader"
    v-if="!selectedFile && !isUploading"
    @click="triggerFileInput"
    @dragenter.prevent="handleDragEnter"
    @dragleave.prevent="handleDragLeave"
    @dragover.prevent
    @drop.prevent="handleDrop"
    :class="{ dragging: isDragging }"
  >
    <div class="upload-instructions">
      <svg
        class="upload-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <p class="upload-text">点击或拖拽图片到这里上传</p>
      <p class="upload-hint">支持 JPG, PNG 格式图片</p>
    </div>
    <input
      type="file"
      ref="fileInput"
      accept="image/jpeg,image/png"
      @change="handleFileSelect"
      class="file-input"
    />
  </div>

  <!-- 图片剪切区域 -->
  <div v-if="selectedFile && !isUploading" class="cropper-area">
    <image-cropper
      :image-file="selectedFile"
      :aspect-ratio="1"
      :circular-crop="true"
      :min-width="100"
      :min-height="100"
      :lock-aspect-ratio="true"
      @crop-complete="handleCropComplete"
      @cancel="resetUpload"
    />
  </div>

  <div v-if="isUploading" class="uploading-feedback">
    <div class="spinner"></div>
    <p>正在上传头像...</p>
  </div>

  <div class="upload-error" v-if="uploadError">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#e74c3c"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
    <p>{{ uploadError }}</p>
    <button @click="resetUpload" class="retry-button">重试</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ImageCropper from '@/components/common/ImageCropper.vue'
import { uploadFile, validateFile } from '@/api/file'

const authStore = useAuthStore()

const emit = defineEmits(['avatar-updated', 'cancel'])

const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
    required: true,
  },
})

const fileInput = ref(null)
const selectedFile = ref(null)
const isUploading = ref(false)
const uploadError = ref('')
const isDragging = ref(false)

// 触发文件选择框
function triggerFileInput() {
  fileInput.value.click()
}

// 选择文件
function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    try {
      validateFile(file, 'avatar')
      selectedFile.value = file
      uploadError.value = ''
    } catch (error) {
      uploadError.value = error.message
    }
  }
}

// 处理拖拽进入
function handleDragEnter(e) {
  isDragging.value = true
}

// 处理拖拽离开
function handleDragLeave(e) {
  isDragging.value = false
}

// 处理拖拽放下
function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) {
    try {
      validateFile(file, 'avatar')
      selectedFile.value = file
      uploadError.value = ''
    } catch (error) {
      uploadError.value = error.message
    }
  }
}

// 处理裁剪完成
async function handleCropComplete(cropResult) {
  if (!cropResult || !cropResult.file) {
    uploadError.value = '图片处理失败'
    return
  }

  if (!props.token) {
    uploadError.value = '未登录，请重新登录后再试'
    return
  }

  isUploading.value = true
  uploadError.value = ''

  try {
    const { url: accessUrl } = await uploadFile(cropResult.file, 'avatar')
    await authStore.updateAvatar(accessUrl)
    emit('avatar-updated')
    return
  } catch (error) {
    console.error('上传头像失败:', error)
    uploadError.value = error.message || '上传失败，请重试'
  } finally {
    isUploading.value = false
  }
}

// 重置上传状态
function resetUpload() {
  selectedFile.value = null
  uploadError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.avatar-uploader {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  border: 2px dashed rgba(203, 213, 225, 0.6);
  border-radius: 16px;
  padding: 2.5rem;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-height: 250px;
  justify-content: center;
}

.cropper-area {
  width: auto;
}

.avatar-uploader:hover {
  border-color: #42b983;
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.avatar-uploader.dragging {
  border-color: #42b983;
  background: rgba(66, 185, 131, 0.1);
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(66, 185, 131, 0.15);
}

.upload-instructions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  width: 64px;
  height: 64px;
  padding: 16px;
  border-radius: 50%;
  background: rgba(66, 185, 131, 0.1);
  color: #42b983;
  transition: all 0.3s ease;
}

.avatar-uploader:hover .upload-icon {
  transform: translateY(-5px);
  background: rgba(66, 185, 131, 0.2);
}

.upload-text {
  font-size: 1.1rem;
  color: var(--text-primary, #2c3e50);
  font-weight: 500;
  margin: 0;
}

.upload-hint {
  font-size: 0.9rem;
  color: var(--text-secondary, #64748b);
  margin: 0;
}

.uploading-feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(66, 185, 131, 0.1);
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.upload-error {
  background: rgba(231, 76, 60, 0.1);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #e74c3c;
  margin-top: 1rem;
  backdrop-filter: blur(8px);
}

.retry-button {
  background: transparent;
  border: 2px solid #e74c3c;
  color: #e74c3c;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.retry-button:hover {
  background: #e74c3c;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.2);
}

.file-input {
  display: none;
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .avatar-uploader {
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
