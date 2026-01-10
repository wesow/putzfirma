import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

// 1. Request Interceptor: Fügt den Token hinzu (Hatten wir schon)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: Fängt Fehler ab (NEU!)
api.interceptors.response.use(
  (response) => response, // Alles gut, Antwort durchlassen
  (error) => {
    // Wenn der Server sagt "401 Unauthorized" oder "403 Forbidden"
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Sitzung abgelaufen oder ungültig. Logout...');
      
      // Token löschen
      localStorage.removeItem('token');
      localStorage.removeItem('role');

      // Hart zum Login umleiten (nur wenn wir nicht schon da sind)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;