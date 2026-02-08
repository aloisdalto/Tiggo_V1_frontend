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
    latitude: '', 
    longitude: '', 
    address: '', 
    description: '', 
    service_id: null,
    token: null,
    user: null,
    errorMessage: '',
    loading: false,
    verifying: false, 
  }),
  actions: {
    async register() {
      this.errorMessage = '';
      this.loading = true;
      this.verifying = false;
      try {
        //await getCsrfCookie();
    
        const response = await http.post('/register', {
          name: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation,
          role: this.role, 
          phone: this.phone,
          latitude: this.latitude === '' ? null : this.latitude,
          longitude: this.longitude === '' ? null : this.longitude,
          description: this.description,
          service_id: this.service_id,
        });

        this.verifying = true;
        await new Promise(resolve => setTimeout(resolve, 1500));

        this.token = response.data.access_token;
        const userData = response.data.user;
        const hasTechProfile = userData.technician_profile || userData.technicianProfile;
        const confirmedRole = hasTechProfile ? 'tecnico' : 'cliente';
        userData.role = confirmedRole; 

        this.user = userData;
    
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('user_data', JSON.stringify(this.user));
        
        if (confirmedRole === 'tecnico') {
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
            this.errorMessage = error.response?.data?.message || 'Error al registrar usuario';
        }
      } finally {
        this.loading = false;
        this.verifying = false;
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
      this.address = ''; 
      this.description = '';
      this.service_id = null;
      this.errorMessage = '';
      this.verifying = false;
    },
  },
  persist: true,
});