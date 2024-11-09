import { createRouter, createWebHistory } from 'vue-router';
import homePage from '../pages/Home.vue';
import store from '@/store';

const routes = [
  // 默认路由
  {
    path: '/',
    redirect: '/home',// 设置重定向到 /home
    requiresAuth: false,
  },
  // 登录页面
 
  // 首页
  {
    path: '/home',
    name: 'homePage',
    requiresAuth: false,
    component: homePage,
    meta: {
      title: '首页'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 设置页面标题和路径守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '默认标题';

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 需要认证的路由
    if (!store.state.isLoggedIn) {
      // 如果用户未登录，重定向到登录页面
      next({ path: '/login' });
    } else {
      // 用户已登录，继续导航
      next();
    }
  } else {
    // 不需要认证的路由，继续导航
    next();
  }
});

export default router