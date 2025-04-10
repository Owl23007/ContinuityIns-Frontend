<template>
  <div class="article-card" :class="[`status-${(article.status || '').toLowerCase()}`]">
    <div class="card-header">
      <div class="article-status" v-if="article.status && article.status !== ArticleStatus.PUBLISHED">
        {{ statusText }}
      </div>
      <div class="article-meta">
        <span class="publish-time">{{ formatDate(article.createTime) }}</span>
        <span class="reading-time" v-if="article.duration">
          · {{ article.duration }} 字
        </span>
      </div>
    </div>

    <div class="card-content">
      <div class="cover-image" v-if="article.coverImg">
        <img :src="article.coverImg" :alt="article.title" @error="handleImageError">
      </div>

      <!-- 添加作者信息 -->
      <router-link :to="{ name: 'userProfile', params: { id: article.createUser?.id } }" class="author-info"
        v-if="article.createUser">
        <img :src="article.createUser.avatar || defaultAvatar" :alt="article.createUser.username" class="author-avatar"
          @error="handleAvatarError">
        <span class="author-name">{{ article.createUser.nickname || article.createUser.username }}</span>
      </router-link>

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
import defaultAvatar from '@/assets/image/default_avatar.png'

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
  display: block;
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-color);
  position: relative;
  backdrop-filter: blur(10px);
}

.article-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--primary-color);
}

.card-header {
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background: var(--surface-color);
}

.article-status {
  padding: 0.35rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.status-draft .article-status {
  background: linear-gradient(135deg, #e0f2fe, #f0f9ff);
  color: #0369a1;
}

.status-private .article-status {
  background: linear-gradient(135deg, #fae8ff, #fdf4ff);
  color: #a21caf;
}

.status-banned .article-status {
  background: linear-gradient(135deg, #fee2e2, #fef2f2);
  color: #dc2626;
}

.card-content {
  padding: 1.5rem;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 220px;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.cover-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.1));
  transition: opacity 0.3s ease;
  opacity: 0;
}

.article-card:hover .cover-image::after {
  opacity: 1;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.article-card:hover .cover-image img {
  transform: scale(1.05);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.author-info:hover {
  background: var(--hover-bg);
  transform: translateY(-2px);
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
  transition: border-color 0.3s ease;
}

.author-info:hover .author-avatar {
  border-color: var(--primary-color);
}

.author-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.author-info:hover .author-name {
  color: var(--primary-color);
}

.article-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  margin-bottom: 1rem;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.article-card:hover .article-title {
  color: var(--primary-color);
}

.article-excerpt {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-meta {
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: var(--background-color);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  width: fit-content;
}

.reading-time {
  color: var(--text-secondary);
  font-weight: 500;
}

.card-footer {
  padding: 1.25rem;
  border-top: 1px solid var(--border-color);
  background: var(--background-color);
  transition: background-color 0.3s ease;
}

.article-card:hover .card-footer {
  background: var(--surface-color);
}

/* 响应式布局优化 */
@media (max-width: 768px) {
  .article-card {
    margin-bottom: 1.5rem;
    border-radius: 12px;
  }

  .card-header {
    padding: 1rem;
  }

  .cover-image {
    height: 180px;
    margin: -1.5rem -1.5rem 1rem;
    border-radius: 12px 12px 0 0;
  }

  .article-title {
    font-size: 1.2rem;
  }

  .article-excerpt {
    font-size: 0.95rem;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    margin-bottom: 1rem;
  }

  .article-meta {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }

  .card-footer {
    padding: 1rem;
  }
}

/* 深色模式优化 */
@media (prefers-color-scheme: dark) {
  .article-card {
    background: var(--surface-color);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .article-card:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
  }
}
</style>