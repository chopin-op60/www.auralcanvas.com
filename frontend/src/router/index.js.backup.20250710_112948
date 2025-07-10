import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('@/views/home/index.vue'),
      meta: { title: '首页' }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { title: '登录', hideForAuth: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/Register.vue'),
      meta: { title: '注册', hideForAuth: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/profile/index.vue'),
      meta: { title: '个人资料', requiresAuth: true }
    },
    {
      path: '/post/create',
      name: 'CreatePost',
      component: () => import('@/views/post/Create.vue'),
      meta: { title: '创建帖子', requiresAuth: true }
    },
    {
      path: '/post/:id',
      name: 'PostDetail',
      component: () => import('@/views/post/Detail.vue'),
      meta: { title: '帖子详情' }
    },
    {
      path: '/user/:id',
      name: 'UserProfile',
      component: () => import('@/views/profile/User.vue'),
      meta: { title: '用户主页' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/error/404.vue'),
      meta: { title: '页面不存在' }
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - AuralCanvas` : 'AuralCanvas'
  
  // 如果已登录用户访问登录/注册页面，重定向到首页
  if (to.meta.hideForAuth && userStore.isLoggedIn) {
    next('/home')
    return
  }
  
  // 需要登录的页面
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      next(`/login?redirect=${to.fullPath}`)
      return
    }
    
    // 验证token有效性
    const isValid = await userStore.validateToken()
    if (!isValid) {
      ElMessage.error('登录已过期，请重新登录')
      next(`/login?redirect=${to.fullPath}`)
      return
    }
  }
  
  next()
})

export default router
