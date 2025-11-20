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
  }),
  actions: {
    async login() {
      this.errorMessage = '';
      this.loading = true;
      try {
        await getCsrfCookie();

        const response = await http.post('/login', {
          email: this.email,
          password: this.password,
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
          this.errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
        }
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
