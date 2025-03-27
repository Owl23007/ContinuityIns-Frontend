import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import auth from './modules/auth'
import content from './modules/content'
import user from './modules/user'
import ai from './modules/ai'

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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...devRoutes,
    ...auth,
    ...content,
    ...user,
    ...ai,
    notFoundRoute
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // 动态标题
  document.title = to.meta.title ? `${to.meta.title} - 存续院` : '存续院'

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ 
      path: '/auth',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router