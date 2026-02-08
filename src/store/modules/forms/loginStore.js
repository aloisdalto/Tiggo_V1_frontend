import { defineStore } from 'pinia';
import http from '../../../plugins/http';
import { getCsrfCookie } from '../../../plugins/http';
import router from '../../../router';

export const useLoginStore = defineStore('login', {
  state: () => ({
    email: '',
    password: '',
    token: null,
    user: null,
    errorMessage: '',
    loading: false,
    verifying: false,
  }),
  actions: {
    async login() {
      this.errorMessage = '';
      this.loading = true;
      this.verifying = false;
      try {
        await getCsrfCookie();
        const response = await http.post('/login', {
          email: this.email,
          password: this.password,
        });
      
        this.verifying = true;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pequeño delay estético

        this.token = response.data.access_token;
        const userData = response.data.user;
        
        // --- LÓGICA DE ROLES MEJORADA ---
        let detectedRole = 'cliente'; // Default

        // 1. Verificar Admin (Prioridad Máxima)
        // Buscamos el flag 'is_admin' que agregamos en el backend O buscamos en el array de roles
        const isAdmin = userData.is_admin || (userData.roles && userData.roles.some(r => r.name === 'admin'));

        // 2. Verificar Técnico
        const isTechnician = userData.technician_profile || userData.technicianProfile;

        if (isAdmin) {
            detectedRole = 'admin';
        } else if (isTechnician) {
            detectedRole = 'tecnico';
        }
        
        // Inyectamos el rol final en el objeto usuario para el router
        userData.role = detectedRole; 
        
        this.user = userData;
        
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('user_data', JSON.stringify(this.user));

        // --- REDIRECCIÓN ---
        if (detectedRole === 'admin') {
            console.log("Redirigiendo a Admin Dashboard...");
            router.push('/admin-dashboard');
        } else if (detectedRole === 'tecnico') {
            router.push('/technician-dashboard');
        } else {
            router.push('/dashboard');
        }

      } catch (error) {
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            this.errorMessage = Object.values(errors).flat().join(' ');
        } else {
            this.errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
        }
      } finally {
        this.loading = false;
        this.verifying = false;
      }
    },
    // ... resto de métodos (logout, clear) igual ...
    logout() {
      this.token = null;
      this.user = null;
      this.email = '';
      this.password = '';
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data'); 
      router.push('/auth');
    },
    clear() {
      this.email = '';
      this.password = '';
      this.errorMessage = '';
      this.verifying = false;
    },
  },
  persist: true,
});