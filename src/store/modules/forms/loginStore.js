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
    verifying: false, // Nuevo estado para feedback visual
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
      
        // --- FASE DE VERIFICACIÓN ---
        this.verifying = true;
        // Retraso para feedback visual consistente con el registro
        await new Promise(resolve => setTimeout(resolve, 1500));

        this.token = response.data.access_token;
        const userData = response.data.user;
        
        // LÓGICA DE DETECCIÓN DE ROL
        // Verificamos si el backend devolvió el perfil técnico
        const hasTechProfile = userData.technician_profile || userData.technicianProfile;
        
        const detectedRole = hasTechProfile ? 'tecnico' : 'cliente';
        userData.role = detectedRole; 
        
        this.user = userData;
        
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('user_data', JSON.stringify(this.user));

        // REDIRECCIÓN
        if (detectedRole === 'tecnico') {
            router.push('/technician-dashboard');
        } else {
            router.push('/dashboard');
        }

      } catch (error) {
        if (error.response && error.response.data && error.response.data.errors) {
            const errors = error.response.data.errors;
            const errorMessages = Object.values(errors).flat(); 
            this.errorMessage = errorMessages.join(' ');
        } else {
            this.errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
        }
      } finally {
        this.loading = false;
        this.verifying = false;
      }
    },

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