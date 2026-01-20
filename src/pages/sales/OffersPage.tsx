import { useEffect, useState } from 'react';
import { FilePlus, CheckCircle, FileText, ArrowRight, X, Plus, AlertCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

// Typen definieren
interface Customer { id: string; companyName: string | null; lastName: string; firstName: string; }
interface Service { id: string; name: string; }
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

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState<Offer | null>(null);

  // Formular State (Angebot erstellen)
  const [newOffer, setNewOffer] = useState({
      customerId: '',
      description: 'Unterhaltsreinigung',
      price: '35.00',
      quantity: '1'
  });

  // Formular State (Vertrag erstellen)
  const [convertData, setConvertData] = useState({
      serviceId: '',
      interval: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0] // Standard: Heute (als YYYY-MM-DD)
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
      setOffers(resOff.data);
      setCustomers(resCust.data);
      setServices(resServ.data);
    } catch (error) {
      toast.error("Daten konnten nicht geladen werden");
    } finally {
        setLoading(false);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.customerId) {
        toast.error("Bitte einen Kunden wählen");
        return;
    }

    try {
      await api.post('/offers', {
        customerId: newOffer.customerId,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 Tage gültig
        items: [{
          description: newOffer.description,
          quantity: newOffer.quantity,
          unit: 'Psch',
          unitPrice: newOffer.price
        }]
      });
      toast.success("Angebot erstellt");
      setShowCreateModal(false);
      setNewOffer({ customerId: '', description: 'Unterhaltsreinigung', price: '35.00', quantity: '1' }); // Reset
      loadData();
    } catch (err) { toast.error("Fehler beim Erstellen"); }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConvertModal) return;
    if (!convertData.serviceId) {
        toast.error("Bitte einen Service für den Vertrag wählen");
        return;
    }

    try {
      await api.post(`/offers/${showConvertModal.id}/convert`, {
        startDate: new Date(convertData.startDate), // Das gewählte Datum nutzen
        interval: convertData.interval,
        serviceId: convertData.serviceId
      });
      
      toast.success("Vertrag erfolgreich erstellt!");
      setShowConvertModal(null);
      loadData();
    } catch (err) { toast.error("Fehler beim Umwandeln"); }
  };

  const formatEuro = (val: number) => Number(val).toLocaleString('de-DE', {style:'currency', currency:'EUR'});

  if (loading) return <div className="p-10 text-center text-slate-400">Lade Angebote...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
       
       {/* HEADER */}
       <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-purple-600 h-8 w-8" /> Angebote
                </h1>
                <p className="text-slate-500 text-sm">Erstelle Angebote und wandle sie in Verträge um.</p>
            </div>
            <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition flex items-center gap-2 shadow-lg shadow-purple-200 active:scale-95"
            >
                <Plus size={20} /> Neues Angebot
            </button>
       </div>

       {/* LISTE */}
       {offers.length === 0 ? (
           <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
               <div className="flex justify-center mb-4"><FilePlus className="text-slate-300 w-12 h-12" /></div>
               <p className="text-slate-500">Noch keine Angebote erstellt.</p>
           </div>
       ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {offers.map(offer => (
                   <div key={offer.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group relative overflow-hidden">
                       
                       {/* Status Stripe */}
                       <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                           offer.status === 'ACCEPTED' ? 'bg-green-500' : 
                           offer.status === 'SENT' ? 'bg-blue-500' : 'bg-slate-300'
                       }`}></div>

                       <div className="flex justify-between items-start mb-4 pl-3">
                           <div>
                               <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                   offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 
                                   offer.status === 'SENT' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                               }`}>
                                   {offer.status === 'ACCEPTED' ? 'Angenommen' : offer.status === 'SENT' ? 'Offen' : 'Entwurf'}
                               </span>
                               <h3 className="font-bold text-lg text-slate-800 mt-2">{offer.offerNumber}</h3>
                           </div>
                           <div className="text-right">
                               <div className="text-xl font-bold text-slate-800">{formatEuro(offer.totalNet)}</div>
                               <div className="text-xs text-slate-400 uppercase">Netto</div>
                           </div>
                       </div>

                       <div className="pl-3 space-y-2 mb-6">
                           <div className="flex items-center gap-2 text-sm text-slate-600">
                               <FileText size={16} className="text-slate-400" />
                               <span className="font-medium truncate">{offer.customer?.companyName || `${offer.customer?.firstName} ${offer.customer?.lastName}`}</span>
                           </div>
                          <div className="text-sm text-slate-500 pl-6 line-clamp-1">
                          {offer.items?.[0]?.description || 'Keine Beschreibung'} 
                          {(offer.items?.length || 0) > 1 && ` + ${(offer.items?.length || 0) - 1} weitere`}
                      </div>
                           <div className="text-xs text-slate-400 pl-6">
                               Gültig bis: {new Date(offer.validUntil).toLocaleDateString('de-DE')}
                           </div>
                       </div>

                       {/* Action Button */}
                       {offer.status === 'SENT' && (
                           <button 
                               onClick={() => setShowConvertModal(offer)}
                               className="w-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                           >
                               <CheckCircle size={18} /> Annehmen & Vertrag
                           </button>
                       )}
                       {offer.status === 'ACCEPTED' && (
                           <div className="w-full bg-slate-50 text-slate-500 py-2.5 rounded-xl font-medium text-center text-sm border border-slate-100 flex items-center justify-center gap-2">
                               <CheckCircle size={16} /> Bereits Vertrag
                           </div>
                       )}
                   </div>
               ))}
           </div>
       )}

       {/* --- MODAL: NEUES ANGEBOT --- */}
       {showCreateModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                   <div className="flex justify-between items-center mb-6">
                       <h2 className="text-xl font-bold">Neues Angebot erstellen</h2>
                       <button onClick={() => setShowCreateModal(false)}><X className="text-slate-400 hover:text-red-500" /></button>
                   </div>
                   
                   <form onSubmit={handleCreateOffer} className="space-y-4">
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Kunde</label>
                           <select className="w-full p-2.5 border rounded-lg bg-white" value={newOffer.customerId} onChange={e => setNewOffer({...newOffer, customerId: e.target.value})}>
                               <option value="">Wählen...</option>
                               {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.firstName} ${c.lastName}`}</option>)}
                           </select>
                       </div>
                       
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Leistungsbeschreibung</label>
                           <input className="w-full p-2.5 border rounded-lg" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} />
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Menge / Anzahl</label>
                               <input type="number" step="0.5" className="w-full p-2.5 border rounded-lg" value={newOffer.quantity} onChange={e => setNewOffer({...newOffer, quantity: e.target.value})} />
                           </div>
                           <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Einzelpreis (€)</label>
                               <input type="number" step="0.01" className="w-full p-2.5 border rounded-lg" value={newOffer.price} onChange={e => setNewOffer({...newOffer, price: e.target.value})} />
                           </div>
                       </div>

                       <div className="pt-4">
                            <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700">Angebot erstellen</button>
                       </div>
                   </form>
               </div>
           </div>
       )}

       {/* --- MODAL: VERTRAG ERSTELLEN --- */}
       {showConvertModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                   <div className="text-center mb-6">
                       <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                           <FileText size={24} />
                       </div>
                       <h2 className="text-xl font-bold">Angebot annehmen</h2>
                       <p className="text-sm text-slate-500 mt-1">
                           Erstelle einen Vertrag für <strong>{showConvertModal.offerNumber}</strong>.
                       </p>
                   </div>

                   <form onSubmit={handleConvert} className="space-y-4">
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Welcher Service wird ausgeführt?</label>
                           <select 
                               className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none" 
                               value={convertData.serviceId} 
                               onChange={e => setConvertData({...convertData, serviceId: e.target.value})}
                               required
                           >
                               <option value="">Service wählen...</option>
                               {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                           </select>
                           <p className="text-xs text-slate-400 mt-1">Bestimmt Dauer & Preisberechnung für Jobs.</p>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Intervall</label>
                               <select 
                                   className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none" 
                                   value={convertData.interval} 
                                   onChange={e => setConvertData({...convertData, interval: e.target.value})}
                               >
                                   <option value="WEEKLY">Wöchentlich</option>
                                   <option value="BIWEEKLY">Alle 2 Wochen</option>
                                   <option value="MONTHLY">Monatlich</option>
                               </select>
                           </div>
                           
                           <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Startdatum</label>
                               <div className="relative">
                                   <input 
                                       type="date" 
                                       className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                       value={convertData.startDate}
                                       onChange={e => setConvertData({...convertData, startDate: e.target.value})}
                                       required
                                   />
                               </div>
                           </div>
                       </div>

                       <div className="pt-2 flex gap-3">
                           <button type="button" onClick={() => setShowConvertModal(null)} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition">Abbrechen</button>
                           <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200">Vertrag erstellen</button>
                       </div>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
}