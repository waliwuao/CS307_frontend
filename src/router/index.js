import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: () => import('@/views/RecipeDetail.vue'),
    // 移除 requiresAuth，允许游客浏览
  },
  {
    path: '/profile/:id?',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    // 移除 requiresAuth，允许查看他人主页
  },
  {
    path: '/create',
    name: 'CreateRecipe',
    component: () => import('@/views/CreateRecipe.vue'),
    meta: { requiresAuth: true } // 创建食谱仍需登录
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // 1. 仅针对明确标记需要认证的路由进行拦截
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } 
  else {
    // 2. 优化返回体验：如果从详情页返回首页，且信封动画还在播放，稍微等待一下
    // 这里的 authStore.recipeDetailComponentState 需要在组件中配合设置
    if (from?.name === 'RecipeDetail' && to.name === 'Home' && authStore.recipeDetailComponentState?.showEnvelope) {
      setTimeout(() => {
        next();
      }, 800);
    } else {
      next();
    }
  }
});

export default router;