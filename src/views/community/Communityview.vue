<template>
  <div class="community-container">
    <div class="community-header">
      <h1>社区</h1>
      <div class="search-bar">
        <el-input placeholder="搜索社区内容" prefix-icon="el-icon-search"></el-input>
      </div>
    </div>

    <div class="community-content">
      <div class="filters">
        <el-tabs value="all">
          <el-tab-pane label="全部" name="all"></el-tab-pane>
          <el-tab-pane label="热门" name="hot"></el-tab-pane>
          <el-tab-pane label="最新" name="latest"></el-tab-pane>
        </el-tabs>

        <el-button type="primary">发布帖子</el-button>
      </div>

      <div class="filter-options">
        <div class="category-filter">
          <span class="filter-label">分类：</span>
          <el-radio-group value="">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="tech">技术分享</el-radio-button>
            <el-radio-button label="question">技术问答</el-radio-button>
            <el-radio-button label="experience">经验总结</el-radio-button>
            <el-radio-button label="career">职业发展</el-radio-button>
            <el-radio-button label="news">行业资讯</el-radio-button>
          </el-radio-group>
        </div>

        <div class="tag-filter">
          <span class="filter-label">标签：</span>
          <el-tag
            v-for="tag in ['前端开发', '后端开发', '移动开发', '架构设计', '云原生', '人工智能']"
            :key="tag"
            effect="plain"
            class="filter-tag"
          >
            {{ tag }}
          </el-tag>
          <el-popover placement="bottom" trigger="click" width="400">
            <template #reference>
              <el-button size="small" text>更多标签</el-button>
            </template>
            <div class="all-tags">
              <el-tag
                v-for="tag in [
                  'Vue.js',
                  'React',
                  'Angular',
                  'Node.js',
                  'Java',
                  'Python',
                  'Go',
                  'C++',
                  'Docker',
                  'Kubernetes',
                  'DevOps',
                  '微服务',
                  '分布式',
                  '高并发',
                  '数据库',
                  'Redis',
                  'MongoDB',
                  '机器学习',
                  '深度学习',
                  '数据分析',
                  '网络安全',
                  '区块链',
                  '物联网',
                ]"
                :key="tag"
                effect="plain"
                class="filter-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-popover>
        </div>
      </div>

      <div class="posts-list">
        <div v-for="i in 5" :key="i" class="post-card">
          <div class="post-header">
            <div class="user-info">
              <el-avatar
                :size="40"
                :src="
                  [
                    'http://image.woyioii.cn/avatar/avatar-100001',
                    'http://image.woyioii.cn/avatar/avatar-100002',
                    'http://image.woyioii.cn/avatar/avatar-100003',
                    'http://image.woyioii.cn/avatar/avatar-100004',
                    'http://image.woyioii.cn/avatar/avatar-100005',
                  ][i - 1]
                "
              ></el-avatar>
              <span class="author-name">{{
                ['Owl', '啊啊啊老张', 'notLast', '云专家', 'JavaNotEasy'][i - 1]
              }}</span>
              <el-tag size="small" type="success" effect="plain" class="user-level"
                >Lv.{{ i + 3 }}</el-tag
              >
            </div>
            <div class="post-meta">
              <el-tag size="small" type="info" effect="plain">{{
                ['技术分享', '经验总结', '技术问答', '职业发展', '行业资讯'][i - 1]
              }}</el-tag>
              <span class="post-time">2024-01-{{ i.toString().padStart(2, '0') }}</span>
            </div>
          </div>
          <div class="post-title">
            {{
              [
                '深入浅出Vue3组件设计模式与最佳实践',
                '聊聊我在大厂这三年的技术成长之路',
                '从零搭建一个企业级微服务架构实践分享',
                '前端工程师应该掌握的算法知识总结',
                '云原生时代的后端架构演进',
              ][i - 1]
            }}
          </div>
          <div class="post-content-preview">
            {{
              [
                '在本文中，我将分享在实际项目中总结的Vue3组件设计经验，包括组件解耦、状态管理、性能优化等关键话题...',
                '回首这三年的技术生涯，从团队协作到技术选型，从代码质量到架构设计，这些经验教训值得分享...',
                '本文将详细介绍如何基于Spring Cloud构建微服务架构，包括服务注册、配置中心、服务熔断等核心组件的实践...',
                '作为前端工程师，掌握必要的算法知识不仅能优化代码性能，还能提升解决问题的能力...',
                '从单体应用到微服务，从传统部署到容器化，云原生技术栈正在重塑后端架构的未来...',
              ][i - 1]
            }}
          </div>
          <div class="post-tags">
            <el-tag
              size="small"
              effect="plain"
              v-for="tag in [
                ['Vue3', '组件设计', '最佳实践'],
                ['职业成长', '技术管理', '经验分享'],
                ['微服务', 'Spring Cloud', '架构设计'],
                ['算法', '前端开发', '技术进阶'],
                ['云原生', '架构演进', '技术趋势'],
              ][i - 1]"
              :key="tag"
              >{{ tag }}</el-tag
            >
          </div>
          <div class="post-stats">
            <span class="stat-item"><View class="icon" /> {{ i * 1000 + 500 }}</span>
            <span class="stat-item"><ChatDotRound class="icon" /> {{ i * 50 + 20 }}</span>
            <span class="stat-item"><Star class="icon" /> {{ i * 100 + 30 }}</span>
            <span class="stat-item"><Share class="icon" /> {{ i * 20 + 5 }}</span>
          </div>
        </div>

        <el-pagination
          background
          layout="prev, pager, next"
          :total="50"
          :page-size="10"
          :current-page="1"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import { View, ChatDotRound, Star, Share } from '@element-plus/icons-vue'

export default {
  name: 'CommunityView',
  components: {
    View,
    ChatDotRound,
    Star,
    Share,
  },
}
</script>

<style scoped>
.community-container {
  max-width: 90%; /* 从1200px调整为1400px */
  min-width: 80%;
  margin: 0 auto;
  padding: 20px;
}

.community-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  width: 400px; /* 从300px调整为400px */
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.post-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.post-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
}

.author-name {
  margin-left: 10px;
  font-weight: bold;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-level {
  margin-left: 8px;
}

.post-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.post-content-preview {
  color: #606266;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.post-tags {
  margin: 10px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.post-stats {
  display: flex;
  gap: 15px;
  color: #909399;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-item i {
  font-size: 16px;
}

.no-posts {
  text-align: center;
  padding: 50px 0;
  color: #909399;
}

/* 添加筛选样式 */
.filter-options {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.category-filter,
.tag-filter {
  margin-bottom: 10px;
}

.filter-label {
  display: inline-block;
  width: 50px;
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
}

.filter-tag {
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.all-tags {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon {
  width: 1em;
  height: 1em;
}
</style>
