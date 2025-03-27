<template>
  <router-link :to="{ name: 'articleDetail', params: { id: article.id }}" class="article-card">
    <div class="image-container">
      <img 
        :src="article.coverImg || defaultCover" 
        :alt="article.title"
        @error="handleImageError"
        class="cover-image"
      >
    </div>
    <div class="content">
      <h3 class="title">{{ article.title }}</h3>
      <div class="meta">
        <div class="author">
          <img :src="article.createUser?.avatar || defaultAvatar" class="author-avatar" />
          <span>{{ article.createUser?.username || '匿名用户' }}</span>
        </div>
        <span class="date">{{ formatDate(article.createTime) }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { ref } from 'vue'
import defaultCover from '@/assets/image/default_cover.jpg'
import defaultAvatar from '@/assets/image/default_avatar.png'
import imageFail from '@/assets/image/image_fail_load.png'

const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const handleImageError = (e) => {
  e.target.src = imageFail
}

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
      return `${minutes} 分钟前`
    }
    return `${hours} 小时前`
  }

  // 如果是最近7天发布的
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} 天前`
  }

  // 否则显示完整日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.article-card {
  display: block;
  border-radius: 12px;
  overflow: hidden;
  background: var(--background-color);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.image-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
}

.cover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .cover-image {
  transform: scale(1.05);
}

.content {
  padding: 1rem;
}

.title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.date {
  color: var(--text-secondary, #666);
}

@media (max-width: 768px) {
  .content {
    padding: 0.75rem;
  }

  .title {
    font-size: 1rem;
  }

  .meta {
    font-size: 0.75rem;
  }

  .author-avatar {
    width: 20px;
    height: 20px;
  }
}
</style>