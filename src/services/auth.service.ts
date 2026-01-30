import api from '../lib/api';

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

export const getCurrentUser = async () => {
  // 1. Token holen
  const token = localStorage.getItem('token');
  
  if (!token) return null;

  // 2. WICHTIG: Explizit den Header setzen!
  // Falls dein Axios-Interceptor (in lib/api) mal versagt, fängt das hier den Fehler ab.
  const response = await api.get('/auth/me', {
    headers: {
        Authorization: `Bearer ${token}`
    }
  });
  
  return response.data; // Erwartet: { id, email, role, firstName, ... }
};

export const login = async (email: string, password: string) => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  
  if (response.data.accessToken) {
    // 3. WICHTIG: Nur den Token speichern!
    // Role, Name usw. holen wir uns frisch über den Context / getCurrentUser.
    // Das verhindert Sync-Fehler (z.B. User wird im Backend zum Admin, aber im LocalStorage steht noch Employee).
    localStorage.setItem('token', response.data.accessToken);
  }
  
  return response.data;
};

export const logout = async () => {
  try {
    // Optional: Backend Bescheid sagen (für Blacklisting/Audit)
    const token = localStorage.getItem('token');
    if (token) {
        await api.post('/auth/logout', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
  } catch (e) {
    console.error("Logout API Fehler (ignoriert):", e);
  } finally {
    // 4. Aufräumen: Alles weg
    localStorage.removeItem('token');
    localStorage.clear(); // Zur Sicherheit alles putzen
    
    // Hard Reload zum Login, um React State komplett zu leeren
    window.location.href = '/login';
  }
};

// --- EINLADUNG ANNEHMEN (Registrierung) ---
export const registerWithInvite = async (data: RegisterWithInviteData) => {
  return await api.post('/auth/register-with-invite', data);
};

// --- EINLADUNG ERSTELLEN (Nur Admin) ---
export const createInvite = async (email: string, role: string, firstName: string, lastName: string, position: string) => {
    // Stellen wir sicher, dass auch hier der Token genutzt wird (wird meist vom Interceptor gemacht, aber sicher ist sicher)
    const token = localStorage.getItem('token');
    return await api.post('/auth/invite', { email, role, firstName, lastName, position }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};