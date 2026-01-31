import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCurrentUser, logout as apiLogout } from '../services/auth.service';

// 1. Definition des User-Objekts
export interface User {
  id: string;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
}

// 2. Definition des Context-Inhalts
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: any) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider Komponente
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // === A. SESSION PRÜFEN (Beim App-Start) ===
  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser();
      
      if (userData) {
        setUser(userData);
      } else {
        throw new Error("Keine Userdaten erhalten");
      }
    } catch (error) {
      console.error("❌ [AuthContext] Session ungültig oder abgelaufen:", error);
      // Wir löschen hier nicht sofort alles, da der Axios-Interceptor 
      // in der api.ts bereits einen Refresh-Versuch unternommen hat.
      // Wenn wir hier landen, ist die Session wirklich tot.
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // === B. LOGIN (Tokens & User-Daten speichern) ===
  const login = (data: any) => {
    console.log("🔓 [AuthContext] Login erfolgreich", data);

    // Speichere beide Tokens im LocalStorage
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    // User-Daten setzen
    const userObj = data.user ? data.user : data;
    setUser(userObj);
    setLoading(false);
  };

  // === C. LOGOUT (Clean Up) ===
  const logout = () => {
    console.log("🔒 [AuthContext] Logout wird ausgeführt");

    // Optionaler API-Call fürs Backend (Token invalidieren)
    apiLogout().catch((err) => console.warn("Logout API Warnung:", err));
    
    // LocalStorage komplett leeren
    localStorage.clear();
    setUser(null);
    
    // Redirect zum Login
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user,
      login, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook exportieren
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};