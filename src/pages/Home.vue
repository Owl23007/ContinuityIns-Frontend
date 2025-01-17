<template>
  <div class="main-container">
    <aside class="sidebar">
      <h2>公告</h2>
      <p>这是一个公告栏。</p>
    </aside>
    <main class="center-container">
      <h1>今日推荐</h1>
      <div class="cards-container">
        <ArticleCard v-for="(article, index) in articles" :key="index" class="large-card"
          :coverImage="article.coverImage || 'https://via.placeholder.com/300x169?text=No+Image'"
          :title="article.title || ''"
          :author="article.author || 'error'" 
          :userId="article.userId || 'error'"
          :time="article.duration || 'error'"
          :views="article.views || 0" 
          :favorites="article.favorites || 0" 
          :duration="article.duration || ''"
          :titleLink="`/article/${article.articleId}`" 
          :authorLink="`/author/${article.userId}`"  />
      </div>
    </main>
  </div>
</template>

<script>
import ArticleCard from '@/components/ArticleCard.vue';
import { ref, onMounted } from 'vue';
import { getDailyRecommendations_get } from '@/api/article';

export default {
  name: 'homePage',
  components: {
    ArticleCard
  },
  setup() {
    const articles = ref([]);

    onMounted(async () => {
      try {
        articles.value = await getDailyRecommendations_get();
      } catch (error) {
        console.error('获取每日推荐失败:', error);
      }
    })
    return {
      articles
    }
  }
};
</script>

<style scoped>
.main-container {
  display: flex;
}

.sidebar {
  width: 20%;
  background-color: #f0f0f0;
  padding: 16px;
}

.center-container {
  width: 80%;
  background-color: #fff;
  padding: 16px;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  /* 添加间距 */
}

.large-card {
  flex: 1 1 calc(20% - 16px);
  /* 五列布局 */
  box-sizing: border-box;
  margin-bottom: 16px;
}
</style>