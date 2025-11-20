<template>
  <div class="service-status-container">
    <h2>Mis Solicitudes de Servicio</h2>

    <div v-if="serviceStore.loading && serviceStore.myRequests.length === 0" class="loading">
      <p>Cargando solicitudes...</p>
    </div>
    <div v-else-if="serviceStore.errorMessage" class="error">
      <p>{{ serviceStore.errorMessage }}</p>
    </div>
    <div v-else-if="serviceStore.myRequests.length === 0" class="empty-state">
      <p>No tienes solicitudes de servicio activas o pasadas.</p>
      <button @click="goToDashboard">Solicitar un servicio</button>
    </div>

    <!-- Lista de todas las solicitudes -->
    <div v-else class="requests-list">
      <div v-for="request in serviceStore.myRequests" :key="request.id" class="request-card">
        <!-- BLINDAJE 1: Usar ?. para evitar error si service es nulo -->
        <h3>{{ request.service?.name || 'Servicio no disponible' }}</h3>
        
        <span class="status-badge" :class="request.status">{{ formatStatus(request.status) }}</span>
        
        <!-- Info para Cliente -->
        <p v-if="isClient(request)">
          <!-- CORRECCIÓN CRÍTICA: request.technician.name (sin .user) -->
          <strong>Técnico:</strong> {{ request.technician ? request.technician.name : 'Buscando técnico...' }}
        </p>
        <!-- Info para Técnico -->
        <p v-if="isTechnician(request)">
          <!-- BLINDAJE 2: Usar ?. -->
          <strong>Cliente:</strong> {{ request.client?.name || 'Cliente' }}
        </p>

        <p><strong>Fecha:</strong> {{ request.created_at ? new Date(request.created_at).toLocaleDateString() : '' }}</p>

        <!-- ACCIONES PARA EL TÉCNICO -->
        <div v-if="isTechnician(request)" class="technician-actions">
          <button 
            v-if="request.status === 'asignado'" 
            @click="updateStatus(request.id, 'en_progreso')" 
            class="btn-primary">
            Iniciar Trabajo
          </button>
          <button 
            v-if="request.status === 'en_progreso'" 
            @click="updateStatus(request.id, 'completado')" 
            class="btn-success">
            Marcar como Completado
          </button>
        </div>

        <!-- ACCIONES PARA EL CLIENTE -->
        <div v-if="isClient(request)" class="client-actions">
          <button 
            v-if="request.status === 'completado' && !request.rating" 
            @click="openRatingModal(request)" 
            class="btn-primary">
            Calificar Servicio
          </button>
          
          <div v-if="request.rating" class="rating-display">
            <strong>Tu Calificación:</strong> {{ request.rating.score }} estrellas
            <p>"{{ request.rating.comment }}"</p>
          </div>

          <button 
            v-if="['pendiente','asignado'].includes(request.status)"
            @click="cancelRequest(request)" 
            class="btn-danger">
            Cancelar Solicitud
          </button>
        </div>

      </div>
    </div>

    <!-- Modal de Calificación -->
    <div v-if="showRatingModal" class="modal-overlay" @click.self="closeRatingModal">
      <div class="modal-content">
        <h4>Calificar Servicio: {{ selectedRequest?.service?.name }}</h4>
        <label>Puntaje (1-5):</label>
        <select v-model.number="ratingData.score">
          <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
        </select>
        <label>Comentario:</label>
        <textarea v-model="ratingData.comment" placeholder="Describe tu experiencia..."></textarea>
        <div class="modal-actions">
          <button @click="closeRatingModal" class="btn-secondary">Cerrar</button>
          <button @click="handleRatingSubmit" class="btn-primary">Enviar Calificación</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useServiceStore } from '../store/modules/global/serviceStore';
import { useLoginStore } from '../store/modules/forms/loginStore';
import { useRouter } from 'vue-router';

const serviceStore = useServiceStore();
const loginStore = useLoginStore();
const router = useRouter();

const showRatingModal = ref(false);
const selectedRequest = ref(null);
const ratingData = ref({ score: 5, comment: '' });

const userId = computed(() => loginStore.user?.id);

const isClient = (request) => request.cliente_id === userId.value;
const isTechnician = (request) => request.tecnico_id === userId.value;

const formatStatus = (status) => {
  if (!status) return '';
  const map = {
    'pendiente': 'Pendiente',
    'asignado': 'Asignado',
    'en_progreso': 'En Progreso',
    'completado': 'Completado',
    'cancelado': 'Cancelado',
  };
  return map[status] || status;
};

onMounted(() => {
  serviceStore.fetchMyRequests();
});

const goToDashboard = () => router.push('/dashboard');

const updateStatus = (requestId, newStatus) => {
  serviceStore.updateRequestStatus(requestId, newStatus);
};

const cancelRequest = async (request) => {
  if (confirm('¿Estás seguro de que quieres cancelar esta solicitud?')) {
    serviceStore.updateRequestStatus(request.id, 'cancelado');
  }
};

const openRatingModal = (request) => {
  selectedRequest.value = request;
  ratingData.value = { score: 5, comment: '' };
  showRatingModal.value = true;
};

const closeRatingModal = () => {
  showRatingModal.value = false;
  selectedRequest.value = null;
};

const handleRatingSubmit = async () => {
  const payload = {
    service_request_id: selectedRequest.value.id,
    ...ratingData.value,
  };
  const success = await serviceStore.submitRating(payload);
  if (success) {
    closeRatingModal();
  }
};
</script>

<style scoped>
.service-status-container { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
.loading, .empty-state, .error { text-align: center; padding: 2rem; background-color: #f9f9f9; border-radius: 8px; }
.error { color: #dc3545; }
.requests-list { display: flex; flex-direction: column; gap: 1.5rem; }
.request-card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); position: relative; }
.request-card h3 { margin-top: 0; color: #ff740f; }
.status-badge { position: absolute; top: 1.5rem; right: 1.5rem; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold; color: white; }
.status-badge.asignado, .status-badge.en_progreso { background-color: #007bff; }
.status-badge.completado { background-color: #28a745; }
.status-badge.cancelado { background-color: #6c757d; }
.status-badge.pendiente { background-color: #ffc107; color: #333; }
.technician-actions, .client-actions { margin-top: 1rem; border-top: 1px solid #f0f0f0; padding-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
button { padding: 0.5rem 1rem; border: none; border-radius: 5px; cursor: pointer; font-weight: 500; }
.btn-primary { background-color: #ff740f; color: white; }
.btn-success { background-color: #28a745; color: white; }
.btn-danger { background-color: #dc3545; color: white; }
.btn-secondary { background-color: #6c757d; color: white; }
.rating-display { margin-top: 1rem; background-color: #f8f9fa; padding: 0.5rem 1rem; border-radius: 5px; font-size: 0.9rem; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; }
.modal-content label { display: block; margin-top: 1rem; }
.modal-content select, .modal-content textarea { width: 100%; padding: 0.5rem; margin-top: 0.25rem; }
.modal-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem; }
</style>