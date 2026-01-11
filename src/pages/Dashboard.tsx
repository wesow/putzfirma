import { useEffect, useState } from 'react';
import { Users, Briefcase, Calendar, Euro, TrendingUp } from 'lucide-react';
import api from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    customersCount: 0,
    employeesCount: 0,
    openJobsCount: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Rolle prüfen, um zu wissen, was wir anzeigen dürfen
  const role = localStorage.getItem('role');

  useEffect(() => {
    // Nur laden, wenn Admin. Sonst gibt es 403 Fehler.
    if (role === 'ADMIN') {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [role]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats/dashboard');
      setStats(res.data);
    } catch (error) {
      console.error("Konnte Stats nicht laden", error);
    } finally {
      setLoading(false);
    }
  };

  // Begrüßungstext je nach Tageszeit
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';

  return (
    <div className="space-y-8">
      
      {/* Begrüßung */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">{greeting}, Chef! 👋</h1>
        <p className="text-slate-500 mt-1">Hier ist der aktuelle Status deiner Firma.</p>
      </div>

      {loading ? (
        <div>Lade Statistiken...</div>
      ) : role === 'ADMIN' ? (
        /* Kacheln Grid (Nur für Admin sichtbar) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Karte 1: Umsatz */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Euro className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Umsatz (Monat)</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {Number(stats.monthlyRevenue).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </h3>
            </div>
          </div>

          {/* Karte 2: Offene Jobs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Offene Jobs</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.openJobsCount}</h3>
            </div>
          </div>

          {/* Karte 3: Kunden */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Aktive Kunden</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.customersCount}</h3>
            </div>
          </div>

          {/* Karte 4: Mitarbeiter */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Team Größe</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.employeesCount}</h3>
            </div>
          </div>

        </div>
      ) : (
        /* Ansicht für Mitarbeiter (Keine Finanzdaten) */
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center gap-4">
          <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-blue-900">Willkommen im Team-Bereich!</h3>
            <p className="text-blue-700">Schaue unter "Jobs", welche Aufgaben heute anstehen.</p>
          </div>
        </div>
      )}

      {/* Optional: Schnellzugriff Buttons */}
      {role === 'ADMIN' && (
        <div className="pt-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Schnellzugriff</h2>
          <div className="flex gap-4">
             <a href="/dashboard/customers/new" className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition">
               + Neuer Kunde
             </a>
             <a href="/dashboard/contracts/new" className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition">
               + Neuer Vertrag
             </a>
          </div>
        </div>
      )}
    </div>
  );
}