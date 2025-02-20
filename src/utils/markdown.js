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
  return rendered.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, attr, codeContent) =>
    `<div class="code-block-wrapper">
  <button class="copy-btn" title="复制代码">
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path fill="currentColor" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12V1z"/>
    </svg>
  </button>
  <pre><code${attr}>${codeContent}</code></pre>
</div>`
  );
};

export default md;