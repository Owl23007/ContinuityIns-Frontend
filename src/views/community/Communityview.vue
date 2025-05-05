<template>
  <div class="community-container">
    <div class="community-header">
      <h1>社区</h1>
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索社区内容"
          prefix-icon="el-icon-search"
          @input="handleSearch"
        ></el-input>
      </div>
    </div>

    <div class="community-content">
      <div class="filters">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="热门" name="hot"></el-tab-pane>
          <el-tab-pane label="最新" name="latest"></el-tab-pane>
        </el-tabs>

        <el-button type="primary" @click="createPost">发布帖子</el-button>
      </div>

      <!-- 添加分类和标签筛选 -->
      <div class="filter-options">
        <div class="category-filter">
          <span class="filter-label">分类：</span>
          <el-radio-group v-model="selectedCategory" @change="handleFilterChange">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button
              v-for="category in categories"
              :key="category.value"
              :label="category.value"
            >
              {{ category.label }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="tag-filter">
          <span class="filter-label">标签：</span>
          <el-tag
            v-for="tag in popularTags"
            :key="tag.value"
            :effect="selectedTags.includes(tag.value) ? 'dark' : 'plain'"
            @click="toggleTag(tag.value)"
            class="filter-tag"
          >
            {{ tag.label }}
          </el-tag>
          <el-popover placement="bottom" trigger="click" width="300">
            <template #reference>
              <el-button size="small" text>更多标签</el-button>
            </template>
            <div class="all-tags">
              <el-tag
                v-for="tag in allTags"
                :key="tag.value"
                :effect="selectedTags.includes(tag.value) ? 'dark' : 'plain'"
                @click="toggleTag(tag.value)"
                class="filter-tag"
              >
                {{ tag.label }}
              </el-tag>
            </div>
          </el-popover>
          <el-button size="small" text v-if="selectedTags.length > 0" @click="clearTags">
            清除标签
          </el-button>
        </div>
      </div>

      <div class="posts-list">
        <el-skeleton :rows="6" animated v-if="loading" />
        <div v-else-if="posts.length === 0" class="no-posts">
          暂无内容，成为第一个发帖的用户吧！
        </div>
        <div v-else>
          <div v-for="post in posts" :key="post.id" class="post-card" @click="viewPost(post.id)">
            <div class="post-header">
              <div class="user-info">
                <el-avatar :size="40" :src="post.author.avatar"></el-avatar>
                <span class="author-name">{{ post.author.name }}</span>
              </div>
              <span class="post-time">{{ formatDate(post.createTime) }}</span>
            </div>
            <div class="post-title">{{ post.title }}</div>
            <div class="post-content-preview">{{ post.preview }}</div>
            <div class="post-stats">
              <span><i class="el-icon-view"></i> {{ post.views }}</span>
              <span><i class="el-icon-chat-dot-round"></i> {{ post.comments }}</span>
              <span><i class="el-icon-star-off"></i> {{ post.likes }}</span>
            </div>
          </div>

          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
          ></el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'CommunityView',
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const posts = ref([])
    const total = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const searchQuery = ref('')
    const activeTab = ref('all')

    // 添加分类和标签状态
    const selectedCategory = ref('')
    const selectedTags = ref([])

    // 分类选项 - 改为动态获取
    const categories = ref([
      { label: '全部', value: '' }, // 默认选项
    ])

    // 加载分类数据
    const loadCategories = async () => {
      try {
        // 从后端获取社区分类
        const response = await getCategoriesByModule('community')
        if (response && response.data) {
          // 将后端数据转换为前端所需格式
          const backendCategories = response.data.map((item) => ({
            label: item.name,
            value: item.id.toString(),
            description: item.description,
          }))

          // 合并默认的"全部"选项与后端数据
          categories.value = [{ label: '全部', value: '' }, ...backendCategories]
        }
      } catch (error) {
        console.error('获取分类列表失败:', error)
      }
    }

    // 标签选项
    const allTags = ref([
      { label: 'JavaScript', value: 'javascript' },
      { label: 'Vue', value: 'vue' },
      { label: 'React', value: 'react' },
      { label: 'Node.js', value: 'nodejs' },
      { label: '前端', value: 'frontend' },
      { label: '后端', value: 'backend' },
      { label: '数据库', value: 'database' },
      { label: '云计算', value: 'cloud' },
      { label: '人工智能', value: 'ai' },
      { label: '机器学习', value: 'ml' },
      { label: '开源', value: 'opensource' },
      { label: '求职', value: 'job' },
    ])

    // 热门标签（只展示一部分）
    const popularTags = computed(() => {
      return allTags.value.slice(0, 5)
    })

    // 获取社区帖子列表
    const fetchPosts = async () => {
      loading.value = true
      try {
        // 这里需要替换为实际的API调用
        // const response = await api.getPosts({
        //   page: currentPage.value,
        //   pageSize: pageSize.value,
        //   query: searchQuery.value,
        //   tab: activeTab.value,
        //   category: selectedCategory.value,
        //   tags: selectedTags.value
        // })
        // posts.value = response.data.items
        // total.value = response.data.total

        // 模拟数据
        setTimeout(() => {
          posts.value = Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            title: `社区帖子标题 ${i + 1}`,
            preview: '这是帖子内容的预览，点击查看完整内容...',
            createTime: new Date().getTime() - i * 86400000,
            author: {
              name: `用户${i + 1}`,
              avatar: '',
            },
            views: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 50),
            likes: Math.floor(Math.random() * 100),
            category: categories.value[Math.floor(Math.random() * categories.value.length)].value,
            tags: [allTags.value[Math.floor(Math.random() * allTags.value.length)].value],
          }))
          total.value = 100
          loading.value = false
        }, 1000)
      } catch (error) {
        console.error('获取帖子列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 处理分类和标签变化
    const handleFilterChange = () => {
      currentPage.value = 1
      fetchPosts()
    }

    // 切换标签选择
    const toggleTag = (tagValue) => {
      const index = selectedTags.value.indexOf(tagValue)
      if (index === -1) {
        selectedTags.value.push(tagValue)
      } else {
        selectedTags.value.splice(index, 1)
      }
      handleFilterChange()
    }

    // 清除所有选中标签
    const clearTags = () => {
      selectedTags.value = []
      handleFilterChange()
    }

    // 格式化日期
    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    // 处理页码变化
    const handlePageChange = (page) => {
      currentPage.value = page
      fetchPosts()
    }

    // 处理搜索
    const handleSearch = () => {
      currentPage.value = 1
      fetchPosts()
    }

    // 处理标签点击
    const handleTabClick = () => {
      currentPage.value = 1
      fetchPosts()
    }

    // 查看帖子详情
    const viewPost = (postId) => {
      router.push(`/community/post/${postId}`)
    }

    // 创建新帖子
    const createPost = () => {
      router.push('/community/new')
    }

    onMounted(() => {
      fetchPosts()
      loadCategories() // 加载分类数据
      // 这里可以添加获取标签列表的API调用
      // loadTags()
    })

    return {
      loading,
      posts,
      total,
      currentPage,
      pageSize,
      searchQuery,
      activeTab,
      categories,
      allTags,
      popularTags,
      selectedCategory,
      selectedTags,
      formatDate,
      handlePageChange,
      handleSearch,
      handleTabClick,
      handleFilterChange,
      toggleTag,
      clearTags,
      viewPost,
      createPost,
    }
  },
}
</script>

<style scoped>
.community-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.community-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  width: 300px;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.post-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.post-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
}

.author-name {
  margin-left: 10px;
  font-weight: bold;
}

.post-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.post-content-preview {
  color: #606266;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.post-stats {
  display: flex;
  gap: 15px;
  color: #909399;
}

.no-posts {
  text-align: center;
  padding: 50px 0;
  color: #909399;
}

/* 添加筛选样式 */
.filter-options {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.category-filter,
.tag-filter {
  margin-bottom: 10px;
}

.filter-label {
  display: inline-block;
  width: 50px;
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
}

.filter-tag {
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.all-tags {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
