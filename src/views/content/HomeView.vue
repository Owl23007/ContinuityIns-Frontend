<template>
  <div class="main-container">
    <aside class="sidebar">
      <el-card class="sidebar-section" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>网站统计</span>
          </div>
        </template>
        <div class="stats-grid">
          <el-skeleton :loading="!stats" animated>
            <template #template>
              <div class="stats-loading">
                <el-skeleton-item variant="p" style="width: 100%" />
                <el-skeleton-item variant="p" style="width: 100%" />
              </div>
            </template>
            <template #default>
              <div class="stat-item">
                <el-icon class="stat-icon">
                  <Document />
                </el-icon>
                <span class="stat-value">{{ stats?.statusCounts?.PUBLISHED || 0 }}</span>
                <span class="stat-label">已发布文章</span>
              </div>
              <div class="stat-item">
                <el-icon class="stat-icon">
                  <View />
                </el-icon>
                <span class="stat-value">{{ stats?.totalViews || 0 }}</span>
                <span class="stat-label">总浏览量</span>
              </div>
              <div class="stat-item">
                <el-icon class="stat-icon">
                  <Star />
                </el-icon>
                <span class="stat-value">{{ stats?.totalLikes || 0 }}</span>
                <span class="stat-label">获得点赞</span>
              </div>
              <div class="stat-item">
                <el-icon class="stat-icon">
                  <Edit />
                </el-icon>
                <span class="stat-value">{{ stats?.statusCounts?.DRAFT || 0 }}</span>
                <span class="stat-label">草稿文章</span>
              </div>
            </template>
          </el-skeleton>
        </div>
      </el-card>

      <el-card class="sidebar-section" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>公告</span>
            <el-tag size="small" type="danger" effect="dark">最新</el-tag>
          </div>
        </template>
        <div class="announcement">
          <p>欢迎来到ContinuityIns！</p>
        </div>
      </el-card>

      <el-card class="sidebar-section" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>分类导航</span>
          </div>
        </template>
        <CategoryNavigator :raw-categories="rawCategories" :loading="categoriesLoading" @select="filterByCategory" />
      </el-card>

      <el-card class="sidebar-section" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>热门标签</span>
          </div>
        </template>
        <div class="tags-cloud">
          <el-tag v-for="tag in hotTags" :key="tag.id" class="tag" :type="getRandomTagType()" effect="plain"
            @click="filterByTag(tag.id)">
            #{{ tag.name }}
          </el-tag>
        </div>
      </el-card>
    </aside>

    <main class="center-container">
      <el-card class="filter-bar" shadow="hover">
        <el-radio-group v-model="currentFilter" @change="setFilter">
          <el-radio-button label="recommend">推荐</el-radio-button>
          <el-radio-button label="daily">每日</el-radio-button>
          <el-radio-button label="latest">最新</el-radio-button>
          <el-radio-button label="hot">热门</el-radio-button>
        </el-radio-group>
      </el-card>

      <el-card v-if="followedAuthorsArticles.length > 0" class="section-container" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>关注作者的最新文章</span>
            <el-button text type="primary" size="small">查看全部</el-button>
          </div>
        </template>
        <el-scrollbar>
          <div class="cards-container horizontal-scroll">
            <ArticleCard v-for="article in followedAuthorsArticles" :key="article.article_id" :article="article"
              class="medium-card" />
          </div>
        </el-scrollbar>
      </el-card>

      <el-card class="section-container" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>{{
              currentFilter === 'recommend' ? '今日推荐' :
                currentFilter === 'daily' ? '每日精选' :
                  currentFilter === 'latest' ? '最新发布' : '热门文章'
            }}</span>
            <el-tag type="primary" effect="plain">{{ total }}篇文章</el-tag>
          </div>
        </template>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>

        <!-- 文章列表 -->
        <div v-else-if="articles.length" class="cards-container">
          <ArticleCard v-for="article in articles" :key="article.article_id" :article="article" class="large-card" />
        </div>

        <!-- 空状态 -->
        <el-empty v-else description="暂无文章" />

        <!-- 分页器 -->
        <div class="pagination-container" v-if="total > pageSize">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30]"
            :total="total" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
            @current-change="handlePageChange" background />
        </div>
      </el-card>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, View, Star, Edit } from '@element-plus/icons-vue';
import {
  getUserRecommendations_get,
  getLatestArticles_get,
  getHotArticles_get,
  getCategories_get,
  getHotTags_get,
  getFollowedAuthorsArticles_get,
  getArticlesByCategory_get,
  getArticlesByTag_get,
  getArticleStats_get,
  getDailyRecommendations_get
} from '@/api/recommend';
import ArticleCard from './components/article-detail-card.vue';
import CategoryNavigator from './components/CategoryNavigator.vue';

// 文章列表状态
const articles = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const currentFilter = ref('recommend');

// 侧边栏状态
const categories = ref([]);
const rawCategories = ref([]);  // 原始分类数据
const hotTags = ref([]);
const followedAuthorsArticles = ref([]);
const stats = ref(null);
const categoriesLoading = ref(false);

// 文章数据转换函数
const transformArticleData = (articleData) => {
  if (!articleData) return [];

  // 如果是数组，直接处理数组中的每个文章
  if (Array.isArray(articleData)) {
    return articleData.map(article => {
      // 确保文章有id属性
      if (!article.id && article.article_id) {
        article.id = article.article_id;
      }
      return article;
    });
  }

  // 如果是包含articles数组的对象
  if (articleData.articles && Array.isArray(articleData.articles)) {
    articleData.articles = articleData.articles.map(article => {
      if (!article.id && article.article_id) {
        article.id = article.article_id;
      }
      return article;
    });
  }

  return articleData;
};

// 将函数暴露到全局，以便API文件可以使用
// 注意：这是临时解决方案，最好的做法是修改API文件
window.transformArticleData = transformArticleData;

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
      case 'daily':
        response = await getDailyRecommendations_get(currentPage.value, pageSize.value);
        break;
      default:
        response = await getUserRecommendations_get(currentPage.value, pageSize.value);
    }

    console.log('API返回结果:', response);

    // 更宽容的数据处理，不要轻易抛出错误
    if (!response) {
      console.warn('API返回为空');
      articles.value = [];
      total.value = 0;
      return;
    }

    // 检查完整响应结构
    if (response.code !== undefined) {
      // 标准响应结构处理
      if (response.code === 0) {
        const data = response.data;
        // 确保数据非空
        if (!data) {
          console.warn('API返回的data为空');
          articles.value = [];
          total.value = 0;
          return;
        }

        // 使用转换函数处理数据
        const transformedData = transformArticleData(data);

        if (Array.isArray(transformedData)) {
          articles.value = transformedData;
          total.value = transformedData.length;
          console.log('成功获取文章列表(数组):', articles.value.length, '篇文章');
        } else if (transformedData.articles) {
          articles.value = transformedData.articles;
          total.value = transformedData.total || transformedData.articles.length;
          console.log('成功获取文章列表(对象):', articles.value.length, '篇文章');
        } else {
          articles.value = [];
          total.value = 0;
          console.warn('API返回的数据结构不符合预期:', transformedData);
        }
      } else {
        console.error('API返回错误码:', response.code, response.message);
        ElMessage.warning(response.message || '获取文章列表没有数据');
        articles.value = [];
        total.value = 0;
      }
    } else if (Array.isArray(response)) {
      // 直接返回数组的情况
      const transformedData = transformArticleData(response);
      articles.value = transformedData;
      total.value = transformedData.length;
      console.log('成功获取文章列表(直接数组):', articles.value.length, '篇文章');
    } else if (typeof response === 'object' && response !== null) {
      // 其他对象结构
      if (Array.isArray(response.articles)) {
        const transformedData = transformArticleData(response.articles);
        articles.value = transformedData;
        total.value = response.total || transformedData.length;
        console.log('成功获取文章列表(其他对象结构):', articles.value.length, '篇文章');
      } else {
        console.warn('无法识别的API响应格式:', response);
        articles.value = [];
        total.value = 0;
      }
    } else {
      console.error('不支持的API响应类型:', typeof response);
      articles.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取文章列表出现异常:', error);
    ElMessage.error('获取文章列表失败: ' + (error.message || '未知错误'));
    articles.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 获取统计信息
const fetchStats = async () => {
  try {
    const response = await getArticleStats_get();
    if (response.code === 0 && response.data) {
      stats.value = response.data;
    } else {
      throw new Error(response.message || '获取统计数据失败');
    }
  } catch (error) {
    console.error('获取统计信息失败:', error);
    ElMessage.error('获取统计信息失败');
  }
};

// 获取分类列表
const fetchCategories = async () => {
  categoriesLoading.value = true;
  try {
    const response = await getCategories_get();
    console.log('完整API响应:', response);

    // 检查响应是否为数组（直接返回分类数据的情况）
    if (Array.isArray(response)) {
      console.log('API直接返回分类数组数据，长度:', response.length);
      rawCategories.value = response;
      return;
    }

    // 检查标准响应结构
    if (!response) {
      throw new Error('API返回为空');
    }

    if (response.code === 0) {
      // 直接存储原始数据，让组件处理转换
      if (Array.isArray(response.data) && response.data.length > 0) {
        rawCategories.value = response.data;
        console.log('获取到原始分类数据:', rawCategories.value.length, '条');
      } else if (response.data && Array.isArray(response.data.categories)) {
        rawCategories.value = response.data.categories;
      } else {
        console.warn('API返回的分类数据格式不正确:', response.data);
        rawCategories.value = [];
      }
    } else {
      console.error('API返回错误:', response.message);
      ElMessage.error(response.message || '获取分类数据失败');
      rawCategories.value = [];
    }
  } catch (error) {
    console.error('获取分类列表失败:', error);
    ElMessage.error('获取分类列表失败: ' + (error.message || '未知错误'));
    rawCategories.value = [];
  } finally {
    categoriesLoading.value = false;
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
    const response = await getFollowedAuthorsArticles_get();
    if (response.code === 0 && response.data) {
      // 使用转换函数处理响应数据
      followedAuthorsArticles.value = transformArticleData(response.data);
    }
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

// 分类过滤 - 现在接收的是组件发送的分类对象
const filterByCategory = async (category) => {
  if (!category || !category.categoryId) {
    console.error('分类对象无效:', category);
    return;
  }

  try {
    console.log('主视图收到点击分类:', category.name, '分类ID:', category.categoryId);
    loading.value = true;

    // 默认分类ID处理特殊情况
    if (category.categoryId === 999) {
      // 重置为默认查询
      fetchArticles();
      return;
    }

    const response = await getArticlesByCategory_get(category.categoryId);
    if (response.code === 0) {
      // 处理不同的数据结构可能性
      if (Array.isArray(response.data)) {
        articles.value = response.data;
        total.value = response.data.length;
      } else if (response.data && response.data.articles) {
        articles.value = response.data.articles;
        total.value = response.data.total || response.data.articles.length;
      } else if (response.data) {
        articles.value = [response.data];
        total.value = 1;
      } else {
        articles.value = [];
        total.value = 0;
      }
    } else {
      throw new Error(response.message || '按分类筛选失败');
    }
  } catch (error) {
    ElMessage.error('按分类筛选失败');
    console.error('按分类筛选失败:', error);
    articles.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 标签过滤
const filterByTag = async (tagId) => {
  try {
    const response = await getArticlesByTag_get(tagId);
    if (response.code === 0 && response.data) {
      // 使用转换函数处理响应数据
      const transformedData = transformArticleData(response.data);

      if (Array.isArray(transformedData)) {
        articles.value = transformedData;
        total.value = transformedData.length;
      } else {
        articles.value = transformedData.articles || [];
        total.value = transformedData.total || 0;
      }
    }
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

// 随机标签类型
const tagTypes = ['success', 'info', 'warning', 'danger', ''];
const getRandomTagType = () => {
  return tagTypes[Math.floor(Math.random() * tagTypes.length)];
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
  margin-bottom: 1.5rem;
}

.center-container {
  flex: 1;
  min-width: 0;
}

.filter-bar {
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 1.2rem;
  font-weight: 600;
}

.section-container {
  margin-bottom: 1.5rem;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.horizontal-scroll {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  grid-template-columns: none;
}

.horizontal-scroll .medium-card {
  min-width: 240px;
  max-width: 240px;
  transition: transform 0.3s;
}

.horizontal-scroll .medium-card:hover {
  transform: translateY(-5px);
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 0.5rem;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 0.5rem;
}

.tag {
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.loading-container {
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
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.2rem;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid var(--el-border-color-light);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow-light);
  border-color: var(--el-color-primary-light-7);
}

.stat-icon {
  font-size: 1.5rem;
  color: var(--el-color-primary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
}

/* 响应式调整 */
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