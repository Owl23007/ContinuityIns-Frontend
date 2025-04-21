<template>
  <div class="article-detail-horizontal">
    <ArticleLoading v-if="loading" />
    <ArticleError v-else-if="error" :error="error" @retry="fetchArticle" />
    <template v-else>
      <div class="article-horizontal-layout">
        <ArticleSidebar
          :article="article"
          :authorInfo="authorInfo"
          :isAuthor="isAuthor"
          @edit="editArticle"
        />
        <ArticleContent :article="article" :renderedContent="renderedContent" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getArticleById_get } from "@/api/article";
import { getUserById_get } from "@/api/user";
import { renderMarkdown } from "@/utils/markdown";
import { useAuthStore } from "@/stores/auth";
import ArticleSidebar from "./components/article-sidebar.vue";
import ArticleContent from "./components/article-content.vue";
import ArticleLoading from "./components/article-loading.vue";
import ArticleError from "./components/article-error.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const article = ref(null);
const loading = ref(true);
const error = ref("");
const authorInfo = ref(null);

// 获取文章详情
const fetchArticle = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await getArticleById_get(route.params.id);
    if (!response.data) {
      error.value = "文章不存在或已被删除";
      return;
    }
    article.value = response.data;
    // 加载作者信息
    if (article.value.createUser?.id) {
      await fetchAuthorInfo(article.value.createUser.id);
    }
  } catch (err) {
    error.value = err.message || "获取文章失败";
    console.error("获取文章失败:", err);
  } finally {
    loading.value = false;
  }
};

// 获取作者信息
const fetchAuthorInfo = async (userId) => {
  try {
    const response = await getUserById_get(userId);
    if (response.code === 0) {
      authorInfo.value = response.data;
    }
  } catch (err) {
    console.error("获取作者信息失败:", err);
  }
};

// 渲染Markdown内容
const renderedContent = computed(() => {
  if (!article.value?.content) return "";
  if (
    article.value.content.includes("<br>") &&
    !article.value.content.includes("```")
  ) {
    return article.value.content;
  }
  return renderMarkdown(article.value.content);
});

// 判断是否为作者
const isAuthor = computed(() => {
  return authStore.currentUser?.id === article.value?.createUser?.id;
});

// 编辑文章
const editArticle = () => {
  router.push({
    name: "articleEdit",
    params: { id: article.value.id },
  });
};

onMounted(() => {
  fetchArticle();
});
</script>

<style scoped>
.article-detail-horizontal {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2.5rem;
  animation: fadeIn 0.5s ease;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 18px;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.03),
    0 4px 6px -2px rgba(0, 0, 0, 0.02);
  min-height: calc(100vh - 4rem);
  transition: all 0.3s ease;
}

.article-horizontal-layout {
  display: flex;
  gap: 2.5rem;
  position: relative;
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

@media (max-width: 900px) {
  .article-horizontal-layout {
    flex-direction: column;
    gap: 1.5rem;
  }
}

@media (max-width: 600px) {
  .article-detail-horizontal {
    padding: 1rem;
    margin: 0;
    border-radius: 0;
  }
}
</style>
