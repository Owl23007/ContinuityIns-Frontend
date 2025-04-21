<template>
  <el-dropdown trigger="click" class="user-dropdown">
    <!-- 触发下拉菜单的简洁用户信息显示 -->
    <div class="user-dropdown-link">
      <el-avatar :size="32" :src="userAvatar" class="avatar-with-status">
        {{ userNameFirst }}
        <span class="status-indicator"></span>
      </el-avatar>
      <span class="nickname">{{ nickname }}</span>
      <el-icon class="dropdown-icon">
        <CaretBottom />
      </el-icon>
    </div>

    <!-- 下拉菜单内容 -->
    <template #dropdown>
      <el-dropdown-menu class="enhanced-dropdown-menu">
        <!-- 用户卡片头部 -->
        <div
          class="user-card-header"
          :style="{ backgroundImage: `url(${userBackground})` }"
        >
          <div class="user-card-avatar">
            <el-avatar :size="64" :src="userAvatar" class="avatar-highlight">
              {{ userNameFirst }}
            </el-avatar>
          </div>
        </div>

        <!-- 用户信息 -->
        <div class="user-card-info">
          <div class="user-identity">
            <h3 class="user-card-name">{{ nickname }}</h3>
            <span class="username-tag">{{ "#" + userName }}</span>
          </div>
          <p class="user-card-email">
            <el-icon>
              <Message />
            </el-icon>
            {{ userEmail || "未设置邮箱" }}
          </p>
        </div>

        <!-- 菜单项 -->
        <el-dropdown-item @click="goToProfile" class="menu-item">
          <el-icon>
            <User /> </el-icon
          >个人信息
        </el-dropdown-item>
        <el-dropdown-item @click="goToContributions" class="menu-item">
          <el-icon>
            <Document /> </el-icon
          >投稿管理
        </el-dropdown-item>
        <el-dropdown-item @click="goToSettings" class="menu-item">
          <el-icon>
            <Setting /> </el-icon
          >系统设置
        </el-dropdown-item>
        <el-dropdown-item
          divided
          @click="handleLogout"
          class="menu-item logout-item"
        >
          <el-icon>
            <SwitchButton /> </el-icon
          >退出登录
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import {
  CaretBottom,
  User,
  Setting,
  SwitchButton,
  Message,
  Document,
} from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import defaultCoverImg from "@/assets/image/default_cover.jpg";

const router = useRouter();
const authStore = useAuthStore();

const nickname = computed(() => authStore.currentUser?.nickname || "昵称");
const userName = computed(() => authStore.currentUser?.username || "用户");
const userEmail = computed(() => authStore.currentUser?.email || null);
const userNameFirst = computed(() => userName.value.charAt(0));

// 处理图片路径的辅助函数
const getFullImagePath = (path) => {
  if (path && !path.startsWith("http")) {
    return import.meta.env.VITE_API_BASE_URL + path;
  }
  return path;
};

// 用户头像
const userAvatar = computed(() => getFullImagePath(authStore.user.avatarImage));

// 用户背景图片，如果未设置则使用默认图片
const userBackground = computed(
  () => getFullImagePath(authStore.user.backgroundImage) || defaultCoverImg,
);

const goToProfile = () => {
  router.push("/profile");
};

const goToContributions = () => {
  router.push("/article");
};

const goToSettings = () => {
  router.push("/settings");
};

const handleLogout = () => {
  ElMessageBox.confirm("确认退出登录吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      authStore.logout();
      router.push("/auth");
    })
    .catch(() => {});
};
</script>

<style scoped>
.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.user-dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 8px;
  border-radius: 20px;
  transition: all 0.3s ease;
  background-color: rgba(240, 240, 240, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-dropdown-link:hover {
  background-color: var(--hover-bg);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.nickname {
  font-size: 14px;
  color: var(--text-color);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.dropdown-icon {
  transition: transform 0.3s ease;
}

.user-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

.avatar-with-status {
  position: relative;
}

.status-indicator {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #10b981;
  /* 在线状态 - 绿色 */
  border-radius: 50%;
  border: 2px solid #fff;
  bottom: 0;
  right: 0;
  z-index: 1;
}

/* 增强的下拉菜单样式 */
:deep(.enhanced-dropdown-menu) {
  padding: 0 0 8px 0;
  min-width: 280px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: none;
  animation: dropdown-fade 0.2s ease-out;
}

@keyframes dropdown-fade {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-card-header {
  height: 120px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  box-shadow: inset 0 -20px 30px rgba(0, 0, 0, 0.2);
}

.user-card-avatar {
  position: absolute;
  bottom: -30px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.avatar-highlight:deep(.el-avatar) {
  border: 4px solid #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.avatar-highlight:hover:deep(.el-avatar) {
  transform: scale(1.05);
}

.user-card-info {
  text-align: center;
  padding: 0 16px 16px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 8px;
}

.user-identity {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}

.user-card-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

.username-tag {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  background-color: #f2f6fc;
  padding: 2px 6px;
  border-radius: 12px;
  display: inline-block;
}

.user-card-email {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary-color);
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.menu-item {
  transition: background-color 0.2s ease;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.2s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: rgba(0, 0, 0, 0.03);
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 4px;
  font-size: 16px;
}

.logout-item:deep(.el-dropdown-menu__item) {
  color: #f56c6c;
}

.logout-item:deep(.el-dropdown-menu__item:hover) {
  background-color: rgba(245, 108, 108, 0.1);
}
</style>
