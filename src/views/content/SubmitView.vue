<template>
    <div class="submit-container">
        <h1>待施工页面</h1>
        <div class="construction-notice">
            <el-alert
                title="页面正在建设中"
                type="info"
                description="这个页面正在开发中，敬请期待..."
                :closable="false"
                center
                show-icon>
            </el-alert>
        </div>
    </div>
</template>

<script setup>
// Using the Composition API with <script setup>
// No need for explicit return or data definitions
</script>

<style scoped>
.submit-container {
    padding: 20px;
}

.construction-notice {
    max-width: 600px;
    margin: 40px auto;
}

h1 {
    text-align: center;
    color: #606266;
    margin-bottom: 30px;
}
</style>