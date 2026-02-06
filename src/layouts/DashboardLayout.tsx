import {
  Activity, Briefcase, Calendar, ChevronRight, FileCheck,
  FileText, GitMerge, Landmark,
  LayoutDashboard, LogOut, Megaphone, Menu,
  Package, Palmtree, Receipt, Settings, ShieldAlert, ShieldCheck, Sparkles,
  User,
  UserCheck, Users, Wallet, X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin', EMPLOYEE: 'Team', CUSTOMER: 'Kunde', MANAGER: 'Manager'
};

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const role = user?.role || 'EMPLOYEE'; 
  const firstName = user?.firstName || 'Benutzer';

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  // --- 1. NAVIGATION DEFINITIONEN ---
  const NAVIGATION = {
    ADMIN: [
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
      ]},
      { section: 'System', items: [
          { icon: GitMerge, label: 'Business Flow', path: '/dashboard/flow' },
          { icon: ShieldAlert, label: 'Audit-Log', path: '/dashboard/audit' },
          { icon: Activity, label: 'System-Status', path: '/dashboard/system-status' },
          { icon: Settings, label: 'Optionen', path: '/dashboard/settings' },
      ]}
    ],
    CUSTOMER: [
      { section: 'Mein Portal', items: [
          { icon: LayoutDashboard, label: 'Übersicht', path: '/dashboard' },
          { icon: FileCheck, label: 'Rechnungen', path: '/dashboard/invoices' },
          { icon: Settings, label: 'Profil', path: '/dashboard/settings' },
      ]}
    ],
    EMPLOYEE: [
      { section: 'Arbeitsplatz', items: [
          { icon: LayoutDashboard, label: 'Meine Jobs', path: '/dashboard' }, 
          { icon: Calendar, label: 'Kalender', path: '/dashboard/calendar' },
          { icon: Palmtree, label: 'Abwesenheit', path: '/dashboard/absences' },
      ]},
      { section: 'Material', items: [
          { icon: Package, label: 'Lagerbestand', path: '/dashboard/inventory' },
      ]}
    ]
  };

  // --- 2. BOTTOM NAV DEFINITIONEN (MOBILE) ---
  const getBottomNavItems = () => {
    const isAdmin = role === 'ADMIN' || role === 'MANAGER';
    if (isAdmin) return [
      { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
      { icon: Briefcase, label: 'Jobs', path: '/dashboard/jobs' },
      { icon: Calendar, label: 'Plan', path: '/dashboard/calendar', highlight: true },
      { icon: Users, label: 'Kunden', path: '/dashboard/customers' },
      { icon: Menu, label: 'Menü', isAction: true }
    ];
    if (role === 'CUSTOMER') return [
      { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
      { icon: FileCheck, label: 'Belege', path: '/dashboard/invoices' },
      { icon: User, label: 'Profil', path: '/dashboard/settings', highlight: true },
      { icon: Menu, label: 'Menü', isAction: true }
    ];
    return [ // EMPLOYEE Default
      { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
      { icon: Calendar, label: 'Kalender', path: '/dashboard/calendar' },
      { icon: Briefcase, label: 'Einsatz', path: '/dashboard', highlight: true },
      { icon: Palmtree, label: 'Frei', path: '/dashboard/absences' },
      { icon: Menu, label: 'Menü', isAction: true }
    ];
  };

  const menuGroups = NAVIGATION[role as keyof typeof NAVIGATION] || NAVIGATION.EMPLOYEE;
  const bottomNavItems = getBottomNavItems();

  return (
    // MASTER CONTAINER: Fixed Viewport Height, kein Body-Scroll
    <div className="h-screen w-full bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] md:hidden animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR (Links) */}
      <aside className={`fixed md:relative top-0 h-full z-[100] w-[260px] md:w-56 lg:w-60 bg-slate-900 text-white flex flex-col shadow-2xl shrink-0 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5 h-16 bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20"><ShieldCheck size={18} /></div>
            <div className="overflow-hidden">
              <span className="text-sm font-black block truncate text-white uppercase tracking-tighter leading-none">GlanzOps</span>
              <span className="text-[8px] text-blue-400 font-bold uppercase tracking-[0.2em]">Enterprise</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 p-1"><X size={20} /></button>
        </div>
        
        {/* Sidebar Navigation (Scrollbar intern) */}
        <nav className="flex-1 px-2 py-4 space-y-6 overflow-y-auto custom-scrollbar no-scrollbar overflow-x-hidden">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 opacity-60">{group.section}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <Link key={item.path} to={item.path} className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
                        <span className="text-[12px] font-bold">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={12} strokeWidth={3} className="text-white/40" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer (User Profile) */}
        <div className="p-3 bg-slate-900/50 border-t border-white/5 shrink-0 pb-safe">
          <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-xl border border-white/5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-black shadow-inner shrink-0 text-white">{firstName.charAt(0)}</div>
              <div className="overflow-hidden min-w-0">
                <p className="text-[11px] font-black truncate text-white tracking-tight leading-none mb-1">{firstName}</p>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">{ROLE_LABELS[role]}</p>
              </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest group">
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> Abmelden
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* MOBILE TOP BAR (Sticky Header) */}
        <header className="md:hidden bg-white/90 backdrop-blur-md border-b border-slate-200 shrink-0 px-4 py-2 flex items-center justify-between shadow-sm h-14 z-30">
           <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 bg-slate-50 rounded-xl transition-all active:scale-95"><Menu size={20} /></button>
              <span className="font-black text-slate-900 tracking-tighter text-sm uppercase">GlanzOps</span>
           </div>
           <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-sm border border-slate-800">{firstName.charAt(0)}</div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        {/* Dieser Container füllt den Restplatz und verhindert, dass das Layout bricht */}
        <main className="flex-1 w-full relative z-10 overflow-hidden flex flex-col">
             {/* Die Outlet-Komponenten (Pages) müssen .page-content-scroll nutzen */}
             <Outlet />
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1.5 flex justify-around items-end z-40 shrink-0 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            {bottomNavItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = item.path && (location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)));
                
                if (item.isAction) {
                    return (
                        <button key={idx} onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 p-2 text-slate-400 active:text-slate-900">
                            <Icon size={20} />
                            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
                        </button>
                    );
                }

                if (item.highlight) {
                    return (
                        <Link key={idx} to={item.path!} className="flex flex-col items-center -mt-8 relative z-30">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isActive ? 'bg-blue-600 text-white shadow-blue-500/40' : 'bg-slate-900 text-white shadow-slate-900/40'}`}>
                                <Icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className={`text-[8px] font-black uppercase mt-1 tracking-tighter ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{item.label}</span>
                        </Link>
                    );
                }

                return (
                    <Link key={idx} to={item.path!} className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive ? 'text-blue-600' : 'text-slate-400 active:scale-95'}`}>
                        <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
                    </Link>
                );
            })}
        </div>
      </div>
    </div>
  );
}