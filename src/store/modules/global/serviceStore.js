import { defineStore } from 'pinia';
import http from '../../../plugins/http';

export const useServiceStore = defineStore('service', {
  state: () => ({
    services: [],
    selectedServiceId: null,
    clientLocation: null,
    address: '',
    technicians: [],
    loading: false,
    errorMessage: '',
    assignedService: null,
    assignedTechnician: null,
    /**
     * Almacenará la lista de todas las solicitudes
     * del usuario (sea cliente o técnico).
     */
    myRequests: [], 
  }),
  actions: {
    // --- ACCIONES ORIGINALES ---
    async fetchServices() {
      try {
        const res = await http.get('/services');
        this.services = res.data;
      } catch (error) {
        this.errorMessage = 'Error cargando servicios';
      }
    },
    setLocation(lat, lng) {
      this.clientLocation = { lat, lng };
    },
    setAddress(addr) {
      this.address = addr;
    },
    setSelectedService(id) {
      this.selectedServiceId = id;
    },
    async findTechnicians() {
      if (!this.clientLocation || !this.selectedServiceId) {
        this.errorMessage = 'Por favor selecciona servicio y ubicación';
        return;
      }
      this.loading = true;
      this.errorMessage = '';
      try {
        const res = await http.get('/technicians', {
          params: {
            service_id: this.selectedServiceId,
            latitude: this.clientLocation.lat,
            longitude: this.clientLocation.lng,
            radius: 10,
          },
        });
        this.technicians = res.data;
      } catch (error) {
        this.errorMessage = 'Error buscando técnicos';
      } finally {
        this.loading = false;
      }
    },      
    async createServiceRequest() {
      if (!this.clientLocation || !this.selectedServiceId || !this.address) {
        this.errorMessage = 'Completa todos los campos';
        return false;
      }
      this.loading = true;
      this.errorMessage = '';
      try {    
        const res = await http.post('/service-requests', {
          service_id: this.selectedServiceId,
          client_latitude: this.clientLocation.lat,
          client_longitude: this.clientLocation.lng,
          comments: this.address,
        });
        this.myRequests = [];
        return res.data;
      } catch (error) {
        this.errorMessage = 'Error creando solicitud';
        return false;
      } finally {
        this.loading = false;
      }
    },
    clear() {
      this.selectedServiceId = null;
      this.clientLocation = null;
      this.address = '';
      this.technicians = [];
      this.errorMessage = '';
      this.loading = false;
    },

    async fetchMyRequests() {
      this.loading = true;
      this.errorMessage = '';
      try {
        const res = await http.get('/service-requests');
        this.myRequests = res.data;
      } catch (error) {
        this.errorMessage = 'Error al cargar tus solicitudes.';
      } finally {
        this.loading = false;
      }
    },

    async updateRequestStatus(requestId, newStatus, comment = null) {
      this.loading = true;
      this.errorMessage = '';
      try {
        //await getCsrfCookie();
        
        const payload = { status: newStatus };
        if (comment) {
            payload.comment = comment;
        }
        
        const res = await http.patch(`/service-requests/${requestId}/status`, payload);
        
        // Actualizar la lista localmente
        const index = this.myRequests.findIndex(req => req.id === requestId);
        if (index !== -1) {
          this.myRequests[index] = res.data.serviceRequest; // Usar la respuesta del backend
        }
      } catch (error) {
        this.errorMessage = 'Error al actualizar el estado.';
      } finally {
        this.loading = false;
      }
    },

    async submitRating(payload) {
      this.loading = true;
      this.errorMessage = '';
      try {
        const res = await http.post('/ratings', {
          service_request_id: payload.service_request_id,
          score: payload.score,
          comment: payload.comment,
        });
        const index = this.myRequests.findIndex(req => req.id === payload.service_request_id);
        if (index !== -1) {
          this.myRequests[index].rating = res.data;
        }
        return true;
      } catch (error) {
        this.errorMessage = 'Error al enviar la calificación.';
        return false;
      } finally {
        this.loading = false;
      }
    }
  },
  persist: true,
});