// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { getCurrentUser, logout as apiLogout } from '../services/auth.service';

// // Wir erweitern das Interface, damit Dashboard & Co. nicht meckern
// export interface User {
//   id: string;
//   role: string;
//   email: string;
//   firstName: string;
//   lastName: string;
// }

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (userData: any) => void;
//   logout: () => void;
//   refreshUser: () => Promise<void>;
//   isAuthenticated: boolean; // Hilfs-Property
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   const refreshUser = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error("No token");
//       }
      
//       // Wir holen die frischen Daten vom Server
//       const userData = await getCurrentUser();
//       setUser(userData);
//     } catch (err) {
//       console.error("Session restoration failed:", err);
//       setUser(null);
//       localStorage.removeItem('token');
//     } finally {
//       // WICHTIG: Loading muss false werden, egal ob Erfolg oder Fehler
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     refreshUser();
//   }, []);

//   const login = (userData: any) => {
//     // Wir erwarten, dass userData.user das User-Objekt und userData.token den Token enthält
//     if (userData.token) {
//         localStorage.setItem('token', userData.token);
//     }
//     setUser(userData.user);
//   };

//   const logout = () => {
//     apiLogout(); // API Call (optional, je nach Backend)
//     localStorage.removeItem('token');
//     setUser(null);
//     window.location.href = '/login'; // Harter Redirect um State sicher zu leeren
//   };

//   return (
//     <AuthContext.Provider value={{ 
//       user, 
//       loading, 
//       login, 
//       logout, 
//       refreshUser,
//       isAuthenticated: !!user 
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// };

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as apiLogout } from '../services/auth.service';

export interface User {
  id: string;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: any) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    
    // Wenn kein Token da ist -> Einfach aufhören. Das ist kein Fehler!
    if (!token) {
      setLoading(false);
      return; 
    }

    try {
      // Token ist da, wir prüfen ihn beim Backend
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.warn("Sitzung ungültig, logge aus...", err);
      // Nur wenn der Server sagt "Token falsch", löschen wir ihn
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (userData: any) => {
    // Falls dein Backend { user: {...}, token: "..." } zurückgibt
    if (userData.token) {
        localStorage.setItem('token', userData.token);
    }
    setUser(userData.user || userData); // Fallback falls Struktur variiert
  };

  const logout = () => {
    apiLogout().catch(() => {}); // Fehler beim Logout ignorieren
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      refreshUser,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};