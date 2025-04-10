<template>
    <div class="profile-articles">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="articles.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <p>{{ isOwnProfile ? '你还没有发布任何文章' : '该用户还没有发布任何文章' }}</p>
            <router-link v-if="isOwnProfile" :to="{ name: 'articleCreate' }" class="create-btn">
                创建第一篇文章
            </router-link>
        </div>

        <!-- 文章列表 -->
        <div v-else class="articles-grid">
            <article-card v-for="article in articles" :key="article.id" :article="article">
                <template #actions>
                    <div class="article-actions" v-if="isOwnProfile">
                        <router-link :to="{ name: 'articleEdit', params: { id: article.id } }"
                            class="action-btn edit-btn">
                            编辑
                        </router-link>
                        <button @click="handleDeleteArticle(article)" class="action-btn delete-btn">
                            删除
                        </button>
                    </div>
                </template>
            </article-card>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getMyArticles_get, getUserArticles_get, deleteArticle_delete } from '@/api/article'
import { ElMessageBox, ElMessage } from 'element-plus'
import ArticleCard from '@/components/common/ArticleCard.vue'

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

const fetchArticles = async () => {
    loading.value = true
    try {
        const response = props.isOwnProfile
            ? await getMyArticles_get(authStore.token)
            : await getUserArticles_get(authStore.token, props.userId)

        articles.value = response.data || []
    } catch (error) {
        console.error('获取文章列表失败:', error)
    } finally {
        loading.value = false
    }
}

const handleDeleteArticle = async (article) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除文章 "${article.title}" 吗？`,
            '删除确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )

        await deleteArticle_delete(authStore.token, article.id)
        articles.value = articles.value.filter(a => a.id !== article.id)
        ElMessage({
            message: '删除成功',
            type: 'success'
        })
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage({
                message: '删除失败',
                type: 'error'
            })
        }
    }
}

onMounted(fetchArticles)
</script>

<style scoped>
.profile-articles {
    min-height: 200px;
}

.articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
    color: var(--text-secondary);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.empty-state svg {
    color: var(--text-secondary);
    margin-bottom: 1rem;
    opacity: 0.7;
}

.create-btn {
    margin-top: 1rem;
    padding: 0.8rem 1.6rem;
    background: var(--primary-color);
    color: white;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.3s ease;
}

.create-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;
}

.edit-btn {
    background-color: var(--primary-color);
    color: white;
}

.edit-btn:hover {
    opacity: 0.9;
}

.delete-btn {
    background-color: #dc2626;
    color: white;
}

.delete-btn:hover {
    opacity: 0.9;
}

@media (max-width: 768px) {
    .articles-grid {
        grid-template-columns: 1fr;
    }
}
</style>
