#!js
<template>
    <div class="notifications-container">
        <div class="notifications-header">
            <h1>消息通知</h1>
            <div class="notifications-actions">
                <el-button type="text" @click="markAllAsRead" :disabled="!unreadCount">
                    全部已读
                </el-button>
            </div>
        </div>

        <div class="notifications-content">
            <el-tabs v-model="activeTab" class="notification-tabs">
                <el-tab-pane label="全部消息" name="all">
                    <notification-list :notifications="notifications" :loading="loading" @read="markAsRead"
                        @delete="deleteNotification" />
                </el-tab-pane>
                <el-tab-pane label="评论回复" name="comments">
                    <notification-list :notifications="commentNotifications" :loading="loading" @read="markAsRead"
                        @delete="deleteNotification" />
                </el-tab-pane>
                <el-tab-pane label="点赞收藏" name="likes">
                    <notification-list :notifications="likeNotifications" :loading="loading" @read="markAsRead"
                        @delete="deleteNotification" />
                </el-tab-pane>
                <el-tab-pane label="系统通知" name="system">
                    <notification-list :notifications="systemNotifications" :loading="loading" @read="markAsRead"
                        @delete="deleteNotification" />
                </el-tab-pane>
            </el-tabs>

            <!-- 分页器 -->
            <div class="pagination-container" v-if="notifications.length">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
                    :page-sizes="[10, 20, 30]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NotificationList from '../../components/common/NotificationList.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态管理
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const notifications = ref([])
const loading = ref(false)

// 计算属性：根据类型筛选通知
const commentNotifications = computed(() =>
    notifications.value.filter(n => n.type === 'comment')
)
const likeNotifications = computed(() =>
    notifications.value.filter(n => ['like', 'favorite'].includes(n.type))
)
const systemNotifications = computed(() =>
    notifications.value.filter(n => n.type === 'system')
)

// 未读消息数量
const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
)

// 获取通知列表
const fetchNotifications = async () => {
    if (loading.value) return
    loading.value = true

    try {
        // TODO: 调用获取通知列表API
        // const res = await getNotifications({
        //   page: currentPage.value,
        //   pageSize: pageSize.value,
        //   type: activeTab.value === 'all' ? undefined : activeTab.value
        // })
        // notifications.value = res.data.list
        // total.value = res.data.total

        // 模拟数据
        notifications.value = []
        total.value = 0
    } catch (error) {
        ElMessage.error('获取通知列表失败')
    } finally {
        loading.value = false
    }
}

// 标记单个通知为已读
const markAsRead = async (id) => {
    try {
        // TODO: 调用标记已读API
        // await markNotificationAsRead(id)
        const notification = notifications.value.find(n => n.id === id)
        if (notification) {
            notification.read = true
        }
    } catch (error) {
        ElMessage.error('操作失败，请重试')
    }
}

// 标记所有通知为已读
const markAllAsRead = async () => {
    try {
        await ElMessageBox.confirm(
            '确定要将所有未读消息标记为已读吗？',
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            }
        )

        // TODO: 调用标记全部已读API
        // await markAllNotificationsAsRead()
        notifications.value.forEach(n => n.read = true)
        ElMessage.success('已标记所有消息为已读')
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('操作失败，请重试')
        }
    }
}

// 删除通知
const deleteNotification = async (id) => {
    try {
        await ElMessageBox.confirm(
            '确定要删除这条通知吗？',
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )

        // TODO: 调用删除通知API
        // await deleteNotificationApi(id)
        notifications.value = notifications.value.filter(n => n.id !== id)
        ElMessage.success('已删除通知')
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败，请重试')
        }
    }
}

// 分页处理
const handleSizeChange = () => {
    currentPage.value = 1
    fetchNotifications()
}

const handleCurrentChange = () => {
    fetchNotifications()
}

// 监听标签页变化
watch(activeTab, () => {
    currentPage.value = 1
    fetchNotifications()
})

onMounted(() => {
    fetchNotifications()
})
</script>

<style scoped>
.notifications-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.notifications-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.notification-tabs {
    margin-bottom: 2rem;
}

.notifications-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
}

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 768px) {
    .notifications-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
}
</style>