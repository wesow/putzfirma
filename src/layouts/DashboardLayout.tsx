import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  Calendar, 
  PieChart, 
  Receipt, 
  Wallet, 
  Palmtree, 
  Percent,
  Settings, // NEU
  UserCircle
} from 'lucide-react';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState('Benutzer');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setRole(localStorage.getItem('role'));
    const first = localStorage.getItem('firstName') || '';
    const last = localStorage.getItem('lastName') || '';
    if (first) setUserName(`${first} ${last}`);
  }, []);

  // Menu Items Konfiguration
  const menuItems = [
    { icon: LayoutDashboard, label: 'Übersicht', path: '/dashboard', exact: true },
    
    // Operativ
    { icon: Calendar, label: 'Kalender', path: '/dashboard/calendar' },
    { icon: Briefcase, label: 'Jobs & Einsätze', path: '/dashboard/jobs' },
    
    // Verwaltung (Nur Admin)
    { icon: Users, label: 'Kunden', path: '/dashboard/customers', adminOnly: true }, // Nur Pfad korrigiert
    { icon: FileText, label: 'Verträge', path: '/dashboard/contracts', adminOnly: true },
    { icon: Users, label: 'Team', path: '/dashboard/team', adminOnly: true },
    
    // Finanzen (Nur Admin)
    { icon: Percent, label: 'Angebote', path: '/dashboard/offers', adminOnly: true },
    { icon: Receipt, label: 'Rechnungen', path: '/dashboard/invoices', adminOnly: true },
    { icon: Wallet, label: 'Ausgaben', path: '/dashboard/expenses', adminOnly: true },
    { icon: PieChart, label: 'Berichte', path: '/dashboard/reports', adminOnly: true },
    
    // HR
    { icon: Palmtree, label: 'Urlaub & Krank', path: '/dashboard/absences' },

    // NEU: EINSTELLUNGEN (Nur Admin)
    { icon: Settings, label: 'Einstellungen', path: '/dashboard/settings', adminOnly: true },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Menu schließen bei Navigation (Mobil)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CleanOps
          </div>
          <button 
            className="ml-auto lg:hidden text-slate-400"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item, index) => {
            // Admin Check
            if (item.adminOnly && role !== 'ADMIN') return null;

            return (
              <NavLink
                key={index}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
              <UserCircle size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{role === 'ADMIN' ? 'Administrator' : 'Mitarbeiter'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-900/30 hover:text-red-400 text-slate-300 py-2 rounded-lg text-sm transition-colors"
          >
            <LogOut size={16} /> Abmelden
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:hidden shrink-0">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-slate-800">CleanOps</span>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}