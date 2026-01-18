import { useEffect, useState } from 'react';
import { FileText, Plus, Download, CheckCircle, AlertCircle, Mail, RefreshCw, Info } from 'lucide-react';
import toast from 'react-hot-toast'; // Wir nutzen jetzt Toasts statt alerts!
import api from '../../lib/api';

// Typen definieren
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

  // Formular State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Action States
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
      toast.error("Konnte Daten nicht laden");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedCustomerId) return toast.error("Bitte wähle zuerst einen Kunden aus!");
    
    setIsGenerating(true);
    // Loading Toast anzeigen
    const toastId = toast.loading("Erstelle Rechnung...");

    try {
      await api.post('/invoices/generate', { customerId: selectedCustomerId });
      
      // Erfolgsmeldung
      toast.success("Rechnung erfolgreich erstellt!", { id: toastId });
      
      setSelectedCustomerId(''); 
      fetchData(); 
    } catch (error: any) {
      console.error(error);
      // HIER wird deine Backend-Nachricht ("Keine abrechenbaren Jobs...") angezeigt!
      toast.error(error.response?.data?.message || "Fehler beim Erstellen.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- PDF Download Funktion ---
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
      console.error("Download Fehler:", error);
      toast.error("Fehler beim Herunterladen.", { id: toastId });
    } finally {
        setDownloadingId(null);
    }
  };

  // --- E-Mail Senden Funktion ---
  const handleSendEmail = async (invoiceId: string) => {
    if (!confirm("Rechnung jetzt verbindlich an den Kunden senden?")) return;

    setSendingId(invoiceId); 
    const toastId = toast.loading("Sende E-Mail...");

    try {
      await api.post(`/invoices/${invoiceId}/send`);
      toast.success("E-Mail wurde versendet! 📧", { id: toastId });
      fetchData(); 
    } catch (error) {
      toast.error("Fehler beim Senden. Prüfe die Server-Logs.", { id: toastId });
    } finally {
      setSendingId(null); 
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold border border-green-200"><CheckCircle size={14}/> Bezahlt</span>;
      case 'SENT': return <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-bold border border-blue-200"><Mail size={14}/> Versendet</span>;
      case 'OVERDUE': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-bold border border-red-200"><AlertCircle size={14}/> Überfällig</span>;
      default: return <span className="text-slate-600 bg-slate-50 px-2 py-1 rounded text-xs font-bold border border-slate-200">Entwurf</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" /> 
            Rechnungen
          </h1>
          <p className="text-slate-500 text-sm">Erstelle Rechnungen basierend auf erledigten Jobs.</p>
        </div>
      </div>

      {/* --- GENERATOR BOX --- */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm bg-gradient-to-r from-blue-50/50 to-white">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-600" />
          Neue Rechnung generieren
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-1/2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kunde auswählen</label>
            <div className="relative">
                <select 
                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-blue-500 bg-white shadow-sm appearance-none cursor-pointer"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                <option value="">-- Bitte wählen --</option>
                {customers.map(c => (
                    <option key={c.id} value={c.id}>
                    {c.companyName || `${c.firstName} ${c.lastName}`}
                    </option>
                ))}
                </select>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <Info size={12} /> Nur Jobs mit Status "Erledigt" werden abgerechnet.
            </p>
          </div>
          <button 
            onClick={handleGenerateInvoice}
            disabled={isGenerating || !selectedCustomerId}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isGenerating ? <RefreshCw className="animate-spin" /> : <FileText size={20} />}
            {isGenerating ? 'Erstelle...' : 'Rechnung generieren'}
          </button>
        </div>
      </div>

      {/* --- LISTE --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <h3 className="font-bold text-slate-800">Rechnungsarchiv</h3>
           <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
             {invoices.length} Einträge
           </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Nr.</th>
                <th className="px-6 py-4">Kunde</th>
                <th className="px-6 py-4">Datum</th>
                <th className="px-6 py-4 text-center">Jobs</th>
                <th className="px-6 py-4 text-right">Betrag</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Lade Daten...</td></tr>
              ) : invoices.length === 0 ? (
                <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                            <FileText className="h-10 w-10 opacity-20" />
                            Noch keine Rechnungen erstellt.
                        </div>
                    </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 font-bold group-hover:text-blue-600 transition-colors">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {inv.customer.companyName || `${inv.customer.firstName} ${inv.customer.lastName}`}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(inv.date).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">{inv._count.jobs}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      {Number(inv.totalGross).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        
                        {/* DOWNLOAD BUTTON */}
                        <button 
                          onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                          disabled={!!downloadingId}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" 
                          title="PDF Herunterladen"
                        >
                          {downloadingId === inv.id ? <RefreshCw size={18} className="animate-spin text-blue-500"/> : <Download size={18} />}
                        </button>

                        {/* EMAIL BUTTON */}
                        <button 
                          onClick={() => handleSendEmail(inv.id)}
                          disabled={sendingId === inv.id}
                          className={`p-2 rounded-lg transition-colors border border-transparent ${
                            sendingId === inv.id 
                              ? 'text-purple-400 bg-purple-50 cursor-wait' 
                              : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-100'
                          }`}
                          title="Per E-Mail senden"
                        >
                          {sendingId === inv.id ? (
                            <RefreshCw size={18} className="animate-spin" />
                          ) : (
                            <Mail size={18} />
                          )}
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