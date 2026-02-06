import {
    ArrowRight,
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
    User,
    X
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
      // Wenn der User Rolle "CUSTOMER" hat, gibt das Backend nur ihn selbst zurück
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
        // Finde den nächsten geplanten Job (der in der Zukunft liegt)
        const now = new Date();
        const futureJobs = allJobs.filter((j: any) => new Date(j.scheduledDate) >= now && j.status === 'SCHEDULED');
        setNextJob(futureJobs[0] || null);

        // Letzte erledigte Jobs
        setLastJobs(allJobs.filter((j: any) => j.status === 'COMPLETED').slice(0, 3));
        
        // Offene Rechnungen
        setOpenInvoices(invRes.data.filter((i: any) => i.status !== 'PAID' && i.status !== 'CANCELLED'));
        
        // Offene Angebote (die der Kunde sehen darf)
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
          // Neuer Endpunkt im Backend: PATCH /offers/:id/accept
          await api.patch(`/offers/${offerId}/accept`); 
          toast.success("Vielen Dank! Der Auftrag wurde erteilt.", { id: toastId });
          loadCustomerData(); // Neu laden, um Status zu aktualisieren
      } catch (e) {
          toast.error("Fehler bei der Übermittlung.", { id: toastId });
      }
  };

  const downloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    const toastId = toast.loading("Lade PDF...");
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const safeFileName = invoiceNumber.replace(/[\/\\]/g, '-');
      link.href = url;
      link.setAttribute('download', `Rechnung_${safeFileName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download gestartet", { id: toastId });
    } catch (e) {
      toast.error("PDF konnte nicht geladen werden.", { id: toastId });
    }
  };

  // Generiert einen echten GiroCode für Banking-Apps
  const getGiroCodeUrl = (inv: any) => {
    const name = encodeURIComponent("GlanzOps Gebäudereinigung"); // Anpassen auf deinen Firmennamen
    const iban = "DE12345678901234567890"; // DEINE IBAN HIER EINTRAGEN!
    const bic = "GENODED1XXX"; // OPTIONAL: DEINE BIC
    const amount = Number(inv.totalGross).toFixed(2);
    const ref = encodeURIComponent(`Rechnung ${inv.invoiceNumber}`);
    
    // EPC-QR-Code Standard Format
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BCD%0A002%0A1%0ASCT%0A${bic}%0A${name}%0A${iban}%0AEUR${amount}%0A%0A%0A${ref}`;
  };

  const translateInterval = (int: string) => {
    const map: Record<string, string> = { 'ONCE': 'Einmalig', 'WEEKLY': 'Wöchentlich', 'BIWEEKLY': '14-tägig', 'MONTHLY': 'Monatlich' };
    return map[int] || int;
  };

  if (loading) return (
    <div className="page-container flex items-center justify-center h-[80vh]">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
    </div>
  );

  if (!profile) return <div className="page-container text-center pt-20">Keine Kundendaten gefunden.</div>;

  const billingAddress = profile.addresses?.find((a:any) => a.type === 'BILLING') || profile.addresses?.[0];

  return (
    <div className="page-container pb-safe">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[140px] mb-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-3">
                <ShieldCheck size={12} /> Kunden-Portal
            </span>
            <h1 className="text-2xl font-black tracking-tight mb-1">Hallo, {profile.companyName || profile.firstName}</h1>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Ihre Service-Übersicht</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* MAIN CONTENT AREA (Left) */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* OFFENE ANGEBOTE */}
            {openOffers.length > 0 && (
                <div className="chart-container !p-0 border-blue-200 shadow-blue-100">
                    <div className="px-4 py-3 border-b border-blue-50 flex items-center gap-2 bg-blue-50/30">
                        <div className="stat-icon-box bg-blue-100 text-blue-600"><FileCheck size={14}/></div>
                        <h3 className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Offene Angebote - Bitte prüfen</h3>
                    </div>
                    
                    <div className="p-3 space-y-3">
                        {openOffers.map((offer: any) => (
                            <div key={offer.id} className={`rounded-lg border transition-all overflow-hidden ${expandedOffer === offer.id ? 'border-blue-400 shadow-md ring-1 ring-blue-100' : 'border-slate-100 bg-white'}`}>
                                <div 
                                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                    onClick={() => setExpandedOffer(expandedOffer === offer.id ? null : offer.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="stat-icon-wrapper bg-blue-50 text-blue-600 border-blue-100"><FileText size={16} /></div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 text-[12px]">Angebot #{offer.offerNumber}</span>
                                                {offer.status === 'ACCEPTED' 
                                                    ? <span className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100">Angenommen</span>
                                                    : <span className="status-badge bg-blue-600 text-white border-none animate-pulse">Neu</span>
                                                }
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{translateInterval(offer.interval)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-black text-slate-900">{Number(offer.totalNet).toLocaleString('de-DE', {style:'currency', currency:'EUR'})}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Netto</p>
                                        </div>
                                        {expandedOffer === offer.id ? <ChevronUp size={16} className="text-slate-300"/> : <ChevronDown size={16} className="text-slate-300"/>}
                                    </div>
                                </div>

                                {expandedOffer === offer.id && (
                                    <div className="border-t border-slate-100 bg-slate-50/30 p-4 animate-in slide-in-from-top-2 duration-300">
                                            <div className="mb-4">
                                                <h4 className="label-caps !ml-0 mb-2 flex items-center gap-2"><Euro size={12}/> Posten</h4>
                                                <div className="space-y-1.5">
                                                    {offer.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center p-2 rounded-md bg-white border border-slate-100">
                                                            <div>
                                                                <p className="text-[11px] font-bold text-slate-800">{item.description}</p>
                                                                <p className="text-[9px] text-slate-400">{item.quantity} {item.unit || 'Stk.'}</p>
                                                            </div>
                                                            <p className="text-[11px] font-black text-slate-700">{Number(item.totalPrice).toLocaleString('de-DE', {style:'currency', currency:'EUR'})}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {offer.checklist && offer.checklist.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="label-caps !ml-0 mb-2 flex items-center gap-2"><ListTodo size={12}/> Aufgaben</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                        {offer.checklist.map((task: string, idx: number) => (
                                                            <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-600 bg-white border border-slate-50 p-1.5 rounded-md">
                                                                <CheckCircle size={10} className="text-emerald-500 shrink-0" />
                                                                <span>{task}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-3 border-t border-slate-200 flex justify-end">
                                                {offer.status === 'SENT' ? (
                                                    <button 
                                                        onClick={() => handleAcceptOffer(offer.id)}
                                                        className="btn-primary !bg-emerald-600 !border-emerald-700 w-full sm:w-auto shadow-lg shadow-emerald-600/20 uppercase tracking-widest text-[10px]"
                                                    >
                                                        Kostenpflichtig annehmen <ArrowRight size={14} className="ml-2" />
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                        <ShieldCheck size={14} /> Bereits akzeptiert
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NÄCHSTER TERMIN */}
                <div className="chart-container !p-0">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <div className="stat-icon-box icon-info"><Calendar size={14}/></div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nächster Termin</h3>
                    </div>
                    <div className="p-4">
                        {nextJob ? (
                            <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                <div className="text-center bg-white p-2 rounded-md border border-slate-100 shadow-sm min-w-[60px]">
                                    <p className="text-lg font-black text-slate-900 leading-none">
                                        {new Date(nextJob.scheduledDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(nextJob.scheduledDate).getFullYear()}</p>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 text-xs truncate">{nextJob.service?.name}</h4>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><MapPin size={10} className="text-indigo-500"/> {nextJob.address?.street}</span>
                                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500"><Clock size={10} className="text-indigo-500"/> ab 08:00 Uhr</span>
                                    </div>
                                </div>
                            </div>
                        ) : <p className="text-[11px] text-slate-400 italic text-center py-6">Keine Termine geplant.</p>}
                    </div>
                </div>

                {/* LETZTE EINSÄTZE */}
                <div className="chart-container !p-0">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                        <div className="stat-icon-box icon-success"><CheckCircle size={14}/></div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Letzte Einsätze</h3>
                    </div>
                    <div className="p-3 space-y-2">
                        {lastJobs.length > 0 ? lastJobs.map((job: any) => (
                            <div key={job.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><CheckCircle size={12}/></div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-slate-800 truncate">{job.service?.name}</p>
                                        <p className="text-[9px] text-slate-400 font-medium">{new Date(job.scheduledDate).toLocaleDateString('de-DE')}</p>
                                    </div>
                                </div>
                                <span className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100 !text-[8px]">OK</span>
                            </div>
                        )) : <p className="text-[11px] text-slate-400 italic text-center py-6">Noch keine Einsätze.</p>}
                    </div>
                </div>
            </div>
        </div>

        {/* SIDEBAR (Right) */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* RECHNUNGEN & ZAHLUNG */}
            <div className="chart-container !p-0">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                    <div className="stat-icon-box icon-purple"><Euro size={14}/></div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Offene Posten</h3>
                </div>
                
                <div className="p-3 space-y-3">
                    {openInvoices.length === 0 ? (
                        <div className="py-8 text-center bg-emerald-50/30 rounded-lg border border-dashed border-emerald-100">
                            <CheckCircle size={20} className="mx-auto text-emerald-400 mb-2" />
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Alles bezahlt</p>
                        </div>
                    ) : openInvoices.map((inv: any) => (
                        <div key={inv.id} className="p-3 rounded-lg border border-slate-100 bg-white shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-bold text-slate-900 text-[11px] block">#{inv.invoiceNumber}</span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(inv.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className="font-black text-slate-900 text-sm">{Number(inv.totalGross).toLocaleString('de-DE', {style:'currency', currency:'EUR'})}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => downloadInvoice(inv.id, inv.invoiceNumber)} className="btn-secondary !p-2 !text-[9px] flex items-center justify-center gap-2"><Download size={12}/> PDF</button>
                                <button onClick={() => setShowQrFor(inv.id)} className="btn-primary !p-2 !text-[9px] flex items-center justify-center gap-2"><QrCode size={12}/> ZAHLEN</button>
                            </div>

                            {showQrFor === inv.id && (
                                <div className="mt-3 p-4 bg-slate-900 rounded-lg text-center animate-in zoom-in-95 duration-200 relative">
                                    <button onClick={() => setShowQrFor(null)} className="absolute top-2 right-2 text-slate-500 hover:text-white"><X size={14}/></button>
                                    <p className="text-[8px] text-blue-400 font-bold uppercase mb-2 tracking-[0.2em]">GiroCode scannen</p>
                                    <div className="bg-white p-2 rounded-md inline-block shadow-lg">
                                        {/* Echter API Call für den QR-Code */}
                                        <img src={getGiroCodeUrl(inv)} alt="QR Code" className="w-20 h-20" />
                                    </div>
                                    <p className="text-[8px] text-slate-400 mt-2 font-medium">Betreff: {inv.invoiceNumber}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* STAMMDATEN CARD */}
            <div className="form-card !p-0">
                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={14}/> Mein Profil</h3>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="label-caps !text-slate-400 !ml-0 mb-1.5">Rechnungsanschrift</label>
                        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 text-[11px] font-bold text-slate-700 leading-relaxed">
                            {billingAddress?.street}<br/>
                            {billingAddress?.zipCode} {billingAddress?.city}
                        </div>
                    </div>
                    <div>
                        <label className="label-caps !text-slate-400 !ml-0 mb-1.5">Kontakt</label>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-700">{profile.email}</p>
                            {profile.phone && <p className="text-[11px] font-bold text-slate-700">{profile.phone}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}