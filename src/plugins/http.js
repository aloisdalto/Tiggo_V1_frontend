import axios from 'axios';
import router from '../router'; // Asegúrate de que la ruta sea correcta

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Buena práctica añadir esto
  },
  withCredentials: true, // para enviar cookies y token CSRF
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ¡ESTA ES LA PARTE IMPORTANTE QUE FALTA!
  // Axios por defecto no envía este header en peticiones cross-origin,
  // aunque withCredentials sea true.
  // Debemos establecerlo manualmente.
  config.headers['X-XSRF-TOKEN'] = getXsrfToken();

  return config;
}, error => {
  return Promise.reject(error);
});

// (Opcional pero recomendado) Manejo de errores 401/403
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('auth_token');
      router.push('/auth'); 
    }
    return Promise.reject(error);
  }
);


export default instance;

// ---- FUNCIONES HELPER ----

/**
 * Obtiene el valor de la cookie XSRF-TOKEN
 */
function getXsrfToken() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.split('=').map(c => c.trim());
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Llama a /sanctum/csrf-cookie
 * Ahora usa la instancia 'instance' para consistencia
 */
export async function getCsrfCookie() {
  // Usamos la instancia 'instance' para asegurar que usamos la misma config
  // pero necesitamos la URL base (sin /api)
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');
  
  await instance.get(`${baseUrl}/sanctum/csrf-cookie`);
}