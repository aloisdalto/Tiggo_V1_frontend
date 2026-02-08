<template>
    <section id="nosotros" class="about-section container">
      <div class="about-grid">
        <div class="about-visuals">
          <img src="" alt="" class="about-wavy-deco" placeholder="Ondas Naranjas Nosotros"/>
          <h2 class="section-title">
            ¿QUIENES<br>
            SOMOS Y QUE<br>
            HACEMOS?
          </h2>
          <div class="swirl-container">
             <img src="" alt="" class="about-swirl-deco" placeholder="Espiral/Línea Naranja" />
          </div>
        </div>
        <div class="about-text">
          <p>
            Tiggo es una plataforma innovadora diseñada para conectar a clientes que necesitan
            servicios técnicos con profesionales especializados en áreas como refrigeración,
            plomería, albañilería y electricidad. Nuestro objetivo es facilitar el acceso a expertos
            confiables y calificados, eliminando las dificultades de buscar y contratar técnicos
            por vías tradicionales.
          </p>
          <p>
            Con Tiggo, resolver tus "tigres" nunca fue tan fácil y seguro, porque priorizamos la calidad,
            la confianza y la satisfacción en cada trabajo realizado.
          </p>
        </div>
      </div>
    </section>
</template>

<style>
.about-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  padding-top: 4rem;
  align-items: start;
}

.about-preview h2 {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  line-height: 1.1;
  font-weight: 400; 
}

.about-text p {
  font-family: var(--font-mono); 
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--color-text-gray);
}

.about-section {
  padding: 6rem 1rem;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; 
  gap: 4rem;
  align-items: flex-start;
}

.about-visuals {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
}

.about-wavy-deco {
  width: 100px; 
  margin-bottom: 1rem;
  margin-left: -20px; 
}

.section-title {
  font-family: var(--font-heading);
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 400; 
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.swirl-container {
  width: 100%;
  display: flex;
  justify-content: center; 
  padding-right: 4rem; 
}

.about-swirl-deco {
  width: 150px; 
  display: block;
}

.about-text {
  padding-top: 4rem;
}

.about-text p {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  line-height: 1.8;
  color: #333; 
  margin-bottom: 2rem;
  text-align: justify; 
}

@media (max-width: 768px) {
  .about-preview {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .about-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .about-text {
    padding-top: 0;
  }
}
</style>