<template>
  <div class="dashboard-container">
    <h1>Bienvenido, {{ userName }}</h1>
    <button @click="logout" class="btn-logout">Cerrar sesión</button>

    <section class="service-request">
      <h2>Solicitar un Servicio</h2>

      <label for="service-select">Tipo de Servicio:</label>
      <select id="service-select" v-model="serviceStore.selectedServiceId" :disabled="loading">
        <option disabled value="">Seleccione un servicio</option>
        <option v-for="service in serviceStore.services" :key="service.id" :value="service.id">
          {{ service.name }}
        </option>
      </select>

      <label>Dirección:</label>
      <input type="text" v-model="serviceStore.address" placeholder="Ingresa tu dirección" :disabled="loading" />

      <div id="map" style="height: 300px; margin: 1rem 0;"></div>

      <button @click="useCurrentLocation" type="button" :disabled="loading">Usar mi ubicación actual</button>
      <button @click="submitRequest" :disabled="loading || !canSubmit">Solicitar Servicio</button>

      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

      <div v-if="loading" class="spinner">
        <!-- Aquí puedes poner un spinner animado -->
        Cargando...
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useLoginStore } from '../store/modules/forms/loginStore';
import { useRegisterStore } from '../store/modules/forms/registerStore';
import { useServiceStore } from '../store/modules/global/serviceStore';
import router from '../router';
import L from 'leaflet';
import { useRouter } from 'vue-router';

const loginStore = useLoginStore();
const registerStore = useRegisterStore();
const serviceStore = useServiceStore();
const routerVue = useRouter();

const userName = computed(() => {
  return loginStore.user?.name || registerStore.user?.name || 'Usuario';
});

const loading = ref(false);
const errorMessage = ref('');

function logout() {
  loginStore.logout();
  registerStore.clear();
  router.push('/auth');
}

let map;
let marker;

onMounted(async () => {
  await serviceStore.fetchServices();

  map = L.map('map').setView([20.0, -100.0], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map);

  map.on('click', (e) => {
    if (loading.value) return; // evitar cambios mientras carga
    const { lat, lng } = e.latlng;
    serviceStore.setLocation(lat, lng);

    if (marker) {
      marker.setLatLng(e.latlng);
    } else {
      marker = L.marker(e.latlng).addTo(map);
    }
  });
});

async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    if (!response.ok) throw new Error('Error en geocodificación inversa');
    const data = await response.json();
    return data.display_name || '';
  } catch (error) {
    console.error(error);
    return '';
  }
}

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    alert('Geolocalización no soportada por tu navegador');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      serviceStore.setLocation(latitude, longitude);

      // Obtener dirección legible
      const address = await reverseGeocode(latitude, longitude);
      serviceStore.setAddress(address);

      if (marker) {
        marker.setLatLng([latitude, longitude]);
      } else {
        marker = L.marker([latitude, longitude]).addTo(map);
      }
      map.setView([latitude, longitude], 15);
    },
    () => {
      alert('No se pudo obtener la ubicación');
    }
  );
}

const canSubmit = computed(() => {
  return serviceStore.selectedServiceId && serviceStore.address && serviceStore.clientLocation;
});

async function submitRequest() {
  if (!canSubmit.value) {
    errorMessage.value = 'Por favor completa todos los campos';
    return;
  }
  errorMessage.value = '';
  loading.value = true;

  try {
    // Llamar al backend para crear la solicitud y obtener técnico asignado
    const response = await serviceStore.createServiceRequest();

    if (response) {
      // Guardar datos del servicio y técnico en el store para la vista siguiente
      serviceStore.assignedService = response.service; // asumiendo backend devuelve esto
      serviceStore.assignedTechnician = response.technician;

      // Limpiar formulario
      serviceStore.clear();

      // Redirigir a la vista de estado del servicio
      routerVue.push('/services-status');
    } else {
      errorMessage.value = 'Error al crear la solicitud';
    }
  } catch (err) {
    errorMessage.value = 'Error en la comunicación con el servidor';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 700px;
  margin: 3rem auto;
  text-align: center;
}
.btn-logout {
  margin-bottom: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-logout:hover {
  background-color: #b02a37;
}
.service-request {
  text-align: left;
  margin-top: 2rem;
}
label {
  display: block;
  margin-top: 1rem;
}
input,
select {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.25rem;
  box-sizing: border-box;
}
button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.error {
  color: red;
  margin-top: 1rem;
}
.spinner {
  margin-top: 1rem;
  font-weight: bold;
}
</style>
