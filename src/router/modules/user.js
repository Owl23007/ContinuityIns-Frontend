export default [
  {
    path: '/profile',
    name: 'userinfoPage',
    component: () => import('@/views/user/ProfileView.vue'),
    meta: {
      title: '我的主页',
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/submit',
    name: 'submitContent',
    component: () => import('@/views/content/SubmitView.vue'),
    meta: {
      title: '内容提交',
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  }
]
