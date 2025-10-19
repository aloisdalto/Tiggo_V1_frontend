import { defineStore } from 'pinia';
import http from '../../../plugins/http';
import router from '../../../router';

export const useRegisterStore = defineStore('register', {
  state: () => ({
    name: '',
    email: '',
    password: '',
    password_confirmation: '', 
    role: 'cliente',
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
        const response = await http.post('/api/register', {
          name: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.password, 
          role: this.role,
        });
        this.token = response.data.token;
        this.user = response.data.user;

        localStorage.setItem('auth_token', this.token);
        router.push('/dashboard');
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error al registrar usuario';
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
      this.errorMessage = '';
    },
  },
  persist: true,
});
