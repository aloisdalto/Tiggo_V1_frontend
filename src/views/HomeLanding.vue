<template>
  <div class="landing-container">
    <h1>Bienvenido a Tiggo</h1>
    <p>
      Aquí puedes describir las funcionalidades, beneficios y cómo usar la aplicación.
    </p>
    <router-link to="/auth" class="btn-login">Iniciar Sesión / Registrarse</router-link>
  </div>
</template>

<script>
export default {
  name: 'Landing',
};
</script>

<style scoped>
.landing-container {
  max-width: 600px;
  margin: 3rem auto;
  text-align: center;
  padding: 1rem;
}
.btn-login {
  display: inline-block;
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: #ff740f;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  transition: all 0.2s ease-in;
}
.btn-login:hover {
  background-color: #f39755;
}
</style>
  