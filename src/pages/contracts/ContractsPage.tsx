import {
  CalendarClock,
  Coffee,
  FileText,
  Loader2,
  MapPin,
  PauseCircle,
  PenTool,
  Play,
  Plus,
  Repeat,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import SignatureModal from '../../components/SignatureModal';
import ViewSwitcher from '../../components/ViewSwitcher';
import api from '../../lib/api';

interface Contract {
  id: string;
  customer: { companyName: string | null; lastName: string; firstName: string };
  service: { name: string };
  address?: { street: string; city: string };
  interval: string;
  nextExecutionDate: string;
  isActive: boolean;
  endDate?: string | null;
  isSigned: boolean;
}

export default function ContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [showPauseModal, setShowPauseModal] = useState<Contract | null>(null);
  const [pauseData, setPauseData] = useState({ startDate: '', endDate: '', reason: '' });
  const [signContractData, setSignContractData] = useState<{id: string, name: string} | null>(null);

  useEffect(() => { fetchContracts(); }, []);

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

  const handleToggleStatus = async (contract: Contract) => {
      const newStatus = !contract.isActive;
      const toastId = toast.loading(newStatus ? 'Aktiviere Vertrag...' : 'Pausiere Vertrag...');
      try {
          await api.patch(`/contracts/${contract.id}`, { isActive: newStatus });
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
          toast.error("Löschen nicht möglich.", { id: toastId });
      }
  };

  const handleSavePause = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!showPauseModal) return;
      const toastId = toast.loading("Trage Pause ein...");
      try {
          await api.post(`/contracts/${showPauseModal.id}/pause`, pauseData);
          toast.success("Pause gespeichert!", { id: toastId });
          setShowPauseModal(null);
          setPauseData({ startDate: '', endDate: '', reason: '' });
      } catch (error: any) {
          toast.error("Fehler beim Speichern", { id: toastId });
      }
  };

  const translateInterval = (interval: string) => {
    const map: Record<string, string> = { 'WEEKLY': 'WÖCHENTLICH', 'BIWEEKLY': '14-TÄGIG', 'MONTHLY': 'MONATLICH', 'ONCE': 'EINMALIG' };
    return map[interval] || interval;
  };

  const getCustomerName = (c: Contract['customer']) => c.companyName || `${c.firstName} ${c.lastName}`;

  const filteredContracts = contracts.filter(c => {
    const term = searchTerm.toLowerCase();
    return getCustomerName(c.customer).toLowerCase().includes(term) || c.service.name.toLowerCase().includes(term);
  });

  return (
    <div className="page-container">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        <div>
          <h1 className="page-title">Vertragsmanagement</h1>
          <p className="page-subtitle">Verwaltung wiederkehrender Zyklen und aktiver Dienstleistungsverträge.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
           <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 p-1 rounded-lg border border-slate-200">
              <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
              <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Suchen..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-white border-none rounded-md py-1.5 pl-8 pr-2 text-[12px] focus:ring-0 placeholder:text-slate-400 font-medium" 
                />
              </div>
           </div>

           <button onClick={() => navigate('/dashboard/contracts/new')} className="btn-primary w-full sm:w-auto whitespace-nowrap">
             <Plus size={16} /> Neuer Vertrag
           </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">Synchronisiere Vertragsdaten...</span>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 m-4 py-20">
           <FileText size={40} className="text-slate-200 mb-3" />
           <p className="text-slate-500 font-bold text-sm">Keine Verträge gefunden</p>
        </div>
      ) : viewMode === 'GRID' ? (
        
        /* --- GRID VIEW (IDENTISCH ZU TEAM/KUNDEN) --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500 pb-safe">
          {filteredContracts.map((contract) => (
            <div key={contract.id} className="employee-card group h-full">
              {/* Farbstreifen oben */}
              <div className={`absolute top-0 left-0 w-full h-1 ${contract.isActive ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              
              <div className="flex justify-between items-start mb-4 pt-1">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0 ${contract.isActive ? 'bg-blue-500' : 'bg-slate-300'}`}>
                        {contract.customer.firstName.charAt(0)}{contract.customer.lastName.charAt(0)}
                    </div>
                    <div className="text-left overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm leading-tight truncate w-24">
                              {getCustomerName(contract.customer)}
                          </h3>
                          {contract.isSigned && (
                             <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1 py-0.5 rounded font-black uppercase tracking-tighter">Signed</span>
                          )}
                        </div>
                        <span className={`status-badge mt-1 ${contract.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                            {contract.isActive ? 'AKTIV' : 'PAUSIERT'}
                        </span>
                    </div>
                </div>
                
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleDelete(contract.id)} className="btn-icon-only hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-[11px] text-blue-600 font-bold bg-blue-50 p-1.5 rounded border border-blue-100">
                  <FileText size={12} className="shrink-0" /> <span className="truncate uppercase tracking-tight">{contract.service.name}</span>
                </div>
                
                <div className="flex flex-col gap-1 px-1.5 pt-1">
                   <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                      <Repeat size={10} className="text-slate-300" /> {translateInterval(contract.interval)}
                   </div>
                   {contract.address && (
                      <div className="flex items-start gap-2 text-[10px] text-slate-400 font-medium">
                        <MapPin size={10} className="text-slate-300 mt-0.5" /> 
                        <span className="leading-tight">{contract.address.street}, {contract.address.city}</span>
                      </div>
                   )}
                </div>

                <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarClock size={14} className={contract.isActive ? 'text-blue-500' : 'text-slate-300'} />
                        <span className={`text-[11px] font-bold ${contract.isActive ? 'text-slate-700' : 'text-slate-400'}`}>
                           {new Date(contract.nextExecutionDate).toLocaleDateString('de-DE')}
                        </span>
                    </div>
                    <span className="text-[9px] font-black text-slate-300 uppercase">Nächster Termin</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-50 flex items-center justify-end gap-2 mt-auto">
                  {!contract.isSigned && (
                      <button onClick={() => setSignContractData({ id: contract.id, name: getCustomerName(contract.customer) })} className="btn-secondary !py-1 !px-2 !text-[10px] gap-1">
                        <PenTool size={12} /> Sign
                      </button>
                  )}
                  {contract.interval !== 'ONCE' && (
                      <>
                        <button onClick={() => setShowPauseModal(contract)} className="btn-secondary !py-1 !px-2 !text-[10px] gap-1">
                          <Coffee size={12} /> Pause
                        </button>
                        <button onClick={() => handleToggleStatus(contract)} className={`btn-secondary !py-1 !px-2 !text-[10px] gap-1 ${contract.isActive ? 'hover:!bg-amber-50 hover:!text-amber-600' : 'hover:!bg-emerald-50 hover:!text-emerald-600'}`}>
                          {contract.isActive ? <PauseCircle size={12} /> : <Play size={12} />} {contract.isActive ? 'Stop' : 'Start'}
                        </button>
                      </>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* --- TABLE VIEW (WIE IM LETZTEN SCHRITT) --- */
        <div className="table-container animate-in slide-in-from-bottom-2 duration-300 pb-safe">
          <div className="flex-1 custom-scrollbar overflow-y-auto">
            <table className="table-main">
                <thead className="table-head sticky top-0 z-10">
                <tr>
                    <th className="px-4 py-3 text-left">Vertragspartner</th>
                    <th className="px-4 py-3 text-left">Leistung & Turnus</th>
                    <th className="px-4 py-3 text-left">Nächster Termin</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right pr-4">Aktionen</th>
                </tr>
                </thead>
                <tbody>
                {filteredContracts.map((contract) => (
                    <tr key={contract.id} className="table-row group">
                      <td className="table-cell pl-4 align-middle">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0 ${contract.isActive ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                {contract.customer.firstName.charAt(0)}{contract.customer.lastName.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-slate-800 leading-tight">{getCustomerName(contract.customer)}</div>
                                  {contract.isSigned && <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1 py-0.5 rounded font-black uppercase">Signed</span>}
                                </div>
                                {contract.address && <div className="text-[10px] text-slate-400 font-medium">{contract.address.street}, {contract.address.city}</div>}
                            </div>
                        </div>
                      </td>
                      <td className="table-cell align-middle">
                        <div className="flex flex-col gap-1">
                            <div className="font-bold text-blue-600 text-[11px] uppercase tracking-tight flex items-center gap-1.5"><FileText size={12} /> {contract.service.name}</div>
                            <span className="status-badge bg-slate-50 text-slate-500 border-slate-200 w-fit"><Repeat size={10} /> {translateInterval(contract.interval)}</span>
                        </div>
                      </td>
                      <td className="table-cell align-middle">
                        <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg border ${contract.isActive ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}><CalendarClock size={14} /></div>
                            <div className={`text-[12px] font-bold ${contract.isActive ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{new Date(contract.nextExecutionDate).toLocaleDateString('de-DE')}</div>
                        </div>
                      </td>
                      <td className="table-cell text-center align-middle">
                         <span className={`status-badge ${contract.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                            {contract.isActive ? 'AKTIV' : 'PAUSIERT'}
                         </span>
                      </td>
                      <td className="table-cell text-right pr-4 align-middle">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {!contract.isSigned && <button onClick={() => setSignContractData({ id: contract.id, name: getCustomerName(contract.customer) })} className="btn-icon-only text-indigo-500 hover:bg-indigo-50"><PenTool size={14} /></button>}
                          {contract.interval !== 'ONCE' && (
                            <>
                              <button onClick={() => setShowPauseModal(contract)} className="btn-icon-only text-amber-500 hover:bg-amber-50"><Coffee size={14} /></button>
                              <button onClick={() => handleToggleStatus(contract)} className="btn-icon-only">{contract.isActive ? <PauseCircle size={14} /> : <Play size={14} />}</button>
                            </>
                          )}
                          <button onClick={() => handleDelete(contract.id)} className="btn-icon-only text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {showPauseModal && (
        <div className="modal-overlay">
          <div className="modal-content !max-w-sm">
            <div className="modal-header">
              <h2 className="text-sm font-bold text-slate-900">Pause eintragen</h2>
              <button onClick={() => setShowPauseModal(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={handleSavePause}>
              <div className="modal-body space-y-4 !p-5 text-left">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="label-caps">Von</label><input type="date" required className="input-standard" value={pauseData.startDate} onChange={e => setPauseData({...pauseData, startDate: e.target.value})} /></div>
                    <div className="space-y-1"><label className="label-caps">Bis</label><input type="date" required className="input-standard" value={pauseData.endDate} onChange={e => setPauseData({...pauseData, endDate: e.target.value})} /></div>
                </div>
                <div className="space-y-1"><label className="label-caps">Grund</label><input type="text" className="input-standard" value={pauseData.reason} onChange={e => setPauseData({...pauseData, reason: e.target.value})} /></div>
              </div>
              <div className="modal-footer !py-4"><button type="submit" className="btn-primary w-full !bg-amber-600">Bestätigen</button></div>
            </form>
          </div>
        </div>
      )}

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