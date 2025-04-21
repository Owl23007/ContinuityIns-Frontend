export default [
  {
    path: '/chat',
    name: 'chatPage',
    component: () => import('@/views/chat/ChatView.vue'),
    meta: {
      title: '聊天',
      requiresAuth: false,
      layout: 'DefaultLayout',
    },
  },
]
