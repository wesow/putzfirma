import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth(); // <--- WICHTIG: 'loading' aus dem Context nutzen
  const location = useLocation();

  // 1. Solange wir noch prüfen (Laden), zeigen wir NUR einen Spinner.
  // Kein Redirect, kein Inhalt. Einfach warten.
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Lade System...</p>
      </div>
    );
  }

  // 2. Wenn fertig geladen und KEIN User da -> Login
  if (!user) {
    // Wir merken uns, wo er hin wollte (state: { from: location })
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Wenn User da, aber falsche Rolle -> Dashboard (oder 403 Page)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Alles gut -> Zeige den Inhalt
  return <Outlet />;
}