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
  Copy
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

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState<Offer | null>(null);

  // Formular State: Angebot erstellen
  const [newOffer, setNewOffer] = useState({
      customerId: '',
      description: '', 
      price: '',
      quantity: '1'
  });

  // Formular State: In Vertrag umwandeln
  const [convertData, setConvertData] = useState({
      serviceId: '',
      interval: 'WEEKLY',
      startDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resOff, resCust, resServ] = await Promise.all([
        api.get('/offers'),
        api.get('/customers'),
        api.get('/services')
      ]);
      
      const sorted = resOff.data.sort((a: Offer, b: Offer) => 
        (b.offerNumber || '').localeCompare(a.offerNumber || '')
      );
      
      setOffers(sorted);
      setCustomers(resCust.data);
      setServices(resServ.data);
    } catch (error) {
      toast.error("Daten konnten nicht geladen werden");
    } finally {
        setLoading(false);
    }
  };

  // --- LOGIK: VORLAGE AUSWÄHLEN ---
  const handleServiceTemplateSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
        setNewOffer(prev => ({
            ...prev,
            description: service.name, 
            price: service.priceNet.toString() 
        }));
        toast.success("Vorlage übernommen (bearbeitbar)", { icon: '✨' });
    }
  };

  // --- AKTION: ANGEBOT ERSTELLEN ---
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.customerId) return toast.error("Bitte einen Kunden wählen");
    if (!newOffer.description) return toast.error("Beschreibung fehlt");

    setIsSubmitting(true);
    try {
      await api.post('/offers', {
        customerId: newOffer.customerId,
        // Standard: 14 Tage gültig
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
    } catch (err) { 
        toast.error("Fehler beim Erstellen"); 
    } finally { 
        setIsSubmitting(false); 
    }
  };

  // --- AKTION: VERTRAG ERSTELLEN ---
  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConvertModal || !convertData.serviceId) return toast.error("Bitte Service wählen");

    setIsSubmitting(true);
    try {
      await api.post(`/offers/${showConvertModal.id}/convert`, {
        startDate: new Date(convertData.startDate),
        interval: convertData.interval,
        serviceId: convertData.serviceId
      });
      
      toast.success("Vertrag erfolgreich erstellt!");
      setShowConvertModal(null);
      loadData();
    } catch (err) { 
        toast.error("Fehler beim Umwandeln"); 
    } finally { 
        setIsSubmitting(false); 
    }
  };

  const formatEuro = (val: number) => Number(val).toLocaleString('de-DE', {style:'currency', currency:'EUR'});

  const totalVolume = offers.reduce((acc, o) => acc + Number(o.totalNet), 0);
  const openCount = offers.filter(o => o.status === 'SENT').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
       
       {/* HEADER & KPI */}
       <div className="flex flex-col gap-6">
           <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
               <div>
                   <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                       Angebote
                   </h1>
                   <p className="text-slate-500 mt-1">Erstellen Sie Angebote und wandeln Sie diese per Klick in Verträge um.</p>
               </div>
               <button 
                   onClick={() => setShowCreateModal(true)}
                   className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95"
               >
                   <Plus size={20} /> Neues Angebot
               </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                       <TrendingUp size={24} />
                   </div>
                   <div>
                       <div className="text-xs font-bold text-slate-500 uppercase">Angebotsvolumen</div>
                       <div className="text-2xl font-bold text-slate-800">{formatEuro(totalVolume)}</div>
                   </div>
               </div>
               <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                   <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                       <FileText size={24} />
                   </div>
                   <div>
                       <div className="text-xs font-bold text-slate-500 uppercase">Offene Angebote</div>
                       <div className="text-2xl font-bold text-slate-800">{openCount}</div>
                   </div>
               </div>
           </div>
       </div>

       {/* LISTE */}
       {loading ? (
           <div className="text-center py-20 text-slate-400 flex flex-col items-center">
               <Loader2 className="animate-spin mb-2" /> Lade Angebote...
           </div>
       ) : offers.length === 0 ? (
           <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
               <div className="flex justify-center mb-4"><FilePlus className="text-slate-300 w-12 h-12" /></div>
               <p className="text-slate-500">Noch keine Angebote erstellt.</p>
           </div>
       ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {offers.map(offer => (
                   <div key={offer.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group relative overflow-hidden flex flex-col">
                       
                       {/* Status Stripe */}
                       <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                           offer.status === 'ACCEPTED' ? 'bg-green-500' : 
                           offer.status === 'SENT' ? 'bg-blue-500' : 
                           offer.status === 'REJECTED' ? 'bg-red-500' : 'bg-slate-300'
                       }`}></div>

                       <div className="flex justify-between items-start mb-4 pl-3">
                           <div>
                               <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${
                                   offer.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-100' : 
                                   offer.status === 'SENT' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                   offer.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                               }`}>
                                   {offer.status === 'ACCEPTED' ? <CheckCircle2 size={12}/> : null}
                                   {offer.status === 'ACCEPTED' ? 'Angenommen' : offer.status === 'SENT' ? 'Versendet' : offer.status === 'REJECTED' ? 'Abgelehnt' : 'Entwurf'}
                               </span>
                               <h3 className="font-bold text-lg text-slate-900 mt-2">{offer.offerNumber}</h3>
                           </div>
                           <div className="text-right">
                               <div className="text-xl font-bold text-slate-800">{formatEuro(offer.totalNet)}</div>
                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Netto</div>
                           </div>
                       </div>

                       <div className="pl-3 space-y-3 mb-6 flex-1">
                           <div className="flex items-center gap-2 text-sm text-slate-700 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                               <div className="bg-white p-1 rounded border border-slate-200 shadow-sm"><FileText size={14} className="text-indigo-500" /></div>
                               <span className="truncate">{offer.customer?.companyName || `${offer.customer?.firstName} ${offer.customer?.lastName}`}</span>
                           </div>
                           
                           <div className="text-sm text-slate-500">
                               <p className="line-clamp-2 leading-relaxed italic">
                                   {offer.items?.[0]?.description || 'Keine Beschreibung'} 
                                   {(offer.items?.length || 0) > 1 && <span className="text-slate-400 text-xs ml-1">(+{offer.items.length - 1} weitere)</span>}
                               </p>
                           </div>

                           <div className="flex items-center gap-2 text-xs text-slate-400 mt-auto">
                               <Calendar size={12}/>
                               <span>Gültig bis: {new Date(offer.validUntil).toLocaleDateString('de-DE')}</span>
                           </div>
                       </div>

                       {/* Action Button */}
                       <div className="mt-auto pl-3">
                           {offer.status === 'SENT' ? (
                               <button 
                                   onClick={() => setShowConvertModal(offer)}
                                   className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-100 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 active:scale-95"
                               >
                                   <FileCheck size={18} /> Annehmen & Vertrag
                               </button>
                           ) : offer.status === 'ACCEPTED' ? (
                               <div className="w-full bg-slate-50 text-green-700 py-2.5 rounded-xl font-bold text-center text-sm border border-green-100 flex items-center justify-center gap-2">
                                   <CheckCircle2 size={16} /> Vertrag aktiv
                               </div>
                           ) : (
                               <div className="w-full bg-slate-50 text-slate-400 py-2.5 rounded-xl font-medium text-center text-sm border border-slate-100">
                                   Entwurf
                               </div>
                           )}
                       </div>
                   </div>
               ))}
           </div>
       )}

       {/* --- MODAL: NEUES ANGEBOT --- */}
       {showCreateModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                   
                   {/* Modal Header */}
                   <div className="flex justify-between items-start mb-6">
                       <h2 className="text-2xl font-bold text-slate-800">Neues Angebot</h2>
                       <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"><X size={24} /></button>
                   </div>
                   
                   <div className="overflow-y-auto pr-1">
                       <form onSubmit={handleCreateOffer} className="space-y-6">
                           
                           {/* 1. Kunde */}
                           <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kunde</label>
                               <select 
                                   className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                   value={newOffer.customerId} 
                                   onChange={e => setNewOffer({...newOffer, customerId: e.target.value})}
                               >
                                   <option value="">-- Bitte wählen --</option>
                                   {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.firstName} ${c.lastName}`}</option>)}
                               </select>
                           </div>

                           {/* 2. Vorlage (Der Hybrid-Teil) */}
                           <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <label className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase mb-2">
                                    <Sparkles size={14}/> Vorlage aus Katalog (Optional)
                                </label>
                                <div className="relative">
                                    <select 
                                            className="w-full p-2.5 border border-indigo-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer" 
                                            onChange={(e) => handleServiceTemplateSelect(e.target.value)}
                                            value=""
                                    >
                                            <option value="" disabled>-- Standard-Leistung wählen --</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} ({formatEuro(s.priceNet)})
                                                </option>
                                            ))}
                                    </select>
                                    <div className="absolute right-3 top-2.5 pointer-events-none text-indigo-400">
                                            <Copy size={16} />
                                    </div>
                                </div>
                                <p className="text-[10px] text-indigo-400 mt-1.5">
                                    Wählt eine Leistung aus und füllt Text & Preis automatisch aus.
                                </p>
                           </div>
                           
                           {/* 3. Details (Bearbeitbar) */}
                           <div className="space-y-4">
                               <div>
                                   <label className="block text-sm font-semibold text-slate-700 mb-1.5">Leistungsbeschreibung</label>
                                   <input 
                                           className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400" 
                                           value={newOffer.description} 
                                           onChange={e => setNewOffer({...newOffer, description: e.target.value})} 
                                           placeholder="z.B. Glasreinigung EG (individuell)"
                                   />
                               </div>

                               <div className="grid grid-cols-2 gap-4">
                                   <div>
                                           <label className="block text-sm font-semibold text-slate-700 mb-1.5">Menge</label>
                                           <input type="number" step="0.5" className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newOffer.quantity} onChange={e => setNewOffer({...newOffer, quantity: e.target.value})} />
                                   </div>
                                   <div>
                                           <label className="block text-sm font-semibold text-slate-700 mb-1.5">Einzelpreis (€)</label>
                                           <input type="number" step="0.01" className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newOffer.price} onChange={e => setNewOffer({...newOffer, price: e.target.value})} placeholder="0.00" />
                                   </div>
                               </div>
                           </div>

                           <div className="pt-4 border-t border-slate-100">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin"/> : <Plus size={20}/>} Angebot erstellen
                                </button>
                           </div>
                       </form>
                   </div>
               </div>
           </div>
       )}

       {/* --- MODAL: VERTRAG ERSTELLEN --- */}
       {showConvertModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                   <div className="text-center mb-8">
                       <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50">
                           <FileCheck size={32} />
                       </div>
                       <h2 className="text-2xl font-bold text-slate-900">Angebot annehmen</h2>
                       <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                           Hiermit wird das Angebot <strong>{showConvertModal.offerNumber}</strong> in einen laufenden Vertrag umgewandelt.
                       </p>
                   </div>

                   <form onSubmit={handleConvert} className="space-y-5">
                       <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-1.5">Welcher Service wird ausgeführt?</label>
                           <select 
                               className="w-full p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                               value={convertData.serviceId} 
                               onChange={e => setConvertData({...convertData, serviceId: e.target.value})}
                               required
                           >
                               <option value="">Service wählen...</option>
                               {services.map(s => <option key={s.id} value={s.id}>{s.name} ({formatEuro(s.priceNet)})</option>)}
                           </select>
                           <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1"><AlertCircle size={12}/> Bestimmt Preis & Dauer der Jobs</p>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Intervall</label>
                               <select 
                                   className="w-full p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none" 
                                   value={convertData.interval} 
                                   onChange={e => setConvertData({...convertData, interval: e.target.value})}
                               >
                                   <option value="WEEKLY">Wöchentlich</option>
                                   <option value="BIWEEKLY">Alle 2 Wochen</option>
                                   <option value="MONTHLY">Monatlich</option>
                               </select>
                           </div>
                           
                           <div>
                               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Startdatum</label>
                               <input 
                                   type="date" 
                                   className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                   value={convertData.startDate}
                                   onChange={e => setConvertData({...convertData, startDate: e.target.value})}
                                   required
                               />
                           </div>
                       </div>

                       <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                           <button type="button" onClick={() => setShowConvertModal(null)} className="flex-1 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition">Abbrechen</button>
                           <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="flex-1 bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition active:scale-95 flex justify-center items-center gap-2"
                            >
                               {isSubmitting ? <Loader2 className="animate-spin"/> : <CheckCircle2 size={20}/>} Vertrag erstellen
                           </button>
                       </div>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
}