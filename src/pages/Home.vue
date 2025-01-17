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
          class="large-card"
          coverImage="https://tse2-mm.cn.bing.net/th/id/OIP-C._0gTCowUaUF9RdEeDEoeKgHaE7?w=264&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7"
          title="大卡片标题"
          author="大卡片作者"
          time="4小时前"
          views="1234"
          favorites="567"
          duration="10:00"
          titleLink="https://www.baidu.com"
          authorLink="https://www.163.com"
        />
        <ArticleCard
          v-for="i in 4"
          :key="i"
          class="small-card"
          coverImage="https://tse2-mm.cn.bing.net/th/id/OIP-C._0gTCowUaUF9RdEeDEoeKgHaE7?w=264&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7"
          title="小卡片标题"
          author="小卡片作者"
          time="10-01"
          views="1234"
          favorites="567"
          duration="03:00"
        />
      </div>
    </main>
  </div>
</template>

<script>
import ArticleCard from '@/components/ArticleCard.vue';

export default {
  name: 'homePage',
  components: {
    ArticleCard
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
}

.main-container {
  background-color: #f0f0f0;
  display: flex;
  margin-top: 100px;
}

.sidebar {
  width: 10%;
  padding: 20px;
  background-color: #f0f0f0;
}

.center-container {
  flex: 1;
  padding: 20px;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

</style>