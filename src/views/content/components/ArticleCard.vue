<template>
  <!-- 调试用 - 确保组件渲染 -->
  <div v-if="!article" style="color: red; padding: 20px">警告：article数据为空！</div>

  <el-card v-else class="article-card" :body-style="{ padding: '0px' }">
    <div class="cover-container" @click="goToArticleDetail">
      <div v-if="isLoading" class="loading-container">
        <el-skeleton-item variant="image" style="width: 100%; height: 100%" />
      </div>
      <img
        v-else-if="!showDefaultCover"
        :src="article.coverImage || article.cover"
        class="article-cover"
        @error="handleImageError"
        @load="handleImageLoad"
      />
      <img v-else :src="defaultCover" class="article-cover" />
    </div>
    <div class="article-content">
      <h3 class="article-title" @click="goToArticleDetail">
        {{ article.title || '无标题' }}
      </h3>
      <p class="article-summary">{{ article.summary || '暂无摘要' }}</p>
      <div class="article-meta">
        <span class="author clickable" @click="goToUserPage">{{
          article.author || '未知作者'
        }}</span>
        <span class="date">{{ formatDate(article.date) }}</span>
      </div>
      <div class="article-actions">
        <el-button type="text">
          <el-icon>
            <View />
          </el-icon>
          <span>{{ article.views || 0 }}</span>
        </el-button>
        <el-button type="text" class="like-btn">
          <svg
            class="icon like-icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1989"
          >
            <path
              d="M797.184 518.496l-284.384 294.016-284.16-292A162.752 162.752 0 0 1 192 417.6C192 328.512 263.808 256 352 256a159.36 159.36 0 0 1 133.28 72.16L512 368.64l26.72-40.48A159.488 159.488 0 0 1 672 256c88.224 0 160 72.512 160 161.6 0 37.536-12.992 74.08-34.816 100.896M672 192a222.72 222.72 0 0 0-160 67.712A222.624 222.624 0 0 0 352 192c-123.52 0-224 101.216-224 225.6 0 52.288 18.176 103.232 52.96 145.536l285.952 293.984a62.4 62.4 0 0 0 45.088 19.168c17.12 0 33.12-6.816 45.12-19.136l287.744-296.064A226.816 226.816 0 0 0 896 417.6C896 293.216 795.52 192 672 192"
              fill="#409eff"
              p-id="1990"
            ></path>
          </svg>
          <span>{{ article.likes || 0 }}</span>
        </el-button>
        <el-button type="text">
          <el-icon>
            <Star />
          </el-icon>
          <span>{{ article.collects || 0 }}</span>
        </el-button>
      </div>
    </div>

    <!-- 调试信息 -->
    <div style="display: none">
      {{ JSON.stringify(article, null, 2) }}
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import defaultCover from '@/assets/image/default_cover.png'
import { useRouter } from 'vue-router'
import { View, Star } from '@element-plus/icons-vue'

const router = useRouter()

const props = defineProps({
  article: {
    type: Object,
    required: true,
    validator: (value) => {
      console.log('ArticleCard props验证:', value)
      return value !== null
    },
  },
})

// 图片加载相关状态
const isLoading = ref(true)
const imageLoadFailed = ref(false)
const isValidCoverUrl = computed(() => {
  if (!props.article.cover) return false
  // 检查是否为空字符串或不是有效的URL格式
  return (
    props.article.cover.trim() !== '' &&
    (props.article.cover.startsWith('http') || props.article.cover.startsWith('/'))
  )
})
const showDefaultCover = computed(() => !isValidCoverUrl.value || imageLoadFailed.value)

// 图片加载错误处理
const handleImageError = () => {
  console.log('封面图片加载失败:', props.article.cover)
  imageLoadFailed.value = true
  isLoading.value = false
}

// 图片加载成功处理
const handleImageLoad = () => {
  console.log('封面图片加载成功:', props.article.cover)
  isLoading.value = false
}

const formatDate = (dateString) => {
  if (!dateString) return '未知日期'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  } catch (e) {
    console.error('日期格式化错误:', e)
    return dateString // 返回原始字符串
  }
}

// 跳转到文章详情页
const goToArticleDetail = () => {
  if (props.article && props.article.id) {
    router.push(`/article/${props.article.id}`)
  } else {
    console.error('文章ID不存在，无法跳转到详情页')
  }
}

// 跳转到用户主页
const goToUserPage = () => {
  if (props.article && props.article.authorId) {
    router.push(`/user/${props.article.authorId}`)
  } else {
    console.error('作者ID不存在，无法跳转到用户主页')
  }
}

onMounted(() => {
  console.log('ArticleCard已挂载，数据:', props.article)
  // 如果URL无效，立即停止加载状态
  if (!isValidCoverUrl.value) {
    isLoading.value = false
  } else {
    // 设置超时，防止图片长时间加载
    setTimeout(() => {
      if (isLoading.value) {
        console.warn('图片加载超时:', props.article.cover)
        isLoading.value = false
        imageLoadFailed.value = true
      }
    }, 5000)
  }
})
</script>

<style scoped>
.article-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.cover-container {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  /* 16:9 aspect ratio */
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.article-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #606266;
}

.cover-icon {
  margin-bottom: 8px;
  opacity: 0.7;
}

.cover-text {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  background-color: rgba(255, 255, 255, 0.7);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.article-content {
  padding: 15px;
}

.article-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: bold;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
}

.article-title:hover {
  color: #409eff;
}

.article-summary {
  color: #666;
  font-size: 14px;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  color: #999;
  font-size: 12px;
  margin-bottom: 10px;
}

.article-actions {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}

.clickable {
  cursor: pointer;
  color: #606266;
}

.clickable:hover {
  color: #409eff;
  text-decoration: underline;
}

.icon {
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;
}

.like-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 4px;
}

.like-icon {
  color: #606266;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon.like-icon:hover {
  color: #409eff;
}

.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}
</style>
