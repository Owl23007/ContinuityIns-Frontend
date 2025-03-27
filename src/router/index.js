import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// 导入路由模块
import authRoutes from './modules/auth'
import userRoutes from './modules/user'
import contentRoutes from './modules/content'
import aiRoutes from './modules/ai'

// Development routes
const devRoutes = import.meta.env.DEV ? [
  {
    path: '/@fs/:path(.*)*',
    beforeEnter: (to) => {
      window.location.href = to.fullPath
    }
  }
] : []

// 404路由
const notFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/views/error/NotFoundView.vue'),
  meta: {
    title: '页面未找到',
    requiresAuth: false
  }
}

const routes = [
  ...devRoutes,
  ...authRoutes,
  ...userRoutes,
  ...aiRoutes,
  ...contentRoutes,
  notFoundRoute
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  // 动态标题
  document.title = to.meta.title ? `${to.meta.title} - 存续院` : '存续院'

  // 使用getter获取登录状态
  const isLoggedIn = store.getters.isAuthenticated

  // 认证检查
  if (to.meta.requiresAuth) {
    if (!isLoggedIn) {
      return next({
        name: 'loginPage',
        query: { 
          redirect: to.fullPath,
          reason: 'unauthorized'
        }
      })
    }
    // 已登录检查路由权限
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