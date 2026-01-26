import { useEffect, useState } from 'react';
import { 
  FilePlus, 
  CheckCircle2, 
  FileText, 
  X, 
  Plus, 
  AlertCircle, 
  Calendar,
  Loader2,
  TrendingUp,
  FileCheck,
  Sparkles,
  User,
  History,
  Euro
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

// --- TYPEN ---
interface Customer { id: string; companyName: string | null; lastName: string; firstName: string; }
interface Service { id: string; name: string; priceNet: number; unit: string; }
interface Offer {
  id: string;
  offerNumber: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  totalNet: number;
  customer: Customer;
  items: { description: string }[];
  validUntil: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState<Offer | null>(null);

  const [newOffer, setNewOffer] = useState({
      customerId: '',
      description: '', 
      price: '',
      quantity: '1'
  });

  const [convertData, setConvertData] = useState({
      serviceId: '',
      interval: 'WEEKLY',
      startDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { loadData(); }, []);

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
      toast.error("Laden fehlgeschlagen");
    } finally { setLoading(false); }
  };

  const handleServiceTemplateSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
        setNewOffer(prev => ({ ...prev, description: service.name, price: service.priceNet.toString() }));
        toast.success("Vorlage geladen", { icon: '✨' });
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.customerId || !newOffer.description) return toast.error("Daten unvollständig");
    setIsSubmitting(true);
    try {
      await api.post('/offers', {
        customerId: newOffer.customerId,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 
        items: [{
          description: newOffer.description,
          quantity: parseFloat(newOffer.quantity),
          unit: 'Psch', 
          unitPrice: parseFloat(newOffer.price.replace(',', '.'))
        }]
      });
      toast.success("Angebot erstellt");
      setShowCreateModal(false);
      setNewOffer({ customerId: '', description: '', price: '', quantity: '1' });
      loadData();
    } catch (err) { toast.error("Fehler"); } 
    finally { setIsSubmitting(false); }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConvertModal || !convertData.serviceId) return toast.error("Service wählen");
    setIsSubmitting(true);
    try {
      await api.post(`/offers/${showConvertModal.id}/convert`, {
        startDate: new Date(convertData.startDate),
        interval: convertData.interval,
        serviceId: convertData.serviceId
      });
      toast.success("Vertrag aktiv!");
      setShowConvertModal(null);
      loadData();
    } catch (err) { toast.error("Fehler"); } 
    finally { setIsSubmitting(false); }
  };

  const formatEuro = (val: number) => Number(val).toLocaleString('de-DE', {style:'currency', currency:'EUR'});
  const totalVolume = offers.reduce((acc, o) => acc + Number(o.totalNet), 0);
  const openCount = offers.filter(o => o.status === 'SENT').length;

  return (
    <div className="page-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title leading-none">Angebotswesen</h1>
          <p className="page-subtitle text-slate-500 mt-2 font-medium">Akquise-Management und Konvertierung in aktive Service-Verträge.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary shadow-blue-200">
          <Plus size={18} /> <span>Neues Angebot</span>
        </button>
      </div>

      {/* KPI STATS */}
      <div className="stats-grid animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="stat-card border-l-4 border-l-blue-500">
          <div className="stat-icon-wrapper icon-info shadow-sm">
            <TrendingUp size={22} />
          </div>
          <div className="text-left">
            <div className="label-caps !mb-0">Potenzielles Volumen</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{formatEuro(totalVolume)}</div>
          </div>
        </div>
        <div className="stat-card border-l-4 border-l-amber-500">
          <div className="stat-icon-wrapper bg-amber-50 text-amber-600 shadow-sm">
            <History size={22} />
          </div>
          <div className="text-left">
            <div className="label-caps !mb-0">In Verhandlung</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{openCount} Angebote</div>
          </div>
        </div>
      </div>

      {/* OFFERS GRID */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <span className="label-caps italic text-slate-400">Synchronisiere Pipeline...</span>
        </div>
      ) : filteredOffers(offers).length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
          <FilePlus className="text-slate-200 mx-auto mb-3" size={48} />
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Keine aktiven Angebote</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
          {offers.map(offer => (
            <div key={offer.id} className="customer-card !p-0 overflow-hidden border-none shadow-lg bg-white relative group">
              {/* Status Side-Stripe */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                offer.status === 'ACCEPTED' ? 'bg-emerald-500' : 
                offer.status === 'SENT' ? 'bg-blue-500' : 
                offer.status === 'REJECTED' ? 'bg-red-500' : 'bg-slate-300'
              }`}></div>

              <div className="p-6 space-y-5">
                <div className="flex justify-between items-start pl-2">
                  <div className="text-left">
                    <span className={`status-badge !rounded-md font-black text-[9px] ${
                      offer.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700' : 
                      offer.status === 'SENT' ? 'bg-blue-50 text-blue-700' : 
                      offer.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {offer.status === 'ACCEPTED' ? 'ANGENOMMEN' : offer.status === 'SENT' ? 'VERSENDET' : offer.status === 'REJECTED' ? 'ABGELEHNT' : 'ENTWURF'}
                    </span>
                    <h3 className="font-black text-slate-900 mt-2 text-lg tracking-tight">#{offer.offerNumber}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-blue-600 tracking-tighter">{formatEuro(offer.totalNet)}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Netto Gesamt</div>
                  </div>
                </div>

                <div className="space-y-3 pl-2">
                  <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500">
                        <User size={16} />
                    </div>
                    <span className="text-sm font-black text-slate-700 truncate">
                      {offer.customer?.companyName || `${offer.customer?.firstName} ${offer.customer?.lastName}`}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-500 font-medium italic line-clamp-2 leading-snug text-left min-h-[40px]">
                    "{offer.items?.[0]?.description || 'Keine Beschreibung'}"
                  </p>
                  
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-wider pt-3 border-t border-slate-50">
                    <Calendar size={14} className="text-slate-300"/> 
                    <span>Gültig bis {new Date(offer.validUntil).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>

                <div className="pt-2 pl-2">
                  {offer.status === 'SENT' ? (
                    <button onClick={() => setShowConvertModal(offer)} className="btn-primary w-full !py-3 !bg-emerald-600 !border-emerald-700 shadow-emerald-100 hover:!bg-emerald-700 group/btn">
                      <FileCheck size={18} className="group-hover/btn:scale-110 transition-transform" /> 
                      <span className="uppercase tracking-widest text-[10px] font-black">In Vertrag wandeln</span>
                    </button>
                  ) : offer.status === 'ACCEPTED' ? (
                    <div className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-black text-[10px] uppercase tracking-[0.2em]">
                      <CheckCircle2 size={16} /> Vertrag Aktiv
                    </div>
                  ) : (
                    <div className="w-full text-center py-3 bg-slate-50 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 italic">
                      In Bearbeitung
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL: CREATE --- */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-in zoom-in-95 duration-200 !max-w-lg">
            <div className="modal-header !bg-slate-900 !text-white">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <FilePlus size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-black uppercase tracking-widest">Angebot erstellen</h2>
                    <p className="text-[10px] text-slate-400 font-bold tracking-tight">Neukunden-Akquise</p>
                  </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateOffer}>
              <div className="modal-body space-y-6 !p-8 text-left">
                <div className="space-y-1.5">
                  <label className="label-caps">Empfänger wählen *</label>
                  <select className="input-standard font-bold" value={newOffer.customerId} onChange={e => setNewOffer({...newOffer, customerId: e.target.value})} required>
                    <option value="">-- Kundenstamm durchsuchen --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.firstName} ${c.lastName}`}</option>)}
                  </select>
                </div>

                <div className="p-5 bg-blue-50/50 rounded-[1.5rem] border border-blue-100 group">
                  <label className="label-caps !text-blue-600 flex items-center gap-1.5 mb-3"><Sparkles size={14} fill="currentColor"/> Leistung aus Katalog laden</label>
                  <select className="input-standard !bg-white border-blue-100 shadow-sm" onChange={(e) => handleServiceTemplateSelect(e.target.value)} value="">
                    <option value="" disabled>Vorlage wählen...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} ({formatEuro(Number(s.priceNet))})</option>)}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="label-caps">Positionstext</label>
                  <input className="input-standard" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} placeholder="z.B. Monatliche Unterhaltsreinigung" required />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="label-caps">Menge</label>
                    <input type="number" step="0.5" className="input-standard font-black" value={newOffer.quantity} onChange={e => setNewOffer({...newOffer, quantity: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-caps text-blue-600">Einzelpreis (€)</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500"><Euro size={16}/></div>
                        <input type="number" step="0.01" className="input-standard pl-10 font-black" value={newOffer.price} onChange={e => setNewOffer({...newOffer, price: e.target.value})} placeholder="0.00" required />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer !bg-slate-50">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary !shadow-none !border-transparent">Abbrechen</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[180px] shadow-blue-500/20 py-3 uppercase tracking-widest text-[10px] font-black">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18}/>} Angebot speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CONVERT --- */}
      {showConvertModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-in zoom-in-95 duration-200 !max-w-md">
            <div className="modal-header !bg-emerald-600 !text-white">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <FileCheck size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-black uppercase tracking-widest">Vertrag aktivieren</h2>
                    <p className="text-[10px] text-emerald-100 font-bold tracking-tight">Angebot #{showConvertModal.offerNumber}</p>
                  </div>
              </div>
              <button onClick={() => setShowConvertModal(null)} className="p-2 hover:bg-white/10 rounded-xl text-white/50 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleConvert}>
              <div className="modal-body space-y-6 !p-8 text-left">
                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-[1.5rem] border border-emerald-100">
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0 mt-0.5"><CheckCircle2 size={20}/></div>
                   <p className="text-xs text-emerald-800 font-bold leading-relaxed">
                     Das System erstellt nun einen <strong>Dauerauftrag</strong> basierend auf diesem Angebot. Bitte wählen Sie den finalen Service-Typ.
                   </p>
                </div>

                <div className="space-y-1.5">
                  <label className="label-caps">Service-Zuordnung</label>
                  <select className="input-standard font-bold" value={convertData.serviceId} onChange={e => setConvertData({...convertData, serviceId: e.target.value})} required>
                    <option value="">-- Leistung aus Katalog wählen --</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="label-caps">Intervall</label>
                    <select className="input-standard font-black" value={convertData.interval} onChange={e => setConvertData({...convertData, interval: e.target.value})}>
                      <option value="WEEKLY">Wöchentlich</option>
                      <option value="BIWEEKLY">Alle 2 Wochen</option>
                      <option value="MONTHLY">Monatlich</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-caps">Startdatum</label>
                    <input type="date" className="input-standard font-black" value={convertData.startDate} onChange={e => setConvertData({...convertData, startDate: e.target.value})} required />
                  </div>
                </div>
              </div>

              <div className="modal-footer !bg-slate-50">
                <button type="button" onClick={() => setShowConvertModal(null)} className="btn-secondary !shadow-none !border-transparent">Abbrechen</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary !bg-emerald-600 !border-emerald-700 shadow-emerald-100 min-w-[180px] py-3 uppercase tracking-widest text-[10px] font-black">
                   {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <FileCheck size={18}/>} Vertrag anlegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Hilfsfunktion zum Filtern (falls benötigt)
function filteredOffers(offers: Offer[]) {
    return offers;
}