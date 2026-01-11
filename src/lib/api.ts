import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

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
      // Falls ja: NICHT ausloggen, sondern Fehler an die Page weitergeben.
      const isAuthRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');

      if (!isAuthRequest) {
        console.warn('Sitzung abgelaufen oder ungültig. Logout...');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        // Optional: Weiterleitung zum Login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;