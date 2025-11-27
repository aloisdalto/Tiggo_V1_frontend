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
  // Dashboard para CLIENTES (Pedir servicio)
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'cliente' },
  },
  // Vista de Estatus para CLIENTES (Ver y cancelar)
  {
    path: '/services-status',
    name: 'ServicesStatus',
    component: () => import('../views/ServicesStatus.vue'),
    meta: { requiresAuth: true, role: 'cliente' },
  },
  // NUEVO: Dashboard para TÉCNICOS
  {
    path: '/technician-dashboard',
    name: 'TechnicianDashboard',
    component: () => import('../views/TechnicianDashboard.vue'),
    meta: { requiresAuth: true, role: 'tecnico' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token');
  // Recuperamos el usuario del localStorage si existe para saber el rol
  // Nota: Idealmente esto debería venir del store de Pinia, pero localStorage es más rápido para el router
  const user = JSON.parse(localStorage.getItem('user_data') || '{}'); 
  const isAuthenticated = !!token;
  const userRole = user.roles ? user.roles[0]?.name : (user.role || ''); // Ajustar según cómo guardes el rol

  // 1. Rutas que requieren autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth');
    return;
  }

  // 2. Rutas solo para invitados (Login/Register)
  if (to.meta.guestOnly && isAuthenticated) {
    // Redirigir según el rol
    if (userRole === 'tecnico') {
        next('/technician-dashboard');
    } else {
        next('/dashboard');
    }
    return;
  }

  // 3. Protección por Rol Específico
  if (isAuthenticated && to.meta.role) {
      // Si la ruta requiere rol 'cliente' pero soy 'tecnico' -> ir a mi dashboard
      if (to.meta.role === 'cliente' && userRole === 'tecnico') {
          next('/technician-dashboard');
          return;
      }
      // Si la ruta requiere rol 'tecnico' pero soy 'cliente' -> ir a mi dashboard
      if (to.meta.role === 'tecnico' && userRole !== 'tecnico') {
          next('/dashboard');
          return;
      }
  }

  next();
});

export default router;