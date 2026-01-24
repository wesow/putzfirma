import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Users, Briefcase, Euro, UserCheck, RefreshCw, PlusCircle, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';

// --- TYPEN ---
interface DashboardStats {
  revenue: number;
  openJobs: number;
  activeCustomers: number;
  teamSize: number;
  chartData: { name: string; revenue: number }[];
}

// --- WICHTIG: StatCard AUSSERHALB der Hauptfunktion ---
const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, onClick, isCurrency = false }: any) => (
  <div 
      onClick={onClick}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 cursor-pointer hover:shadow-md hover:border-slate-200 transition-all group"
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${bgClass} transition-colors`}>
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
      {onClick && <ArrowRight className="text-slate-300 group-hover:text-slate-500 transition-colors" size={18} />}
    </div>
    <div>
      <p className="text-slate-500 font-medium text-sm">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 mt-2">
        {isCurrency 
          ? Number(value).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) 
          : value}
      </h3>
    </div>
  </div>
);

// --- HAUPTKOMPONENTE ---
export default function Dashboard() {
  const navigate = useNavigate(); 
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    openJobs: 0,
    activeCustomers: 0,
    teamSize: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  const firstName = localStorage.getItem('firstName') || 'Chef';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard');
      setStats(res.data);
      // Optional: Toast entfernen oder nur bei manuellem Refresh zeigen
    } catch (error) {
      console.error("Fehler beim Laden:", error);
      // Fallback Daten für Demo, falls API fehlschlägt (optional)
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats.revenue) {
     return <div className="min-h-screen flex items-center justify-center text-slate-400"><Loader2 className="animate-spin mr-2" /> Lade Dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Guten Abend, {firstName}! 👋</h1>
          <p className="text-slate-500 mt-2">Hier ist der Überblick über dein Unternehmen.</p>
        </div>
        
        {/* Schnellaktionen */}
        <div className="flex gap-2">
            <button 
                onClick={() => navigate('/dashboard/jobs')} 
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm active:scale-95"
            >
                <PlusCircle size={18} /> Neuer Job
            </button>
            <button 
                onClick={fetchDashboardData} 
                className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-white bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition"
                title="Aktualisieren"
            >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      {/* --- KACHELN (STATS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Umsatz (Gesamt)" 
            value={stats.revenue} 
            icon={Euro} 
            colorClass="text-emerald-600" 
            bgClass="bg-emerald-50" 
            isCurrency 
            onClick={() => navigate('/dashboard/invoices')} 
        />
        <StatCard 
            title="Offene Jobs" 
            value={stats.openJobs} 
            icon={Briefcase} 
            colorClass="text-blue-600" 
            bgClass="bg-blue-50" 
            onClick={() => navigate('/dashboard/jobs')} 
        />
        <StatCard 
            title="Aktive Kunden" 
            value={stats.activeCustomers} 
            icon={Users} 
            colorClass="text-purple-600" 
            bgClass="bg-purple-50" 
            onClick={() => navigate('/dashboard/customers')} 
        />
        <StatCard 
            title="Team Größe" 
            value={stats.teamSize} 
            icon={UserCheck} 
            colorClass="text-orange-600" 
            bgClass="bg-orange-50" 
            onClick={() => navigate('/dashboard/team')} 
        />
      </div>

      {/* --- CHARTS & SIDEBAR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CHART: UMSATZENTWICKLUNG */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[400px]">
           <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-slate-800">Umsatzentwicklung</h3>
               <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">Letzte 6 Monate</span>
           </div>
           
           <div className="h-80 w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fill: '#64748b', fontSize: 12}} 
                     dy={10}
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fill: '#64748b', fontSize: 12}} 
                     tickFormatter={(value) => `${value / 1000}k`} 
                   />
                   <Tooltip 
                     cursor={{fill: '#f8fafc'}}
                     contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                     formatter={(value: any) => [`${Number(value).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`, 'Umsatz']}
                   />
                   <Bar 
                     dataKey="revenue" 
                     fill="#3b82f6" 
                     radius={[6, 6, 0, 0]} 
                     barSize={32}
                     className="hover:opacity-80 transition-opacity cursor-pointer"
                   />
                 </BarChart>
               </ResponsiveContainer>
           </div>
        </div>

        {/* INFO BOX RECHTS */}
        <div className="flex flex-col gap-6">
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                
                <h3 className="text-lg font-bold mb-2 relative z-10">Monatsabschluss 📊</h3>
                <p className="text-slate-300 text-sm leading-relaxed relative z-10 mb-6">
                   Vergiss nicht, die Stunden deiner Mitarbeiter zu prüfen, bevor du die Lohnabrechnung startest.
                </p>
                
                <button 
                    onClick={() => navigate('/dashboard/payroll')} 
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition backdrop-blur-sm border border-white/10"
                >
                    Zur Lohnabrechnung
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex-1">
                <h3 className="font-bold text-slate-800 mb-4">Schnellzugriff</h3>
                <div className="space-y-3">
                    <button 
                        onClick={() => navigate('/dashboard/customers/new')} 
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition group text-sm font-medium text-slate-600"
                    >
                        <span className="flex items-center gap-2"><Users size={16}/> Kunde anlegen</span>
                        <PlusCircle size={16} className="text-slate-300 group-hover:text-blue-500"/>
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard/contracts/new')} 
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-600 transition group text-sm font-medium text-slate-600"
                    >
                        <span className="flex items-center gap-2"><FileText size={16}/> Vertrag erstellen</span>
                        <PlusCircle size={16} className="text-slate-300 group-hover:text-purple-500"/>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}