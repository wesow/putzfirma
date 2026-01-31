import {
  Briefcase,
  Calendar,
  ChevronRight,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Palmtree, Receipt,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  EMPLOYEE: 'Team',
  CUSTOMER: 'Kunde',
  MANAGER: 'Manager'
};

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const role = user?.role; 
  const firstName = user?.firstName || 'Benutzer';

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // --- NAV SECTIONS ---
  const adminNav = [
    { section: 'Übersicht', items: [
        { icon: LayoutDashboard, label: 'Zentrale', path: '/dashboard' },
        { icon: Calendar, label: 'Einsatzplan', path: '/dashboard/calendar' },
    ]},
    { section: 'Stammdaten', items: [
        { icon: Users, label: 'Kunden', path: '/dashboard/customers' },
        { icon: UserCheck, label: 'Team', path: '/dashboard/team' },
        { icon: Sparkles, label: 'Leistungen', path: '/dashboard/services' },
    ]},
    { section: 'Operativ', items: [
        { icon: Briefcase, label: 'Aufträge', path: '/dashboard/jobs' },
        { icon: FileText, label: 'Verträge', path: '/dashboard/contracts' },
        { icon: Palmtree, label: 'Abwesenheit', path: '/dashboard/absences' },
        { icon: Package, label: 'Lager', path: '/dashboard/inventory' },
    ]},
    { section: 'Finanzen', items: [
        { icon: Landmark, label: 'Banking', path: '/dashboard/finance' }, 
        { icon: Megaphone, label: 'Angebote', path: '/dashboard/offers' },
        { icon: FileCheck, label: 'Rechnungen', path: '/dashboard/invoices' },
        { icon: Receipt, label: 'Ausgaben', path: '/dashboard/expenses' },
        { icon: Wallet, label: 'Lohn', path: '/dashboard/payroll' },
        { icon: FileSpreadsheet, label: 'Berichte', path: '/dashboard/reports' },
    ]},
    { section: 'System', items: [
        { icon: ShieldAlert, label: 'Audit', path: '/dashboard/audit' },
        { icon: Settings, label: 'Optionen', path: '/dashboard/settings' },
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
        { icon: Package, label: 'Lager', path: '/dashboard/inventory' },
    ]}
  ];

  const customerNav = [
    { section: 'Portal', items: [
        { icon: LayoutDashboard, label: 'Übersicht', path: '/dashboard' },
        { icon: FileCheck, label: 'Rechnungen', path: '/dashboard/invoices' },
    ]}
  ];

  const menuGroups = role === 'ADMIN' || role === 'MANAGER' ? adminNav : role === 'CUSTOMER' ? customerNav : employeeNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-[260px] md:w-56 lg:w-60 bg-slate-900 text-white flex flex-col shadow-2xl shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-3 flex items-center justify-between border-b border-white/5 h-14">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <span className="text-sm font-bold tracking-tight block truncate text-white leading-none">GlanzOps</span>
              <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">Enterprise</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-3 space-y-5 overflow-y-auto custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <p className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 opacity-80">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-200 group ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-medium' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon size={15} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'} />
                        <span className="text-[12px]">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={10} className="text-white/50" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 bg-slate-950/30 border-t border-white/5 pb-safe">
          <div className="flex items-center gap-2 px-2 py-2 bg-white/5 rounded-lg mb-2 border border-white/5">
              <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold shadow-inner shrink-0">
                {firstName.charAt(0)}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-[11px] font-semibold truncate text-white tracking-tight">{firstName}</p>
                <p className="text-[8px] text-slate-500 truncate font-bold tracking-wider uppercase">
                  {role ? ROLE_LABELS[role] : 'Gast'}
                </p>
              </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider group"
          >
            <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" /> 
            Abmelden
          </button>
        </div>
      </aside>

      {/* === HAUPTINHALT (FULL WIDTH FIX) === */}
      <div className="flex-1 flex flex-col min-h-screen w-full relative bg-slate-50">
        
        {/* MOBILE TOP BAR */}
        <header className="md:hidden bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-3 py-2 flex items-center justify-between shadow-sm h-12">
           <div className="flex items-center gap-2">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 transition-all">
                <Menu size={20} />
              </button>
              <span className="font-bold text-slate-800 tracking-tight text-sm">GlanzOps</span>
           </div>
           <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-200">
              {firstName.charAt(0)}
           </div>
        </header>

        {/* CONTENT AREA - 100% Breite, minimales Padding */}
        <main className="flex-1 w-full animate-in fade-in duration-500 overflow-x-hidden pb-20 md:pb-0">
             {/* WICHTIG: Kein max-w-7xl mehr! */}
             <Outlet />
        </main>

        {/* MOBILE BOTTOM NAV */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1.5 flex justify-between items-center z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] pb-safe">
            <Link to="/dashboard" className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${location.pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutDashboard size={18} strokeWidth={location.pathname === '/dashboard' ? 2.5 : 2} />
                <span className="text-[8px] font-bold uppercase tracking-tight">Home</span>
            </Link>
            <Link to="/dashboard/jobs" className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${location.pathname.includes('jobs') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <Briefcase size={18} strokeWidth={location.pathname.includes('jobs') ? 2.5 : 2} />
                <span className="text-[8px] font-bold uppercase tracking-tight">Jobs</span>
            </Link>
            <Link to="/dashboard/calendar" className="flex flex-col items-center -mt-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform active:scale-95 ${location.pathname.includes('calendar') ? 'bg-blue-600 text-white shadow-blue-600/30' : 'bg-slate-900 text-white shadow-slate-900/30'}`}>
                  <Calendar size={18} />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-tight mt-0.5 text-slate-500">Plan</span>
            </Link>
            <Link to="/dashboard/absences" className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${location.pathname.includes('absences') ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <Palmtree size={18} strokeWidth={location.pathname.includes('absences') ? 2.5 : 2} />
                <span className="text-[8px] font-bold uppercase tracking-tight">Frei</span>
            </Link>
            <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-0.5 p-1.5 text-slate-400 hover:text-slate-600">
                <Menu size={18} />
                <span className="text-[8px] font-bold uppercase tracking-tight">Menü</span>
            </button>
        </div>

      </div>
    </div>
  );
}