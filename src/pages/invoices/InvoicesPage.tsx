import { useEffect, useState } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Info,
  Loader2,
  Clock,
  Send,
  History
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  totalGross: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  customer: {
    companyName: string | null;
    firstName: string;
    lastName: string;
    email?: string;
  };
  _count: { jobs: number };
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, custRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/customers')
      ]);
      setInvoices(invRes.data);
      setCustomers(custRes.data);
    } catch (error) {
      toast.error("Daten konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedCustomerId) return toast.error("Bitte wählen Sie zuerst einen Kunden!");
    
    setIsGenerating(true);
    const toastId = toast.loading("Rechnung wird erstellt...");

    try {
      await api.post('/invoices/generate', { customerId: selectedCustomerId });
      toast.success("Rechnung erfolgreich erstellt!", { id: toastId });
      setSelectedCustomerId(''); 
      fetchData(); 
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Fehler beim Erstellen.";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingId(invoiceId);
    const toastId = toast.loading("PDF wird generiert...");

    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rechnung_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Download gestartet", { id: toastId });
    } catch (error) {
      toast.error("Fehler beim Download.", { id: toastId });
    } finally {
        setDownloadingId(null);
    }
  };

  const handleSendEmail = async (invoiceId: string) => {
    if (!confirm("Rechnung jetzt verbindlich an den Kunden senden?")) return;

    setSendingId(invoiceId); 
    const toastId = toast.loading("E-Mail wird versendet...");

    try {
      await api.post(`/invoices/${invoiceId}/send`);
      toast.success("E-Mail wurde versendet! 📧", { id: toastId });
      fetchData(); 
    } catch (error) {
      toast.error("Fehler beim Versand.", { id: toastId });
    } finally {
      setSendingId(null); 
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': 
        return <span className="status-badge bg-emerald-50 text-emerald-700 border-emerald-100"><CheckCircle size={10}/> BEZAHLT</span>;
      case 'SENT': 
        return <span className="status-badge bg-blue-50 text-blue-700 border-blue-100"><Send size={10}/> VERSENDET</span>;
      case 'OVERDUE': 
        return <span className="status-badge bg-red-50 text-red-700 border-red-100"><AlertCircle size={10}/> ÜBERFÄLLIG</span>;
      default: 
        return <span className="status-badge bg-slate-50 text-slate-500 border-slate-200">ENTWURF</span>;
    }
  };

  return (
    <div className="page-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title leading-none">Rechnungs-Zentrale</h1>
          <p className="page-subtitle text-slate-500 mt-2 font-medium">Archivierung und automatisierte Abrechnung abgeschlossener Leistungen.</p>
        </div>
      </div>

      {/* RECHNUNGS-GENERATOR BOX */}
      <div className="form-card !bg-blue-50/40 !border-blue-100 shadow-xl shadow-blue-900/5 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="w-full md:flex-1 space-y-1.5">
            <label className="label-caps !text-blue-600 !ml-0">Empfänger für neuen Abrechnungslauf wählen</label>
            <div className="relative group">
                <select 
                  className="input-standard appearance-none cursor-pointer pr-10 pl-4 font-bold text-slate-700 border-blue-200 focus:border-blue-500 focus:ring-blue-500/10"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">-- Kundenstamm durchsuchen --</option>
                  {customers.map(c => (
                      <option key={c.id} value={c.id}>
                      {c.companyName || `${c.firstName} ${c.lastName}`}
                      </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-blue-500">
                  <Plus size={18} strokeWidth={3} />
                </div>
            </div>
          </div>
          <button 
            onClick={handleGenerateInvoice}
            disabled={isGenerating || !selectedCustomerId}
            className="btn-primary w-full md:w-auto py-3 px-10 shadow-xl shadow-blue-500/20 uppercase tracking-widest text-[10px] font-black"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            {isGenerating ? 'Wird erstellt...' : 'Rechnung generieren'}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-blue-100/50">
            <Info size={14} className="text-blue-500 shrink-0" />
            <p className="text-[10px] text-blue-800/70 font-black uppercase tracking-tight">
              Hinweis: Das System erfasst nur Aufträge mit dem Status <span className="text-blue-600">"Abgeschlossen"</span>.
            </p>
        </div>
      </div>

      {/* INVOICE ARCHIVE TABLE */}
      <div className="table-container shadow-xl shadow-slate-200/50 animate-in fade-in duration-700">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
               <History size={18} className="text-slate-400" />
               <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Rechnungsarchiv</h3>
            </div>
            <span className="status-badge bg-slate-100 text-slate-600 border-slate-200 font-black">
                {invoices.length} DOKUMENTE
            </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table-main">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Nr. / Referenz</th>
                <th className="table-cell">Auftraggeber</th>
                <th className="table-cell">Belegdatum</th>
                <th className="table-cell text-center">Leistungen</th>
                <th className="table-cell text-right">Bruttobetrag</th>
                <th className="table-cell text-center">Status</th>
                <th className="table-cell text-right">Export</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-24 text-center"><Loader2 className="animate-spin mx-auto mb-3 text-blue-600" size={40}/><span className="label-caps italic">Synchronisiere Belege...</span></td></tr>
              ) : invoices.length === 0 ? (
                <tr>
                    <td colSpan={7} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                            <FileText size={48} className="opacity-20" />
                            <p className="font-black uppercase tracking-widest text-xs">Keine Rechnungen im Archiv</p>
                        </div>
                    </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="table-row group">
                    <td className="table-cell">
                      <div className="font-black text-blue-600 text-sm tracking-tighter">#{inv.invoiceNumber}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">UID: {inv.id.split('-')[0]}</div>
                    </td>
                    <td className="table-cell">
                      <div className="font-black text-slate-800 text-sm truncate max-w-[200px]">
                        {inv.customer.companyName || `${inv.customer.firstName} ${inv.customer.lastName}`}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2 font-bold text-slate-500 text-xs whitespace-nowrap">
                        <Clock size={12} className="text-slate-300"/>
                        {formatDate(inv.date)}
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-black text-slate-600 border border-slate-200">
                        {inv._count?.jobs || 0} JOBS
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <span className="font-black text-slate-900 text-sm">
                        {Number(inv.totalGross).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        
                        <button 
                          onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                          disabled={!!downloadingId}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="PDF herunterladen"
                        >
                          {downloadingId === inv.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        </button>

                        <button 
                          onClick={() => handleSendEmail(inv.id)}
                          disabled={sendingId === inv.id}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="E-Mail Versand"
                        >
                          {sendingId === inv.id ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Hilfsfunktion für lokales Datum
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}