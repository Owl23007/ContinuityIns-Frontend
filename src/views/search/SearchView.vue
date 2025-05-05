<template>
  <div class="search-page">
    <!-- 搜索区域 -->
    <div class="search-container">
      <!-- 搜索框部分 -->
      <div class="search-box-wrapper">
        <el-input
          v-model="searchKeyword"
          placeholder="输入关键词、标题或作者..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch" :loading="loading" type="primary"> 搜索 </el-button>
          </template>
        </el-input>

        <!-- 搜索过滤器 -->
        <div class="search-filters">
          <el-radio-group v-model="searchType" size="large">
            <el-radio-button label="article">文章</el-radio-button>
            <el-radio-button label="question">问答</el-radio-button>
            <el-radio-button label="user">用户</el-radio-button>
          </el-radio-group>

          <div class="filter-buttons">
            <el-dropdown @command="handleSortChange">
              <el-button type="default">
                {{ sortOptions[currentSort] }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="(label, value) in sortOptions"
                    :key="value"
                    :command="value"
                    >{{ label }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button @click="showAdvancedFilters = !showAdvancedFilters">
              <el-icon><Setting /></el-icon>
              高级筛选
            </el-button>
          </div>
        </div>

        <!-- 高级筛选选项 -->
        <el-collapse-transition>
          <div v-show="showAdvancedFilters" class="advanced-filters">
            <div class="filter-row">
              <h4>时间范围</h4>
              <el-select v-model="timeRange" placeholder="选择时间范围">
                <el-option label="不限" value="all" />
                <el-option label="今天" value="today" />
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
                <el-option label="今年" value="year" />
                <el-option label="自定义范围" value="custom" />
              </el-select>

              <template v-if="timeRange === 'custom'">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </template>
            </div>

            <div class="filter-row">
              <h4>分类</h4>
              <el-select v-model="selectedCategory" placeholder="选择分类" clearable>
                <el-option label="全部分类" value="" />
                <el-option
                  v-for="category in categories"
                  :key="category.categoryId"
                  :label="category.name"
                  :value="category.categoryId"
                />
              </el-select>
            </div>

            <div class="filter-row">
              <h4>标签</h4>
              <el-select
                v-model="selectedTags"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="选择标签"
                clearable
              >
                <el-option v-for="tag in tags" :key="tag.id" :label="tag.tagName" :value="tag.id" />
              </el-select>
            </div>

            <div class="filter-actions">
              <el-button type="primary" @click="applyAdvancedFilters">应用筛选</el-button>
              <el-button @click="resetFilters">重置</el-button>
            </div>
          </div>
        </el-collapse-transition>
      </div>

      <!-- 搜索历史与热门搜索 -->
      <div v-if="!hasSearched || searchResults.length === 0" class="search-history">
        <div class="search-section">
          <h3>
            <el-icon><Clock /></el-icon>
            搜索历史
          </h3>
          <div class="history-tags">
            <el-tag
              v-for="(item, index) in searchHistory"
              :key="index"
              @click="quickSearch(item)"
              closable
              @close="removeFromHistory(index)"
            >
              {{ item }}
            </el-tag>
            <el-button v-if="searchHistory.length > 0" link @click="clearHistory">
              清空历史
            </el-button>
            <p v-else class="no-data">暂无搜索历史</p>
          </div>
        </div>

        <div class="search-section">
          <h3>
            <el-icon><Star /></el-icon>
            热门搜索
          </h3>
          <div class="hot-tags">
            <el-tag
              v-for="(item, index) in hotSearches"
              :key="index"
              @click="quickSearch(item)"
              effect="plain"
              :type="getRandomTagType(index)"
            >
              {{ item }}
            </el-tag>
            <p v-if="hotSearches.length === 0" class="no-data">暂无热门搜索</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果区域 -->
    <div class="search-results-container" v-if="hasSearched">
      <!-- 结果摘要 -->
      <div class="results-summary">
        <h2 v-if="searchResults.length > 0">
          关于 "{{ currentKeyword }}" 的搜索结果，共找到 {{ searchResults.length }} 条匹配内容
        </h2>
        <div v-else class="no-results">
          <el-empty description="没有找到相关结果" :image-size="200">
            <template #description>
              <p>没有找到与 "{{ currentKeyword }}" 相关的内容</p>
            </template>
          </el-empty>
        </div>
      </div>

      <!-- 结果列表 -->
      <div v-if="searchResults.length > 0" class="results-list">
        <el-card v-for="(item, index) in searchResults" :key="index" class="result-item">
          <!-- 文章结果 -->
          <router-link :to="`/article/${item.id}`" class="item-title">
            <template v-if="item.type === 'article'">
            <div class="item-header">
                <span v-html="highlightKeyword(item.title)"></span>
              <el-tag size="small" effect="plain">文章</el-tag>
            </div>

            <div class="item-meta">
              <span class="author">
                <el-avatar :size="20" :src="item.author.avatar"></el-avatar>
                {{ item.author.name }}
              </span>
              <span class="date">{{ formatDate(item.publishDate) }}</span>
              <span class="views">
                <el-icon><View /></el-icon> {{ item.views }}
              </span>
              <span class="likes">
                <el-icon><Star /></el-icon> {{ item.likes }}
              </span>
            </div>

            <div class="item-snippet" v-html="highlightKeyword(item.snippet)"></div>

            <div class="item-tags">
              <el-tag v-for="tag in item.tags" :key="tag.id" size="small" effect="light">
                {{ tag.name }}
              </el-tag>
            </div>
          </template>
          </router-link>

          <!-- 问答结果 -->
          <template v-if="item.type === 'question'">
            <div class="item-header">
              <router-link :to="`/question/${item.id}`" class="item-title">
                <span v-html="highlightKeyword(item.title)"></span>
              </router-link>
              <el-tag size="small" effect="plain" type="success">问答</el-tag>
            </div>

            <div class="item-meta">
              <span class="author">
                <el-avatar :size="20" :src="item.author.avatar"></el-avatar>
                {{ item.author.name }}
              </span>
              <span class="date">{{ formatDate(item.publishDate) }}</span>
              <span class="answers">
                <el-icon><ChatRound /></el-icon> {{ item.answerCount }} 回答
              </span>
            </div>

            <div class="item-snippet" v-html="highlightKeyword(item.snippet)"></div>
          </template>

          <!-- 用户结果 -->
          <template v-if="item.type === 'user'">
            <div class="user-result">
              <el-avatar :size="60" :src="item.avatar"></el-avatar>
              <div class="user-info">
                <router-link :to="`/user/${item.id}`" class="user-name">
                  <span v-html="highlightKeyword(item.name)"></span>
                </router-link>
                <div class="user-bio" v-if="item.bio" v-html="highlightKeyword(item.bio)"></div>
                <div class="user-stats">
                  <span>文章: {{ item.articleCount }}</span>
                  <span>关注者: {{ item.followerCount }}</span>
                </div>
              </div>
              <el-button type="primary" plain size="small">关注</el-button>
            </div>
          </template>
        </el-card>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="searchResults.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalResults"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, ArrowDown, Setting, Clock, Star, View, ChatRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCategories_get, getHotTags_get ,searchContent} from '@/api/recommend'
import defaultCover from '@/assets/image/default_cover.png'

const router = useRouter()
const route = useRoute()

// 搜索相关状态
const searchKeyword = ref('')
const currentKeyword = ref('')
const loading = ref(false)
const hasSearched = ref(false)
const searchResults = ref([])
const totalResults = ref(0)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索历史
const searchHistory = ref([])
const hotSearches = ref([])

// 筛选相关
const searchType = ref('article') // 默认改为'article'
const currentSort = ref('relevance')
const sortOptions = {
  relevance: '相关度排序',
  newest: '最新发布',
  popular: '最多浏览',
  likes: '最多点赞',
}
const showAdvancedFilters = ref(false)
const timeRange = ref('all')
const dateRange = ref([])
const selectedCategory = ref('')
const selectedTags = ref([])

// 分类和标签数据
const categories = ref([])
const tags = ref([])

// 生成随机标签类型
const tagTypes = ['', 'success', 'info', 'warning', 'danger']
const getRandomTagType = (index) => {
  return tagTypes[index % tagTypes.length]
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 高亮关键词
const highlightKeyword = (text) => {
  if (!text || !currentKeyword.value) return text

  const regex = new RegExp(`(${currentKeyword.value})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 从URL参数中获取搜索关键词
const getSearchParamsFromUrl = () => {
  const { keyword, type, page, sort } = route.query
  if (keyword) {
    searchKeyword.value = keyword
    // 只允许 article/question/user
    if (['article', 'question', 'user'].includes(type)) {
      searchType.value = type
    } else {
      searchType.value = 'article'
    }
    currentPage.value = parseInt(page) || 1
    currentSort.value = sort || 'relevance'
    handleSearch()
  }
}

// 更新URL参数
const updateUrlParams = () => {
  router.push({
    path: '/search',
    query: {
      keyword: currentKeyword.value,
      type: searchType.value,
      page: currentPage.value,
      sort: currentSort.value,
    },
  })
}

// 执行搜索
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  currentKeyword.value = searchKeyword.value.trim()
  hasSearched.value = true

  // 添加到搜索历史
  addToSearchHistory(currentKeyword.value)

  // 更新URL
  updateUrlParams()

  try {
    const searchParams = {
      keyword: currentKeyword.value,
      type: searchType.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      sort: currentSort.value,
      category: selectedCategory.value,
      tags: selectedTags.value,
      timeRange: timeRange.value,
      dateStart: timeRange.value === 'custom' && dateRange.value[0] ? dateRange.value[0] : null,
      dateEnd: timeRange.value === 'custom' && dateRange.value[1] ? dateRange.value[1] : null,
    }

    const response = await searchContent(searchParams)
    // 数据字段映射
    const data = response
    searchResults.value = (data || []).map((item) => {
      if (searchType.value === 'article') {
        return {
          id: item.articleId || item.id,
          type: 'article',
          title: item.title,
          summary: item.summary,
          snippet: item.summary || '', // 可根据需要调整
          cover: item.coverImage || defaultCover,
          views: item.viewCount,
          likes: item.likeCount,
          collects: item.collectionCount,
          publishDate: item.createTime || item.publishDate,
          author: {
            id: item.userId,
            name: item.authorName || '', // 需后端补充
            avatar: item.authorAvatar || '', // 需后端补充
          },
          tags: item.tags || [],
        }
      }
      if (searchType.value === 'question') {
        return {
          id: item.questionId || item.id,
          type: 'question',
          title: item.title,
          snippet: item.summary || '',
          publishDate: item.createTime || item.publishDate,
          author: {
            id: item.userId,
            name: item.authorName || '',
            avatar: item.authorAvatar || '',
          },
          answerCount: item.answerCount || 0,
          tags: item.tags || [],
        }
      }
      if (searchType.value === 'user') {
        return {
          id: item.userId || item.id,
          type: 'user',
          name: item.name,
          avatar: item.avatar,
          bio: item.bio,
          articleCount: item.articleCount,
          followerCount: item.followerCount,
        }
      }
      return item
    })
    totalResults.value = data || 0

    if (searchResults.value.length === 0) {
      ElMessage.info('没有找到相关内容')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索请求失败，请稍后重试')
    searchResults.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
  }
}

// 快速搜索
const quickSearch = (keyword) => {
  searchKeyword.value = keyword
  handleSearch()
}

// 添加搜索历史
const addToSearchHistory = (keyword) => {
  // 移除现有相同关键词
  const index = searchHistory.value.findIndex((item) => item === keyword)
  if (index !== -1) {
    searchHistory.value.splice(index, 1)
  }

  // 添加到最前面
  searchHistory.value.unshift(keyword)

  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value.pop()
  }

  // 保存到localStorage
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 从历史中删除
const removeFromHistory = (index) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 清空历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.setItem('searchHistory', JSON.stringify([]))
}

// 排序方式改变
const handleSortChange = (sort) => {
  currentSort.value = sort
  handleSearch()
}

// 应用高级筛选
const applyAdvancedFilters = () => {
  handleSearch()
}

// 重置筛选
const resetFilters = () => {
  selectedCategory.value = ''
  selectedTags.value = []
  timeRange.value = 'all'
  dateRange.value = []
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  hasSearched.value = false
  currentKeyword.value = ''
  searchResults.value = []
  totalResults.value = 0
  resetFilters()
  router.push('/search')
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  handleSearch()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  handleSearch()
}

// 加载分类和标签数据
const loadCategoriesAndTags = async () => {
  try {
    // 获取分类和标签数据
    const [categoriesRes, tagsRes] = await Promise.all([getCategories_get(), getHotTags_get()])

    // 直接使用响应数据，不需要 .data
    categories.value = categoriesRes || []
    tags.value = tagsRes || []
    // 暂时移除 hotSearches 的加载，因为 API 还未实现
    hotSearches.value = ['前端开发', 'Vue3', 'JavaScript'] // 临时数据
  } catch (error) {
    console.error('加载分类和标签数据失败:', error)
    ElMessage.error('加载筛选数据失败')
    categories.value = []
    tags.value = []
    hotSearches.value = []
  }
}

// 从localStorage加载搜索历史
const loadSearchHistory = () => {
  try {
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      searchHistory.value = JSON.parse(savedHistory)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
    searchHistory.value = []
  }
}

// 监听搜索类型变化
watch(searchType, () => {
  if (hasSearched.value) {
    handleSearch()
  }
})

// 监听路由变化
watch(
  () => route.query,
  () => {
    getSearchParamsFromUrl()
  },
  { immediate: true }
)

// 组件挂载时
onMounted(() => {
  loadSearchHistory()
  loadCategoriesAndTags()
  getSearchParamsFromUrl()
})
</script>

<style scoped>
/* 修改宽度相关样式 */
.search-page {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
}

.search-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 3rem;
}

.search-box-wrapper {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.search-history {
  width: 100%;
  max-width: 1000px;
  margin: 2rem auto;
}

.search-results-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* 调整响应式布局 */
@media (max-width: 1400px) {
  .search-page {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .search-page {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 576px) {
  .search-page {
    padding: 1rem;
  }
}

.search-header {
  text-align: center;
  margin-bottom: 2rem;
}

.search-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #12c2e9, #c471ed, #f64f59);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.search-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-top: 0.5rem;
}

.search-input {
  width: 100%;
  margin-bottom: 1.5rem;
}

.search-input :deep(.el-input__wrapper) {
  padding: 0.8rem;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
}

.search-icon {
  font-size: 1.5rem;
  color: #909399;
  margin-right: 0.5rem;
}

.search-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.advanced-filters {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-row h4 {
  width: 80px;
  margin: 0;
}

.filter-row .el-select {
  width: 200px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.search-section {
  margin-bottom: 2rem;
}

.search-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #606266;
}

.history-tags,
.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.el-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.el-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-data {
  color: #909399;
  font-style: italic;
}

/* 搜索结果样式 */
.results-summary {
  margin-bottom: 2rem;
}

.results-summary h2 {
  font-size: 1.5rem;
  color: #303133;
  margin-bottom: 1rem;
}

.no-results {
  text-align: center;
  padding: 3rem 0;
}

.no-results .suggestions {
  margin-top: 1rem;
  font-weight: bold;
}

.no-results ul {
  list-style-type: disc;
  text-align: left;
  max-width: 300px;
  margin: 1rem auto;
  padding-left: 2rem;
}

.result-item {
  margin-bottom: 1.5rem;
  transition: all 0.3s;
}

.result-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.item-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #303133;
  text-decoration: none;
}

.item-title:hover {
  color: #409eff;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  color: #909399;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-snippet {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #606266;
}

.item-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.user-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.user-info {
  flex: 1;
  min-width: 200px;
}

.user-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #303133;
  text-decoration: none;
}

.user-bio {
  color: #606266;
  margin: 0.5rem 0;
}

.user-stats {
  display: flex;
  gap: 1.5rem;
  color: #909399;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

/* 高亮关键词 */
:deep(.highlight) {
  background-color: #ffe58f;
  padding: 0 2px;
  border-radius: 2px;
  font-weight: bold;
}

/* 响应式布局适配 */
@media (max-width: 1200px) {
  .search-page {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 992px) {
  .search-header h1 {
    font-size: 2rem;
  }

  .search-subtitle {
    font-size: 1rem;
  }

  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .el-radio-group {
    margin-bottom: 1rem;
    display: flex;
    overflow-x: auto;
  }
}

@media (max-width: 768px) {
  .search-header h1 {
    font-size: 1.8rem;
  }

  .filter-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-row h4 {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .filter-row .el-select,
  .filter-row .el-date-picker {
    width: 100%;
  }

  .filter-actions {
    justify-content: center;
  }

  .user-result {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-info {
    margin: 1rem 0;
  }

  .item-meta {
    gap: 1rem;
  }

  .results-summary h2 {
    font-size: 1.2rem;
  }
}

@media (max-width: 576px) {
  .search-page {
    padding: 1rem 0.5rem;
  }

  .search-header h1 {
    font-size: 1.5rem;
  }

  .search-subtitle {
    font-size: 0.9rem;
  }

  .item-title {
    font-size: 1.1rem;
  }

  .search-icon {
    font-size: 1.2rem;
  }

  .search-filters :deep(.el-radio-button__inner) {
    padding: 8px 12px;
  }

  .advanced-filters {
    padding: 1rem;
  }

  .pagination-container :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-container :deep(.el-pagination__jump) {
    margin-top: 0.5rem;
  }

  .filter-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .filter-buttons .el-dropdown .el-button,
  .filter-buttons .el-button {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}

/* 修复Element Plus组件在小屏幕上的显示问题 */
:deep(.el-select),
:deep(.el-date-picker) {
  width: 100%;
  max-width: 100%;
}

:deep(.el-date-editor.el-input),
:deep(.el-date-editor.el-input__wrapper) {
  width: 100%;
}

:deep(.el-select-dropdown__item) {
  white-space: normal;
  word-break: break-word;
}

:deep(.el-pagination) {
  white-space: normal;
}

/* Windows平台优化 */
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Windows风格的悬浮效果 */
.result-item {
  cursor: default;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* Windows风格的点击反馈 */
.el-button:active {
  transform: translateY(1px);
}

.el-tag:active {
  transform: translateY(1px);
}

/* 键盘操作焦点样式 */
.item-title:focus {
  outline: 2px solid #409eff;
  outline-offset: 2px;
  border-radius: 2px;
}

.el-button:focus-visible,
.el-tag:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

/* 优化选择文本颜色 */
::selection {
  background: #409eff40;
  color: inherit;
}

/* 优化输入框体验 */
.search-input :deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 2px #409eff40;
}

/* 优化下拉菜单动画 */
.el-dropdown-menu {
  animation: dropdownSlide 0.2s ease-out;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 触摸设备优化 */
@media (hover: none) {
  .result-item:hover {
    transform: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .el-tag:hover {
    transform: none;
  }
}
</style>
