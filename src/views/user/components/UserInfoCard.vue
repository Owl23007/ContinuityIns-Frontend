<template>
    <div class="user-card">
        <div class="avatar-container">
            <img :src="avatarUrl" alt="用户头像" class="avatar" @error="$emit('avatar-error', $event)">
            <div class="avatar-hover-effect"></div>
        </div>
        <div class="user-info">
            <div class="user-name">
                <span class="name">
                    {{ user.nickname || user.username }}
                    <span class="username-tag">#{{ user.username }}</span>
                </span>

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
    </div>
</template>

<script setup>
import { computed } from 'vue'
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
    }
})

defineEmits(['avatar-error'])

const avatarUrl = computed(() => props.user.avatarImage || props.defaultAvatar)
</script>

<style scoped>
.user-card {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 18px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 1px solid rgba(0, 0, 0, 0.03);
    position: relative;
    overflow: hidden;
}

.user-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(var(--primary-color-rgb), 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.6s ease;
}

.user-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.user-card:hover::before {
    opacity: 1;
}

.avatar-container {
    position: relative;
    width: 100px;
    height: 100px;
    flex-shrink: 0;
}

.avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #fff;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 2;
    transition: all 0.4s ease;
}

.avatar-hover-effect {
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    background: linear-gradient(45deg, var(--primary-color), #67a27e);
    z-index: 1;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.avatar-container:hover .avatar-hover-effect {
    opacity: 0.4;
    transform: scale(1.05);
}

.avatar-container:hover .avatar {
    transform: scale(1.05);
}

.user-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.2rem;
    flex-wrap: wrap;
}

.name {
    font-size: 1.4rem;
    font-weight: 700;
    color: #2c3e50;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
}

.username-tag {
    color: #7f8c8d;
    font-size: 0.85em;
    font-weight: normal;
    opacity: 0.8;
}

.badge {
    padding: 0.25rem 0.75rem;
    background: linear-gradient(to right, var(--primary-color), #5ec681);
    border-radius: 20px;
    font-size: 0.75rem;
    color: white;
    font-weight: 500;
    box-shadow: 0 2px 5px rgba(124, 77, 255, 0.3);
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1.2rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(6px);
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.03);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.info-item:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateX(5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.icon-wrapper {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary-color), #66c289);
    border-radius: 8px;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 3px 8px rgba(124, 77, 255, 0.3);
}

.info-item .el-icon {
    font-size: 1.1rem;
}

.info-item span {
    font-size: 0.95rem;
    color: #34495e;
    line-height: 1.5;
}

@media (max-width: 768px) {
    .user-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1.2rem;
        padding: 1.5rem 1rem;
    }

    .avatar-container {
        width: 90px;
        height: 90px;
    }

    .user-name {
        justify-content: center;
        margin-bottom: 1rem;
    }

    .info-item {
        justify-content: flex-start;
        padding: 0.7rem 1rem;
    }

    .name {
        font-size: 1.3rem;
    }
}
</style>