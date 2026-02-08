<template>
    <footer id="contacto" class="contact-footer">   
      <div class="contact-cta container">
        <img src="../../assets/img/elemento7.svg" alt="" class="contact-spiral" placeholder="Espiral hacia abajo" />
        <h2 class="contact-title">CONTÁCTANOS</h2>
        <p class="contact-subtitle">
          ¿Tienes dudas o quieres saber más?<br>
          Estamos aquí para ayudarte.
        </p>
      </div>
      <div class="container">
        <hr class="contact-divider" />
      </div>
      <div class="footer-info container">
        <div class="footer-col footer-logo">
           <img src="../../assets/img/logo-tiggo.png" alt="Tiggo" class="logo-img-footer" />
        </div>
        <div class="footer-col footer-socials">
          <a href="#">
            <img width="50" height="50" src="https://img.icons8.com/ios-filled/50/instagram-new--v1.png" alt="instagram-new--v1"/>
          </a>
          <a href="#">
            <img width="50" height="50" src="https://img.icons8.com/ios-filled/50/facebook-new.png" alt="facebook-new"/>
          </a>
          <a href="#">
            <img width="50" height="50" src="https://img.icons8.com/ios-filled/50/twitterx--v1.png" alt="twitterx--v1"/>
          </a>
        </div>
        <div class="footer-col footer-address">
          <p class="location-text">
            CIUDAD GUAYANA,<br>VENEZUELA
          </p>
          <a href="mailto:contacto@tiggoapp.com" class="email-link">
            contacto@tiggoapp.com
          </a>
        </div>
      </div>
      <div class="copyright-bar">
        <p>© 2025 Tigro. Todos los derechos reservados</p>
      </div>
    </footer>
</template>

<style scoped>
.contact-footer {
  background-color: #F0F0F0; 
  padding-top: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact-cta {
  text-align: center;
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact-spiral {
  width: 50px;
  margin-bottom: 1rem;
}

.contact-title {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 400;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
}

.contact-subtitle {
  font-family: var(--font-mono);
  font-size: 1rem;
  color: #555;
  line-height: 1.5;
}

.contact-divider {
  border: 0;
  border-top: 1px solid #333;
  width: 80%;
  margin: 0 auto 3rem auto;
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 4rem;
}

.logo-img-footer {
  height: 40px;
}

.footer-socials {
  display: flex;
  gap: 1.5rem;
}

.social-icon {
  width: 40px; 
  height: 40px;
  display: block;
  transition: transform 0.2s;
}
.social-icon:hover {
  transform: scale(1.1);
}

.footer-address {
  text-align: left;
}

.location-text {
  font-family: var(--font-heading);
  color: var(--color-primary); 
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.email-link {
  font-family: var(--font-mono);
  color: #000;
  text-decoration: underline;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: block;
}

.copyright-bar {
  width: 100%;
  background-color: #111; 
  padding: 1.5rem;
  text-align: center;
  margin-top: auto;
}

.copyright-bar p {
  color: var(--color-primary); 
  font-size: 0.9rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .footer-info {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }
  .footer-address {
    text-align: center;
  }
}
</style>