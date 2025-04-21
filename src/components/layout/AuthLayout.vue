<template>
  <div class="auth-layout">
    <div class="logo-container">
      <router-link to="/">
        <img :src="logoPic" alt="logo" />
        <span class="site-name">存续院</span>
      </router-link>
    </div>
    <main class="auth-content">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import logoPic from '@/assets/svg/logo.svg'
</script>

<style scoped>
.auth-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(45deg, #2c3e50 0%, #3498db 50%, #2ecc71 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow: hidden;
  padding: clamp(1rem, 3vw, 2rem);
  box-sizing: border-box;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.auth-layout::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.07) 8%, transparent 8%);
  background-size: 25px 25px;
  transform: rotate(30deg);
  animation: moveBackground 60s linear infinite;
  opacity: 0.5;
}

.auth-layout::after {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(100px);
  z-index: 0;
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
  margin-bottom: clamp(2rem, 5vw, 3rem);
  text-align: center;
  position: relative;
  z-index: 1;
  animation: fadeInDown 1.2s ease;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-container a {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #ffffff;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.5rem 1.5rem;
}

.logo-container a:hover {
  transform: scale(1.02) translateY(-3px);
}

.logo-container img {
  width: clamp(44px, 6vw, 52px);
  height: clamp(44px, 6vw, 52px);
  border-radius: 14px;

  transition: all 0.4s ease;
  filter: brightness(1.05);
}

.logo-container a:hover img {
  transform: rotate(-5deg);
}

.site-name {
  margin-left: clamp(0.8rem, 2.5vw, 1.2rem);
  font-size: clamp(1.4rem, 3.5vw, 2rem);
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 8px rgba(255, 255, 255, 0.15);
  position: relative;
  transition: all 0.4s ease;
  filter: brightness(1.2) contrast(1.1);
}

.logo-container a:hover .site-name {
  transform: translateX(5px);
  background: linear-gradient(135deg, #ffffff 0%, #ffffff 70%);
  -webkit-background-clip: text;
  background-clip: text;
  filter: brightness(1.3) contrast(1.2);
}

.auth-content {
  width: min(90%, 1200px);
  padding: clamp(1.25rem, 3vw, 2.5rem);
  margin: 0 auto;
  background: rgba(255, 255, 255, 0);

  backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;
  animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 平板电脑布局 */
@media (max-width: 768px) {
  .auth-content {
    width: min(92%, 500px);
    margin: 0 auto;
  }
}

/* 移动设备布局 */
@media (max-width: 480px) {
  .auth-content {
    width: 100%;
    /* 改为全宽 */
    padding: 1rem;
    margin: 0;
    border-radius: 0;
    /* 移除圆角 */
  }

  .site-name {
    font-size: 1.6rem;
    /* 增大字体 */
  }

  .logo-container {
    margin-bottom: 2rem;
    /* 增加底部间距 */
  }

  .logo-container img {
    width: 48px;
    /* 增大logo尺寸 */
    height: 48px;
  }
}

/* 确保在小屏幕设备上的触摸友好性 */
@media (hover: none) and (pointer: coarse) {
  .logo-container a,
  .auth-content button {
    padding: 0.5rem;
  }

  .logo-container a:active {
    transform: scale(0.98);
  }
}

/* 处理横屏模式 */
@media (max-height: 600px) and (orientation: landscape) {
  .logo-container {
    margin-bottom: 1rem;
  }

  .auth-content {
    padding: 1rem;
    max-height: 85vh;
    overflow-y: auto;
  }
}

/* 处理超大屏幕 */
@media (min-width: 1920px) {
  .auth-content {
    width: min(85%, 500px);
    padding: 3rem;
  }

  .site-name {
    font-size: 2rem;
  }

  .logo-container img {
    width: 56px;
    height: 56px;
  }
}

/* 支持深色模式 */
@media (prefers-color-scheme: dark) {
  .auth-content {
    background: rgba(255, 255, 255, 0.92);
  }
}

@media (max-width: 480px) {
  .auth-content {
    width: calc(100% - 2rem);
    padding: 1.5rem;
    margin: 0 1rem;
    border-radius: 20px;
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
