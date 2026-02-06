import { Activity, Clock, Hash, Loader2, RefreshCw, Shield } from 'lucide-react';
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
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="page-container pb-safe">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title flex items-center gap-2">
            Audit-Protokoll <Shield className="text-blue-600" size={20} />
          </h1>
          <p className="page-subtitle">Revisionssichere Aufzeichnung aller System-Events.</p>
        </div>
        <button 
          onClick={fetchLogs} 
          disabled={loading}
          className="btn-secondary !p-2 transition-all hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-blue-600" : "text-slate-500"} />
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="table-container flex flex-col h-[700px] animate-in fade-in duration-500 pb-20 sm:pb-0">
        <div className="px-4 py-3 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="stat-icon-box bg-slate-900 text-white"><Clock size={14} /></div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Ereignis-Stream</h3>
          </div>
          <span className="status-badge bg-slate-50 text-slate-400 border-slate-200 !text-[8px]">
            {logs.length} EINTRÄGE
          </span>
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar bg-white">
          <table className="table-main w-full min-w-[1000px]">
            <thead className="table-head sticky top-0 z-10 bg-white">
              <tr>
                <th className="table-cell">Zeitstempel</th>
                <th className="table-cell">Akteur</th>
                <th className="table-cell">Operation</th>
                <th className="table-cell">Modul</th>
                <th className="table-cell text-right pr-4">Ressourcen-ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={32} />
                    <span className="label-caps">Lese Audit-Logs...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Activity size={32} className="mx-auto text-slate-200 mb-2 opacity-20" />
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Keine Aktivitäten protokolliert</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="table-row group">
                    <td className="table-cell align-middle whitespace-nowrap">
                      <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-slate-500">
                        <Clock size={12} className="text-slate-300" />
                        {new Date(log.createdAt).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </td>
                    
                    <td className="table-cell align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-black text-[10px] border border-slate-100 shadow-sm shrink-0">
                          {log.user ? log.user.firstName[0] + log.user.lastName[0] : <Activity size={12} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[12px] text-slate-800 leading-tight">
                            {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System-Kern'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                            {log.user ? log.user.email : 'Automatisierter Prozess'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="table-cell align-middle">
                      <span className={`status-badge !text-[9px] !px-2 !py-0.5 ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="table-cell align-middle">
                      <div className="flex items-center gap-1.5 font-black text-slate-600 uppercase text-[9px] tracking-widest">
                        <Hash size={10} className="text-slate-300" />
                        {log.entity}
                      </div>
                    </td>

                    <td className="table-cell text-right pr-4 align-middle">
                      <code className="text-[10px] font-mono font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-400 group-hover:text-blue-500 transition-colors">
                        {log.entityId.substring(0, 12)}
                      </code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="bg-slate-900 p-4 rounded-xl flex items-center gap-4 text-white shadow-lg animate-in slide-in-from-bottom-2">
        <div className="p-2 bg-white/10 rounded-lg shrink-0">
          <Shield size={20} className="text-blue-400" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Revisionssicherheit</p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium leading-tight">
            Dieses Protokoll ist manipulationsgeschützt. Einträge können weder geändert noch gelöscht werden und dienen der Einhaltung der DSGVO und GoBD Sorgfaltspflicht.
          </p>
        </div>
      </div>
    </div>
  );
}