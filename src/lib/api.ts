import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// =====================================================================
// 1. INTELLIGENTE URL-WAHL
// =====================================================================
// Vite setzt import.meta.env.PROD automatisch auf 'true' beim Build.
// - Development: Wir nutzen localhost:5000
// - Production (Docker): Wir nutzen nur "/api". Der Browser hängt das
//   automatisch an die aktuelle Domain/IP an, und Nginx regelt den Rest.
const isProduction = import.meta.env.PROD;
const baseURL = isProduction ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Wichtig für Cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Queue für fehlgeschlagene Requests während des Refreshs
let isRefreshing = false;
let failedQueue: Array<{ 
  resolve: (token: string) => void; 
  reject: (error: any) => void; 
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// =====================================================================
// 2. REQUEST INTERCEPTOR (Token anhängen)
// =====================================================================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================================================
// 3. RESPONSE INTERCEPTOR (Auto-Refresh bei 401)
// =====================================================================
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Wenn kein config Objekt da ist, einfach Fehler werfen
    if (!originalRequest) return Promise.reject(error);

    // Prüfen auf 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Verhindern, dass wir in eine Loop geraten
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      // Falls gerade schon ein Refresh läuft -> Warteschlange
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh Request senden
        // Wir nutzen hier eine neue axios-Instanz, um Interceptor-Loops zu vermeiden,
        // aber wir nutzen dieselbe baseURL!
        const { data } = await axios.post(
          `${baseURL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        
        // Neuen Token speichern
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Warteschlange abarbeiten
        processQueue(null, newToken);
        
        // Ursprünglichen Request wiederholen
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Wenn Refresh fehlschlägt: Logout
        localStorage.removeItem('token');
        // Optional: User zur Login-Seite leiten, aber sauberer ist es via React Router
        if (window.location.pathname !== '/login') {
            window.location.href = '/login'; 
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;