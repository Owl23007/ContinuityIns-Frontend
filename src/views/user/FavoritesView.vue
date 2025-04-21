#!js
<template>
  <div class="favorites-container">
    <div class="favorites-header">
      <h1>我的收藏</h1>
      <div class="favorites-filter">
        <el-select v-model="filter" placeholder="筛选">
          <el-option label="全部" value="all" />
          <el-option label="最近收藏" value="recent" />
          <el-option label="最多点赞" value="most_liked" />
        </el-select>
      </div>
    </div>

    <div class="favorites-content">
      <el-empty v-if="!favorites.length" description="暂无收藏内容" />

      <div v-else class="favorites-grid">
        <div
          v-for="article in favorites"
          :key="article.id"
          class="favorite-item"
        >
          <article-card-cover-only
            :article="article"
            @remove="removeFavorite"
          />
        </div>
      </div>

      <!-- 分页器 -->
      <div class="pagination-container" v-if="favorites.length">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 36]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ArticleCardCoverOnly from "../user/components/card/article-card-cover-only.vue";
import { ElMessageBox, ElMessage } from "element-plus";

// 状态管理
const filter = ref("all");
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const favorites = ref([]);
const loading = ref(false);

// 获取收藏列表
const fetchFavorites = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    // TODO: 调用获取收藏列表API
    // const res = await getFavorites({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   filter: filter.value
    // })
    // favorites.value = res.data.list
    // total.value = res.data.total

    // 模拟数据
    favorites.value = [];
    total.value = 0;
  } catch (error) {
    ElMessage.error("获取收藏列表失败");
  } finally {
    loading.value = false;
  }
};

// 移除收藏
const removeFavorite = async (articleId) => {
  try {
    await ElMessageBox.confirm("确定要取消收藏该文章吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    // TODO: 调用取消收藏API
    // await removeFavoriteApi(articleId)

    ElMessage.success("已取消收藏");
    fetchFavorites();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("操作失败，请重试");
    }
  }
};

// 分页处理
const handleSizeChange = () => {
  currentPage.value = 1;
  fetchFavorites();
};

const handleCurrentChange = () => {
  fetchFavorites();
};

// 监听筛选条件变化
watch(filter, () => {
  currentPage.value = 1;
  fetchFavorites();
});

onMounted(() => {
  fetchFavorites();
});
</script>

<style scoped>
.favorites-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.favorite-item {
  transition: transform 0.3s ease;
}

.favorite-item:hover {
  transform: translateY(-4px);
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .favorites-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
}
</style>
