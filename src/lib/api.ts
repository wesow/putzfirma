import axios from 'axios';

// ==========================================
// KONFIGURATION
// ==========================================
// WICHTIG: Prüfe, auf welchem Port dein Backend läuft! (Meist 5000)
// VITE_API_URL kommt aus deiner .env Datei im Frontend-Ordner.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Wichtig für Cookies (Refresh Token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// 1. REQUEST INTERCEPTOR (Token anhängen)
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// 2. RESPONSE INTERCEPTOR (Fehlerbehandlung)
// ==========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Wenn 401 (Unauthorized) kommt
    if (error.response && error.response.status === 401) {
      
      // Prüfen: War das ein Login-Versuch? Wenn ja, nicht redirecten (damit man die Fehlermeldung sieht)
      const isAuthRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');

      if (!isAuthRequest) {
        // Nur redirecten, wenn wir NICHT eh schon auf der Login-Seite sind
        if (window.location.pathname !== '/login') {
            console.warn('Sitzung abgelaufen oder ungültig. Logout...');
            
            // Alles löschen
            localStorage.clear();
            
            // Weiterleitung
            window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;