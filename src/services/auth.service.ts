// src/services/auth.service.ts
import api from '../lib/api';

// Typen für die API Calls
interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;      // ADMIN, EMPLOYEE
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

export const getCurrentUser = async () => {
  // Dieser Call geht an dein Backend /auth/me
  const response = await api.get('/auth/me');
  return response.data; // Gibt { id, email, role, firstName } zurück
};
// === AUTH FUNKTIONEN ===

export const login = async (email: string, password: string) => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  
  if (response.data.accessToken) {
    // Speichere die Daten konsistent
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('role', response.data.user.role); // Wichtig für DashboardLayout
    localStorage.setItem('firstName', response.data.user.firstName);
    localStorage.setItem('lastName', response.data.user.lastName);
    localStorage.setItem('email', response.data.user.email);
  }
  
  return response.data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (e) {
    // Fehler ignorieren
  }
  // Alles löschen
  localStorage.clear(); 
  window.location.href = '/login';
};

// --- EINLADUNG ANNEHMEN (Registrierung) ---
export const registerWithInvite = async (data: RegisterWithInviteData) => {
  // Hier geben wir direkt die Antwort zurück
  return await api.post('/auth/register-with-invite', data);
};

// --- EINLADUNG ERSTELLEN (Nur Admin) ---
// Ich habe 'position' hinzugefügt, damit die berufliche Rolle (Manager/Employee) mitkommt
export const createInvite = async (email: string, role: string, firstName: string, lastName: string, position: string) => {
  return await api.post('/auth/invite', { email, role, firstName, lastName, position });
};