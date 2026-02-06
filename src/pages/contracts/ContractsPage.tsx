import {
  CalendarClock,
  Coffee,
  FileText,
  Loader2,
  Mail,
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
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';
import SignatureModal from '../../components/SignatureModal';
import ViewSwitcher from '../../components/ViewSwitcher';
import api from '../../lib/api';
import type { Contract } from '../../types';

export default function ContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  
  const [showPauseModal, setShowPauseModal] = useState<Contract | null>(null);
  const [pauseData, setPauseData] = useState({ startDate: '', endDate: '', reason: '' });
  const [signContractData, setSignContractData] = useState<{id: string, name: string} | null>(null);
  const [deleteContractId, setDeleteContractId] = useState<string | null>(null);
  const [sendingLink, setSendingLink] = useState<string | null>(null);

  useEffect(() => { fetchContracts(); }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await api.get<Contract[]>('/contracts');
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

  const confirmDelete = async () => {
    if (!deleteContractId) return;
    const toastId = toast.loading('Lösche Vertrag...');
    try {
      await api.delete(`/contracts/${deleteContractId}`);
      setContracts(prev => prev.filter(c => c.id !== deleteContractId));
      toast.success("Vertrag gelöscht", { id: toastId });
    } catch (e) {
      toast.error("Löschen nicht möglich.", { id: toastId });
    } finally {
      setDeleteContractId(null);
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

  const handleSendSigningLink = async (contract: Contract) => {
      setSendingLink(contract.id);
      const toastId = toast.loading('Sende Link an Kunden...');
      try {
          await api.post(`/contracts/${contract.id}/send-link`);
          toast.success('Signatur-Link erfolgreich versendet!', { id: toastId });
      } catch (error) {
          toast.error('Konnte Link nicht senden. Hat der Kunde eine E-Mail?', { id: toastId });
      } finally {
          setSendingLink(null);
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
    <div className="page-container pb-safe">
      
      {/* --- HEADER --- */}
      <div className="header-section flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div>
          <h1 className="page-title">Vertragsmanagement</h1>
          <p className="page-subtitle">Verwaltung wiederkehrender Zyklen und aktiver Dienstleistungsverträge.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
           <div className="view-switcher-container w-full sm:w-auto">
              <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              <div className="relative flex-1 sm:w-48 group">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Suchen..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-transparent border-none py-1.5 pl-8 pr-2 text-[12px] font-bold text-slate-700 focus:ring-0" 
                />
              </div>
           </div>

           <button onClick={() => navigate('/dashboard/contracts/new')} className="btn-primary w-full sm:w-auto uppercase tracking-wider">
             <Plus size={16} /> Hinzufügen
           </button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
          <span className="label-caps">Vertragsdaten werden synchronisiert...</span>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white m-2 py-20 animate-in fade-in">
           <FileText size={32} className="text-slate-200 mb-2" />
           <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest text-center">Keine Verträge gefunden</p>
        </div>
      ) : viewMode === 'GRID' ? (
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 animate-in fade-in duration-500 pb-20 sm:pb-0">
          {filteredContracts.map((contract) => (
            <div key={contract.id} className="customer-card group h-full">
              <div className={`absolute top-0 left-0 w-full h-1 ${contract.isActive ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0 transition-transform group-hover:scale-105 ${contract.isActive ? 'bg-blue-500' : 'bg-slate-300'}`}>
                    {contract.customer.firstName.charAt(0)}{contract.customer.lastName.charAt(0)}
                  </div>
                  <div className="text-left overflow-hidden min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-[13px] leading-tight truncate pr-1">
                          {getCustomerName(contract.customer)}
                      </h3>
                      {/* FIX: Hier fehlte evtl. das '<' bei span */}
                      {contract.isSigned ? (
                          <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1 py-0.5 rounded font-black uppercase tracking-tighter shrink-0">Signed</span>
                      ) : (
                          <span className="text-[8px] bg-amber-50 text-amber-600 border border-amber-100 px-1 py-0.5 rounded font-black uppercase tracking-tighter shrink-0">Pending</span>
                      )}
                    </div>
                    <span className={`status-badge mt-1 !text-[8px] ${contract.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        {contract.isActive ? 'AKTIV' : 'PAUSIERT'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setDeleteContractId(contract.id)} className="btn-icon-only hover:text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-[11px] text-blue-600 font-bold bg-blue-50 p-2 rounded-lg border border-blue-100/50">
                  <FileText size={12} className="shrink-0" /> <span className="truncate uppercase tracking-tight">{contract.service.name}</span>
                </div>
                
                <div className="flex flex-col gap-1 px-1">
                   <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <Repeat size={10} className="text-slate-300" /> {translateInterval(contract.interval)}
                   </div>
                   {contract.address && (
                      <div className="flex items-start gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter leading-tight mt-1">
                        <MapPin size={12} className="text-slate-300 shrink-0 mt-0.5" /> 
                        <span>{contract.address.street}, {contract.address.city}</span>
                      </div>
                   )}
                </div>

                <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CalendarClock size={14} className={contract.isActive ? 'text-blue-500' : 'text-slate-300'} />
                        <span className={`text-[11px] font-black ${contract.isActive ? 'text-slate-700' : 'text-slate-400'}`}>
                           {new Date(contract.nextExecutionDate).toLocaleDateString('de-DE')}
                        </span>
                    </div>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Plan-Termin</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-50 flex items-center justify-end gap-1.5 mt-auto">
                  {!contract.isSigned && (
                      <>
                        <button onClick={() => setSignContractData({ id: contract.id, name: getCustomerName(contract.customer) })} className="btn-secondary !py-1.5 !px-2.5 !text-[10px] font-black uppercase tracking-widest gap-1.5 text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100">
                            <PenTool size={12} /> Sign
                        </button>
                        <button onClick={() => handleSendSigningLink(contract)} disabled={sendingLink === contract.id} className="btn-secondary !py-1.5 !px-2.5 !text-[10px] font-black uppercase tracking-widest gap-1.5">
                            {sendingLink === contract.id ? <Loader2 size={12} className="animate-spin"/> : <Mail size={12} />} Link
                        </button>
                      </>
                  )}
                  {contract.interval !== 'ONCE' && (
                      <>
                        <button onClick={() => setShowPauseModal(contract)} className="btn-secondary !py-1.5 !px-2.5 !text-[10px] font-black uppercase tracking-widest gap-1.5">
                          <Coffee size={12} /> Pause
                        </button>
                        <button onClick={() => handleToggleStatus(contract)} className={`btn-secondary !py-1.5 !px-2.5 !text-[10px] font-black uppercase tracking-widest gap-1.5 ${contract.isActive ? 'hover:!bg-amber-50 hover:!text-amber-600' : 'hover:!bg-emerald-50 hover:!text-emerald-600'}`}>
                          {contract.isActive ? <PauseCircle size={12} /> : <Play size={12} />} {contract.isActive ? 'Stop' : 'Start'}
                        </button>
                      </>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* --- TABLE VIEW --- */
        <div className="table-container animate-in slide-in-from-bottom-2 duration-300 pb-20 sm:pb-0">
          <div className="overflow-x-auto">
            <table className="table-main w-full min-w-[900px]">
                <thead className="table-head">
                <tr>
                    <th className="table-cell">Vertragspartner</th>
                    <th className="table-cell">Leistung & Zyklus</th>
                    <th className="table-cell">Nächster Termin</th>
                    <th className="table-cell text-center">Status</th>
                    <th className="table-cell text-right pr-4">Aktionen</th>
                </tr>
                </thead>
                <tbody>
                {filteredContracts.map((contract) => (
                    <tr key={contract.id} className="table-row group">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white shadow-sm shrink-0 ${contract.isActive ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                {contract.customer.firstName.charAt(0)}{contract.customer.lastName.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-slate-800 text-[13px] leading-tight">{getCustomerName(contract.customer)}</div>
                                  {contract.isSigned && <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1 py-0.5 rounded font-black uppercase tracking-tighter">Signed</span>}
                                </div>
                                {contract.address && <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{contract.address.street}, {contract.address.city}</div>}
                            </div>
                        </div>
                      </td>
                      <td className="table-cell align-middle">
                        <div className="flex flex-col gap-0.5">
                            <div className="font-bold text-blue-600 text-[11px] uppercase tracking-tight flex items-center gap-1.5"><FileText size={12} className="text-blue-400"/> {contract.service.name}</div>
                            <span className="status-badge bg-slate-50 text-slate-500 border-slate-200 w-fit !text-[9px]"><Repeat size={10} className="text-slate-300"/> {translateInterval(contract.interval)}</span>
                        </div>
                      </td>
                      <td className="table-cell align-middle">
                        <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg border ${contract.isActive ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}><CalendarClock size={14} /></div>
                            <div className={`text-[12px] font-black ${contract.isActive ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{new Date(contract.nextExecutionDate).toLocaleDateString('de-DE')}</div>
                        </div>
                      </td>
                      <td className="table-cell text-center">
                         <span className={`status-badge !text-[9px] ${contract.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                            {contract.isActive ? 'AKTIV' : 'PAUSIERT'}
                         </span>
                      </td>
                      <td className="table-cell text-right pr-4 align-middle">
                        <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-all">
                          {!contract.isSigned && (
                              <>
                                <button onClick={() => setSignContractData({ id: contract.id, name: getCustomerName(contract.customer) })} className="btn-icon-only text-indigo-500 hover:bg-indigo-50" title="Signieren"><PenTool size={14} /></button>
                                <button onClick={() => handleSendSigningLink(contract)} disabled={sendingLink === contract.id} className="btn-icon-only text-blue-500 hover:bg-blue-50" title="Link senden">
                                    {sendingLink === contract.id ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                                </button>
                              </>
                          )}
                          {contract.interval !== 'ONCE' && (
                            <>
                              <button onClick={() => setShowPauseModal(contract)} className="btn-icon-only text-amber-500 hover:bg-amber-50"><Coffee size={14} /></button>
                              <button onClick={() => handleToggleStatus(contract)} className="btn-icon-only text-slate-400">{contract.isActive ? <PauseCircle size={14} /> : <Play size={14} />}</button>
                            </>
                          )}
                          <button onClick={() => setDeleteContractId(contract.id)} className="btn-icon-only text-slate-300 hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
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
        <div className="modal-overlay !p-0 sm:!p-4 z-[100]">
          <div className="modal-content !max-w-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="modal-header shrink-0 !bg-slate-900 !text-white !border-none !py-4">
              <div className="flex items-center gap-2">
                <Coffee size={18} className="text-amber-400" />
                <h2 className="text-[11px] font-black uppercase tracking-widest">Einsatzpause planen</h2>
              </div>
              <button onClick={() => setShowPauseModal(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSavePause}>
              <div className="modal-body space-y-4 !p-6 text-left bg-white">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="label-caps !ml-0 text-blue-600">Startdatum</label>
                      <input type="date" required className="input-standard font-bold" value={pauseData.startDate} onChange={e => setPauseData({...pauseData, startDate: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label-caps !ml-0 text-blue-600">Enddatum</label>
                      <input type="date" required className="input-standard font-bold" value={pauseData.endDate} onChange={e => setPauseData({...pauseData, endDate: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-1.5">
                  <label className="label-caps !ml-0 text-slate-400">Begründung (Optional)</label>
                  <input type="text" className="input-standard font-medium" placeholder="z.B. Betriebsferien" value={pauseData.reason} onChange={e => setPauseData({...pauseData, reason: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer !p-4 !bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                <button type="submit" className="btn-primary w-full !py-3 !bg-slate-900 !border-slate-800 shadow-xl uppercase font-black tracking-widest text-[11px]">Pause aktivieren</button>
                <button type="button" onClick={() => setShowPauseModal(null)} className="w-full text-[10px] font-black text-slate-400 uppercase py-1">Abbrechen</button>
              </div>
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

      <ConfirmModal 
        isOpen={!!deleteContractId}
        title="Vertrag löschen?"
        message="Möchten Sie diesen Vertrag wirklich unwiderruflich entfernen? Alle zukünftigen Termine in der Tourenplanung werden sofort gestoppt."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteContractId(null)}
        variant="danger"
      />
    </div>
  );
}