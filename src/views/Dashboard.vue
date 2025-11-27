<template>
  <div class="dashboard-container">
    <div class="header-section">
        <div class="user-welcome">
            <h1>Hola, {{ userName }}</h1>
            <p class="role-badge">Cliente</p>
        </div>
        <div class="header-actions">
            <button @click="goToServices" class="btn-history">📋 Mis Solicitudes</button>
            <button @click="logout" class="btn-logout">Salir</button>
        </div>
    </div>

    <section class="service-request-card">
      <h2>Solicitar un Servicio</h2>

      <!-- SELECCIÓN DE SERVICIO -->
      <label for="service-select">¿Qué necesitas?</label>
      <select id="service-select" v-model="serviceStore.selectedServiceId" :disabled="loading">
        <option :value="null" disabled>Seleccione un servicio...</option>
        <option v-for="service in serviceStore.services" :key="service.id" :value="service.id">
          {{ service.name }}
        </option>
      </select>

      <!-- BUSCADOR DE DIRECCIÓN INTELIGENTE -->
      <label>¿Dónde será el servicio?</label>
      <p class="helper-text">Busca tu dirección o toca un punto en el mapa.</p>
      
      <div class="address-search-container">
        <input 
            type="text" 
            v-model="searchQuery" 
            @input="handleInput"
            placeholder="Escribe tu dirección (Ej: Calle 5, Ciudad...)" 
            :disabled="loading" 
            autocomplete="off"
        />
        
        <!-- Lista de sugerencias -->
        <ul v-if="suggestions.length > 0" class="suggestions-list">
            <li v-for="(item, index) in suggestions" :key="index" @click="selectAddress(item)">
                {{ item.display_name }}
            </li>
        </ul>
      </div>

      <!-- MAPA -->
      <div id="map" class="map-container"></div>

      <div class="location-actions">
          <p v-if="serviceStore.address" class="selected-address">
            <strong>Ubicación seleccionada:</strong> {{ serviceStore.address }}
          </p>

          <button @click="useCurrentLocation" type="button" class="btn-location" :disabled="loading">
             📍 Usar mi ubicación actual
          </button>
      </div>

      <!-- BOTÓN DE ENVÍO -->
      <button @click="submitRequest" class="btn-submit" :disabled="loading || !canSubmit">
        {{ loading ? 'Procesando...' : 'Solicitar Servicio' }}
      </button>

      <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, nextTick } from 'vue';
import { useLoginStore } from '../store/modules/forms/loginStore';
import { useRegisterStore } from '../store/modules/forms/registerStore';
import { useServiceStore } from '../store/modules/global/serviceStore';
import { useRouter } from 'vue-router';
import L from 'leaflet';
// Importar CSS de Leaflet es vital si no está en index.html
import 'leaflet/dist/leaflet.css';

// Corrección para iconos de Leaflet en Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const loginStore = useLoginStore();
const registerStore = useRegisterStore();
const serviceStore = useServiceStore();
const router = useRouter();

const userName = computed(() => loginStore.user?.name || registerStore.user?.name || 'Usuario');
const loading = ref(false);
const errorMessage = ref('');

// Estado para el buscador
const searchQuery = ref('');
const suggestions = ref([]);
let debounceTimeout = null;

// Variables del Mapa
let map = null;
let marker = null;

onMounted(async () => {
  await serviceStore.fetchServices();
  
  // Inicializar mapa después de que el DOM esté listo
  nextTick(() => {
      initMap();
  });

  // Sincronizar input si ya hay dirección en store
  if (serviceStore.address) {
      searchQuery.value = serviceStore.address;
  }
});

function initMap() {
    // Evitar reinicializar si ya existe
    if (map) return;
    // Verificar que el contenedor exista
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Coordenadas iniciales (Por defecto o las del store)
    const lat = serviceStore.clientLocation?.lat || 8.2906498; // Ejemplo: Venezuela
    const lng = serviceStore.clientLocation?.lng || -62.7218342;
    const zoom = serviceStore.clientLocation ? 16 : 6;

    map = L.map('map').setView([lat, lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Si ya hay ubicación, poner marcador
    if (serviceStore.clientLocation) {
        marker = L.marker([lat, lng]).addTo(map);
    }

    // Evento Click en Mapa
    map.on('click', async (e) => {
        if (loading.value) return;
        const { lat, lng } = e.latlng;
        await updateLocationAndAddress(lat, lng);
    });
}

async function updateLocationAndAddress(lat, lng) {
    // 1. Actualizar Store
    serviceStore.setLocation(lat, lng);

    // 2. Actualizar Mapa Visual
    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng]).addTo(map);
    }
    map.setView([lat, lng], 16);

    // 3. Obtener Dirección (Reverse Geocoding)
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const addr = data.display_name || `Ubicación: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        
        serviceStore.setAddress(addr);
        searchQuery.value = addr;
    } catch (error) {
        console.error("Error geocoding:", error);
        const fallback = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
        serviceStore.setAddress(fallback);
        searchQuery.value = fallback;
    }
}

function logout() {
  loginStore.logout();
  registerStore.clear();
  router.push('/auth');
}

function goToServices() {
    router.push('/services-status');
}

// --- LÓGICA DE AUTOCOMPLETADO (Nominatim API) ---
const handleInput = () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    
    if (searchQuery.value.length < 3) {
        suggestions.value = [];
        return;
    }

    debounceTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&countrycodes=ve&limit=5`);
            const data = await response.json();
            suggestions.value = data;
        } catch (error) {
            console.error("Error buscando direcciones:", error);
        }
    }, 500);
};

const selectAddress = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    
    serviceStore.address = item.display_name;
    searchQuery.value = item.display_name;
    serviceStore.setLocation(lat, lon);
    
    // Actualizar mapa al seleccionar dirección
    if (map) {
        map.setView([lat, lon], 16);
        if (marker) marker.setLatLng([lat, lon]);
        else marker = L.marker([lat, lon]).addTo(map);
    }
    
    suggestions.value = [];
};

// --- LÓGICA DE GEOLOCALIZACIÓN ---
async function useCurrentLocation() {
  if (!navigator.geolocation) {
    alert('Geolocalización no soportada');
    return;
  }
  loading.value = true;
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      await updateLocationAndAddress(latitude, longitude);
      loading.value = false;
    },
    (err) => {
      alert('No se pudo obtener la ubicación');
      loading.value = false;
    }
  );
}

const canSubmit = computed(() => {
  return serviceStore.selectedServiceId && serviceStore.clientLocation;
});

async function submitRequest() {
  errorMessage.value = '';
  const result = await serviceStore.createServiceRequest();

  if (result) {
    router.push('/services-status');
  } else {
    errorMessage.value = serviceStore.errorMessage || 'Error al crear la solicitud';
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

.user-welcome h1 { margin: 0; color: #2c3e50; font-size: 1.5rem;}
.role-badge { margin: 0; color: #7f8c8d; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

.header-actions { display: flex; gap: 10px; }

.btn-logout {
  padding: 0.6rem 1.2rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-history {
  padding: 0.6rem 1.2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.service-request-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

label {
  display: block;
  margin-top: 1rem;
  font-weight: bold;
  color: #333;
}

.helper-text {
    margin: 0.2rem 0 0.5rem 0;
    font-size: 0.85rem;
    color: #7f8c8d;
}

select, input {
  width: 100%;
  padding: 0.8rem;
  margin-top: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
}

/* Mapa */
.map-container {
    height: 300px;
    width: 100%;
    margin-top: 1rem;
    border-radius: 8px;
    border: 1px solid #ddd;
    z-index: 1; /* Importante para que el autocomplete pase por encima */
}

/* Estilos Autocompletado */
.address-search-container { position: relative; }
.suggestions-list {
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    width: 100%;
    background: white;
    border: 1px solid #ddd;
    border-top: none;
    z-index: 1000; /* Mayor que el mapa */
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.suggestions-list li { padding: 0.8rem; cursor: pointer; border-bottom: 1px solid #eee; font-size: 0.9rem; }
.suggestions-list li:hover { background-color: #f0f0f0; }

.selected-address {
    background-color: #e9ecef;
    padding: 0.8rem;
    border-radius: 6px;
    margin-top: 1rem;
    font-size: 0.9rem;
}

.btn-location {
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 0.6rem;
    border-radius: 6px;
    margin-top: 0.5rem;
    cursor: pointer;
    width: 100%;
}

.btn-submit {
  margin-top: 2rem;
  width: 100%;
  padding: 1rem;
  background-color: #ff740f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  font-weight: bold;
}
.btn-submit:disabled { background-color: #ffb885; cursor: not-allowed; }

.error-msg { color: red; margin-top: 1rem; text-align: center; }
</style>