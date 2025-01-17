<template>
    <div class="user-profile">
      <h1>个人主页</h1>
      <div v-if="user">
        <p><strong>用户名：</strong> {{ user.username }}</p>
        <p><strong>电子邮件：</strong> {{ user.email }}</p>
        <p><strong>签名：</strong> {{ user.signature }}</p>
        <img :src="user.avatarImage || defaultAvatar" alt="用户头像" class="avatar">
      </div>
      <div v-else>
        <p>加载中...</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useStore } from 'vuex';
  import defaultAvatar from '../assets/image/default_avatar.png';
  
  export default {
    name: 'UserInfo',
    setup() {
      const store = useStore();
      const user = ref(null);
  
      onMounted(async () => { 
        await store.dispatch('fetchUserData');
        user.value = store.state.user;
      });
  
      return {
        user,
        defaultAvatar
      };
    }
  };
  </script>
  
  <style scoped>
  .user-profile {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #f9f9f9;
  }
  
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-top: 10px;
  }
  </style>