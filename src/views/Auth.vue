<template>
    <div class="auth-container">
      <h2>{{ isLogin ? 'Iniciar Sesión' : 'Registro' }}</h2>
  
      <form @submit.prevent="isLogin ? loginStore.login() : registerStore.register()">
        <div v-if="!isLogin">
          <label for="name">Nombre:</label>
          <input type="text" id="name" v-model="registerStore.name" required />
        </div>
  
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
          required
        />
  
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
          required
        />
  
        <div v-if="!isLogin">
          <label for="password_confirmation">Confirmar Contraseña:</label>
          <input
            type="password"
            id="password_confirmation"
            v-model="registerStore.password_confirmation"
            required
          />

          <label for="role">Tipo de usuario:</label>
          <select id="role" v-model="registerStore.role" required>
            <option value="cliente">Cliente</option>
            <option value="tecnico">Técnico</option>
          </select>
        </div>
  
        <button type="submit" :disabled="loginStore.loading || registerStore.loading">
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
import { ref, computed } from 'vue';
import { useLoginStore } from '../store/modules/forms/loginStore';
import { useRegisterStore } from '../store/modules/forms/registerStore';

const loginStore = useLoginStore();
const registerStore = useRegisterStore();

const isLogin = ref(true);

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
select {
  width: 80%;
  padding: 0.5rem;
  margin-top: 0.25rem;
}

button {
  margin-top: 1.5rem;
  width: 80%;
  padding: 0.75rem;
  background-color: #ff740f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  background-color: #f39755;
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
  