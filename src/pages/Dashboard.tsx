import { useEffect, useState } from 'react';
import { Users, Briefcase, Euro, UserCheck, RefreshCw } from 'lucide-react';
import api from '../lib/api';

// Definiere, wie die Daten vom Backend aussehen
interface DashboardStats {
  revenue: number;
  openJobs: number;
  activeCustomers: number;
  teamSize: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    revenue: 0,
    openJobs: 0,
    activeCustomers: 0,
    teamSize: 0
  });
  const [loading, setLoading] = useState(true);

  // Name aus dem LocalStorage holen (für die Begrüßung)
  const firstName = localStorage.getItem('firstName') || 'Chef';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Hier rufen wir dein neues Backend auf!
      const res = await api.get('/dashboard');
      setStats(res.data);
    } catch (error) {
      console.error("Fehler beim Laden des Dashboards:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
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
            {/* Kleiner Indikator (optional) */}
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Umsatz (Monat)</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {/* Hier formatieren wir die Zahl als Euro */}
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

      {/* --- PLATZHALTER FÜR CHARTS ODER KALENDER (Optional) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 h-80 flex items-center justify-center text-slate-400">
           Hier könnte bald ein Umsatz-Chart stehen 📈
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 h-80 flex items-center justify-center text-slate-400">
           Hier könnten die nächsten Termine stehen 📅
        </div>
      </div>

    </div>
  );
}