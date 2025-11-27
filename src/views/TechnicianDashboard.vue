<template>
  <div class="tech-dashboard-container">
    <div class="header-section">
        <div class="user-info">
            <h1 class="page-title">Hola, {{ userName }}</h1>
            <p class="role-badge">Panel de Técnico</p>
        </div>
        <button @click="logout" class="btn-logout">Cerrar Sesión</button>
    </div>

    <!-- Estado de Carga -->
    <div v-if="serviceStore.loading && serviceStore.myRequests.length === 0" class="state-message">
      <div class="spinner"></div>
      <p>Cargando tus asignaciones...</p>
    </div>

    <!-- Estado de Error -->
    <div v-else-if="serviceStore.errorMessage" class="state-message error">
      <p>⚠️ {{ serviceStore.errorMessage }}</p>
    </div>

    <!-- Estado Vacío -->
    <div v-else-if="serviceStore.myRequests.length === 0" class="state-message empty">
      <p>No tienes servicios asignados actualmente.</p>
      <p class="sub-text">Mantente atento a nuevas notificaciones.</p>
    </div>

    <!-- LISTA DE TRABAJOS ASIGNADOS -->
    <div v-else class="cards-grid">
      <div v-for="request in serviceStore.myRequests" :key="request.id" class="service-card">
        
        <!-- Encabezado -->
        <div class="card-header">
          <div class="service-info">
            <h3>{{ request.service?.name || 'Servicio General' }}</h3>
            <span class="date">Solicitado: {{ formatDate(request.created_at) }}</span>
          </div>
          <span class="status-badge" :class="request.status">
            {{ formatStatus(request.status) }}
          </span>
        </div>

        <!-- Cuerpo -->
        <div class="card-body">
          
          <!-- Ubicación del Cliente -->
          <div class="info-row location-row">
            <span class="icon">📍</span>
            <div>
                <span class="label">Ubicación del trabajo:</span>
                <p class="address-text">
                {{ request.comments || 'Ubicación no especificada por el cliente' }}
                </p>
            </div>
          </div>

          <hr class="divider">

          <!-- INFORMACIÓN DEL CLIENTE -->
          <div class="client-details" v-if="request.client">
             <h4>👤 Datos del Cliente</h4>
             <div class="detail-row">
                <span>Nombre:</span>
                <strong>{{ request.client.name }}</strong>
             </div>
             <div class="detail-row" v-if="request.client.email">
                <span>Email:</span>
                <a :href="`mailto:${request.client.email}`">{{ request.client.email }}</a>
             </div>
             <div class="detail-row" v-if="request.client.phone">
                <span>Teléfono:</span>
                <a :href="`tel:${request.client.phone}`" class="phone-link">📞 {{ request.client.phone }}</a>
             </div>
          </div>
          <div v-else class="client-details warning">
              <p>⚠️ Datos del cliente no disponibles</p>
          </div>

        </div>

        <!-- Acciones del Técnico -->
        <div class="card-footer">
             <button v-if="request.status === 'asignado'" 
                     @click="updateStatus(request.id, 'en_progreso')" 
                     class="btn-primary full-width">
                 🚀 Iniciar Trabajo
             </button>
             
             <button v-if="request.status === 'en_progreso'" 
                     @click="updateStatus(request.id, 'completado')" 
                     class="btn-success full-width">
                 ✅ Marcar como Completado
             </button>

             <div v-if="request.status === 'completado'" class="completed-msg">
                 <span>Trabajo finalizado el {{ formatDate(request.updated_at) }}</span>
             </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useServiceStore } from '../store/modules/global/serviceStore';
import { useLoginStore } from '../store/modules/forms/loginStore';
import { useRegisterStore } from '../store/modules/forms/registerStore';
import { useRouter } from 'vue-router';

const serviceStore = useServiceStore();
const loginStore = useLoginStore();
const registerStore = useRegisterStore();
const router = useRouter();

// Computamos el nombre del usuario (priorizando el loginStore, luego register, luego default)
const userName = computed(() => loginStore.user?.name || registerStore.user?.name || 'Técnico');

const formatDate = (dateString) => {
  if(!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
};

const formatStatus = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ') : '';

const updateStatus = async (id, status) => {
    if(confirm(`¿Estás seguro de cambiar el estado a "${formatStatus(status)}"?`)) {
        await serviceStore.updateRequestStatus(id, status);
    }
};

const logout = () => {
    loginStore.logout();
    router.push('/auth');
};

onMounted(() => {
  serviceStore.fetchMyRequests();
});
</script>

<style scoped>
/* Reutilizando estilos base para consistencia visual */
.tech-dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f6f8;
  min-height: 100vh;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    background: #fff;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.page-title {
  color: #2c3e50;
  font-size: 1.5rem;
  margin: 0;
}
.role-badge { margin: 0; color: #3498db; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

.btn-logout {
    padding: 0.6rem 1.2rem;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

/* Estados */
.state-message {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.state-message.empty .sub-text { color: #95a5a6; font-size: 0.9rem; }

/* Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Tarjeta */
.service-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  border-top: 4px solid #3498db; /* Distinción visual para técnicos */
}
.service-card:hover { transform: translateY(-3px); }

.card-header {
  padding: 1.2rem;
  background: #fff;
  border-bottom: 1px solid #ecf0f1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.service-info h3 { margin: 0; color: #2c3e50; font-size: 1.1rem; }
.service-info .date { font-size: 0.8rem; color: #95a5a6; display: block; margin-top: 4px; }

.card-body { padding: 1.2rem; flex-grow: 1; }

.location-row { display: flex; gap: 10px; }
.location-row .icon { font-size: 1.5rem; }
.location-row .label { font-size: 0.8rem; color: #7f8c8d; font-weight: 600; text-transform: uppercase; }
.address-text { margin: 4px 0 0 0; color: #34495e; line-height: 1.4; font-weight: 500;}

.divider { border: 0; border-top: 1px solid #f0f2f5; margin: 1rem 0; }

/* Datos Cliente */
.client-details {
    background-color: #f0f8ff;
    border-radius: 8px;
    padding: 1rem;
    border-left: 3px solid #3498db;
}
.client-details h4 { margin: 0 0 0.8rem 0; font-size: 0.9rem; color: #3498db; text-transform: uppercase; }
.detail-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem; }
.detail-row span { color: #7f8c8d; }
.phone-link { color: #27ae60; font-weight: 700; text-decoration: none; }

/* Footer */
.card-footer { padding: 1rem; background-color: #fff; border-top: 1px solid #ecf0f1; }
.full-width { width: 100%; padding: 0.8rem; font-size: 1rem; }

/* Botones y Badges */
.btn-primary { background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;}
.btn-success { background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;}

.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-badge.asignado { background: #e3f2fd; color: #3498db; }
.status-badge.en_progreso { background: #e8f8f5; color: #1abc9c; }
.status-badge.completado { background: #e9f7ef; color: #27ae60; }

.completed-msg { text-align: center; color: #27ae60; font-weight: 600; font-size: 0.9rem; }
</style>