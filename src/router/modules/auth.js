export default [
  {
    path: '/',
    redirect: { name: 'homePage' },
    meta: { requiresAuth: false }
  },
  {
    path: '/auth',
    name: 'loginPage',
    component: () => import('../../views/auth/LoginView.vue'),
    meta: {
      title: '身份认证',
      requiresAuth: false,
      layout: 'AuthLayout'
    }
  },
  {
    path: '/auth/active',
    name: 'activeUsers',
    component: () => import('../../views/auth/ActiveView.vue'),
    meta: {
      title: '用户激活',
      requiresAuth: false,
      layout: 'AuthLayout'
    }
  },
  {
    path: '/auth/reset',
    name: 'resetPassword',
    component: () => import('../../views/auth/ResetPasswordView.vue'),
    meta: {
      title: '重置密码',
      requiresAuth: false,
      layout: 'AuthLayout'
    }
  }
]
