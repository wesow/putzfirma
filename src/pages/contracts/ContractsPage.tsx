import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, FileText, CalendarClock, Search, 
  Repeat, AlertCircle, Loader2, CheckCircle, 
  PauseCircle, MapPin, Trash2, Play, Coffee, X, PenTool, FileSignature
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import SignatureModal from '../../components/SignatureModal'; // Deine neue Komponente

interface Contract {
  id: string;
  customer: { companyName: string | null; lastName: string; firstName: string };
  service: { name: string };
  address?: { street: string; city: string };
  interval: string;
  nextExecutionDate: string;
  isActive: boolean;
  endDate?: string | null;
  isSigned: boolean; // NEU: Damit wir wissen, ob schon unterschrieben wurde
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State für das Pause-Modal
  const [showPauseModal, setShowPauseModal] = useState<Contract | null>(null);
  const [pauseData, setPauseData] = useState({ startDate: '', endDate: '', reason: '' });

  // State für das Unterschriften-Modal (NEU)
  const [signContractData, setSignContractData] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contracts');
      setContracts(res.data);
    } catch (error) {
      toast.error("Fehler beim Laden der Verträge");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleToggleStatus = async (contract: Contract) => {
      const newStatus = !contract.isActive;
      const toastId = toast.loading(newStatus ? 'Aktiviere Vertrag...' : 'Pausiere Vertrag...');
      
      try {
          await api.patch(`/contracts/${contract.id}`, { isActive: newStatus });
          
          // Lokales Update für schnelles Feedback
          setContracts(prev => prev.map(c => c.id === contract.id ? { ...c, isActive: newStatus } : c));
          toast.success(newStatus ? 'Vertrag aktiviert' : 'Vertrag pausiert', { id: toastId });
      } catch (e) {
          toast.error("Fehler beim Status-Update", { id: toastId });
      }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Wollen Sie diesen Vertrag wirklich löschen? Dies stoppt alle zukünftigen Jobs.")) return;
      
      const toastId = toast.loading('Lösche...');
      try {
          await api.delete(`/contracts/${id}`);
          setContracts(prev => prev.filter(c => c.id !== id));
          toast.success("Vertrag gelöscht", { id: toastId });
      } catch (e) {
          toast.error("Löschen nicht möglich (evtl. existieren schon Rechnungen)", { id: toastId });
      }
  };

  const handleSavePause = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!showPauseModal) return;

      const toastId = toast.loading("Trage Pause ein...");
      try {
          await api.post(`/contracts/${showPauseModal.id}/pause`, pauseData);
          toast.success("Betriebsferien gespeichert! Jobs werden in diesem Zeitraum übersprungen.", { id: toastId });
          setShowPauseModal(null);
          setPauseData({ startDate: '', endDate: '', reason: '' });
      } catch (error: any) {
          toast.error(error.response?.data?.message || "Fehler beim Speichern", { id: toastId });
      }
  };

  // --- HELPER ---

  const translateInterval = (interval: string) => {
    const map: Record<string, string> = {
      'WEEKLY': 'WÖCHENTLICH',
      'BIWEEKLY': 'ALLE 2 WOCHEN',
      'MONTHLY': 'MONATLICH',
      'ONCE': 'EINMALIG'
    };
    return map[interval] || interval;
  };

  const getCustomerName = (c: Contract['customer']) => {
    return c.companyName || `${c.firstName} ${c.lastName}`;
  };

  const filteredContracts = contracts.filter(c => {
    const term = searchTerm.toLowerCase();
    const customerName = getCustomerName(c.customer).toLowerCase();
    const serviceName = c.service.name.toLowerCase();
    return customerName.includes(term) || serviceName.includes(term);
  });

  return (
    <div className="page-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title leading-none">Daueraufträge</h1>
          <p className="page-subtitle text-slate-500 mt-2 font-medium">Verwaltung wiederkehrender Reinigungsaufträge.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Suchen..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-standard pl-10"
            />
          </div>
          <Link to="/dashboard/contracts/new" className="btn-primary shadow-xl shadow-blue-500/20">
            <Plus size={18} /> <span>Neuer Vertrag</span>
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-4 text-blue-600" size={44} />
          <span className="font-black text-[10px] uppercase tracking-[0.2em] italic">Lade Verträge...</span>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
          <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Keine Verträge gefunden</p>
        </div>
      ) : (
        <div className="table-container shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <table className="table-main">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Kunde & Objekt</th>
                <th className="table-cell">Leistung & Turnus</th>
                <th className="table-cell">Nächster Termin</th>
                <th className="table-cell text-center">Status</th>
                <th className="table-cell text-right">Optionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="table-row group">
                  
                  {/* Kunde */}
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                        <div className="font-black text-slate-900 text-sm leading-tight">
                        {getCustomerName(contract.customer)}
                        </div>
                        {contract.isSigned && (
                            <div className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold" title="Digital unterschrieben">
                                <FileSignature size={10} /> Signed
                            </div>
                        )}
                    </div>
                    {contract.address && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase mt-1 italic tracking-tight">
                        <MapPin size={10} className="text-slate-300" />
                        {contract.address.street}, {contract.address.city}
                      </div>
                    )}
                  </td>

                  {/* Leistung */}
                  <td className="table-cell">
                    <div className="flex items-center gap-2 font-black text-blue-600 text-xs mb-1.5 uppercase tracking-tighter">
                      <FileText size={14} className="text-blue-400" />
                      {contract.service.name}
                    </div>
                    <span className="status-badge bg-slate-50 text-slate-500 border-slate-200 !rounded-md font-black text-[9px]">
                      <Repeat size={10} className="mr-1" />
                      {translateInterval(contract.interval)}
                    </span>
                  </td>

                  {/* Termin */}
                  <td className="table-cell">
                    {contract.interval === 'ONCE' && !contract.isActive ? (
                        <span className="text-xs text-slate-400 italic">Erledigt</span>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border ${contract.isActive ? 'bg-blue-50 text-blue-600 border-blue-100/50' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                <CalendarClock size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Geplant am</p>
                                <span className={`font-black text-sm tracking-tight ${contract.isActive ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                                {new Date(contract.nextExecutionDate).toLocaleDateString('de-DE', {
                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                })}
                                </span>
                            </div>
                        </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="table-cell text-center">
                    {contract.isActive ? (
                      <span className="status-badge bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] shadow-sm">
                        <CheckCircle size={10} className="mr-1" />
                        AKTIV
                      </span>
                    ) : (
                      <span className="status-badge bg-slate-50 text-slate-400 border-slate-200 font-black text-[10px]">
                        <PauseCircle size={10} className="mr-1" />
                        {contract.interval === 'ONCE' ? 'BEENDET' : 'PAUSIERT'}
                      </span>
                    )}
                  </td>

                  {/* Aktionen */}
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      
                      {/* 1. SIGNATURE BUTTON (Nur wenn noch nicht unterschrieben) */}
                      {!contract.isSigned && (
                          <button 
                            onClick={() => setSignContractData({ id: contract.id, name: getCustomerName(contract.customer) })}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"
                            title="Vertrag unterschreiben lassen"
                          >
                            <PenTool size={18} />
                          </button>
                      )}

                      {/* 2. PAUSE BUTTON (Nur für Daueraufträge) */}
                      {contract.interval !== 'ONCE' && (
                          <button 
                            onClick={() => setShowPauseModal(contract)}
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all shadow-sm"
                            title="Betriebsferien / Pause eintragen"
                          >
                            <Coffee size={18} />
                          </button>
                      )}

                      {/* 3. TOGGLE BUTTON */}
                      {contract.interval !== 'ONCE' && (
                          <button 
                            onClick={() => handleToggleStatus(contract)}
                            className={`p-2 rounded-xl transition-all shadow-sm ${contract.isActive ? 'text-blue-500 hover:bg-blue-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            title={contract.isActive ? "Pausieren" : "Aktivieren"}
                          >
                            {contract.isActive ? <PauseCircle size={18} /> : <Play size={18} />}
                          </button>
                      )}

                      {/* 4. DELETE BUTTON */}
                      <button 
                        onClick={() => handleDelete(contract.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                        title="Löschen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- PAUSE MODAL --- */}
      {showPauseModal && (
        <div className="modal-overlay">
            <div className="modal-content !max-w-md animate-in zoom-in-95">
                <div className="modal-header bg-amber-500 text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg"><Coffee size={20} /></div>
                        <div>
                            <h3 className="font-bold text-lg leading-none">Pausenzeit eintragen</h3>
                            <p className="text-[10px] opacity-90 mt-1 font-medium">Für {getCustomerName(showPauseModal.customer)}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowPauseModal(null)} className="hover:bg-white/20 p-2 rounded-lg transition"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleSavePause} className="modal-body space-y-5 p-6">
                    <div className="bg-amber-50 p-4 rounded-xl text-xs text-amber-800 border border-amber-100 flex gap-3">
                        <AlertCircle size={32} className="shrink-0 text-amber-600"/>
                        <p>In diesem Zeitraum werden <strong>keine Jobs generiert</strong>. Der Vertrag läuft danach automatisch weiter.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="label-caps">Von Datum</label>
                            <input type="date" required className="input-standard" 
                                value={pauseData.startDate} onChange={e => setPauseData({...pauseData, startDate: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="label-caps">Bis (Inklusive)</label>
                            <input type="date" required className="input-standard" 
                                value={pauseData.endDate} onChange={e => setPauseData({...pauseData, endDate: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="label-caps">Grund (Optional)</label>
                        <input type="text" className="input-standard" placeholder="z.B. Betriebsferien, Renovierung..."
                            value={pauseData.reason} onChange={e => setPauseData({...pauseData, reason: e.target.value})} />
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="btn-primary w-full bg-amber-500 border-amber-600 shadow-amber-200/50 hover:bg-amber-600">
                            Pause bestätigen
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- SIGNATURE MODAL --- */}
      {signContractData && (
          <SignatureModal 
              contractId={signContractData.id}
              customerName={signContractData.name}
              onClose={() => setSignContractData(null)}
              onSuccess={fetchContracts} 
          />
      )}

    </div>
  );
}