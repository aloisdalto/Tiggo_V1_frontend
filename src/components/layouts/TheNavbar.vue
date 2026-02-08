<template>
    <nav class="navbar container">
      <div class="logo-container">
        <img src="../../assets/img/logo-tiggo.png" alt="Tiggo Logo" class="logo-img" />
      </div>
      <div class="nav-links">
        <a href="#nosotros" class="nav-item">Nosotros</a>
        <a href="#contacto" class="nav-item">Contacto</a>
        <router-link to="/auth" class="btn-outlined">Empieza en Tiggo</router-link>
      </div>
    </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.logo-img {
  height: 40px; 
  display: block;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-item {
  text-decoration: none;
  color: var(--color-dark);
  font-weight: 500;
  font-size: 1rem;
}

.btn-outlined {
  text-decoration: none;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: 0.6rem 1.5rem;
  border-radius: 50px; 
  font-weight: 700;
  transition: all 0.3s ease;
}

.btn-outlined:hover {
  background-color: var(--color-primary);
  color: white;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>