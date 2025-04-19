<template>
  <div class="main-container">
    <aside class="sidebar">
      <section class="sidebar-section">
        <h2>网站统计</h2>
        <div class="stats-grid" v-if="stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalArticles }}</span>
            <span class="stat-label">文章总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalViews }}</span>
            <span class="stat-label">总浏览量</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalUsers }}</span>
            <span class="stat-label">注册用户</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.todayArticles }}</span>
            <span class="stat-label">今日发布</span>
          </div>
        </div>
      </section>

      <section class="sidebar-section">
        <h2>公告</h2>
        <div class="announcement">
          <p>欢迎来到ContinuityIns！</p>
        </div>
      </section>

      <section class="sidebar-section">
        <h2>分类导航</h2>
        <div class="categories-list">
          <div v-for="category in categories" :key="category.id" class="category-item"
            @click="filterByCategory(category.id)">
            {{ category.name }}
            <span class="count">({{ category.count }})</span>
          </div>
        </div>
      </section>

      <section class="sidebar-section">
        <h2>热门标签</h2>
        <div class="tags-cloud">
          <span v-for="tag in hotTags" :key="tag.id" class="tag" @click="filterByTag(tag.id)">
            #{{ tag.name }}
          </span>
        </div>
      </section>
    </aside>

    <main class="center-container">
      <div class="filter-bar">
        <div class="filter-group">
          <button :class="['filter-btn', currentFilter === 'recommend' ? 'active' : '']"
            @click="setFilter('recommend')">推荐</button>
          <button :class="['filter-btn', currentFilter === 'latest' ? 'active' : '']"
            @click="setFilter('latest')">最新</button>
          <button :class="['filter-btn', currentFilter === 'hot' ? 'active' : '']" @click="setFilter('hot')">热门</button>
        </div>
      </div>

      <div v-if="followedAuthorsArticles.length > 0" class="section-container">
        <h2>关注作者的最新文章</h2>
        <div class="cards-container horizontal-scroll">
          <ArticleCard v-for="article in followedAuthorsArticles" :key="article.id" :article="article"
            class="medium-card" />
        </div>
      </div>

      <div class="section-container">
        <h2>{{ currentFilter === 'recommend' ? '今日推荐' : currentFilter === 'latest' ? '最新发布' : '热门文章' }}</h2>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>

        <!-- 文章列表 -->
        <div v-else-if="articles.length" class="cards-container">
          <ArticleCard v-for="article in articles" :key="article.id" :article="article" class="large-card" />
        </div>

        <!-- 空状态 -->
        <el-empty v-else description="暂无文章" />

        <!-- 分页器 -->
        <div class="pagination-container" v-if="total > pageSize">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30]"
            :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
            @current-change="handlePageChange" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getUserRecommendations_get,
  getLatestArticles_get,
  getHotArticles_get,
  getCategories_get,
  getHotTags_get,
  getFollowedAuthorsArticles_get,
  getArticlesByCategory_get,
  getArticlesByTag_get,
  getArticleStats_get
} from '@/api/article';
import ArticleCard from './components/article-detail-card.vue';

// 文章列表状态
const articles = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const currentFilter = ref('recommend');

// 侧边栏状态
const categories = ref([]);
const hotTags = ref([]);
const followedAuthorsArticles = ref([]);
const stats = ref(null);

// 获取文章列表
const fetchArticles = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    let response;
    switch (currentFilter.value) {
      case 'latest':
        response = await getLatestArticles_get(currentPage.value, pageSize.value);
        break;
      case 'hot':
        response = await getHotArticles_get(currentPage.value, pageSize.value);
        break;
      default:
        response = await getUserRecommendations_get(currentPage.value, pageSize.value);
    }
    articles.value = response.data;
    total.value = response.total;
  } catch (error) {
    ElMessage.error('获取文章列表失败');
    console.error('获取文章列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取统计信息
const fetchStats = async () => {
  try {
    stats.value = await getArticleStats_get();
  } catch (error) {
    console.error('获取统计信息失败:', error);
  }
};

// 获取分类列表
const fetchCategories = async () => {
  try {
    const { data } = await getCategories_get();
    categories.value = data;
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

// 获取热门标签
const fetchHotTags = async () => {
  try {
    const { data } = await getHotTags_get();
    hotTags.value = data;
  } catch (error) {
    console.error('获取热门标签失败:', error);
  }
};

// 获取关注作者的文章
const fetchFollowedAuthorsArticles = async () => {
  try {
    const { data } = await getFollowedAuthorsArticles_get();
    followedAuthorsArticles.value = data;
  } catch (error) {
    console.error('获取关注作者文章失败:', error);
  }
};

// 过滤文章
const setFilter = (filter) => {
  if (currentFilter.value === filter) return;
  currentFilter.value = filter;
  currentPage.value = 1;
  fetchArticles();
};

// 分类过滤
const filterByCategory = async (categoryId) => {
  try {
    const { data } = await getArticlesByCategory_get(categoryId);
    articles.value = data;
  } catch (error) {
    ElMessage.error('按分类筛选失败');
    console.error('按分类筛选失败:', error);
  }
};

// 标签过滤
const filterByTag = async (tagId) => {
  try {
    const { data } = await getArticlesByTag_get(tagId);
    articles.value = data;
  } catch (error) {
    ElMessage.error('按标签筛选失败');
    console.error('按标签筛选失败:', error);
  }
};

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchArticles();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchArticles();
};

// 页面加载时初始化数据
onMounted(async () => {
  await Promise.all([
    fetchArticles(),
    fetchCategories(),
    fetchHotTags(),
    fetchFollowedAuthorsArticles(),
    fetchStats()
  ]);
});

// 监听过滤器变化
watch(currentFilter, () => {
  fetchArticles();
});
</script>

<style scoped>
.main-container {
  display: flex;
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 2rem var(--padding-x);
  gap: 2rem;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
}

.sidebar-section {
  background-color: var(--surface-color);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px var(--shadow-color);
  margin-bottom: 1.5rem;
}

.center-container {
  flex: 1;
  min-width: 0;
}

.filter-bar {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--surface-color);
  border-radius: 12px;
}

.filter-group {
  display: flex;
  gap: 1rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
}

.section-container {
  margin-bottom: 2rem;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.horizontal-scroll {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding: 0.5rem 0;
  grid-template-columns: none;
}

.horizontal-scroll .medium-card {
  min-width: 240px;
  max-width: 240px;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-item {
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.category-item:hover {
  background-color: var(--hover-color);
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background-color: var(--tag-bg-color);
  border-radius: 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tag:hover {
  background-color: var(--tag-hover-color);
}

h2 {
  font-size: 1.4rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
}

.pagination-container {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--hover-color);
  border-radius: 8px;
  transition: transform 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .main-container {
    padding: 1.5rem var(--padding-x);
  }
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .cards-container {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>