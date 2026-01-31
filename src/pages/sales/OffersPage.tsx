import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FilePlus, CheckCircle2, FileText, X, Plus, Calendar,
  Loader2, TrendingUp, FileCheck, User, History, Euro, Clock,
  Repeat, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import ViewSwitcher from '../../components/ViewSwitcher';

// --- TYPEN ---
interface Customer { 
    id: string; 
    companyName: string | null; 
    lastName: string; 
    firstName: string;
}
interface Service { id: string; name: string; priceNet: number; unit: string; }
interface Offer {
  id: string;
  offerNumber: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  totalNet: number;
  customer: Customer;
  items: { description: string }[];
  validUntil: string;
  interval: string;       
  preferredTime?: string; 
  createdAt: string;
}

export default function OffersPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Nur noch das Umwandlungs-Modal bleibt hier, da es eine Schnellaktion ist
  const [showConvertModal, setShowConvertModal] = useState<Offer | null>(null);

  // State für Umwandlung
  const [convertData, setConvertData] = useState({
      serviceId: '',
      startDate: new Date().toISOString().split('T')[0],
      sendLink: false 
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [resOff, resServ] = await Promise.all([
        api.get('/offers'),
        api.get('/services')
      ]);
      setOffers(resOff.data.sort((a: Offer, b: Offer) => (b.offerNumber || '').localeCompare(a.offerNumber || '')));
      setServices(resServ.data);
    } catch (error) {
      toast.error("Daten konnten nicht geladen werden");
    } finally { setLoading(false); }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConvertModal || !convertData.serviceId) return toast.error("Bitte Service wählen");
    
    setIsSubmitting(true);
    const toastId = toast.loading(convertData.sendLink ? "Sende Signatur-Link..." : "Aktiviere Vertrag...");

    try {
      await api.post(`/offers/${showConvertModal.id}/convert`, {
        startDate: new Date(convertData.startDate),
        serviceId: convertData.serviceId,
        sendLink: convertData.sendLink 
      });
      toast.success(convertData.sendLink ? "Link versendet!" : "Vertrag aktiv!", { id: toastId });
      setShowConvertModal(null);
      loadData();
    } catch (err: any) { 
        toast.error(err.response?.data?.message || "Fehler", { id: toastId }); 
    } 
    finally { setIsSubmitting(false); }
  };

  const formatEuro = (val: number) => Number(val).toLocaleString('de-DE', {style:'currency', currency:'EUR'});
  const totalVolume = offers.reduce((acc, o) => acc + Number(o.totalNet), 0);
  const openCount = offers.filter(o => o.status === 'SENT').length;

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'ACCEPTED': return <span className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100"><CheckCircle2 size={10} /> Akzeptiert</span>;
          case 'SENT': return <span className="status-badge bg-blue-50 text-blue-600 border-blue-100"><FileText size={10} /> Versendet</span>;
          case 'REJECTED': return <span className="status-badge bg-red-50 text-red-600 border-red-100"><X size={10} /> Abgelehnt</span>;
          default: return <span className="status-badge bg-slate-50 text-slate-500 border-slate-200">Entwurf</span>;
      }
  };

  const translateInterval = (int: string) => {
      const map: Record<string, string> = { 'ONCE': 'Einmalig', 'WEEKLY': 'Wöchentlich', 'BIWEEKLY': '14-tägig', 'MONTHLY': 'Monatlich' };
      return map[int] || int;
  }

  return (
    <div className="page-container">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        <div>
          <h1 className="page-title">Angebotswesen</h1>
          <p className="page-subtitle">Verwalten Sie Ihre Akquise und Auftragsumwandlung.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
            </div>
            {/* NAVIGATION ZUR NEUEN SEITE */}
            <button onClick={() => navigate('/dashboard/offers/new')} className="btn-primary">
                <Plus size={16} /> <span>Neues Angebot</span>
            </button>
        </div>
      </div>

      {/* --- KPI STATS --- */}
      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-info"><TrendingUp size={18} /></div>
          <div>
            <span className="label-caps">Pipeline Volumen</span>
            <div className="text-lg font-bold text-slate-900 leading-none">{formatEuro(totalVolume)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-50 text-amber-600"><History size={18} /></div>
          <div>
            <span className="label-caps">In Prüfung</span>
            <div className="text-lg font-bold text-slate-900 leading-none">{openCount} <span className="text-[10px] text-slate-400 font-normal">Belege</span></div>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
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
          {offers.map(offer => (
            <div key={offer.id} className="employee-card group h-full">
              <div className={`absolute top-0 left-0 w-full h-1 ${offer.status === 'ACCEPTED' ? 'bg-emerald-500' : offer.status === 'SENT' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>

              <div className="flex justify-between items-start mb-4 pt-1">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(offer.status)}
                  </div>
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
                    <span className="truncate">
                      {offer.customer?.companyName || `${offer.customer?.firstName} ${offer.customer?.lastName}`}
                    </span>
                </div>
                
                <div className="px-1">
                  <p className="text-[11px] text-slate-500 italic line-clamp-2 leading-relaxed">
                      "{offer.items?.[0]?.description}"
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="status-badge bg-white text-slate-600 border-slate-200">
                        <Repeat size={10}/> {translateInterval(offer.interval)}
                    </span>
                    {offer.preferredTime && (
                        <span className="status-badge bg-white text-slate-400 border-slate-200">
                            <Clock size={10}/> {offer.preferredTime}
                        </span>
                    )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 mt-auto">
                {offer.status === 'SENT' ? (
                  <button onClick={() => setShowConvertModal(offer)} className="btn-primary w-full !py-2 !bg-emerald-600 !border-emerald-700">
                    <FileCheck size={14} /> 
                    <span className="text-[10px] uppercase font-bold tracking-wider">In Auftrag umwandeln</span>
                  </button>
                ) : (
                  <div className="w-full text-center py-2 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
                    Abgeschlossen
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* --- TABLE VIEW --- */
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
                        {offers.map(offer => (
                            <tr key={offer.id} className="table-row group">
                                <td className="table-cell pl-4 align-middle">
                                    <div className="font-bold text-slate-900 text-sm">#{offer.offerNumber}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">{new Date(offer.createdAt).toLocaleDateString('de-DE')}</div>
                                </td>
                                <td className="table-cell align-middle">
                                    <div className="font-bold text-slate-700">{offer.customer?.companyName || offer.customer?.lastName}</div>
                                </td>
                                <td className="table-cell align-middle">
                                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={offer.items?.[0]?.description}>{offer.items?.[0]?.description}</div>
                                </td>
                                <td className="table-cell align-middle">
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-tight">
                                        {translateInterval(offer.interval)}
                                    </span>
                                </td>
                                <td className="table-cell text-right font-mono font-bold text-slate-900 align-middle">
                                    {formatEuro(offer.totalNet)}
                                </td>
                                <td className="table-cell text-center align-middle">
                                    {getStatusBadge(offer.status)}
                                </td>
                                <td className="table-cell text-right pr-4 align-middle">
                                    {offer.status === 'SENT' && (
                                        <button onClick={() => setShowConvertModal(offer)} className="btn-icon-only text-emerald-600 hover:bg-emerald-50" title="Aktivieren">
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

      {/* --- CONVERT MODAL (BLEIBT HIER FÜR SCHNELLAKTION) --- */}
      {showConvertModal && (
        <div className="modal-overlay">
          <div className="modal-content !max-w-md animate-in zoom-in-95 duration-200">
            <div className="modal-header !bg-emerald-600 !text-white !border-none">
              <div className="flex items-center gap-3"><FileCheck size={18} /><h2 className="text-[11px] font-black uppercase tracking-widest">Auftrag aktivieren</h2></div>
              <button onClick={() => setShowConvertModal(null)} className="text-white/40 hover:text-white"><X size={18}/></button>
            </div>

            <form onSubmit={handleConvert}>
              <div className="modal-body space-y-4 !p-6">
                <div className="bg-emerald-50 p-3 rounded-lg text-[11px] text-emerald-800 border border-emerald-100 flex gap-3">
                    <CheckCircle2 size={24} className="shrink-0 text-emerald-600"/>
                    <div>
                        Angebot <strong>#{showConvertModal.offerNumber}</strong> wird in einen aktiven Vertrag umgewandelt.
                        <div className="mt-1 opacity-70 font-bold uppercase tracking-tighter">Turnus: {translateInterval(showConvertModal.interval)}</div>
                    </div>
                </div>

                <div className="space-y-1">
                  <label className="label-caps">Service-Kategorie zuweisen</label>
                  <select className="input-standard font-bold" value={convertData.serviceId} onChange={e => setConvertData({...convertData, serviceId: e.target.value})} required>
                    <option value="">-- Typ wählen --</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="label-caps">Erster Ausführungstermin</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="date" className="input-standard pl-8 font-bold" value={convertData.startDate} onChange={e => setConvertData({...convertData, startDate: e.target.value})} required />
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${convertData.sendLink ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`} onClick={() => setConvertData({...convertData, sendLink: !convertData.sendLink})}>
                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${convertData.sendLink ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                        {convertData.sendLink && <CheckCircle2 size={12} />}
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Kunde digital unterschreiben lassen</p>
                        <p className="text-[10px] text-slate-500 font-medium">Sendet Signatur-Link an {showConvertModal.customer?.firstName} {showConvertModal.customer?.lastName}.</p>
                    </div>
                </div>
              </div>

              <div className="modal-footer !py-4">
                <button type="button" onClick={() => setShowConvertModal(null)} className="btn-secondary">Abbrechen</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary !bg-emerald-600 !border-emerald-700">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle2 size={16}/>} Auftrag starten
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}