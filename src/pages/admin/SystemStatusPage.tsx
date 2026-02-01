import {
    Activity,
    CheckCircle,
    Database,
    HardDrive,
    LayoutDashboard,
    Loader2,
    Server,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

// --- TYPEN ---
interface SystemHealth {
  database: 'OK' | 'ERROR';
  apiVersion: string;
  uptime: number;
  lastCronRun: string | null;
  storageUsage: number; 
  activeConnections: number;
}

export default function SystemStatusPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [ping, setPing] = useState<number>(0);

  useEffect(() => {
    checkSystem();
    const interval = setInterval(checkSystem, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSystem = async () => {
    const start = Date.now();
    try {
      await api.get('/dashboard'); 
      const duration = Date.now() - start;
      setPing(duration);

      // Simulierte Daten
      setHealth({
        database: 'OK',
        apiVersion: '1.0.0',
        uptime: 12450,
        lastCronRun: new Date().toISOString(),
        storageUsage: 45,
        activeConnections: 5
      });
    } catch (error) {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="page-container">
      
      {/* HEADER */}
      <div className="header-section">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Activity className="text-blue-600" size={20} /> System-Monitor
          </h1>
          <p className="page-subtitle">Live-Status Ihrer Infrastruktur.</p>
        </div>
        <div className="flex items-center gap-2">
            {loading ? (
                <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold border bg-slate-50 text-slate-500 border-slate-200 flex items-center gap-2 uppercase tracking-wide">
                    <Loader2 size={12} className="animate-spin"/> Prüfe...
                </span>
            ) : (
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-2 uppercase tracking-wide ${health ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${health ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                    {health ? 'System Online' : 'Verbindungsfehler'}
                </span>
            )}
        </div>
      </div>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* API STATUS */}
        <div className="stat-card group">
            <div className="stat-icon-wrapper bg-amber-50 text-amber-600 border border-amber-100">
                <Zap size={18} />
            </div>
            <div>
                <p className="label-caps !ml-0">Latenz (API)</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-xl font-bold text-slate-900">{ping}</h3>
                    <span className="text-xs font-medium text-slate-400">ms</span>
                </div>
            </div>
        </div>

        {/* DATENBANK */}
        <div className="stat-card group">
            <div className="stat-icon-wrapper bg-blue-50 text-blue-600 border border-blue-100">
                <Database size={18} />
            </div>
            <div>
                <p className="label-caps !ml-0">Datenbank</p>
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">{health?.database || '-'}</h3>
                    {health?.database === 'OK' && <CheckCircle size={16} className="text-emerald-500" />}
                </div>
            </div>
        </div>

        {/* SPEICHER */}
        <div className="stat-card group block">
            <div className="flex justify-between items-start mb-2">
                <div className="stat-icon-wrapper bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <HardDrive size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-400">{health?.storageUsage || 0}%</span>
            </div>
            <div>
                <p className="label-caps !ml-0">Speicher</p>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${health?.storageUsage || 0}%` }}></div>
                </div>
            </div>
        </div>

        {/* UPTIME */}
        <div className="stat-card group">
            <div className="stat-icon-wrapper bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Server size={18} />
            </div>
            <div>
                <p className="label-caps !ml-0">Laufzeit</p>
                <h3 className="text-xl font-bold text-slate-900">
                    {health ? formatUptime(health.uptime) : '-'}
                </h3>
            </div>
        </div>

      </div>

      {/* ARCHITEKTUR DIAGRAMM (Clean Version) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-8 border-b border-slate-50 pb-4">
             <div className="p-1.5 bg-slate-50 rounded text-slate-500"><Activity size={16} /></div>
             <h3 className="font-bold text-slate-800 text-sm">Architektur Live-Ansicht</h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 relative z-10 py-4">
              
              {/* Frontend Node */}
              <div className="flex flex-col items-center gap-3 relative group">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-2 border-blue-100 shadow-sm group-hover:border-blue-500 group-hover:shadow-md transition-all">
                      <LayoutDashboard size={28} className="text-blue-600" />
                  </div>
                  <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Client</span>
                      <span className="text-xs font-bold text-slate-700">Frontend</span>
                  </div>
              </div>

              {/* Connector 1 */}
              <div className="hidden md:flex flex-1 h-px bg-slate-200 w-24 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[9px] text-slate-400 font-mono">HTTPS</div>
              </div>
              <div className="md:hidden h-12 w-px bg-slate-200"></div>

              {/* API Node */}
              <div className="flex flex-col items-center gap-3 relative group">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-2 border-indigo-100 shadow-sm group-hover:border-indigo-500 group-hover:shadow-md transition-all">
                      <Server size={28} className="text-indigo-600" />
                  </div>
                  <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Server</span>
                      <span className="text-xs font-bold text-slate-700">API Gateway</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
              </div>

              {/* Connector 2 */}
              <div className="hidden md:flex flex-1 h-px bg-slate-200 w-24 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[9px] text-slate-400 font-mono">TCP</div>
              </div>
              <div className="md:hidden h-12 w-px bg-slate-200"></div>

              {/* DB Node */}
              <div className="flex flex-col items-center gap-3 relative group">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-2 border-slate-200 shadow-sm group-hover:border-slate-500 group-hover:shadow-md transition-all">
                      <Database size={28} className="text-slate-600" />
                  </div>
                  <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Storage</span>
                      <span className="text-xs font-bold text-slate-700">Postgres DB</span>
                  </div>
                  <div className="absolute -top-2 -right-2 bg-slate-100 text-slate-500 border border-slate-200 rounded px-1 text-[8px] font-bold">VOL</div>
              </div>

          </div>
          
          {/* Subtle Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
      </div>

      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-3">
          <ShieldCheck size={16} className="text-emerald-600" />
          <p className="text-[10px] text-slate-500 font-medium">
              Sicherheitsprotokolle aktiv: <span className="font-bold text-slate-700">JWT Authentication</span>, <span className="font-bold text-slate-700">Rate Limiting</span>, <span className="font-bold text-slate-700">GoBD Logs</span>.
          </p>
      </div>

    </div>
  );
}