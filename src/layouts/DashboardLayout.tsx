import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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
  FileCheck
} from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Rolle und Name laden
  const role = localStorage.getItem('role');
  const firstName = localStorage.getItem('firstName') || 'Benutzer';
  const companyName = localStorage.getItem('companyName'); // Falls Kunde Firmenname hat

  // --- 1. ADMIN MENU (Vollzugriff) ---
  const adminNav = [
    { section: 'Übersicht', items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Calendar, label: 'Kalender', path: '/dashboard/calendar' },
    ]},
    { section: 'Verwaltung', items: [
        { icon: Users, label: 'Kunden', path: '/dashboard/customers' },
        { icon: UserCheck, label: 'Team', path: '/dashboard/team' },
        { icon: Package, label: 'Lager', path: '/dashboard/inventory' },
        { icon: Sparkles, label: 'Leistungen', path: '/dashboard/services' },
    ]},
    { section: 'Operativ', items: [
        { icon: Briefcase, label: 'Aufträge', path: '/dashboard/jobs' },
        { icon: FileText, label: 'Verträge', path: '/dashboard/contracts' },
        { icon: Palmtree, label: 'Abwesenheit', path: '/dashboard/absences' },
    ]},
    { section: 'Finanzen', items: [
        { icon: Megaphone, label: 'Angebote', path: '/dashboard/offers' },
        { icon: FileCheck, label: 'Rechnungen', path: '/dashboard/invoices' },
        { icon: Receipt, label: 'Ausgaben', path: '/dashboard/expenses' },
        { icon: Wallet, label: 'Lohn & Gehalt', path: '/dashboard/payroll' },
        { icon: FileSpreadsheet, label: 'Berichte', path: '/dashboard/reports' },
    ]},
    { section: 'System', items: [
        { icon: Settings, label: 'Einstellungen', path: '/dashboard/settings' },
    ]}
  ];

  // --- 2. MITARBEITER MENU ---
  const employeeNav = [
    { section: 'Mein Bereich', items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Briefcase, label: 'Meine Jobs', path: '/dashboard/jobs' },
        { icon: Calendar, label: 'Kalender', path: '/dashboard/calendar' },
        { icon: Palmtree, label: 'Urlaub & Krank', path: '/dashboard/absences' },
    ]},
    { section: 'Material', items: [
        { icon: Package, label: 'Lagerbestand', path: '/dashboard/inventory' },
    ]}
  ];

  // --- 3. KUNDEN MENU ---
  const customerNav = [
    { section: 'Mein Konto', items: [
        { icon: LayoutDashboard, label: 'Übersicht', path: '/dashboard' },
        // Später mehr: Rechnungen, Tickets, etc.
    ]}
  ];

  // --- LOGIK: WELCHES MENU ZEIGEN? ---
  let menuGroups = employeeNav; // Default (Sicherheit)
  if (role === 'ADMIN') menuGroups = adminNav;
  if (role === 'CUSTOMER') menuGroups = customerNav;


  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 fixed h-full z-30 hidden md:flex flex-col shadow-xl">
        
        {/* Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/50">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight block">GlanzOps</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise</span>
          </div>
        </div>
        
        {/* Navigation Scroll Area */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
                <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                    {group.section}
                </p>
                <div className="space-y-1">
                    {group.items.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                        return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${
                            isActive 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-medium' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
                            <span className="text-sm">{item.label}</span>
                            {isActive && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/30"></div>}
                        </Link>
                        );
                    })}
                </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl mb-3 border border-slate-800">
             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg">
                {firstName.charAt(0)}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-medium truncate text-white">{companyName || firstName}</p>
                <p className="text-[10px] text-slate-400 truncate capitalize font-medium tracking-wide">{role?.toLowerCase()}</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors text-sm font-medium group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> Abmelden
          </button>
        </div>
      </aside>

      {/* HAUPTINHALT */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 animate-in fade-in duration-300 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto pb-20 md:pb-0">
           <Outlet />
        </div>
      </main>

      {/* MOBILE NAV (Bottom Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex justify-around items-center z-50 shadow-lg pb-safe">
          <Link to="/dashboard" className={`p-2 rounded-xl flex flex-col items-center gap-1 ${location.pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
              <LayoutDashboard size={24} />
              <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/dashboard/jobs" className={`p-2 rounded-xl flex flex-col items-center gap-1 ${location.pathname.includes('jobs') ? 'text-blue-600' : 'text-slate-400'}`}>
              <Briefcase size={24} />
              <span className="text-[10px] font-medium">Jobs</span>
          </Link>
          <Link to="/dashboard/calendar" className={`p-2 rounded-xl flex flex-col items-center gap-1 ${location.pathname.includes('calendar') ? 'text-blue-600' : 'text-slate-400'}`}>
              <Calendar size={24} />
              <span className="text-[10px] font-medium">Kalender</span>
          </Link>
          <button onClick={handleLogout} className="p-2 rounded-xl flex flex-col items-center gap-1 text-slate-400 hover:text-red-500">
              <LogOut size={24} />
              <span className="text-[10px] font-medium">Exit</span>
          </button>
      </div>

    </div>
  );
}