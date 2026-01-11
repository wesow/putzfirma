import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[]; // Welche Rollen dürfen rein? z.B. ['ADMIN', 'EMPLOYEE']
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  // Wir holen die aktuelle Rolle aus dem Speicher
  const role = localStorage.getItem('role') || 'CUSTOMER';

  // Ist die Rolle in der Liste der erlaubten Rollen?
  if (!allowedRoles.includes(role)) {
    // Falls NEIN: Zurück zum Dashboard werfen
    return <Navigate to="/dashboard" replace />;
  }

  // Falls JA: Seite anzeigen
  return <>{children}</>;
} 