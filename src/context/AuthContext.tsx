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
  
  // WICHTIG: Startet IMMER auf true
  const [loading, setLoading] = useState<boolean>(true);

  // === A. SESSION PRÜFEN ===
  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    
    console.log("🔄 [AuthContext] Prüfe Session...", token ? "Token vorhanden" : "Kein Token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser();
      
      if (userData) {
        console.log("✅ [AuthContext] User erfolgreich geladen:", userData.email);
        setUser(userData);
      } else {
        throw new Error("Keine Userdaten erhalten");
      }
    } catch (error) {
      console.error("❌ [AuthContext] Session ungültig:", error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // === B. LOGIN ===
  const login = (data: any) => {
    console.log("🔓 [AuthContext] Login wird ausgeführt", data);

    if (data.accessToken || data.token) {
      localStorage.setItem('token', data.accessToken || data.token);
    }

    const userObj = data.user ? data.user : data;
    setUser(userObj);
    setLoading(false);
  };

  // === C. LOGOUT ===
  const logout = () => {
    console.log("🔒 [AuthContext] Logout");

    apiLogout().catch((err) => console.warn("Logout API Warnung:", err));
    
    localStorage.removeItem('token');
    localStorage.clear();
    setUser(null);
    
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