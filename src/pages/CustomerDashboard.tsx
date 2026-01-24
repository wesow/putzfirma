import { useEffect, useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Download, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

interface Job {
  id: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  service: { name: string };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  totalGross: number; 
  status: 'SENT' | 'PAID' | 'OVERDUE' | 'DRAFT' | 'CANCELLED';
}

export default function CustomerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const firstName = localStorage.getItem('firstName') || 'Kunde';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, invoicesRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/invoices')
      ]);
      setJobs(jobsRes.data);
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
      toast.error("Konnte Daten nicht laden.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (id: string, number: string) => {
      const toastId = toast.loading("Lade Rechnung...");
      try {
          const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Rechnung-${number}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          toast.success("Download gestartet", { id: toastId });
      } catch (e) {
          console.error(e);
          toast.error("Fehler beim Download", { id: toastId });
      }
  };

  const upcomingJobs = jobs
    .filter(j => ['SCHEDULED', 'IN_PROGRESS'].includes(j.status) && new Date(j.scheduledDate) >= new Date())
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const nextJob = upcomingJobs.length > 0 ? upcomingJobs[0] : null;

  if (loading) {
    return (
        <div className="p-8 animate-pulse space-y-8 min-h-screen flex items-center justify-center text-slate-400">
            <div className="flex flex-col items-center">
                <Loader2 className="animate-spin mb-2" size={32} />
                Lade Daten...
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Moin, {firstName}! 👋</h1>
            <p className="text-blue-100 opacity-90 font-medium">Hier ist Ihre persönliche Übersicht.</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LINKE SPALTE: TERMINE (2/3 Breite) */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* NÄCHSTER TERMIN */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <Calendar className="text-blue-600" size={20}/> Nächste Reinigung
                </h2>
                
                {nextJob ? (
                    <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden group hover:shadow-md transition">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-10 -mt-10 z-0 transition-transform group-hover:scale-110"></div>
                        
                        <div className="flex items-center gap-5 z-10 w-full sm:w-auto">
                            <div className="bg-blue-50 p-4 rounded-2xl text-center min-w-[90px] shadow-sm border border-blue-100 flex flex-col justify-center">
                                <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                                    {format(new Date(nextJob.scheduledDate), 'MMM', { locale: de })}
                                </div>
                                <div className="text-3xl font-extrabold text-slate-800 leading-none">
                                    {format(new Date(nextJob.scheduledDate), 'dd')}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">{nextJob.service.name}</h3>
                                <div className="flex items-center gap-2 text-slate-500 mt-1 font-medium text-sm">
                                    <Clock size={16} className="text-blue-400"/> 
                                    {format(new Date(nextJob.scheduledDate), 'HH:mm', { locale: de })} Uhr
                                </div>
                            </div>
                        </div>

                        <div className="z-10 w-full sm:w-auto flex justify-end">
                                {nextJob.status === 'IN_PROGRESS' ? (
                                    <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm animate-pulse">
                                        <Clock size={16} /> Läuft gerade
                                    </span>
                                ) : (
                                    <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm">
                                        <CheckCircle2 size={16} /> Geplant
                                    </span>
                                )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400">
                        <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <p className="font-medium">Aktuell stehen keine Termine an.</p>
                    </div>
                )}
            </div>

            {/* LISTE KOMMENDE TERMINE */}
            {upcomingJobs.length > 1 && (
                <div>
                    <h3 className="font-bold text-slate-700 mb-4 text-lg">Zukünftige Termine</h3>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {upcomingJobs.slice(1, 4).map(job => (
                            <div key={job.id} className="p-4 border-b border-slate-100 last:border-0 flex justify-between items-center hover:bg-slate-50 transition group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-100 transition">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">
                                            {format(new Date(job.scheduledDate), 'dd. MMMM yyyy', { locale: de })}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">{job.service.name}</p>
                                    </div>
                                </div>
                                <span className="text-slate-500 text-sm font-medium bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                                    {format(new Date(job.scheduledDate), 'HH:mm')}
                                </span>
                            </div>
                        ))}
                        {upcomingJobs.length > 4 && (
                            <div className="p-3 text-center bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wide cursor-pointer hover:bg-slate-100 hover:text-blue-600 transition">
                                + {upcomingJobs.length - 4} weitere anzeigen
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* RECHTE SPALTE: RECHNUNGEN (1/3 Breite) */}
        <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <FileText className="text-emerald-600" size={20}/> Rechnungen
            </h2>
            
            <div className="space-y-4">
                {invoices.length > 0 ? invoices.map(inv => (
                    <div key={inv.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition group relative hover:border-blue-200">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="font-bold text-slate-800 text-sm mb-1">{inv.invoiceNumber}</p>
                                <p className="text-xs text-slate-400 font-medium">
                                    {format(new Date(inv.date), 'dd.MM.yyyy')}
                                </p>
                            </div>
                            {/* Status Badges */}
                            {inv.status === 'PAID' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-bold border border-emerald-200">Bezahlt</span>}
                            {inv.status === 'SENT' && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-bold border border-amber-200">Offen</span>}
                            {inv.status === 'OVERDUE' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-lg font-bold border border-red-200">Überfällig</span>}
                        </div>
                        
                        <div className="flex justify-between items-end pt-2 border-t border-slate-50">
                            <p className="font-extrabold text-slate-900 text-lg">
                                {Number(inv.totalGross).toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}
                            </p>
                            <button 
                                onClick={() => handleDownloadInvoice(inv.id, inv.invoiceNumber)}
                                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition" 
                                title="Download PDF"
                            >
                                <Download size={20} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="bg-slate-50 p-8 rounded-2xl text-center text-slate-400 text-sm border-2 border-dashed border-slate-200">
                        <FileText size={32} className="mx-auto mb-2 opacity-50" />
                        Keine Rechnungen vorhanden.
                    </div>
                )}
            </div>
            
            {/* Info Box */}
            <div className="mt-8 bg-blue-50/80 p-5 rounded-2xl flex gap-4 text-blue-900 text-sm border border-blue-100 shadow-sm">
                <AlertCircle size={24} className="shrink-0 text-blue-600" />
                <div>
                    <p className="font-bold mb-1">Fragen zur Abrechnung?</p>
                    <p className="text-blue-800/80 leading-relaxed">Unser Team hilft Ihnen gerne weiter unter <a href="mailto:buchhaltung@cleanops.de" className="underline hover:text-blue-600">buchhaltung@cleanops.de</a></p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}