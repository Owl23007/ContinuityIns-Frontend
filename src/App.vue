<template>
  <div id="app">
    <component :is="layout">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </component>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const route = useRoute()
const layout = computed(() => {
  const layoutName = route.meta.layout || 'DefaultLayout'
  return layoutName === 'AuthLayout' ? AuthLayout : DefaultLayout
})
</script>

<style>
:root {
  /* 基础颜色 */
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --background-color: #ffffff;
  --text-color: #333333;

  /* 颜色RGB值 */
  --background-color-rgb: 255, 255, 255;
  --primary-color-rgb: 44, 62, 80;

  /* 功能颜色 */
  --hover-bg: #f8f9fa;
  --shadow-color: rgba(0, 0, 0, 0.15);
  --border-color: #e0e0e0;

  /* 布局变量 */
  --container-width: 1200px;
  --padding-x: 2rem;
  --header-bg-alpha: 0.9;
}

[data-theme='dark'] {
  --primary-color: #ecf0f1;
  --secondary-color: #3498db;
  --background-color: #1a202c;
  --text-color: #ecf0f1;
  --hover-bg: #2d3748;

  /* 暗色模式的RGB值 */
  --background-color-rgb: 26, 32, 44;
  --primary-color-rgb: 236, 240, 241;

  --shadow-color: rgba(255, 255, 255, 0.1);
  --border-color: #2d3748;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--background-color);
  color: var(--text-color);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    box-shadow 0.3s ease;
}

body {
  font-family:
    'Segoe UI',
    system-ui,
    -apple-system,
    sans-serif;
  line-height: 1.6;
  background: var(--background-color);
  color: var(--text-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.no-underline {
  text-decoration: none;
  color: inherit;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 瀑布流相关样式 */
.waterfall-container {
  margin: 0 auto;
  width: 100%;
}

.waterfall-item {
  break-inside: avoid;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .waterfall-item {
    margin-bottom: 15px;
  }
}

/* 文章卡片动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.article-card {
  animation: fadeInUp 0.5s ease forwards;
  animation-delay: calc(var(--index) * 0.1s);
}
</style>
