<template>
    <div class="article-list">
        <h1>文章列表</h1>
        <!-- 待施工区域 -->
        <div class="construction">
            <p>🚧 该页面正在建设中...</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ArticleListView',
    data() {
        return {
            // 数据待添加
        }
    },
    methods: {
        // 方法待添加
    }
}
</script>

<style scoped>
.article-list {
    padding: 20px;
}

.construction {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    background-color: #f5f5f5;
    border-radius: 4px;
    margin: 20px 0;
}
</style>
