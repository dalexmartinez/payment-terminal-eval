import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
    { path: '/operador', name: 'operador', component: () => import('../views/OperadorView.vue'), meta: { role: 'Operador' } },
    { path: '/supervisor', name: 'supervisor', component: () => import('../views/SupervisorView.vue'), meta: { role: 'Supervisor' } },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    // Si ya hay sesión activa, no tiene sentido volver a mostrar el login
    if (to.name === 'login' && auth.isAuthenticated) {
      return auth.role === 'Supervisor' ? '/supervisor' : '/operador'
    }
    return true
  }

  if (!auth.isAuthenticated) {
    return '/login'
  }

  if (to.meta.role && to.meta.role !== auth.role) {
    // El rol no coincide con la vista solicitada: lo manda a su propia vista
    return auth.role === 'Supervisor' ? '/supervisor' : '/operador'
  }

  return true
})

export default router
