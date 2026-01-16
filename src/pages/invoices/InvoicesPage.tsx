import { useEffect, useState } from 'react';
// NEU: Mail und RefreshCw (Lade-Spinner) hinzugefügt
import { FileText, Plus, Download, CheckCircle, Clock, AlertCircle, Mail, RefreshCw } from 'lucide-react';
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
    email?: string; // Optional: Email für Anzeige prüfen
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

  // Für das "Rechnung erstellen" Formular
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // NEU: State für den E-Mail Versand (welcher Button lädt gerade?)
  const [sendingId, setSendingId] = useState<string | null>(null);

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedCustomerId) return alert("Bitte wähle einen Kunden aus!");
    
    setIsGenerating(true);
    try {
      await api.post('/invoices/generate', { customerId: selectedCustomerId });
      alert("Rechnung erfolgreich erstellt!");
      setSelectedCustomerId(''); // Auswahl zurücksetzen
      fetchData(); // Liste neu laden
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Fehler beim Erstellen.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- PDF Download Funktion ---
  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
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

    } catch (error) {
      console.error("Download Fehler:", error);
      alert("Fehler beim Herunterladen des PDFs.");
    }
  };

  // --- NEU: E-Mail Senden Funktion ---
  const handleSendEmail = async (invoiceId: string) => {
    if (!confirm("Rechnung jetzt per E-Mail an den Kunden senden?")) return;

    setSendingId(invoiceId); // Spinner starten
    try {
      await api.post(`/invoices/${invoiceId}/send`);
      alert("E-Mail wurde erfolgreich versendet! 📧");
      fetchData(); // Aktualisieren, damit Status auf SENT springt
    } catch (error) {
      console.error("E-Mail Fehler:", error);
      alert("Fehler beim Senden der E-Mail. Prüfe die Server-Logs.");
    } finally {
      setSendingId(null); // Spinner stoppen
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold"><CheckCircle size={14}/> Bezahlt</span>;
      case 'SENT': return <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-bold"><Mail size={14}/> Versendet</span>;
      case 'OVERDUE': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-bold"><AlertCircle size={14}/> Überfällig</span>;
      default: return <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs font-bold">Entwurf</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" /> 
            Rechnungen
          </h1>
          <p className="text-slate-500">Erstelle und verwalte deine Rechnungen</p>
        </div>
      </div>

      {/* --- GENERATOR BOX --- */}
      <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm bg-gradient-to-r from-white to-blue-50/50">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-600" />
          Neue Rechnung generieren
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-1/2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Kunde auswählen</label>
            <select 
              className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-white"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">-- Wähle einen Kunden --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.companyName || `${c.firstName} ${c.lastName}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Es werden nur erledigte Jobs abgerechnet.</p>
          </div>
          <button 
            onClick={handleGenerateInvoice}
            disabled={isGenerating || !selectedCustomerId}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isGenerating ? 'Erstelle...' : 'Rechnung jetzt erstellen'}
          </button>
        </div>
      </div>

      {/* --- LISTE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
           <h3 className="font-bold text-lg text-slate-800">Rechnungsarchiv</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Nr.</th>
                <th className="px-6 py-4">Kunde</th>
                <th className="px-6 py-4">Datum</th>
                <th className="px-6 py-4 text-center">Jobs</th>
                <th className="px-6 py-4 text-right">Betrag (Brutto)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Lade Daten...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">Noch keine Rechnungen erstellt.</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 font-bold">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {inv.customer.companyName || `${inv.customer.firstName} ${inv.customer.lastName}`}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {new Date(inv.date).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs">{inv._count.jobs}</span>
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
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" 
                          title="PDF Herunterladen"
                        >
                          <Download size={18} />
                        </button>

                        {/* NEU: EMAIL BUTTON */}
                        <button 
                          onClick={() => handleSendEmail(inv.id)}
                          disabled={sendingId === inv.id}
                          className={`p-2 rounded-full transition-colors ${
                            sendingId === inv.id 
                              ? 'text-purple-400 bg-purple-50 cursor-wait' 
                              : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'
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