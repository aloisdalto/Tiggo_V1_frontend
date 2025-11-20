import { defineStore } from 'pinia';
import http from '../../../plugins/http';
import { getCsrfCookie } from '../../../plugins/http';
import router from '../../../router';

export const useRegisterStore = defineStore('register', {
  state: () => ({
    name: '',
    email: '',
    password: '',
    password_confirmation: '', 
    role: 'cliente',
    phone: '',
    latitude: '', // Se mantiene, pero se llenará automáticamente
    longitude: '', // Se mantiene, pero se llenará automáticamente
    address: '', // <-- NUEVO: Para el campo de texto de dirección
    description: '', 
    service_id: null,
    token: null,
    user: null,
    errorMessage: '',
    loading: false,
  }),
  actions: {
    async register() {
      this.errorMessage = '';
      this.loading = true;
      try {
        await getCsrfCookie();
    
        const response = await http.post('/register', {
          name: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation,
          role: this.role,
          phone: this.phone,
          // Aseguramos que se envíen los valores correctos
          latitude: this.latitude === '' ? null : this.latitude,
          longitude: this.longitude === '' ? null : this.longitude,
          description: this.description,
          service_id: this.service_id,
        });

        this.token = response.data.access_token;
        this.user = response.data.user;
    
        localStorage.setItem('auth_token', this.token);
        router.push('/dashboard');
      } catch (error) {
        if (error.response && error.response.data && error.response.data.errors) {
            const errors = error.response.data.errors;
            const errorMessages = Object.values(errors).flat(); 
            this.errorMessage = errorMessages.join(' ');
        } else {
            this.errorMessage = error.response?.data?.message || 'Error al registrar usuario';
        }
      } finally {
        this.loading = false;
      }
    },
    clear() {
      this.name = '';
      this.email = '';
      this.password = '';
      this.password_confirmation = ''; 
      this.role = 'cliente';
      this.phone = '';
      this.latitude = '';
      this.longitude = '';
      this.address = ''; // <-- NUEVO: Limpiar dirección
      this.description = '';
      this.service_id = null;
      this.errorMessage = '';
    },
  },
  persist: true,
});