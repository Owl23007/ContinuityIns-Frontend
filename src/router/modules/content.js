export default [
  {
    path: '/article',
    name: 'article',
    meta: {
      requiresAuth: false,
      layout: 'DefaultLayout'
    },
    children: [
      {
        path: '',
        name: 'articleList',
        component: () => import('@/views/content/ArticleListView.vue'),
        meta: {
          title: '文章列表',
          requiresAuth: false
        }
      },
      {
        path: ':id',
        name: 'articleDetail',
        component: () => import('@/views/content/ArticleDetailView.vue'),
        props: true,
        meta: {
          title: '文章详情',
          requiresAuth: false
        }
      },
      {
        path: 'edit/:id?',
        name: 'articleEdit',
        component: () => import('@/views/content/SubmitView.vue'),
        props: true,
        meta: {
          title: '编辑文章',
          requiresAuth: true
        }
      },
      {
        path: 'create',
        name: 'articleCreate',
        component: () => import('@/views/content/SubmitView.vue'),
        meta: {
          title: '创建文章',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/home',
    name: 'homePage',
    component: () => import('@/views/content/HomeView.vue'),
    meta: {
      title: '首页',
      requiresAuth: false,
      layout: 'DefaultLayout'
    }
  }
]
