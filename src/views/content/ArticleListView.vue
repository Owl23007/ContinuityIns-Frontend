<template>
  <div class="article-list">
    <div class="list-header">
      <h1>我的文章</h1>
      <div class="header-actions">
        <div class="status-filter">
          <button v-for="status in statuses" :key="status.value"
            :class="['filter-btn', { active: currentStatus === status.value }]" @click="setStatus(status.value)">
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
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <div v-for="article in filteredArticles" :key="article.id" class="article-item">
          <article-card :article="article">
            <template #actions>
              <div class="article-actions">
                <router-link v-if="article.status === ArticleStatus.PUBLISHED"
                  :to="{ name: 'articleDetail', params: { id: article.id } }" class="action-btn view-btn">
                  查看
                </router-link>
                <router-link :to="{ name: 'articleEdit', params: { id: article.id } }" class="action-btn edit-btn">
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
import ArticleCard from './components/ArticleCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const articles = ref([])
const loading = ref(true)
const error = ref('')
const currentStatus = ref('')
const showDeleteConfirm = ref(false)
const articleToDelete = ref(null)
const isDeleting = ref(false)

const filteredArticles = computed(() => {
  if (!currentStatus.value) {
    return articles.value;
  }
  return articles.value.filter(article => article.status === currentStatus.value);
});

const statuses = [
  { label: '全部', value: '' },
  { label: '草稿', value: ArticleStatus.DRAFT },
  { label: '私密', value: ArticleStatus.PRIVATE },
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
    const response = await getMyArticles_get()
    // 确保文章数据格式正确
    articles.value = response.data?.map(article => ({
      ...article,
      id: article.articleId || article.id,
      createTime: article.createTime ? new Date(article.createTime).getTime() : Date.now(),
      status: article.status || ArticleStatus.DRAFT
    })) || []
    // 按创建时间降序排序
    articles.value.sort((a, b) => b.createTime - a.createTime)
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
    await deleteArticle_delete(articleToDelete.value.id)
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

<style scoped>
.article-list {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.list-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h1 {
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.status-filter {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 6px 16px;
  border-radius: 6px;
  border: none;
  background: #f5f5f5;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #1890ff;
  color: white;
}

.new-article-btn {
  padding: 8px 20px;
  background: #1890ff;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s;
}

.new-article-btn:hover {
  background: #40a9ff;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 48px 0;
  color: #666666;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty-state svg {
  color: #999999;
  margin-bottom: 16px;
}

.create-btn {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 20px;
  background: #1890ff;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s;
}

.create-btn:hover {
  background: #40a9ff;
}

.delete-confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.confirm-btn,
.cancel-btn {
  padding: 8px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn {
  background: #ff4d4f;
  color: white;
}

.confirm-btn:hover {
  background: #ff7875;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666666;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  padding: 12px 20px;
  border-radius: 4px;
  color: #ff4d4f;
}

/* 添加新的样式 */
.article-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.view-btn {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}

.view-btn:hover {
  background-color: #bae7ff;
  border-color: #1890ff;
}

.edit-btn {
  background-color: #f6ffed;
  color: #52c41a;
  border-color: #b7eb8f;
}

.edit-btn:hover {
  background-color: #d9f7be;
  border-color: #52c41a;
}

.delete-btn {
  background-color: #fff1f0;
  color: #ff4d4f;
  border-color: #ffa39e;
}

.delete-btn:hover {
  background-color: #ffccc7;
  border-color: #ff4d4f;
}
</style>