<template>
  <div class="home-page">
    <!-- 主体内容区 -->
    <el-main class="main-content">
      <el-row :gutter="20">
        <!-- 瀑布流文章列表 -->
        <el-col :span="18">
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

        <!-- 侧边栏 -->
        <el-col :span="6">
          <div class="sidebar">
            <!-- 分类列表 -->
            <el-card class="category-card">
              <template #header>
                <span>文章分类</span>
              </template>
              <el-tag
                v-for="category in categories"
                :key="category.id"
                class="category-tag"
                @click="filterByCategory(category.id)"
              >
                {{ category.name }}
              </el-tag>
            </el-card>

            <!-- 热门标签 -->
            <el-card class="tags-card">
              <template #header>
                <span>热门标签</span>
              </template>
              <el-tag v-for="tag in tags" :key="tag.id" class="tag" @click="filterByTag(tag.id)">
                {{ tag.name }}
              </el-tag>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ArticleCard from './components/ArticleCard.vue'
import { fetchArticles, getHotTags_get, getCategories_get } from '@/api/recommend'

const loading = ref(true)
const articles = ref([])
const tags = ref([])
const categories = ref([])

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
      tags.value = await getHotTags_get()
      console.log('标签数据:', tags.value)
    } catch (error) {
      console.error('加载标签失败:', error)
      tags.value = []
    }

    try {
      categories.value = await getCategories_get()
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
  // 实现分类筛选逻辑
}

// 标签筛选
const filterByTag = (tagId) => {
  // 实现标签筛选逻辑
}

onMounted(() => {
  loadData()
})
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

.main-content {
  flex: 1;
  padding: 20px;
}

.sidebar {
  position: sticky;
  top: 20px;
}

.category-card,
.tags-card {
  margin-bottom: 20px;
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
</style>
