<template>
  <div class="article-detail-horizontal">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchArticle">重试</button>
    </div>
    <template v-else>
      <div class="article-horizontal-layout">
        <!-- 左侧栏：作者信息和文章元数据 -->
        <aside class="article-sidebar">
          <router-link :to="{ name: 'userProfile', params: { id: article.createUser?.id } }" class="author-info"
            v-if="article.createUser?.id">
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
          <div class="article-actions">
            <button v-if="isAuthor" class="edit-btn" @click="editArticle">
              编辑文章
            </button>
          </div>
        </aside>
        <!-- 右侧主内容区 -->
        <main class="article-main">
          <header class="article-header">
            <h1 class="article-title">{{ article.title }}</h1>
          </header>
          <div v-if="article.coverImg" class="cover-image">
            <img :src="article.coverImg" :alt="article.title" @error="handleImageError">
          </div>
          <article class="article-content markdown-body" v-html="renderedContent"></article>
        </main>
      </div>
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
    const response = await getUserById_get(userId);
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
    const response = await getArticleById_get(route.params.id);
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
.article-detail-horizontal {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 2.5rem 1.5rem;
  animation: fadeIn 0.5s ease;
  background: #f8fafc;
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.06);
  min-height: 100vh;
}

.article-horizontal-layout {
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
}

.article-sidebar {
  flex: 0 0 290px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(24, 144, 255, 0.07), 0 1.5px 8px rgba(0, 0, 0, 0.04);
  padding: 2.2rem 1.5rem 2.2rem 1.5rem;
  min-width: 220px;
  max-width: 340px;
  margin-top: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
  gap: 2.5rem;
}

.article-main {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(24, 144, 255, 0.07), 0 1.5px 8px rgba(0, 0, 0, 0.04);
  padding: 2.2rem 2.5rem 2.5rem 2.5rem;
}

.article-header {
  margin-bottom: 2rem;
  text-align: left;
}

.article-title {
  font-size: 2.4rem;
  margin-bottom: 1.5rem;
  color: #222;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  text-decoration: none;
  padding: 1rem 1.2rem;
  border-radius: 14px;
  transition: all 0.3s;
  background: #f5f7fa;
  width: 100%;
  justify-content: flex-start;
  box-shadow: 0 1.5px 8px rgba(24, 144, 255, 0.04);
}

.author-info:hover {
  background: #e6f7ff;
  transform: translateY(-2px) scale(1.01);
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2.5px solid #e6f7ff;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.author-name {
  font-weight: 700;
  color: #1890ff;
  font-size: 1.18rem;
}

.author-signature {
  color: #888;
  font-size: 1rem;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  background: #f5f7fa;
  padding: 0.7rem 1.2rem;
  border-radius: 10px;
  font-size: 1.05rem;
  color: #666;
  width: 100%;
  box-shadow: 0 1.5px 8px rgba(24, 144, 255, 0.04);
}

.publish-time {
  font-weight: 600;
}

.reading-time {
  color: #888;
  font-weight: 500;
}

.article-actions {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  width: 100%;
}

.edit-btn {
  padding: 0.8rem 2.2rem;
  background: linear-gradient(90deg, #1890ff 60%, #40a9ff 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.08rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.10);
}

.edit-btn:hover {
  opacity: 0.93;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.cover-image {
  margin: 2rem 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(24, 144, 255, 0.10);
  max-width: 100%;
  transition: transform 0.3s;
}

.cover-image:hover {
  transform: scale(1.02);
}

.cover-image img {
  width: 100%;
  max-height: 480px;
  object-fit: cover;
  border-radius: 16px;
}

.article-content {
  margin: 2rem 0;
  line-height: 1.85;
  font-size: 1.18rem;
  color: #222;
  word-break: break-word;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3) {
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  color: #1890ff;
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
  border-radius: 10px;
  margin: 2rem auto;
  display: block;
  box-shadow: 0 2px 12px rgba(24, 144, 255, 0.10);
}

.article-content :deep(pre) {
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 8px;
  background: #f6f8fa;
  overflow-x: auto;
}

.article-content :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 0.98em;
}

.article-content :deep(blockquote) {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid #1890ff;
  background: #f0f7ff;
  border-radius: 4px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #f3f3f3;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 18px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

/* 响应式布局 */
@media (max-width: 900px) {
  .article-horizontal-layout {
    flex-direction: column;
    gap: 1.5rem;
  }

  .article-sidebar {
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 1.5rem;
    min-width: 0;
    max-width: 100%;
    width: 100%;
    position: static;
    margin-top: 0;
    padding: 1rem 0.5rem;
    border-radius: 10px;
  }

  .article-main {
    margin-top: 0;
    padding: 1.2rem 1rem 1.5rem 1rem;
    border-radius: 10px;
  }
}

@media (max-width: 600px) {
  .article-detail-horizontal {
    padding: 0.5rem;
    border-radius: 0;
    box-shadow: none;
  }

  .article-title {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }

  .cover-image img {
    max-height: 220px;
    border-radius: 8px;
  }

  .article-content {
    font-size: 1rem;
    padding: 0;
  }
}
</style>