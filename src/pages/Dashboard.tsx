import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Users, Briefcase, Euro, UserCheck, RefreshCw, PlusCircle, 
  ArrowRight, Loader2, TrendingUp, Sparkles, 
  Receipt, ShieldCheck, ShieldAlert, FileText, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

// --- INTERFACES ---
interface DashboardStats {
  revenue: number;
  openJobs: number;
  activeCustomers: number;
  teamSize: number;
  chartData: { name: string; revenue: number }[];
  auditLogs: any[];
  failedLoginCount: number;
}

// --- SUB-COMPONENTS ---

/**
 * Sicherheits-Alarm: Erscheint nur bei Gefahr oben rechts
 */
const SecurityAlert = ({ count = 0 }: { count: number }) => {
  if (count < 3) return null;

  return (
    <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-[2rem] flex items-center gap-4 animate-pulse shadow-lg shadow-red-100">
      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
        <ShieldAlert size={20} />
      </div>
      <div className="text-left">
        <h4 className="text-[9px] font-black text-red-900 uppercase tracking-[0.2em]">Alarm</h4>
        <p className="text-[10px] text-red-700 font-bold uppercase leading-tight">
          {count} Brute-Force Versuche!
        </p>
      </div>
    </div>
  );
};

/**
 * Audit Feed Horizontal
 */
const AuditFeedHorizontal = ({ logs = [] }: { logs?: any[] }) => {
  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/50 text-left mt-6">
      <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Live Aktivitäten Protokoll</h3>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <ShieldCheck size={16} className="text-slate-300" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safeLogs.slice(0, 4).map((log) => (
          <div key={log.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-md ${log.action?.includes('FAILED') ? 'bg-red-500' : 'bg-blue-600'}`}>
                {log.action?.includes('FAILED') ? <ShieldAlert size={14}/> : <Clock size={14}/>}
             </div>
             <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate">
                  {log.action?.replace(/_/g, ' ')}
                </p>
                <p className="text-[9px] text-slate-500 font-medium truncate">
                   {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'} • {new Date(log.createdAt).toLocaleTimeString('de-DE')} Uhr
                </p>
             </div>
          </div>
        ))}
        {safeLogs.length === 0 && <p className="text-[10px] text-slate-400 italic col-span-2 text-center">Keine Aktivitäten verzeichnet.</p>}
      </div>
    </div>
  );
};

// --- FIX: StatCard Layout verbessert ---
const StatCard = ({ title, value, icon: Icon, bgClass, iconClass, onClick, isCurrency = false }: any) => (
  <div 
    onClick={onClick} 
    className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02] hover:border-blue-200 group cursor-pointer flex flex-col justify-between h-full min-h-[160px]"
  >
    {/* Oberer Teil: Icon und Pfeil */}
    <div className="flex justify-between items-start mb-2">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${bgClass} ${iconClass}`}>
        <Icon size={24} />
      </div>
      {onClick && (
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <ArrowRight size={14} />
        </div>
      )}
    </div>

    {/* Unterer Teil: Text und Zahl */}
    <div className="text-left mt-auto pt-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 truncate">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter truncate leading-none pb-1">
        {isCurrency 
          ? Number(value || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) 
          : (value || 0)}
      </h3>
    </div>
  </div>
);

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
      <div className="page-container flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={44} />
          <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Initialisiere Zentrale...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title text-3xl font-black tracking-tight flex items-center gap-3">
            Guten Tag, {user?.firstName} <Sparkles className="text-amber-400 animate-pulse" size={28} />
          </h1>
          <p className="page-subtitle text-lg">Performance-Übersicht für heute.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => navigate('/dashboard/jobs')} className="btn-primary flex-1 md:flex-initial py-3 px-8 uppercase tracking-widest text-[10px] font-black shadow-lg shadow-blue-500/20">
              <PlusCircle size={18} /> Neuer Auftrag
            </button>
            <button onClick={fetchDashboardData} className="btn-secondary !p-3.5 transition-all hover:rotate-180 duration-700">
              <RefreshCw size={20} className={loading ? "animate-spin text-blue-600" : "text-slate-400"} />
            </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <StatCard title="Umsatz Monat" value={stats.revenue} icon={Euro} iconClass="text-emerald-600" bgClass="bg-emerald-50" isCurrency onClick={() => navigate('/dashboard/payroll')} />
        <StatCard title="Live Einsätze" value={stats.openJobs} icon={Briefcase} iconClass="text-blue-600" bgClass="bg-blue-50" onClick={() => navigate('/dashboard/jobs')} />
        <StatCard title="Kundenstamm" value={stats.activeCustomers} icon={Users} iconClass="text-purple-600" bgClass="bg-purple-50" onClick={() => navigate('/dashboard/customers')} />
        <StatCard title="Team-Mitglieder" value={stats.teamSize} icon={UserCheck} iconClass="text-orange-600" bgClass="bg-orange-50" onClick={() => navigate('/dashboard/team')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-8 animate-in fade-in duration-700">
        
        {/* LINKS: CHART + AUDIT LOG */}
        <div className="lg:col-span-2">
            {/* Chart Container */}
            <div className="chart-container shadow-xl shadow-slate-200/50 !min-h-[480px] bg-white rounded-[2.5rem] p-8 border border-slate-200">
                <div className="flex justify-between items-center mb-12 border-b border-slate-50 pb-6">
                    <div className="flex items-center gap-3 text-left">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                         <TrendingUp size={20} />
                       </div>
                       <div>
                         <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Wachstums-Analyse</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Umsatzentwicklung</p>
                       </div>
                    </div>
                    <span className="status-badge bg-blue-600 text-white font-black px-4 py-1 rounded-full text-[9px] shadow-lg shadow-blue-200">LIVE REPORT</span>
                </div>
                
                <div className="h-[320px] w-full" style={{ minWidth: 0, minHeight: '320px' }}>
                    <ResponsiveContainer width="99%" height={320}>
                      <BarChart data={stats.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} tickFormatter={(v) => `${v / 1000}k€`} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold'}} />
                        <Bar dataKey="revenue" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <AuditFeedHorizontal logs={stats.auditLogs} />
        </div>

        {/* RECHTS: FINANCE CARD + ACTIONS + SECURITY ALERT */}
        <div className="space-y-8">
            <SecurityAlert count={stats.failedLoginCount} />
            
            {/* Finance Card */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/30 rounded-full blur-[80px] group-hover:bg-blue-600/50 transition-all duration-1000"></div>
                <div className="relative z-10 space-y-6 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10 backdrop-blur-md shadow-xl">
                       <Receipt size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black mb-1 tracking-tight">Finanz-Zentrum</h3>
                      <p className="text-slate-400 text-xs font-medium leading-relaxed uppercase tracking-wider">Gehaltslauf & Abrechnung</p>
                    </div>
                    <button onClick={() => navigate('/dashboard/payroll')} className="w-full bg-white text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-95 shadow-lg">
                      JETZT PRÜFEN
                    </button>
                </div>
            </div>

            {/* Smart Actions */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/50 text-left">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-8 border-b border-slate-50 pb-4">Smart Actions</h3>
                <div className="space-y-4">
                    <button onClick={() => navigate('/dashboard/customers/new')} className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-50 transition-all hover:bg-blue-600 hover:text-white group border border-transparent hover:shadow-xl hover:shadow-blue-600/20">
                        <span className="flex items-center gap-4 font-black text-xs uppercase tracking-widest">
                          <Users size={20} className="text-slate-400 group-hover:text-white" /> 
                          Kunde anlegen
                        </span>
                        <ArrowRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                    </button>
                    
                    <button onClick={() => navigate('/dashboard/contracts/new')} className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-50 transition-all hover:bg-indigo-600 hover:text-white group border border-transparent hover:shadow-xl hover:shadow-indigo-600/20">
                        <span className="flex items-center gap-4 font-black text-xs uppercase tracking-widest">
                          <FileText size={20} className="text-slate-400 group-hover:text-white" /> 
                          Dauerauftrag
                        </span>
                        <ArrowRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}