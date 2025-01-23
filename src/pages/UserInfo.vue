<template>
  <div class="user-profile">
    <h1>个人主页</h1>
    <div v-if="user">
      <p><strong>用户名：</strong> {{ user.username }}</p>
      <p><strong>电子邮件：</strong> {{ user.email }}</p>
      <p><strong>签名：</strong> {{ user.signature }}</p>
      <img :src="user.avatarImage || defaultAvatar" alt="用户头像" @error="OnAvatarError" class="avatar">
      <button @click="editProfile">编辑资料</button>
      <button @click="editAvatar">更新头像</button>
      <button @click="logout">注销账号</button>
    </div>
    <div v-else>
      <p>加载中...</p>
    </div>

    <!-- 编辑资料弹窗 -->
    <div v-if="showEditProfile" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeEditProfile">&times;</span>
        <h2>编辑资料</h2>
        <form @submit.prevent="updateProfile">
          <label for="nickname">昵称:</label>
          <input type="text" v-model="nickname" id="nickname">
          <label for="signature">签名:</label>
          <input type="text" v-model="signature" id="signature">
          <button type="submit">保存</button>
        </form>
      </div>
    </div>

    <!-- 更新头像弹窗 -->
    <div v-if="showEditAvatar" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeEditAvatar">&times;</span>
        <h2>更新头像</h2>
        <form @submit.prevent="updateAvatar">
          <label for="avatarUrl">头像URL:</label>
          <input type="text" v-model="avatarUrl" id="avatarUrl">
          <button type="submit">保存</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import defaultAvatar from '../assets/image/default_avatar.png';
import { updateUserInfo_put, updateAvatar_patch, deleteAcc_delete } from '../api/user';

export default {
  name: 'UserInfo',
  setup() {
    const store = useStore();
    const router = useRouter();
    const user = ref(null);
    const showEditProfile = ref(false);
    const showEditAvatar = ref(false);
    const nickname = ref('');
    const signature = ref('');
    const avatarUrl = ref('');

    onMounted(async () => {
      await store.dispatch('fetchUserData');
      user.value = store.state.user;
      nickname.value = user.value.nickname;
      signature.value = user.value.signature;
    });

    const OnAvatarError = (event) => {
      event.target.src = defaultAvatar;
    };

    const editProfile = () => {
      showEditProfile.value = true;
    };

    const closeEditProfile = () => {
      showEditProfile.value = false;
    };

    const updateProfile = async () => {
      await updateUserInfo_put(store.state.token, nickname.value, signature.value);
      await store.dispatch('fetchUserData');
      user.value = store.state.user;
      closeEditProfile();
    };

    const editAvatar = () => {
      showEditAvatar.value = true;
    };

    const closeEditAvatar = () => {
      showEditAvatar.value = false;
    };

    const updateAvatar = async () => {
      await updateAvatar_patch(store.state.token, avatarUrl.value);
      await store.dispatch('fetchUserData');
      user.value = store.state.user;
      closeEditAvatar();
    };

    const logout = async () => {
      const password = prompt("请输入密码以确认注销账号：");
      if (password) {
        try {
          await deleteAcc_delete(store.state.token, password);
          store.dispatch('logout');
          router.push('/auth');
        } catch (error) {
          alert('注销失败，请检查密码或稍后再试。');
        }
      }
    };

    return {
      user,
      defaultAvatar,
      OnAvatarError,
      showEditProfile,
      showEditAvatar,
      nickname,
      signature,
      avatarUrl,
      editProfile,
      closeEditProfile,
      updateProfile,
      editAvatar,
      closeEditAvatar,
      updateAvatar,
      logout
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

button {
  margin-top: 10px;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #38a169;
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
}

.close {
  float: right;
  font-size: 24px;
  cursor: pointer;
}
</style>