import { defineStore } from 'pinia';
import http from '../../../plugins/http';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [],
    services: [], // Array para la lista de servicios
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
        // 1. Cargar Reportes y Estadísticas
        const reportRes = await http.get('/admin/reports');
        this.stats = reportRes.data.stats;
        this.recentRequests = reportRes.data.recent_requests;

        // 2. Cargar Usuarios
        const usersRes = await http.get('/admin/users');
        this.users = usersRes.data;

        // 3. Cargar Servicios (Reutilizamos el endpoint público existente)
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
            // Recargar datos para ver el nuevo servicio en la lista
            this.fetchDashboardData(); 
            return true;
        } catch (error) {
            this.errorMessage = error.response?.data?.message || 'Error al crear servicio';
            return false;
        }
    },

    // --- NUEVA ACCIÓN PARA EDITAR ---
    async updateService(id, name, description) {
        try {
            await http.put(`/admin/services/${id}`, { name, description });
            // Actualizamos la lista localmente para no recargar todo
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