import { useEffect, useState } from 'react';
import { Shield, Clock, User, Activity, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../lib/api';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: any;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stats/audit'); // Wir nutzen die Route im stats.controller
      setLogs(res.data);
    } catch (error) {
      console.error("Fehler beim Laden der Logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('FAILED')) return 'bg-red-50 text-red-600 border-red-100';
    if (action.includes('CREATE') || action.includes('SUCCESS')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (action.includes('LOGIN')) return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  return (
    <div className="page-container">
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title text-3xl font-black tracking-tight flex items-center gap-3">
            Sicherheits-Audit <Shield className="text-blue-600" size={28} />
          </h1>
          <p className="page-subtitle text-lg">Vollständige Protokollierung aller Systemaktivitäten.</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary !p-3.5">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Zeitpunkt</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Benutzer</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktion</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Objekt</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={32} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Lade Protokolle...</p>
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                      <Clock size={14} className="text-slate-300" />
                      {new Date(log.createdAt).toLocaleString('de-DE')}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px]">
                        {log.user ? log.user.firstName[0] : <Activity size={12} />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                          {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System / Gast'}
                        </p>
                        {log.user && <p className="text-[10px] text-slate-400">{log.user.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {log.entity}
                  </td>
                  <td className="p-6">
                    <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                      {log.entityId}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}