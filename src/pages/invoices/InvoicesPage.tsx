import { useEffect, useState } from 'react';
import { 
  FileText, Plus, Download, CheckCircle, AlertCircle, Mail, Info, 
  Loader2, Clock, Send, History, Lock, FileCheck, ChevronRight,
  ShieldCheck, FileSearch
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

// --- TYPEN ---
interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  totalGross: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  isLocked: boolean;
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
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [finalizingId, setFinalizingId] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const requests = [api.get('/invoices')];
      if (isAdmin) requests.push(api.get('/customers'));

      const [invRes, custRes] = await Promise.all(requests);
      setInvoices(invRes.data);
      if (custRes) setCustomers(custRes.data);
    } catch (error) {
      toast.error("Daten konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedCustomerId) return toast.error("Bitte einen Kunden wählen");
    setIsGenerating(true);
    const toastId = toast.loading("Entwurf wird erstellt...");
    try {
      await api.post('/invoices/generate', { customerId: selectedCustomerId });
      toast.success("Entwurf erstellt", { id: toastId });
      setSelectedCustomerId(''); 
      fetchData(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Fehler", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalize = async (invoice: Invoice) => {
      if (!confirm(`Rechnung ${invoice.invoiceNumber} jetzt festschreiben?\n\nDanach sind keine Änderungen mehr möglich (GoBD-konform).`)) return;
      setFinalizingId(invoice.id);
      const toastId = toast.loading("Wird festgeschrieben...");
      try {
          await api.post(`/invoices/${invoice.id}/finalize`);
          toast.success("Rechnung gesperrt & gültig", { id: toastId });
          fetchData();
      } catch (error: any) {
          toast.error("Fehler beim Festschreiben", { id: toastId });
      } finally {
          setFinalizingId(null);
      }
  };

  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string, isDraft: boolean) => {
    setDownloadingId(invoiceId);
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rechnung_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download gestartet");
    } catch (error) {
      toast.error("Download fehlgeschlagen");
    } finally {
        setDownloadingId(null);
    }
  };

  const handleSendEmail = async (invoiceId: string) => {
    if (!confirm("Rechnung jetzt verbindlich per E-Mail versenden?")) return;
    setSendingId(invoiceId); 
    const toastId = toast.loading("E-Mail wird versendet...");
    try {
      await api.post(`/invoices/${invoiceId}/send`);
      toast.success("Versand erfolgreich", { id: toastId });
      fetchData(); 
    } catch (error) {
      toast.error("Versand fehlgeschlagen", { id: toastId });
    } finally {
      setSendingId(null); 
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="status-badge bg-slate-50 text-slate-500 border-slate-200 border-dashed">Entwurf</span>;
      case 'PAID': 
        return <span className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100">Bezahlt</span>;
      case 'SENT': 
        return <span className="status-badge bg-blue-50 text-blue-600 border-blue-100">Offen</span>;
      case 'OVERDUE': 
        return <span className="status-badge bg-red-50 text-red-600 border-red-100">Überfällig</span>;
      default: 
        return <span className="status-badge bg-slate-50 text-slate-500 border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="page-container">
      
      {/* --- HEADER --- */}
      <div className="header-section">
        <div>
          <h1 className="page-title">{isAdmin ? "Rechnungs-Zentrale" : "Meine Belege"}</h1>
          <p className="page-subtitle">{isAdmin ? "Automatisierte Abrechnung und GoBD-Archiv." : "Übersicht Ihrer Rechnungen und Zahlungsstatus."}</p>
        </div>
        
        {isAdmin && (
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>GoBD KONFORM</span>
            </div>
        )}
      </div>

      {/* --- GENERATOR BOX --- */}
      {isAdmin && (
        <div className="form-card mb-4 !border-blue-100 !bg-blue-50/30">
          <div className="form-section-title !mb-3">
             <FileSearch size={14} className="text-blue-500" /> Neue Abrechnung erstellen
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="label-caps">Debitor / Kunde wählen</label>
              <select 
                className="input-standard font-bold"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Kundenstamm durchsuchen --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || `${c.lastName}, ${c.firstName}`}
                  </option>
                ))}
              </select>
            </div>
            <button 
                onClick={handleGenerateInvoice}
                disabled={isGenerating || !selectedCustomerId}
                className="btn-primary min-w-[200px] h-[34px]"
            >
                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                {isGenerating ? 'Wird erstellt...' : 'Entwurf generieren'}
            </button>
          </div>
          
          <div className="flex items-center gap-2 mt-3 text-[10px] text-blue-600/70 font-medium italic">
            <Info size={12} />
            <span>Erstellte Entwürfe können vor der Festschreibung noch geprüft werden.</span>
          </div>
        </div>
      )}

      {/* --- INVOICE TABLE --- */}
      <div className="table-container animate-in fade-in duration-500">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
            <div className="flex items-center gap-2">
                <History size={14} className="text-slate-400" />
                <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Rechnungsarchiv</h3>
            </div>
            <span className="status-badge bg-slate-50 text-slate-500 border-slate-200">
                {invoices.length} Belege
            </span>
        </div>
        
        <div className="flex-1 custom-scrollbar overflow-y-auto min-h-[400px]">
          <table className="table-main">
            <thead className="table-head">
              <tr>
                <th className="table-cell pl-4">Belegnummer</th>
                {isAdmin && <th className="table-cell">Empfänger</th>}
                <th className="table-cell">Datum</th>
                <th className="table-cell text-center">Pos.</th>
                <th className="table-cell text-right">Betrag Brutto</th>
                <th className="table-cell text-center">Status</th>
                <th className="table-cell text-right pr-4">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={24}/></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className="py-20 text-center text-slate-400 font-medium">Keine Belege gefunden</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="table-row group">
                    <td className="table-cell pl-4 align-middle">
                      <div className="font-bold text-blue-600 text-sm">#{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {inv.id.substring(0, 8)}</div>
                    </td>
                    
                    {isAdmin && (
                      <td className="table-cell align-middle">
                        <div className="font-bold text-slate-700 truncate max-w-[180px]">
                            {inv.customer.companyName || `${inv.customer.firstName} ${inv.customer.lastName}`}
                        </div>
                      </td>
                    )}

                    <td className="table-cell align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <CalendarIcon size={12} className="text-slate-300"/>
                        {new Date(inv.date).toLocaleDateString('de-DE')}
                      </div>
                    </td>
                    <td className="table-cell text-center align-middle">
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                        {inv._count?.jobs || 0}
                      </span>
                    </td>
                    <td className="table-cell text-right align-middle">
                      <span className="font-black text-slate-900 text-[13px]">
                        {Number(inv.totalGross).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </td>
                    <td className="table-cell text-center align-middle">
                      {getStatusBadge(inv.status)}
                    </td>
                    
                    <td className="table-cell text-right pr-4 align-middle">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        
                        {/* Download/Vorschau */}
                        <button 
                          onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber, inv.status === 'DRAFT')}
                          disabled={!!downloadingId}
                          className="btn-icon-only"
                          title={inv.status === 'DRAFT' ? "Vorschau" : "PDF Laden"}
                        >
                          {downloadingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        </button>

                        {/* GoBD Lock (Festschreiben) */}
                        {isAdmin && inv.status === 'DRAFT' && (
                          <button 
                            onClick={() => handleFinalize(inv)}
                            disabled={!!finalizingId}
                            className="btn-icon-only text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                            title="Festschreiben"
                          >
                            {finalizingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                          </button>
                        )}

                        {/* E-Mail Versand */}
                        {isAdmin && inv.status !== 'DRAFT' && (
                          <button 
                            onClick={() => handleSendEmail(inv.id)}
                            disabled={sendingId === inv.id}
                            className="btn-icon-only text-blue-500 hover:bg-blue-50"
                            title="E-Mail senden"
                          >
                            {sendingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          </button>
                        )}
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

// Helper für Icon (da Calendar in lucide-react existiert, aber oft anders importiert wird)
function CalendarIcon({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
        </svg>
    );
}