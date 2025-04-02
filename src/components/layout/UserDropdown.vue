<template>
    <el-dropdown trigger="click" class="user-dropdown">
        <!-- 触发下拉菜单的简洁用户信息显示 -->
        <div class="user-dropdown-link">
            <el-avatar :size="32" :src="userAvatar">
                {{ userNameFirst }}
            </el-avatar>
            <span class="username">{{ userName }}</span>
            <el-icon>
                <CaretBottom />
            </el-icon>
        </div>

        <!-- 下拉菜单内容 -->
        <template #dropdown>
            <el-dropdown-menu class="enhanced-dropdown-menu">
                <!-- 用户卡片头部 -->
                <div class="user-card-header"
                    :style="{ backgroundImage: `url(${userBackground || defaultBackground})` }">
                    <div class="user-card-avatar">
                        <el-avatar :size="64" :src="userAvatar">
                            {{ userNameFirst }}
                        </el-avatar>
                    </div>
                </div>

                <!-- 用户信息 -->
                <div class="user-card-info">
                    <h3 class="user-card-name">{{ userName }}</h3>
                    <p class="user-card-email">{{ userEmail || '未设置邮箱' }}</p>
                </div>

                <!-- 快捷操作按钮组 -->
                <div class="user-card-actions">
                    <el-button size="small" @click="goToProfile">我的主页</el-button>
                    <el-button size="small" @click="goToSettings">系统设置</el-button>
                </div>

                <!-- 菜单项 -->
                <el-dropdown-item @click="goToProfile">
                    <el-icon>
                        <User />
                    </el-icon>个人信息
                </el-dropdown-item>
                <el-dropdown-item @click="goToSettings">
                    <el-icon>
                        <Setting />
                    </el-icon>系统设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                    <el-icon>
                        <SwitchButton />
                    </el-icon>退出登录
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { CaretBottom, User, Setting, SwitchButton } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import defaultCoverImg from '@/assets/image/default_cover.jpg'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.currentUser?.username || '用户')
const userEmail = computed(() => authStore.currentUser?.email || null)
const userAvatar = computed(() => {
    // 如果头像地址是相对路径（不包含http或https），添加API基础URL
    const avatar = authStore.user.avatarImage
    if (avatar && !avatar.startsWith('http')) {
        return import.meta.env.VITE_API_BASE_URL + avatar
    }
    return avatar
})
const userBackground = computed(() => {
    // 同样处理背景图片
    const background = authStore.user.backgroundImage
    if (background && !background.startsWith('http')) {
        return import.meta.env.VITE_API_BASE_URL + background
    }
    return background
})
const userNameFirst = computed(() => userName.value.charAt(0))
const defaultBackground = defaultCoverImg

const goToProfile = () => {
    router.push('/profile')
}

const goToSettings = () => {
    router.push('/settings')
}

const handleLogout = () => {
    ElMessageBox.confirm('确认退出登录吗？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        authStore.logout()
        router.push('/auth')
    }).catch(() => { })
}
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
}

.user-dropdown-link:hover {
    background-color: var(--hover-bg);
}

.username {
    font-size: 14px;
    color: var(--text-color);
    font-weight: 500;
}

/* 增强的下拉菜单样式 */
:deep(.enhanced-dropdown-menu) {
    padding: 0 0 8px 0;
    min-width: 240px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.user-card-header {
    height: 100px;
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 40px;
}

.user-card-avatar {
    position: absolute;
    bottom: -30px;
    display: flex;
    justify-content: center;
    width: 100%;
}

.user-card-avatar :deep(.el-avatar) {
    border: 4px solid #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-card-info {
    text-align: center;
    padding: 0 16px 16px;
    border-bottom: 1px solid var(--border-color);
}

.user-card-name {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color);
}

.user-card-email {
    margin: 0;
    font-size: 13px;
    color: var(--text-secondary-color);
    opacity: 0.8;
}

.user-card-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
}

:deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 14px;
}

:deep(.el-dropdown-menu__item .el-icon) {
    margin-right: 4px;
    font-size: 16px;
}
</style>