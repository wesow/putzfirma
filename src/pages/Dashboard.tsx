import { useEffect, useState } from 'react';
import { Users, Briefcase, Euro, UserCheck, RefreshCw } from 'lucide-react';
// NEU: Import für das Diagramm
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';

interface DashboardStats {
  revenue: number;
  openJobs: number;
  activeCustomers: number;
  teamSize: number;
  // NEU: Daten für das Chart
  chartData: { name: string; revenue: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    openJobs: 0,
    activeCustomers: 0,
    teamSize: 0,
    chartData: [] // Default leer
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
    } catch (error) {
      console.error("Fehler beim Laden des Dashboards:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Guten Abend, {firstName}! 👋</h1>
          <p className="text-slate-500 mt-2">Hier ist der aktuelle Status deiner Firma.</p>
        </div>
        <button 
          onClick={fetchDashboardData} 
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Aktualisieren"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* --- KACHELN (STATS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Kachel 1: UMSATZ */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-green-50 rounded-xl">
              <Euro className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Umsatz (Monat)</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {loading ? "..." : stats.revenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </h3>
          </div>
        </div>

        {/* Kachel 2: OFFENE JOBS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Offene Jobs</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {loading ? "..." : stats.openJobs}
            </h3>
          </div>
        </div>

        {/* Kachel 3: KUNDEN */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Aktive Kunden</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {loading ? "..." : stats.activeCustomers}
            </h3>
          </div>
        </div>

        {/* Kachel 4: TEAM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-orange-50 rounded-xl">
              <UserCheck className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Team Größe</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {loading ? "..." : stats.teamSize}
            </h3>
          </div>
        </div>
      </div>

      {/* --- CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CHART: UMSATZENTWICKLUNG */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[400px]">
           <h3 className="text-lg font-bold text-slate-800 mb-6">Umsatzentwicklung (letzte 6 Monate)</h3>
           
           <div className="h-80 w-full">
             {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400">Lade Diagramm...</div>
             ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
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
                      tickFormatter={(value) => `${value} €`}
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      // FIX: Wir erlauben "undefined" (?) und nutzen "|| 0" als Fallback
                      formatter={(value?: number) => [`${Number(value || 0).toFixed(2)} €`, 'Umsatz']}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#2563eb" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
             )}
           </div>
        </div>

        {/* INFO BOX RECHTS (Könnte später ein Kalender sein) */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
           <div>
              <h3 className="text-lg font-bold mb-2">Pro-Tipp 💡</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Regelmäßige Rechnungen verbessern den Cashflow.
                Vergiss nicht, am Ende der Woche alle erledigten Jobs zu prüfen und abzurechnen.
              </p>
           </div>
           
           <div className="mt-8">
             <div className="text-sm text-slate-400 mb-1">Nächste Steuer-Deadline</div>
             <div className="text-2xl font-bold">10. Februar</div>
           </div>
        </div>
      </div>
    </div>
  );
}