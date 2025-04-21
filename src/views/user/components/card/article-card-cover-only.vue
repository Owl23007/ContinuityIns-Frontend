<template>
  <article
    class="article-card"
    :class="`status-${article.status.toLowerCase()}`"
    @click="handleCardClick"
  >
    <!-- 封面图片 -->
    <div class="cover-container">
      <img
        :src="article.coverImg || default_cover"
        alt="文章封面"
        class="cover-image"
        @error="handleImageError"
      />
      <span class="article-status" v-if="statusText">{{ statusText }}</span>
      <span class="video-duration" v-if="article.videoDuration">{{ article.videoDuration }}</span>
    </div>

    <!-- 文章内容 -->
    <div class="card-content">
      <!-- 文章标题 -->
      <h3 class="article-title">{{ article.title }}</h3>

      <!-- 元信息 -->
      <div class="meta-info">
        <span class="publish-time">{{ formatDate(article.createTime) }}</span>
        <span class="divider">·</span>
        <span class="word-count">{{ article.duration || '1' }}字</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArticleStatus } from '@/pojo/article'
import imageFail from '@/assets/image/image_fail_load.png'
import default_cover from '@/assets/image/default_cover.png'

const props = defineProps({
  article: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      title: '',
      coverImg: '',
      status: '',
      createTime: null,
      duration: null,
      views: 0,
      videoDuration: '',
    }),
  },
})

const emit = defineEmits(['click'])

const router = useRouter()

const statusText = computed(() => {
  switch (props.article.status) {
    case ArticleStatus.DRAFT:
      return '草稿'
    case ArticleStatus.PRIVATE:
      return '私密'
    case ArticleStatus.BANNED:
      return '已禁用'
    default:
      return ''
  }
})

// 处理图片加载失败
const handleImageError = (e) => {
  e.target.src = imageFail
}

// 处理卡片点击
const handleCardClick = () => {
  if (props.article?.id) {
    router.push({
      name: 'articleDetail',
      params: { id: props.article.id },
    })
  }
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 如果是今天发布的
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes}分钟前`
    }
    return `${hours}小时前`
  }

  // 如果是最近7天发布的
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }
  // 如果是今年内发布的
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    })
  }

  // 否则显示完整日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.article-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  border: 1px solid #f0f0f0;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.cover-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.article-card:hover .cover-image {
  transform: scale(1.03);
}

.article-status {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.7);
  color: white;
}

.status-draft .article-status {
  background: rgba(3, 105, 161, 0.9);
  color: white;
}

.status-private .article-status {
  background: rgba(162, 28, 175, 0.9);
  color: white;
}

.status-banned .article-status {
  background: rgba(220, 38, 38, 0.9);
  color: white;
}

.card-content {
  padding: 12px;
}

.article-title {
  font-size: 1rem;
  /* 增大字体尺寸 */
  font-weight: 450;
  /* 加粗字重 */
  color: #1a1a1a;
  /* 更深的文字颜色 */
  margin: 0 0 8px 0;
  line-height: 1.5;
  /* 调整行高 */
  min-height: 3em;
  /* 添加最小高度，确保两行高度 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.02em;
  /* 稍微紧凑的字间距 */
}

.meta-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 0.75rem;
  color: #999;
  line-height: 1.2;
}

.divider {
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-card {
    border-radius: 10px;
  }

  .card-content {
    padding: 10px;
  }

  .article-title {
    font-size: 0.95rem;
    margin-bottom: 6px;
  }

  .meta-info {
    font-size: 0.7rem;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .article-card {
    background: #222;
    border-color: #333;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .article-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .article-title {
    color: #eee;
  }

  .meta-info {
    color: #aaa;
  }
}
</style>
