<template>
    <aside class="article-sidebar">
        <router-link :to="{ name: 'userProfile', params: { id: article.createUser?.id } }" class="author-info"
            v-if="article.createUser?.id">
            <el-skeleton :loading="userLoading" animated :throttle="500">
                <template #template>
                    <div class="flex items-center gap-4 w-full">
                        <el-skeleton-item variant="circle" style="width: 60px; height: 60px" />
                        <div class="flex-1">
                            <el-skeleton-item variant="text" style="width: 50%" />
                            <el-skeleton-item variant="text" style="width: 80%" />
                        </div>
                    </div>
                </template>
                <template #default>
                    <div class="author-card">
                        <div class="author-header">
                            <el-avatar :size="60" :src="userInfo?.avatarImage" @error="handleAvatarError"
                                class="author-avatar">
                                <img src="@/assets/image/default_avatar.png" />
                            </el-avatar>
                            <el-tag size="small" type="success" effect="light" class="user-status"
                                v-if="userInfo?.status === 'NORMAL'">
                                <el-icon>
                                    <CircleCheckFilled />
                                </el-icon>
                                活跃
                            </el-tag>
                        </div>
                        <div class="author-details">
                            <div class="author-main">
                                <span class="author-name">{{ userInfo?.nickname || userInfo?.username }}</span>
                                <span class="join-time">{{ formatJoinTime(userInfo?.createTime) }} 加入</span>
                            </div>
                            <el-tooltip :content="userInfo?.signature" placement="bottom" v-if="userInfo?.signature">
                                <p class="author-signature">{{ userInfo.signature }}</p>
                            </el-tooltip>
                        </div>
                    </div>
                </template>
            </el-skeleton>
        </router-link>

        <div class="article-info">
            <el-tag size="small" effect="light" class="publish-time">
                <el-icon>
                    <Calendar />
                </el-icon>
                {{ formatDate(article.createTime) }}
            </el-tag>

            <div class="article-stats">
                <el-tooltip content="查看阅读统计" placement="top">
                    <el-badge :value="article.viewCount || 0" :max="99999" type="info" class="stat-badge">
                        <el-button size="small" text @click="handleViewClick">
                            <el-icon>
                                <View />
                            </el-icon>
                            阅读
                        </el-button>
                    </el-badge>
                </el-tooltip>
                <el-tooltip :content="isLiked ? '取消点赞' : '点赞文章'" placement="top">
                    <el-badge :value="article.likeCount || 0" :max="99999" type="danger" class="stat-badge">
                        <el-button size="small" text @click="handleLikeClick" :class="{ 'is-liked': isLiked }">
                            <el-icon>
                                <Star />
                            </el-icon>
                            点赞
                        </el-button>
                    </el-badge>
                </el-tooltip>
                <el-tooltip content="查看评论" placement="top">
                    <el-badge :value="article.commentCount || 0" :max="99999" type="warning" class="stat-badge">
                        <el-button size="small" text @click="handleCommentClick">
                            <el-icon>
                                <ChatDotRound />
                            </el-icon>
                            评论
                        </el-button>
                    </el-badge>
                </el-tooltip>
                <el-tooltip :content="isCollected ? '取消收藏' : '收藏文章'" placement="top">
                    <el-badge :value="article.collectionCount || 0" :max="99999" type="success" class="stat-badge">
                        <el-button size="small" text @click="handleCollectClick"
                            :class="{ 'is-collected': isCollected }">
                            <el-icon>
                                <Collection />
                            </el-icon>
                            收藏
                        </el-button>
                    </el-badge>
                </el-tooltip>
            </div>

            <el-tag v-if="article.duration" size="small" type="info" effect="plain" class="reading-time">
                <el-icon>
                    <Reading />
                </el-icon>
                {{ article.duration }} 字
            </el-tag>
        </div>

        <div class="article-actions" v-if="isAuthor">
            <el-button-group>
                <el-button type="primary" @click="$emit('edit')" :icon="Edit">
                    编辑文章
                </el-button>
                <el-button type="danger" :icon="Delete">
                    删除文章
                </el-button>
            </el-button-group>
        </div>
    </aside>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getUserById_get } from '@/api/user';
import {
    Calendar,
    View,
    Star,
    ChatDotRound,
    Collection,
    Reading,
    Edit,
    Delete,
    CircleCheckFilled
} from '@element-plus/icons-vue';
import defaultAvatar from '@/assets/image/default_avatar.png';

const props = defineProps({
    article: {
        type: Object,
        required: true
    },
    isAuthor: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['view-stats', 'like', 'show-comments', 'collect', 'edit']);

const isLiked = ref(false);
const isCollected = ref(false);

const userInfo = ref(null);
const userLoading = ref(false);
const userError = ref(null);

const handleViewClick = () => {
    emit('view-stats');
};

const handleLikeClick = () => {
    isLiked.value = !isLiked.value;
    ElMessage({
        type: 'success',
        message: isLiked.value ? '点赞成功' : '已取消点赞'
    });
    emit('like', isLiked.value);
};

const handleCommentClick = () => {
    emit('show-comments');
};

const handleCollectClick = () => {
    isCollected.value = !isCollected.value;
    ElMessage({
        type: 'success',
        message: isCollected.value ? '收藏成功' : '已取消收藏'
    });
    emit('collect', isCollected.value);
};

const fetchUserInfo = async () => {
    if (!props.article?.createUser?.id) return;

    userLoading.value = true;
    userError.value = null;

    try {
        const response = await getUserById_get(props.article.createUser.id);
        if (response.code === 0) {
            userInfo.value = response.data;
        } else {
            throw new Error(response.message || '获取用户信息失败');
        }
    } catch (err) {
        userError.value = err.message;
        ElMessage.error('获取用户信息失败');
    } finally {
        userLoading.value = false;
    }
};

watch(() => props.article?.createUser?.id, (newVal) => {
    if (newVal) {
        fetchUserInfo();
    }
}, { immediate: true });

const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatJoinTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}年${month}月`;
};

const handleAvatarError = (e) => {
    e.target.src = defaultAvatar;
};
</script>

<style scoped>
.article-sidebar {
    flex: 0 0 290px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    border-radius: 16px;
    box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.03),
        0 1px 2px rgba(0, 0, 0, 0.02);
    padding: 2rem;
    height: fit-content;
    position: sticky;
    top: 2rem;
    gap: 2rem;
    border: 1px solid rgba(24, 144, 255, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
}

.article-sidebar:hover {
    transform: translateY(-2px);
    box-shadow:
        0 10px 15px -3px rgba(24, 144, 255, 0.1),
        0 4px 6px -2px rgba(24, 144, 255, 0.05);
}

.author-info {
    padding: 1.2rem;
    border-radius: 12px;
    background: linear-gradient(135deg, #f8fafc 0%, #f0f7ff 100%);
    box-shadow: 0 2px 4px rgba(24, 144, 255, 0.05);
    display: flex;
    align-items: center;
    gap: 1.1rem;
    text-decoration: none;
    width: 100%;
    transition: all 0.3s;
}

.author-info:hover {
    background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%);
    transform: translateY(-2px);
}

.author-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(24, 144, 255, 0.2);
    transition: all 0.3s;
}

.author-avatar:hover {
    border-color: rgba(24, 144, 255, 0.5);
    transform: scale(1.05);
}

.author-card {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.author-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.author-details {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.author-main {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.author-name {
    font-weight: 700;
    color: #1890ff;
    font-size: 1.18rem;
}

.join-time {
    font-size: 0.85rem;
    color: var(--el-text-color-secondary);
}

.user-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
}

.author-signature {
    margin-top: 0.5rem;
    font-size: 0.95rem;
    color: var(--el-text-color-regular);
    line-height: 1.5;
    position: relative;
    padding-left: 1rem;
    border-left: 2px solid var(--el-color-primary-light-5);
    font-style: italic;
}

.article-info {
    background: linear-gradient(135deg, #f8fafc 0%, #f0f7ff 100%);
    padding: 1.2rem;
    border-radius: 12px;
    width: 100%;
    box-shadow: 0 2px 4px rgba(24, 144, 255, 0.05);
}

.publish-time {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.article-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 1rem 0;
    justify-content: space-around;
}

.stat-badge :deep(.el-badge__content) {
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.stat-badge :deep(.el-button) {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    transition: all 0.3s;
}

.stat-badge :deep(.el-button:hover) {
    background-color: var(--el-color-primary-light-9);
    transform: translateY(-2px);
}

.stat-badge :deep(.el-button.is-liked) {
    color: var(--el-color-danger);
}

.stat-badge :deep(.el-button.is-collected) {
    color: var(--el-color-success);
}

.reading-time {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 0.5rem;
}

.article-actions {
    padding: 1rem 0;
    display: flex;
    justify-content: center;
    width: 100%;
}

.flex {
    display: flex;
}

.items-center {
    align-items: center;
}

.gap-4 {
    gap: 1rem;
}

.w-full {
    width: 100%;
}

.flex-1 {
    flex: 1 1 0%;
}

@media (max-width: 900px) {
    .article-sidebar {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        position: static;
        gap: 1.5rem;
        padding: 1.5rem;
    }

    .author-info,
    .article-info {
        flex: 1 1 100%;
    }

    .article-actions {
        justify-content: flex-start;
    }
}

@media (max-width: 600px) {
    .article-sidebar {
        padding: 1rem;
        border-radius: 0;
        box-shadow: none;
        border: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
}
</style>