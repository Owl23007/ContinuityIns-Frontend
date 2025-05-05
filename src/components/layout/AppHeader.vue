<template>
  <header class="header_style">
    <!--左侧logo-->
    <div class="nav_left">
      <div class="nav_logo_title" @click="tohome">
        <nav>
          <router-link to="/" class="logo no-underline">
            <img :src="logoPic" alt="logo" />
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
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18V42H39V18L24 6L9 18Z"
              fill="none"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M19 29V42H29V29H19Z"
              fill="none"
              stroke="currentColor"
              stroke-width="4"
              stroke-linejoin="round"
            />
            <path d="M9 42H39" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
          </svg>
          主页
        </router-link>
      </div>

      <div class="header_button">
        <router-link to="/search" class="no-underline">
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M41.0002 41L32.6573 32.657M32.6573 32.657C35.0119 30.3024 36.4002 27.029 36.4002 23.5C36.4002 16.2827 30.6175 10.5 23.4002 10.5C16.183 10.5 10.4002 16.2827 10.4002 23.5C10.4002 30.7173 16.183 36.5 23.4002 36.5C26.9292 36.5 30.2027 35.1117 32.6573 32.657Z"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M26.5 23.5C26.5 25.2132 25.1132 26.6 23.4 26.6C21.6868 26.6 20.3 25.2132 20.3 23.5C20.3 21.7868 21.6868 20.4 23.4 20.4C25.1132 20.4 26.5 21.7868 26.5 23.5Z"
              fill="currentColor"
            />
            <path
              d="M23.4002 16.5V12.5M23.4002 34.5V30.5M34.4002 23.5H30.4002M16.4002 23.5H12.4002"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
            />
          </svg>
          探索
        </router-link>
      </div>

      <div class="header_button">
        <router-link to="/community" class="no-underline">
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M42 8H6C4.89543 8 4 8.89543 4 10V38C4 39.1046 4.89543 40 6 40H42C43.1046 40 44 39.1046 44 38V10C44 8.89543 43.1046 8 42 8Z"
              stroke="currentColor"
              stroke-width="4"
              stroke-linejoin="round"
            />
            <circle
              cx="24"
              cy="24"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              stroke-linejoin="round"
            />
            <path
              d="M24 14V24L31 28"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          社区
        </router-link>
      </div>

      <div class="header_button">
        <router-link to="/chat" class="no-underline">
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 8h40v24H13l-9 8V8z" />
          </svg>
          对话
        </router-link>
      </div>

      <div class="nav_search">
        <input
          type="text"
          placeholder="世界在你脚下..."
          class="search_input"
          v-model="searchKeyword"
          @keyup.enter="handleSearch"
        />
        <button class="search_button" @click="handleSearch">搜索</button>
      </div>
    </div>

    <!--右侧导航栏-->
    <div class="nav_right">
      <div class="button-with-icon" v-if="isLoggedIn">
        <router-link to="/submit" class="no-underline">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
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
      <div class="hamburger-icon" :class="{ active: isMobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!--移动端菜单-->
    <div class="mobile-menu" :class="{ active: isMobileMenuOpen }">
      <div class="mobile-search">
        <input
          type="text"
          placeholder="世界在你脚下..."
          class="mobile-search-input"
          v-model="searchKeyword"
          @keyup.enter="handleSearch"
        />
        <button class="search_button" @click="handleSearch">搜索</button>
      </div>

      <!-- 登录后显示用户信息和直接操作按钮 -->
      <div v-if="isLoggedIn" class="mobile-user-card">
        <div class="mobile-user-info">
          <el-avatar :size="50" :src="authStore.user.avatarImage">{{
            authStore.user.nickname
          }}</el-avatar>
          <span class="mobile-username">{{
            authStore.user.nickname + ' #' + authStore.user.username || '用户'
          }}</span>
        </div>
        <div class="mobile-user-actions">
          <router-link to="/profile" class="mobile-action-button" @click="closeMobileMenu">
            <el-icon>
              <User />
            </el-icon>
            <span>个人信息</span>
          </router-link>
          <router-link to="/settings" class="mobile-action-button" @click="closeMobileMenu">
            <el-icon>
              <Setting />
            </el-icon>
            <span>系统设置</span>
          </router-link>
          <div class="mobile-action-button logout-button" @click="handleLogout">
            <el-icon>
              <SwitchButton />
            </el-icon>
            <span>退出登录</span>
          </div>
        </div>
      </div>

      <!-- 未登录时显示登录按钮 -->
      <router-link v-else to="/auth" class="login-button no-underline" @click="closeMobileMenu">
        <span>登录/注册</span>
      </router-link>

      <router-link to="/" class="mobile-menu-item" @click="closeMobileMenu">
        <div class="menu-item-content">
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18V42H39V18L24 6L9 18Z"
              fill="none"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M19 29V42H29V29H19Z"
              fill="none"
              stroke="currentColor"
              stroke-width="4"
              stroke-linejoin="round"
            />
            <path d="M9 42H39" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
          </svg>
          <span>主页</span>
        </div>
        <svg
          class="arrow-icon"
          width="24"
          height="24"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 12L31 24L19 36"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </router-link>
      <router-link to="/explore" class="mobile-menu-item" @click="closeMobileMenu">
        <div class="menu-item-content">
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M41.0002 41L32.6573 32.657M32.6573 32.657C35.0119 30.3024 36.4002 27.029 36.4002 23.5C36.4002 16.2827 30.6175 10.5 23.4002 10.5C16.183 10.5 10.4002 16.2827 10.4002 23.5C10.4002 30.7173 16.183 36.5 23.4002 36.5C26.9292 36.5 30.2027 35.1117 32.6573 32.657Z"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M26.5 23.5C26.5 25.2132 25.1132 26.6 23.4 26.6C21.6868 26.6 20.3 25.2132 20.3 23.5C20.3 21.7868 21.6868 20.4 23.4 20.4C25.1132 20.4 26.5 21.7868 26.5 23.5Z"
              fill="currentColor"
            />
            <path
              d="M23.4002 16.5V12.5M23.4002 34.5V30.5M34.4002 23.5H30.4002M16.4002 23.5H12.4002"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
            />
          </svg>
          <span>探索</span>
        </div>
        <svg
          class="arrow-icon"
          width="24"
          height="24"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 12L31 24L19 36"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </router-link>
      <router-link to="/community" class="mobile-menu-item" @click="closeMobileMenu">
        <div class="menu-item-content">
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M42 8H6C4.89543 8 4 8.89543 4 10V38C4 39.1046 4.89543 40 6 40H42C43.1046 40 44 39.1046 44 38V10C44 8.89543 43.1046 8 42 8Z"
              stroke="currentColor"
              stroke-width="4"
              stroke-linejoin="round"
            />
            <circle
              cx="24"
              cy="24"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              stroke-linejoin="round"
            />
            <path
              d="M24 14V24L31 28"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>社区</span>
        </div>
        <svg
          class="arrow-icon"
          width="24"
          height="24"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 12L31 24L19 36"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </router-link>
      <router-link to="/chat" class="mobile-menu-item" @click="closeMobileMenu">
        <div class="menu-item-content">
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 8h40v24H13l-9 8V8z" />
          </svg>
          <span>对话</span>
        </div>
        <svg
          class="arrow-icon"
          width="24"
          height="24"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 12L31 24L19 36"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </router-link>

      <!-- 投稿按钮 - 仅在登录状态显示 -->
      <router-link v-if="isLoggedIn" to="/submit" class="mobile-menu-item" @click="closeMobileMenu">
        <div class="menu-item-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>投稿</span>
        </div>
        <svg
          class="arrow-icon"
          width="24"
          height="24"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 12L31 24L19 36"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
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
import { User, Setting, SwitchButton } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const router = useRouter()
const isLoggedIn = computed(() => authStore.isAuthenticated)

// 搜索相关
const searchKeyword = ref('')

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { keyword: searchKeyword.value.trim() },
    })
    // 如果移动菜单是打开的状态，进行搜索时关闭它
    if (isMobileMenuOpen.value) {
      closeMobileMenu()
    }
  }
}

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

const handleLogout = () => {
  authStore.logout()
  closeMobileMenu()
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
  z-index: 999;
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

/* 美化移动端汉堡菜单样式 */
.hamburger-menu {
  display: none;
  /* Initially hidden on all screens */
  cursor: pointer;
  z-index: 9999;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(18, 194, 233, 0.1), rgba(196, 113, 237, 0.1));
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.hamburger-menu:hover {
  transform: scale(1.05);
  background: linear-gradient(135deg, rgba(18, 194, 233, 0.2), rgba(196, 113, 237, 0.2));
  box-shadow: 0 0 15px rgba(18, 194, 233, 0.15);
}

.hamburger-icon {
  width: 24px;
  height: 20px;
  position: relative;
  transition: 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6);
}

.hamburger-icon span {
  display: block;
  position: absolute;
  height: 3px;
  width: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #12c2e9, #c471ed);
  transition: 0.4s cubic-bezier(0.68, -0.6, 0.32, 1.6);
}

.hamburger-icon span:nth-child(1) {
  top: 0;
  width: 60%;
  right: 0;
}

.hamburger-icon span:nth-child(2) {
  top: 8px;
  width: 100%;
}

.hamburger-icon span:nth-child(3) {
  top: 16px;
  width: 80%;
  right: 0;
}

.hamburger-icon.active span:nth-child(1) {
  top: 8px;
  transform: rotate(45deg);
  width: 100%;
  right: auto;
}

.hamburger-icon.active span:nth-child(2) {
  opacity: 0;
  transform: translateX(20px);
}

.hamburger-icon.active span:nth-child(3) {
  top: 8px;
  transform: rotate(-45deg);
  width: 100%;
  right: auto;
}

/* 美化移动端菜单 */
.mobile-menu {
  height: auto;
  max-height: 80vh;
  display: none;
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  padding: 1.5rem;
  transform: translateY(-20px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  z-index: 9997;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  border-radius: 0 0 20px 20px;
  overflow-y: auto;
}

.mobile-menu.active {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  color: var(--text-color);
  text-decoration: none;
  border-radius: 12px;
  border: none;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  background: transparent;
}

.mobile-menu-item:hover {
  background-color: rgba(18, 194, 233, 0.08);
  transform: translateX(6px);
  box-shadow: 0 4px 12px rgba(18, 194, 233, 0.1);
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-item-content svg {
  width: 24px;
  height: 24px;
  color: var(--text-color);
  opacity: 0.8;
  transition: all 0.3s ease;
}

.mobile-menu-item:hover .menu-item-content svg {
  color: #12c2e9;
  transform: scale(1.1);
  opacity: 1;
}

.menu-item-content span {
  font-weight: 500;
  transition: all 0.3s ease;
}

.mobile-menu-item:hover .menu-item-content span {
  background: linear-gradient(90deg, #12c2e9, #c471ed);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: var(--text-color);
  opacity: 0.6;
  transition: transform 0.3s ease;
}

.mobile-menu-item:hover .arrow-icon {
  transform: translateX(4px);
  opacity: 0.9;
  color: #c471ed;
}

/* 美化移动端搜索框 */
.mobile-search {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
  margin: 0.5rem 0 1.5rem;
  position: relative;
}

.mobile-search-input {
  flex: 1;
  padding: 0.9rem 1.5rem;
  padding-right: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 15px;
  font-size: 1rem;
  background: var(--background-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.mobile-search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(18, 194, 233, 0.1);
}

.mobile-menu .search_button {
  min-width: 70px;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--primary-color);
  background: transparent;
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu .search_button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: var(--primary-color);
  transition: all 0.3s ease;
  z-index: 0;
}

.mobile-menu .search_button:hover {
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(18, 194, 233, 0.2);
}

.mobile-menu .search_button:hover::before {
  width: 100%;
}

.mobile-menu .search_button:active {
  transform: translateY(1px);
}

.mobile-menu .search_button span {
  position: relative;
  z-index: 1;
}

/* 美化用户卡片 */
.mobile-user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.8rem;
  padding: 1.5rem;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(18, 194, 233, 0.05), rgba(196, 113, 237, 0.08));
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.mobile-user-card:hover {
  box-shadow: 0 12px 30px rgba(18, 194, 233, 0.1);
  transform: translateY(-3px);
}

.mobile-user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.mobile-user-info .el-avatar {
  border: 3px solid rgba(18, 194, 233, 0.2);
  box-shadow: 0 8px 15px rgba(18, 194, 233, 0.15);
  transition: all 0.3s ease;
}

.mobile-user-info:hover .el-avatar {
  transform: scale(1.05);
  border-color: rgba(18, 194, 233, 0.5);
}

.mobile-username {
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #12c2e9, #c471ed);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.mobile-user-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
}

.mobile-action-button {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1.2rem;
  background: white;
  color: var(--text-color);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.mobile-action-button .el-icon {
  background: linear-gradient(90deg, #12c2e9, #c471ed);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.mobile-action-button:hover {
  background: linear-gradient(135deg, rgba(18, 194, 233, 0.1), rgba(196, 113, 237, 0.1));
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(18, 194, 233, 0.1);
}

.mobile-action-button:hover .el-icon {
  transform: scale(1.2);
}

.logout-button {
  cursor: pointer;
  background: rgba(255, 99, 99, 0.05) !important;
}

.logout-button:hover {
  background: rgba(255, 99, 99, 0.1) !important;
  box-shadow: 0 8px 20px rgba(255, 99, 99, 0.1) !important;
}

.logout-button .el-icon {
  background: linear-gradient(90deg, #ff6363, #ff8585) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

/* 修改登录按钮在移动菜单中的样式 */
.mobile-menu .login-button {
  width: 100%;
  margin: 1rem 0;
  padding: 1rem;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #12c2e9, #c471ed);
  box-shadow: 0 8px 20px rgba(18, 194, 233, 0.15);
  border-radius: 15px;
  text-align: center;
}

.mobile-menu .login-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 30px rgba(18, 194, 233, 0.2);
}

.mobile-menu .login-button:active {
  transform: translateY(1px) scale(0.98);
}

.mobile-menu .login-button span {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 1px;
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

  .hamburger-icon {
    display: block;
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

  .hamburger-icon {
    display: block;
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
    display: flex;
    /* 只在移动端显示汉堡菜单 */
  }

  .hamburger-icon {
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
