<template>
  <div class="avatar-uploader">
    <div v-if="!selectedFile && !isUploading" class="file-upload-area">
      <div class="upload-instructions">
        <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#42b983" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p>点击或拖拽图片到这里上传</p>
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
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
import { ref, inject } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import ImageCropper from '@/components/common/ImageCropper.vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const emit = defineEmits(['avatar-updated', 'cancel']);
const axios = inject('axios');

const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false
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
    // 验证文件类型
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      uploadError.value = '只支持 JPG 或 PNG 格式的图片';
      return;
    }

    // 验证文件大小 (限制为 8MB)
    if (file.size > 8 * 1024 * 1024) {
      uploadError.value = '图片大小不能超过 8MB';
      return;
    }

    selectedFile.value = file;
    uploadError.value = '';
  }
}

// 处理裁剪完成
async function handleCropComplete(cropResult) {
  try {
    if (!cropResult || !cropResult.file) {
      throw new Error('图片处理失败');
    }

    isUploading.value = true;
    uploadError.value = '';
    
    const formData = new FormData();
    formData.append('file', cropResult.file);
    
    const ossPolicy = await userStore.getOssPolicy();
    if (!ossPolicy) {
      throw new Error('获取上传凭证失败，请重新登录后重试');
    }
    
    // 上传到OSS
    try {
      formData.append('OSSAccessKeyId', ossPolicy.accessid);
      formData.append('policy', ossPolicy.policy);
      formData.append('signature', ossPolicy.signature);
      formData.append('key', `avatars/${Date.now()}-${cropResult.file.name}`);
      formData.append('success_action_status', '200');
      
      await axios.post(ossPolicy.host, formData);
      
      // 构建图片URL
      const imageUrl = `${ossPolicy.host}/${formData.get('key')}`;
      
      // 更新用户头像信息
      await authStore.updateUserProfile({
        avatarImage: imageUrl
      });
      
      emit('avatar-updated');
    } catch (uploadError) {
      throw new Error(uploadError.response?.data?.message || '图片上传失败，请重试');
    }
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
  border: 2px dashed #ddd;
  border-radius: 10px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.file-upload-area:hover {
  border-color: #42b983;
  background-color: #f0f7f4;
}

.upload-icon {
  font-size: 48px;
  color: #42b983;
  margin-bottom: 15px;
}

.upload-instructions p {
  margin: 5px 0;
  color: #666;
}

.upload-hint {
  font-size: 14px;
  color: #999;
  margin-top: 10px;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.uploading-feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(66, 185, 131, 0.2);
  border-top-color: #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-error {
  color: #e74c3c;
  background-color: #fdf1f0;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-error i {
  font-size: 24px;
  margin-bottom: 10px;
}

.retry-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #c0392b;
}

.cropper-area {
  margin: 20px 0;
  width: 100%;
}

.cropper-tips {
  margin-top: 10px;
  color: #666;
  font-size: 0.9rem;
  text-align: center;
  padding: 6px;
  background-color: #f0f7f4;
  border-radius: 6px;
  border-left: 3px solid #42b983;
}
</style>
