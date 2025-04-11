<template>
    <div class="user-card">
        <div class="user-info">
            <div class="user-header">
                <div class="avatar-container">
                    <img :src="avatarUrl" alt="用户头像" class="avatar" @error="$emit('avatar-error', $event)">
                </div>
                <div class="name-container">
                    <span class="name">
                        {{ user.nickname || user.username }}
                        <span class="username-tag">#{{ user.username }}</span>
                    </span>
                </div>
            </div>

            <div class="info-list">
                <div class="info-item" v-if="isOwnProfile">
                    <div class="icon-wrapper">
                        <el-icon>
                            <Message />
                        </el-icon>
                    </div>
                    <span>{{ user.email }}</span>
                </div>
                <div class="info-item">
                    <div class="icon-wrapper">
                        <el-icon>
                            <ChatDotRound />
                        </el-icon>
                    </div>
                    <span>{{ user.signature || '这个人很懒，什么也没留下~' }}</span>
                </div>
            </div>
        </div>

        <div class="action-buttons">
            <el-dropdown v-if="isOwnProfile" trigger="click">
                <button class="settings-btn">
                    <i class="fas fa-cog"></i>
                    设置
                </button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="$emit('edit-profile')">
                            <i class="fas fa-user-edit"></i> 编辑资料
                        </el-dropdown-item>
                        <el-dropdown-item @click="$emit('change-avatar')">
                            <i class="fas fa-camera"></i> 更换头像
                        </el-dropdown-item>
                        <el-dropdown-item @click="$emit('change-background')">
                            <i class="fas fa-image"></i> 更换背景
                        </el-dropdown-item>
                        <el-dropdown-item divided @click="$emit('delete-account')" class="danger-item">
                            <i class="fas fa-user-times"></i> 注销账户
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <button v-else class="follow-btn" :class="{ 'is-following': isFollowing }" @click="handleFollow">
                <i :class="isFollowing ? 'fas fa-user-check' : 'fas fa-user-plus'"></i>
                {{ isFollowing ? '已关注' : '关注' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Message, ChatDotRound } from '@element-plus/icons-vue'

const props = defineProps({
    user: {
        type: Object,
        required: true
    },
    isOwnProfile: {
        type: Boolean,
        default: false
    },
    defaultAvatar: {
        type: String,
        required: true
    },
    isUpdating: {
        type: Boolean,
        default: false
    },
    isDeleting: {
        type: Boolean,
        default: false
    }
})

defineEmits(['avatar-error', 'edit-profile', 'change-avatar', 'change-background', 'delete-account'])

const avatarUrl = computed(() => props.user.avatarImage || props.defaultAvatar)
const isDropdownOpen = ref(false)
const isFollowing = ref(false)

// 点击外部关闭指令
const vClickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event)
            }
        }
        document.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent)
    }
}

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
    isDropdownOpen.value = false
}

const handleFollow = async () => {
    if (!props.user?.id) {
        ElMessage.error('用户信息不完整');
        return;
    }

    try {
        isFollowing.value = !isFollowing.value;
        // TODO: 这里调用关注/取消关注的 API
        ElMessage.success(isFollowing.value ? '关注成功' : '已取消关注');
    } catch (error) {
        isFollowing.value = !isFollowing.value; // 恢复状态
        ElMessage.error(error.message || '操作失败');
    }
};

</script>

<style scoped>
.user-card {
    display: flex;
    justify-content: space-between;
    padding: 1.25rem;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
}

.user-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.avatar-container {
    width: 64px;
    height: 64px;
}

.avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #f3f4f6;
}

.name-container {
    display: flex;
    flex-direction: column;
}

.name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
}

.username-tag {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: normal;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 8px;
}

.icon-wrapper {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border-radius: 6px;
    color: #374151;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    align-self: flex-start;
}

.follow-btn,
.settings-btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.follow-btn {
    background: var(--primary-color);
    color: white;
}

.follow-btn.is-following {
    background: #f3f4f6;
    color: #374151;
}

.settings-btn {
    background: #f3f4f6;
    color: #374151;
}

@media (max-width: 640px) {
    .user-card {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }

    .user-header {
        flex-direction: column;
        text-align: center;
    }

    .info-list {
        margin-bottom: 1rem;
    }

    .action-buttons {
        align-self: stretch;
    }

    .follow-btn,
    .settings-btn {
        flex: 1;
        justify-content: center;
    }
}
</style>