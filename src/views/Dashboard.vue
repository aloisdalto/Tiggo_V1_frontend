<template>
  <div class="dashboard-container">
    <h1>Bienvenido, {{ userName }}</h1>
    <button @click="logout" class="btn-logout">Cerrar sesión</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLoginStore } from '../store/modules/forms/loginStore';
import { useRegisterStore } from '../store/modules/forms/registerStore';
import router from '../router';

const loginStore = useLoginStore();
const registerStore = useRegisterStore();

// Obtener el nombre del usuario desde cualquiera de los stores que tenga datos
const userName = computed(() => {
  // Prioriza loginStore.user, si no existe intenta registerStore.user
  return loginStore.user?.name || registerStore.user?.name || 'Usuario';
});

function logout() {
  // Limpiar ambos stores por si acaso
  loginStore.logout();
  registerStore.clear();
  router.push('/auth');
}
</script>

<style scoped>
.dashboard-container {
  max-width: 600px;
  margin: 3rem auto;
  text-align: center;
}
.btn-logout {
  margin-top: 2rem;
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
</style>
  