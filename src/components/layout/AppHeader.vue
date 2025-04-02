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
          登录/注册
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
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
  z-index: 100;
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
  padding: 0.6rem 1.8rem;
  background: var(--primary-color);
  color: var(--background-color);
  border-radius: 30px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: scale(1.05);
  opacity: 0.95;
}

@media (max-width: 1024px) {
  .header_style {
    padding: 0 1.5rem;
  }

  .nav_links {
    gap: 1rem;
  }

  .search_input {
    width: 200px;
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
    margin-left: auto;
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
}
</style>
