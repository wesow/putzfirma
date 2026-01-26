import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Settings, 
  LogOut, 
  Calendar, 
  UserCheck, 
  Package,
  FileSpreadsheet,
  ShieldCheck,
  Megaphone,
  Wallet,
  Palmtree,
  Receipt,
  Sparkles,
  FileCheck,
  ChevronRight
} from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'System Administrator',
  EMPLOYEE: 'Team Mitglied',
  CUSTOMER: 'Kunden-Portal'
};

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const role = user?.role; 
  const firstName = user?.firstName || 'Benutzer';
  const companyName = localStorage.getItem('companyName') || 'GlanzOps';

  // --- NAV SECTIONS ---
  const adminNav = [
    { section: 'Übersicht', items: [
        { icon: LayoutDashboard, label: 'Zentrale', path: '/dashboard' },
        { icon: Calendar, label: 'Einsatzplan', path: '/dashboard/calendar' },
    ]},
    { section: 'Stammdaten', items: [
        { icon: Users, label: 'Kundenstamm', path: '/dashboard/customers' },
        { icon: UserCheck, label: 'Team-Verwaltung', path: '/dashboard/team' },
        { icon: Sparkles, label: 'Leistungskatalog', path: '/dashboard/services' },
    ]},
    { section: 'Operativ', items: [
        { icon: Briefcase, label: 'Aufträge', path: '/dashboard/jobs' },
        { icon: FileText, label: 'Verträge', path: '/dashboard/contracts' },
        { icon: Palmtree, label: 'Abwesenheiten', path: '/dashboard/absences' },
        { icon: Package, label: 'Lager & Material', path: '/dashboard/inventory' },
    ]},
    { section: 'Finanzen', items: [
        { icon: Megaphone, label: 'Angebote', path: '/dashboard/offers' },
        { icon: FileCheck, label: 'Rechnungen', path: '/dashboard/invoices' },
        { icon: Receipt, label: 'Betriebsausgaben', path: '/dashboard/expenses' },
        { icon: Wallet, label: 'Lohnabrechnung', path: '/dashboard/payroll' },
        { icon: FileSpreadsheet, label: 'Berichts-Archiv', path: '/dashboard/reports' },
    ]},
    { section: 'System', items: [
        { icon: Settings, label: 'Einstellungen', path: '/dashboard/settings' },
    ]}
  ];

  const employeeNav = [
    { section: 'Mein Bereich', items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Briefcase, label: 'Meine Jobs', path: '/dashboard/jobs' },
        { icon: Calendar, label: 'Einsatzplan', path: '/dashboard/calendar' },
        { icon: Palmtree, label: 'Abwesenheit', path: '/dashboard/absences' },
    ]},
    { section: 'Ressourcen', items: [
        { icon: Package, label: 'Lagerbestand', path: '/dashboard/inventory' },
    ]}
  ];

  const customerNav = [
    { section: 'Portal', items: [
        { icon: LayoutDashboard, label: 'Übersicht', path: '/dashboard' },
        { icon: FileCheck, label: 'Meine Rechnungen', path: '/dashboard/invoices' },
    ]}
  ];

  const menuGroups = role === 'ADMIN' ? adminNav : role === 'CUSTOMER' ? customerNav : employeeNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 fixed h-full z-40 hidden md:flex flex-col shadow-2xl">
        
        {/* Header mit Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <span className="text-lg font-bold tracking-tight block truncate">GlanzOps</span>
            <span className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.2em]">Enterprise</span>
          </div>
        </div>
        
        {/* Navigation Scroll Area */}
        <nav className="flex-1 px-4 py-8 space-y-9 overflow-y-auto custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4">
                    {group.section}
                </p>
                <div className="space-y-1">
                    {group.items.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                        return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                            isActive 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'} />
                                <span className="text-sm">{item.label}</span>
                            </div>
                            {isActive && <ChevronRight size={14} className="text-white/50" />}
                        </Link>
                        );
                    })}
                </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 bg-slate-950/30 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl mb-3 border border-white/5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-inner shrink-0">
                {firstName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-white uppercase tracking-tight">{firstName}</p>
                <p className="text-[9px] text-slate-500 truncate font-bold tracking-widest uppercase mt-0.5">
                  {role ? ROLE_LABELS[role] : 'Gast'}
                </p>
              </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-xs font-bold uppercase tracking-widest group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Abmelden
          </button>
        </div>
      </aside>

      {/* HAUPTINHALT */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 animate-in fade-in duration-500 w-full overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto">
            <Outlet />
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-2 py-3 flex justify-around items-center z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] pb-safe">
          <Link to="/dashboard" className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${location.pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
              <LayoutDashboard size={22} strokeWidth={location.pathname === '/dashboard' ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-tighter">Zentrale</span>
          </Link>
          <Link to="/dashboard/jobs" className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${location.pathname.includes('jobs') ? 'text-blue-600' : 'text-slate-400'}`}>
              <Briefcase size={22} strokeWidth={location.pathname.includes('jobs') ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-tighter">Jobs</span>
          </Link>
          <Link to="/dashboard/calendar" className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${location.pathname.includes('calendar') ? 'text-blue-600' : 'text-slate-400'}`}>
              <Calendar size={22} strokeWidth={location.pathname.includes('calendar') ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-tighter">Planer</span>
          </Link>
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 px-4 py-1 text-slate-400">
              <LogOut size={22} />
              <span className="text-[9px] font-bold uppercase tracking-tighter text-red-500/70">Logout</span>
          </button>
      </div>

    </div>
  );
}