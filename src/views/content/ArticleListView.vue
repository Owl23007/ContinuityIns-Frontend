<template>
  <div class="article-list">
    <div class="list-header">
      <h1>我的文章</h1>
      <div class="header-actions">
        <div class="status-filter">
          <button 
            v-for="status in statuses" 
            :key="status.value"
            :class="['filter-btn', { active: currentStatus === status.value }]"
            @click="setStatus(status.value)"
          >
            {{ status.label }}
          </button>
        </div>
        <router-link :to="{ name: 'articleCreate' }" class="new-article-btn">
          写文章
        </router-link>
      </div>
    </div>

    <div class="list-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="articles.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <p>还没有{{ statusLabel }}的文章</p>
        <router-link :to="{ name: 'articleCreate' }" class="create-btn">
          创建第一篇文章
        </router-link>
      </div>

      <!-- 文章列表 -->
      <div v-else class="articles-grid">
        <div v-for="article in articles" :key="article.id" class="article-item">
          <article-card :article="article">
            <template #actions>
              <div class="article-actions">
                <router-link :to="{ name: 'articleDetail', params: { id: article.id }}" class="action-btn view-btn">
                  查看
                </router-link>
                <router-link :to="{ name: 'articleEdit', params: { id: article.id }}" class="action-btn edit-btn">
                  编辑
                </router-link>
                <button @click="confirmDelete(article.id)" class="action-btn delete-btn">
                  删除
                </button>
              </div>
            </template>
          </article-card>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="delete-confirm-dialog">
      <div class="dialog-content">
        <p>确定要删除文章 "{{ articleToDelete?.title }}" 吗？</p>
        <div class="dialog-actions">
          <button @click="deleteArticle" :disabled="isDeleting" class="confirm-btn">
            确定
          </button>
          <button @click="cancelDelete" class="cancel-btn">
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyArticles_get, deleteArticle_delete } from '@/api/article'
import { ArticleStatus } from '@/pojo/article'
import ArticleCard from '@/components/common/ArticleCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const articles = ref([])
const loading = ref(true)
const error = ref('')
const currentStatus = ref('')
const showDeleteConfirm = ref(false)
const articleToDelete = ref(null)
const isDeleting = ref(false)

const statuses = [
  { label: '全部', value: '' },
  { label: '草稿', value: ArticleStatus.DRAFT },
  { label: '已发布', value: ArticleStatus.PUBLISHED }
]

const statusLabel = computed(() => {
  const status = statuses.find(s => s.value === currentStatus.value)
  return status ? status.label : '所有'
})

// 设置状态过滤器
const setStatus = (status) => {
  currentStatus.value = status
  fetchArticles()
}

// 获取文章列表
const fetchArticles = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getMyArticles_get(authStore.token)
    articles.value = response.data || []
  } catch (err) {
    error.value = err.message || '获取文章列表失败'
    console.error('获取文章列表失败:', err)
    articles.value = []
  } finally {
    loading.value = false
  }
}

// 打开删除确认框
const confirmDelete = (articleId) => {
  articleToDelete.value = articles.value.find(a => a.id === articleId)
  showDeleteConfirm.value = true
}

// 取消删除
const cancelDelete = () => {
  showDeleteConfirm.value = false
  articleToDelete.value = null
}

// 执行删除
const deleteArticle = async () => {
  if (!articleToDelete.value || isDeleting.value) return
  
  isDeleting.value = true
  try {
    await deleteArticle_delete(authStore.token, articleToDelete.value.id)
    articles.value = articles.value.filter(a => a.id !== articleToDelete.value.id)
    showDeleteConfirm.value = false
    articleToDelete.value = null
  } catch (err) {
    error.value = err.message || '删除文章失败'
  } finally {
    isDeleting.value = false
  }
}

// 初始化
onMounted(() => {
  fetchArticles()
})
</script>