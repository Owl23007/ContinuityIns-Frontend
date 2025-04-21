<template>
  <div class="profile-actions">
    <!-- 主要操作按钮 -->
    <div class="main-actions">
      <el-dropdown
        v-if="isOwnProfile"
        trigger="click"
        class="settings-dropdown"
      >
        <button class="primary-btn">
          <i class="fas fa-cog"></i>
          账户设置
          <i class="fas fa-chevron-down"></i>
        </button>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown-menu">
            <el-dropdown-item @click="$emit('edit-profile')">
              <i class="fas fa-edit"></i> 编辑资料
            </el-dropdown-item>
            <el-dropdown-item @click="$emit('change-avatar')">
              <i class="fas fa-camera"></i> 更换头像
            </el-dropdown-item>
            <el-dropdown-item @click="$emit('change-background')">
              <i class="fas fa-image"></i> 更换背景
            </el-dropdown-item>
            <el-dropdown-item
              divided
              @click="$emit('delete-account')"
              class="danger-item"
            >
              <i class="fas fa-trash-alt"></i> 注销账户
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <button
        v-else
        class="follow-btn"
        :class="{ 'is-following': isFollowing }"
        @click="handleFollow"
      >
        <i :class="isFollowing ? 'fas fa-user-check' : 'fas fa-user-plus'"></i>
        {{ isFollowing ? "已关注" : "关注" }}
      </button>
    </div>

    <!-- 用户统计信息 -->
    <div class="stats-container">
      <div class="stat-box">
        <div class="stat-item">
          <h3>{{ stats.articles }}</h3>
          <span>文章</span>
        </div>
        <div class="stat-item clickable" @click="showFollowers">
          <h3>{{ stats.followers }}</h3>
          <span>粉丝</span>
        </div>
        <div class="stat-item clickable" @click="showFollowing">
          <h3>{{ stats.following }}</h3>
          <span>关注</span>
        </div>
      </div>
    </div>

    <!-- 收藏列表预览 -->
    <div class="favorites-preview" v-if="isOwnProfile">
      <h3 class="section-title">我的收藏</h3>
      <div class="favorites-grid">
        <div v-if="favorites.length === 0" class="empty-favorites">
          暂无收藏内容
        </div>
        <div
          v-else
          v-for="item in favorites.slice(0, 4)"
          :key="item.id"
          class="favorite-item"
        >
          <i class="fas fa-bookmark"></i>
          <span>{{ item.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  isOwnProfile: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: [String, Number],
    required: true,
  },
});

const emits = defineEmits([
  "edit-profile",
  "change-background",
  "delete-account",
  "change-avatar",
]);

const isFollowing = ref(false);
const stats = ref({
  articles: 0,
  followers: 0,
  following: 0,
});

const favorites = ref([]);

const handleFollow = () => {
  // 关注/取消关注的逻辑
  isFollowing.value = !isFollowing.value;
  ElMessage.success(isFollowing.value ? "关注成功" : "已取消关注");
};

const showFollowers = () => {
  // 显示粉丝列表
};

const showFollowing = () => {
  // 显示关注列表
};
</script>

<style scoped>
.profile-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  background: rgb(255, 255, 255);
}

.main-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
}

.settings-dropdown {
  position: relative;
}

.primary-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.follow-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.follow-btn.is-following {
  background: #e5e7eb;
  color: #374151;
}

.stats-container {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.stat-box {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item.clickable {
  cursor: pointer;
}

.stat-item.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

.stat-item span {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.3rem;
}

.favorites-preview {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2d3748;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.favorite-item {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.favorite-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.favorite-item i {
  color: var(--primary-color);
}

.empty-favorites {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: #666;
  background: white;
  border-radius: 12px;
}

.danger-item {
  color: #dc2626;
}

.user-dropdown-menu {
  border-radius: 12px;
  padding: 0.5rem;
  border: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.user-dropdown-menu :deep(.el-dropdown-menu__item) {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  margin: 0.125rem 0;
}

@media (max-width: 768px) {
  .stat-box {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item {
    padding: 0.8rem;
  }

  .stat-item h3 {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }
}
</style>
