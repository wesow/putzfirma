import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FileCheck,
  FileText,
  GitMerge,
  Landmark,
  Loader2,
  Megaphone,
  Settings2,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface FlowStats {
  offersOpen: number;
  contractsActive: number;
  jobsOpen: number;
  jobsDone: number;
  invoicesOpen: number;
  revenue: number;
}

export default function BusinessFlowPage() {
  const [loading, setLoading] = useState(true);
  
  // Echte Statistiken aus der DB
  const [stats, setStats] = useState<FlowStats>({
    offersOpen: 0, contractsActive: 0, jobsOpen: 0, jobsDone: 0, invoicesOpen: 0, revenue: 0
  });

  // Dummy State für Automatisierungs-Einstellungen (Frontend-only vorerst)
  const [autoSettings, setAutoSettings] = useState({
    autoConvert: true,
    autoInvoice: false,
    emailReminders: true
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
        revenue: dashboard.data.revenue || 0
      });
    } catch (e) {
      console.error("Datenfehler", e);
      toast.error("Konnte Live-Daten nicht laden");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: keyof typeof autoSettings) => {
    setAutoSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Einstellung gespeichert (Simulation)");
  };

  if (loading) return (
    <div className="page-container flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
    </div>
  );

  return (
    <div className="page-container">
      
      {/* HEADER */}
      <div className="header-section">
        <div>
          <h1 className="page-title">Business Flow</h1>
          <p className="page-subtitle">Prozess-Visualisierung und Live-Status.</p>
        </div>
        <div className="flex gap-2">
            <button className="btn-secondary !py-1.5" onClick={loadData}>
                <Zap size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="page-content-scroll">
        
        {/* KPI GRID (Oben) */}
        <div className="stats-grid">
            <div className="stat-card">
                <div className="stat-icon-wrapper bg-blue-50 text-blue-600"><Megaphone size={18}/></div>
                <div><span className="label-caps">Offene Angebote</span><div className="text-lg font-bold text-slate-900">{stats.offersOpen}</div></div>
            </div>
            <div className="stat-card">
                <div className="stat-icon-wrapper bg-indigo-50 text-indigo-600"><Briefcase size={18}/></div>
                <div><span className="label-caps">Offene Jobs</span><div className="text-lg font-bold text-slate-900">{stats.jobsOpen}</div></div>
            </div>
            <div className="stat-card">
                <div className="stat-icon-wrapper bg-amber-50 text-amber-600"><FileCheck size={18}/></div>
                <div><span className="label-caps">Offene Rechnungen</span><div className="text-lg font-bold text-slate-900">{stats.invoicesOpen}</div></div>
            </div>
            <div className="stat-card">
                <div className="stat-icon-wrapper bg-emerald-50 text-emerald-600"><Landmark size={18}/></div>
                <div><span className="label-caps">Umsatz (Monat)</span><div className="text-lg font-bold text-slate-900">{stats.revenue.toLocaleString('de-DE', {style:'currency', currency:'EUR'})}</div></div>
            </div>
        </div>

        <div className="content-grid">
            
            {/* LINKER BEREICH: VISUALISIERUNG */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* FLOW CHART */}
                <div className="chart-container">
                    <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <GitMerge size={16} className="text-blue-600"/> Standard Prozess-Kette
                        </h3>
                        <span className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100">System Aktiv</span>
                    </div>

                    {/* DER FLOW */}
                    <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 py-4 px-2">
                        
                        {/* STEP 1: ANGEBOT */}
                        <div className="relative group w-full md:w-auto flex-1">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative z-10 flex flex-col items-center text-center hover:border-blue-400 hover:shadow-md transition-all group-hover:-translate-y-1">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100 shadow-sm">
                                    <Megaphone size={18} />
                                </div>
                                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">1. Angebot</h4>
                                <div className="mt-2 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                                    {stats.offersOpen} Offen
                                </div>
                            </div>
                        </div>

                        <ArrowRight className="text-slate-300 hidden md:block shrink-0" />

                        {/* STEP 2: VERTRAG */}
                        <div className="relative group w-full md:w-auto flex-1">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative z-10 flex flex-col items-center text-center hover:border-purple-400 hover:shadow-md transition-all group-hover:-translate-y-1">
                                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100 shadow-sm">
                                    <FileText size={18} />
                                </div>
                                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">2. Vertrag</h4>
                                <div className="mt-2 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                                    {stats.contractsActive} Aktiv
                                </div>
                            </div>
                        </div>

                        <ArrowRight className="text-slate-300 hidden md:block shrink-0" />

                        {/* STEP 3: JOBS */}
                        <div className="relative group w-full md:w-auto flex-1">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative z-10 flex flex-col items-center text-center hover:border-amber-400 hover:shadow-md transition-all group-hover:-translate-y-1">
                                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-100 shadow-sm">
                                    <Briefcase size={18} />
                                </div>
                                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">3. Ausführung</h4>
                                <div className="mt-2 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
                                    {stats.jobsOpen} Geplant
                                </div>
                            </div>
                        </div>

                        <ArrowRight className="text-slate-300 hidden md:block shrink-0" />

                        {/* STEP 4: RECHNUNG */}
                        <div className="relative group w-full md:w-auto flex-1">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative z-10 flex flex-col items-center text-center hover:border-emerald-400 hover:shadow-md transition-all group-hover:-translate-y-1">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100 shadow-sm">
                                    <FileCheck size={18} />
                                </div>
                                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">4. Zahlung</h4>
                                <div className="mt-2 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                    {stats.invoicesOpen} Offen
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="label-caps mb-2">Wie das System arbeitet</h4>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-3 text-xs text-slate-600">
                                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                <span><strong>Automatisch:</strong> Wenn ein Kunde ein Angebot annimmt, wird sofort ein Vertrag erstellt.</span>
                            </li>
                            <li className="flex items-start gap-3 text-xs text-slate-600">
                                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                <span><strong>Generierung:</strong> Der Vertrag erstellt automatisch Jobs basierend auf dem Intervall (z.B. Wöchentlich).</span>
                            </li>
                            <li className="flex items-start gap-3 text-xs text-slate-600">
                                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                <span><strong>Abrechnung:</strong> Erledigte Jobs landen im Rechnungspool und können gesammelt fakturiert werden.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* RECHTER BEREICH: AUTOMATISIERUNG */}
            <div className="lg:col-span-4 space-y-4">
                <div className="chart-container">
                    <div className="mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <Settings2 size={16} className="text-slate-400"/>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Konfiguration</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                            <div>
                                <p className="text-xs font-bold text-slate-800">Auto-Vertrag</p>
                                <p className="text-[10px] text-slate-400">Angebot → Vertrag bei Annahme</p>
                            </div>
                            <div 
                                onClick={() => toggle('autoConvert')}
                                className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${autoSettings.autoConvert ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoSettings.autoConvert ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                            <div>
                                <p className="text-xs font-bold text-slate-800">Auto-Rechnung</p>
                                <p className="text-[10px] text-slate-400">Monatlicher Sammellauf</p>
                            </div>
                            <div 
                                onClick={() => toggle('autoInvoice')}
                                className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${autoSettings.autoInvoice ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoSettings.autoInvoice ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                            <div>
                                <p className="text-xs font-bold text-slate-800">Termin-Erinnerung</p>
                                <p className="text-[10px] text-slate-400">E-Mail an Kunden (24h vorher)</p>
                            </div>
                            <div 
                                onClick={() => toggle('emailReminders')}
                                className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${autoSettings.emailReminders ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoSettings.emailReminders ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <button className="btn-primary w-full shadow-none bg-slate-800 border-slate-900 hover:bg-slate-900">
                            <Zap size={16} /> Cronjob manuell starten
                        </button>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}