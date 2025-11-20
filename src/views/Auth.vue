<template>
        <div class="auth-container">
          <h2>{{ isLogin ? 'Iniciar Sesión' : 'Registro' }}</h2>
      
          <form @submit.prevent="isLogin ? loginStore.login() : registerStore.register()">
            
            <!-- SECCIÓN DE LOGIN (siempre visibles) -->
            <label for="email">Email:</label>
            <input
              type="email"
              id="email"
              :value="isLogin ? loginStore.email : registerStore.email"
              @input="
                isLogin
                  ? (loginStore.email = $event.target.value)
                  : (registerStore.email = $event.target.value)
              "
              required/>
      
            <label for="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              :value="isLogin ? loginStore.password : registerStore.password"
              @input="
                isLogin
                  ? (loginStore.password = $event.target.value)
                  : (registerStore.password = $event.target.value)
              "
              required />
      
            <!-- SECCIÓN DE REGISTRO (solo visible si !isLogin) -->
            <div v-if="!isLogin">
              <label for="name">Nombre:</label>
              <input type="text" id="name" v-model="registerStore.name" required />
    
              <label for="password_confirmation">Confirmar Contraseña:</label>
              <input
                type="password"
                id="password_confirmation"
                v-model="registerStore.password_confirmation"
                required />
    
              <label for="phone">Teléfono (Opcional):</label>
              <input type="tel" id="phone" v-model="registerStore.phone" />
    
              <label for="role">Tipo de usuario:</label>
              <select id="role" v-model="registerStore.role" @change="handleRoleChange" required>
                <option value="cliente">Cliente</option>
                <option value="tecnico">Técnico</option>
              </select>
    
              <!-- --- SECCIÓN CONDICIONAL PARA TÉCNICO --- -->
              <div v-if="registerStore.role === 'tecnico'" class="technician-fields">
                <h4 class="text-lg font-semibold mb-2">Información del Técnico</h4>
                
                <!-- --- NUEVO INPUT DE DIRECCIÓN --- -->
                <label for="address">Tu Dirección (para que los clientes te encuentren):</label>
                <input
                  type="text"
                  id="address"
                  v-model="registerStore.address"
                  placeholder="Escribe tu dirección o usa el botón"
                  required />
                <button 
                  type="button" 
                  @click="useCurrentLocation" 
                  :disabled="isLocating"
                  class="btn-secondary">
                  {{ isLocating ? 'Obteniendo...' : 'Usar mi ubicación actual' }}
                </button>
                <!-- --- FIN NUEVO INPUT DE DIRECCIÓN --- -->
  
                <!-- SELECT DE SERVICIOS -->
                <label for="service-select">Servicio Principal Ofrecido:</label>
                <select id="service-select" v-model="registerStore.service_id" :disabled="serviceStore.loading" required>
                  <option :value="null" disabled>
                    {{ serviceStore.loading ? 'Cargando servicios...' : 'Seleccione un servicio' }}
                  </option>
                  <option v-for="service in serviceStore.services" :key="service.id" :value="service.id">
                    {{ service.name }}
                  </option>
                </select>
                <p v-if="serviceStore.errorMessage" class="error-message text-xs mt-1">{{ serviceStore.errorMessage }}</p>
                
                <!-- DESCRIPCIÓN -->
                <label for="description">Descripción (Cuéntanos sobre tus servicios):</label>
                <textarea id="description" v-model="registerStore.description" rows="4" required></textarea>
              </div>
              <!-- --- FIN SECCIÓN CONDICIONAL --- -->
    
            </div>
      
            <button type="submit" :disabled="loginStore.loading || registerStore.loading || isLocating">
              {{ isLogin ? (loginStore.loading ? 'Entrando...' : 'Entrar') : (registerStore.loading ? 'Registrando...' : 'Registrarse') }}
            </button>
          </form>
      
          <p @click="toggleForm" class="toggle-text">
            {{ isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
          </p>
      
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>
  </template>
      
    <script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useLoginStore } from '../store/modules/forms/loginStore';
    import { useRegisterStore } from '../store/modules/forms/registerStore';
    import { useServiceStore } from '../store/modules/global/serviceStore';
    
    const loginStore = useLoginStore();
    const registerStore = useRegisterStore();
    const serviceStore = useServiceStore();
    
    const isLogin = ref(true);
    const isLocating = ref(false); // <-- NUEVO: Estado para deshabilitar botón
    
    // Función para cargar los servicios al montar el componente
    onMounted(() => {
        serviceStore.fetchServices();
    });
  
    // --- NUEVAS FUNCIONES DE GEOLOCALIZACIÓN ---
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
      isLocating.value = true;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
            
            // Guardar lat/lng en el store de REGISTRO
          registerStore.latitude = latitude;
            registerStore.longitude = longitude;
  
          // Obtener dirección legible
          const address = await reverseGeocode(latitude, longitude);
            
            // Guardar dirección en el store de REGISTRO
          registerStore.address = address;
            isLocating.value = false;
        },
        () => {
          alert('No se pudo obtener la ubicación');
            isLocating.value = false;
        }
      );
    }
    // --- FIN NUEVAS FUNCIONES ---
    
    function handleRoleChange() {
        if (registerStore.role === 'cliente') {
            registerStore.description = '';
            registerStore.service_id = null;
            registerStore.address = ''; // Limpiar campos de técnico
            registerStore.latitude = '';
            registerStore.longitude = '';
        } else {
            if (serviceStore.services.length === 0) {
                serviceStore.fetchServices();
            }
        }
    }
    
    function toggleForm() {
      loginStore.clear();
      registerStore.clear();
      isLogin.value = !isLogin.value;
    }
    
    const errorMessage = computed(() => {
      return isLogin.value ? loginStore.errorMessage : registerStore.errorMessage;
  });
  </script>
  
  <style scoped>
  /* Estilos inalterados */
  .auth-container {
    min-width: 450px;
    margin: 2rem auto;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  
  label {
   display: block;
   margin-top: 1rem;
  }
  
  input,
  select,
  textarea {
    width: 80%;
    padding: 0.5rem;
    margin-top: 0.25rem;
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box; /* Asegura que el padding no desborde */
  }
  
  .technician-fields {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px dashed #ff740f;
    border-radius: 8px;
    background-color: rgba(255, 116, 15, 0.05);
  }
  .technician-fields h4 {
  color: #ff740f;
  text-align: center;
  }
  
/* Botón principal (submit) */
  button[type="submit"] {
    margin-top: 1.5rem;
    width: 80%;
    padding: 0.75rem;
    background-color: #ff740f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button[type="submit"]:disabled {
    background-color: #f39755;
    cursor: not-allowed;
  }
/* NUEVO ESTILO: Botón secundario (Usar ubicación) */
button.btn-secondary {
  width: 80%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button.btn-secondary:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
  
.toggle-text {
  cursor: pointer;
  color: whitesmoke;
  margin-top: 1rem;
  user-select: none;
}
.error-message {
  color: red;
  margin-top: 1rem;
}
</style>