<template>
  <div class="main-container">
    <aside class="sidebar">
      <h2>公告</h2>
      <p>这是一个公告栏。</p>
    </aside>
    <main class="center-container">
      <h1>今日推荐</h1>
      <div class="cards-container">
        <div class="large-card">
          <ArticleCard
            coverImage="https://tse2-mm.cn.bing.net/th/id/OIP-C._0gTCowUaUF9RdEeDEoeKgHaE7?w=264&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7"
            title="大卡片标题" author="大卡片作者" time="2023-10-01" views="1234" favorites="567" />
        </div>
        <div class="small-cards">
          <ArticleCard v-for="i in 4" :key="i"
            coverImage="https://tse2-mm.cn.bing.net/th/id/OIP-C._0gTCowUaUF9RdEeDEoeKgHaE7?w=264&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7"
            title="小卡片标题" author="小卡片作者" time="2023-10-01" views="1234" favorites="567" />
        </div>
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

.container {
    background-color: #ffffff;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(27, 31, 35, 0.12), 0 8px 24px rgba(27, 31, 35, 0.12);
    padding: 20px;
    width: 80%;
    max-width: 1200px;
    margin-bottom: 20px;
    /* 这是你选中的样式 */
}

.main-container {
    display: flex;
    margin-top: 100px;
}

.sidebar {
    width: 10%;
    padding: 20px;
    background-color: #f4f4f4;
}

.center-container {
    display: flex;
    margin-top: 80px;
    width: 70%;
    height: 450px;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(27, 31, 35, 0.12), 0 8px 24px rgba(27, 31, 35, 0.12);
    background-color: #ffffff;
    padding: 16px;
}

.cards-container {
    display: flex;
    width: 100%;
    height: 100%; 
}

.large-card {
    flex: 1 1 100%;
    height: 100%;
    width: 40%;
    margin-top: 0px;
}

.small-cards {
    display: flex;
    flex-wrap: wrap;
    height: 100%;
    width: 100%;
    gap: 20px;
    display: flex;
    justify-content: space-between;
}

.small-cards>* {
    flex: 1 1 calc(50% - 20px);
    height: calc(50% - 10px);
}

</style>