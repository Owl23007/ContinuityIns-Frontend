<template>
  <div class="submit-container">
    <div class="editor-header">
      <h1>创建文章</h1>
      <div class="header-actions">
        <button class="draft-btn" @click="saveDraft" :disabled="isSubmitting">
          保存草稿
        </button>
        <button class="publish-btn" @click="publishArticle" :disabled="isSubmitting">
          {{ isSubmitting ? '发布中...' : '发布文章' }}
        </button>
      </div>
    </div>

    <div class="editor-main">
      <!-- 标题输入 -->
      <div class="input-group">
        <input 
          type="text" 
          v-model="articleData.title"
          placeholder="请输入文章标题..."
          class="title-input"
          :maxlength="100"
        >
        <span class="char-count">{{ articleData.title.length }}/100</span>
      </div>

      <!-- 封面图片上传 -->
      <div class="cover-upload">
        <div class="upload-area" @click="triggerFileInput" v-if="!articleData.coverImg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p>点击上传封面图片</p>
          <p class="upload-hint">建议尺寸 1200x675 像素</p>
        </div>
        <div class="preview-area" v-else>
          <img :src="articleData.coverImg" alt="文章封面" class="cover-preview">
          <div class="preview-actions">
            <button class="change-btn" @click="triggerFileInput">更换图片</button>
            <button class="remove-btn" @click="removeCover">移除图片</button>
          </div>
        </div>
        <input 
          type="file" 
          ref="fileInput"
          class="file-input"
          accept="image/jpeg,image/png"
          @change="handleCoverUpload"
          style="display: none"
        >
      </div>

      <!-- Markdown 编辑器集成 -->
      <div class="markdown-editor">
        <MdEditor
          v-model="articleData.content"
          :preview="true"
          :toolbars="[
            'bold', 'italic', 'strikethrough', 'sub', 'sup', 
            '-',
            'quote', 'unordered-list', 'ordered-list', 'task',
            '-',
            'link', 'image', 'code', 'table',
            '-',
            'preview', 'fullscreen'
          ]"
          @onChange="handleEditorChange"
          placeholder="开始创作..."
          class="md-editor"
        />
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { uploadArticle_post } from '@/api/article'
import { uploadFile } from '@/utils/upload'
import { ArticleStatus } from '@/pojo/article'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const router = useRouter()
const authStore = useAuthStore()
const fileInput = ref(null)
const isSubmitting = ref(false)
const error = ref('')

const articleData = reactive({
  title: '',
  content: '',
  coverImg: '',
  status: ArticleStatus.DRAFT
})

// 处理编辑器内容变化
const handleEditorChange = (content) => {
  articleData.content = content
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理封面图片上传
const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const url = await uploadFile(file, 'article', authStore.token)
    articleData.coverImg = url
    error.value = ''
  } catch (err) {
    error.value = err.message || '图片上传失败'
  } finally {
    // 清空input的value，确保能重复选择同一文件
    event.target.value = ''
  }
}

// 移除封面图片
const removeCover = () => {
  articleData.coverImg = ''
}

// 保存草稿
const saveDraft = () => {
  submitArticle(ArticleStatus.DRAFT)
}

// 发布文章
const publishArticle = () => {
  submitArticle(ArticleStatus.PUBLISHED)
}

// 提交文章
const submitArticle = async (status) => {
  if (!articleData.title.trim()) {
    error.value = '请输入文章标题'
    return
  }

  if (!articleData.content.trim()) {
    error.value = '请输入文章内容'
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    await uploadArticle_post(
      authStore.token,
      articleData.title,
      articleData.content,
      articleData.coverImg,
      status
    )
    router.push('/article-list')
  } catch (err) {
    error.value = err.message || '发布失败，请重试'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.submit-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.draft-btn, .publish-btn {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.draft-btn {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.publish-btn {
  background: var(--secondary-color);
  border: none;
  color: white;
}

.draft-btn:hover {
  background: var(--hover-bg);
}

.publish-btn:hover {
  opacity: 0.9;
}

.input-group {
  position: relative;
  margin-bottom: 2rem;
}

.title-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.5rem;
  border: none;
  border-bottom: 2px solid var(--border-color);
  background: transparent;
  color: var(--text-primary);
}

.char-count {
  position: absolute;
  right: 0;
  bottom: -1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.cover-upload {
  margin-bottom: 2rem;
  border-radius: 8px;
  overflow: hidden;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: var(--secondary-color);
  background: var(--hover-bg);
}

.upload-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.preview-area {
  position: relative;
}

.cover-preview {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.preview-actions {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.change-btn, .remove-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-btn:hover, .remove-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.markdown-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 500px;
  margin-bottom: 2rem;
}

.md-editor {
  min-height: 500px;
  border-radius: 8px;
  overflow: hidden;
}

.md-editor :deep(.md-editor-toolbar) {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.md-editor :deep(.md-editor-input),
.md-editor :deep(.md-editor-preview) {
  min-height: 500px;
  background: var(--background-color);
  color: var(--text-primary);
}

.md-editor :deep(.md-editor-input):focus {
  outline: none;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .md-editor :deep(.md-editor-toolbar) {
    background: var(--surface-color);
    border-color: var(--border-color);
  }
  
  .md-editor :deep(.md-editor-input),
  .md-editor :deep(.md-editor-preview) {
    background: var(--background-color);
    color: var(--text-primary);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .submit-container {
    padding: 1rem;
  }

  .markdown-editor {
    min-height: 400px;
  }
  
  .md-editor {
    min-height: 400px;
  }
  
  .md-editor :deep(.md-editor-input),
  .md-editor :deep(.md-editor-preview) {
    min-height: 400px;
  }

  .header-actions {
    flex-direction: column;
  }
}
</style>