<template>
    <div class="article-detail">
        <div class="construction-message">
            <v-icon size="64" color="warning">mdi-construction</v-icon>
            <h2>页面施工中...</h2>
            <p>该页面正在建设中，敬请期待！</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ArticleDetailView',
    data() {
        return {
            // 数据将在这里定义
        }
    }
}
</script>

<style scoped>
.article-detail {
    padding: 20px;
}

.construction-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    text-align: center;
}

.construction-message h2 {
    margin-top: 20px;
    color: #666;
}

.construction-message p {
    color: #999;
    margin-top: 10px;
}
</style>