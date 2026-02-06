import {
  Calendar, CheckCircle2,
  FileCheck,
  History,
  Loader2, Plus, Repeat, TrendingUp, User, X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ViewSwitcher from '../../components/ViewSwitcher';
import api from '../../lib/api';

// --- TYPEN ---
interface Offer {
  id: string;
  offerNumber: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  totalNet: number;
  customer: { 
    companyName: string | null; 
    lastName: string; 
    firstName: string;
  };
  items: { description: string }[];
  interval: string;       
  createdAt: string;
  convertedContractId?: string | null;
}

interface Service {
  id: string;
  name: string;
  priceNet: number;
}

export default function OffersPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Modal State
  const [showConvertModal, setShowConvertModal] = useState<Offer | null>(null);
  const [convertData, setConvertData] = useState({
      serviceId: '',
      startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { loadData(); }, []);

  // Automatisches Matching: Wenn Modal öffnet, versuche Service anhand des Textes zu finden
  useEffect(() => {
    if (showConvertModal) {
      const offerText = showConvertModal.items?.[0]?.description || '';
      const match = services.find(s => 
        offerText.toLowerCase().includes(s.name.toLowerCase()) || 
        s.name.toLowerCase().includes(offerText.toLowerCase())
      );

      setConvertData({
        serviceId: match?.id || '',
        startDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [showConvertModal, services]);

  const loadData = async () => {
    try {
      const [resOff, resServ] = await Promise.all([
        api.get('/offers'),
        api.get('/services')
      ]);
      // Sortieren: Neueste zuerst
      setOffers(resOff.data.sort((a: Offer, b: Offer) => b.offerNumber.localeCompare(a.offerNumber)));
      setServices(resServ.data);
    } catch (error) {
      toast.error("Daten konnten nicht geladen werden");
    } finally { setLoading(false); }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConvertModal || !convertData.serviceId || isSubmitting) return;
    
    setIsSubmitting(true);
    const toastId = toast.loading("Vertrag wird aktiviert...");

    try {
      // Backend Route: POST /api/offers/:id/convert
      await api.post(`/offers/${showConvertModal.id}/convert`, {
        startDate: new Date(convertData.startDate),
        serviceId: convertData.serviceId
      });
      
      toast.success("Vertrag erfolgreich aktiviert!", { id: toastId });
      setShowConvertModal(null);
      loadData(); // Liste neu laden, damit Status aktualisiert wird
    } catch (err: any) { 
        toast.error(err.response?.data?.message || "Fehler bei der Umwandlung", { id: toastId }); 
    } finally { 
        setIsSubmitting(false); 
    }
  };

  const formatEuro = (val: number) => Number(val).toLocaleString('de-DE', {style:'currency', currency:'EUR'});
  
  const translateInterval = (int: string) => {
      const map: Record<string, string> = { 'ONCE': 'Einmalig', 'WEEKLY': 'Wöchentlich', 'BIWEEKLY': '14-tägig', 'MONTHLY': 'Monatlich' };
      return map[int] || int;
  }

  const getStatusBadge = (status: string, isConverted: boolean) => {
      if (isConverted) return <span className="status-badge bg-emerald-100 text-emerald-700 border-emerald-200">Vertrag Aktiv</span>;
      
      switch(status) {
          case 'ACCEPTED': return <span className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100">Akzeptiert</span>;
          case 'SENT': return <span className="status-badge bg-blue-50 text-blue-600 border-blue-100">Versendet</span>;
          case 'REJECTED': return <span className="status-badge bg-red-50 text-red-600 border-red-100">Abgelehnt</span>;
          default: return <span className="status-badge bg-slate-50 text-slate-500 border-slate-200">Entwurf</span>;
      }
  };

  return (
    <div className="page-container pb-safe">
      
      <div className="header-section flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div>
          <h1 className="page-title">Angebotswesen</h1>
          <p className="page-subtitle">Verwalten Sie Ihre Akquise und Auftragsumwandlung.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="view-switcher-container w-full sm:w-auto">
                <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
            </div>
            <button onClick={() => navigate('/dashboard/offers/new')} className="btn-primary w-full sm:w-auto uppercase tracking-wider">
                <Plus size={16} /> <span>Neues Angebot</span>
            </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-info"><TrendingUp size={16} /></div>
          <div>
            <span className="label-caps !ml-0 !mb-0">Volumen</span>
            <div className="text-base font-bold text-slate-900 leading-tight">
                {formatEuro(offers.reduce((acc, o) => acc + Number(o.totalNet), 0))}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-50 text-amber-600 border-amber-100"><History size={16} /></div>
          <div>
            <span className="label-caps !ml-0 !mb-0">Offen</span>
            <div className="text-base font-bold text-slate-900 leading-tight">
                {offers.filter(o => o.status === 'SENT' && !o.convertedContractId).length} <span className="text-[10px] text-slate-400 font-medium">Belege</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <span className="label-caps">Angebote werden geladen...</span>
        </div>
      ) : (
        <>
            {viewMode === 'GRID' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 animate-in fade-in duration-500 pb-20 sm:pb-0">
                {offers.map(offer => {
                    const isConverted = !!offer.convertedContractId;
                    return (
                    <div key={offer.id} className={`offer-card group ${isConverted ? 'opacity-75' : ''}`}>
                        <div className={`absolute top-0 left-0 w-full h-1 ${isConverted ? 'bg-emerald-500' : offer.status === 'ACCEPTED' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                        <div className="flex justify-between items-start mb-4">
                        <div className="min-w-0">
                            <div className="mb-1">{getStatusBadge(offer.status, isConverted)}</div>
                            <h3 className="font-bold text-slate-900 text-[13px] leading-tight">#{offer.offerNumber}</h3>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="text-[13px] font-black text-slate-900">{formatEuro(offer.totalNet)}</div>
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Netto</div>
                        </div>
                        </div>
                        
                        <div className="space-y-2 mb-4 flex-1">
                            <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                                <User size={12} className="text-blue-500 shrink-0" />
                                <span className="truncate">{offer.customer?.companyName || `${offer.customer?.firstName} ${offer.customer?.lastName}`}</span>
                            </div>
                            <div className="px-1 min-h-[32px]">
                                <p className="text-[10px] text-slate-500 italic line-clamp-2 leading-tight">"{offer.items?.[0]?.description}"</p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-50 mt-auto">
                        {!isConverted && (offer.status === 'SENT' || offer.status === 'ACCEPTED') ? (
                            <button 
                            onClick={() => setShowConvertModal(offer)} 
                            className={`btn-primary w-full !py-2 !text-[9px] uppercase font-black tracking-widest ${offer.status === 'ACCEPTED' ? '!bg-emerald-600 !border-emerald-700 animate-pulse' : '!bg-blue-600'}`}
                            >
                            <FileCheck size={14} /> Finalisieren
                            </button>
                        ) : (
                            <div className="w-full text-center py-1.5 bg-slate-50 rounded-md text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                                {isConverted ? <span className="flex items-center justify-center gap-1 text-emerald-600"><CheckCircle2 size={12}/> Erledigt</span> : 'Entwurf / Geschlossen'}
                            </div>
                        )}
                        </div>
                    </div>
                    );
                })}
                </div>
            ) : (
                <div className="table-container animate-in slide-in-from-bottom-2 duration-300 pb-20 sm:pb-0">
                    <div className="overflow-x-auto">
                        <table className="table-main w-full min-w-[900px]">
                            <thead className="table-head">
                                <tr>
                                    <th className="table-cell">Beleg & Datum</th>
                                    <th className="table-cell">Kunde</th>
                                    <th className="table-cell text-right">Summe (Netto)</th>
                                    <th className="table-cell text-center">Status</th>
                                    <th className="table-cell text-right pr-4">Aktion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offers.map(offer => (
                                    <tr key={offer.id} className="table-row group">
                                        <td className="table-cell align-middle">
                                            <div className="font-bold text-slate-900 text-[12px]">#{offer.offerNumber}</div>
                                            <div className="text-[9px] text-slate-400 font-bold">{new Date(offer.createdAt).toLocaleDateString('de-DE')}</div>
                                        </td>
                                        <td className="table-cell align-middle">
                                            <div className="font-bold text-slate-700 text-[12px]">{offer.customer?.companyName || `${offer.customer?.firstName} ${offer.customer?.lastName}`}</div>
                                        </td>
                                        <td className="table-cell text-right font-mono font-bold text-slate-900 align-middle">{formatEuro(offer.totalNet)}</td>
                                        <td className="table-cell text-center align-middle">
                                            {getStatusBadge(offer.status, !!offer.convertedContractId)}
                                        </td>
                                        <td className="table-cell text-right pr-4 align-middle">
                                            {!offer.convertedContractId && (offer.status === 'SENT' || offer.status === 'ACCEPTED') && (
                                                <button onClick={() => setShowConvertModal(offer)} className="btn-icon-only ml-auto text-blue-600 hover:bg-blue-50" title="In Vertrag umwandeln">
                                                    <FileCheck size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
      )}

      {/* --- CONVERT MODAL --- */}
      {showConvertModal && (
        <div className="modal-overlay !p-0 sm:!p-4 z-[100]">
          <div className="modal-content !max-w-xl !h-[100dvh] sm:!h-auto sm:max-h-[90vh] flex flex-col shadow-2xl border-none">
            
            <div className={`shrink-0 px-4 py-4 flex justify-between items-center text-white ${showConvertModal.status === 'ACCEPTED' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              <div className="flex items-center gap-2">
                <FileCheck size={20} />
                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-widest leading-none">Vertrag aktivieren</h2>
                  <p className="text-[9px] text-white/70 font-bold mt-1 uppercase tracking-tighter">Angebot #{showConvertModal.offerNumber}</p>
                </div>
              </div>
              <button onClick={() => setShowConvertModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
              <div className="p-4 space-y-5">
                
                {/* Info Block */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black border border-slate-200">
                      {showConvertModal.customer.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Auftraggeber</p>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {showConvertModal.customer.companyName || `${showConvertModal.customer.firstName} ${showConvertModal.customer.lastName}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <h3 className="label-caps !ml-1">Details aus Angebot</h3>
                  <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    <div className="p-3">
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Leistungstext</label>
                      <p className="text-xs font-bold text-slate-700 leading-tight">{showConvertModal.items?.[0]?.description}</p>
                    </div>
                    <div className="p-3 grid grid-cols-2 bg-slate-50/30">
                      <div className="border-r border-slate-100">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Turnus</label>
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-600 uppercase tracking-tighter">
                          <Repeat size={12}/> {translateInterval(showConvertModal.interval)}
                        </div>
                      </div>
                      <div className="pl-3">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Summe Netto</label>
                        <div className="text-[11px] font-black text-emerald-600">{formatEuro(showConvertModal.totalNet)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Einstellungen */}
                <div className="space-y-3 pt-2">
                  <h3 className="label-caps !ml-1 !text-blue-600">Vertragseinstellungen</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="label-caps !text-slate-500 !ml-0">Katalog-Leistung zuweisen *</label>
                      <select 
                        className="input-standard font-bold !text-[12px] !py-3 bg-white shadow-sm"
                        value={convertData.serviceId} 
                        onChange={e => setConvertData({...convertData, serviceId: e.target.value})} 
                        required
                      >
                        <option value="">-- Bitte wählen --</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({formatEuro(s.priceNet)})
                          </option>
                        ))}
                      </select>
                      <p className="text-[9px] text-slate-400 font-medium italic">Verknüpft Checklisten und Kategorien für die Auswertung.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="label-caps !text-slate-500 !ml-0">Startdatum (Erster Termin) *</label>
                      <div className="relative group">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" />
                        <input 
                          type="date" 
                          className="input-standard pl-10 font-bold !text-[12px] !py-3 bg-white shadow-sm" 
                          value={convertData.startDate} 
                          onChange={e => setConvertData({...convertData, startDate: e.target.value})} 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 p-4 bg-white border-t border-slate-100 flex flex-col gap-3 pb-safe-offset-4">
              <button 
                type="submit" 
                onClick={handleConvert}
                disabled={isSubmitting || !convertData.serviceId} 
                className={`btn-primary w-full !py-4 shadow-xl uppercase tracking-widest font-black text-[11px] ${showConvertModal.status === 'ACCEPTED' ? '!bg-emerald-600 shadow-emerald-500/20' : '!bg-blue-600 shadow-blue-500/20'}`}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18}/>
                ) : (
                  <><FileCheck size={18}/> Vertrag & Jobs aktivieren</>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => setShowConvertModal(null)} 
                className="w-full text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest py-2 transition-all"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}