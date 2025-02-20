<template>
  <div id="app">

    <!--导航栏-->
    <header class="header_style">


      <!--左侧logo-->
      <div class="nav_left">
        <div class="nav_logo_title" @click="tohome">
          <nav>
            <router-link to="/" class="logo no-underline">
              <img :src="logoPic" alt="logo">
              <span class="nav_title">存续院</span>
            </router-link>
          </nav>
        </div>
      </div>


      <!--中间导航栏-->
      <div class="nav_links">

        <div class="header_button">
          <router-link to="/" class=" no-underline">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18V42H39V18L24 6L9 18Z" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M19 29V42H29V29H19Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round" />
              <path d="M9 42H39" stroke="#333" stroke-width="4" stroke-linecap="round" />
            </svg>
            主页
          </router-link>
        </div>

        <div class="header_button">
          <router-link to="/resourcelist" class="no-underline">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 6H39C39 6 43 8 43 13C43 18 39 20 39 20H5C5 20 9 18 9 13C9 8 5 6 5 6Z" fill="none"
                stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M43 28H9C9 28 5 30 5 35C5 40 9 42 9 42H43C43 42 39 40 39 35C39 30 43 28 43 28Z" fill="none"
                stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            视频
          </router-link>
        </div>

        <div class="header_button">
          <router-link to="/articlelist" class=" no-underline">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M39 4H11C9.89543 4 9 4.89543 9 6V42C9 43.1046 9.89543 44 11 44H39C40.1046 44 41 43.1046 41 42V6C41 4.89543 40.1046 4 39 4Z"
                fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M17 30L31 30" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M17 36H24" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="17" y="12" width="14" height="10" fill="none" stroke="#333" stroke-width="4"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            文章
          </router-link>
        </div>
        <div class="header_button">
          <router-link to="/chat" class=" no-underline">
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
        <!--上传投稿-->
        <div class="button-with-icon">
          <router-link to="/submit" class="no-underline ">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="feather feather-upload">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p>上传投稿</p>
          </router-link>
        </div>
        <!--登录注册-->
        <div v-if="!user" class="header_button">
          <router-link to="/Auth" class="no-underline">登录</router-link>
        </div>
        <div v-else class="avatar_button">
          <div class="dropdown">
            <img :src="user?.avatarImage || defaultAvatar" @error="onAvatarError" alt="用户头像" class="avatar">
            <div class="dropdown-content">
              <router-link to="/userinfo" class="no-underline">个人主页</router-link>
              <a href="#" class="no-underline" @click="logout">退出登录</a>
            </div>
          </div>
        </div>
      </div>
    </header>
    <!--主体内容-->
    <main>
      <div class="main_container">
        <router-view class="main_router_page"></router-view>
      </div>
    </main>
    <!--页脚-->
    <footer class="footer">
      <div class="footer-content">
        <p>© {{ new Date().getFullYear() }} 存续院 · 保留所有权利</p>
        <a href="http://beian.miit.gov.cn/" class="beian-link">鄂ICP备2024073383号</a>
      </div>
    </footer>
  </div>

</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import logoPic from '@/assets/image/logo.png'
import defaultAvatar from '@/assets/image/default_avatar.png'

const store = useStore()
const router = useRouter()

// 响应式状态
const user = computed(() => store.state.user)

// 方法定义
const logout = () => {
  try {
    console.log('退出登录')
    store.dispatch('logout')
    router.push('/')
  } catch (error) {
    console.error('遇到错误：', error)
  }
}

const onAvatarError = (event) => {
  if (event.target.src !== defaultAvatar) {
    event.target.src = defaultAvatar
  }
}

</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

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

  /* 背景透明度 */
  --header-bg-alpha: 0.9;
}

[data-theme="dark"] {
  --background-color-rgb: 44, 62, 80;
  --primary-color-rgb: 236, 240, 241;
  --primary-color: #ecf0f1;
  --secondary-color: #3498db;
  --background-color: #2c3e50;
  --text-color: #ecf0f1;
  --hover-bg: #34495e;
  --shadow-color: rgba(255, 255, 255, 0.2);
  --border-color: #475b6d;
}

* {
  box-sizing: border-box;
  text-decoration: none;
  margin: 0;
  padding: 0;
  transition: background-color 0.3s ease,
    color 0.3s ease,
    box-shadow 0.3s ease;
}

body {
  min-height: 100vh;
  display: relative;
  flex-direction: column;
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

/* 头部样式 */
.header_style {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(var(--background-color-rgb), var(--header-bg-alpha));

  box-shadow: 0 4px 20px var(--shadow-color),
    0 2px 4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);

}

/* 左侧Logo */
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
  transition: transform 0.3s ease;
}

.nav_logo_title img {
  height: 40px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav_logo_title:hover img {
  transform: scale(1.08) rotate(-5deg);
}

.nav_title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: -0.5px;
}

/* 中间导航 */
.nav_links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-right: auto;
}

.header_button {
  position: relative;
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

.header_button svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  transition: transform 0.3s ease;
}

.header_button:hover svg {
  transform: scale(1.1);
}

/* 搜索栏 */
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

/* 右侧导航 */
.nav_right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.button-with-icon {
  position: relative;
}

.button-with-icon a {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem;
  color: var(--text-color);
  transition: all 0.3s ease;
}

.button-with-icon:hover svg {
  transform: translateY(-3px);
}

.button-with-icon svg {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
}

.button-with-icon p {
  font-size: 0.85rem;
  font-weight: 500;
}

/* 用户头像 */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(52, 152, 219, 0.3);
}

.dropdown {
  position: relative;
}

.dropdown-content {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  background: var(--background-color);
  box-shadow: 0 4px 15px var(--shadow-color);
  border-radius: 12px;
  padding: 0.5rem 0;
  min-width: 160px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.dropdown:hover .dropdown-content {
  opacity: 1;
  visibility: visible;
  top: calc(100% + 5px);
}

.dropdown-content a {
  display: block;
  padding: 0.8rem 1.5rem;
  color: var(--text-color);
  font-size: 0.9rem;
  transition: background 0.2s ease;
}

.dropdown-content a:hover {
  background: var(--hover-bg);
}

/* 主体内容 */
.main_container {
  flex: 1;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  background: var(--background-color);
  margin-top: auto;
  min-height: calc(100vh - 180px);
}

.main_router-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 页脚 */
.footer {
  flex-shrink: 0;
  /* 禁止收缩 */
  width: 100%;
  background: var(--primary-color);
  color: rgba(255, 255, 255, 0.9);
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  line-height: 1.6;
}

.beian-link {
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-top: 0.5rem;
  transition: opacity 0.3s ease;
}

@media (max-width: 768px) {
  .footer {
    padding: 1rem;
  }

  .footer-content p {
    font-size: 0.9rem;
  }
}

/* 夜间模式适配 */
[data-theme="dark"] {
  .header_button svg path {
    stroke: var(--text-color);
  }

  .nav_logo_title img {
    filter: brightness(0.85) contrast(1.1);
  }

  .search_input {
    border-width: 1.5px;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header_style {
    padding: 0 1.5rem;
  }

  .nav_links {
    gap: 1rem;
    margin-left: 1rem;
  }

  .search_input {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .nav_links {
    display: none;
  }

  .nav_search {
    margin-left: auto;
  }
}
</style>