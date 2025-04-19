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
  },
  // 社区/论坛相关路由
  {
    path: '/community',
    name: 'community',
    component: () => import('@/views/community/CommunityView.vue'),
    meta: {
      title: '社区',
      requiresAuth: false,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/community/topic/:id',
    name: 'topicDetail',
    component: () => import('@/views/community/TopicDetailView.vue'),
    props: true,
    meta: {
      title: '话题详情',
      requiresAuth: false,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/community/new',
    name: 'createTopic',
    component: () => import('@/views/community/NewTopicView.vue'),
    meta: {
      title: '发布话题',
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  // 高级搜索页面
  {
    path: '/search',
    name: 'advancedSearch',
    component: () => import('@/views/search/SearchView.vue'),
    meta: {
      title: '高级搜索',
      requiresAuth: false,
      layout: 'DefaultLayout'
    }
  }
]
