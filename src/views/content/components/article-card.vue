<template>
  <div class="article-card" :class="[`status-${(article.status || '').toLowerCase()}`]">
    <!-- 封面图片 -->
    <div class="cover-container">
      <img :src="article.coverImg || null" alt="文章封面" class="cover-image" @error="handleImageError" />
      <span class="article-status" v-if="statusText">{{ statusText }}</span>
    </div>

    <div class="card-content">
      <!-- 作者信息 + 发布时间 -->
      <div class="meta-row">
        <router-link :to="{ name: 'userProfile', params: { id: article.createUser?.id } }" class="author-info"
          v-if="article.createUser">
          <img :src="article.createUser.avatar || defaultAvatar" :alt="article.createUser.username"
            class="author-avatar" @error="handleAvatarError">
          <span class="author-name">{{ article.createUser.nickname || article.createUser.username }}</span>
        </router-link>
        <div class="publish-info">
          <span class="publish-time">{{ formatDate(article.createTime) }}</span>
          <span class="dot" v-if="article.duration">·</span>
          <span class="reading-time" v-if="article.duration">
            {{ article.duration }} 字
          </span>
        </div>
      </div>

      <!-- 标题 -->
      <h2 class="article-title">{{ article.title }}</h2>

      <!-- 摘要 -->
      <div class="article-excerpt" v-if="article.content">
        {{ getExcerpt(article.content) }}
      </div>

      <!-- 底部操作区 -->
      <div class="card-footer">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArticleStatus } from '@/pojo/article'
import defaultAvatar from '@/assets/image/default_avatar.png'
import default_cover from '@/assets/image/default_cover.png'

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
  e.target.src = default_cover;
}

// 处理头像加载错误
const handleAvatarError = (e) => {
  e.target.src = defaultAvatar;
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
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface-color);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  border: 1px solid var(--border-color);
  height: 100%;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--primary-color);
}

.cover-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.article-card:hover .cover-image {
  transform: scale(1.05);
}

.article-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.status-draft .article-status {
  background: rgba(3, 105, 161, 0.85);
  color: white;
}

.status-private .article-status {
  background: rgba(162, 28, 175, 0.85);
  color: white;
}

.status-banned .article-status {
  background: rgba(220, 38, 38, 0.85);
  color: white;
}

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.25rem;
  position: relative;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  border-radius: 20px;
  padding: 4px 8px;
  transition: background 0.2s ease;
}

.author-info:hover {
  background: var(--hover-bg);
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.author-info:hover .author-avatar {
  border-color: var(--primary-color);
}

.author-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.author-info:hover .author-name {
  color: var(--primary-color);
}

.publish-info {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.article-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.875rem 0;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.article-excerpt {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.25rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}

.card-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}

.dot {
  margin: 0 0.2rem;
}

/* 无封面图片时的样式 */
.article-card:not(:has(.cover-container)) .article-title {
  font-size: 1.5rem;
}

.article-card:not(:has(.cover-container)) .card-content {
  padding: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-card {
    border-radius: 12px;
  }

  .cover-container {
    height: 160px;
  }

  .article-status {
    top: 8px;
    right: 8px;
    padding: 4px 10px;
    font-size: 0.7rem;
  }

  .card-content {
    padding: 1rem;
  }

  .meta-row {
    margin-bottom: 0.75rem;
  }

  .author-avatar {
    width: 24px;
    height: 24px;
  }

  .author-name {
    font-size: 0.85rem;
  }

  .publish-info {
    font-size: 0.8rem;
  }

  .article-title {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }

  .article-excerpt {
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .card-footer {
    padding-top: 0.75rem;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .article-card {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .article-card:hover {
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

  .card-footer {
    border-color: rgba(255, 255, 255, 0.08);
  }

  .author-info:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

/* 打印模式优化 */
@media print {
  .article-card {
    box-shadow: none;
    border: 1px solid #ddd;
    break-inside: avoid;
  }

  .cover-container {
    height: 150px;
  }

  .article-status,
  .card-footer {
    display: none;
  }
}
</style>