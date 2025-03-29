import { createRouter, createWebHistory } from 'vue-router'

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

// Helper function to check authentication status using localStorage directly
// This avoids circular dependencies with the auth store
function hasValidToken() {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'))
}

router.beforeEach(async (to, from, next) => {
  // Update title
  document.title = to.meta.title ? `${to.meta.title} - 存续院` : '存续院'
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  // If route doesn't require auth, proceed
  if (!requiresAuth) {
    return next()
  }
  
  // If route requires auth, check token
  if (hasValidToken()) {
    // Dynamically import auth store only when needed
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    
    // Initialize auth if not already authenticated
    if (!authStore.isAuthenticated) {
      try {
        await authStore.initializeAuth()
        
        // If authentication failed, redirect to login
        if (!authStore.isAuthenticated) {
          return next({ 
            path: '/auth',
            query: { redirect: to.fullPath }
          })
        }
      } catch (error) {
        console.error('Route guard error:', error)
        return next({ 
          path: '/auth',
          query: { redirect: to.fullPath }
        })
      }
    }
    
    // User authenticated, proceed to route
    return next()
  } else {
    // No token, redirect to login
    return next({ 
      path: '/auth',
      query: { redirect: to.fullPath }
    })
  }
})

export default router