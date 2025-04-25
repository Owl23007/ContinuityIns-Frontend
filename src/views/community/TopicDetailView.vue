<template>
  <div class="topic-detail-container">
    <!-- 话题详情区域 -->
    <div class="topic-content">
      <div class="topic-header">
        <h1>{{ topicData.title }}</h1>
        <div class="author-info">
          <el-avatar :src="topicData.authorAvatar" />
          <span class="author-name">{{ topicData.authorName }}</span>
          <span class="publish-time">{{ formatDate(topicData.createTime) }}</span>
        </div>
      </div>

      <div class="topic-body" v-html="topicData.content"></div>

      <div class="topic-actions">
        <el-button type="primary" @click="handleLike">
          <el-icon><ThumbsUp /></el-icon>
          {{ topicData.likes }} 点赞
        </el-button>
        <el-button type="info" @click="handleCollect">
          <el-icon><Star /></el-icon>
          {{ topicData.collects }} 收藏
        </el-button>
      </div>
    </div>

    <!-- 评论区域 -->
    <div class="comments-section">
      <h2>评论 ({{ commentList.length }})</h2>

      <div class="comment-editor">
        <el-input
          v-model="commentContent"
          type="textarea"
          :rows="3"
          placeholder="写下你的评论..."
        />
        <el-button type="primary" @click="submitComment">发表评论</el-button>
      </div>

      <div class="comment-list">
        <div v-for="comment in commentList" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <el-avatar :src="comment.userAvatar" size="small" />
            <span class="comment-author">{{ comment.userName }}</span>
            <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const route = useRoute()
const topicId = route.params.id

// 话题数据
const topicData = ref({})
// 评论列表
const commentList = ref([])
// 评论内容
const commentContent = ref('')

// 获取话题详情
const getTopicDetail = async () => {
  // 调用API获取话题详情
  // topicData.value = await api.getTopicDetail(topicId)
}

// 获取评论列表
const getComments = async () => {
  // 调用API获取评论列表
  // commentList.value = await api.getTopicComments(topicId)
}

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  // 调用API提交评论
  // await api.submitComment({
  //   topicId,
  //   content: commentContent.value
  // })

  commentContent.value = ''
  await getComments()
}

// 处理点赞
const handleLike = async () => {
  // 调用API处理点赞
  // await api.likeTopic(topicId)
  await getTopicDetail()
}

// 处理收藏
const handleCollect = async () => {
  // 调用API处理收藏
  // await api.collectTopic(topicId)
  await getTopicDetail()
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(async () => {
  await getTopicDetail()
  await getComments()
})
</script>

<style scoped>
.topic-detail-container {
  max-width: 1400px;
  margin: 20px auto;
  padding: 20px 40px;
}

.topic-content {
  background: #fff;
  padding: 30px 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.topic-header {
  margin-bottom: 20px;
}

.topic-header h1 {
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topic-body {
  margin: 20px 0;
  line-height: 1.6;
}

.topic-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.comments-section {
  margin-top: 30px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.comment-editor {
  margin: 20px 0;
}

.comment-editor .el-button {
  margin-top: 10px;
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.comment-content {
  margin-left: 40px;
}
</style>
