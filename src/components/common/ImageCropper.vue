<template>
  <div class="image-cropper" ref="cropperWrapper">
    <div class="cropper-container" :style="containerStyle">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        ref="cropperImage"
        class="crop-image"
        @load="onImageLoaded"
      />
      <div v-else class="image-placeholder">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <p>正在加载图片...</p>
      </div>
    </div>

    <div class="cropper-controls" v-if="cropperReady">
      <button class="btn btn-rotate" @click.stop="rotateLeft" title="向左旋转">
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
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
      </button>
      <button class="btn btn-rotate" @click.stop="rotateRight" title="向右旋转">
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
          <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
        </svg>
      </button>
      <button class="btn btn-zoom-in" @click.stop="zoomIn" title="放大">
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
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button class="btn btn-zoom-out" @click.stop="zoomOut" title="缩小">
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
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button class="btn btn-reset" @click.stop="reset" title="重置">
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
          <path d="M3 2v6h6"></path>
          <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
          <path d="M21 22v-6h-6"></path>
          <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
        </svg>
      </button>
    </div>

    <div class="cropper-actions">
      <button class="btn btn-cancel" @click.stop="$emit('cancel')">取消</button>
      <button
        class="btn btn-confirm"
        @click.stop="crop"
        :disabled="isCropping || !cropperReady"
      >
        {{ isCropping ? "处理中..." : "确认剪切" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

const props = defineProps({
  imageFile: {
    type: [File, String],
    required: true,
  },
  aspectRatio: {
    type: Number,
    default: 1,
  },
  circularCrop: {
    type: Boolean,
    default: false,
  },
  minWidth: {
    type: Number,
    default: 100,
  },
  minHeight: {
    type: Number,
    default: 100,
  },
  lockAspectRatio: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["crop-complete", "cancel"]);
const cropperImage = ref(null);
const cropperWrapper = ref(null);
const cropper = ref(null);
const isCropping = ref(false);
const imageUrl = ref("");
const cropperReady = ref(false);
const imageNaturalWidth = ref(0);
const imageNaturalHeight = ref(0);

// 根据图片尺寸动态计算容器样式
const containerStyle = computed(() => {
  if (!imageNaturalWidth.value || !imageNaturalHeight.value) {
    return {
      width: "100%",
      height: "400px",
    };
  }

  const ratio = imageNaturalWidth.value / imageNaturalHeight.value;
  const maxWidth = 600; // 最大宽度
  let containerWidth = Math.min(maxWidth, window.innerWidth * 0.9);
  let containerHeight;

  // 超宽图片（比例大于2:1）
  if (ratio > 2) {
    containerHeight = Math.min(400, containerWidth / ratio);
  }
  // 超高图片（比例小于1:2）
  else if (ratio < 0.5) {
    containerHeight = Math.min(500, containerWidth / ratio);
  }
  // 标准比例图片
  else {
    containerHeight = Math.min(400, containerWidth / ratio);
  }

  return {
    width: `${containerWidth}px`,
    height: `${containerHeight}px`,
  };
});

// 创建图片URL
const createImageUrl = (file) => {
  if (typeof file === "string") {
    return file;
  } else if (file instanceof File) {
    return URL.createObjectURL(file);
  }
  return "";
};

// 阻止事件冒泡的函数
const stopEventPropagation = (e) => {
  e.stopPropagation();
};

// 图片加载完成后初始化裁剪器
const onImageLoaded = () => {
  if (!cropperImage.value) return;

  // 获取图片原始尺寸
  imageNaturalWidth.value = cropperImage.value.naturalWidth;
  imageNaturalHeight.value = cropperImage.value.naturalHeight;

  // 确保销毁之前的裁剪实例
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }

  // 初始化Cropper实例
  setTimeout(() => {
    cropper.value = new Cropper(cropperImage.value, {
      aspectRatio: props.lockAspectRatio ? props.aspectRatio : NaN,
      viewMode: 1,
      minCropBoxWidth: Math.min(props.minWidth, 50),
      minCropBoxHeight: Math.min(props.minHeight, 50),
      cropBoxResizable: true,
      cropBoxMovable: true,
      dragMode: "move",
      guides: true,
      highlight: true,
      background: false,
      autoCropArea: 0.8,
      responsive: true,
      toggleDragModeOnDblclick: true,
      ready: () => {
        cropperReady.value = true;
        // 为cropper元素添加事件监听器阻止事件冒泡
        const cropperElements = document.querySelectorAll(
          ".cropper-container, .cropper-drag-box, .cropper-face, .cropper-view-box, .cropper-point, .cropper-line",
        );
        cropperElements.forEach((el) => {
          el.addEventListener("mousedown", stopEventPropagation);
        });
      },
    });
  }, 100); // 延迟初始化，确保容器尺寸已更新
};

// 监听imageFile变化
watch(
  () => props.imageFile,
  (newFile) => {
    if (newFile) {
      cropperReady.value = false;
      imageNaturalWidth.value = 0;
      imageNaturalHeight.value = 0;

      // 清除旧的URL对象
      if (imageUrl.value && imageUrl.value.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl.value);
      }

      // 创建新的URL
      imageUrl.value = createImageUrl(newFile);
    }
  },
  { immediate: true },
);

// 剪切图片
const crop = async () => {
  if (!cropper.value || isCropping.value) return;

  isCropping.value = true;

  try {
    // 获取裁剪的Canvas
    const canvas = cropper.value.getCroppedCanvas({
      minWidth: props.minWidth,
      minHeight: props.minHeight,
      maxWidth: 4096,
      maxHeight: 4096,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    if (!canvas) {
      throw new Error("剪切图片失败");
    }

    // 如果需要圆形剪切，使用Canvas API绘制圆形
    if (props.circularCrop) {
      const circularCanvas = document.createElement("canvas");
      const ctx = circularCanvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      circularCanvas.width = width;
      circularCanvas.height = height;

      ctx.beginPath();
      ctx.arc(
        width / 2,
        height / 2,
        Math.min(width, height) / 2,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(canvas, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], "cropped-image.png", {
            type: "image/png",
          });
          emit("crop-complete", {
            file: croppedFile,
            dataUrl: circularCanvas.toDataURL("image/png"),
          });
          isCropping.value = false;
        }
      }, "image/png");
    } else {
      // 直接使用矩形剪切结果
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], "cropped-image.png", {
            type: "image/png",
          });
          emit("crop-complete", {
            file: croppedFile,
            dataUrl: canvas.toDataURL("image/png"),
          });
          isCropping.value = false;
        }
      }, "image/png");
    }
  } catch (error) {
    console.error("剪切图片时出错:", error);
    isCropping.value = false;
  }
};

// 控制方法
const rotateLeft = () => cropper.value?.rotate(-90);
const rotateRight = () => cropper.value?.rotate(90);
const zoomIn = () => cropper.value?.zoom(0.1);
const zoomOut = () => cropper.value?.zoom(-0.1);
const reset = () => cropper.value?.reset();

// 添加事件监听器阻止冒泡
onMounted(() => {
  if (props.imageFile) {
    imageUrl.value = createImageUrl(props.imageFile);
  }

  // 为整个裁剪器容器添加事件监听器阻止冒泡
  if (cropperWrapper.value) {
    cropperWrapper.value.addEventListener("mousedown", stopEventPropagation);
  }
});

onBeforeUnmount(() => {
  // 销毁Cropper实例
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }

  // 释放blob URL
  if (imageUrl.value && imageUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(imageUrl.value);
  }

  // 移除事件监听器
  if (cropperWrapper.value) {
    cropperWrapper.value.removeEventListener("mousedown", stopEventPropagation);
  }

  // 移除cropper元素的事件监听器
  const cropperElements = document.querySelectorAll(
    ".cropper-container, .cropper-drag-box, .cropper-face, .cropper-view-box, .cropper-point, .cropper-line",
  );
  cropperElements.forEach((el) => {
    el.removeEventListener("mousedown", stopEventPropagation);
  });
});

// 监听窗口大小变化，重新计算容器尺寸
window.addEventListener("resize", () => {
  if (cropper.value) {
    setTimeout(() => {
      cropper.value.resize();
    }, 200);
  }
});
</script>

<style scoped>
.image-cropper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.cropper-container {
  margin: 10px auto 10px auto;
  width: 100%;
  max-width: 500px;
  background-color: #f5f5f5;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: height 0.3s ease;
}

.crop-image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  opacity: 0;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  height: 100%;
}

.image-placeholder svg {
  margin-bottom: 10px;
  color: #999;
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

.cropper-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn svg {
  vertical-align: middle;
}

.btn-rotate,
.btn-zoom-in,
.btn-zoom-out,
.btn-reset {
  background-color: #f0f0f0;
  color: #333;
  width: 40px;
  height: 40px;
  padding: 0;
}

.btn-rotate:hover,
.btn-zoom-in:hover,
.btn-zoom-out:hover,
.btn-reset:hover {
  background-color: #e0e0e0;
}

.cropper-actions {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #333;
  padding: 10px 20px;
}

.btn-confirm {
  background-color: #42b983;
  color: white;
  padding: 10px 20px;
}

.btn-confirm:hover {
  background-color: #3aa876;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 确保剪切操作元素在模态框内正常工作 */
:deep(.cropper-crop-box),
:deep(.cropper-drag-box),
:deep(.cropper-modal),
:deep(.cropper-view-box),
:deep(.cropper-face),
:deep(.cropper-line),
:deep(.cropper-point) {
  position: absolute !important;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .cropper-container {
    height: 300px !important;
  }
}
</style>
