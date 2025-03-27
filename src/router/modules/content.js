export default [
  {
    path: '/home',
    name: 'homePage',
    component: () => import('@/views/content/HomeView.vue'),
    meta: {
      title: '首页',
      requiresAuth: false,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/articlelist',
    name: 'articleList',
    component: () => import('@/views/content/ArticleListView.vue'),
    meta: {
      title: '文章列表',
      requiresAuth: false,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/article/:id',
    name: 'articleDetail',
    component: () => import('@/views/content/ArticleDetailView.vue'),
    props: true,
    meta: {
      title: '文章详情',
      requiresAuth: false,
      layout: 'DefaultLayout'
    }
  }
]
