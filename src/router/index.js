import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/HomeLanding.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/Auth.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('auth_token');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth');
  } else if (to.meta.guestOnly && isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
