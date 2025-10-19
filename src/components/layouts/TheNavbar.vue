<template>
    <nav class="navbar">
        <router-link to="/">Home</router-link>
        <router-link to="/auth">Login y Registro</router-link>
        <router-link to="/dashboard">Pedir Servicio</router-link>
        <router-link to="/status/1">Servicio Estado</router-link>
    </nav>
</template>

<style scoped>
.navbar{
    display: flex;
    gap: 20px;
}
</style>