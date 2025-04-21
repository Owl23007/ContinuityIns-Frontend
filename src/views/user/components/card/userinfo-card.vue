<template>
  <div class="user-card">
    <div class="user-left">
      <div class="avatar-container">
        <img
          :src="avatarUrl"
          alt="用户头像"
          class="avatar"
          @error="$emit('avatar-error', $event)"
        />
        <div
          class="avatar-hover"
          v-if="isOwnProfile"
          @click="$emit('change-avatar')"
        >
          <el-icon>
            <Camera />
          </el-icon>
        </div>
      </div>
      <div class="user-info">
        <div class="name-container">
          <span class="name">
            {{ user.nickname || user.username }}
            <span class="username-tag">@{{ user.username }}</span>
          </span>
        </div>
        <div class="stats-container">
          <div class="stat-item">
            <span class="stat-number">1.2k</span>
            <span class="stat-label">关注</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">5.6k</span>
            <span class="stat-label">粉丝</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">328</span>
            <span class="stat-label">帖子</span>
          </div>
        </div>
      </div>
      <el-dropdown
        v-if="isOwnProfile"
        trigger="click"
        placement="bottom-end"
        class="settings-dropdown"
      >
        <button class="settings-btn">
          <el-icon>
            <Setting />
          </el-icon>
          设置
        </button>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown-menu">
            <el-dropdown-item
              @click="$emit('edit-profile')"
              class="dropdown-item"
            >
              <el-icon>
                <Edit />
              </el-icon>
              编辑资料
            </el-dropdown-item>
            <el-dropdown-item
              @click="$emit('change-avatar')"
              class="dropdown-item"
            >
              <el-icon>
                <Camera />
              </el-icon>
              更换头像
            </el-dropdown-item>
            <el-dropdown-item
              @click="$emit('change-background')"
              class="dropdown-item"
            >
              <el-icon>
                <Picture />
              </el-icon>
              更换背景
            </el-dropdown-item>
            <el-dropdown-item
              divided
              @click="$emit('delete-account')"
              class="dropdown-item danger-item"
            >
              <el-icon>
                <UserFilled />
              </el-icon>
              注销账户
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="user-right">
      <div class="info-container">
        <div class="info-item">
          <div class="info-row">
            <el-icon class="info-icon">
              <Message />
            </el-icon>
            <span class="info-text">{{ user.email }}</span>
          </div>
          <div class="info-row">
            <el-icon class="info-icon">
              <ChatDotRound />
            </el-icon>
            <span class="info-text">{{
              user.signature || "这个人很懒，什么也没留下~"
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  Message,
  ChatDotRound,
  Edit,
  Camera,
  Setting,
  Picture,
  UserFilled,
} from "@element-plus/icons-vue";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  isOwnProfile: {
    type: Boolean,
    default: false,
  },
  defaultAvatar: {
    type: String,
    required: true,
  },
  isUpdating: {
    type: Boolean,
    default: false,
  },
  isDeleting: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  "avatar-error",
  "edit-profile",
  "change-avatar",
  "change-background",
  "delete-account",
]);

const avatarUrl = computed(() => props.user.avatarImage || props.defaultAvatar);
</script>

<style scoped>
.user-card {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
  padding: 0rem;
  border-radius: 12px;
}

.user-left {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  flex: 1;
  min-width: 280px;
}

.avatar-container {
  width: 100px;
  height: 100px;
  position: relative;
  border-radius: 50%;
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f8fafc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.avatar-hover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.avatar-container:hover .avatar-hover {
  opacity: 1;
}

.user-info {
  flex: 1;
}

.name-container {
  margin-bottom: 0.75rem;
}

.name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.username-tag {
  font-size: 1rem;
  color: #6b7280;
  font-weight: normal;
}

.stats-container {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  transition: color 0.2s;
}

.stat-item:hover {
  color: #4f46e5;
}

.stat-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: inherit;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.1rem;
}

.user-right {
  flex: 2;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-container {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.info-row {
  display: flex;
  align-items: baseline;
  /* 修改这里：从 center 改为 baseline */
  gap: 0.75rem;
}

.info-icon {
  color: #4f46e5;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.info-text {
  color: #4b5563;
  font-size: 0.95rem;
  line-height: 1.5;
  word-break: break-word;
}

.action-buttons,
.follow-btn,
.settings-btn,
.settings-dropdown {
  display: none;
}

@media (max-width: 768px) {
  .user-card {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.25rem;
  }

  .user-left {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .avatar-container {
    width: 120px;
    height: 120px;
  }

  .stats-container {
    justify-content: center;
  }

  .stat-item {
    align-items: center;
  }

  .action-buttons {
    justify-content: center;
  }

  .settings-dropdown {
    margin-top: 0.75rem;
  }
}

@media (max-width: 480px) {
  .stats-container {
    gap: 1rem;
  }

  .name {
    font-size: 1.3rem;
    justify-content: center;
  }
}
</style>
