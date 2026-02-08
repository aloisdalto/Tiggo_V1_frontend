<template>
    <header class="hero">   
      <div class="background-blobs">
        <img src="../../assets/img/elemento1.webp" alt="">
      </div>
      <div class="hero-content">
        <img src="../../assets/img/elemento.svg" alt="" class="deco-arrow-left" placeholder="Ruta de flecha izq" />
        <h1 class="main-title">
          MATA TU TIGRE<br>
          RESUELVE TU SERVICIO
        </h1>
        <img src="../../assets/img/elemento2.svg" alt="" class="deco-arrow-right" placeholder="Ruta de flecha der" />
        <p class="subtitle-mono">
          Encuentra técnicos confiables cerca de ti o<br>
          ofrece tus servicios en minutos
        </p>
        <router-link to="/auth" class="btn-black">
          REGISTRATE AHORA <span class="arrow-icon">→</span>
        </router-link>
      </div>
      <div class="wavy-decoration">
        <img src="../../assets/img/elemento4.svg" alt="wavy">
      </div>
    </header>
</template>

<style scoped>
.hero {
  position: relative;
  padding: 4rem 1rem 6rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.background-blobs {
  position: absolute;
  top: 0%;
  left: 20%;
  z-index: -1;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
}

.deco-arrow-left {
  position: absolute;
  left: -80px; 
  top: 0;
  width: 60px;
}

.deco-arrow-right {
  position: absolute;
  right: -80px;
  top: 10px;
  width: 60px;
}

.main-title {
  font-family: var(--font-heading);
  font-size: 3.5rem; 
  font-weight: 900;  
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -1px;
  text-transform: uppercase;
}

.subtitle-mono {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  color: #000;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  font-weight: 500;
}

.btn-black {
  display: inline-flex;
  align-items: center;
  background-color: var(--color-dark);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: transform 0.2s;
}

.btn-black:hover {
  transform: scale(1.05);
}

.arrow-icon {
  margin-left: 10px;
}

.wavy-decoration {
  position: absolute;
  left: -2%; 
  bottom: -20%;
  width: 100px;
}

@media (max-width: 768px) {
  .main-title {
    font-size: 2.2rem;
  }
  .deco-arrow-left, .deco-arrow-right {
    display: none;
  }
}
</style>