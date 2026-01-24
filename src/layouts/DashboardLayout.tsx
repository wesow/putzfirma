import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Settings, 
  LogOut, 
  Calendar, 
  CreditCard, 
  UserCheck, 
  PieChart,
  Package,
  FileSpreadsheet,
  ShieldCheck,
  Megaphone
} from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Rolle und Name laden
  const role = localStorage.getItem('role');
  const firstName = localStorage.getItem('firstName') || 'Benutzer';
  const companyName = localStorage.getItem('companyName'); // Falls Kunde Firmenname hat

  // --- 1. ADMIN MENU ---
  const adminNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Megaphone, label: 'Vertrieb & Angebote', path: '/dashboard/offers' },
    { icon: Users, label: 'Kunden', path: '/dashboard/customers' },
    { icon: FileText, label: 'Verträge', path: '/dashboard/contracts' },
    { icon: Briefcase, label: 'Aufträge', path: '/dashboard/jobs' },
    { icon: UserCheck, label: 'Team & HR', path: '/dashboard/team' },
    { icon: Calendar, label: 'Planung', path: '/dashboard/calendar' },
    { icon: FileSpreadsheet, label: 'Berichte', path: '/dashboard/reports' },
    { icon: CreditCard, label: 'Finanzen', path: '/dashboard/invoices' },
    { icon: Package, label: 'Lager', path: '/dashboard/inventory' },
    { icon: Settings, label: 'Einstellungen', path: '/dashboard/settings' },
  ];

  // --- 2. MITARBEITER MENU ---
  const employeeNav = [
    { icon: LayoutDashboard, label: 'Mein Bereich', path: '/dashboard' },
    { icon: Briefcase, label: 'Meine Jobs', path: '/dashboard/jobs' },
    { icon: Calendar, label: 'Kalender', path: '/dashboard/calendar' },
    { icon: UserCheck, label: 'Abwesenheiten', path: '/dashboard/absences' },
    { icon: Package, label: 'Material', path: '/dashboard/inventory' },
  ];

  // --- 3. KUNDEN MENU (NEU!) ---
  const customerNav = [
    { icon: LayoutDashboard, label: 'Übersicht', path: '/dashboard' },
    // Hier kannst du später Links hinzufügen wie:
    // { icon: FileText, label: 'Meine Rechnungen', path: '/dashboard/my-invoices' },
    // { icon: Settings, label: 'Mein Profil', path: '/dashboard/profile' },
  ];

  // --- LOGIK: WELCHES MENU ZEIGEN? ---
  let navItems = employeeNav; // Default (Sicherheit)
  if (role === 'ADMIN') navItems = adminNav;
  if (role === 'CUSTOMER') navItems = customerNav;


  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 fixed h-full z-20 hidden md:flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight block">CleanOps</span>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Enterprise</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-xl mb-3">
             <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                {firstName.charAt(0)}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{companyName || firstName}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{role?.toLowerCase()}</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors text-sm"
          >
            <LogOut size={18} /> Abmelden
          </button>
        </div>
      </aside>

      {/* HAUPTINHALT */}
      <main className="flex-1 md:ml-64 p-8 animate-in fade-in duration-300">
        <div className="max-w-7xl mx-auto">
           <Outlet />
        </div>
      </main>

    </div>
  );
}