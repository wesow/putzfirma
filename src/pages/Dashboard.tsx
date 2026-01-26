import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Users, Briefcase, Euro, UserCheck, RefreshCw, PlusCircle, FileText, ArrowRight, Loader2, TrendingUp, Sparkles, LayoutDashboard, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  revenue: number;
  openJobs: number;
  activeCustomers: number;
  teamSize: number;
  chartData: { name: string; revenue: number }[];
}

const StatCard = ({ title, value, icon: Icon, bgClass, iconClass, onClick, isCurrency = false }: any) => (
  <div onClick={onClick} className="stat-card-v2 group cursor-pointer transition-all hover:ring-2 hover:ring-blue-600/5">
    <div className="flex justify-between items-start">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${bgClass} ${iconClass}`}>
        <Icon size={24} />
      </div>
      {onClick && <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-all"><ArrowRight size={14} /></div>}
    </div>
    <div className="text-left">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
        {isCurrency 
          ? Number(value).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) 
          : value}
      </h3>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate(); 
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ revenue: 0, openJobs: 0, activeCustomers: 0, teamSize: 0, chartData: [] });
  const [loading, setLoading] = useState(true);

  const firstName = user?.firstName || 'Benutzer';

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard');
      setStats(res.data);
    } catch (error) {
      console.error("Dashboard-Fehler");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats.revenue) {
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
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title text-3xl font-black tracking-tight flex items-center gap-3">
            Guten Tag, {firstName} <Sparkles className="text-amber-400 animate-pulse" size={28} />
          </h1>
          <p className="page-subtitle text-lg">Hier ist die aktuelle Performance von GlanzOps für heute.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => navigate('/dashboard/jobs')} className="btn-primary flex-1 md:flex-initial py-3 px-8 shadow-xl shadow-blue-500/20 uppercase tracking-widest text-[10px] font-black">
              <PlusCircle size={18} /> Neuer Auftrag
            </button>
            <button onClick={fetchDashboardData} className="btn-secondary !p-3.5 hover:rotate-180 transition-transform duration-700">
              <RefreshCw size={20} className={loading ? "animate-spin text-blue-600" : "text-slate-400"} />
            </button>
        </div>
      </div>

      {/* QUICK KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <StatCard title="Umsatz Monat" value={stats.revenue} icon={Euro} iconClass="text-emerald-600" bgClass="bg-emerald-50" isCurrency onClick={() => navigate('/dashboard/invoices')} />
        <StatCard title="Live Einsätze" value={stats.openJobs} icon={Briefcase} iconClass="text-blue-600" bgClass="bg-blue-50" onClick={() => navigate('/dashboard/jobs')} />
        <StatCard title="Kundenstamm" value={stats.activeCustomers} icon={Users} iconClass="text-purple-600" bgClass="bg-purple-50" onClick={() => navigate('/dashboard/customers')} />
        <StatCard title="Team-Mitglieder" value={stats.teamSize} icon={UserCheck} iconClass="text-orange-600" bgClass="bg-orange-50" onClick={() => navigate('/dashboard/team')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-700 delay-200">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-2 chart-container shadow-xl shadow-slate-200/50 !min-h-[480px]">
           <div className="flex justify-between items-center mb-12 border-b border-slate-50 pb-6">
               <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Wachstums-Analyse</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Umsatzentwicklung der letzten Monate</p>
                  </div>
               </div>
               <span className="status-badge bg-blue-600 text-white border-blue-600 font-black shadow-lg shadow-blue-200">LIVE REPORT</span>
           </div>
           
           <div className="h-[320px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                     dy={15} 
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} 
                     tickFormatter={(v) => `${v / 1000}k€`} 
                   />
                   <Tooltip 
                     cursor={{fill: '#f8fafc'}} 
                     contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px', fontWeight: 'bold'}} 
                   />
                   <Bar dataKey="revenue" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={40} />
                 </BarChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* SIDEBAR WIDGETS */}
        <div className="space-y-8">
            
            {/* CTA CARD */}
            <div className="action-card-dark group shadow-2xl shadow-blue-900/20 overflow-hidden text-left">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/30 rounded-full blur-[80px] group-hover:bg-blue-600/50 transition-all duration-1000"></div>
                <div className="relative z-10 space-y-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10 backdrop-blur-md shadow-xl">
                      <Receipt size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black mb-2 tracking-tight">Abrechnungs-Zyklus</h3>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed">Der aktuelle Monat ist bereit für den Gehaltslauf.</p>
                    </div>
                    <button 
                      onClick={() => navigate('/dashboard/payroll')} 
                      className="w-full bg-white text-slate-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-blue-50 active:scale-95 shadow-xl"
                    >
                      Jetzt prüfen
                    </button>
                </div>
            </div>

            {/* QUICK ACCESS */}
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