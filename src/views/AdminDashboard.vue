<template>
    <div class="admin-dashboard-container">
      
      <!-- Header -->
      <div class="header-section">
          <div class="title-group">
              <h1>Panel de Administración</h1>
              <span class="role-badge admin">Superusuario</span>
          </div>
          <button @click="logout" class="btn-logout">Cerrar Sesión</button>
      </div>
  
      <div v-if="adminStore.loading && !adminStore.services.length" class="loading-state">
          <div class="spinner"></div> Cargando datos del sistema...
      </div>
  
      <div v-else>
          <!-- 1. Tarjetas de Estadísticas -->
          <section class="stats-grid">
              <div class="stat-card">
                  <h3>Total Usuarios</h3>
                  <p class="stat-number">{{ adminStore.stats?.total_users || 0 }}</p>
              </div>
              <div class="stat-card">
                  <h3>Técnicos</h3>
                  <p class="stat-number">{{ adminStore.stats?.total_technicians || 0 }}</p>
              </div>
              <div class="stat-card">
                  <h3>Solicitudes Totales</h3>
                  <p class="stat-number">{{ adminStore.stats?.total_requests || 0 }}</p>
              </div>
              <div class="stat-card highlight">
                  <h3>Completadas</h3>
                  <p class="stat-number">{{ adminStore.stats?.completed_requests || 0 }}</p>
              </div>
          </section>
  
          <!-- 2. Gestión de Servicios (TABLA) -->
          <section class="content-section">
              <div class="section-header">
                  <h2>Catálogo de Servicios</h2>
                  <!-- Botón para CREAR -->
                  <button @click="openCreateModal" class="btn-primary small">+ Nuevo Servicio</button>
              </div>
              
              <div class="table-responsive">
                  <table>
                      <thead>
                          <tr>
                              <th style="width: 50px;">ID</th>
                              <th>Nombre del Servicio</th>
                              <th>Descripción</th>
                              <th style="width: 100px;">Acciones</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-for="service in adminStore.services" :key="service.id">
                              <td>#{{ service.id }}</td>
                              <td><strong>{{ service.name }}</strong></td>
                              <td>{{ service.description || 'Sin descripción' }}</td>
                              <td>
                                  <!-- Botón para EDITAR -->
                                  <button class="btn-icon" title="Editar" @click="openEditModal(service)">✏️</button>
                              </td>
                          </tr>
                          <tr v-if="adminStore.services.length === 0">
                              <td colspan="4" class="text-center">No hay servicios registrados.</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </section>
  
          <!-- 3. Actividad Reciente -->
          <section class="content-section">
              <h2>Actividad Reciente</h2>
              <div class="table-responsive">
                  <table>
                      <thead>
                          <tr>
                              <th>ID</th>
                              <th>Servicio</th>
                              <th>Cliente</th>
                              <th>Técnico</th>
                              <th>Estado</th>
                              <th>Fecha</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-for="req in adminStore.recentRequests" :key="req.id">
                              <td>#{{ req.id }}</td>
                              <td>{{ req.service?.name }}</td>
                              <td>{{ req.client?.name }}</td>
                              <td>{{ req.technician?.name || '---' }}</td>
                              <td><span :class="['status-dot', req.status]"></span> {{ req.status }}</td>
                              <td>{{ new Date(req.created_at).toLocaleDateString() }}</td>
                          </tr>
                          <tr v-if="adminStore.recentRequests.length === 0">
                              <td colspan="6" class="text-center">No hay actividad reciente.</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </section>
  
          <!-- 4. Lista de Usuarios -->
          <section class="content-section">
              <h2>Usuarios Registrados</h2>
              <div class="table-responsive">
                  <table>
                      <thead>
                          <tr>
                              <th>Nombre</th>
                              <th>Email</th>
                              <th>Rol</th>
                              <th>Registro</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-for="user in adminStore.users" :key="user.id">
                              <td><strong>{{ user.name }}</strong></td>
                              <td>{{ user.email }}</td>
                              <td>
                                  <span :class="['role-tag', getRoleClass(user.role)]">
                                      {{ user.role }}
                                  </span>
                              </td>
                              <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </section>
      </div>
  
      <!-- Modal Servicio (Compartido para Crear y Editar) -->
      <div v-if="showServiceModal" class="modal-overlay">
          <div class="modal-content">
              <h3>{{ isEditing ? 'Editar Servicio' : 'Agregar Nuevo Servicio' }}</h3>
              
              <label>Nombre:</label>
              <input v-model="serviceForm.name" placeholder="Ej. Electricista" />
              
              <label>Descripción:</label>
              <textarea v-model="serviceForm.description" placeholder="Breve descripción..."></textarea>
              
              <div class="modal-actions">
                  <button @click="showServiceModal = false" class="btn-text">Cancelar</button>
                  <button @click="handleServiceSubmit" class="btn-primary">
                      {{ isEditing ? 'Actualizar' : 'Guardar' }}
                  </button>
              </div>
          </div>
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref, reactive } from 'vue';
  import { useAdminStore } from '../store/modules/admin/adminStore';
  import { useLoginStore } from '../store/modules/forms/loginStore';
  import { useRouter } from 'vue-router';
  
  const adminStore = useAdminStore();
  const loginStore = useLoginStore();
  const router = useRouter();
  
  const showServiceModal = ref(false);
  const isEditing = ref(false); // Flag para saber si editamos o creamos
  const serviceForm = reactive({ id: null, name: '', description: '' });
  
  onMounted(() => {
      adminStore.fetchDashboardData();
  });
  
  // Abrir modal para CREAR
  const openCreateModal = () => {
      isEditing.value = false;
      serviceForm.id = null;
      serviceForm.name = '';
      serviceForm.description = '';
      showServiceModal.value = true;
  };
  
  // Abrir modal para EDITAR
  const openEditModal = (service) => {
      isEditing.value = true;
      serviceForm.id = service.id;
      serviceForm.name = service.name;
      serviceForm.description = service.description;
      showServiceModal.value = true;
  };
  
  const handleServiceSubmit = async () => {
      if (!serviceForm.name) return;
      
      let success = false;
      if (isEditing.value) {
          // Actualizar
          success = await adminStore.updateService(serviceForm.id, serviceForm.name, serviceForm.description);
      } else {
          // Crear
          success = await adminStore.createNewService(serviceForm.name, serviceForm.description);
      }
  
      if (success) {
          showServiceModal.value = false;
      }
  };
  
  const getRoleClass = (role) => {
      if (role === 'Técnico') return 'tech';
      if (role === 'Administrador') return 'admin-tag';
      return 'client';
  };
  
  const logout = () => {
      loginStore.logout();
      router.push('/auth');
  };
  </script>
  
  <style scoped>
  .admin-dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: 'Segoe UI', sans-serif;
      background-color: #f8f9fa;
      min-height: 100vh;
  }
  
  .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
  }
  .header-section h1 { margin: 0; color: #2c3e50; }
  .role-badge.admin { 
      background-color: #2c3e50; color: white; 
      padding: 0.2rem 0.6rem; border-radius: 4px; 
      font-size: 0.8rem; vertical-align: middle; margin-left: 10px;
  }
  
  .btn-logout {
      padding: 0.5rem 1rem;
      background-color: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;
  }
  
  /* Stats Grid */
  .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
  }
  .stat-card {
      background: white; padding: 1.5rem; border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align: center;
  }
  .stat-card h3 { margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #7f8c8d; text-transform: uppercase; }
  .stat-number { font-size: 2rem; font-weight: bold; color: #2c3e50; margin: 0; }
  .stat-card.highlight .stat-number { color: #27ae60; }
  
  /* Sections & Tables */
  .content-section {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .content-section h2 { margin-top: 0; color: #34495e; font-size: 1.2rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
  
  .table-responsive { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  th { text-align: left; padding: 0.8rem; background: #f8f9fa; color: #7f8c8d; font-size: 0.85rem; font-weight: 600; }
  td { padding: 0.8rem; border-bottom: 1px solid #eee; font-size: 0.9rem; vertical-align: middle;}
  .text-center { text-align: center; color: #999; font-style: italic;}
  
  /* Status Dots */
  .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
  .status-dot.pendiente { background: #f1c40f; }
  .status-dot.asignado { background: #3498db; }
  .status-dot.completado { background: #27ae60; }
  .status-dot.cancelado { background: #e74c3c; }
  
  /* Role Tags */
  .role-tag { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
  .role-tag.tech { background: #e3f2fd; color: #1976d2; }
  .role-tag.client { background: #f3e5f5; color: #7b1fa2; }
  .role-tag.admin-tag { background: #263238; color: #fff; }
  
  /* Modal & Buttons */
  .btn-primary { background: #3498db; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 4px; cursor: pointer; }
  .btn-primary.small { padding: 0.4rem 0.8rem; font-size: 0.9rem; }
  .btn-icon { background: none; border: 1px solid #ddd; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; }
  .btn-icon:hover { background-color: #f0f0f0; }
  
  .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
  .modal-content { background: white; padding: 2rem; border-radius: 8px; width: 400px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
  .modal-content input, .modal-content textarea { padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; width: 100%; box-sizing: border-box; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
  .btn-text { background: none; border: none; cursor: pointer; color: #7f8c8d; }
  </style>