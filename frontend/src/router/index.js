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
      meta: { title: 'Home' }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { title: 'Sign In', hideForAuth: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/Register.vue'),
      meta: { title: 'Sign Up', hideForAuth: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/profile/index.vue'),
      meta: { title: 'Profile', requiresAuth: true }
    },
    {
      path: '/post/create',
      name: 'CreatePost',
      component: () => import('@/views/post/Create.vue'),
      meta: { title: 'Create Post', requiresAuth: true }
    },
    {
      path: '/post/:id',
      name: 'PostDetail',
      component: () => import('@/views/post/Detail.vue'),
      meta: { title: 'Post Details' }
    },
    {
      path: '/user/:id',
      name: 'UserProfile',
      component: () => import('@/views/profile/User.vue'),
      meta: { title: 'User Profile' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/error/404.vue'),
      meta: { title: 'Page Not Found' }
    }
  ]
})

// Route guards
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // Set page title
  document.title = to.meta.title ? `${to.meta.title} - AuralCanvas` : 'AuralCanvas'
  
  // If logged in user tries to access login/register pages, redirect to home
  if (to.meta.hideForAuth && userStore.isLoggedIn) {
    next('/home')
    return
  }
  
  // Pages that require authentication
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('Please sign in first')
      next(`/login?redirect=${to.fullPath}`)
      return
    }
    
    // Validate token validity
    const isValid = await userStore.validateToken()
    if (!isValid) {
      ElMessage.error('Session expired, please sign in again')
      next(`/login?redirect=${to.fullPath}`)
      return
    }
  }
  
  next()
})

export default router
