<template>
  <div class="article-detail">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchArticle">重试</button>
    </div>
    <template v-else>
      <!-- 文章头部 -->
      <header class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <router-link 
            :to="{ name: 'userProfile', params: { id: article.createUser?.id }}" 
            class="author-info" 
            v-if="article.createUser?.id"
          >
            <img :src="authorAvatar" class="author-avatar" @error="handleAvatarError" />
            <div class="author-details">
              <span class="author-name">{{ authorName }}</span>
              <span class="author-signature" v-if="authorInfo?.signature">{{ authorInfo.signature }}</span>
            </div>
          </router-link>
          <div class="article-info">
            <span class="publish-time">{{ formatDate(article.createTime) }}</span>
            <span class="reading-time" v-if="article.duration">
              · {{ article.duration }} 字
            </span>
          </div>
        </div>
      </header>

      <!-- 文章封面 -->
      <div v-if="article.coverImg" class="cover-image">
        <img :src="article.coverImg" :alt="article.title" @error="handleImageError">
      </div>

      <!-- 文章内容 -->
      <article class="article-content markdown-body" v-html="renderedContent"></article>
      
      <!-- 文章底部 -->
      <footer class="article-footer">
        <div class="article-actions">
          <button v-if="isAuthor" class="edit-btn" @click="editArticle">
            编辑文章
          </button>
        </div>
      </footer>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getArticleById_get } from '@/api/article';
import { getUserById_get } from '@/api/user';
import { renderMarkdown } from '@/utils/markdown';
import { useAuthStore } from '@/stores/auth';
import defaultAvatar from '@/assets/image/default_avatar.png';
import defaultCover from '@/assets/image/default_cover.jpg';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const article = ref(null);
const loading = ref(true);
const error = ref('');
const authorInfo = ref(null);

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 渲染Markdown内容
const renderedContent = computed(() => {
  if (!article.value?.content) return '';
  // 如果内容包含HTML标签但不是Markdown，直接返回
  if (article.value.content.includes('<br>') && !article.value.content.includes('```')) {
    return article.value.content;
  }
  return renderMarkdown(article.value.content);
});

// 判断是否为作者
const isAuthor = computed(() => {
  return authStore.currentUser?.id === article.value?.createUser?.id;
});

// 获取作者信息
const fetchAuthorInfo = async (userId) => {
  try {
    const response = await getUserById_get(authStore.token, userId);
    if (response.code === 0) {
      authorInfo.value = response.data;
    }
  } catch (err) {
    console.error('获取作者信息失败:', err);
  }
};

// 获取文章详情
const fetchArticle = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await getArticleById_get(authStore.token, route.params.id);
    if (!response.data) {
      error.value = '文章不存在或已被删除';
      return;
    }
    article.value = response.data;
    // 加载作者信息
    if (article.value.createUser?.id) {
      await fetchAuthorInfo(article.value.createUser.id);
    }
  } catch (err) {
    error.value = err.message || '获取文章失败';
    console.error('获取文章失败:', err);
  } finally {
    loading.value = false;
  }
};

// 编辑文章
const editArticle = () => {
  router.push({
    name: 'articleEdit',
    params: { id: article.value.id }
  });
};

// 处理图片加载错误
const handleImageError = (e) => {
  e.target.src = defaultCover;
};

// 处理头像加载错误
const handleAvatarError = (e) => {
  e.target.src = defaultAvatar;
};

// 点击作者名跳转到用户主页
const goToUserProfile = (userId) => {
  if (!userId) return;
  router.push({
    name: 'userProfile',
    params: { id: userId }
  });
};

// 在模板中使用 authorInfo
const authorName = computed(() => {
  return authorInfo.value?.nickname || article.value?.createUser?.username || '匿名用户';
});

const authorAvatar = computed(() => {
  return authorInfo.value?.avatar || article.value?.createUser?.avatar || defaultAvatar;
});

onMounted(() => {
  fetchArticle();
});
</script>

<style scoped>
.article-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.article-header {
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
}

.article-title {
  font-size: 2.8rem;
  margin-bottom: 2rem;
  line-height: 1.3;
  color: var(--text-primary);
  font-weight: 700;
  letter-spacing: -0.5px;
}

.article-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2.5rem;
  color: var(--text-secondary);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: var(--surface-color);
}

.author-info:hover {
  background: var(--hover-bg);
  transform: translateY(-2px);
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.author-signature {
  color: var(--text-secondary);
  font-size: 0.9rem;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cover-image {
  margin: 3rem auto;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  max-width: 1000px;
  transition: transform 0.3s ease;
}

.cover-image:hover {
  transform: scale(1.02);
}

.cover-image img {
  width: 100%;
  max-height: 600px;
  object-fit: cover;
}

.article-content {
  margin: 3rem auto;
  line-height: 1.8;
  font-size: 1.15rem;
  color: var(--text-primary);
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3) {
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
}

.article-content :deep(h1) {
  font-size: 2.2rem;
}

.article-content :deep(h2) {
  font-size: 1.8rem;
}

.article-content :deep(h3) {
  font-size: 1.5rem;
}

.article-content :deep(p) {
  margin-bottom: 1.5rem;
}

.article-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 2rem auto;
  display: block;
}

.article-content :deep(pre) {
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 8px;
  background: var(--code-bg);
  overflow-x: auto;
}

.article-content :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

.article-content :deep(blockquote) {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--primary-color);
  background: var(--quote-bg);
  border-radius: 4px;
}

.article-footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.article-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.edit-btn {
  padding: 0.9rem 2.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.article-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--surface-color);
  padding: 0.5rem 1rem;
  border-radius: 999px;
}

.reading-time {
  color: var(--text-secondary);
  font-weight: 500;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .article-detail {
    padding: 1.5rem;
  }

  .article-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  .article-meta {
    flex-direction: column;
    gap: 1.5rem;
  }

  .author-info {
    width: 100%;
    justify-content: center;
  }

  .article-content {
    font-size: 1.05rem;
  }

  .article-content :deep(h1) {
    font-size: 1.8rem;
  }

  .article-content :deep(h2) {
    font-size: 1.5rem;
  }

  .article-content :deep(h3) {
    font-size: 1.3rem;
  }

  .cover-image {
    margin: 2rem -1.5rem;
    border-radius: 0;
  }

  .edit-btn {
    width: 100%;
  }
}
</style>