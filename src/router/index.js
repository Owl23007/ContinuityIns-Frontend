import { createRouter, createWebHistory } from 'vue-router'

import auth from './modules/auth'
import content from './modules/content'
import user from './modules/user'
import ai from './modules/ai'
import { useAuthStore } from '@/stores/auth'

// Development routes
const devRoutes = import.meta.env.DEV
  ? [
      {
        path: '/@fs/:path(.*)*',
        beforeEnter: (to) => {
          window.location.href = to.fullPath
        },
      },
    ]
  : []

// 404路由
const notFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/views/error/NotFoundView.vue'),
  meta: {
    title: '页面未找到',
    requiresAuth: false,
  },
}

// 搜索页面路由
const searchRoute = {
  path: '/search',
  name: 'Search',
  component: () => import('@/views/search/SearchView.vue'),
  meta: {
    title: '内容搜索 - 存续院',
  },
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...devRoutes, ...auth, ...content, ...user, ...ai, searchRoute, notFoundRoute],
})

function hasValidToken() {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'))
}

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 存续院` : '存续院'

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  
  // 如果页面不需要认证，直接放行
  if (!requiresAuth) {
    return next()
  }

  // 只有需要认证的页面才检查登录状态
  if (hasValidToken()) {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      try {
        await authStore.initializeAuth()

        if (!authStore.isAuthenticated) {
          return next({
            path: '/auth',
            query: { redirect: to.fullPath },
          })
        }
      } catch (error) {
        console.error('Route guard error:', error)
        return next({
          path: '/auth',
          query: { redirect: to.fullPath },
        })
      }
    }

    return next()
  } else {
    // 没有token且需要认证时才重定向到登录页
    return next({
      path: '/auth',
      query: { redirect: to.fullPath },
    })
  }
})

export default router
