<template>
  <div class="landing-page">
    
    <!-- Navbar Simple -->
    <nav class="navbar">
      <div class="logo">Tiggo</div>
      <router-link to="/auth" class="btn-nav">Acceder</router-link>
    </nav>

    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-content">
        <h1 class="title">Soluciones rápidas para tu hogar</h1>
        <p class="subtitle">
          Conecta con técnicos expertos en minutos. Carpintería, plomería, electricidad y más, al alcance de un clic.
        </p>
        
        <div class="cta-group">
          <router-link to="/auth" class="btn-cta primary">
            🛠️ Buscar un Técnico
          </router-link>
          <router-link to="/auth" class="btn-cta secondary">
            💼 Ofrecer Servicios
          </router-link>
        </div>
      </div>
    </header>

    <!-- Features Section (Decorativo) -->
    <section class="features">
      <div class="feature-card">
        <div class="icon">📍</div>
        <h3>Cerca de ti</h3>
        <p>Encuentra profesionales en tu zona usando geolocalización.</p>
      </div>
      <div class="feature-card">
        <div class="icon">⭐</div>
        <h3>Calidad Asegurada</h3>
        <p>Revisa calificaciones y comentarios de otros usuarios.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🚀</div>
        <h3>Rápido y Fácil</h3>
        <p>Sin llamadas interminables. Pide, espera y resuelve.</p>
      </div>
    </section>

    <footer class="footer">
      <p>© 2025 Tiggo App. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Landing',
};
</script>

<style scoped>
/* --- GENERAL --- */
.landing-page {
  min-height: 100vh;
  background-color: #f4f6f8; /* Mismo gris que el dashboard */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
}

/* --- NAVBAR --- */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.logo {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ff740f; /* Naranja Tiggo */
  letter-spacing: -1px;
}
.btn-nav {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background 0.2s;
}
.btn-nav:hover { background-color: #f0f2f5; }

/* --- HERO SECTION --- */
.hero {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1rem;
  background: white;
  background: radial-gradient(circle at top right, #fffbf6, #ffffff);
}

.hero-content { max-width: 700px; }

.title {
  font-size: 3.5rem;
  line-height: 1.1;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 800;
}

.subtitle {
  font-size: 1.25rem;
  color: #7f8c8d;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.cta-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-cta {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 700;
  text-decoration: none;
  font-size: 1.1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-cta.primary {
  background-color: #ff740f;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 116, 15, 0.3);
}
.btn-cta.primary:hover {
  background-color: #f39c12;
  transform: translateY(-3px);
}

.btn-cta.secondary {
  background-color: white;
  color: #2c3e50;
  border: 2px solid #dfe6e9;
}
.btn-cta.secondary:hover {
  border-color: #b2bec3;
  background-color: #f8f9fa;
}

/* --- FEATURES --- */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 4rem 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.3s;
}
.feature-card:hover { transform: translateY(-5px); }

.feature-card .icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: #fff3e0;
  width: 60px;
  height: 60px;
  line-height: 60px;
  border-radius: 50%;
  margin-left: auto;
  margin-right: auto;
}

.feature-card h3 { margin: 0 0 0.5rem 0; color: #2c3e50; }
.feature-card p { margin: 0; color: #7f8c8d; font-size: 0.95rem; }

/* --- FOOTER --- */
.footer {
  text-align: center;
  padding: 2rem;
  color: #95a5a6;
  font-size: 0.9rem;
  border-top: 1px solid #ecf0f1;
  background: white;
}

@media (max-width: 768px) {
  .title { font-size: 2.5rem; }
  .subtitle { font-size: 1.1rem; }
}
</style>