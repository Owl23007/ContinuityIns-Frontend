<template>
  <div class="auth-layout">
    <div class="logo-container">
      <router-link to="/">
        <img :src="logoPic" alt="logo">
        <span class="site-name">存续院</span>
      </router-link>
    </div>
    <main class="auth-content">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import logoPic from '@/assets/image/logo.png'
</script>

<style scoped>
.auth-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

.auth-layout::before {
  content: "";
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 8%, transparent 8%);
  background-size: 25px 25px;
  transform: rotate(30deg);
  animation: moveBackground 60s linear infinite;
}

@keyframes moveBackground {
  0% {
    transform: rotate(30deg) translateY(0);
  }
  100% {
    transform: rotate(30deg) translateY(-100px);
  }
}

.logo-container {
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
}

.logo-container a {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--primary-color);
  transition: transform 0.3s ease;
}

.logo-container a:hover {
  transform: scale(1.05);
}

.logo-container img {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.site-name {
  margin-left: 1rem;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.auth-content {
  width: min(90%, 100%);  
  max-width: 100%;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  margin: 0 auto;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
  animation: slideUp 0.6s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .auth-content {
    width: calc(100% - 2rem);
    padding: 1.25rem;
    margin: 0 1rem;
  }

  .site-name {
    font-size: 1.5rem;
  }

  .logo-container img {
    width: 40px;
    height: 40px;
  }
}
</style>
