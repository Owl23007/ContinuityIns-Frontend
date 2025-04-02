<template>
  <header class="header_style">
    <!--左侧logo-->
    <div class="nav_left">
      <div class="nav_logo_title" @click="tohome">
        <nav>
          <router-link to="/" class="logo no-underline">
            <img :src="logoPic" alt="logo">
            <div class="title-container">
              <span class="nav_title">存续院</span>
            </div>
          </router-link>
        </nav>
      </div>
    </div>

    <!--中间导航栏-->
    <div class="nav_links">
      <div class="header_button">
        <router-link to="/" class="no-underline">
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18V42H39V18L24 6L9 18Z" fill="none" stroke="currentColor" stroke-width="4"
              stroke-linecap="round" stroke-linejoin="round" />
            <path d="M19 29V42H29V29H19Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" />
            <path d="M9 42H39" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
          </svg>
          主页
        </router-link>
      </div>

      <div class="header_button">
        <router-link to="/article" class="no-underline">
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M39 4H11C9.89543 4 9 4.89543 9 6V42C9 43.1046 9.89543 44 11 44H39C40.1046 44 41 43.1046 41 42V6C41 4.89543 40.1046 4 39 4Z"
              fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M17 30L31 30" stroke="currentColor" stroke-width="4" stroke-linecap="round"
              stroke-linejoin="round" />
            <path d="M17 36H24" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <rect x="17" y="12" width="14" height="10" fill="none" stroke="currentColor" stroke-width="4"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          文章
        </router-link>
      </div>

      <div class="header_button">
        <router-link to="/chat" class="no-underline">
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="4"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 8h40v24H13l-9 8V8z" />
          </svg>
          对话
        </router-link>
      </div>

      <div class="nav_search">
        <input type="text" placeholder="世界在你脚下..." class="search_input">
        <button class="search_button">搜索</button>
      </div>
    </div>

    <!--右侧导航栏-->
    <div class="nav_right">
      <div class="button-with-icon" v-if="isLoggedIn">
        <router-link to="/submit" class="no-underline">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p>投稿</p>
        </router-link>
      </div>

      <div v-if="isLoggedIn">
        <user-dropdown />
      </div>
      <div v-else>
        <router-link to="/auth" class="login-button no-underline">
          <span>登录/注册</span>
        </router-link>
      </div>
    </div>

    <!--汉堡菜单按钮-->
    <div class="hamburger-menu" @click="toggleMobileMenu">
      <div class="hamburger-icon" :class="{ 'active': isMobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!--移动端菜单-->
    <div class="mobile-menu" :class="{ 'active': isMobileMenuOpen }">
      <div class="mobile-search">
        <input type="text" placeholder="世界在你脚下..." class="mobile-search-input">
        <button class="search_button">搜索</button>
      </div>
      <router-link to="/" class="mobile-menu-item" @click="closeMobileMenu">主页</router-link>
      <router-link to="/article" class="mobile-menu-item" @click="closeMobileMenu">文章</router-link>
      <router-link to="/chat" class="mobile-menu-item" @click="closeMobileMenu">对话</router-link>

      <router-link to="/auth" class="login-button no-underline">
        <span>登录/注册</span>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserDropdown from '@/components/layout/UserDropdown.vue'
import logoPic from '@/assets/svg/logo.svg'

const authStore = useAuthStore()
const router = useRouter()
const isLoggedIn = computed(() => authStore.isAuthenticated)

const tohome = () => {
  router.push('/')
}

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}
</script>

<style scoped>
.header_style {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  padding: 0 var(--padding-x);
  background: rgba(255, 255, 255, var(--header-bg-alpha));
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-color);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.nav_left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav_logo_title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo img {
  height: 40px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo:hover img {
  transform: scale(1.08) rotate(-5deg);
}

.title-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
}

.nav_title {
  font-size: 1.5rem;
  font-family: 'Montserrat', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 550;
  letter-spacing: 0.5px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  background: linear-gradient(90deg, #12c2e9, #c471ed, #f64f59);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: textflow 5s linear infinite;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.nav_title::after {
  content: 'Contins';
  font-size: 1.6rem;
  font-weight: 700;
  font-family: 'Poppins', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  opacity: 0.9;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #007cf0, #00dfd8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: textflow 4s linear infinite;
}

@keyframes textflow {
  0% {
    background-position: 0% center;
  }

  100% {
    background-position: 200% center;
  }
}

.logo:hover .nav_title,
.logo:hover .nav_subtitle {
  animation-play-state: paused;
}

.nav_links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header_button a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  color: var(--text-color);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header_button a:hover {
  background: var(--hover-bg);
  transform: translateY(-2px);
}

.nav_search {
  display: flex;
  gap: 0.8rem;
  margin-left: 2rem;
}

.search_input {
  padding: 0.6rem 1.2rem;
  border: 2px solid var(--border-color);
  border-radius: 30px;
  width: 280px;
  background: var(--background-color);
  color: var(--text-color);
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search_input:focus {
  border-color: var(--secondary-color);
  box-shadow: 0 0 12px rgba(52, 152, 219, 0.2);
}

.search_button {
  padding: 0.6rem 1.8rem;
  background: var(--primary-color);
  color: var(--background-color);
  border: none;
  border-radius: 30px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search_button:hover {
  transform: scale(1.05);
  opacity: 0.95;
}

.nav_right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.button-with-icon a {
  display: flex;
  flex-direction: row;
  /* 改为水平排列 */
  align-items: center;
  gap: 0.5rem;
  /* 调整间距 */
  padding: 0.6rem 1.2rem;
  color: var(--text-color);
  background: linear-gradient(135deg, #12c2e9, #c471ed);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-with-icon a p {
  margin: 0;
  font-weight: 500;
  color: white;
  line-height: 1;
  /* 调整文字行高 */
}

.button-with-icon a svg {
  color: white;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-with-icon a:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(18, 194, 233, 0.2);
}

.button-with-icon a:hover svg {
  transform: translateX(-2px);
  /* 改为水平方向的移动效果 */
}

.login-button {
  position: relative;
  padding: 0.6rem 1.8rem;
  background: linear-gradient(135deg, #00c6fb, #005bea);
  color: white;
  border-radius: 30px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 91, 234, 0.1);
}

.login-button span {
  position: relative;
  z-index: 2;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(to right, #ffffff, #e6e6e6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.login-button:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #005bea, #00c6fb);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.login-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 91, 234, 0.15);
}

.login-button:hover:before {
  opacity: 1;
}

.login-button:hover span {
  transform: scale(1.02);
  letter-spacing: 1px;
}

.login-button:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 2px 10px rgba(0, 91, 234, 0.1);
}

.login-button:active span {
  transform: scale(0.95);
}

/* 移动端特殊样式 */
.mobile-menu .login-button {
  width: calc(100% - 2rem);
  margin: 1.5rem 1rem;
  padding: 1rem;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #00c6fb, #005bea);
  box-shadow: 0 4px 15px rgba(0, 91, 234, 0.15);
}

.hamburger-menu {
  display: none;
  cursor: pointer;
  z-index: 999;
}

.hamburger-icon {
  width: 30px;
  height: 20px;
  position: relative;
  transition: 0.3s;
}

.hamburger-icon span {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: var(--text-color);
  transition: 0.3s;
}

.hamburger-icon span:nth-child(1) {
  top: 0;
}

.hamburger-icon span:nth-child(2) {
  top: 9px;
}

.hamburger-icon span:nth-child(3) {
  top: 18px;
}

.hamburger-icon.active span:nth-child(1) {
  transform: rotate(45deg);
  top: 9px;
}

.hamburger-icon.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-icon.active span:nth-child(3) {
  transform: rotate(-45deg);
  top: 9px;
}

.mobile-menu {
  height: 470px;
  display: none;
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  padding: 2rem;
  transform: translateX(100%);
  transition: 0.3s;
  z-index: 999;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.mobile-menu.active {
  transform: translateX(0);
}

.mobile-menu-item {
  display: block;
  padding: 1rem;
  font-size: 1.2rem;
  color: var(--text-color);
  text-decoration: none;
  border-bottom: 1px solid var(--border-color);
}

.mobile-search {
  display: flex;
  margin-top: 2rem;
}

.mobile-search-input {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.mobile-menu .login-button {
  width: 100%;
  margin-top: 1rem;
  text-align: center;
  font-size: 1.1rem;
  padding: 0.8rem;
}

@media (max-width: 1024px) {
  .header_style {
    padding: 0 1.5rem;
  }

  .nav_links {
    gap: 0.5rem;
    /* 减小导航项之间的间距 */
  }

  .header_button a {
    padding: 0.6rem 1rem;
    /* 减小按钮内边距 */
    font-size: 0.9rem;
    /* 稍微减小字体大小 */
  }

  .search_input {
    width: 180px;
  }

  .nav_search {
    margin-left: 1rem;
    /* 减小搜索框左边距 */
  }

  .search_button {
    padding: 0.6rem 1.2rem;
    /* 调整搜索按钮内边距 */
  }
}

/* 添加平板特定的样式 */
@media (min-width: 769px) and (max-width: 1240px) {
  .nav_links {
    gap: 0.1rem;
  }

  .header_button a {
    padding: 0.5rem;
    font-size: 0.85rem;
    gap: 0.2rem;
    white-space: nowrap;
    min-width: auto;
  }

  .nav_search {
    margin-left: 0.3rem;
    gap: 0.3rem;
  }

  .search_input {
    width: 110px;
    font-size: 0.85rem;
    padding: 0.5rem 0.8rem;
  }

  .search_button {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .nav_title {
    white-space: nowrap;
  }

  .nav_title::after {
    display: none;
  }

  .button-with-icon a {
    padding: 0.5rem 0.8rem;
  }

  .button-with-icon a p {
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .login-button {
    padding: 0.5rem 1rem;
  }

  .login-button span {
    font-size: 0.85rem;
    white-space: nowrap;
  }
}

@media (max-width: 768px) {
  .header_style {
    padding: 0 1rem;
  }

  .nav_links {
    display: none;
  }

  .nav_search {
    display: none;
  }

  .nav_right {
    display: none;
  }

  .hamburger-menu {
    display: block;
  }

  .mobile-menu {
    display: block;
  }

  .search_input {
    width: 160px;
    font-size: 14px;
    padding: 0.5rem 1rem;
  }

  .search_button {
    padding: 0.5rem 1.2rem;
    font-size: 14px;
  }

  .nav_title::after {
    display: none;
  }

  .nav_title {
    font-size: 1.3rem;
    /* 适当调小字号 */
  }
}
</style>
