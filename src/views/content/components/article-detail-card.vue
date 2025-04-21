<template>
  <div class="article-card-horizontal" :class="[`status-${(article.status || '').toLowerCase()}`]">
    <!-- 封面图片 -->
    <div class="cover-container-horizontal">
      <img
        :src="article.coverImg || default_cover"
        alt="文章封面"
        class="cover-image-horizontal"
        @error="handleImageError"
      />
      <span class="article-status" v-if="statusText">{{ statusText }}</span>
    </div>

    <div class="card-content-horizontal">
      <!-- 发布时间 -->
      <div class="meta-row-horizontal">
        <div class="publish-info">
          <span class="publish-time">{{ formatDate(article.createTime) }}</span>
          <span class="dot" v-if="article.duration">·</span>
          <span class="reading-time" v-if="article.duration"> {{ article.duration }} 字 </span>
        </div>
      </div>

      <!-- 标题和摘要的容器 -->
      <div class="content-wrapper">
        <h2 class="article-title-horizontal">{{ article.title }}</h2>
        <div class="article-excerpt-horizontal" v-if="article.content">
          {{ getExcerpt(article.content) }}
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="card-footer-horizontal">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArticleStatus } from '@/pojo/article'
import default_cover from '@/assets/image/default_cover.png'
import image_fail from '@/assets/image/image_fail_load.png'

const props = defineProps({
  article: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      title: '',
      content: '',
      coverImg: '',
      status: '',
      createTime: null,
      createUser: null,
      duration: null,
      coverImgFail: '',
    }),
  },
})

// 动态状态文本
const statusText = computed(() => {
  if (!ArticleStatus) return '' // Fallback if ArticleStatus is undefined
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
  if (!e.target.dataset.errorHandled) {
    e.target.src = image_fail // 使用默认图片
    e.target.dataset.errorHandled = true // Prevent re-triggering
  }
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp || isNaN(new Date(timestamp).getTime())) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes} 分钟前`
    }
    return `${hours} 小时前`
  }

  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} 天前`
  }

  // 如果超过30天，显示月份和日期
  if (diff < 365 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
    })
  }

  // 超过一年，显示完整日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 获取文章摘要
const getExcerpt = (content) => {
  if (!content) return ''
  // 移除HTML标签，包括<br>
  const plainText = content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
  // 移除Markdown语法
  const noMarkdown = plainText.replace(/[#*`_~\[\]]/g, '')
  // 移除多余空行
  const cleanText = noMarkdown.replace(/\n\s*\n/g, '\n').trim()
  // 截取前100个字符
  return cleanText.slice(0, 100) + (cleanText.length > 100 ? '...' : '')
}
</script>

<style scoped>
/* 横条型卡片样式 */
.article-card-horizontal {
  padding: 0;
  display: flex;
  flex-direction: row;
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  box-shadow:
    0 6px 32px rgba(24, 144, 255, 0.07),
    0 1.5px 8px rgba(0, 0, 0, 0.04);
  transition:
    transform 0.25s,
    box-shadow 0.25s;
  border: 1.5px solid #e6f7ff;
  height: 260px;
  /* 增加卡片高度以适应更多内容 */
  width: 100%;
  min-width: 0;
}

.article-card-horizontal:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow:
    0 12px 36px rgba(24, 144, 255, 0.13),
    0 2px 12px rgba(0, 0, 0, 0.07);
  border-color: #91d5ff;
}

.cover-container-horizontal {
  flex: 0 0 280px;
  /* 固定宽度 */
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f6f6;
}

.cover-image-horizontal {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 16/9;
  border-radius: 0;
  transition: transform 0.5s;
  background: #f0f0f0;
}

.article-card-horizontal:hover .cover-image-horizontal {
  transform: scale(1.06);
}

.article-status {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.13);
  z-index: 2;
  border: none;
}

.status-draft .article-status {
  background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%);
}

.status-private .article-status {
  background: linear-gradient(90deg, #a21caf 60%, #f472b6 100%);
}

.status-banned .article-status {
  background: linear-gradient(90deg, #dc2626 60%, #f87171 100%);
}

.card-content-horizontal {
  flex: 1;
  min-width: 0;
  /* 防止内容溢出 */
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.5rem;
}

.meta-row-horizontal {
  display: flex;
  justify-content: flex-end;
  /* 改为右对齐 */
  align-items: center;
  margin-bottom: 0.7rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.publish-info {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.95rem;
  color: #888;
  white-space: nowrap;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.article-title-horizontal {
  font-size: 1.25rem;
  font-weight: 700;
  color: #222;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  letter-spacing: -0.01em;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.article-excerpt-horizontal {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  flex-grow: 1;
}

.card-footer-horizontal {
  margin-top: auto;
  padding-top: 0.7rem;
  border-top: 1px solid #f0f0f0;
}

.dot {
  margin: 0 0.2rem;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .article-card-horizontal {
    flex-direction: column;
    height: auto;
  }

  .cover-container-horizontal {
    width: 100%;
    height: 160px;
    flex: none;
  }

  .card-content-horizontal {
    padding: 1rem 1rem 1.2rem 1rem;
  }

  .content-wrapper {
    min-height: unset;
  }

  .article-title-horizontal {
    font-size: 1.1rem;
  }

  .article-excerpt-horizontal {
    font-size: 0.89rem;
    margin-bottom: 0.7rem;
    -webkit-line-clamp: 3;
  }
}

@media (max-width: 600px) {
  .article-card-horizontal {
    border-radius: 8px;
    padding: 0;
  }

  .cover-container-horizontal {
    height: 110px;
  }

  .card-content-horizontal {
    padding: 0.7rem 0.7rem 1rem 0.7rem;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .article-card-horizontal {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .article-card-horizontal:hover {
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25);
    border-color: var(--primary-color);
  }

  .status-draft .article-status {
    background: rgba(14, 165, 233, 0.75);
  }

  .status-private .article-status {
    background: rgba(217, 70, 239, 0.75);
  }

  .status-banned .article-status {
    background: rgba(248, 113, 113, 0.75);
  }

  .card-footer-horizontal {
    border-color: rgba(255, 255, 255, 0.08);
  }
}

/* 打印模式优化 */
@media print {
  .article-card-horizontal {
    box-shadow: none;
    border: 1px solid #ddd;
    break-inside: avoid;
  }

  .cover-container-horizontal {
    height: 90px;
  }

  .article-status,
  .card-footer-horizontal {
    display: none;
  }
}
</style>
