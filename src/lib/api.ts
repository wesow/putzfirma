import axios from 'axios';

// HIER IST DIE ÄNDERUNG:
// Wir prüfen, ob wir im "Produktions-Modus" sind (online).
// Vite nutzt dafür "import.meta.env.PROD".
const baseURL = import.meta.env.PROD 
  ? 'https://glanzops.de/api'   // <--- Deine neue Domain (Online)
  : 'http://localhost:3000/api'; // <--- Dein PC (Lokal)

const api = axios.create({
  baseURL: baseURL,
  // Optional: Falls du Cookies nutzen willst, sonst kannst du es weglassen
  withCredentials: true, 
});

// --- Ab hier bleibt alles gleich wie vorher ---

// Request Interceptor (Token mitsenden)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor (Fehlerbehandlung)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Wenn 401 (Unauthorized) kommt
    if (error.response && error.response.status === 401) {
      
      // WICHTIG: Prüfen, ob der Fehler vom Login oder Register kommt.
      const isAuthRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');

      if (!isAuthRequest) {
        console.warn('Sitzung abgelaufen oder ungültig. Logout...');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('firstName'); // Auch den Namen löschen
        localStorage.removeItem('lastName');
        
        // Weiterleitung zum Login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;