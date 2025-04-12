<template>
    <div class="user-card">
        <div class="user-info">
            <div class="user-header">
                <div class="avatar-container">
                    <img :src="avatarUrl" alt="用户头像" class="avatar" @error="$emit('avatar-error', $event)">
                    <div class="avatar-hover" v-if="isOwnProfile" @click="$emit('change-avatar')">
                        <el-icon>
                            <Camera />
                        </el-icon>
                    </div>
                </div>
                <div class="name-container">
                    <span class="name">
                        {{ user.nickname || user.username }}
                        <span class="username-tag">@{{ user.username }}</span>
                    </span>
                    <div class="user-badge" v-if="user.role === 'admin'">
                        <el-icon>
                            <UserFilled />
                        </el-icon> 管理员
                    </div>
                </div>
            </div>

            <div class="info-list">
                <div class="info-item" v-if="isOwnProfile">
                    <div class="icon-wrapper">
                        <el-icon>
                            <Message />
                        </el-icon>
                    </div>
                    <span class="info-text">{{ user.email }}</span>
                </div>
                <div class="info-item">
                    <div class="icon-wrapper">
                        <el-icon>
                            <ChatDotRound />
                        </el-icon>
                    </div>
                    <span class="info-text">{{ user.signature || '这个人很懒，什么也没留下~' }}</span>
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
        </div>

        <div class="action-buttons">
            <el-dropdown v-if="isOwnProfile" trigger="click" placement="bottom-end">
                <button class="settings-btn">
                    <el-icon>
                        <Setting />
                    </el-icon>
                    设置
                </button>
                <template #dropdown>
                    <el-dropdown-menu class="user-dropdown-menu">
                        <el-dropdown-item @click="$emit('edit-profile')" class="dropdown-item">
                            <el-icon>
                                <Edit />
                            </el-icon> 编辑资料
                        </el-dropdown-item>
                        <el-dropdown-item @click="$emit('change-avatar')" class="dropdown-item">
                            <el-icon>
                                <Camera />
                            </el-icon> 更换头像
                        </el-dropdown-item>
                        <el-dropdown-item @click="$emit('change-background')" class="dropdown-item">
                            <el-icon>
                                <Picture />
                            </el-icon> 更换背景
                        </el-dropdown-item>
                        <el-dropdown-item divided @click="$emit('delete-account')" class="dropdown-item danger-item">
                            <el-icon>
                                <UserFilled />
                            </el-icon> 注销账户
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <button v-else class="follow-btn" :class="{ 'is-following': isFollowing }" @click="handleFollow">
                <el-icon>
                    <template v-if="isFollowing">
                        <Check />
                    </template>
                    <template v-else>
                        <Plus />
                    </template>
                </el-icon>
                {{ isFollowing ? '已关注' : '关注' }}
                <span class="btn-hover-effect"></span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Message, ChatDotRound, Edit, Plus, Check, Camera, Setting, Picture, UserFilled } from '@element-plus/icons-vue'

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
const isFollowing = ref(false)

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
    padding: 1.5rem;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(229, 231, 235, 0.6);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
        border-color: rgba(209, 213, 219, 0.8);
    }
}

.user-header {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    margin-bottom: 1.5rem;
}

.avatar-container {
    width: 80px;
    height: 80px;
    position: relative;
    border-radius: 50%;
    flex-shrink: 0;

    .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #f8fafc;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
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

        i {
            font-size: 1.2rem;
        }
    }

    &:hover {
        .avatar-hover {
            opacity: 1;
        }

        .avatar {
            transform: scale(1.03);
        }
    }
}

.name-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

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
}

.user-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    margin-top: 0.25rem;

    i {
        font-size: 0.7rem;
    }
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    margin-bottom: 1.5rem;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 10px;
    transition: all 0.2s ease;

    &:hover {
        background: #f1f5f9;
        transform: translateY(-1px);
    }
}

.icon-wrapper {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eef2ff;
    border-radius: 8px;
    color: #4f46e5;
    flex-shrink: 0;
}

.info-text {
    color: #4b5563;
    font-size: 0.95rem;
    line-height: 1.5;
}

.stats-container {
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;
    padding: 0.75rem 0;
    border-top: 1px solid #f3f4f6;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: default;

    .stat-number {
        font-size: 1.1rem;
        font-weight: 600;
        color: #111827;
    }

    .stat-label {
        font-size: 0.8rem;
        color: #6b7280;
        margin-top: 0.1rem;
    }

    &:hover {
        .stat-number {
            color: #4f46e5;
        }
    }
}

.action-buttons {
    display: flex;
    gap: 0.75rem;
    align-self: flex-start;
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
}

.follow-btn,
.settings-btn {
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-size: 0.9rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    font-weight: 500;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

    i {
        font-size: 0.9rem;
    }
}

.follow-btn {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;

    .btn-hover-effect {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(100%);
        transition: transform 0.3s ease;
    }

    &:hover {
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        transform: translateY(-1px);

        .btn-hover-effect {
            transform: translateY(0);
        }
    }

    &.is-following {
        background: #f3f4f6;
        color: #4b5563;

        &:hover {
            background: #e5e7eb;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
    }
}

.settings-btn {
    background: #f3f4f6;
    color: #4b5563;

    &:hover {
        background: #e5e7eb;
        color: #374151;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
}

.user-dropdown-menu {
    border-radius: 12px;
    padding: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(229, 231, 235, 0.8);
}

.dropdown-item {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    margin: 0.125rem 0;

    i {
        margin-right: 0.5rem;
        width: 18px;
        text-align: center;
    }

    &:hover {
        background: #f3f4f6;
        color: #4f46e5;
    }

    &.danger-item {
        color: #ef4444;

        &:hover {
            background: #fee2e2;
        }
    }
}

@media (max-width: 768px) {
    .user-card {
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.25rem;
    }

    .user-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .name-container {
        align-items: center;
    }

    .action-buttons {
        position: static;
        width: 100%;
        justify-content: center;
    }

    .stats-container {
        justify-content: center;
    }
}

.el-icon {
    margin-right: 4px;
    vertical-align: middle;
    font-size: 1rem;
}

.dropdown-item .el-icon {
    width: 18px;
    text-align: center;
}

.el-button span {
    vertical-align: middle;
}
</style>