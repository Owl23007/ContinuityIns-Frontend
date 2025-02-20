<template>
  <div class="article-view">
    <h1>{{ article.title }}</h1>
    <div v-html="renderedContent"></div>
  </div>
</template>

<script>
import { renderMarkdownWithCopy } from '@/utils/markdown'

export default {
  data() {
    return {
      article: {
        title: "Article Title",
        content: `
          下面是一份基于 MarkdownIt 和 highlight.js 的标准配置示例，可作为独立的配置文件使用：

\`\`\`javascript
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 创建 MarkdownIt 实例，并设置标准配置
const md = new MarkdownIt({
  html: false,            // 禁用 HTML 标签，防止 XSS
  breaks: true,           // 将换行符转换为 <br>
  linkify: true,          // 自动识别 URL 并转换成链接
  typographer: true,      // 启用标点符号转换，提高排版质量
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (error) {
        console.error('语法高亮出错:', error);
      }
    }
    return ''; // 使用默认转义
  }
});

// 导出渲染函数
export const renderMarkdown = (content) => {
  if (!content) return '';
  return md.render(content);
};

// 如果需要复制按钮功能，可增加如下包装函数
export const renderMarkdownWithCopy = (content) => {
  const rendered = renderMarkdown(content);
  return rendered.replace(/(<pre><code[^>]*>)/g, (match) =>
    \`<div class="code-block-wrapper">\${match}<button class="copy-btn" title="复制代码">
  <svg width="14" height="14" viewBox="0 0 24 24">
  <path fill="currentColor" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12V1z"/>
  </svg></button></div>\`
  );
};

export default md;
\`\`\`

说明：  
1. 我们禁用了 HTML 标签以防止潜在的 XSS 攻击；  
2. 通过开启 breaks 和 linkify 提高显示效果；  
3. 使用 highlight.js 进行代码高亮，并捕获报错；  
4. renderMarkdownWithCopy 函数用于在每个代码块上添加复制按钮，保证代码正常显示。  
        `
      }
    };
  },
  computed: {
    renderedContent() {
      return renderMarkdownWithCopy(this.article.content);
    }
  }
};
</script>

<style scoped>
.article-view {
  padding: 20px;
}
</style>