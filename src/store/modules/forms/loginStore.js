import { defineStore } from 'pinia';
import http from '../../../plugins/http';
import router from '../../../router';

export const useLoginStore = defineStore('login', {
  state: () => ({
    email: '',
    password: '',
    token: null,
    user: null,
    errorMessage: '',
    loading: false,
  }),
  actions: {
    async login() {
      this.errorMessage = '';
      this.loading = true;
      try {
        const response = await http.post('/api/login', {
          email: this.email,
          password: this.password,
        });
        this.token = response.data.token;
        this.user = response.data.user;

        localStorage.setItem('auth_token', this.token); // para interceptor axios
        router.push('/dashboard');
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      this.email = '';
      this.password = '';
      localStorage.removeItem('auth_token');
      router.push('/auth');
    },
    clear() {
      this.email = '';
      this.password = '';
      this.errorMessage = '';
    },
  },
  persist: true,
});
