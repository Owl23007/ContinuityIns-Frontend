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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...devRoutes, ...auth, ...content, ...user, ...ai, notFoundRoute],
})

function hasValidToken() {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'))
}

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 存续院` : '存续院'

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (!requiresAuth) {
    return next()
  }

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
    return next({
      path: '/auth',
      query: { redirect: to.fullPath },
    })
  }
})

export default router
