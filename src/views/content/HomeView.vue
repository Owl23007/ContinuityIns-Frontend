<template>
  <div class="home-page">
    <!-- 动态背景 -->
    <div class="animated-background"></div>

    <el-main class="main-content">
      <el-row :gutter="20">
        <!-- 左侧内容区：slogan + 文章列表 -->
        <el-col :span="18">
          <!-- Slogan -->
          <div class="slogan-container">
            <h1 class="slogan">存续人类的伟大与美德</h1>
          </div>

          <!-- 文章加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="3" animated />
            <el-skeleton style="margin-top: 20px" :rows="3" animated />
          </div>

          <!-- 文章数据显示 -->
          <template v-else>
            <el-row :gutter="20">
              <el-col
                v-for="article in articles"
                :key="article.id"
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
              >
                <ArticleCard :article="article" class="article-item" />
              </el-col>
            </el-row>
          </template>
        </el-col>

        <!-- 右侧边栏 -->
        <el-col :span="6">
          <div class="sidebar">
            <!-- 分类列表 -->
            <el-card class="category-card">
              <template #header>
                <span>文章分类</span>
              </template>
              <!-- 网格布局展示父分类 -->
              <el-row :gutter="10" class="category-grid">
                <el-col
                  v-for="category in parentCategories"
                  :key="category.categoryId"
                  :xs="12"
                  :sm="8"
                  :md="8"
                  :lg="8"
                >
                  <div class="category-item">
                    <div
                      class="parent-category"
                      :data-category-id="category.categoryId"
                      @click="filterByParentCategory(category.categoryId)"
                    >
                      <div class="category-header">
                        <span class="category-icon">{{
                          getCategoryIcon(category.categoryId)
                        }}</span>
                        <span class="category-name">{{ category.name }}</span>
                      </div>
                      <el-icon class="category-arrow"><ArrowDown /></el-icon>
                    </div>

                    <!-- 子分类 - 始终显示，添加左侧边框连接线 -->
                    <div class="subcategories" :data-category-id="category.categoryId">
                      <el-tag
                        v-for="subCategory in getSubCategories(category.categoryId)"
                        :key="subCategory.categoryId"
                        class="subcategory-tag"
                        :style="getSubcategoryStyle(category.categoryId)"
                        @click.stop="filterByCategory(subCategory.categoryId)"
                      >
                        {{ subCategory.name }}
                      </el-tag>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-card>

            <!-- 热门标签 -->
            <el-card class="tags-card">
              <template #header>
                <span>热门标签</span>
              </template>
              <el-tag
                v-for="tag in tags"
                :key="tag.tagId"
                class="tag"
                @click="filterByTag(tag.tagId, tag.tagName)"
              >
                {{ tag.tagName }}
              </el-tag>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router' // 添加 router 导入
import ArticleCard from './components/ArticleCard.vue'
import { fetchArticles, getHotTags_get, getCategories_get, searchArticles } from '@/api/recommend'
import { ArrowDown } from '@element-plus/icons-vue'

const loading = ref(true)
const articles = ref([])
const tags = ref([])
const categories = ref([])
const searchKeyword = ref('') // 搜索关键词
const isSearching = ref(false) // 是否正在搜索

const router = useRouter() // 获取 router 实例

// 计算父分类（顶级分类）
const parentCategories = computed(() => {
  // 过滤顶级分类，并排除"杂谈"分类 (categoryId=10)
  return categories.value.filter(
    (category) => category.parentId === 0 && category.categoryId !== 10
  )
})

// 获取指定父分类下的子分类
const getSubCategories = (parentId) => {
  return categories.value.filter((category) => category.parentId === parentId)
}

// 加载数据
const loadData = async () => {
  loading.value = true

  try {
    try {
      const res = await fetchArticles()
      console.log('完整API响应:', res)

      // 直接从res.list获取数据
      const articlesData = res?.list || []
      console.log('文章数据:', articlesData)

      if (articlesData.length > 0) {
        articles.value = articlesData
        console.log('成功加载文章:', articles.value.length, '条')
      } else {
        console.warn('文章列表为空')
        articles.value = []
      }
    } catch (error) {
      console.error('加载文章失败:', error)
      articles.value = []
    }

    // 加载标签和分类数据，使用try-catch分别处理，避免一个失败影响另一个
    try {
      const tagsData = await getHotTags_get()
      tags.value = tagsData.map((tag) => ({
        ...tag,
        tagName: tag.tagName || '未命名标签', // 确保tagName存在
      }))
      console.log('标签数据:', tags.value)
    } catch (error) {
      console.error('加载标签失败:', error)
      tags.value = []
    }

    try {
      const categoriesData = await getCategories_get()
      categories.value = categoriesData
      console.log('分类数据:', categories.value)
    } catch (error) {
      console.error('加载分类失败:', error)
      categories.value = []
    }
  } catch (error) {
    console.log(' 加载数据失败:', error)
    articles.value = [] // 确保数据为空数组
  } finally {
    loading.value = false
  }
}

// 分类筛选
const filterByCategory = (categoryId) => {
  // 重置搜索状态
  searchKeyword.value = ''
  isSearching.value = false
  // 实现分类筛选逻辑
  loadArticlesByCategory(categoryId)
}

// 修改标签筛选函数
const filterByTag = (tagId, tagName) => {
  // 跳转到搜索页面，将标签名作为关键词
  router.push({
    path: '/search',
    query: {
      keyword: tagName,
      type: 'article' // 默认搜索文章类型
    }
  })
}

// 根据分类加载文章
const loadArticlesByCategory = async (categoryId) => {
  loading.value = true
  try {
    console.log('按分类筛选:', categoryId)
  } catch (error) {
    console.error('按分类加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

// 根据标签加载文章
const loadArticlesByTag = async (tagId) => {
  loading.value = true
  try {
    // 待实现: 调用API按标签获取文章
    const res = await fetchArticlesByTag(tagId)
    articles.value = res?.list || []
    console.log('按标签筛选:', tagId)
  } catch (error) {
    console.error('按标签加载文章失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理函数
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    // 如果搜索框为空，重新加载所有文章
    isSearching.value = false
    await loadData()
    return
  }

  loading.value = true
  isSearching.value = true

  try {
    const searchResults = await searchArticles(searchKeyword.value.trim())
    articles.value = searchResults?.list || []
    console.log('搜索结果:', articles.value.length, '条')
  } catch (error) {
    console.error('搜索失败:', error)
    articles.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

// 定义分类图标映射
const categoryIcons = {
  1: '💻', // 科技
  2: '🏠', // 生活
  3: '📚', // 文学
  4: '🎓', // 学习
  5: '🔗', // 资源
  6: '🎭', // 艺术
  7: '📱', // 数码
  8: '🎮', // 游戏
  9: '🍲', // 美食
  10: '💬', // 杂谈
}

// 获取分类对应的图标
const getCategoryIcon = (categoryId) => {
  return categoryIcons[categoryId] || '📁' // 默认图标
}

// 为子分类标签提供样式，使其与父分类风格匹配
const getSubcategoryStyle = (parentId) => {
  // 为不同父分类使用不同的颜色主题
  const colors = {
    1: { borderColor: '#409EFF', background: '#ecf5ff' }, // 科技 - 蓝色
    2: { borderColor: '#67C23A', background: '#f0f9eb' }, // 生活 - 绿色
    3: { borderColor: '#E6A23C', background: '#fdf6ec' }, // 文学 - 橙色
    4: { borderColor: '#909399', background: '#f4f4f5' }, // 学习 - 灰色
    5: { borderColor: '#6b48ff', background: '#f0edff' }, // 资源 - 紫色
    6: { borderColor: '#F56C6C', background: '#fef0f0' }, // 艺术 - 红色
    7: { borderColor: '#00b7a8', background: '#e6fcfa' }, // 数码 - 青色
    8: { borderColor: '#ff9f43', background: '#fff6ec' }, // 游戏 - 橙黄
    9: { borderColor: '#ff5252', background: '#ffecec' }, // 美食 - 红色
  }

  const color = colors[parentId] || { borderColor: '#dcdfe6', background: '#f0f2f5' }

  return {
    borderColor: color.borderColor,
    background: color.background,
    color: color.borderColor,
  }
}

// 父分类筛选
const filterByParentCategory = (parentCategoryId) => {
  // 重置搜索状态
  searchKeyword.value = ''
  isSearching.value = false
  // 实现父分类筛选逻辑
  loadArticlesByParentCategory(parentCategoryId)
}

// 根据父分类加载文章
const loadArticlesByParentCategory = async (parentCategoryId) => {
  loading.value = true
  try {
    console.log('按父分类筛选:', parentCategoryId)
  } catch (error) {
    console.error('按父分类加载文章失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 动态背景样式 */
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(125deg, #ffffff, #f0f7ff, #e6f1ff);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  z-index: -1;
  opacity: 0.8;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.main-content {
  position: relative;
  z-index: 1;
  padding: 30px;
  backdrop-filter: blur(10px);
}

.slogan-container {
  text-align: left;
  margin-bottom: 30px;
  padding: 20px 0;
}

.slogan {
  font-size: 32px;
  color: #2c3e50;
  font-weight: 700;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  display: inline-block;
}

.slogan::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, #409eff, transparent);
}

.sidebar {
  position: sticky;
  top: 20px;
}

.category-card,
.tags-card {
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.category-grid {
  margin-top: 10px;
}

.category-item {
  margin-bottom: 25px;
  position: relative;
}

.parent-category {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
  font-weight: 500;
  border-left: 4px solid #409eff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.parent-category:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  background-color: #f0f2f5;
}

.parent-category:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-name {
  font-weight: 600;
  font-size: 14px;
}

.category-arrow {
  font-size: 14px;
  transition: transform 0.3s;
  opacity: 0.6;
}

.parent-category:hover .category-arrow {
  transform: translateY(2px);
  opacity: 1;
}

.subcategories {
  position: relative;
  padding: 10px 0 0 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
  position: relative;
}

/* 添加连接线，让子分类看起来从属于父分类 */
.subcategories::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  height: 100%;
  width: 2px;
  background: #dcdfe6;
  opacity: 0.5;
}

/* 为不同父分类的连接线设置对应颜色 */
.subcategories[data-category-id='1']::before {
  background-color: #409eff;
}
.subcategories[data-category-id='2']::before {
  background-color: #67c23a;
}
.subcategories[data-category-id='3']::before {
  background-color: #e6a23c;
}
.subcategories[data-category-id='4']::before {
  background-color: #909399;
}
.subcategories[data-category-id='5']::before {
  background-color: #6b48ff;
}
.subcategories[data-category-id='6']::before {
  background-color: #f56c6c;
}
.subcategories[data-category-id='7']::before {
  background-color: #00b7a8;
}
.subcategories[data-category-id='8']::before {
  background-color: #ff9f43;
}
.subcategories[data-category-id='9']::before {
  background-color: #ff5252;
}

.subcategory-tag {
  cursor: pointer;
  margin-right: 0;
  transition: all 0.2s;
  border-radius: 4px;
  font-size: 12px;
}

.subcategory-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  opacity: 0.9;
}

.category-tag,
.tag {
  margin: 5px;
  cursor: pointer;
}

.footer {
  background-color: #f5f7fa;
  color: #666;
  text-align: center;
  padding: 20px;
}

.article-item {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.article-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .article-item {
    margin-bottom: 15px;
  }
}

.loading-container {
  padding: 20px;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-card {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
}
</style>
