import { defineStore } from 'pinia';
import http from '../../../plugins/http';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [],
    services: [], 
    stats: null,
    recentRequests: [],
    loading: false,
    errorMessage: '',
  }),
  actions: {
    async fetchDashboardData() {
      this.loading = true;
      this.errorMessage = '';
      try {
        const reportRes = await http.get('/admin/reports');
        this.stats = reportRes.data.stats;
        this.recentRequests = reportRes.data.recent_requests;

        const usersRes = await http.get('/admin/users');
        this.users = usersRes.data;

        const servicesRes = await http.get('/services');
        this.services = servicesRes.data;

      } catch (error) {
        console.error("Error admin:", error);
        this.errorMessage = 'Error al cargar datos del administrador.';
      } finally {
        this.loading = false;
      }
    },

    async createNewService(name, description) {
        try {
            await http.post('/admin/services', { name, description });
            this.fetchDashboardData(); 
            return true;
        } catch (error) {
            this.errorMessage = error.response?.data?.message || 'Error al crear servicio';
            return false;
        }
    },

    async updateService(id, name, description) {
        try {
            await http.put(`/admin/services/${id}`, { name, description });
            const index = this.services.findIndex(s => s.id === id);
            if (index !== -1) {
                this.services[index] = { ...this.services[index], name, description };
            }
            return true;
        } catch (error) {
            this.errorMessage = error.response?.data?.message || 'Error al actualizar servicio';
            return false;
        }
    }
  },
});