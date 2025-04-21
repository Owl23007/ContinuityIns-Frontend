<template>
  <div class="default-layout">
    <app-header />
    <main class="main-content">
      <div class="container">
        <slot></slot>
      </div>
    </main>
    <app-footer v-if="!isChat" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppHeader from "./AppHeader.vue";
import AppFooter from "./AppFooter.vue";

const route = useRoute();
const isChat = computed(() => route.path === "/chat");
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
  padding: 0;
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
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
    --padding-x: 0;
    --footer-height: 160px;
  }

  .container {
    width: 100%;
    padding: 0;
  }

  .main-content {
    padding: 0;
  }
}

@media (max-width: 480px) {
  :root {
    --padding-x: 0;
    --header-height: 56px;
  }
}
</style>
