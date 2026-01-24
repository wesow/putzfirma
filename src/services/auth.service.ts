// src/services/auth.service.ts
import api from '../lib/api'; // Importiere deine axios-Instanz (den Code, den du mir oben geschickt hast)

// Typen für die API Calls
interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

interface RegisterWithInviteData {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
}

// === AUTH FUNKTIONEN ===

export const login = async (email: string, password: string) => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  
  if (response.data.accessToken) {
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('role', response.data.user.role);
    localStorage.setItem('userName', response.data.user.firstName);
  }
  
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (e) {
    // Fehler ignorieren, wir loggen lokal trotzdem aus
  }
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userName');
  window.location.href = '/login';
};

// --- NEU: EINLADUNG ANNEHMEN ---
export const registerWithInvite = async (data: RegisterWithInviteData) => {
  return await api.post('/auth/register-with-invite', data);
};

// --- NEU: EINLADUNG ERSTELLEN (Nur Admin) ---
export const createInvite = async (email: string, role: string, firstName: string, lastName: string) => {
  return await api.post('/auth/invite', { email, role, firstName, lastName });
};