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
  {
    path: '/auth',
    name: 'loginPage',
    component: () => import('../pages/Auth.vue'),
    meta: {
      title: '身份认证',
      requiresAuth: false,
    },
  },

  //验证页面
  {
    path: '/user/active',
    name: 'activeUsers',
    component: () => import('../pages/Active.vue')

  },

  // 首页
  {
    path: '/home',
    name: 'homePage',
    component: homePage,
    meta: {
      title: '首页',
      requiresAuth: false,
    },
  },

  //用户信息
  {
    path: '/userinfo',
    name: 'userinfoPage',
    component: () => import('../pages/UserInfo.vue'),
    meta: {
      title: '用户信息',
      requiresAuth: true,
    },
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

  if (to.matched.some(record => record.meta.requiresAuth && !store.state.isLoggedIn)) {
    // 需要认证的路由，如果用户未登录，重定向到登录页面

    next({ path: '/login' });
  } else {
    // 不需要认证的路由，继续导航
    next();
  }
});

export default router