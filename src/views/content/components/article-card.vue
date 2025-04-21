<template>
  <el-card class="article-card" :body-style="{ padding: '0px' }" shadow="hover">
    <div class="card-content" :class="{ 'is-top': article.is_top }">
      <!-- 封面图片 -->
      <div class="cover-container" v-if="article.coverImg">
        <el-image
          :src="article.coverImg || default_cover"
          fit="cover"
          lazy
          class="cover-image"
          @error="handleImageError"
        >
          <template #error>
            <div class="image-error">
              <el-icon>
                <Picture />
              </el-icon>
            </div>
          </template>
        </el-image>
        <div class="top-mark" v-if="article.is_top">
          <el-tag type="danger" size="small" effect="dark">置顶</el-tag>
        </div>
      </div>

      <div class="card-body">
        <!-- 标题 -->
        <h3 class="article-title" :title="article.title">
          {{ article.title }}
        </h3>

        <!-- 摘要 -->
        <p class="article-excerpt">{{ getExcerpt(article.content) }}</p>

        <!-- 底部信息 -->
        <div class="card-footer">
          <div class="article-meta">
            <span class="time">{{ formatDate(article.create_time) }}</span>
            <el-divider direction="vertical" />
            <span class="views">
              <el-icon>
                <View />
              </el-icon>
              {{ article.view_count }}
            </span>
            <el-divider direction="vertical" />
            <span class="comments">
              <el-icon>
                <ChatDotRound />
              </el-icon>
              {{ article.comment_count }}
            </span>
            <el-divider direction="vertical" />
            <span class="likes">
              <el-icon>
                <ThumbUp />
              </el-icon>
              {{ article.like_count }}
            </span>
          </div>

          <div class="article-status">
            <el-tag :type="getStatusType(article.status)" size="small">
              {{ getStatusText(article.status) }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { View, Picture, ChatDotRound, ThumbUp } from '@element-plus/icons-vue'
import default_cover from '@/assets/image/default_cover.png'
import image_fail from '@/assets/image/image_fail_load.png'

const props = defineProps({
  article: {
    type: Object,
    required: true,
    default: () => ({
      article_id: '',
      title: '',
      content: '',
      coverImg: '',
      status: 'PUBLISHED',
      create_time: null,
      update_time: null,
      user_id: '',
      view_count: 0,
      comment_count: 0,
      like_count: 0,
      collection_count: 0,
      heat_score: 0,
      is_top: false,
      word_count: 0,
    }),
  },
})

// 处理图片加载失败
const handleImageError = (e) => {
  if (!e.target.dataset.errorHandled) {
    e.target.src = image_fail
    e.target.dataset.errorHandled = true
  }
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'DRAFT':
      return 'info'
    case 'PUBLISHED':
      return 'success'
    case 'PRIVATE':
      return 'warning'
    case 'BANNED':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'DRAFT':
      return '草稿'
    case 'PUBLISHED':
      return '已发布'
    case 'PRIVATE':
      return '私密'
    case 'BANNED':
      return '已禁用'
    default:
      return '未知'
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

  if (diff < 365 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
    })
  }

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
  // 截取前80个字符
  return cleanText.slice(0, 80) + (cleanText.length > 80 ? '...' : '')
}
</script>

<style scoped>
.article-card {
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-content {
  position: relative;
  display: flex;
  flex-direction: column;
}

.is-top {
  border-left: 4px solid #f56c6c;
}

.cover-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.article-card:hover .cover-image {
  transform: scale(1.05);
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.top-mark {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
}

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.article-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-excerpt {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.article-meta {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 13px;
}

.article-meta .el-divider {
  margin: 0 8px;
}

.article-meta .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

.article-status {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .card-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .article-status {
    margin-top: 8px;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .article-title {
    color: #e5eaf3;
  }

  .article-excerpt {
    color: #a3a6ad;
  }

  .card-footer {
    border-top-color: #4c4d4f;
  }
}
</style>
