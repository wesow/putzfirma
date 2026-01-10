import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Daten laden
  useEffect(() => {
    api.get('/jobs')
      .then(res => setJobs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Kleine Helfer-Funktion für Status-Farben
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Willkommen zurück 👋</h1>

      {/* Statistik Karten (Dummy Zahlen für Optik) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Calendar /></div>
          <div>
            <p className="text-slate-500 text-sm">Geplante Jobs</p>
            <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'SCHEDULED').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600"><CheckCircle /></div>
          <div>
            <p className="text-slate-500 text-sm">Erledigt</p>
            <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'COMPLETED').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-full text-orange-600"><AlertCircle /></div>
          <div>
            <p className="text-slate-500 text-sm">Offene Zuweisungen</p>
            <p className="text-2xl font-bold text-orange-600">
              {jobs.filter(j => j.assignments.length === 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Job Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Aktuelle Aufträge</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-slate-500">Lade Daten...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-6 py-3">Datum</th>
                <th className="px-6 py-3">Kunde</th>
                <th className="px-6 py-3">Ort</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Mitarbeiter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    {new Date(job.scheduledDate).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-6 py-4">{job.customer?.companyName || job.customer?.lastName}</td>
                  <td className="px-6 py-4">{job.address?.city}, {job.address?.street}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {job.assignments.length > 0 ? (
                      <span className="flex items-center gap-2 text-slate-700">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                           {job.assignments[0].employee.firstName[0]}
                        </div>
                        {job.assignments[0].employee.firstName}
                      </span>
                    ) : (
                      <span className="text-orange-500 text-xs font-bold">Nicht zugewiesen</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}