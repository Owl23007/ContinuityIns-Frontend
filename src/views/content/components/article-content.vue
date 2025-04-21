<template>
  <main class="article-main">
    <header class="article-header">
      <h1 class="article-title">{{ article.title }}</h1>
    </header>

    <div v-if="article.coverImg" class="cover-image">
      <img
        :src="article.coverImg"
        :alt="article.title"
        @error="handleImageError"
        loading="lazy"
      />
    </div>

    <article
      class="article-content markdown-body"
      v-html="renderedContent"
    ></article>
  </main>
</template>

<script setup>
import { defineProps } from "vue";
import defaultCover from "@/assets/image/default_cover.jpg";

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
  renderedContent: {
    type: String,
    default: "",
  },
});

const handleImageError = (e) => {
  e.target.src = defaultCover;
};
</script>

<style scoped>
.article-main {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.03),
    0 1px 2px rgba(0, 0, 0, 0.02);
  padding: 2.5rem;
  border: 1px solid rgba(24, 144, 255, 0.1);
}

.article-header {
  margin-bottom: 2rem;
  text-align: left;
}

.article-title {
  font-size: 2.4rem;
  margin-bottom: 1.5rem;
  color: #1a365d;
  font-weight: 800;
  line-height: 1.2;
  position: relative;
  padding-bottom: 0.5rem;
}

.article-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #1890ff, #69c0ff);
  border-radius: 2px;
}

.cover-image {
  margin: 2rem 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(24, 144, 255, 0.1);
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
  transition: all 0.3s;
}

.cover-image img:hover {
  opacity: 0.95;
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
  box-shadow: 0 2px 12px rgba(24, 144, 255, 0.1);
  transition: all 0.3s;
}

.article-content :deep(img:hover) {
  transform: scale(1.01);
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.15);
}

.article-content :deep(pre) {
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 8px;
  background: #f6f8fa;
  overflow-x: auto;
  position: relative;
}

.article-content :deep(pre::before) {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #1890ff, #69c0ff);
  border-radius: 4px 0 0 4px;
}

.article-content :deep(code) {
  font-family: "Fira Code", monospace;
  font-size: 0.98em;
}

.article-content :deep(blockquote) {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid #1890ff;
  background: #f0f7ff;
  border-radius: 4px;
  position: relative;
}

.article-content :deep(blockquote::before) {
  content: '"';
  position: absolute;
  top: -10px;
  left: 10px;
  font-size: 3rem;
  color: rgba(24, 144, 255, 0.1);
  font-family: serif;
}

@media (max-width: 900px) {
  .article-main {
    padding: 2rem;
  }
}

@media (max-width: 600px) {
  .article-main {
    padding: 1.5rem 1rem;
    border-radius: 0;
    box-shadow: none;
    border: none;
  }

  .article-title {
    font-size: 1.8rem;
  }

  .cover-image img {
    max-height: 220px;
  }

  .article-content {
    font-size: 1rem;
  }
}
</style>
