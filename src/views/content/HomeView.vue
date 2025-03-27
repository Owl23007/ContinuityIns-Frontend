<template>
  <div class="main-container">
    <aside class="sidebar">
      <h2>公告</h2>
      <p>这是一个公告栏。</p>
    </aside>
    <main class="center-container">
      <h1>今日推荐</h1>
      <div class="cards-container">
        <ArticleCard
          v-for="article in articles"
          :key="article.id"
          :article="article"
          class="large-card"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDailyRecommendations_get } from '@/api/article';
import ArticleCard from '@/components/common/ArticleCard.vue';

const articles = ref([]);

onMounted(async () => {
  try {
    articles.value = await getDailyRecommendations_get();
  } catch (error) {
    console.error('获取每日推荐失败:', error);
  }
});
</script>

<style scoped>
.main-container {
  display: flex;
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 2rem var(--padding-x);
  gap: 2rem;
}

.sidebar {
  width: 300px;
  background-color: var(--surface-color);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px var(--shadow-color);
  height: fit-content;
}

.center-container {
  flex: 1;
  min-width: 0;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

h1 {
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

h2 {
  font-size: 1.4rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

@media (max-width: 1024px) {
  .main-container {
    padding: 1.5rem var(--padding-x);
  }
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .cards-container {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>