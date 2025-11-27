<template>
  <div class="service-status-container">
    <h2 class="page-title">Mis Solicitudes de Servicio</h2>

    <!-- Estado de Carga -->
    <div v-if="serviceStore.loading && serviceStore.myRequests.length === 0" class="state-message">
      <div class="spinner"></div>
      <p>Cargando tus servicios...</p>
    </div>

    <!-- Estado de Error -->
    <div v-else-if="serviceStore.errorMessage" class="state-message error">
      <p>⚠️ {{ serviceStore.errorMessage }}</p>
    </div>

    <!-- Estado Vacío -->
    <div v-else-if="serviceStore.myRequests.length === 0" class="state-message empty">
      <p>No tienes solicitudes activas.</p>
      <button @click="goToDashboard" class="btn-action">Solicitar un servicio</button>
    </div>

    <!-- LISTA DE TARJETAS -->
    <div v-else class="cards-grid">
      <div v-for="request in serviceStore.myRequests" :key="request.id" class="service-card">
        
        <!-- Encabezado de la Tarjeta -->
        <div class="card-header">
          <div class="service-info">
            <h3>{{ request.service?.name || 'Servicio' }}</h3>
            <span class="date">{{ formatDate(request.created_at) }}</span>
          </div>
          <span class="status-badge" :class="request.status">
            {{ formatStatus(request.status) }}
          </span>
        </div>

        <!-- Cuerpo de la Tarjeta -->
        <div class="card-body">
          
          <!-- Dirección del Servicio (Campo comments) -->
          <div class="info-row location-row">
            <span class="icon">📍</span>
            <p class="address-text">
              {{ request.comments || 'Sin dirección especificada' }}
            </p>
          </div>

          <hr class="divider">

          <!-- SECCIÓN: INFORMACIÓN DEL TÉCNICO (Visible para Clientes) -->
          <div v-if="isClient(request) && request.technician" class="technician-details">
            <h4>👷 Técnico Asignado</h4>
            <div class="tech-info-grid">
              <div class="tech-item">
                <span class="label">Nombre:</span>
                <span class="value">{{ request.technician.name }}</span>
              </div>
              <div class="tech-item">
                <span class="label">Teléfono:</span>
                <a :href="`tel:${request.technician.phone}`" class="phone-link" v-if="request.technician.phone">
                  📞 {{ request.technician.phone }}
                </a>
                <span v-else class="value">No disponible</span>
              </div>
              <div class="tech-item" v-if="request.technician.email">
                <span class="label">Email:</span>
                <span class="value">{{ request.technician.email }}</span>
              </div>
              <!-- Dirección del técnico (si existiera en BD) -->
               <div class="tech-item full-width" v-if="request.technician.address">
                <span class="label">Dirección del Técnico:</span>
                <span class="value">{{ request.technician.address }}</span>
              </div>
            </div>
          </div>

          <!-- SECCIÓN: INFORMACIÓN DEL CLIENTE (Visible para Técnicos) -->
          <div v-if="isTechnician(request) && request.client" class="client-details">
             <h4>👤 Cliente</h4>
             <p><strong>Nombre:</strong> {{ request.client.name }}</p>
             <p v-if="request.client.phone"><strong>Teléfono:</strong> <a :href="`tel:${request.client.phone}`">{{ request.client.phone }}</a></p>
          </div>

          <!-- Estado: Buscando Técnico -->
          <div v-if="isClient(request) && !request.technician && request.status === 'pendiente'" class="searching-tech">
            <span class="pulse-dot"></span> Buscando técnico cercano...
          </div>

        </div>

        <!-- Pie de la Tarjeta (Acciones) -->
        <div class="card-footer">
          <!-- Acciones Técnico -->
          <div v-if="isTechnician(request)" class="actions-group">
             <button v-if="request.status === 'asignado'" @click="updateStatus(request.id, 'en_progreso')" class="btn-primary full-width">🚀 Iniciar Trabajo</button>
             <button v-if="request.status === 'en_progreso'" @click="updateStatus(request.id, 'completado')" class="btn-success full-width">✅ Terminar Trabajo</button>
          </div>
          
          <!-- Acciones Cliente -->
          <div v-if="isClient(request)" class="actions-group">
             <button v-if="request.status === 'completado' && !request.rating" @click="openRatingModal(request)" class="btn-primary full-width">⭐ Calificar Servicio</button>
             
             <div v-if="request.rating" class="rating-badge">
                Tu calificación: <strong>{{ request.rating.score }}/5</strong>
             </div>

             <button v-if="['pendiente','asignado'].includes(request.status)" @click="cancelRequest(request)" class="btn-outline-danger full-width">
               Cancelar Solicitud
             </button>
          </div>
        </div>

      </div>
    </div>
    
    <!-- MODAL DE CALIFICACIÓN -->
     <div v-if="showRatingModal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
              <h4>Calificar Servicio</h4>
              <button class="close-btn" @click="closeRatingModal">×</button>
            </div>
            
            <div class="modal-body">
              <label>¿Qué tal estuvo el servicio?</label>
              <div class="star-rating">
                 <select v-model="ratingData.score">
                    <option v-for="n in 5" :key="n" :value="n">{{n}} ⭐</option>
                 </select>
              </div>
              
              <label>Comentario (Opcional):</label>
              <textarea v-model="ratingData.comment" placeholder="Cuéntanos tu experiencia..."></textarea>
            </div>

            <div class="modal-actions">
                <button @click="closeRatingModal" class="btn-text">Cancelar</button>
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

// Helpers
const isClient = (req) => req.cliente_id === userId.value;
const isTechnician = (req) => req.tecnico_id === userId.value;

const formatStatus = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ') : '';

const formatDate = (dateString) => {
  if(!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
};

const updateStatus = (id, status) => serviceStore.updateRequestStatus(id, status);

const cancelRequest = (req) => {
    if(confirm('¿Estás seguro de que quieres cancelar esta solicitud?')) {
        serviceStore.updateRequestStatus(req.id, 'cancelado');
    }
};

const openRatingModal = (req) => { 
    selectedReqId.value = req.id; 
    ratingData.value = { score: 5, comment: '' };
    showRatingModal.value = true; 
};
const selectedReqId = ref(null);
const closeRatingModal = () => showRatingModal.value = false;

const handleRatingSubmit = async () => {
    const success = await serviceStore.submitRating({ 
        service_request_id: selectedReqId.value, 
        ...ratingData.value 
    });
    if (success) closeRatingModal();
};

const goToDashboard = () => router.push('/dashboard');

onMounted(() => {
  serviceStore.fetchMyRequests();
});
</script>

<style scoped>
/* --- LAYOUT GENERAL --- */
.service-status-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  /* background-color: #f4f6f8; */
  min-height: 100vh;
}

.page-title {
  text-align: center;
  color: #444445;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

/* --- ESTADOS (Loading, Empty, Error) --- */
.state-message {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.state-message.error { color: #e74c3c; }
.state-message.empty p { color: #7f8c8d; margin-bottom: 1rem; }

/* --- GRID DE TARJETAS --- */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Responsivo */
  gap: 1.5rem;
}

/* --- DISEÑO DE LA TARJETA --- */
.service-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
}

/* HEADER */
.card-header {
  padding: 1.2rem;
  background: #ffffff;
  border-bottom: 1px solid #ecf0f1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.service-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 700;
}

.service-info .date {
  font-size: 0.85rem;
  color: #95a5a6;
  display: block;
  margin-top: 4px;
}

/* BODY */
.card-body {
  padding: 1.2rem;
  flex-grow: 1;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 1rem;
}

.location-row .icon { font-size: 1.2rem; }
.address-text {
  margin: 0;
  color: #34495e;
  font-size: 0.95rem;
  line-height: 1.4;
}

.divider {
  border: 0;
  border-top: 1px solid #f0f2f5;
  margin: 1rem 0;
}

/* DETALLES TÉCNICO / CLIENTE */
.technician-details, .client-details {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #ff740f; /* Acento naranja */
}

.technician-details h4, .client-details h4 {
  margin: 0 0 0.8rem 0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #7f8c8d;
}

.tech-info-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tech-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}
.tech-item.full-width { flex-direction: column; gap: 4px; }
.tech-item .label { color: #7f8c8d; }
.tech-item .value { color: #2c3e50; font-weight: 600; }
.phone-link { color: #2980b9; text-decoration: none; font-weight: 600; }
.phone-link:hover { text-decoration: underline; }

.searching-tech {
  color: #e67e22;
  font-weight: 500;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* FOOTER / ACCIONES */
.card-footer {
  padding: 1rem;
  background-color: #fff;
  border-top: 1px solid #ecf0f1;
}

.actions-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.rating-badge {
  background: #fff9c4;
  color: #f39c12;
  padding: 0.5rem;
  border-radius: 6px;
  text-align: center;
  border: 1px solid #f1c40f;
}

/* --- BADGES --- */
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-badge.pendiente { background: #fff3e0; color: #e67e22; }
.status-badge.asignado { background: #e3f2fd; color: #3498db; }
.status-badge.en_progreso { background: #e8f8f5; color: #1abc9c; }
.status-badge.completado { background: #e9f7ef; color: #27ae60; }
.status-badge.cancelado { background: #f2f2f2; color: #7f8c8d; }

/* --- BOTONES --- */
button {
  cursor: pointer;
  border: none;
  border-radius: 6px;
  font-family: inherit;
  font-weight: 600;
  transition: opacity 0.2s;
}
button:hover { opacity: 0.9; }

.btn-action { padding: 0.8rem 1.5rem; background: #ff740f; color: white; font-size: 1rem; }
.btn-primary { background: #ff740f; color: white; padding: 0.8rem; }
.btn-success { background: #27ae60; color: white; padding: 0.8rem; }
.btn-outline-danger { 
  background: transparent; 
  color: #e74c3c; 
  border: 1px solid #e74c3c; 
  padding: 0.6rem; 
}
.btn-outline-danger:hover { background: #fff5f5; }
.btn-text { background: none; color: #7f8c8d; }

.full-width { width: 100%; }

/* --- MODAL --- */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(2px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  width: 90%; max-width: 450px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  overflow: hidden;
  animation: slideUp 0.3s ease;
}
.modal-header {
  background: #f8f9fa; padding: 1rem 1.5rem;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #eee;
}
.modal-header h4 { margin: 0; color: #2c3e50; }
.close-btn { font-size: 1.5rem; background: none; color: #95a5a6; padding: 0; }
.modal-body { padding: 1.5rem; }
.modal-body label { display: block; margin-bottom: 0.5rem; color: #34495e; font-weight: 600;}
.modal-body select, .modal-body textarea {
  width: 100%; padding: 0.8rem;
  border: 1px solid #dfe6e9; border-radius: 6px;
  margin-bottom: 1rem; box-sizing: border-box;
  font-family: inherit;
}
.modal-actions { padding: 1rem 1.5rem; display: flex; justify-content: flex-end; gap: 10px; background: #fff; }

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>