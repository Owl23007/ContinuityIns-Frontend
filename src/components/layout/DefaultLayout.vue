<template>
  <div class="default-layout">
    <app-header />
    <main class="main-content">
      <div class="container">
        <slot></slot>
      </div>
    </main>
    <app-footer />
  </div>
</template>

<script setup>
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color);
}

.main-content {
  flex: 1;
  padding: 2rem 0;
  margin-top: 0;
}

.container {
  width: var(--container-width, 1200px);
  max-width: 100%;
  margin: 0 auto;
  padding: 0 var(--padding-x, 2rem);
  min-height: calc(100vh - 180px);
}

@media (max-width: 1279px) {
  .container {
    width: var(--container-width, 960px);
  }
}

@media (max-width: 768px) {
  .container {
    width: 100%;
    padding: 0 var(--padding-x, 1.5rem);
  }
  
  .main-content {
    padding: 1rem 0;
  }
}
</style>
