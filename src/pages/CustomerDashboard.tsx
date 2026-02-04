import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    FileCheck,
    FileText,
    Loader2,
    Mail,
    MapPin, Phone,
    ShieldCheck,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function CustomerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [nextJob, setNextJob] = useState<any>(null);
  const [openInvoices, setOpenInvoices] = useState<any[]>([]);
  const [openOffers, setOpenOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
            api.get('/jobs?limit=1&status=SCHEDULED'),
            api.get('/invoices'),
            api.get('/offers')
        ]);

        setNextJob(jobsRes.data[0] || null);

        const openInv = invRes.data.filter((i: any) => i.status === 'SENT' || i.status === 'OVERDUE' || i.status === 'REMINDER_1' || i.status === 'REMINDER_2');
        setOpenInvoices(openInv);

        const relevantOffers = offRes.data.filter((o: any) => o.status === 'SENT' || o.status === 'ACCEPTED');
        setOpenOffers(relevantOffers);
      }
    } catch (e) {
      toast.error("Daten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
      if(!confirm("Möchten Sie dieses Angebot verbindlich annehmen?")) return;
      const toastId = toast.loading("Sende Bestätigung...");
      try {
          await api.patch(`/offers/${offerId}/accept`); 
          toast.success("Auftrag erteilt!", { id: toastId });
          loadCustomerData(); 
      } catch (e) {
          toast.error("Fehler bei der Übermittlung.", { id: toastId });
      }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32}/></div>;
  if (!profile) return <div className="p-10 text-center text-slate-400 font-medium">Kein Kundenprofil gefunden.</div>;

  const billingAddress = profile.addresses?.find((a:any) => a.type === 'BILLING') || profile.addresses?.[0];

  return (
    <div className="page-container space-y-4">
      
      {/* HEADER SECTION (Compact) */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[140px]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck size={10} /> Kunden-Portal
            </span>
            <h1 className="text-2xl font-bold tracking-tight mb-1">
                Hallo, {profile.companyName || profile.firstName}
            </h1>
            <p className="text-slate-400 text-xs font-medium">Willkommen in Ihrer persönlichen Übersicht.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* LINKS (HAUPTBEREICH) */}
        <div className="space-y-4 lg:col-span-2">
            
            {/* 1. ANGEBOTE */}
            {openOffers.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-blue-50 rounded-md text-blue-600"><FileCheck size={16}/></div>
                        <h3 className="font-bold text-slate-800 text-sm">Meine Angebote</h3>
                    </div>
                    <div className="space-y-3">
                        {openOffers.map((offer: any) => (
                            <div key={offer.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-blue-200 transition-all">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-900 text-sm">#{offer.offerNumber}</span>
                                        {offer.status === 'ACCEPTED' 
                                            ? <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Angenommen</span>
                                            : <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide animate-pulse">Offen</span>
                                        }
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium mb-1">
                                        {offer.items[0]?.description}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                                        Volumen: {Number(offer.totalNet).toLocaleString('de-DE', {style:'currency', currency:'EUR'})} (Netto)
                                    </p>
                                </div>

                                {offer.status === 'SENT' ? (
                                    <button 
                                        onClick={() => handleAcceptOffer(offer.id)}
                                        className="btn-primary !py-2 !px-3 !bg-emerald-600 !border-emerald-700 shadow-sm text-[11px]"
                                    >
                                        <CheckCircle size={14} className="mr-1.5" /> Kostenpflichtig annehmen
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-white px-3 py-1.5 rounded-md border border-emerald-100">
                                        <CheckCircle size={14} /> In Bearbeitung
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. NÄCHSTER TERMIN */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600"><Calendar size={16}/></div>
                        <h3 className="font-bold text-slate-800 text-sm">Nächster Termin</h3>
                    </div>
                </div>
                
                {nextJob ? (
                    <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-4 border border-slate-100 relative z-10">
                        <div className="text-center min-w-[70px] bg-white p-2 rounded-md border border-slate-100 shadow-sm">
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Datum</p>
                            <p className="text-lg font-bold text-slate-900 leading-none my-0.5">
                                {new Date(nextJob.scheduledDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500">{new Date(nextJob.scheduledDate).getFullYear()}</p>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{nextJob.service?.name}</h4>
                            <div className="flex flex-wrap gap-3 text-[11px] font-medium text-slate-500">
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} className="text-indigo-500"/> 
                                    {nextJob.address?.street}, {nextJob.address?.city}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={12} className="text-indigo-500"/> 
                                    ab 08:00 Uhr
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <Calendar className="mx-auto text-slate-300 mb-2" size={24} />
                        <p className="text-slate-400 font-bold text-xs">Aktuell keine Termine geplant.</p>
                    </div>
                )}
            </div>

            {/* 3. STAMMDATEN (Read Only) */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-slate-100 rounded-md text-slate-500"><User size={16}/></div>
                    <h3 className="font-bold text-slate-800 text-sm">Meine Stammdaten</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label-caps">Anschrift</label>
                        <div className="font-medium text-[12px] text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-2">
                            <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                            <span>
                                {billingAddress?.street}<br/>
                                {billingAddress?.zipCode} {billingAddress?.city}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="label-caps">Kontakt</label>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                            <p className="font-medium text-[12px] text-slate-700 flex items-center gap-2">
                                <Mail size={14} className="text-slate-400 shrink-0" /> {profile.email}
                            </p>
                            {profile.phone && (
                                <p className="font-medium text-[12px] text-slate-700 flex items-center gap-2">
                                    <Phone size={14} className="text-slate-400 shrink-0" /> {profile.phone}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* RECHTS (SIDEBAR) */}
        <div className="space-y-4">
            
            {/* RECHNUNGEN */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                        <FileText className="text-purple-600" size={16}/> Offene Posten
                    </h3>
                    {openInvoices.length > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-[10px] font-bold">{openInvoices.length}</span>}
                </div>
                
                {openInvoices.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-2 opacity-60">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                            <CheckCircle size={20} />
                        </div>
                        <p className="text-xs font-bold text-emerald-600">Alles bezahlt!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {openInvoices.map((inv: any) => (
                            <div key={inv.id} className="p-3 rounded-lg border border-slate-100 bg-white hover:border-red-200 transition-all group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-slate-700 text-xs">#{inv.invoiceNumber}</span>
                                    <span className="font-bold text-slate-900 text-xs">{Number(inv.totalGross).toLocaleString('de-DE', {style:'currency', currency:'EUR'})}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                    <span className="text-[10px] font-medium text-slate-400">{new Date(inv.dueDate).toLocaleDateString()}</span>
                                    {inv.status === 'OVERDUE' || inv.status.includes('REMINDER') ? (
                                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                                            <AlertCircle size={10} /> Überfällig
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wide">Offen</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* KONTAKT CARD */}
            <div className="bg-slate-900 rounded-xl p-5 text-white text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="font-bold text-sm mb-1">Hilfe benötigt?</h4>
                    <p className="text-slate-400 text-[11px] mb-3">Unser Support ist für Sie da.</p>
                    <a href="mailto:support@glanzops.de" className="inline-flex items-center justify-center gap-2 w-full bg-white text-slate-900 font-bold text-[11px] py-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <Mail size={14} /> E-Mail schreiben
                    </a>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}