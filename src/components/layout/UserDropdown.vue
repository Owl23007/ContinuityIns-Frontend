<template>
    <el-dropdown trigger="click" class="user-dropdown">
        <div class="user-dropdown-link">
            <el-avatar :size="32" :src="userAvatar">
                {{ userNameFirst }}
            </el-avatar>
            <span class="username">{{ userName }}</span>
            <el-icon><CaretBottom /></el-icon>
        </div>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">
                    <el-icon><User /></el-icon>个人信息
                </el-dropdown-item>
                <el-dropdown-item @click="goToSettings">
                    <el-icon><Setting /></el-icon>系统设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
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

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.currentUser?.username || '用户')
const userAvatar = computed(() => authStore.userAvatar)
const userNameFirst = computed(() => userName.value.charAt(0))

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
    }).catch(() => {})
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
}

.username {
    font-size: 14px;
    color: #606266;
}
</style>