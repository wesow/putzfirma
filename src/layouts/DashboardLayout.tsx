import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  CalendarCheck, 
  LogOut, 
  HardHat
} from 'lucide-react';
import clsx from 'clsx';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem('role'); // "ADMIN" oder "EMPLOYEE"

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Die Menüpunkte
  const navigation = [
    { name: 'Übersicht', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Aufträge (Jobs)', href: '/dashboard/jobs', icon: CalendarCheck },
    { name: 'Kunden', href: '/dashboard/customers', icon: Users },
    { name: 'Dienstleistungen', href: '/dashboard/services', icon: Briefcase },
    { name: 'Verträge', href: '/dashboard/contracts', icon: FileText },
    { name: 'Team', href: '/dashboard/team', icon: HardHat },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      
      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-wider">CleanOps 🧹</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Edition</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium',
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-white">Eingeloggt als:</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-700 text-blue-300">
              {role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Abmelden
          </button>
        </div>
      </div>

      {/* --- HAUPTINHALT (Rechts) --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Leiste (Optional für Suche oder Profil) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700">
            Verwaltungsoberfläche
          </h2>
        </header>

        {/* Hier wird der eigentliche Inhalt der Seite geladen */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}