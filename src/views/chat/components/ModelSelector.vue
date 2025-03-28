<template>
  <div class="model-selector" ref="modelSelectorRef">
    <button 
      type="button" 
      class="selector-button" 
      :class="{ active: isOpen }"
      @click="toggleDropdown"
    >
      <span>{{ selectedModelName }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </button>
    
    <div class="model-list" :class="{ active: isOpen }">
      <div 
        v-for="model in models" 
        :key="model.id"
        class="model-option" 
        :class="{ selected: modelId === model.id }"
        @click="selectModel(model.id)"
      >
        <div class="model-option-header">
          <span class="model-name">{{ model.name }}</span>
          <div class="model-tags">
            <span class="model-tag" v-for="tag in model.tag" :key="tag">{{ tag }}</span>
          </div>
        </div>
        <p class="model-description">{{ model.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelId'])

const models = [
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    description: 'DeepSeek-V3 为自研 MoE 模型，671B 参数，激活 37B，在 14.8T token 上进行了预训练，在长文本、代码、数学、百科、中文 能力上表现优秀。',
    tag: ['文本生成', '64k']
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    description: 'DeepSeek-R1 在后训练阶段大规模使用了强化学习技术，在仅有极少标注数据的情况下，极大提升了模型推理能力。',
    tag: ['模型推理', '64k']
  },
  {
    id: 'qwq-plus',
    name: '通义千问 QwQ Plus',
    description: '通义千问QwQ推理模型增强版，基于Qwen2.5模型训练的QwQ推理模型，通过强化学习大幅度提升了模型推理能力。',
    tag: ['模型推理', '128k']
  },
  {
    id: 'qwen-max-2025-01-25',
    name: '通义千问-Max',
    description: '通义千问系列效果最好的模型，中英文code能力、逻辑能力、多语言能力显著提升，回复风格面向人类偏好进行大幅调整，模型回复详实程度和格式清晰度明显改善，创作类专项、json格式遵循专项、角色扮演专项能力定向提升，此模型为通义千问-Max的2025年1月25日快照版本，预计维护至下一个快照上线前一个月。',
    tag: ['文本生成', '32k']
  }
]

const isOpen = ref(false)
const modelSelectorRef = ref(null)

const selectedModelName = computed(() => {
  const model = models.find(m => m.id === props.modelId)
  return model ? model.name : '选择模型'
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

// 处理点击外部关闭下拉菜单
const handleOutsideClick = (event) => {
  if (isOpen.value && modelSelectorRef.value && !modelSelectorRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

// 添加和移除事件监听器
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

const selectModel = (id) => {
  emit('update:modelId', id)
  isOpen.value = false
}
</script>

<style scoped>
.model-select {
  width: 100%;
  position: relative;
}

.select-style {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  color: #2d3748;
  font-size: 0.95rem;
  appearance: none;
  cursor: pointer;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%236B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  transition: all 0.2s ease;
}

.select-style:hover {
  border-color: #cbd5e0;
  background-color: #f8fafc;
}

.select-style:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.model-selector {
  width: 100%;
  position: relative;
  z-index: 20; /* 增加z-index确保下拉菜单显示在其他元素之上 */
}

.selector-button {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  height: 44px; /* 匹配输入框高度 */
}

.selector-button:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.selector-button svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.selector-button.active svg {
  transform: rotate(180deg);
}

.model-list {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 300%;
  max-height: 380px; /* 限制最大高度 */
  overflow-y: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 30;
  scrollbar-width: thin;
}

.model-list.active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.model-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  color: #64748b;
  font-size: 0.9rem;
  border-bottom: 1px solid #f1f5f9;
}

.model-option:last-child {
  border-bottom: none;
}

.model-option:hover {
  background: #f8fafc;
  color: #3b82f6;
}

.model-option.selected {
  background: #eff6ff;
  color: #3b82f6;
}

.model-option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.model-name {
  font-weight: 500;
  color: #334155;
}

.model-tags {
  display: flex;
  gap: 8px;
}

.model-tag {
  padding: 2px 6px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
}

.model-description {
  font-size: 0.8rem;
  color: #64748b;
  margin: 4px 0 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 滚动条样式 */
.model-list::-webkit-scrollbar {
  width: 4px;
}

.model-list::-webkit-scrollbar-track {
  background: transparent;
}

.model-list::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.5);
  border-radius: 2px;
}

.model-list::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.8);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .model-list {
    bottom: auto;
    top: 100%;
    margin-bottom: 0;
    margin-top: 4px;
    max-height: 320px;
  }
  
  .selector-button {
    height: 40px;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .selector-button {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(51, 65, 85, 0.8);
    color: #e2e8f0;
  }
  
  .selector-button:hover {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(71, 85, 105, 0.8);
  }
  
  .model-list {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(51, 65, 85, 0.8);
  }
  
  .model-option {
    color: #cbd5e0;
    border-bottom-color: rgba(51, 65, 85, 0.8);
  }
  
  .model-option:hover {
    background: rgba(51, 65, 85, 0.5);
    color: #60a5fa;
  }
  
  .model-option.selected {
    background: rgba(30, 58, 138, 0.3);
    color: #60a5fa;
  }
  
  .model-name {
    color: #e2e8f0;
  }
  
  .model-tag {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
  }
  
  .model-description {
    color: #94a3b8;
  }
}
</style>