<template>
  <div id="app">
    <header class="header_style">
      <div class="leader">
        <div class="nav_left">
          <div class="nav_logo_title" @click="tohome">
            <nav>
              <a href="#" class="logo">
                <router-link to="/" class="no-underline"><img src="@/assets/image/logo.png" alt="logo"
                    style="height: 40px;"></router-link>
              </a>
            </nav>
            <span class="nav_title">存续院</span>
          </div>
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
                资源
              </router-link>
            </div>
            <div class="header_button">
              <router-link to="/articlelist" class=" no-underline">
                <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M39 4H11C9.89543 4 9 4.89543 9 6V42C9 43.1046 9.89543 44 11 44H39C40.1046 44 41 43.1046 41 42V6C41 4.89543 40.1046 4 39 4Z"
                    fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M17 30L31 30" stroke="#333" stroke-width="4" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M17 36H24" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                  <rect x="17" y="12" width="14" height="10" fill="none" stroke="#333" stroke-width="4"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                文章
              </router-link>
            </div>
          </div>
        </div>
        <div class="nav_menu">
          <ul>
            <li class="nav_search">
              <input type="text" placeholder="世界在你脚下..." class="search_input">
              <button class="search_button">搜索</button>
            </li>
          </ul>
        </div>
        <div class="nav_right">

          <div v-if="!isLoggedIn" class="header_button">
            <router-link to="/Auth" class="no-underline">登录</router-link>
          </div>
          <div v-else class="avatar_button">
            <div class="dropdown">
              <img :src="user?.avatarImage || defaultAvatar" alt="用户头像" class="avatar">
              <div class="dropdown-content">
                <router-link to="/userinfo" class="no-underline">个人主页</router-link>
                <a href="#" @click="logout">退出登录</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="main_container">
      <router-view class="main_router_page"></router-view>
    </div>

    <div class="footer">
      <p>© 2023 存续院. All rights reserved.</p>

      <a href="http://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
        鄂ICP备2024073383号
      </a>

    </div>

  </div>


</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import defaultAvatar from "@/assets/image/default_avatar.png";

export default {
  name: 'App',

  setup() {

    const store = useStore();
    const router = useRouter();
    const user = computed(() => store.state.user);
    const isLoggedIn = computed(() => store.state.isLoggedIn);

    const logout = () => {
      store.dispatch('logout');
      router.push('/auth');
    };


    // 在载入页面时调用
    onMounted(async () => {

      if (isLoggedIn.value) {
        await store.dispatch('fetchUserData');
      }

      // 检测页面内容高度
      const footer = document.querySelector('.footer');
      const bodyHeight = document.body.scrollHeight;
      const windowHeight = window.innerHeight;

      if (bodyHeight > windowHeight) {
        footer.style.position = 'relative';
      } else {
        footer.style.position = 'absolute';
      }
    });
    return {
      isLoggedIn,
      user,
      logout,
      defaultAvatar
    };
  }

};
</script>

<style scoped src="@/assets/css/App.css"></style>