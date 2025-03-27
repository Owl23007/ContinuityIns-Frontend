<template>
  <div class="model-select">
    <select 
      :value="modelId" 
      @change="$emit('update:modelId', $event.target.value)"
      class="select-style"
    >
      <option value="gpt-3.5-turbo">GPT-3.5</option>
      <option value="gpt-4">GPT-4</option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelId: {
    type: String,
    required: true
  }
})

defineEmits(['update:modelId'])

const models = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: '最强大的模型，适合复杂任务'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5',
    description: '响应更快，成本更低'
  }
]
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
</style>