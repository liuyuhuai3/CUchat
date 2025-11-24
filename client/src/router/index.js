 import { createRouter, createWebHistory } from 'vue-router';
 import { useUserStore } from '@/stores/user';

  const routes = [
    {
      path: '/',
      redirect: '/login'  // 默认跳转到登录页
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue')
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('../views/Chat.vue'),
      meta: { requiresAuth: true }  // 需要登录才能访问
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Profile.vue'),
      meta: { 
        requiresAuth: true,
        title: "个人资料"
      }
    }
  ];

  const router = createRouter({
    history: createWebHistory(),
    routes
  });

  // 路由守卫：检查是否需要登录
  router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');

    if (to.meta.requiresAuth && !token) {
      next('/login');  // 未登录，跳转到登录页
    } else {
      next();
    }
  });

  export default router;