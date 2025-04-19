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
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.7;">
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
          <article-card :article="article" @cover-error="handleCoverError(article)">
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
        <p class="dialog-title">确定要删除文章</p>
        <p class="dialog-article-title">"{{ articleToDelete?.title }}"？</p>
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
    <div v-if="error" class="error-message" @click="retryFetch">
      <span class="error-icon">!</span>
      {{ error }}
      <span class="retry-text">点击刷新</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMyArticles_get, deleteArticle_delete } from '@/api/article'
import { ArticleStatus } from '@/pojo/article'
import ArticleCard from './components/article-detail-card.vue'
import { getMyArticlesList_get } from '../../api/article'
import { onBeforeRouteUpdate } from 'vue-router'
import defaultCover from '@/assets/image/default_cover.jpg'

const articles = ref([])
const loading = ref(true)
const error = ref('')
const currentStatus = ref('')
const showDeleteConfirm = ref(false)
const articleToDelete = ref(null)
const isDeleting = ref(false)
const page = ref(1)

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
  if (currentStatus.value === status) return
  currentStatus.value = status
  fetchArticles(true)
}

// 获取文章列表
const fetchArticles = async (resetPage = true) => {
  if (resetPage) {
    page.value = 1
  }
  loading.value = true
  error.value = ''
  try {
    const response = await getMyArticlesList_get(page.value)
    if (!response || !response.data) {
      throw new Error('获取文章数据失败')
    }
    const articlesArr = Array.isArray(response.data) ? response.data : []
    articles.value = articlesArr.map(article => ({
      ...article,
      id: article.articleId || article.id,
      createTime: new Date(article.createTime || Date.now()).getTime(),
      status: article.status || ArticleStatus.DRAFT,
      title: article.title || '无标题',
      coverImage: article.coverImage || defaultCover
    })).sort((a, b) => b.createTime - a.createTime)
  } catch (err) {
    console.error('获取文章列表失败:', err)
    error.value = '获取文章列表失败，请稍后再试'
    articles.value = []
  } finally {
    loading.value = false
  }
}

// 新增重试加载方法
const retryFetch = () => {
  error.value = ''
  fetchArticles(true)
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

// 处理封面图片加载错误
const handleCoverError = (article) => {
  article.coverImage = defaultCover
}

// 初始化
onMounted(() => {
  fetchArticles(true)
})

// 添加路由更新守卫
onBeforeRouteUpdate((to, from, next) => {
  fetchArticles()
  next()
})
</script>

<style scoped>
.article-list {
  padding: 32px 16px;
  width: 1000px;
  /* 固定宽度 */
  max-width: calc(100% - 32px);
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.06);
}

.list-header {
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 18px 28px;
}

.list-header h1 {
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
  font-weight: 700;
  letter-spacing: -1px;
}

.header-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.status-filter {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 7px 20px;
  border-radius: 8px;
  border: none;
  background: #f5f7fa;
  color: #666;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.filter-btn.active {
  background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.10);
}

.new-article-btn {
  padding: 9px 28px;
  background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.10);
  transition: all 0.2s;
  border: none;
}

.new-article-btn:hover {
  background: linear-gradient(90deg, #40a9ff 60%, #1890ff 100%);
  transform: translateY(-2px) scale(1.04);
}

.articles-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 32px;
  width: 100%;
}

.article-item {
  width: 100%;
  min-width: 0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.article-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.08);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 0 60px 0;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin: 0 auto 18px;
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
  color: #bdbdbd;
  margin-bottom: 18px;
  filter: drop-shadow(0 2px 8px #e6f7ff);
}

.create-btn {
  display: inline-block;
  margin-top: 18px;
  padding: 10px 28px;
  background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.10);
  transition: all 0.2s;
}

.create-btn:hover {
  background: linear-gradient(90deg, #40a9ff 60%, #1890ff 100%);
  transform: translateY(-2px) scale(1.04);
}

.delete-confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1002;
}

.dialog-content {
  background: #fff;
  padding: 32px 28px 24px 28px;
  border-radius: 14px;
  width: 95%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.13);
  text-align: center;
  animation: fadeIn 0.2s;
}

.dialog-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 8px;
}

.dialog-article-title {
  color: #888;
  font-size: 1rem;
  margin-bottom: 18px;
}

.dialog-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 18px;
}

.confirm-btn,
.cancel-btn {
  padding: 10px 28px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.confirm-btn {
  background: #ff4d4f;
  color: white;
  box-shadow: 0 2px 8px #ffccc7;
}

.confirm-btn:hover {
  background: #ff7875;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.error-message {
  position: fixed;
  top: 32px;
  right: 32px;
  background: #fff2f0;
  border: 1.5px solid #ffccc7;
  padding: 14px 28px;
  border-radius: 8px;
  color: #ff4d4f;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 2px 12px #ffccc7;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1003;
  animation: fadeIn 0.2s;
  cursor: pointer;
}

.error-icon {
  background: #ff4d4f;
  color: #fff;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.retry-text {
  font-size: 0.9rem;
  margin-left: 8px;
  text-decoration: underline;
  opacity: 0.8;
}

.error-message:hover {
  background: #fff0ed;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片操作按钮美化 */
.article-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 7px 16px;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  font-weight: 500;
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

/* 响应式优化 */
@media (max-width: 900px) {
  .articles-grid {
    gap: 16px;
  }

  .list-header {
    flex-direction: column;
    gap: 18px;
    padding: 14px 10px;
  }
}

@media (max-width: 600px) {
  .article-list {
    padding: 8px 2px 24px 2px;
    border-radius: 0;
    box-shadow: none;
  }

  .list-header {
    border-radius: 0;
    box-shadow: none;
    padding: 10px 4px;
  }

  .articles-grid {
    gap: 12px;
    margin-top: 16px;
  }
}
</style>