import {
  Calendar, CheckCircle2, Clock, FileCheck, FilePlus, FileText,
  History, Info, ListTodo, Loader2, Plus, Repeat, TrendingUp, User, X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ViewSwitcher from '../../components/ViewSwitcher';
import api from '../../lib/api';

// --- TYPEN DEFINITIONEN ---
interface Customer { 
    id: string; 
    companyName: string | null; 
    lastName: string; 
    firstName: string;
}

interface Service { 
    id: string; 
    name: string; 
    priceNet: number; 
    unit: string; 
}

interface OfferItem {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
}

interface Offer {
  id: string;
  offerNumber: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  totalNet: number;
  customer: Customer;
  items: OfferItem[];
  validUntil: string;
  interval: string;       
  preferredTime?: string; 
  createdAt: string;
  checklist: string[]; 
  convertedContractId?: string | null; // Wichtig für die Prüfung
}

export default function OffersPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  const [showConvertModal, setShowConvertModal] = useState<Offer | null>(null);

  const [convertData, setConvertData] = useState({
      serviceId: '',
      startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { loadData(); }, []);

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
      await api.post(`/offers/${showConvertModal.id}/convert`, {
        startDate: new Date(convertData.startDate),
        serviceId: convertData.serviceId
      });
      
      toast.success("Vertrag erfolgreich aktiviert!", { id: toastId });
      setShowConvertModal(null);
      loadData(); 
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
      if (isConverted) return <span className="status-badge bg-slate-100 text-slate-500 border-slate-200"><CheckCircle2 size={10} /> Umgewandelt</span>;
      
      switch(status) {
          case 'ACCEPTED': return <span className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100"><CheckCircle2 size={10} /> Akzeptiert</span>;
          case 'SENT': return <span className="status-badge bg-blue-50 text-blue-600 border-blue-100"><FileText size={10} /> Versendet</span>;
          case 'REJECTED': return <span className="status-badge bg-red-50 text-red-600 border-red-100"><X size={10} /> Abgelehnt</span>;
          default: return <span className="status-badge bg-slate-50 text-slate-500 border-slate-200">Entwurf</span>;
      }
  };

  return (
    <div className="page-container">
      
      <div className="header-section">
        <div>
          <h1 className="page-title">Angebotswesen</h1>
          <p className="page-subtitle">Verwalten Sie Ihre Akquise und Auftragsumwandlung.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
            <button onClick={() => navigate('/dashboard/offers/new')} className="btn-primary">
                <Plus size={16} /> <span>Neues Angebot</span>
            </button>
        </div>
      </div>

      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-info"><TrendingUp size={18} /></div>
          <div>
            <span className="label-caps">Pipeline Volumen</span>
            <div className="text-lg font-bold text-slate-900 leading-none">
                {formatEuro(offers.reduce((acc, o) => acc + Number(o.totalNet), 0))}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-50 text-amber-600"><History size={18} /></div>
          <div>
            <span className="label-caps">Offene Angebote</span>
            <div className="text-lg font-bold text-slate-900 leading-none">
                {offers.filter(o => o.status === 'SENT' && !o.convertedContractId).length} <span className="text-[10px] text-slate-400 font-normal">Belege</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lade Angebote...</span>
        </div>
      ) : offers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 m-4 py-20">
            <FilePlus className="text-slate-200 mx-auto mb-3" size={40} />
            <p className="text-slate-500 font-bold text-sm">Keine Angebote vorhanden.</p>
        </div>
      ) : viewMode === 'GRID' ? (
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300 pb-safe">
          {offers.map(offer => {
            const isConverted = !!offer.convertedContractId;
            
            return (
              <div key={offer.id} className={`employee-card group h-full flex flex-col ${isConverted ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                <div className={`absolute top-0 left-0 w-full h-1 ${isConverted ? 'bg-slate-300' : offer.status === 'ACCEPTED' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>

                <div className="flex justify-between items-start mb-4 pt-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">{getStatusBadge(offer.status, isConverted)}</div>
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight">#{offer.offerNumber}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{formatEuro(offer.totalNet)}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Netto</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold bg-slate-50 p-2 rounded border border-slate-100">
                      <User size={12} className="text-blue-500" />
                      <span className="truncate">{offer.customer?.companyName || `${offer.customer?.firstName} ${offer.customer?.lastName}`}</span>
                  </div>
                  <div className="px-1">
                    <p className="text-[11px] text-slate-500 italic line-clamp-2 leading-relaxed">"{offer.items?.[0]?.description}"</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="status-badge bg-white text-slate-600 border-slate-200">
                          <Repeat size={10}/> {translateInterval(offer.interval)}
                      </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-50 mt-auto">
                  {isConverted ? (
                    <div className="w-full text-center py-2 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200">
                       Vertrag bereits erstellt
                    </div>
                  ) : (offer.status === 'SENT' || offer.status === 'ACCEPTED') ? (
                    <button 
                      onClick={() => setShowConvertModal(offer)} 
                      className={`btn-primary w-full !py-2 ${offer.status === 'ACCEPTED' ? '!bg-emerald-600 !border-emerald-700 animate-pulse' : '!bg-blue-600'}`}
                    >
                      <FileCheck size={14} /> 
                      <span className="text-[10px] uppercase font-bold tracking-wider">
                          {offer.status === 'ACCEPTED' ? 'Kunden-Annahme bestätigen' : 'In Auftrag umwandeln'}
                      </span>
                    </button>
                  ) : (
                    <div className="w-full text-center py-2 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
                      Abgeschlossen
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-container animate-in slide-in-from-bottom-2 duration-300 pb-safe">
            <div className="flex-1 custom-scrollbar overflow-y-auto">
                <table className="table-main">
                    <thead className="table-head sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-left">Nr. & Datum</th>
                            <th className="px-4 py-3 text-left">Kunde</th>
                            <th className="px-4 py-3 text-left">Leistung</th>
                            <th className="px-4 py-3 text-left">Zyklus</th>
                            <th className="px-4 py-3 text-right">Summe (Netto)</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right pr-4">Aktion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offers.map(offer => {
                            const isConverted = !!offer.convertedContractId;
                            return (
                                <tr key={offer.id} className={`table-row group ${isConverted ? 'bg-slate-50/50 opacity-60' : ''}`}>
                                    <td className="table-cell pl-4 align-middle">
                                        <div className="font-bold text-slate-900 text-sm">#{offer.offerNumber}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">{new Date(offer.createdAt).toLocaleDateString('de-DE')}</div>
                                    </td>
                                    <td className="table-cell align-middle">
                                        <div className="font-bold text-slate-700">{offer.customer?.companyName || offer.customer?.lastName}</div>
                                    </td>
                                    <td className="table-cell align-middle">
                                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{offer.items?.[0]?.description}</div>
                                    </td>
                                    <td className="table-cell align-middle">
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-tight">
                                            {translateInterval(offer.interval)}
                                        </span>
                                    </td>
                                    <td className="table-cell text-right font-mono font-bold text-slate-900 align-middle">{formatEuro(offer.totalNet)}</td>
                                    <td className="table-cell text-center align-middle">
                                        {getStatusBadge(offer.status, isConverted)}
                                    </td>
                                    <td className="table-cell text-right pr-4 align-middle">
                                        {!isConverted && (offer.status === 'SENT' || offer.status === 'ACCEPTED') && (
                                            <button onClick={() => setShowConvertModal(offer)} className={`btn-icon-only ${offer.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                                <FileCheck size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {showConvertModal && (
        <div className="modal-overlay">
          <div className="modal-content !max-w-3xl animate-in zoom-in-95 duration-200">
            <div className={`modal-header !text-white !border-none ${showConvertModal.status === 'ACCEPTED' ? '!bg-emerald-600' : '!bg-blue-600'}`}>
              <div className="flex items-center gap-3">
                <FileCheck size={18} />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-white">Auftrag finalisieren</h2>
              </div>
              <button onClick={() => setShowConvertModal(null)} className="text-white/40 hover:text-white"><X size={18}/></button>
            </div>

            <form onSubmit={handleConvert} className="flex flex-col md:flex-row">
              
              <div className="flex-1 p-6 bg-slate-50 border-r border-slate-200 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                        <Info size={12}/> Angebots-Zusammenfassung
                    </h3>
                    <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Leistung</label>
                            <div className="text-xs font-bold text-slate-800 leading-tight">{showConvertModal.items?.[0]?.description}</div>
                            <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold">
                                <span className="text-slate-500">{showConvertModal.items?.[0]?.quantity}x {showConvertModal.items?.[0]?.unit}</span>
                                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{formatEuro(showConvertModal.totalNet)} Netto</span>
                            </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Zyklus & Zeitwunsch</label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                    <Repeat size={12} className="text-slate-400"/> {translateInterval(showConvertModal.interval)}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                    <Clock size={12} className="text-slate-400"/> {showConvertModal.preferredTime || 'Vormittags (Std.)'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                        <ListTodo size={12}/> Operative Aufgaben
                    </h3>
                    {showConvertModal.checklist && showConvertModal.checklist.length > 0 ? (
                        <div className="space-y-1.5">
                            {showConvertModal.checklist.map((task, i) => (
                                <div key={i} className="text-[10px] font-medium text-slate-600 bg-white p-2 rounded border border-slate-100 flex gap-2">
                                    <span className="text-blue-500 font-black shrink-0">#{(i+1)}</span> {task}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-[10px] text-slate-400 italic p-4 bg-slate-100 rounded-xl text-center border border-dashed border-slate-200">
                            Keine spezifischen Aufgaben in der Checkliste definiert.
                        </div>
                    )}
                </div>
              </div>

              <div className="flex-1 p-6 space-y-6 bg-white">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3">
                    <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                    <div>
                        <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-tight">Kunde hat bestätigt</p>
                        <p className="text-[10px] text-emerald-700 leading-tight mt-0.5">
                            {showConvertModal.customer.companyName || showConvertModal.customer.lastName} hat dieses Angebot akzeptiert.
                        </p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="label-caps !text-slate-500">Stamm-Service zuweisen</label>
                        <select 
                            className={`input-standard font-bold ${convertData.serviceId ? 'border-emerald-500 bg-emerald-50/20' : ''}`}
                            value={convertData.serviceId} 
                            onChange={e => setConvertData({...convertData, serviceId: e.target.value})} 
                            required
                        >
                            <option value="">-- Leistung wählen --</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.name} ({formatEuro(s.priceNet)})</option>)}
                        </select>
                        <p className="text-[9px] text-slate-400 italic">Bestimmt die Buchhaltungsgruppe und Steuersätze.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="label-caps !text-slate-500">Erster Einsatztermin</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="date" 
                                className="input-standard pl-9 font-bold" 
                                value={convertData.startDate} 
                                onChange={e => setConvertData({...convertData, startDate: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex flex-col gap-2">
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !convertData.serviceId} 
                        className={`btn-primary w-full !py-3 shadow-xl ${showConvertModal.status === 'ACCEPTED' ? '!bg-emerald-600' : '!bg-blue-600'}`}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <FileCheck size={18}/>}
                        <span className="uppercase tracking-widest font-black text-[10px]">Vertrag & Jobs jetzt aktivieren</span>
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setShowConvertModal(null)} 
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest py-2 transition-colors"
                    >
                        Abbrechen
                    </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}