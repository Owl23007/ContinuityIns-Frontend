<template>
    <div class="category-navigator">
        <div v-if="loading" class="categories-loading">
            <el-skeleton :rows="3" animated />
        </div>
        <el-empty v-else-if="!categories.length" description="暂无分类" />
        <el-tree v-else :data="categories" node-key="categoryId" :props="{
            children: 'children',
            label: 'name'
        }" :default-expanded-keys="defaultExpanded" :expand-on-click-node="false" :highlight-current="true"
            class="category-tree" @node-click="handleCategoryClick">
            <template #default="{ node, data }">
                <div class="tree-node">
                    <span>{{ node.label }}</span>
                    <el-badge v-if="data.count > 0" :value="data.count" class="category-count" />
                </div>
            </template>
        </el-tree>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
    rawCategories: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['select']);

// 处理后的分类树
const categories = ref([]);
// 默认展开的节点ID
const defaultExpanded = computed(() => {
    if (categories.value.length > 0) {
        // 返回所有顶级分类的ID，使所有顶级分类默认展开
        return categories.value.map(cat => cat.categoryId);
    }
    return [];
});

// 将原始分类数据转换为树形结构
const processCategories = (rawData) => {
    console.log('处理分类原始数据类型:', Object.prototype.toString.call(rawData), '长度:', rawData?.length || 0);

    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
        console.warn('没有分类数据，使用默认分类');
        return [
            {
                categoryId: 999,
                name: '所有分类',
                parentId: 0,
                sortOrder: 0,
                description: '所有文章分类',
                count: 0,
                children: []
            }
        ];
    }

    try {
        // 正常处理分类数据
        const categoryMap = {};
        const categoryTree = [];

        // 第一步：创建所有分类的映射
        rawData.forEach(category => {
            if (!category || !category.categoryId) {
                console.warn('发现无效分类项:', category);
                return;
            }

            categoryMap[category.categoryId] = {
                ...category,
                categoryId: category.categoryId,
                name: category.name || '未命名分类',
                parentId: category.parentId || 0,
                sortOrder: category.sortOrder || 0,
                description: category.description || '',
                count: category.articleCount || 0,
                children: []
            };
        });

        // 第二步：构建树形结构
        rawData.forEach(category => {
            if (!category || !category.categoryId) return;

            const categoryWithChildren = categoryMap[category.categoryId];
            if (!categoryWithChildren) return;

            if (category.parentId === 0 || !category.parentId) {
                // 根分类直接添加到结果中
                categoryTree.push(categoryWithChildren);
            } else if (categoryMap[category.parentId]) {
                // 将子分类添加到父分类的children数组
                categoryMap[category.parentId].children.push(categoryWithChildren);
            } else {
                // 找不到父分类的情况，作为顶级分类处理
                categoryTree.push(categoryWithChildren);
            }
        });

        // 第三步：按照sortOrder排序
        const sortCategories = (categories) => {
            categories.sort((a, b) => {
                return (a.sortOrder || 0) - (b.sortOrder || 0);
            });
            categories.forEach(category => {
                if (category.children && category.children.length > 0) {
                    sortCategories(category.children);
                }
            });
        };

        sortCategories(categoryTree);

        // 添加"全部"分类作为第一个选项
        categoryTree.unshift({
            categoryId: 999,
            name: '全部文章',
            parentId: 0,
            sortOrder: -1,
            description: '显示所有文章',
            count: 0,
            children: []
        });

        console.log('成功处理分类数据,共生成', categoryTree.length, '个顶级分类');
        return categoryTree;
    } catch (error) {
        console.error('处理分类数据时出错:', error);
        // 出错时返回默认分类
        return [
            {
                categoryId: 999,
                name: '所有分类',
                parentId: 0,
                sortOrder: 0,
                description: '所有文章分类',
                count: 0,
                children: []
            }
        ];
    }
};

// 处理分类点击
const handleCategoryClick = (data) => {
    if (!data || !data.categoryId) {
        console.error('分类ID不存在', data);
        return;
    }

    console.log('组件内点击分类:', data.name, '分类ID:', data.categoryId);
    emit('select', data);
};

// 监听原始分类数据变化
watch(() => props.rawCategories, (newVal) => {
    console.log('原始分类数据变化, 新数据长度:', newVal?.length || 0);
    if (newVal && Array.isArray(newVal) && newVal.length > 0) {
        categories.value = processCategories(newVal);
    }
}, { immediate: true, deep: true });

onMounted(() => {
    // 初始处理分类数据
    if (props.rawCategories && props.rawCategories.length > 0) {
        console.log('组件挂载时处理分类数据');
        categories.value = processCategories(props.rawCategories);
    }
});
</script>

<style scoped>
.category-navigator {
    width: 100%;
}

.category-tree {
    :deep(.el-tree-node__content) {
        height: 36px;
        margin: 2px 0;
    }

    :deep(.el-tree-node__expand-icon) {
        padding: 8px;
    }

    .tree-node {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding-right: 10px;
    }

    .category-count {
        margin-left: 8px;
    }

    :deep(.el-tree-node:focus > .el-tree-node__content) {
        background-color: var(--el-color-primary-light-9);
    }

    :deep(.el-tree-node__content:hover) {
        background-color: var(--el-color-primary-light-8);
    }
}

.categories-loading {
    padding: 1rem 0;
}
</style>
