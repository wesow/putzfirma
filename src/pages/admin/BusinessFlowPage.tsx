import {
    ArrowDown,
    ArrowRight,
    Briefcase,
    Building,
    Calendar,
    CheckCircle2,
    FileCheck,
    FileText,
    Landmark,
    Layout,
    Loader2,
    Megaphone,
    Package,
    Receipt,
    Users,
    Wallet
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

// --- TYPES ---
interface FlowStats {
  offersOpen: number;
  contractsActive: number;
  jobsOpen: number;
  jobsDone: number;
  invoicesOpen: number;
  revenue: number;
}

// --- COMPONENTS ---

const FlowNode = ({ icon: Icon, title, count, subtitle, theme, isLast = false }: any) => {
  // Theme Mapping für Farben
  const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-100',
      amber: 'bg-amber-50 text-amber-600 border-amber-100',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const activeClass = colors[theme] || colors.slate;

  return (
    <div className="flex items-center">
      <div className="relative group flex flex-col items-center p-4 rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-md hover:border-slate-300 w-32 min-h-[140px] text-center">
        
        <div className={`p-3 rounded-lg mb-3 border ${activeClass} shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        
        <h4 className="font-bold text-slate-900 text-xs mb-1">{title}</h4>
        
        {count !== undefined && (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-white">
            {count}
          </span>
        )}
        
        {subtitle && <p className="text-[9px] text-slate-400 mt-1 leading-tight">{subtitle}</p>}

        {/* Connection Line (Horizontal) */}
        {!isLast && (
          <div className="hidden md:block absolute -right-10 top-1/2 -translate-y-1/2 text-slate-300">
            <ArrowRight size={20} />
          </div>
        )}
        
        {/* Connection Line (Vertical - Mobile) */}
        {!isLast && (
          <div className="md:hidden absolute -bottom-10 left-1/2 -translate-x-1/2 text-slate-300">
            <ArrowDown size={20} />
          </div>
        )}
      </div>
      
      {/* Spacer für Grid */}
      {!isLast && <div className="w-10 hidden md:block"></div>}
    </div>
  );
};

export default function BusinessFlowPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FlowStats>({
    offersOpen: 0, contractsActive: 0, jobsOpen: 0, jobsDone: 0, invoicesOpen: 0, revenue: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [offers, contracts, jobs, invoices, dashboard] = await Promise.all([
        api.get('/offers'),
        api.get('/contracts'),
        api.get('/jobs'),
        api.get('/invoices'),
        api.get('/dashboard')
      ]);

      setStats({
        offersOpen: offers.data.filter((o: any) => o.status === 'SENT').length,
        contractsActive: contracts.data.filter((c: any) => c.isActive).length,
        jobsOpen: jobs.data.filter((j: any) => j.status === 'SCHEDULED' || j.status === 'IN_PROGRESS').length,
        jobsDone: jobs.data.filter((j: any) => j.status === 'COMPLETED').length,
        invoicesOpen: invoices.data.filter((i: any) => i.status === 'SENT' || i.status === 'OVERDUE').length,
        revenue: dashboard.data.revenue
      });
    } catch (e) {
      console.error("Datenfehler", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-container flex justify-center py-40"><Loader2 className="animate-spin text-blue-600" size={32}/></div>;

  return (
    <div className="page-container space-y-6">
      
      {/* HEADER */}
      <div className="header-section">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Layout className="text-indigo-600" size={20} /> Prozess-Landkarte
          </h1>
          <p className="page-subtitle">Visualisierung Ihrer Geschäftsabläufe.</p>
        </div>
      </div>

      {/* 1. CASHFLOW DIAGRAMM */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-2">
            <span className="label-caps !ml-0 !text-slate-400">Finanz-Prozess (Cashflow)</span>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <div className="flex flex-col md:flex-row items-center justify-center min-w-max gap-8 md:gap-0">
            <FlowNode icon={Megaphone} title="1. Angebot" count={stats.offersOpen} subtitle="Vertrieb" theme="blue" />
            <FlowNode icon={FileText} title="2. Vertrag" count={stats.contractsActive} subtitle="Bindung" theme="indigo" />
            <FlowNode icon={Briefcase} title="3. Leistung" count={stats.jobsDone} subtitle="Operations" theme="purple" />
            <FlowNode icon={Receipt} title="4. Rechnung" count={stats.invoicesOpen} subtitle="Forderung" theme="amber" />
            <FlowNode icon={Landmark} title="5. Zahlung" subtitle={`Umsatz: ${stats.revenue.toLocaleString()}€`} theme="emerald" isLast />
          </div>
        </div>
      </div>

      {/* 2. OPERATIVES DIAGRAMM */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
            <span className="label-caps !ml-0 !text-slate-500">Team-Prozess (Operations)</span>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="flex flex-col md:flex-row items-center justify-center min-w-max gap-8 md:gap-0">
            <FlowNode icon={Calendar} title="1. Planung" count={stats.jobsOpen} subtitle="Automatisch" theme="slate" />
            <FlowNode icon={Users} title="2. Zuweisung" subtitle="Dispo" theme="slate" />
            <FlowNode icon={CheckCircle2} title="3. App" subtitle="Mitarbeiter" theme="blue" />
            <FlowNode icon={FileCheck} title="4. Prüfung" subtitle="Manager" theme="slate" />
            <FlowNode icon={Wallet} title="5. Lohn" subtitle="Abrechnung" theme="emerald" isLast />
          </div>
        </div>
      </div>

      {/* 3. MODUL ÜBERSICHT (Karten) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* STAMMDATEN */}
          <div className="stat-card flex-col items-start !gap-4">
              <div className="flex items-center gap-3 w-full border-b border-slate-50 pb-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100"><Building size={16}/></div>
                  <h4 className="font-bold text-slate-800 text-sm">Stammdaten</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-500 w-full">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400"></div> Kunden (CRM)</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400"></div> Mitarbeiter (HR)</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-400"></div> Produkte</li>
              </ul>
          </div>

          {/* PROZESSE */}
          <div className="stat-card flex-col items-start !gap-4">
              <div className="flex items-center gap-3 w-full border-b border-slate-50 pb-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100"><Briefcase size={16}/></div>
                  <h4 className="font-bold text-slate-800 text-sm">Kern-Prozesse</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-500 w-full">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-indigo-400"></div> Job-Generator (Cron)</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-indigo-400"></div> Zeiterfassung</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-indigo-400"></div> SEPA Export</li>
              </ul>
          </div>

          {/* ADD-ONS */}
          <div className="stat-card flex-col items-start !gap-4">
              <div className="flex items-center gap-3 w-full border-b border-slate-50 pb-2">
                  <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md border border-purple-100"><Package size={16}/></div>
                  <h4 className="font-bold text-slate-800 text-sm">Module</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-500 w-full">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-purple-400"></div> Kunden-Portal</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-purple-400"></div> Audit Logs</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-purple-400"></div> System Monitor</li>
              </ul>
          </div>

      </div>

    </div>
  );
}