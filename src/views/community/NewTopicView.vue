<template>
  <div class="new-topic-container">
    <div class="topic-form">
      <h2>发布新话题</h2>

      <el-form :model="topicForm" :rules="rules" ref="formRef">
        <el-form-item prop="title" label="标题">
          <el-input
            v-model="topicForm.title"
            placeholder="请输入标题(5-50字)"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item prop="category" label="分类">
          <el-select v-model="topicForm.category" placeholder="请选择分类">
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item prop="tags" label="标签">
          <el-select
            v-model="topicForm.tags"
            multiple
            filterable
            allow-create
            placeholder="请选择或创建标签"
          >
            <el-option
              v-for="tag in tagOptions"
              :key="tag.value"
              :label="tag.label"
              :value="tag.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item prop="content" label="内容">
          <div class="editor-container">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="编辑" name="edit">
                <el-input
                  v-model="topicForm.content"
                  type="textarea"
                  :rows="12"
                  placeholder="支持 Markdown 格式"
                />
              </el-tab-pane>
              <el-tab-pane label="预览" name="preview">
                <div class="markdown-preview" v-html="compiledMarkdown"></div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-form-item>

        <el-form-item label="上传图片">
          <el-upload
            action="/api/upload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            multiple
            :limit="5"
          >
            <el-button type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitTopic">发布话题</el-button>
          <el-button @click="previewTopic">预览</el-button>
          <el-button @click="saveDraft">保存草稿</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

// 如果上面的导入方式还是报错，可以尝试下面的方式：
// import * as marked from 'marked'

const router = useRouter()
const formRef = ref(null)
const activeTab = ref('edit')

// 表单数据
const topicForm = ref({
  title: '',
  category: '',
  tags: [],
  content: '',
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 5, max: 50, message: '标题长度在 5 到 50 个字符', trigger: 'blur' },
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 20, message: '内容至少 20 个字符', trigger: 'blur' },
  ],
}

// 分类选项
const categories = [
  { label: '提问', value: 'question' },
  { label: '分享', value: 'share' },
  { label: '讨论', value: 'discussion' },
]

// 标签选项
const tagOptions = ref([
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
])

// Markdown 预览
const compiledMarkdown = computed(() => {
  return md.render(topicForm.value.content || '')
})

// 图片上传相关方法
const handleUploadSuccess = (response) => {
  const imgUrl = response.data.url
  topicForm.value.content += `\n![图片](${imgUrl})`
  ElMessage.success('上传成功')
}

const handleUploadError = () => {
  ElMessage.error('上传失败')
}

const beforeUpload = (file) => {
  const isImage = /^image\//.test(file.type)
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

// 提交话题
const submitTopic = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    // 调用API提交话题
    // await api.createTopic(topicForm.value)
    ElMessage.success('发布成功')
    router.push('/community')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 预览话题
const previewTopic = () => {
  activeTab.value = 'preview'
}

// 保存草稿
const saveDraft = async () => {
  // 调用API保存草稿
  // await api.saveDraft(topicForm.value)
  ElMessage.success('草稿已保存')
}
</script>

<style scoped>
.new-topic-container {
  max-width: 1400px; /* 增加容器宽度 */
  margin: 20px auto;
  padding: 20px 40px; /* 调整内边距 */
}

.topic-form {
  background: #fff;
  padding: 40px; /* 增加内边距 */
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin: 0 -20px; /* 增加编辑器区域宽度 */
}

.markdown-preview {
  min-height: 300px;
  padding: 20px 30px; /* 调整预览区域内边距 */
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  line-height: 1.6;
  font-size: 16px;
}

.markdown-preview :deep(h1) {
  font-size: 28px;
  margin-bottom: 16px;
}

.markdown-preview :deep(h2) {
  font-size: 24px;
  margin-bottom: 14px;
}

.markdown-preview :deep(p) {
  margin-bottom: 12px;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  padding-left: 20px;
  margin-bottom: 12px;
}

.markdown-preview :deep(code) {
  background-color: #f6f6f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.markdown-preview :deep(pre) {
  background-color: #f6f6f6;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 16px;
  margin: 16px 0;
  color: #666;
}

.markdown-preview :deep(img) {
  max-width: 100%;
  height: auto;
}

:deep(.el-form-item) {
  margin-bottom: 25px;
}

:deep(.el-select) {
  width: 100%;
}
</style>
