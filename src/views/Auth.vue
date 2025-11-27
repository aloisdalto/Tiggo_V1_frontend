<template>
  <div class="auth-page-wrapper">
    <!-- ENLACE PARA VOLVER AL HOME -->
    <router-link to="/" class="back-link">
      <span class="arrow">←</span> Volver al Inicio
    </router-link>

    <div class="auth-card">
      <div class="auth-header">
        <h2>{{ isLogin ? 'Bienvenido de nuevo' : 'Crear una cuenta' }}</h2>
        <p class="subtitle">
          {{ isLogin ? 'Ingresa tus credenciales para continuar' : 'Únete a Tiggo y gestiona tus servicios' }}
        </p>
      </div>

      <form @submit.prevent="isLogin ? loginStore.login() : registerStore.register()">
        
        <!-- SECCIÓN DE LOGIN -->
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            :value="isLogin ? loginStore.email : registerStore.email"
            @input="
              isLogin
                ? (loginStore.email = $event.target.value)
                : (registerStore.email = $event.target.value)
            "
            placeholder="ejemplo@correo.com"
            required
            :disabled="isProcessing"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            type="password"
            id="password"
            :value="isLogin ? loginStore.password : registerStore.password"
            @input="
              isLogin
                ? (loginStore.password = $event.target.value)
                : (registerStore.password = $event.target.value)
            "
            placeholder="••••••••"
            required
            :disabled="isProcessing"
          />
        </div>

        <!-- SECCIÓN DE REGISTRO -->
        <div v-if="!isLogin" class="register-section">
          <div class="form-group">
            <label for="name">Nombre Completo</label>
            <input type="text" id="name" v-model="registerStore.name" placeholder="Tu nombre" required :disabled="isProcessing" />
          </div>

          <div class="form-group">
            <label for="password_confirmation">Confirmar Contraseña</label>
            <input
              type="password"
              id="password_confirmation"
              v-model="registerStore.password_confirmation"
              placeholder="••••••••"
              required
              :disabled="isProcessing"
            />
          </div>

          <div class="form-group">
            <label for="phone">Teléfono (Opcional)</label>
            <input type="tel" id="phone" v-model="registerStore.phone" placeholder="+58..." :disabled="isProcessing" />
          </div>

          <div class="form-group">
            <label for="role">¿Cómo usarás Tiggo?</label>
            <select id="role" v-model="registerStore.role" @change="handleRoleChange" required :disabled="isProcessing">
              <option value="cliente">Quiero contratar servicios (Cliente)</option>
              <option value="tecnico">Quiero ofrecer mis servicios (Técnico)</option>
            </select>
          </div>

          <!-- SECCIÓN TÉCNICO -->
          <div v-if="registerStore.role === 'tecnico'" class="technician-panel">
            <div class="panel-header">
               <h4>🛠️ Perfil Profesional</h4>
               <p>Completa estos datos para que los clientes te encuentren.</p>
            </div>
            
            <div class="form-group">
              <label for="address">Tu Ubicación Base</label>
              <div class="input-with-button">
                <input
                  type="text"
                  id="address"
                  v-model="registerStore.address"
                  placeholder="Dirección o punto de referencia"
                  required 
                  :disabled="isProcessing"
                />
                <button 
                  type="button" 
                  @click="useCurrentLocation" 
                  :disabled="isLocating || isProcessing"
                  class="btn-icon"
                  title="Usar mi ubicación actual">
                  📍
                </button>
              </div>
              <small v-if="isLocating" class="locating-text">Obteniendo ubicación...</small>
            </div>

            <div class="form-group">
              <label for="service-select">Especialidad Principal</label>
              <select id="service-select" v-model="registerStore.service_id" :disabled="serviceStore.loading || isProcessing" required>
                <option :value="null" disabled>
                  {{ serviceStore.loading ? 'Cargando lista...' : 'Selecciona tu especialidad' }}
                </option>
                <option v-for="service in serviceStore.services" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
              <p v-if="serviceStore.errorMessage" class="error-text">{{ serviceStore.errorMessage }}</p>
            </div>
            
            <div class="form-group">
              <label for="description">Sobre ti</label>
              <textarea 
                id="description" 
                v-model="registerStore.description" 
                rows="3" 
                placeholder="Describe tu experiencia y servicios..."
                required 
                :disabled="isProcessing"
              ></textarea>
            </div>
          </div>

        </div>

        <!-- BOTÓN SUBMIT -->
        <button type="submit" class="btn-submit" :disabled="isProcessing || isLocating">
          <span v-if="isProcessing" class="loader"></span>
          <span v-if="isLogin && loginStore.verifying">Verificando cuenta...</span>
          <span v-else-if="isLogin && loginStore.loading">Iniciando sesión...</span>
          <span v-else-if="!isLogin && registerStore.verifying">Creando perfil...</span>
          <span v-else-if="!isLogin && registerStore.loading">Registrando...</span>
          <span v-else>{{ isLogin ? 'Entrar' : 'Crear Cuenta' }}</span>
        </button>
      </form>

      <div class="auth-footer">
        <p v-if="!isProcessing">
          {{ isLogin ? '¿Nuevo en Tiggo?' : '¿Ya tienes cuenta?' }}
          <span @click="toggleForm" class="toggle-link">
            {{ isLogin ? 'Regístrate gratis' : 'Inicia sesión aquí' }}
          </span>
        </p>
      </div>

      <div v-if="errorMessage" class="alert-box error">
        {{ errorMessage }}
      </div>
      
      <div v-if="isProcessing" class="alert-box info">
         Estamos procesando tu solicitud, un momento por favor...
      </div>
    </div>
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
const isLocating = ref(false);

const isProcessing = computed(() => {
    return loginStore.loading || loginStore.verifying || registerStore.loading || registerStore.verifying;
});

onMounted(() => {
    serviceStore.fetchServices();
});

// --- GEOLOCALIZACIÓN ---
async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    if (!response.ok) throw new Error('Error en geocodificación');
    const data = await response.json();
    return data.display_name || '';
  } catch (error) {
    console.error(error);
    return '';
  }
}

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    alert('Geolocalización no soportada');
    return;
  }
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      registerStore.latitude = latitude;
      registerStore.longitude = longitude;
      const address = await reverseGeocode(latitude, longitude);
      registerStore.address = address;
      isLocating.value = false;
    },
    () => {
      alert('No se pudo obtener la ubicación');
      isLocating.value = false;
    }
  );
}

function handleRoleChange() {
    if (registerStore.role === 'cliente') {
        registerStore.description = '';
        registerStore.service_id = null;
        registerStore.address = '';
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
/* --- LAYOUT & WRAPPER --- */
.auth-page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f4f6f8; /* Mismo color de fondo que Dashboard */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 1rem;
}

.back-link {
  position: absolute;
  top: 2rem;
  left: 2rem;
  text-decoration: none;
  color: #7f8c8d;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}
.back-link:hover { color: #2c3e50; }
.back-link .arrow { font-size: 1.2rem; }

/* --- TARJETA PRINCIPAL --- */
.auth-card {
  width: 100%;
  max-width: 480px;
  background-color: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05); /* Sombra suave estilo dashboard */
  animation: fadeIn 0.5s ease-out;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}
.auth-header h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.8rem;
}
.auth-header .subtitle {
  color: #95a5a6;
  margin: 0;
  font-size: 0.95rem;
}

/* --- FORMULARIOS E INPUTS --- */
.form-group { margin-bottom: 1.2rem; }

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #34495e;
  font-weight: 600;
  font-size: 0.9rem;
}

input, select, textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: #fff;
  color: #2c3e50;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

input:focus, select:focus, textarea:focus {
  border-color: #ff740f;
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 116, 15, 0.1);
}

input:disabled, select:disabled, textarea:disabled {
  background-color: #f8f9fa;
  color: #bdc3c7;
  cursor: not-allowed;
}

/* Input con botón (Ubicación) */
.input-with-button {
  display: flex;
  gap: 8px;
}
.btn-icon {
  padding: 0 1rem;
  background-color: #ecf0f1;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.2s;
}
.btn-icon:hover:not(:disabled) { background-color: #e0e0e0; }

/* --- SECCIÓN TÉCNICO --- */
.technician-panel {
  background-color: #fffbf6; /* Un toque muy suave de naranja */
  border: 1px solid #ffe0b2;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
.panel-header h4 { margin: 0; color: #e67e22; }
.panel-header p { margin: 5px 0 15px 0; font-size: 0.85rem; color: #d35400; }

/* --- BOTÓN SUBMIT --- */
.btn-submit {
  width: 100%;
  padding: 1rem;
  background-color: #ff740f;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.btn-submit:hover:not(:disabled) {
  background-color: #f39c12;
  transform: translateY(-1px);
}
.btn-submit:disabled {
  background-color: #fab1a0;
  cursor: wait;
}

/* --- FOOTER Y ALERTS --- */
.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  color: #7f8c8d;
}
.toggle-link {
  color: #ff740f;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 5px;
}
.toggle-link:hover { color: #d35400; }

.alert-box {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}
.alert-box.error {
  background-color: #fadbd8;
  color: #c0392b;
  border: 1px solid #f5b7b1;
}
.alert-box.info {
  background-color: #e8f6f3;
  color: #16a085;
  border: 1px solid #a3e4d7;
}

.locating-text { font-size: 0.8rem; color: #2980b9; margin-top: 4px; display: block;}

/* Loader sencillo */
.loader {
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top: 3px solid white;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsivo */
@media (max-width: 600px) {
  .auth-card { padding: 1.5rem; }
  .back-link { top: 1rem; left: 1rem; }
}
</style>