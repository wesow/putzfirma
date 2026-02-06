import {
  ArrowRight,
  BarChart2,
  Briefcase,
  ChevronRight,
  Clock,
  Euro,
  FileText,
  Loader2,
  PlusCircle,
  Receipt,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

// --- TYPEN ---
interface AuditLog {
  id: string;
  action: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

interface DashboardStats {
  revenue: number;
  openJobs: number;
  activeCustomers: number;
  teamSize: number;
  chartData: { name: string; revenue: number }[];
  auditLogs: AuditLog[];
  failedLoginCount: number;
}

// --- KOMPONENTEN ---

const SecurityAlert = ({ count = 0 }: { count: number }) => {
  if (count < 3) return null;
  return (
    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 animate-pulse shadow-sm">
      <div className="stat-icon-wrapper bg-red-500 text-white shrink-0">
        <ShieldAlert size={16} />
      </div>
      <div className="text-left">
        <h4 className="text-[9px] font-bold text-red-900 uppercase tracking-wider">Sicherheits-Alarm</h4>
        <p className="text-[11px] text-red-700 font-medium">{count} fehlgeschlagene Logins</p>
      </div>
    </div>
  );
};

const AuditFeed = ({ logs = [] }: { logs?: AuditLog[] }) => {
  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="table-container flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Protokoll</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-bold text-emerald-600 uppercase">Online</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[300px] custom-scrollbar">
        {safeLogs.slice(0, 8).map((log) => (
          <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
            <div className={`stat-icon-box ${log.action?.includes('FAILED') ? 'icon-critical' : 'icon-info'}`}>
              {log.action?.includes('FAILED') ? <ShieldAlert size={12}/> : <Clock size={12}/>}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="text-[11px] font-bold text-slate-800 truncate capitalize">
                  {log.action?.replace(/_/g, ' ').toLowerCase()}
                </p>
                <span className="text-[9px] font-bold text-slate-400">
                  {new Date(log.createdAt).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

export default function Dashboard() {
  const navigate = useNavigate(); 
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ 
    revenue: 0, openJobs: 0, activeCustomers: 0, teamSize: 0, chartData: [], auditLogs: [], failedLoginCount: 0 
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get('/dashboard');
      setStats({
        ...res.data,
        auditLogs: res.data.auditLogs || [],
        failedLoginCount: res.data.failedLoginCount || 0
      });
    } catch (error) {
      console.error("Dashboard-Fehler");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => { 
    fetchDashboardData(); 
    const intervalId = setInterval(() => fetchDashboardData(true), 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading && stats.revenue === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page-container">
      
      {/* HEADER SECTION (Fixed Top) */}
      <div className="header-section">
        <div>
          <h1 className="page-title flex items-center gap-2">
            Willkommen, {user?.firstName} <Sparkles className="text-amber-400" size={16} />
          </h1>
          <p className="page-subtitle">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
            <button onClick={() => navigate('/dashboard/jobs')} className="btn-primary flex-1 md:flex-initial">
              <PlusCircle size={14} /> Neuer Auftrag
            </button>
            <button onClick={() => fetchDashboardData(false)} className="btn-secondary !p-2">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="page-content-scroll">

        {/* STATS GRID */}
        <div className="stats-grid">
          <div className="stat-card cursor-pointer hover:border-blue-300" onClick={() => navigate('/dashboard/finance')}>
            <div className="stat-icon-wrapper icon-info"><Euro size={16} /></div>
            <div>
              <span className="label-caps">Umsatz</span>
              <div className="text-base font-bold text-slate-900 leading-none">
                  {Number(stats.revenue || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          <div className="stat-card cursor-pointer hover:border-blue-300" onClick={() => navigate('/dashboard/jobs')}>
            <div className="stat-icon-wrapper bg-blue-50 text-blue-600"><Briefcase size={16} /></div>
            <div>
              <span className="label-caps">Offene Jobs</span>
              <div className="text-base font-bold text-slate-900 leading-none">{stats.openJobs}</div>
            </div>
          </div>

          <div className="stat-card cursor-pointer hover:border-blue-300" onClick={() => navigate('/dashboard/customers')}>
            <div className="stat-icon-wrapper icon-purple"><Users size={16} /></div>
            <div>
              <span className="label-caps">Kunden</span>
              <div className="text-base font-bold text-slate-900 leading-none">{stats.activeCustomers}</div>
            </div>
          </div>

          <div className="stat-card cursor-pointer hover:border-blue-300" onClick={() => navigate('/dashboard/team')}>
            <div className="stat-icon-wrapper bg-orange-50 text-orange-600"><UserCheck size={16} /></div>
            <div>
              <span className="label-caps">Team</span>
              <div className="text-base font-bold text-slate-900 leading-none">{stats.teamSize}</div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="content-grid">
          
          {/* LINKS: CHART + AUDIT LOG */}
          <div className="lg:col-span-8 space-y-4">
              <div className="chart-container h-[320px]">
                  <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                          <div className="stat-icon-box icon-info">
                            <BarChart2 size={16} />
                          </div>
                          <h3 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Umsatz-Trend</h3>
                      </div>
                  </div>
                  
                  <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `${v / 1000}k`} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold'}} />
                          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              <AuditFeed logs={stats.auditLogs} />
          </div>

          {/* RECHTS: FINANCE CARD + ACTIONS */}
          <div className="lg:col-span-4 space-y-4">
              <SecurityAlert count={stats.failedLoginCount} />
              
              <div className="bg-slate-900 p-5 rounded-xl text-white relative overflow-hidden shadow-md flex flex-col justify-between h-32 transition-transform hover:-translate-y-1">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-[40px]"></div>
                  <div className="relative z-10 flex justify-between items-start">
                      <div>
                          <h3 className="text-sm font-bold text-white">Finanzen</h3>
                          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">Controlling</p>
                      </div>
                      <div className="stat-icon-wrapper bg-white/10 text-white border border-white/10">
                         <Receipt size={16} />
                      </div>
                  </div>
                  <button onClick={() => navigate('/dashboard/finance')} className="relative z-10 w-full bg-white text-slate-900 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-50 transition-all shadow-sm">
                    Details <ArrowRight size={12} className="inline ml-1"/>
                  </button>
              </div>

              <div className="form-card">
                  <h3 className="form-section-title">Schnellzugriff</h3>
                  <div className="space-y-2">
                      <button onClick={() => navigate('/dashboard/customers/new')} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-all border border-slate-100 group">
                          <span className="flex items-center gap-3 font-bold text-[11px] uppercase tracking-wide text-slate-700">
                            <Users size={14} className="text-slate-400 group-hover:text-blue-600" />
                            Kunde anlegen
                          </span>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </button>
                      
                      <button onClick={() => navigate('/dashboard/contracts/new')} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-all border border-slate-100 group">
                          <span className="flex items-center gap-3 font-bold text-[11px] uppercase tracking-wide text-slate-700">
                            <FileText size={14} className="text-slate-400 group-hover:text-indigo-600" />
                            Vertrag erstellen
                          </span>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </button>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}