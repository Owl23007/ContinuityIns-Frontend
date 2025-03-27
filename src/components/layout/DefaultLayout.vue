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

<style>
:root {
  --header-height: 64px;
  --footer-height: 120px;
  --container-width: 1200px;
  --padding-x: 2rem;
}
</style>

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
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));
  position: relative;
  display: flex; 
  flex-direction: column; 
  overflow-x: hidden; 
}

.container {
  width: 100%;
  max-width: var(--container-width);
  margin: 0 auto; /* 修改为 0 auto 使内容居中 */
  flex: 1; 
  display: flex; 
  flex-direction: column; 
}

@media (max-width: 1279px) {
  :root {
    --container-width: 960px;
  }
}

@media (max-width: 768px) {
  :root {
    --container-width: 100%;
    --padding-x: 1.5rem;
    --footer-height: 160px;
  }
  
  .container {
    width: 100%;
    padding: 0 var(--padding-x);
  }
  
  .main-content {
    padding: 1rem 0;
  }
}

@media (max-width: 480px) {
  :root {
    --padding-x: 1rem;
    --header-height: 56px;
  }
}
</style>
