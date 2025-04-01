<template>
  <div class="article-card" :class="[`status-${(article.status || '').toLowerCase()}`]">
    <div class="card-header">
      <div class="article-status" v-if="article.status && article.status !== ArticleStatus.PUBLISHED">
        {{ statusText }}
      </div>
      <div class="article-meta">
        <span class="publish-time">{{ formatDate(article.createTime) }}</span>
        <span class="reading-time" v-if="article.duration">
          · {{ article.duration }} 分钟阅读
        </span>
      </div>
    </div>
    
    <div class="card-content">
      <div class="cover-image" v-if="article.coverImg">
        <img :src="article.coverImg" :alt="article.title" @error="handleImageError">
      </div>
      <h2 class="article-title">{{ article.title }}</h2>
      <div class="article-excerpt" v-if="article.content">
        {{ getExcerpt(article.content) }}
      </div>
    </div>

    <div class="card-footer">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArticleStatus } from '@/pojo/article'
import imageFail from '@/assets/image/image_fail_load.png'

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
      duration: null
    })
  }
})

const statusText = computed(() => {
  switch (props.article.status) {
    case ArticleStatus.DRAFT:
      return '草稿';
    case ArticleStatus.PRIVATE:
      return '私密';
    case ArticleStatus.BANNED:
      return '已禁用';
    default:
      return '';
  }
})

// 处理图片加载失败
const handleImageError = (e) => {
  e.target.src = imageFail;
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // 如果是今天发布的
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} 分钟前`;
    }
    return `${hours} 小时前`;
  }

  // 如果是最近7天发布的
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} 天前`;
  }

  // 否则显示完整日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 获取文章摘要
const getExcerpt = (content) => {
  if (!content) return '';
  // 移除HTML标签，包括<br>
  const plainText = content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
  // 移除Markdown语法
  const noMarkdown = plainText.replace(/[#*`_~\[\]]/g, '');
  // 移除多余空行
  const cleanText = noMarkdown.replace(/\n\s*\n/g, '\n').trim();
  // 截取前100个字符
  return cleanText.slice(0, 100) + (cleanText.length > 100 ? '...' : '');
}
</script>

<style scoped>
.article-card {
  display: block;
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-color);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.article-status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-draft .article-status {
  background: #f0f9ff;
  color: #0369a1;
}

.status-private .article-status {
  background: #fdf4ff;
  color: #a21caf;
}

.status-banned .article-status {
  background: #fef2f2;
  color: #dc2626;
}

.card-content {
  padding: 1rem;
}

.cover-image {
  width: 100%;
  height: 200px;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.article-excerpt {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-meta {
  color: var(--text-secondary);
  font-size: 0.875rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.reading-time {
  color: var(--text-secondary);
}

.card-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background: var(--background-color);
}

@media (max-width: 768px) {
  .article-card {
    margin-bottom: 1rem;
  }

  .cover-image {
    height: 160px;
  }

  .article-title {
    font-size: 1.1rem;
  }

  .article-excerpt {
    font-size: 0.9rem;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
}
</style>