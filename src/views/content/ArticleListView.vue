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
        <router-link to="/submit" class="new-article-btn">
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
        <router-link to="/submit" class="create-btn">
          创建第一篇文章
        </router-link>
      </div>

      <!-- 文章列表 -->
      <div v-else class="articles-grid">
        <div v-for="article in articles" :key="article.id" class="article-item">
          <article-card :article="article">
            <template #actions>
              <div class="article-actions">
                <router-link :to="'/article/' + article.id" class="action-btn view-btn">
                  查看
                </router-link>
                <router-link :to="'/submit?edit=' + article.id" class="action-btn edit-btn">
                  编辑
                </router-link>
                <button @click="deleteArticle(article.id)" class="action-btn delete-btn">
                  删除
                </button>
              </div>
            </template>
          </article-card>
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
import { useAuthStore } from '@/stores/auth'
import { getUserArticles_get, deleteArticle_delete } from '@/api/article'
import { ArticleStatus } from '@/pojo/article'
import ArticleCard from '@/components/common/ArticleCard.vue'

const authStore = useAuthStore()
const articles = ref([])
const loading = ref(true)
const error = ref('')
const currentStatus = ref('')

const statuses = [
  { label: '全部', value: '' },
  { label: '草稿', value: ArticleStatus.DRAFT },
  { label: '已发布', value: ArticleStatus.PUBLISHED }
]

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
    articles.value = await getUserArticles_get(authStore.token, currentStatus.value)
  } catch (err) {
    error.value = err.message || '获取文章列表失败'
  } finally {
    loading.value = false
  }
}
</script>