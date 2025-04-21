export default [
  {
    path: '/user/:id(\\d+)?', // 使用可选的数字ID参数
    name: 'UserProfile',
    component: () => import('@/views/user/ProfileView.vue'),
    meta: {
      requiresAuth: true,
      title: '个人主页',
    },
  },
  {
    path: '/profile',
    name: 'userinfoPage',
    component: () => import('@/views/user/ProfileView.vue'),
    meta: {
      title: '我的主页',
      requiresAuth: true,
      layout: 'DefaultLayout',
    },
  },
  {
    path: '/user/:id',
    name: 'userProfile',
    component: () => import('@/views/user/ProfileView.vue'),
    props: true,
    meta: {
      title: '用户主页',
      requiresAuth: false,
      layout: 'DefaultLayout',
    },
  },
  {
    path: '/submit',
    name: 'submitContent',
    component: () => import('@/views/content/SubmitView.vue'),
    meta: {
      title: '内容提交',
      requiresAuth: true,
      layout: 'DefaultLayout',
    },
  },
  // 用户设置页面
  {
    path: '/settings',
    name: 'userSettings',
    component: () => import('@/views/user/SettingsView.vue'),
    meta: {
      title: '用户设置',
      requiresAuth: true,
      layout: 'DefaultLayout',
    },
  },
  // 用户收藏页面
  {
    path: '/favorites',
    name: 'userFavorites',
    component: () => import('@/views/user/FavoritesView.vue'),
    meta: {
      title: '我的收藏',
      requiresAuth: true,
      layout: 'DefaultLayout',
    },
  },
  // 用户通知页面
  {
    path: '/notifications',
    name: 'userNotifications',
    component: () => import('@/views/user/NotificationsView.vue'),
    meta: {
      title: '我的通知',
      requiresAuth: true,
      layout: 'DefaultLayout',
    },
  },
]
