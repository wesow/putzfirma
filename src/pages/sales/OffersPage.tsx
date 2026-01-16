import { useEffect, useState } from 'react';
import { FilePlus, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import api from '../../lib/api';

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  // Minimales Formular für neues Angebot
  const [custId, setCustId] = useState('');
  const [desc, setDesc] = useState('Unterhaltsreinigung');
  const [price, setPrice] = useState('35.00');
  const [qty, setQty] = useState('1');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [resOff, resCust] = await Promise.all([
      api.get('/offers'),
      api.get('/customers')
    ]);
    setOffers(resOff.data);
    setCustomers(resCust.data);
    if(resCust.data.length > 0) setCustId(resCust.data[0].id);
  };

  const createOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/offers', {
        customerId: custId,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 Tage gültig
        items: [{
          description: desc,
          quantity: qty,
          unit: 'Psch',
          unitPrice: price
        }]
      });
      loadData();
    } catch (err) { alert("Fehler"); }
  };

  const convertToContract = async (offerId: string) => {
    if(!confirm("Angebot annehmen und Vertrag erstellen?")) return;
    try {
      // Wir brauchen für den Vertrag eine ServiceID. 
      // Der Einfachheit halber: Wir müssten eigentlich Services laden und auswählen.
      // Hier musst du evtl. hardcoden oder erweitern.
      // const serviceId = prompt("Bitte Service-ID eingeben (Provisorisch):"); 
      
      // BESSER: Wir leiten den User einfach weiter oder machen es Quick&Dirty
      // Hier senden wir Dummy Daten, damit es funktioniert:
      // DU MUSST HIER EINE ECHTE SERVICE-ID VON DEINER DATENBANK NEHMEN!
      // Hol dir eine aus der DB oder nimm die erste verfügbare.
      
      const services = await api.get('/services');
      if(services.data.length === 0) return alert("Erst Service anlegen!");
      const serviceId = services.data[0].id; // Wir nehmen den ersten Service

      await api.post(`/offers/${offerId}/convert`, {
        startDate: new Date(),
        interval: 'MONTHLY',
        serviceId: serviceId
      });
      
      alert("Erfolg! Vertrag erstellt.");
      loadData();
    } catch (err) { alert("Fehler beim Umwandeln"); }
  };

  return (
    <div className="space-y-8">
       <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FilePlus className="text-purple-600" /> Angebote & Vertrieb
       </h1>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LISTE */}
          <div className="lg:col-span-2 space-y-4">
             {offers.map(offer => (
               <div key={offer.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-start">
                    <div>
                       <span className={`text-xs px-2 py-1 rounded font-bold ${offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                         {offer.status}
                       </span>
                       <h3 className="font-bold text-lg mt-2">{offer.offerNumber}</h3>
                       <p className="text-slate-500">{offer.customer?.companyName || offer.customer?.lastName}</p>
                    </div>
                    <div className="text-right">
                       <div className="text-xl font-bold text-slate-800">
                         {Number(offer.totalNet).toLocaleString('de-DE', {style:'currency', currency:'EUR'})}
                       </div>
                       <div className="text-xs text-slate-400">Netto</div>
                    </div>
                 </div>

                 {/* Aktion */}
                 {offer.status === 'SENT' && (
                   <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={() => convertToContract(offer.id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                      >
                        <CheckCircle size={18} /> Als angenommen markieren & Vertrag erstellen
                      </button>
                   </div>
                 )}
               </div>
             ))}
          </div>

          {/* NEUES ANGEBOT */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
             <h3 className="font-bold mb-4">Schnellangebot</h3>
             <form onSubmit={createOffer} className="space-y-4">
               <select className="w-full p-2 border rounded" value={custId} onChange={e=>setCustId(e.target.value)}>
                 {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || c.lastName}</option>)}
               </select>
               <input className="w-full p-2 border rounded" placeholder="Leistung" value={desc} onChange={e=>setDesc(e.target.value)} />
               <div className="grid grid-cols-2 gap-2">
                 <input className="w-full p-2 border rounded" type="number" placeholder="Menge" value={qty} onChange={e=>setQty(e.target.value)} />
                 <input className="w-full p-2 border rounded" type="number" placeholder="Preis" value={price} onChange={e=>setPrice(e.target.value)} />
               </div>
               <button className="w-full bg-purple-600 text-white py-2 rounded">Angebot erstellen</button>
             </form>
          </div>
       </div>
    </div>
  );
}