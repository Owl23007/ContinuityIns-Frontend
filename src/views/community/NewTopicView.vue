<template>
  <div class="new-topic-container">
    <div class="topic-form">
      <h2>发布新话题</h2>

      <el-form
        :model="topicForm"
        :rules="rules"
        ref="formRef"
        label-position="top"
        class="topic-form__inner"
      >
        <el-form-item prop="title" label="标题">
          <el-input
            v-model="topicForm.title"
            placeholder="请输入标题(5-50字)"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item prop="category" label="分类">
          <el-cascader
            v-model="topicForm.category"
            :options="categoriesTree"
            :props="{
              value: 'categoryId',
              label: 'label',
              children: 'children',
            }"
            :loading="loading.categories"
            placeholder="请选择分类"
            clearable
          >
            <template #default="{ node, data }">
              <span v-html="data.label"></span>
              <span v-if="data.description" class="category-description">
                {{ data.description }}
              </span>
            </template>
          </el-cascader>
        </el-form-item>

        <el-form-item prop="tags" label="标签">
          <el-select
            v-model="topicForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            :loading="loading.tags"
            placeholder="请选择或创建标签（最多5个）"
            @create="handleTagCreate"
            :multiple-limit="5"
          >
            <template #empty>
              <el-empty description="暂无标签数据" />
            </template>
            <el-option
              v-for="tag in tagOptions"
              :key="tag.value"
              :label="tag.label"
              :value="tag.value"
            />
          </el-select>
          <div class="tag-tips">选择合适的标签可以让您的话题被更多人看到</div>
        </el-form-item>

        <el-form-item prop="content" label="内容">
          <div class="editor-container">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="编辑" name="edit">
                <el-input
                  v-model="topicForm.content"
                  type="textarea"
                  :rows="12"
                  :cols="100"
                  placeholder="请输入话题内容（支持 Markdown 格式）"
                />
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitTopic">发布话题</el-button>
          <el-button @click="saveDraft">保存草稿</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'
import { getCategories_get } from '@/api/recommend'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

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

// 分类树形结构
const categoriesTree = ref([])

// 分类图标定义
const categoryIcons = {
  1: '💻', // 科技
  2: '🏠', // 生活
  3: '📚', // 文学
  4: '🎓', // 学习
  5: '🔗', // 资源
  6: '🎭', // 艺术
  7: '📱', // 数码
  8: '🎮', // 游戏
  9: '🍲', // 美食
  10: '💬', // 杂谈
}

// 获取分类图标
const getCategoryIcon = (categoryId) => {
  return categoryIcons[categoryId] || '📁' // 默认图标
}

// 加载状态
const loading = ref({
  categories: false,
  tags: false,
})

// 修改后的表单验证规则
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
  tags: [
    { required: true, message: '请至少选择一个标签', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value.length > 5) {
          callback(new Error('最多选择5个标签'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}

// 标签选项
const tagOptions = ref([
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Node.js', value: 'nodejs' },
  { label: '前端', value: 'frontend' },
  { label: '后端', value: 'backend' },
  { label: '数据库', value: 'database' },
  { label: '云计算', value: 'cloud' },
  { label: '人工智能', value: 'ai' },
  { label: '机器学习', value: 'ml' },
  { label: '开源', value: 'opensource' },
  { label: '求职', value: 'job' },
])

// Markdown 预览
const compiledMarkdown = computed(() => {
  return md.render(topicForm.value.content || '')
})

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

// 保存草稿
const saveDraft = async () => {
  // 保存草稿到本地
  localStorage.setItem('draft', JSON.stringify(topicForm.value))
  ElMessage.success('草稿已保存')
}

// 加载标签列表
const loadTags = async () => {
  loading.value.tags = true
  try {
    // 这里可以替换为实际的API调用
    // const response = await api.getTags()
    // if (response?.data?.length) {
    //   tagOptions.value = response.data.map(tag => ({
    //     label: tag.name,
    //     value: tag.id
    //   }))
    // } else {
    //   ElMessage.warning('暂无标签数据')
    // }
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value.tags = false
  }
}

// 修改分类加载逻辑
const loadCategories = async () => {
  loading.value.categories = true
  try {
    const response = await getCategories_get()
    console.log('分类列表:', response)
    if (response?.length) {
      const categories = response

      // 分别获取父分类和子分类
      const parentCategories = categories.filter(
        (cat) => cat.parentId === 0 && cat.categoryId !== 10
      )
      const childCategories = categories.filter((cat) => cat.parentId !== 0)

      // 构建树形结构
      categoriesTree.value = parentCategories
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((parent) => ({
          ...parent,
          label: `${getCategoryIcon(parent.categoryId)} ${parent.name}`, // 添加图标
          children: childCategories
            .filter((child) => child.parentId === parent.categoryId)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((child) => ({
              ...child,
              label: child.name, // 子分类不需要图标
            })),
        }))
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value.categories = false
  }
}

onMounted(() => {
  loadTags()
  loadCategories()

  // 检查是否有草稿
  const draft = localStorage.getItem('draft')
  if (draft) {
    topicForm.value = JSON.parse(draft)
  }
})
</script>

<style scoped>
.new-topic-container {
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.topic-form {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.topic-form__inner {
  max-width: 900px;
  margin: 0 auto;
}

.editor-container {
  padding: 0% 20px; /* 调整编辑器区域内边距 */
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin: 20px 20px; /* 增加编辑器区域宽度 */
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
  width: 100%;
}

:deep(.el-cascader) {
  width: 100%;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  width: 100%;
  box-shadow: none;
  border: 1px solid #dcdfe6;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  border-color: #409eff;
}

:deep(.el-tabs__content) {
  padding: 20px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-empty) {
  padding: 20px 0;
}

.tag-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

.category-description {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

:deep(.el-cascader-node__postfix) {
  line-height: 1.2;
}

:deep(.el-cascader-panel) {
  max-width: none;
}

/* 添加分类图标样式 */
:deep(.el-cascader-node__label) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-cascader-panel .el-cascader-node.is-disabled) {
  color: #999;
}

:deep(.el-cascader__dropdown.el-popper) {
  max-width: none;
}
</style>
