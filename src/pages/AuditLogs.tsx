import { Activity, Clock, Loader2, RefreshCw, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
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
      const res = await api.get('/stats/audit'); 
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
    <div className="page-container space-y-4">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title flex items-center gap-2">
            Sicherheits-Audit <Shield className="text-blue-600" size={18} />
          </h1>
          <p className="page-subtitle">Vollständige Protokollierung aller Systemaktivitäten.</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary !p-2 !px-3">
          <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : "text-slate-400"} />
        </button>
      </div>

      {/* TABLE CONTAINER (Compact) */}
      <div className="table-container flex flex-col h-full shadow-sm border border-slate-200">
        <div className="overflow-x-auto flex-1 bg-white">
          <table className="table-main">
            <thead>
              <tr className="table-head">
                <th className="table-cell w-40">Zeitpunkt</th>
                <th className="table-cell">Benutzer</th>
                <th className="table-cell">Aktion</th>
                <th className="table-cell">Objekt</th>
                <th className="table-cell text-right">ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-3" size={32} />
                    <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Lade Protokolle...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 text-xs italic">
                        Keine Logs vorhanden.
                    </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="table-row group">
                    <td className="table-cell text-slate-500 font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-slate-300" />
                        {new Date(log.createdAt).toLocaleString('de-DE')}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-200">
                          {log.user ? log.user.firstName[0] : <Activity size={10} />}
                        </div>
                        <div className="leading-tight">
                          <p className="font-bold text-[12px] text-slate-700">
                            {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System / Gast'}
                          </p>
                          {log.user && <p className="text-[10px] text-slate-400">{log.user.email}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="table-cell">
                      <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wide inline-block ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="table-cell font-medium text-slate-600 uppercase text-[10px] tracking-wide">
                      {log.entity}
                    </td>

                    <td className="table-cell text-right">
                      <code className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-400 font-mono border border-slate-100 group-hover:border-slate-200 transition-colors">
                        {log.entityId.substring(0, 8)}...
                      </code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}