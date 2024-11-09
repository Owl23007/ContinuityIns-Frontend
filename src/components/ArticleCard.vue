<template>
    <div class="article-card">
      <div class="info">
        <div class="coverimg">
          <img :src= "coverImage" alt="Article Image" />
        </div>
        <div class="details">
          <div class="article-title">{{ title }}</div>
          <div class="article-author">作者: {{ author }}</div>
          <div class="article-time">发布时间: {{ time }}</div>
          <div class="article-views">浏览量: {{ views }}</div>
          <div class="article-favorites">收藏: {{ favorites }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ArticleCard',
    props: {
      coverImage: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      author: {
        type: String,
        required: true
      },
      time: {
        type: String,
        required: true
      },
      views: {
        type: Number,
        required: true
      },
      favorites: {
        type: Number,
        required: true
      }
    }
  };
  </script>
  
  <style scoped src = "@/assets/css/ArticleCard.css"></style>