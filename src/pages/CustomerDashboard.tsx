import { useEffect, useState } from 'react';
import { 
  Calendar, FileText, MapPin, Phone, Mail, 
  ShieldCheck, Clock, User, CheckCircle, FileCheck 
} from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast'; // Für Feedback
import { useAuth } from '../context/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [nextJob, setNextJob] = useState<any>(null);
  const [openInvoices, setOpenInvoices] = useState<any[]>([]);
  
  // NEU: Offers State
  const [openOffers, setOpenOffers] = useState<any[]>([]); 
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      // 1. Profil
      const custRes = await api.get('/customers');
      const myProfile = custRes.data[0]; 
      setProfile(myProfile);

      if (myProfile) {
        // 2. Next Job
        const jobsRes = await api.get('/jobs?limit=1&status=SCHEDULED'); 
        setNextJob(jobsRes.data[0] || null);

        // 3. Invoices
        const invRes = await api.get('/invoices');
        const openInv = invRes.data.filter((i: any) => i.status === 'SENT' || i.status === 'OVERDUE');
        setOpenInvoices(openInv);

        // 4. OFFERS (NEU)
        const offRes = await api.get('/offers');
        // Wir zeigen dem Kunden nur "SENT" (Offen) oder "ACCEPTED" (schon angenommen) an
        const relevantOffers = offRes.data.filter((o: any) => o.status === 'SENT' || o.status === 'ACCEPTED');
        setOpenOffers(relevantOffers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
      if(!confirm("Möchten Sie dieses Angebot verbindlich annehmen?")) return;
      
      const toastId = toast.loading("Wird bestätigt...");
      try {
          await api.patch(`/offers/${offerId}/accept`);
          toast.success("Vielen Dank! Angebot angenommen.", { id: toastId });
          loadCustomerData(); // Daten neu laden
      } catch (e) {
          toast.error("Fehler beim Speichern.", { id: toastId });
      }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Lade Portal...</div>;
  if (!profile) return <div className="p-10 text-center">Profil nicht gefunden.</div>;

  return (
    <div className="page-container">
      
      {/* HEADER (Wie vorher) */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white mb-8 shadow-2xl relative overflow-hidden">
        {/* ... dein Header Code ... */}
        <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-4">
                <ShieldCheck size={12} /> Kunden-Portal
            </span>
            <h1 className="text-3xl md:text-4xl font-black mb-2">
                Hallo, {profile.companyName || profile.firstName}! 👋
            </h1>
            <p className="text-slate-400">Willkommen in Ihrer persönlichen Übersicht.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LINKS (2 Spalten breit) */}
        <div className="space-y-6 lg:col-span-2">
            
            {/* === NEU: ANGEBOTE SEKTION === */}
            {openOffers.length > 0 && (
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-emerald-100/50">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-slate-800 flex items-center gap-2">
                            <FileCheck className="text-emerald-600" size={20}/> Meine Angebote
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {openOffers.map((offer: any) => (
                            <div key={offer.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                        <span className="font-black text-slate-900 text-lg">#{offer.offerNumber}</span>
                                        {offer.status === 'ACCEPTED' 
                                            ? <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Angenommen</span>
                                            : <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Neu</span>
                                        }
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {offer.items[0]?.description} • {Number(offer.totalNet).toLocaleString('de-DE', {style:'currency', currency:'EUR'})} (Netto)
                                    </p>
                                </div>

                                {offer.status === 'SENT' ? (
                                    <button 
                                        onClick={() => handleAcceptOffer(offer.id)}
                                        className="btn-primary !bg-emerald-600 !border-emerald-700 shadow-lg shadow-emerald-200"
                                    >
                                        <CheckCircle size={18} /> Jetzt annehmen
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm">
                                        <CheckCircle size={18} /> Bestätigt
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* NEXT JOB CARD (Wie vorher) */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                {/* ... dein Next Job Code ... */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                        <Calendar className="text-blue-600" size={20}/> Nächster Termin
                    </h3>
                </div>
                {nextJob ? (
                    <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-50 rounded-2xl p-6">
                        <div className="text-center md:text-left bg-white p-4 rounded-xl shadow-sm border border-slate-100 min-w-[100px]">
                            <p className="text-xs text-slate-400 font-bold uppercase">Datum</p>
                            <p className="text-xl font-black text-slate-900">
                                {new Date(nextJob.scheduledDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                            </p>
                        </div>
                        <div className="flex-1 space-y-1 text-center md:text-left">
                            <h4 className="font-bold text-slate-900 text-lg">{nextJob.service?.name}</h4>
                            <p className="text-sm text-slate-500 flex items-center justify-center md:justify-start gap-2">
                                <MapPin size={14}/> {nextJob.address?.street}, {nextJob.address?.city}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-400 text-center py-4">Kein Termin geplant.</p>
                )}
            </div>

            {/* STAMMDATEN (Wie vorher) */}
            {/* ... */}
        </div>

        {/* RECHTS: Rechnungen (Wie vorher) */}
        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 h-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                        <FileText className="text-purple-600" size={20}/> Offene Posten
                    </h3>
                    {openInvoices.length > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">{openInvoices.length}</span>}
                </div>
                {/* ... Rechnungs Liste ... */}
                {openInvoices.length === 0 ? <p className="text-center text-slate-400 py-10">Alles bezahlt!</p> : (
                    <div className="space-y-3">
                        {openInvoices.map((inv: any) => (
                            <div key={inv.id} className="p-4 rounded-xl border border-slate-100">
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-800">#{inv.invoiceNumber}</span>
                                    <span className="font-black text-slate-900">{Number(inv.totalGross).toLocaleString('de-DE', {style:'currency', currency:'EUR'})}</span>
                                </div>
                                <div className="text-xs text-red-500 font-bold mt-1 uppercase">Zahlung ausstehend</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}