<template>
  <div class="landing-page">
    <the-navbar></the-navbar>
    <the-header></the-header>
    <about-section></about-section>
    <the-footer></the-footer>
  </div>
</template>

<script setup>
import TheNavbar from '../components/layouts/TheNavbar.vue';
import TheHeader from '../components/layouts/TheHeader.vue';
import TheFooter from '../components/layouts/TheFooter.vue';
import AboutSection from '../components/sections/AboutSection.vue';
</script>

<style scoped>
.landing-page {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}
</style>