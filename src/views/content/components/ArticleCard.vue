<template>
    <!-- 调试用 - 确保组件渲染 -->
    <div v-if="!article" style="color: red; padding: 20px;">
        警告：article数据为空！
    </div>

    <el-card v-else class="article-card" :body-style="{ padding: '0px' }">
        <div class="cover-container" @click="goToArticleDetail">
            <img v-if="!showDefaultCover" :src="article.cover" class="article-cover" @error="handleImageError"
                @load="handleImageLoad" />
            <img v-else :src="defaultCover" class="article-cover" />
        </div>
        <div class="article-content">
            <h3 class="article-title" @click="goToArticleDetail">{{ article.title || '无标题' }}</h3>
            <p class="article-summary">{{ article.summary || '暂无摘要' }}</p>
            <div class="article-meta">
                <span class="author clickable" @click="goToUserPage">{{ article.author || '未知作者' }}</span>
                <span class="date">{{ formatDate(article.date) }}</span>
            </div>
            <div class="article-actions">
                <el-button type="text">
                    <el-icon>
                        <View />
                    </el-icon>
                    <span>{{ article.views || 0 }}</span>
                </el-button>
                <el-button type="text">

                    <span>{{ article.likes || 0 }}</span>
                </el-button>
                <el-button type="text">
                    <el-icon>
                        <Star />
                    </el-icon>
                    <span>{{ article.collects || 0 }}</span>
                </el-button>
            </div>
        </div>

        <!-- 调试信息 -->
        <div style="display: none;">
            {{ JSON.stringify(article, null, 2) }}
        </div>
    </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import defaultCover from '@/assets/image/default_cover.png'
import { useRouter } from 'vue-router'
import { View, Star } from '@element-plus/icons-vue'

const router = useRouter()

const props = defineProps({
    article: {
        type: Object,
        required: true,
        validator: (value) => {
            console.log('ArticleCard props验证:', value)
            return value !== null
        }
    }
})

const showDefaultCover = ref(!props.article.cover)
const imageLoaded = ref(false)

// 图片加载错误处理
const handleImageError = () => {
    console.log('封面图片加载失败:', props.article.cover)
    showDefaultCover.value = true
}

// 图片加载成功处理
const handleImageLoad = () => {
    imageLoaded.value = true
}

const formatDate = (dateString) => {
    if (!dateString) return '未知日期'
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString()
    } catch (e) {
        console.error('日期格式化错误:', e)
        return dateString // 返回原始字符串
    }
}

// 跳转到文章详情页
const goToArticleDetail = () => {
    if (props.article && props.article.id) {
        router.push(`/article/${props.article.id}`)
    } else {
        console.error('文章ID不存在，无法跳转到详情页')
    }
}

// 跳转到用户主页
const goToUserPage = () => {
    if (props.article && props.article.authorId) {
        router.push(`/user/${props.article.authorId}`)
    } else {
        console.error('作者ID不存在，无法跳转到用户主页')
    }
}

onMounted(() => {
    console.log('ArticleCard已挂载，数据:', props.article)

})
</script>

<style scoped>
.article-card {
    margin-bottom: 20px;
    transition: transform 0.3s;
}

.article-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.cover-container {
    width: 100%;
    height: 0;
    padding-bottom: 56.25%;
    /* 16:9 aspect ratio */
    position: relative;
    overflow: hidden;
    cursor: pointer;
}

.article-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.default-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #606266;
}

.cover-icon {
    margin-bottom: 8px;
    opacity: 0.7;
}

.cover-text {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
    background-color: rgba(255, 255, 255, 0.7);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 8px;
}

.article-content {
    padding: 15px;
}

.article-title {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: bold;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    cursor: pointer;
}

.article-title:hover {
    color: #409EFF;
}

.article-summary {
    color: #666;
    font-size: 14px;
    margin: 0 0 10px 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.article-meta {
    display: flex;
    justify-content: space-between;
    color: #999;
    font-size: 12px;
    margin-bottom: 10px;
}

.article-actions {
    display: flex;
    justify-content: space-around;
    border-top: 1px solid #f0f0f0;
    padding-top: 10px;
}

.clickable {
    cursor: pointer;
    color: #606266;
}

.clickable:hover {
    color: #409EFF;
    text-decoration: underline;
}
</style>