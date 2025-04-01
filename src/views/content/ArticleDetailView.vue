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
              · {{ article.duration }} 分钟阅读
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #eee;
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.article-header {
  margin-bottom: 2rem;
  text-align: center;
}

.article-title {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.3;
  color: var(--text-primary);
}

.article-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  color: var(--text-secondary);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.author-info:hover {
  background-color: var(--hover-bg);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.author-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
}

.author-signature {
  color: var(--text-secondary);
  font-size: 0.875rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cover-image {
  margin: 2rem 0;
  border-radius: 12px;
  overflow: hidden;
}

.cover-image img {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
}

.article-content {
  margin: 2rem 0;
  line-height: 1.8;
  font-size: 1.1rem;
}

.article-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.article-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.edit-btn {
  padding: 0.75rem 2rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.article-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reading-time {
  color: var(--text-secondary);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .article-detail {
    padding: 1rem;
  }

  .article-title {
    font-size: 1.8rem;
  }

  .article-meta {
    flex-direction: column;
    gap: 1rem;
  }

  .article-content {
    font-size: 1rem;
  }
}
</style>