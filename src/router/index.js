import { createRouter, createWebHistory } from 'vue-router'
import homePage from '../pages/Home.vue'
import store from '../store'

// 开发环境专用路由
const devRoutes = import.meta.env.DEV ? [
  // 1. 静态资源白名单
  {
    path: '/@fs/:path(.*)*', // 使用 * 匹配多级路径
    beforeEnter: (to) => {
      // 直接跳转避免被后续路由拦截
      window.location.href = to.fullPath
    }
  }
] : []

const routes = [
  ...devRoutes, // 展开开发环境路由
  
  // 2. 默认路由
  {
    path: '/',
    redirect: { name: 'homePage' }, // 使用命名路由更安全
    meta: { requiresAuth: false }
  },

  // 3. 登录页
  {
    path: '/auth',
    name: 'loginPage',
    component: () => import('../pages/Auth.vue'),
    meta: {
      title: '身份认证',
      requiresAuth: false
    }
  },

  // 4. 用户激活
  {
    path: '/user/active',
    name: 'activeUsers',
    component: () => import('../pages/Active.vue'),
    meta: {
      title: '用户激活',
      requiresAuth: false
    }
  },

  // 5. 首页
  {
    path: '/home',
    name: 'homePage',
    component: homePage,
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },

  // 6. 用户信息
  {
    path: '/userinfo',
    name: 'userinfoPage',
    component: () => import('../pages/UserInfo.vue'),
    meta: {
      title: '用户信息',
      requiresAuth: true
    }
  },

  // 7. 投稿页
  {
    path: '/submit',
    name: 'submitPage',
    component: () => import('../pages/Submit.vue'),
    meta: {
      title: '投稿',
      requiresAuth: true
    }
  },

  // 8. 404 页面（调整匹配规则）
  {
    path: '/:pathMatch(.*)*', 
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
    meta: {
      title: '页面不存在'
    },
    beforeEnter: (to) => {
      // 排除静态资源请求
      if (to.path.startsWith('/@fs/')) {
        return false // 终止导航
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 增强滚动行为
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  // 动态标题
  document.title = to.meta.title ? `${to.meta.title} - 存续院` : '存续院'

  // 状态检查（建议使用getter）
  const isLoggedIn = store.state.token

  // 认证检查
  if (to.meta.requiresAuth) {
    if (!isLoggedIn) {
      return next({
        name: 'loginPage', // 使用命名路由
        query: { 
          redirect: to.fullPath,
          reason: 'unauthorized'
        }
      })
    }
    // 已登录检查路由权限（示例）
    if (to.meta.requiredRole && !store.getters.hasRole(to.meta.requiredRole)) {
      return next({ name: 'Forbidden' })
    }
  }

  // 已登录访问登录页重定向
  if (to.name === 'loginPage' && isLoggedIn) {
    return next({ name: 'homePage' })
  }

  next()
})

export default router