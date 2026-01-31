import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Users, Briefcase, Euro, UserCheck, RefreshCw, PlusCircle, 
  ArrowRight, Loader2, TrendingUp, Sparkles, 
  Receipt, ShieldCheck, ShieldAlert, Clock, FileText, BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

// --- TYPEN ---
interface DashboardStats {
  revenue: number;
  openJobs: number;
  activeCustomers: number;
  teamSize: number;
  chartData: { name: string; revenue: number }[];
  auditLogs: any[];
  failedLoginCount: number;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: any;
    bgClass: string;
    iconClass: string;
    onClick?: () => void;
    isCurrency?: boolean;
}

// --- KOMPONENTEN ---

const SecurityAlert = ({ count = 0 }: { count: number }) => {
  if (count < 3) return null;
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 animate-pulse shadow-sm">
      <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center text-white shrink-0">
        <ShieldAlert size={16} />
      </div>
      <div className="text-left">
        <h4 className="text-[10px] font-bold text-red-900 uppercase tracking-wider">Sicherheits-Alarm</h4>
        <p className="text-[11px] text-red-700 font-medium">
          {count} fehlgeschlagene Login-Versuche erkannt!
        </p>
      </div>
    </div>
  );
};

const AuditFeed = ({ logs = [] }: { logs?: any[] }) => {
  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Protokoll</h3>
        <div className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[9px] font-bold text-emerald-600 uppercase">Online</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[300px] custom-scrollbar">
        {safeLogs.slice(0, 6).map((log) => (
          <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-100 hover:border-slate-200 transition-all shadow-sm">
             <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white text-[10px] ${log.action?.includes('FAILED') ? 'bg-red-500' : 'bg-blue-600'}`}>
                {log.action?.includes('FAILED') ? <ShieldAlert size={12}/> : <Clock size={12}/>}
             </div>
             <div className="overflow-hidden min-w-0">
                <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                  {log.action?.replace(/_/g, ' ')}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                   {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'} • {new Date(log.createdAt).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})} Uhr
                </p>
             </div>
          </div>
        ))}
        {safeLogs.length === 0 && <p className="text-[11px] text-slate-400 italic text-center py-4">Keine Aktivitäten verzeichnet.</p>}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, bgClass, iconClass, onClick, isCurrency = false }: StatCardProps) => (
  <div 
    onClick={onClick} 
    className="stat-card group cursor-pointer flex flex-col justify-between h-full min-h-[100px]"
  >
    <div className="flex justify-between items-start mb-2">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm ${bgClass} ${iconClass}`}>
        <Icon size={18} />
      </div>
      {onClick && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight size={14} className="text-slate-300" />
        </div>
      )}
    </div>

    <div className="mt-auto">
      <p className="label-caps !ml-0 mb-0.5">{title}</p>
      <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
        {isCurrency 
          ? Number(value || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) 
          : (value || 0)}
      </h3>
    </div>
  </div>
);

// --- MAIN PAGE ---

export default function Dashboard() {
  const navigate = useNavigate(); 
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ 
    revenue: 0, openJobs: 0, activeCustomers: 0, teamSize: 0, chartData: [], auditLogs: [], failedLoginCount: 0 
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard');
      setStats({
        ...res.data,
        auditLogs: res.data.auditLogs || [],
        failedLoginCount: res.data.failedLoginCount || 0
      });
    } catch (error) {
      console.error("Dashboard-Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  if (loading && stats.revenue === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page-container space-y-4">
      
      {/* HEADER */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title flex items-center gap-2">
            Willkommen, {user?.firstName} <Sparkles className="text-amber-400" size={16} />
          </h1>
          <p className="page-subtitle">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto mt-3 md:mt-0">
            <button onClick={() => navigate('/dashboard/jobs')} className="btn-primary flex-1 md:flex-initial text-[11px] uppercase tracking-wider font-bold shadow-md">
              <PlusCircle size={14} className="mr-2" /> Neuer Auftrag
            </button>
            <button onClick={fetchDashboardData} className="btn-secondary !p-2.5 bg-white shadow-sm border border-slate-200">
              <RefreshCw size={16} className={loading ? "animate-spin text-blue-600" : "text-slate-400"} />
            </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="stats-grid animate-in fade-in slide-in-from-top-4 duration-500">
        <StatCard title="Umsatz" value={stats.revenue} icon={Euro} iconClass="text-emerald-600" bgClass="bg-emerald-50" isCurrency onClick={() => navigate('/dashboard/finance')} />
        <StatCard title="Offene Jobs" value={stats.openJobs} icon={Briefcase} iconClass="text-blue-600" bgClass="bg-blue-50" onClick={() => navigate('/dashboard/jobs')} />
        <StatCard title="Kunden" value={stats.activeCustomers} icon={Users} iconClass="text-purple-600" bgClass="bg-purple-50" onClick={() => navigate('/dashboard/customers')} />
        <StatCard title="Team" value={stats.teamSize} icon={UserCheck} iconClass="text-orange-600" bgClass="bg-orange-50" onClick={() => navigate('/dashboard/team')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start animate-in fade-in duration-700">
        
        {/* LINKS: CHART + AUDIT LOG */}
        <div className="lg:col-span-2 space-y-4">
            
            {/* Chart Container */}
            <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm h-[320px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                          <BarChart2 size={16} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Umsatz-Trend</h3>
                          <p className="text-[10px] text-slate-400 font-medium">Letzte 6 Monate</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} tickFormatter={(v) => `${v / 1000}k`} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold'}} />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <AuditFeed logs={stats.auditLogs} />
        </div>

        {/* RECHTS: FINANCE CARD + ACTIONS */}
        <div className="space-y-4">
            <SecurityAlert count={stats.failedLoginCount} />
            
            {/* Finance Card */}
            <div className="bg-slate-900 p-5 rounded-xl text-white relative overflow-hidden shadow-lg group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-[60px] group-hover:bg-blue-600/40 transition-all duration-1000"></div>
                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-base font-bold tracking-tight text-white">Finanzen</h3>
                            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wide mt-0.5">Controlling Center</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/10">
                           <Receipt size={16} />
                        </div>
                    </div>
                    
                    <button onClick={() => navigate('/dashboard/finance')} className="w-full bg-white text-slate-900 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-50 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2">
                      Zum Bereich <ArrowRight size={12}/>
                    </button>
                </div>
            </div>

            {/* Smart Actions */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Schnellzugriff</h3>
                <div className="space-y-2">
                    <button onClick={() => navigate('/dashboard/customers/new')} className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 transition-all hover:bg-blue-600 hover:text-white group border border-transparent hover:shadow-md">
                        <span className="flex items-center gap-3 font-bold text-[11px] uppercase tracking-wide">
                          <Users size={16} className="text-slate-400 group-hover:text-white" /> 
                          Kunde anlegen
                        </span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-all group-hover:text-white" />
                    </button>
                    
                    <button onClick={() => navigate('/dashboard/contracts/new')} className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 transition-all hover:bg-indigo-600 hover:text-white group border border-transparent hover:shadow-md">
                        <span className="flex items-center gap-3 font-bold text-[11px] uppercase tracking-wide">
                          <FileText size={16} className="text-slate-400 group-hover:text-white" /> 
                          Neuer Vertrag
                        </span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-all group-hover:text-white" />
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}