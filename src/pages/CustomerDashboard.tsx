import {
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Download,
    Euro,
    FileCheck,
    FileText,
    ListTodo,
    Loader2,
    MapPin,
    QrCode,
    ShieldCheck,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function CustomerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [nextJob, setNextJob] = useState<any>(null);
  const [lastJobs, setLastJobs] = useState<any[]>([]); 
  const [openInvoices, setOpenInvoices] = useState<any[]>([]);
  const [openOffers, setOpenOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);
  const [showQrFor, setShowQrFor] = useState<string | null>(null);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      const custRes = await api.get('/customers');
      const myProfile = custRes.data[0]; 
      setProfile(myProfile);

      if (myProfile) {
        const [jobsRes, invRes, offRes] = await Promise.all([
            api.get('/jobs?limit=10&orderBy=scheduledDate:desc'),
            api.get('/invoices'),
            api.get('/offers')
        ]);

        const allJobs = jobsRes.data;
        // Nächsten geplanten Job finden
        setNextJob(allJobs.find((j: any) => j.status === 'SCHEDULED') || null);
        // Die letzten 3 erledigten Jobs filtern
        setLastJobs(allJobs.filter((j: any) => j.status === 'COMPLETED').slice(0, 3));

        // Rechnungen filtern (offene Posten)
        setOpenInvoices(invRes.data.filter((i: any) => i.status !== 'PAID' && i.status !== 'CANCELLED'));

        // Angebote filtern (SENT zum Annehmen, ACCEPTED zur Info)
        setOpenOffers(offRes.data.filter((o: any) => o.status === 'SENT' || o.status === 'ACCEPTED'));
      }
    } catch (e) {
      toast.error("Daten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
      if(!confirm("Möchten Sie dieses Angebot verbindlich annehmen und den Auftrag erteilen?")) return;
      const toastId = toast.loading("Übermittele Annahme...");
      try {
          await api.patch(`/offers/${offerId}/accept`); 
          toast.success("Vielen Dank! Der Auftrag wurde erteilt.", { id: toastId });
          loadCustomerData(); 
      } catch (e) {
          toast.error("Fehler bei der Übermittlung.", { id: toastId });
      }
  };

  const downloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rechnung_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      toast.error("PDF konnte nicht geladen werden.");
    }
  };

  const getGiroCodeUrl = (inv: any) => {
    const name = encodeURIComponent("GlanzOps Gebäudereinigung");
    const iban = "DE12345678901234567890"; // HIER DEINE IBAN EINTRAGEN
    const amount = Number(inv.totalGross).toFixed(2);
    const ref = encodeURIComponent(`${inv.invoiceNumber}`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BCD%0A001%0A1%0ASCT%0A%0A${name}%0A${iban}%0AEUR${amount}%0A%0A%0A${ref}`;
  };

  const translateInterval = (int: string) => {
    const map: Record<string, string> = { 'ONCE': 'Einmalig', 'WEEKLY': 'Wöchentlich', 'BIWEEKLY': '14-tägig', 'MONTHLY': 'Monatlich' };
    return map[int] || int;
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32}/></div>;
  if (!profile) return <div className="p-10 text-center text-slate-400 font-medium">Kein Kundenprofil gefunden.</div>;

  const billingAddress = profile.addresses?.find((a:any) => a.type === 'BILLING') || profile.addresses?.[0];

  return (
    <div className="page-container space-y-4 pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[140px]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck size={10} /> Kunden-Portal
            </span>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Hallo, {profile.companyName || profile.firstName}</h1>
            <p className="text-slate-400 text-xs font-medium">Willkommen in Ihrer persönlichen Übersicht.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* LINKS (HAUPTBEREICH) */}
        <div className="space-y-4 lg:col-span-2">
            
            {/* 1. ANGEBOTE (Detailliert) */}
            {openOffers.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-blue-50 rounded-md text-blue-600"><FileCheck size={16}/></div>
                        <h3 className="font-bold text-slate-800 text-sm">Offene Angebote</h3>
                    </div>
                    
                    <div className="space-y-3">
                        {openOffers.map((offer: any) => (
                            <div key={offer.id} className={`rounded-xl border transition-all overflow-hidden ${expandedOffer === offer.id ? 'border-blue-300 ring-4 ring-blue-50' : 'border-slate-100 bg-slate-50/50'}`}>
                                <div 
                                    className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                    onClick={() => setExpandedOffer(expandedOffer === offer.id ? null : offer.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-slate-900 text-sm">#{offer.offerNumber}</span>
                                                {offer.status === 'ACCEPTED' 
                                                    ? <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Angenommen</span>
                                                    : <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase animate-pulse">Offen</span>
                                                }
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Turnus: {translateInterval(offer.interval)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900">{Number(offer.totalNet).toLocaleString('de-DE', {style:'currency', currency:'EUR'})}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Summe Netto</p>
                                        </div>
                                        {expandedOffer === offer.id ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                                    </div>
                                </div>

                                {expandedOffer === offer.id && (
                                    <div className="border-t border-slate-200 bg-white p-5 animate-in slide-in-from-top-2 duration-300">
                                        <div className="mb-6">
                                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2"><Euro size={12}/> Leistungsumfang</h4>
                                            <div className="space-y-2">
                                                {offer.items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{item.description}</p>
                                                            <p className="text-[10px] text-slate-500">{item.quantity}x {item.unit || 'Psch'}</p>
                                                        </div>
                                                        <p className="text-xs font-black text-slate-700">{Number(item.totalPrice).toLocaleString('de-DE', {style:'currency', currency:'EUR'})}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {offer.checklist && offer.checklist.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2"><ListTodo size={12}/> Vereinbarte Aufgaben</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {offer.checklist.map((task: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 bg-white border border-slate-100 p-2 rounded-md">
                                                            <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                                                            <span>{task}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                                            {offer.status === 'SENT' ? (
                                                <button 
                                                    onClick={() => handleAcceptOffer(offer.id)}
                                                    className="btn-primary !bg-emerald-600 !border-emerald-700 w-full sm:w-auto shadow-lg shadow-emerald-600/20"
                                                >
                                                    <FileCheck size={16} className="mr-2" /> Kostenpflichtig annehmen & Auftrag starten
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
                                                    <ShieldCheck size={16} /> Dieses Angebot wurde bereits akzeptiert.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. NÄCHSTER TERMIN */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600"><Calendar size={16}/></div> Nächster Termin
                </h3>
                {nextJob ? (
                    <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="text-center min-w-[70px] bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                            <p className="text-lg font-black text-slate-900 leading-none mb-1">
                                {new Date(nextJob.scheduledDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(nextJob.scheduledDate).getFullYear()}</p>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{nextJob.service?.name}</h4>
                            <div className="flex flex-wrap gap-4 text-[11px] font-medium text-slate-500">
                                <span className="flex items-center gap-1.5"><MapPin size={12} className="text-indigo-500"/> {nextJob.address?.street}</span>
                                <span className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-500"/> ab 08:00 Uhr</span>
                            </div>
                        </div>
                    </div>
                ) : <p className="text-xs text-slate-400 italic py-4">Aktuell keine Termine geplant.</p>}
            </div>

            {/* 3. LETZTE EINSÄTZE */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600"><CheckCircle size={16}/></div> Letzte Einsätze
                </h3>
                <div className="space-y-2">
                    {lastJobs.length > 0 ? lastJobs.map((job: any) => (
                        <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle size={14}/></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">{job.service?.name}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(job.scheduledDate).toLocaleDateString('de-DE')}</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Erledigt</span>
                        </div>
                    )) : <p className="text-xs text-slate-400 italic">Noch keine Einsätze abgeschlossen.</p>}
                </div>
            </div>
        </div>

        {/* RECHTS (SIDEBAR) */}
        <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm mb-4">
                    <FileText className="text-purple-600" size={16}/> Rechnungen & Zahlung
                </h3>
                
                <div className="space-y-3">
                    {openInvoices.length === 0 ? (
                        <div className="py-6 text-center opacity-60">
                            <CheckCircle size={24} className="mx-auto text-emerald-500 mb-2" />
                            <p className="text-xs font-bold text-emerald-600 uppercase">Alles bezahlt!</p>
                        </div>
                    ) : openInvoices.map((inv: any) => (
                        <div key={inv.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-bold text-slate-900 text-xs block">#{inv.invoiceNumber}</span>
                                    <span className="text-[10px] text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className="font-black text-slate-900 text-sm">{Number(inv.totalGross).toLocaleString('de-DE', {style:'currency', currency:'EUR'})}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => downloadInvoice(inv.id, inv.invoiceNumber)} className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 text-[10px] font-bold py-2 rounded-lg border border-slate-200 hover:bg-slate-100"><Download size={12}/> PDF</button>
                                <button onClick={() => setShowQrFor(inv.id)} className="flex items-center justify-center gap-2 bg-blue-600 text-white text-[10px] font-bold py-2 rounded-lg shadow-md hover:bg-blue-700"><QrCode size={12}/> QR-Zahlung</button>
                            </div>

                            {showQrFor === inv.id && (
                                <div className="mt-4 p-4 bg-slate-900 rounded-xl text-center animate-in zoom-in-95">
                                    <p className="text-[9px] text-white font-bold uppercase mb-2 tracking-widest">GiroCode scannen</p>
                                    <div className="bg-white p-2 rounded-lg inline-block mb-2">
                                        <img src={getGiroCodeUrl(inv)} alt="QR Code" className="w-24 h-24" />
                                    </div>
                                    <p className="text-[8px] text-slate-400 leading-tight">Rechnungsnummer:<br/><b>{inv.invoiceNumber}</b></p>
                                    <button onClick={() => setShowQrFor(null)} className="text-[8px] text-blue-400 mt-2 font-bold uppercase">Schließen</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2"><User size={16}/> Stammdaten</h3>
                <div className="space-y-3 text-[11px]">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <label className="label-caps !text-slate-400">Rechnungsanschrift</label>
                        <p className="font-bold text-slate-700 mt-1">{billingAddress?.street}<br/>{billingAddress?.zipCode} {billingAddress?.city}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <label className="label-caps !text-slate-400">Kontakt</label>
                        <p className="font-bold text-slate-700 mt-1">{profile.email}</p>
                        {profile.phone && <p className="font-bold text-slate-700">{profile.phone}</p>}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}