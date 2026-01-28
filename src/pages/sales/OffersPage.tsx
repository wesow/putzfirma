import { useEffect, useState } from 'react';
import { 
  FilePlus, CheckCircle2, FileText, X, Plus, Calendar,
  Loader2, TrendingUp, FileCheck, Sparkles, User, History, Euro, MapPin, Clock,
  LayoutGrid, List
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import ViewSwitcher from '../../components/ViewSwitcher'; // Falls du die Komponente hast, sonst nutzen wir Buttons direkt

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
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID'); // NEU: View State

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
      startDate: new Date().toISOString().split('T')[0]
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
    try {
      await api.post(`/offers/${showConvertModal.id}/convert`, {
        startDate: new Date(convertData.startDate),
        serviceId: convertData.serviceId
      });
      toast.success("Vertrag aktiv & Termin geplant!");
      setShowConvertModal(null);
      loadData();
    } catch (err: any) { 
        toast.error(err.response?.data?.message || "Fehler"); 
    } 
    finally { setIsSubmitting(false); }
  };

  const formatEuro = (val: number) => Number(val).toLocaleString('de-DE', {style:'currency', currency:'EUR'});
  const totalVolume = offers.reduce((acc, o) => acc + Number(o.totalNet), 0);
  const openCount = offers.filter(o => o.status === 'SENT').length;

  // --- HELPER FÜR STATUS BADGES ---
  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'ACCEPTED': return <span className="status-badge bg-emerald-50 text-emerald-700 border-emerald-100">Angenommen</span>;
          case 'SENT': return <span className="status-badge bg-blue-50 text-blue-700 border-blue-100">Versendet</span>;
          case 'REJECTED': return <span className="status-badge bg-red-50 text-red-700 border-red-100">Abgelehnt</span>;
          default: return <span className="status-badge bg-slate-50 text-slate-500 border-slate-100">Entwurf</span>;
      }
  };

  return (
    <div className="page-container">
      
      {/* HEADER */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title leading-none">Angebote</h1>
          <p className="page-subtitle text-slate-500 mt-2 font-medium">Akquise & Vertragsanbahnung</p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* VIEW SWITCHER */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex">
                <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    <LayoutGrid size={18} />
                </button>
                <button onClick={() => setViewMode('TABLE')} className={`p-2 rounded-lg transition-all ${viewMode === 'TABLE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                    <List size={18} />
                </button>
            </div>

            <button onClick={() => setShowCreateModal(true)} className="btn-primary shadow-blue-200">
                <Plus size={18} /> <span>Neues Angebot</span>
            </button>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="stats-grid animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="stat-card border-l-4 border-l-blue-500">
          <div className="stat-icon-wrapper icon-info shadow-sm"><TrendingUp size={22} /></div>
          <div className="text-left">
            <div className="label-caps !mb-0">Pipeline Wert</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{formatEuro(totalVolume)}</div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-l-amber-500">
          <div className="stat-icon-wrapper bg-amber-50 text-amber-600 shadow-sm"><History size={22} /></div>
          <div className="text-left">
            <div className="label-caps !mb-0">Offen</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{openCount}</div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-blue-600 mb-4" size={40} /></div>
      ) : offers.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200"><FilePlus className="text-slate-200 mx-auto mb-3" size={48} /><p className="text-slate-500 font-bold uppercase text-xs">Keine Angebote</p></div>
      ) : viewMode === 'GRID' ? (
        /* --- GRID VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
          {offers.map(offer => (
            <div key={offer.id} className="customer-card !p-0 overflow-hidden border-none shadow-lg bg-white relative group">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${offer.status === 'ACCEPTED' ? 'bg-emerald-500' : offer.status === 'SENT' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-start pl-2">
                  <div className="text-left">
                    {getStatusBadge(offer.status)}
                    <h3 className="font-black text-slate-900 mt-2 text-lg">#{offer.offerNumber}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-blue-600">{formatEuro(offer.totalNet)}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Netto</div>
                  </div>
                </div>

                <div className="space-y-3 pl-2">
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500"><User size={16} /></div>
                    <span className="text-sm font-black text-slate-700 truncate">
                      {offer.customer?.companyName || `${offer.customer?.firstName} ${offer.customer?.lastName}`}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium italic line-clamp-2 text-left min-h-[40px]">"{offer.items?.[0]?.description}"</p>
                  
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold border-t border-slate-50 pt-3">
                      <div className="flex items-center gap-1">
                          <Calendar size={14}/> 
                          {offer.interval === 'ONCE' ? 'Einmalig' : offer.interval === 'WEEKLY' ? 'Wöchentlich' : offer.interval === 'BIWEEKLY' ? 'Alle 2 Wochen' : 'Monatlich'}
                      </div>
                      {offer.preferredTime && <div className="flex items-center gap-1"><Clock size={14}/> {offer.preferredTime} Uhr</div>}
                  </div>
                </div>

                <div className="pt-2 pl-2">
                  {offer.status === 'SENT' ? (
                    <button onClick={() => setShowConvertModal(offer)} className="btn-primary w-full !py-3 !bg-emerald-600 !border-emerald-700 shadow-emerald-100 hover:!bg-emerald-700 group/btn">
                      <FileCheck size={18} className="group-hover/btn:scale-110 transition-transform" /> <span className="uppercase tracking-widest text-[10px] font-black">Annehmen</span>
                    </button>
                  ) : (
                    <div className="w-full text-center py-3 bg-slate-50 rounded-xl text-[10px] font-black text-slate-300 uppercase">Abgeschlossen</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* --- TABLE VIEW (NEU) --- */
        <div className="table-container animate-in slide-in-from-bottom-4 duration-500 bg-white">
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
                                <div className="text-[10px] text-slate-400 font-bold">{new Date(offer.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td className="table-cell">
                                <div className="font-bold text-slate-700">{offer.customer?.companyName || offer.customer?.lastName}</div>
                            </td>
                            <td className="table-cell">
                                <div className="text-xs text-slate-600 truncate max-w-[200px]" title={offer.items?.[0]?.description}>{offer.items?.[0]?.description}</div>
                            </td>
                            <td className="table-cell">
                                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {offer.interval === 'ONCE' ? 'Einmalig' : offer.interval}
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
                                    <button onClick={() => setShowConvertModal(offer)} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-all" title="Annehmen">
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

      {/* --- CREATE MODAL (Identisch) --- */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-in zoom-in-95 duration-200 !max-w-lg">
            <div className="modal-header !bg-slate-900 !text-white">
              <div className="flex items-center gap-3"><FilePlus size={20} /><h2 className="text-sm font-black uppercase">Angebot erstellen</h2></div>
              <button onClick={() => setShowCreateModal(false)} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateOffer}>
              <div className="modal-body space-y-6 !p-8 text-left">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="label-caps">Kunde</label>
                        <select className="input-standard font-bold" value={newOffer.customerId} onChange={e => setNewOffer({...newOffer, customerId: e.target.value})} required>
                            <option value="">Wählen...</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || c.lastName}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="label-caps">Objekt-Adresse</label>
                        <select className="input-standard" value={newOffer.addressId} onChange={e => setNewOffer({...newOffer, addressId: e.target.value})} disabled={!newOffer.customerId}>
                            <option value="">Standard (Rechnung)</option>
                            {availableAddresses.map((a:any) => <option key={a.id} value={a.id}>{a.street}, {a.city}</option>)}
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <label className="label-caps !text-blue-600 mb-2">Service Vorlage</label>
                  <select className="input-standard !bg-white" onChange={(e) => {
                      const s = services.find(srv => srv.id === e.target.value);
                      if(s) {
                          setNewOffer(prev => ({...prev, description: s.name, price: s.priceNet.toString()}));
                          toast.success("Übernommen");
                      }
                  }} value="">
                    <option value="" disabled>Laden...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} ({formatEuro(Number(s.priceNet))})</option>)}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="label-caps">Beschreibung</label>
                  <input className="input-standard" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} placeholder="Leistungsbeschreibung" required />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="label-caps !text-emerald-600">Geplante Ausführung</label>
                    <div className="grid grid-cols-4 gap-2">
                        {['ONCE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'].map(int => (
                            <div key={int} onClick={() => setNewOffer({...newOffer, interval: int})}
                                className={`cursor-pointer px-1 py-2 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center text-center ${newOffer.interval === int ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'}`}>
                                {int === 'ONCE' ? 'Einmal' : int === 'WEEKLY' ? '1x/Wo' : int === 'BIWEEKLY' ? 'Alle 2' : 'Monatl'}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Clock size={16} className="text-slate-400"/>
                        <input type="time" className="input-standard !py-1 !w-32 text-center" value={newOffer.preferredTime} onChange={e => setNewOffer({...newOffer, preferredTime: e.target.value})} />
                        <span className="text-xs text-slate-400">Wunsch-Uhrzeit</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="label-caps">Menge</label>
                    <input type="number" step="0.5" className="input-standard font-black" value={newOffer.quantity} onChange={e => setNewOffer({...newOffer, quantity: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-caps text-blue-600">Preis (€)</label>
                    <input type="number" step="0.01" className="input-standard font-black" value={newOffer.price} onChange={e => setNewOffer({...newOffer, price: e.target.value})} placeholder="0.00" required />
                  </div>
                </div>
              </div>

              <div className="modal-footer !bg-slate-50">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Abbrechen</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[150px]">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18}/>} Speichern
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
              <div className="flex items-center gap-3"><FileCheck size={20} /><h2 className="text-sm font-black uppercase">Auftrag aktivieren</h2></div>
              <button onClick={() => setShowConvertModal(null)} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>

            <form onSubmit={handleConvert}>
              <div className="modal-body space-y-6 !p-8 text-left">
                <div className="bg-emerald-50 p-4 rounded-xl text-xs text-emerald-800 font-medium">
                    Angebot <strong>#{showConvertModal.offerNumber}</strong> wird in einen Vertrag umgewandelt.
                    <br/>Modus: <strong>{showConvertModal.interval === 'ONCE' ? 'Einmalig' : showConvertModal.interval}</strong>.
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
                  <input type="date" className="input-standard font-black" value={convertData.startDate} onChange={e => setConvertData({...convertData, startDate: e.target.value})} required />
                  <p className="text-[10px] text-slate-400 mt-1">Uhrzeit ({showConvertModal.preferredTime || '08:00'}) wird aus Angebot übernommen.</p>
                </div>
              </div>

              <div className="modal-footer !bg-slate-50">
                <button type="button" onClick={() => setShowConvertModal(null)} className="btn-secondary">Abbrechen</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary !bg-emerald-600 !border-emerald-700 min-w-[150px]">
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