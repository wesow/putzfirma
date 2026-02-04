import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// =====================================================================
// 1. INTELLIGENTE URL-WAHL
// =====================================================================
const isProduction = import.meta.env.PROD;
const baseURL = isProduction ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Queue handling
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

    if (!originalRequest) return Promise.reject(error);

    // Check for 401 and ensure it's not a login/refresh attempt failing
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

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
        // We use the basic axios instance to avoid our own interceptors
        const { data } = await axios.post(
          `${baseURL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        
        localStorage.setItem('token', newToken);
        
        // Update the default header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Update the current request header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        
        localStorage.removeItem('token');
        
        // Only redirect if we aren't already going to the login page
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login?expired=true'; 
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