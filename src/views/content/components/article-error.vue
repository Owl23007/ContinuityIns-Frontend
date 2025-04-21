<template>
  <div class="error-state">
    <div class="error-icon">
      <svg viewBox="0 0 24 24" width="64" height="64">
        <path
          fill="#ff4d4f"
          d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M13,17h-2v-2h2V17z M13,13h-2V7h2V13z"
        />
      </svg>
    </div>
    <h3 class="error-title">加载失败</h3>
    <p class="error-message">{{ error }}</p>
    <el-button type="primary" @click="$emit('retry')" class="retry-button">
      <el-icon>
        <Refresh />
      </el-icon>
      重新加载
    </el-button>
  </div>
</template>

<script setup>
import { Refresh } from '@element-plus/icons-vue'

defineProps({
  error: {
    type: String,
    required: true,
  },
})

defineEmits(['retry'])
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 2rem;
}

.error-icon {
  margin-bottom: 1.5rem;
  animation: bounce 0.6s;
}

.error-title {
  font-size: 1.5rem;
  color: #ff4d4f;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #666;
  margin-bottom: 2rem;
  max-width: 500px;
}

.retry-button {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-20px);
  }

  60% {
    transform: translateY(-10px);
  }
}
</style>
