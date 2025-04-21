<template>
  <div class="submit-container">
    <div class="editor-header">
      <div class="header-left">
        <h1>{{ isEditing ? '编辑文章' : '创建文章' }}</h1>
      </div>
      <div class="header-actions">
        <button class="draft-btn" @click="saveDraft" :disabled="isSubmitting">保存草稿</button>
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
        />
        <span class="char-count">{{ articleData.title.length }}/100</span>
      </div>

      <!-- 封面图片上传 -->
      <div class="cover-upload">
        <div class="upload-area" @click="triggerFileInput" v-if="!articleData.coverImg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p>点击上传封面图片</p>
          <p class="upload-hint">建议尺寸 1200x675 像素</p>
        </div>
        <div class="preview-area" v-else>
          <img :src="articleData.coverImg" alt="文章封面" class="cover-preview" />
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
        />
      </div>

      <!-- Markdown 编辑器集成 -->
      <div class="markdown-editor">
        <div class="editor-container">
          <div class="toolbar">
            <div class="toolbar-group">
              <button
                :class="['mode-btn', { active: !isMarkdownMode }]"
                @click="isMarkdownMode = false"
                title="纯文本模式"
              >
                Aa
              </button>
              <button
                :class="['mode-btn', { active: isMarkdownMode }]"
                @click="isMarkdownMode = true"
                title="Markdown模式"
              >
                Md
              </button>
            </div>

            <span class="divider" v-if="isMarkdownMode"></span>

            <div class="toolbar-group" v-if="isMarkdownMode">
              <button @click="insertMd('**', '**')" title="粗体">B</button>
              <button @click="insertMd('*', '*')" title="斜体">I</button>
              <button @click="insertMd('~~', '~~')" title="删除线">S</button>
              <span class="divider"></span>
              <button @click="insertMd('\n> ', '')" title="引用">"</button>
              <button @click="insertList('- ')" title="无序列表">•</button>
              <button @click="insertList('1. ')" title="有序列表">1.</button>
              <span class="divider"></span>
              <button @click="insertMd('[', ']()')" title="链接">🔗</button>
              <button @click="triggerInsertImage" title="插入图片">🖼</button>
              <button @click="insertMd('```\n', '\n```')" title="代码块">{}</button>
              <button @click="insertMd('|  |  |\n|--|--|\n|  |  |', '')" title="表格">⊞</button>
            </div>

            <div class="toolbar-group toolbar-right" v-if="isMarkdownMode">
              <button
                :class="['preview-btn', { active: showPreview }]"
                @click="showPreview = !showPreview"
                title="显示/隐藏预览"
              >
                👁
              </button>
              <button
                :class="['sync-btn', { active: syncScroll }]"
                @click="syncScroll = !syncScroll"
                title="同步滚动"
              >
                ⇅
              </button>
            </div>
          </div>
          <div
            class="edit-preview-container"
            :class="{
              'plain-text': !isMarkdownMode,
              'hide-preview': !showPreview && isMarkdownMode,
            }"
          >
            <textarea
              ref="editor"
              v-model="articleData.content"
              class="markdown-input"
              :class="{ 'plain-text': !isMarkdownMode }"
              :placeholder="
                isMarkdownMode ? '开始创作(Markdown模式)...' : '开始创作(纯文本模式)...'
              "
              @input="handleEditorChange"
              @scroll="handleEditorScroll"
            ></textarea>
            <div
              v-if="isMarkdownMode && showPreview"
              ref="preview"
              class="preview markdown-body"
              v-html="renderedContent"
              @scroll="handlePreviewScroll"
            ></div>
          </div>
        </div>
        <!-- 用于插入图片的隐藏文件选择框 -->
        <input
          type="file"
          ref="insertImageInput"
          accept="image/jpeg,image/png"
          style="display: none"
          @change="handleInsertImageUpload"
        />
      </div>
    </div>
  </div>
  <notification-system ref="notificationSystem" />
</template>

<script setup>
import { ref, reactive, computed, watch, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getArticleById_get, updateArticle_put, createArticle_post } from '@/api/article'
import { uploadFile, validateFile } from '@/api/file'
import { ArticleStatus } from '@/pojo/article'
import { renderMarkdown } from '@/utils/markdown'
import NotificationSystem from '@/components/common/NotificationSystem.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const fileInput = ref(null)
const isSubmitting = ref(false)
const error = ref('')
const isMarkdownMode = ref(true)
const showPreview = ref(true)
const syncScroll = ref(true)
const editor = ref(null)
const preview = ref(null)
const isEditorScrolling = ref(false)
const isPreviewScrolling = ref(false)
const loading = ref(false)
const insertImageInput = ref(null)
const notificationSystem = ref(null)

const isEditing = computed(() => Boolean(route.params.id))

const articleData = reactive({
  title: '',
  content: '',
  coverImg: '',
  status: ArticleStatus.DRAFT,
})

// 初始化文章数据
const initArticle = async () => {
  if (!isEditing.value) return

  loading.value = true
  try {
    const response = await getArticleById_get(route.params.id)
    const article = response.data
    articleData.title = article.title
    articleData.content = article.content
    articleData.coverImg = article.coverImg
    articleData.status = article.status
  } catch (err) {
    error.value = err.message || '获取文章失败'
    router.push('/article')
  } finally {
    loading.value = false
  }
}

// 监听编辑状态更新页面标题
watchEffect(() => {
  document.title = `${isEditing.value ? '编辑' : '创建'}文章 - 存续院`
})

// 处理编辑器内容变化
const handleEditorChange = (event) => {
  const newContent = event?.target?.value ?? event
  articleData.content = String(newContent || '')
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理封面图片上传
const handleCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  console.log('handleCoverUpload', file)
  // 验证文件类型
  const supportedTypes = ['image/jpeg', 'image/png']
  if (!supportedTypes.includes(file.type)) {
    error.value = '不支持的文件类型，请上传 JPG 或 PNG 格式的图片'
    event.target.value = ''
    return
  }

  // 验证文件大小（限制为 5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    error.value = '图片大小不能超过 5MB'
    event.target.value = ''
    return
  }
  try {
    const { url } = await uploadFile(file, 'article')

    if (!url) {
      throw new Error('上传失败，请重试')
    }

    articleData.coverImg = url
    error.value = ''
  } catch (err) {
    error.value = err.message || '图片上传失败'
  } finally {
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
    notificationSystem.value?.show('请输入文章标题', 'error')
    return
  }

  isSubmitting.value = true

  try {
    const content = isMarkdownMode.value
      ? articleData.content
      : articleData.content.split('\n').join('<br>')

    const data = {
      ...articleData,
      content,
      status,
    }

    if (isEditing.value) {
      await updateArticle_put(route.params.id, data)
      notificationSystem.value?.show('文章更新成功', 'success')
    } else {
      await createArticle_post(data)
      notificationSystem.value?.show('文章创建成功', 'success')
    }

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      router.push('/article')
    }, 1500)
  } catch (err) {
    notificationSystem.value?.show(err.message || '保存失败，请重试', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 监听路由参数变化重新加载文章
watch(() => route.params.id, initArticle, { immediate: true })

// 处理编辑器滚动
const handleEditorScroll = (e) => {
  if (!syncScroll.value || !showPreview.value || isPreviewScrolling.value) return

  isEditorScrolling.value = true
  const percentage = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight)
  const previewEl = preview.value
  if (previewEl) {
    previewEl.scrollTop = percentage * (previewEl.scrollHeight - previewEl.clientHeight)
  }
  setTimeout(() => {
    isEditorScrolling.value = false
  }, 100)
}

// 处理预览滚动
const handlePreviewScroll = (e) => {
  if (!syncScroll.value || isEditorScrolling.value) return

  isPreviewScrolling.value = true
  const percentage = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight)
  const editorEl = editor.value
  if (editorEl) {
    editorEl.scrollTop = percentage * (editorEl.scrollHeight - editorEl.clientHeight)
  }
  setTimeout(() => {
    isPreviewScrolling.value = false
  }, 100)
}

// 计算属性：实时渲染预览
const renderedContent = computed(() => {
  if (!articleData.content) return ''
  if (!isMarkdownMode.value) {
    // 纯文本模式下直接显示内容，保留换行符
    return articleData.content
  }
  return renderMarkdown(String(articleData.content))
})

// Markdown 编辑器功能
function insertMd(before, after) {
  if (!isMarkdownMode.value) return
  const textarea = document.querySelector('.markdown-input')
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = String(articleData.content || '')
  const selectedText = text.substring(start, end)

  articleData.content =
    text.substring(0, start) + before + selectedText + after + text.substring(end)

  // 保持选中状态
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, end + before.length)
  })
}

function insertList(prefix) {
  if (!isMarkdownMode.value) return
  const textarea = document.querySelector('.markdown-input')
  const start = textarea.selectionStart
  const text = String(articleData.content || '')
  const lineStart = Math.max(text.lastIndexOf('\n', start - 1), -1) + 1

  articleData.content = text.substring(0, lineStart) + prefix + text.substring(lineStart)

  // 将光标移到行末
  setTimeout(() => {
    textarea.focus()
    const newPos = lineStart + prefix.length
    textarea.setSelectionRange(newPos, newPos)
  })
}

// 触发插入图片文件选择
const triggerInsertImage = () => {
  insertImageInput.value.click()
}

// 处理插入图片上传
const handleInsertImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  const supportedTypes = ['image/jpeg', 'image/png']
  if (!supportedTypes.includes(file.type)) {
    error.value = '不支持的文件类型，请上传 JPG 或 PNG 格式的图片'
    event.target.value = ''
    return
  }

  // 验证文件大小（限制为 5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    error.value = '图片大小不能超过 5MB'
    event.target.value = ''
    return
  }

  try {
    const { url } = await uploadFile(file, 'article')

    if (!url) {
      throw new Error('上传失败，请重试')
    }

    insertMd(`![图片描述](${url})`, '')
    error.value = ''
  } catch (err) {
    error.value = err.message || '图片上传失败'
  } finally {
    event.target.value = ''
  }
}

// 替换原有 error 提示为全局通知
watch(error, (val) => {
  if (val) {
    notificationSystem.value?.show(val, 'error')
    error.value = ''
  }
})
</script>

<style scoped>
.submit-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background: var(--background-color);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--surface-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left h1 {
  font-size: 1.75rem;
  color: var(--text-primary);
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.draft-btn,
.publish-btn {
  padding: 0.625rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.draft-btn {
  background: var(--surface-color);
  border: 1.5px solid var(--border-color);
  color: var(--text-secondary);
}

.publish-btn {
  background: var(--secondary-color);
  border: none;
  color: white;
}

.draft-btn:hover {
  background: var(--hover-bg);
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.publish-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.draft-btn:disabled,
.publish-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.input-group {
  position: relative;
  margin-bottom: 2rem;
}

.title-input {
  width: 100%;
  padding: 1rem 1.25rem;
  font-size: 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.title-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--secondary-color);
}

.char-count {
  position: absolute;
  right: 0.5rem;
  bottom: -1.75rem;
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

.change-btn,
.remove-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-btn:hover,
.remove-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.markdown-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 500px;
  margin-bottom: 2rem;
}

.editor-container {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.toolbar {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--surface-color);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.toolbar-group {
  display: flex;
  gap: 6px;
  align-items: center;
}

.toolbar button {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1.5px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
}

.toolbar button:hover {
  background: var(--hover-bg);
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.toolbar .divider {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 4px;
}

.mode-btn.active,
.preview-btn.active,
.sync-btn.active {
  background: var(--secondary-color);
  color: white;
  border-color: var(--secondary-color);
}

.edit-preview-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 600px;
  background: var(--background-color);
}

.edit-preview-container.plain-text,
.edit-preview-container.hide-preview {
  grid-template-columns: 1fr;
}

.markdown-input {
  padding: 1.5rem;
  border: none;
  border-right: 1px solid var(--border-color);
  resize: none;
  background: var(--background-color);
  color: var(--text-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.6;
  font-size: 1rem;
}

.markdown-input.plain-text {
  border-right: none;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.markdown-input:focus {
  outline: none;
}

.preview {
  padding: 1.5rem;
  overflow-y: auto;
  background: var(--background-color);
  color: var(--text-primary);
  line-height: 1.6;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .submit-container {
    padding: 1rem;
  }

  .editor-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem;
  }

  .header-actions {
    justify-content: stretch;
  }

  .draft-btn,
  .publish-btn {
    flex: 1;
    justify-content: center;
  }

  .markdown-editor {
    min-height: 400px;
  }

  .toolbar {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 8px;
    gap: 4px;
  }

  .toolbar::-webkit-scrollbar {
    height: 4px;
  }

  .toolbar::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 2px;
  }

  .toolbar button {
    padding: 6px 8px;
    min-width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .toolbar-group {
    flex-shrink: 0;
    gap: 4px;
  }

  .edit-preview-container {
    grid-template-columns: 1fr;
    height: 500px;
  }

  .preview {
    display: none;
  }

  .markdown-input {
    border-right: none;
    padding: 1rem;
  }

  .title-input {
    font-size: 1.25rem;
    padding: 0.875rem 1rem;
  }
}
</style>
