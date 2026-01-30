import { useEffect, useState } from 'react';
import { 
  FilePlus, CheckCircle2, FileText, X, Plus, Calendar,
  Loader2, TrendingUp, FileCheck, User, History, Euro, MapPin, Clock,
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
    addresses?: { id: string; street: string; city: string; }[];
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
  const [offers, setOffers] = useState<Offer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState<Offer | null>(null);

  // State für neues Angebot
  const [newOffer, setNewOffer] = useState({
      customerId: '',
      addressId: '', 
      description: '', 
      price: '',
      quantity: '1',
      interval: 'WEEKLY', 
      preferredTime: '08:00' 
  });

  // State für Umwandlung
  const [convertData, setConvertData] = useState({
      serviceId: '',
      startDate: new Date().toISOString().split('T')[0],
      sendLink: false 
  });

  const [availableAddresses, setAvailableAddresses] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
      if (newOffer.customerId) {
          const cust = customers.find(c => c.id === newOffer.customerId);
          setAvailableAddresses(cust?.addresses || []);
          setNewOffer(prev => ({ ...prev, addressId: '' }));
      } else {
          setAvailableAddresses([]);
      }
  }, [newOffer.customerId, customers]);

  const loadData = async () => {
    try {
      const [resOff, resCust, resServ] = await Promise.all([
        api.get('/offers'),
        api.get('/customers'), 
        api.get('/services')
      ]);
      setOffers(resOff.data.sort((a: Offer, b: Offer) => (b.offerNumber || '').localeCompare(a.offerNumber || '')));
      setCustomers(resCust.data);
      setServices(resServ.data);
    } catch (error) {
      toast.error("Daten konnten nicht geladen werden");
    } finally { setLoading(false); }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.customerId || !newOffer.description) return toast.error("Bitte Pflichtfelder ausfüllen");
    
    setIsSubmitting(true);
    try {
      await api.post('/offers', {
        customerId: newOffer.customerId,
        addressId: newOffer.addressId || undefined,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 
        interval: newOffer.interval,
        preferredTime: newOffer.preferredTime,
        items: [{
          description: newOffer.description,
          quantity: parseFloat(newOffer.quantity),
          unit: 'Psch', 
          unitPrice: parseFloat(newOffer.price.replace(',', '.'))
        }]
      });
      toast.success("Angebot erstellt");
      setShowCreateModal(false);
      setNewOffer({ customerId: '', addressId: '', description: '', price: '', quantity: '1', interval: 'WEEKLY', preferredTime: '08:00' });
      loadData();
    } catch (err) { toast.error("Fehler beim Erstellen"); } 
    finally { setIsSubmitting(false); }
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
          case 'ACCEPTED': return <span className="status-badge bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm"><CheckCircle2 size={10} className="mr-1"/> Angenommen</span>;
          case 'SENT': return <span className="status-badge bg-blue-50 text-blue-700 border-blue-100 shadow-sm"><FileText size={10} className="mr-1"/> Versendet</span>;
          case 'REJECTED': return <span className="status-badge bg-red-50 text-red-700 border-red-100 shadow-sm"><X size={10} className="mr-1"/> Abgelehnt</span>;
          default: return <span className="status-badge bg-slate-50 text-slate-500 border-slate-200">Entwurf</span>;
      }
  };

  const translateInterval = (int: string) => {
      const map: Record<string, string> = { 'ONCE': 'Einmalig', 'WEEKLY': 'Wöchentlich', 'BIWEEKLY': '14-tägig', 'MONTHLY': 'Monatlich' };
      return map[int] || int;
  }

  return (
    <div className="page-container">
      
      {/* HEADER */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title">Angebote</h1>
          <p className="page-subtitle text-slate-500 font-medium tracking-tight">Verwalten Sie Ihre Akquise und Auftragsanbahnung.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
            <button onClick={() => setShowCreateModal(true)} className="btn-primary shadow-xl shadow-blue-500/20">
                <Plus size={18} /> <span>Neues Angebot</span>
            </button>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="stats-grid animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="stat-card border-l-4 border-l-blue-500">
          <div className="stat-icon-wrapper icon-info shadow-sm"><TrendingUp size={22} /></div>
          <div className="text-left">
            <div className="label-caps !mb-0 text-blue-600">Offenes Volumen</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{formatEuro(totalVolume)}</div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-l-amber-500">
          <div className="stat-icon-wrapper bg-amber-50 text-amber-600 shadow-sm"><History size={22} /></div>
          <div className="text-left">
            <div className="label-caps !mb-0 text-amber-600">Wartende Angebote</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{openCount}</div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
            <span className="font-black text-[10px] uppercase tracking-[0.2em] italic">Lade Angebote...</span>
        </div>
      ) : offers.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
            <FilePlus className="text-slate-200 mx-auto mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Keine Angebote gefunden</p>
        </div>
      ) : viewMode === 'GRID' ? (
        
        /* --- GRID VIEW (Neues Design) --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
          {offers.map(offer => (
            <div key={offer.id} className="group relative bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col justify-between">
              
              {/* Status Stripe */}
              <div className={`absolute top-0 left-8 right-8 h-1.5 rounded-b-xl ${offer.status === 'ACCEPTED' ? 'bg-emerald-500' : offer.status === 'SENT' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>

              <div className="pt-2">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {getStatusBadge(offer.status)}
                    <h3 className="font-black text-slate-900 mt-2 text-lg tracking-tight">#{offer.offerNumber}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">{formatEuro(offer.totalNet)}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Netto</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-left">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500 border border-slate-50"><User size={16} /></div>
                    <span className="text-sm font-bold text-slate-700 truncate">
                      {offer.customer?.companyName || `${offer.customer?.firstName} ${offer.customer?.lastName}`}
                    </span>
                  </div>
                  
                  <div className="px-1 min-h-[40px]">
                    <p className="text-sm text-slate-500 font-medium italic line-clamp-2 text-left leading-relaxed">
                        "{offer.items?.[0]?.description}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold border-t border-slate-50 pt-3">
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                          <Repeat size={12}/> {translateInterval(offer.interval)}
                      </div>
                      {offer.preferredTime && (
                          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                              <Clock size={12}/> {offer.preferredTime} Uhr
                          </div>
                      )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2">
                {offer.status === 'SENT' ? (
                  <button onClick={() => setShowConvertModal(offer)} className="btn-primary w-full !py-3 !bg-emerald-600 !border-emerald-700 shadow-lg shadow-emerald-600/20 hover:!bg-emerald-700 hover:shadow-emerald-600/30 group/btn">
                    <FileCheck size={18} className="group-hover/btn:scale-110 transition-transform" /> 
                    <span className="uppercase tracking-widest text-[10px] font-black">Auftrag Annehmen</span>
                  </button>
                ) : (
                  <div className="w-full text-center py-3 bg-slate-50 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest border border-slate-100">
                    Abgeschlossen
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* --- TABLE VIEW --- */
        <div className="table-container shadow-xl shadow-slate-200/50 animate-in slide-in-from-bottom-4 duration-500 bg-white">
            <table className="table-main">
                <thead className="table-head">
                    <tr>
                        <th className="table-cell">Nr. & Datum</th>
                        <th className="table-cell">Kunde</th>
                        <th className="table-cell">Leistung</th>
                        <th className="table-cell">Zyklus</th>
                        <th className="table-cell text-right">Summe (Netto)</th>
                        <th className="table-cell text-center">Status</th>
                        <th className="table-cell text-right">Aktion</th>
                    </tr>
                </thead>
                <tbody>
                    {offers.map(offer => (
                        <tr key={offer.id} className="table-row group">
                            <td className="table-cell">
                                <div className="font-black text-slate-900">{offer.offerNumber}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{new Date(offer.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td className="table-cell">
                                <div className="font-bold text-slate-700">{offer.customer?.companyName || offer.customer?.lastName}</div>
                            </td>
                            <td className="table-cell">
                                <div className="text-xs text-slate-600 truncate max-w-[200px]" title={offer.items?.[0]?.description}>{offer.items?.[0]?.description}</div>
                            </td>
                            <td className="table-cell">
                                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                    {translateInterval(offer.interval)}
                                </span>
                            </td>
                            <td className="table-cell text-right font-black text-slate-900">
                                {formatEuro(offer.totalNet)}
                            </td>
                            <td className="table-cell text-center">
                                {getStatusBadge(offer.status)}
                            </td>
                            <td className="table-cell text-right">
                                {offer.status === 'SENT' && (
                                    <button onClick={() => setShowConvertModal(offer)} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-all" title="In Auftrag umwandeln">
                                        <FileCheck size={18} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {/* --- CREATE MODAL --- */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-in zoom-in-95 duration-200 !max-w-xl">
            <div className="modal-header !bg-slate-900 !text-white">
              <div className="flex items-center gap-3"><FilePlus size={20} /><h2 className="text-sm font-black uppercase tracking-widest">Angebot erstellen</h2></div>
              <button onClick={() => setShowCreateModal(false)} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateOffer}>
              <div className="modal-body space-y-6 !p-8 text-left">
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="label-caps">Kunde *</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select className="input-standard pl-10 font-bold" value={newOffer.customerId} onChange={e => setNewOffer({...newOffer, customerId: e.target.value})} required>
                                <option value="">Wählen...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.lastName}, ${c.firstName}`}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="label-caps">Objekt-Adresse</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select className="input-standard pl-10" value={newOffer.addressId} onChange={e => setNewOffer({...newOffer, addressId: e.target.value})} disabled={!newOffer.customerId}>
                                <option value="">Standard (Rechnung)</option>
                                {availableAddresses.map((a:any) => <option key={a.id} value={a.id}>{a.street}, {a.city}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 relative group">
                  <label className="label-caps !text-blue-600 mb-2 block">Schnellwahl aus Katalog</label>
                  <select className="input-standard !bg-white cursor-pointer" onChange={(e) => {
                      const s = services.find(srv => srv.id === e.target.value);
                      if(s) {
                          setNewOffer(prev => ({...prev, description: s.name, price: s.priceNet.toString()}));
                          toast.success("Details übernommen");
                      }
                  }} value="">
                    <option value="" disabled>Vorlage wählen...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} ({formatEuro(Number(s.priceNet))})</option>)}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="label-caps">Leistungsbeschreibung *</label>
                  <input className="input-standard font-medium" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} placeholder="Was wird gemacht?" required />
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                    <label className="label-caps !text-emerald-600">Zyklus & Zeit</label>
                    <div className="grid grid-cols-4 gap-2">
                        {['ONCE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'].map(int => (
                            <div key={int} onClick={() => setNewOffer({...newOffer, interval: int})}
                                className={`cursor-pointer px-1 py-3 rounded-xl text-[10px] font-black border transition-all flex flex-col items-center justify-center text-center gap-1 ${newOffer.interval === int ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105' : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300'}`}>
                                <Repeat size={14} />
                                {translateInterval(int)}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 mt-3 bg-slate-50 p-2 rounded-xl border border-slate-100 w-fit">
                        <Clock size={16} className="text-slate-400"/>
                        <input type="time" className="bg-transparent font-bold text-sm outline-none text-slate-700" value={newOffer.preferredTime} onChange={e => setNewOffer({...newOffer, preferredTime: e.target.value})} />
                        <span className="text-[10px] uppercase font-bold text-slate-400 pr-2">Startzeit</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="label-caps">Menge (Pauschale)</label>
                    <input type="number" step="0.5" className="input-standard font-black text-center" value={newOffer.quantity} onChange={e => setNewOffer({...newOffer, quantity: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-caps text-blue-600">Einzelpreis (Netto)</label>
                    <div className="relative">
                        <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                        <input type="number" step="0.01" className="input-standard pl-10 font-black text-lg text-blue-700" value={newOffer.price} onChange={e => setNewOffer({...newOffer, price: e.target.value})} placeholder="0.00" required />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer !bg-slate-50 flex justify-between">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Abbrechen</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[180px] shadow-lg shadow-blue-500/20">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18}/>} Angebot Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONVERT MODAL --- */}
      {showConvertModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-in zoom-in-95 duration-200 !max-w-md">
            <div className="modal-header !bg-emerald-600 !text-white">
              <div className="flex items-center gap-3"><FileCheck size={20} /><h2 className="text-sm font-black uppercase tracking-widest">Auftrag aktivieren</h2></div>
              <button onClick={() => setShowConvertModal(null)} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>

            <form onSubmit={handleConvert}>
              <div className="modal-body space-y-6 !p-8 text-left">
                <div className="bg-emerald-50 p-4 rounded-xl text-xs text-emerald-800 border border-emerald-100 flex gap-3">
                    <CheckCircle2 size={32} className="shrink-0 text-emerald-600"/>
                    <div>
                        Angebot <strong>#{showConvertModal.offerNumber}</strong> wird in einen aktiven Vertrag umgewandelt.
                        <br/><span className="opacity-70 mt-1 block">Modus: {translateInterval(showConvertModal.interval)}</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                  <label className="label-caps">Service Typ zuweisen</label>
                  <select className="input-standard font-bold" value={convertData.serviceId} onChange={e => setConvertData({...convertData, serviceId: e.target.value})} required>
                    <option value="">-- Wählen --</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="label-caps">Startdatum (Erster Termin)</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="date" className="input-standard pl-10 font-black" value={convertData.startDate} onChange={e => setConvertData({...convertData, startDate: e.target.value})} required />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium pl-1">Uhrzeit ({showConvertModal.preferredTime || '08:00'}) wird übernommen.</p>
                </div>

                {/* E-MAIL OPTION */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${convertData.sendLink ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:border-blue-200'}`} onClick={() => setConvertData({...convertData, sendLink: !convertData.sendLink})}>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${convertData.sendLink ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                        {convertData.sendLink && <CheckCircle2 size={14} />}
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Digital unterschreiben lassen</p>
                        <p className="text-[10px] text-slate-500 font-medium">Sendet dem Kunden einen Link per E-Mail.</p>
                    </div>
                </div>

              </div>

              <div className="modal-footer !bg-slate-50 flex justify-between">
                <button type="button" onClick={() => setShowConvertModal(null)} className="btn-secondary">Abbrechen</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary !bg-emerald-600 !border-emerald-700 min-w-[150px] shadow-lg shadow-emerald-600/20">
                    {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>} Bestätigen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}