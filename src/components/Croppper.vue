<template>
    <div class="cropper-wrapper">
      <div v-if="showCropper" class="cropper-modal">
        <div class="cropper-content">
          <button class="close-btn" @click="closeCropper">×</button>
          
          <Cropper
            ref="cropper"
            :src="imageSrc"
            :stencil-props="{
              aspectRatio: aspectRatio,
              handlers: {},
              movable: false,
              scalable: false
            }"
            :resize-image="{
              adjustStencil: false
            }"
            class="cropper"
            @change="onCropChange"
          />
  
          <div class="cropper-controls">
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              v-model="zoom"
              @input="setZoom"
              class="zoom-slider"
            >
            <div class="control-buttons">
              <button @click="rotate(-90)" class="rotate-btn">↺</button>
              <button @click="rotate(90)" class="rotate-btn">↻</button>
              <button @click="reset" class="reset-btn">重置</button>
              <button @click="confirmCrop" class="confirm-btn">确认</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { Cropper } from 'vue-advanced-cropper'
  import 'vue-advanced-cropper/dist/style.css'
  
  const props = defineProps({
    modelValue: File,
    aspectRatio: { type: Number, default: 1 }, // 默认1:1比例
    quality: { type: Number, default: 0.8 },   // 压缩质量（0-1）
    outputType: { type: String, default: 'image/jpeg' } // 输出类型
  })
  
  const emit = defineEmits(['update:modelValue', 'cropped', 'error'])
  
  const cropper = ref(null)
  const imageSrc = ref('')
  const showCropper = ref(false)
  const zoom = ref(1)
  const coordinates = ref(null)
  
  // 监听文件变化
  watch(() => props.modelValue, async (file) => {
    if (file) {
      try {
        imageSrc.value = await readFile(file)
        showCropper.value = true
      } catch (error) {
        emitError('文件读取失败')
      }
    }
  })
  
  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('非图片文件'))
        return
      }
  
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
  
  const setZoom = () => {
    cropper.value?.zoom(zoom.value)
  }
  
  const rotate = (degrees) => {
    cropper.value?.rotate(degrees)
  }
  
  const reset = () => {
    cropper.value?.reset()
    zoom.value = 1
  }
  
  const onCropChange = ({ coordinates: coords }) => {
    coordinates.value = coords
  }
  
  const confirmCrop = async () => {
    try {
      const { canvas } = cropper.value.getResult()
      
      // 压缩处理
      canvas.toBlob(
        (blob) => {
          const file = new File([blob], `avatar_${Date.now()}`, {
            type: props.outputType,
            lastModified: Date.now()
          })
          emit('update:modelValue', file)
          emit('cropped', {
            file,
            dataUrl: URL.createObjectURL(blob)
          })
          closeCropper()
        },
        props.outputType,
        props.quality
      )
    } catch (error) {
      emitError('裁剪失败')
    }
  }
  
  const closeCropper = () => {
    showCropper.value = false
    imageSrc.value = ''
    coordinates.value = null
    zoom.value = 1
  }
  
  const emitError = (message) => {
    emit('error', message)
    closeCropper()
  }
  </script>
  
  <style scoped>
  .cropper-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .cropper-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 600px;
    position: relative;
  }
  
  .cropper {
    width: 100%;
    height: 400px;
  }
  
  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }
  
  .cropper-controls {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .zoom-slider {
    width: 100%;
  }
  
  .control-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  
  button {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .rotate-btn {
    background: #f0f0f0;
    color: #333;
  }
  
  .reset-btn {
    background: #ff9800;
    color: white;
  }
  
  .confirm-btn {
    background: #42b983;
    color: white;
  }
  
  button:hover {
    opacity: 0.9;
  }
  </style>
