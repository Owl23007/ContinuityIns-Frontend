<template>
    <div class="profile-articles">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
            <p class="loading-text">努力加载中，请稍候...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>{{ error }}</h3>
            <button @click="fetchArticles" class="retry-btn">重试</button>
        </div>

        <!-- 空状态 -->
        <div v-else-if="articles.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <h3 class="empty-title">{{ isOwnProfile ? '暂无文章' : '该用户暂无文章' }}</h3>
            <p class="empty-desc">{{ isOwnProfile ? '分享你的想法和知识，创建第一篇文章吧' : '该用户还没有发布任何文章内容' }}</p>
            <router-link v-if="isOwnProfile" :to="{ name: 'articleCreate' }" class="create-btn">
                <span class="btn-icon">+</span>
                <span>创建第一篇文章</span>
            </router-link>
        </div>

        <!-- 文章列表 -->
        <div v-else class="articles-container">
            <div class="articles-grid">
                <article-card v-for="article in displayedArticles" :key="article.id" :article="article" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyArticles_get, getUserArticles_get, deleteArticle_delete } from '@/api/article'
import ArticleCard from './card/article-card-cover-only.vue'

const router = useRouter()

const props = defineProps({
    userId: {
        type: [Number, String],
        required: true
    },
    isOwnProfile: {
        type: Boolean,
        default: false
    }
})

const authStore = useAuthStore()
const articles = ref([])
const loading = ref(true)
const showAll = ref(false)
const initialArticleCount = 4
const activeMenu = ref(null)
const error = ref(null)

// 计算当前需要显示的文章
const displayedArticles = computed(() => {
    const sortedArticles = [...articles.value].sort((a, b) => b.createTime - a.createTime)
    return showAll.value ? sortedArticles : sortedArticles.slice(0, initialArticleCount)
})

const fetchArticles = async () => {
    loading.value = true
    error.value = null
    try {
        const response = props.isOwnProfile
            ? await getMyArticles_get(props.userId)
            : await getUserArticles_get(props.userId)

        // 规范化文章数据
        articles.value = (response.data || []).map(article => ({
            ...article,
            id: article.id || article.articleId,
            title: article.title || '无标题文章',
            content: article.content || '',
            coverImg: article.coverImg || article.coverImage,
            createTime: article.createTime ? new Date(article.createTime).getTime() : Date.now(),
            duration: article.duration || 0,
            status: article.status?.toLowerCase() || 'published'
        }))
    } catch (err) {
        console.error('获取文章列表失败:', err)
        articles.value = []
        error.value = '获取文章列表失败，请稍后重试'
    } finally {
        loading.value = false
    }
}



// 关闭点击外部区域时的菜单
const handleClickOutside = (e) => {
    if (activeMenu.value && !e.target.closest('.actions-wrapper')) {
        activeMenu.value = null
    }
}

// 查看文章详情
const viewArticle = (articleId) => {
    if (!articleId) return
    router.push({
        name: 'articleDetail',
        params: { id: articleId }
    })
}

onMounted(() => {
    fetchArticles()

})
</script>

<style scoped>
.profile-articles {
    min-height: 200px;
    position: relative;
}

.articles-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.articles-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    min-width: 240px;
    /* 设置为4列 */
    width: 100%;
    gap: 1.25rem;
}

.article-item {
    height: 100%;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    border-radius: 12px;
}

.article-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* 查看更多按钮 */
.view-more-container {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

.view-more-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 2rem;
    background: var(--surface-color, #fff);
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    cursor: pointer;
}

.view-more-btn:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 66, 185, 131, 0.2), 0.2);
}

.view-more-icon {
    font-size: 0.8rem;
    transition: transform 0.3s ease;
}

.view-more-btn:hover .view-more-icon {
    transform: translateY(2px);
}

/* 加载状态 */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
    color: var(--text-secondary);
}

.spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(var(--primary-color-rgb, 66, 185, 131), 0.2);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-text {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
    font-weight: 500;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.5);
    border-radius: 16px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px dashed var(--border-color);
    transition: all 0.3s ease;
}

.empty-state:hover {
    border-color: var(--primary-color);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.empty-state svg {
    color: var(--text-secondary);
    margin-bottom: 1rem;
    opacity: 0.7;
    animation: float 6s ease-in-out infinite;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

.empty-title {
    font-size: 1.5rem;
    margin: 1rem 0 0.5rem;
    color: var(--text-primary);
}

.empty-desc {
    font-size: 1rem;
    max-width: 400px;
    margin-bottom: 2rem;
}

.create-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.9rem 1.8rem;
    background: var(--primary-color);
    color: white;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(var(--primary-color-rgb, 66, 185, 131), 0.3);
}

.btn-icon {
    font-size: 1.2rem;
    font-weight: bold;
}

.create-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(var(--primary-color-rgb, 66, 185, 131), 0.4);
}

.create-btn:active {
    transform: translateY(0);
}

/* 文章操作按钮 */
.ellipsis-btn {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--text-secondary);
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
}

.ellipsis-btn:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.actions-wrapper {
    position: relative;
    z-index: 30;
}

.actions-dropdown {
    position: absolute;
    top: calc(100% + 5px);
    right: 0;
    width: 140px;
    background: var(--surface-color);
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
    border: 1px solid var(--border-color);
    padding: 0.5rem;
    z-index: 50;
    overflow: visible;
    transform-origin: top right;
    animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--text-primary);
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    border-radius: 8px;
}

.dropdown-item:hover {
    background: var(--hover-bg);
}

.dropdown-item.danger {
    color: #dc2626;
}

.dropdown-item.danger:hover {
    background: rgba(220, 38, 38, 0.1);
}

/* 错误状态样式 */
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
}

.error-state i {
    font-size: 3rem;
    color: #f59e0b;
    margin-bottom: 1rem;
}

.error-state h3 {
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    font-weight: 600;
}

.retry-btn {
    padding: 0.7rem 1.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 66, 185, 131), 0.3);
}

/* 查看按钮样式 */
.view-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--primary-color);
    color: white;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.view-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 66, 185, 131), 0.3);
}

/* 响应式布局 */
@media (max-width: 1024px) {
    .articles-grid {
        grid-template-columns: repeat(3, 1fr);
        /* 中等屏幕3列 */
    }
}

@media (max-width: 768px) {
    .articles-grid {
        grid-template-columns: repeat(2, 1fr);
        /* 平板2列 */
        gap: 1rem;
    }

    .article-item {
        min-height: 140px;
    }

    .empty-state {
        padding: 3rem 1.5rem;
    }

    .empty-title {
        font-size: 1.3rem;
    }

    .view-more-btn {
        padding: 0.7rem 1.5rem;
        font-size: 0.95rem;
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .articles-grid {
        grid-template-columns: 1fr;
        /* 手机端1列 */
        gap: 0.875rem;
    }

    .article-item {
        min-height: 130px;
    }

    .articles-grid {
        gap: 1rem;
    }

    .article-item {
        min-height: 160px;
    }
}
</style>
