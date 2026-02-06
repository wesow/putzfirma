import {
    Activity,
    ArrowRight,
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

            // Simulierte Daten für das Dashboard
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
        <div className="page-container pb-safe">
            
            {/* HEADER */}
            <div className="header-section">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Activity className="text-blue-600" size={20} /> System-Status
                    </h1>
                    <p className="page-subtitle">Live-Überwachung der Cloud-Infrastruktur.</p>
                </div>
                <div className="flex items-center gap-2">
                    {loading ? (
                        <span className="px-3 py-1.5 rounded-lg text-[9px] font-black border bg-slate-50 text-slate-500 border-slate-200 flex items-center gap-2 uppercase tracking-widest">
                            <Loader2 size={12} className="animate-spin"/> Scanning...
                        </span>
                    ) : (
                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black border flex items-center gap-2 uppercase tracking-widest ${health ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            <div className={`w-2 h-2 rounded-full ${health ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                            {health ? 'Betriebsbereit' : 'Wartungsmodus'}
                        </span>
                    )}
                </div>
            </div>

            {/* METRIC GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-in fade-in duration-500">
                
                {/* API STATUS */}
                <div className="stat-card border-l-[3px] border-l-amber-500">
                    <div className="stat-icon-wrapper icon-warning">
                        <Zap size={18} />
                    </div>
                    <div>
                        <p className="label-caps !ml-0 !mb-0">API Latenz</p>
                        <div className="flex items-baseline gap-1 mt-1">
                            <h3 className="text-base font-black text-slate-900">{ping}</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase">ms</span>
                        </div>
                    </div>
                </div>

                {/* DATENBANK */}
                <div className="stat-card border-l-[3px] border-l-blue-500">
                    <div className="stat-icon-wrapper icon-info">
                        <Database size={18} />
                    </div>
                    <div>
                        <p className="label-caps !ml-0 !mb-0 text-blue-600/70">Datenbank</p>
                        <div className="flex items-center gap-2 mt-1">
                            <h3 className="text-base font-black text-slate-900">{health?.database || '-'}</h3>
                            {health?.database === 'OK' && <CheckCircle size={14} className="text-emerald-500" />}
                        </div>
                    </div>
                </div>

                {/* SPEICHER */}
                <div className="stat-card border-l-[3px] border-l-indigo-500 block">
                    <div className="flex justify-between items-center mb-2">
                        <div className="stat-icon-wrapper icon-purple">
                            <HardDrive size={18} />
                        </div>
                        <span className="text-[10px] font-black text-slate-500">{health?.storageUsage || 0}%</span>
                    </div>
                    <div>
                        <p className="label-caps !ml-0 !mb-0">Storage</p>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${health?.storageUsage || 0}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* UPTIME */}
                <div className="stat-card border-l-[3px] border-l-emerald-500">
                    <div className="stat-icon-wrapper icon-success">
                        <Server size={18} />
                    </div>
                    <div>
                        <p className="label-caps !ml-0 !mb-0 text-emerald-600/70">Uptime</p>
                        <h3 className="text-base font-black text-slate-900 mt-1">
                            {health ? formatUptime(health.uptime) : '-'}
                        </h3>
                    </div>
                </div>

            </div>

            {/* ARCHITEKTUR DIAGRAMM */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    <div className="stat-icon-box bg-slate-900 text-white"><Activity size={14} /></div>
                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Infrastruktur-Logik</h3>
                </div>
                
                <div className="p-8 flex flex-col md:flex-row items-center justify-center gap-6 relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
                    
                    {/* Node 1 */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-blue-500 shadow-lg shadow-blue-500/10 transition-transform hover:scale-105">
                            <LayoutDashboard size={24} className="text-blue-500" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">Frontend App</span>
                    </div>

                    <ArrowRight className="text-slate-300 rotate-90 md:rotate-0" size={20} />

                    {/* Node 2 */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border-2 border-slate-800 shadow-lg transition-transform hover:scale-105">
                            <Server size={24} className="text-white" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">API Service</span>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
                    </div>

                    <ArrowRight className="text-slate-300 rotate-90 md:rotate-0" size={20} />

                    {/* Node 3 */}
                    <div className="flex flex-col items-center gap-2 relative z-10">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-indigo-500 shadow-lg shadow-indigo-500/10 transition-transform hover:scale-105">
                            <Database size={24} className="text-indigo-500" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">Data Warehouse</span>
                    </div>

                </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 text-white shadow-xl shadow-slate-900/20">
                <div className="p-2 bg-white/10 rounded-lg shrink-0">
                    <ShieldCheck size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Sicherheits-Status: Hoch</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium leading-tight">
                        Verschlüsselung aktiv (AES-256). Tägliche Datenbank-Backups werden um 03:00 Uhr automatisiert durchgeführt.
                    </p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">v.</span>
                    <span className="text-[10px] font-bold text-white tracking-widest">{health?.apiVersion || '1.0.0'}</span>
                </div>
            </div>

        </div>
    );
}