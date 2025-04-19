#!js
<template>
    <div class="notification-list">
        <el-empty v-if="!notifications.length" description="暂无消息" />

        <transition-group name="list" tag="div" class="notifications">
            <div v-for="notification in notifications" :key="notification.id" class="notification-item"
                :class="{ unread: !notification.read }">
                <!-- 通知图标 -->
                <div class="notification-icon" :class="notification.type">
                    <el-icon v-if="notification.type === 'comment'">
                        <ChatLineRound />
                    </el-icon>
                    <el-icon v-else-if="notification.type === 'like'">
                        <Star />
                    </el-icon>
                    <el-icon v-else-if="notification.type === 'system'">
                        <Bell />
                    </el-icon>
                    <el-icon v-else>
                        <InfoFilled />
                    </el-icon>
                </div>

                <!-- 通知内容 -->
                <div class="notification-content" @click="handleClick(notification)">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-message">{{ notification.message }}</div>
                    <div class="notification-meta">
                        <time>{{ formatTime(notification.createdAt) }}</time>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="notification-actions">
                    <el-button v-if="!notification.read" type="text" size="small"
                        @click="$emit('read', notification.id)">
                        标为已读
                    </el-button>
                    <el-button type="text" size="small" @click="$emit('delete', notification.id)">
                        删除
                    </el-button>
                </div>
            </div>
        </transition-group>

        <!-- 加载中状态 -->
        <div v-if="loading" class="notification-loading">
            <el-skeleton :rows="3" animated />
        </div>
    </div>
</template>

<script setup>
import { ChatLineRound, Star, Bell, InfoFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
    notifications: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

// 格式化时间
const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    // 不到1分钟
    if (diff < 60000) {
        return '刚刚'
    }
    // 不到1小时
    if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前'
    }
    // 不到24小时
    if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前'
    }
    // 不到7天
    if (diff < 604800000) {
        return Math.floor(diff / 86400000) + '天前'
    }
    // 超过7天显示具体日期
    return date.toLocaleDateString()
}

// 处理通知点击
const handleClick = (notification) => {
    if (!notification.read) {
        emit('read', notification.id)
    }

    // 根据通知类型和目标进行跳转
    if (notification.targetType === 'article') {
        router.push(`/article/${notification.targetId}`)
    } else if (notification.targetType === 'user') {
        router.push(`/user/${notification.targetId}`)
    }
}

defineEmits(['read', 'delete'])
</script>

<style scoped>
.notification-list {
    min-height: 200px;
}

.notifications {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.notification-item {
    display: flex;
    align-items: flex-start;
    padding: 1rem;
    background: var(--el-bg-color);
    border-radius: 8px;
    transition: all 0.3s ease;
    position: relative;
}

.notification-item:hover {
    background: var(--el-bg-color-page);
}

.notification-item.unread {
    background: var(--el-color-primary-light-9);
}

.notification-item.unread::before {
    content: '';
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 8px;
    height: 8px;
    background: var(--el-color-primary);
    border-radius: 50%;
}

.notification-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
}

.notification-icon.comment {
    background: var(--el-color-success-light-9);
    color: var(--el-color-success);
}

.notification-icon.like {
    background: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
}

.notification-icon.system {
    background: var(--el-color-warning-light-9);
    color: var(--el-color-warning);
}

.notification-content {
    flex: 1;
    min-width: 0;
    cursor: pointer;
}

.notification-title {
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.notification-message {
    color: var(--el-text-color-secondary);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
}

.notification-meta {
    color: var(--el-text-color-secondary);
    font-size: 0.75rem;
}

.notification-actions {
    flex-shrink: 0;
    margin-left: 1rem;
    display: flex;
    gap: 0.5rem;
}

.notification-loading {
    padding: 1rem;
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}

.list-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.list-leave-to {
    opacity: 0;
    transform: translateX(-30px);
}
</style>