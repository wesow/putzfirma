import { useEffect, useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Download, 
  AlertCircle
} from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Job {
  id: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  service: { name: string };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  totalGross: number;
  status: 'SENT' | 'PAID' | 'OVERDUE';
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
      // Wir laden Jobs und Rechnungen parallel
      const [jobsRes, invoicesRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/invoices')
      ]);
      setJobs(jobsRes.data);
      setInvoices(invoicesRes.data);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (id: string, number: string) => {
      try {
          const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Rechnung-${number}.pdf`);
          document.body.appendChild(link);
          link.click();
      } catch (e) {
          alert("Fehler beim Download");
      }
  };

  // Logik für "Nächster Termin" (der erste Job in der Zukunft)
  // Wir sortieren sicherheitshalber nochmal nach Datum
  const upcomingJobs = jobs
    .filter(j => j.status === 'SCHEDULED' && new Date(j.scheduledDate) > new Date())
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const nextJob = upcomingJobs.length > 0 ? upcomingJobs[0] : null;

  if (loading) return <div className="p-10 text-center text-slate-500">Lade Ihre Daten...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Willkommen zurück, {firstName}! 👋</h1>
        <p className="text-blue-100 opacity-90">Hier ist Ihre Übersicht über Termine und Finanzen.</p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LINKE SPALTE: TERMINE (2/3 Breite) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* NÄCHSTER TERMIN */}
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="text-blue-600"/> Nächste Reinigung
            </h2>
            
            {nextJob ? (
                <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-4 rounded-2xl text-center min-w-[80px]">
                            <div className="text-sm text-blue-600 font-bold uppercase">
                                {format(new Date(nextJob.scheduledDate), 'MMM', { locale: de })}
                            </div>
                            <div className="text-3xl font-bold text-slate-800">
                                {format(new Date(nextJob.scheduledDate), 'dd')}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">{nextJob.service.name}</h3>
                            <div className="flex items-center gap-2 text-slate-500 mt-1">
                                <Clock size={16}/> 
                                {/* HIER WAR DER FEHLER: Jetzt 'HH:mm' statt 'HZ' */}
                                {format(new Date(nextJob.scheduledDate), 'HH:mm', { locale: de })} Uhr
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold">
                        Geplant
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
                    Aktuell stehen keine Termine an.
                </div>
            )}

            {/* KOMMENDE TERMINE LISTE */}
            <h3 className="font-bold text-slate-700 mt-8">Weitere Termine</h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {upcomingJobs.slice(1, 5).map(job => (
                    <div key={job.id} className="p-4 border-b border-slate-100 last:border-0 flex justify-between items-center hover:bg-slate-50 transition">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div>
                                <p className="font-medium text-slate-800">
                                    {format(new Date(job.scheduledDate), 'dd. MMMM yyyy', { locale: de })}
                                </p>
                                <p className="text-xs text-slate-500">{job.service.name}</p>
                            </div>
                        </div>
                        <span className="text-slate-400 text-sm">{format(new Date(job.scheduledDate), 'HH:mm')} Uhr</span>
                    </div>
                ))}
                {upcomingJobs.length <= 1 && (
                    <div className="p-4 text-sm text-slate-400 italic">Keine weiteren Termine geplant.</div>
                )}
            </div>
        </div>

        {/* RECHTE SPALTE: RECHNUNGEN (1/3 Breite) */}
        <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                <FileText className="text-green-600"/> Rechnungen
            </h2>
            
            <div className="space-y-3">
                {invoices.length > 0 ? invoices.map(inv => (
                    <div key={inv.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-slate-800">{inv.invoiceNumber}</p>
                                <p className="text-xs text-slate-500">
                                    {format(new Date(inv.date), 'dd.MM.yyyy')}
                                </p>
                            </div>
                            {inv.status === 'PAID' 
                                ? <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Bezahlt</span>
                                : <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Offen</span>
                            }
                        </div>
                        
                        <div className="flex justify-between items-end mt-3">
                            <p className="font-bold text-slate-900">
                                {Number(inv.totalGross).toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}
                            </p>
                            <button 
                                onClick={() => handleDownloadInvoice(inv.id, inv.invoiceNumber)}
                                className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition" 
                                title="Download PDF"
                            >
                                <Download size={18} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="bg-slate-50 p-6 rounded-xl text-center text-slate-500 text-sm">
                        Keine Rechnungen vorhanden.
                    </div>
                )}
            </div>
            
            {/* Info Box */}
            <div className="mt-6 bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
                <AlertCircle size={20} className="shrink-0" />
                <p>Fragen zur Abrechnung? Kontaktieren Sie uns unter buchhaltung@cleanops.de</p>
            </div>
        </div>

      </div>
    </div>
  );
}