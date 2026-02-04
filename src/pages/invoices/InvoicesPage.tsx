import {
  Building2,
  Calendar as CalendarIcon,
  Download,
  FileSearch,
  History,
  Info,
  Loader2,
  Lock,
  Plus,
  Search,
  Send,
  ShieldCheck,
  XCircle // <--- NEU: Icon für Stornieren
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

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

interface BillableCustomer {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  _count?: { jobs: number }; // Anzahl der abrechenbaren Jobs
}

export default function InvoicesPage() {
  const { user } = useAuth();
  
  // States
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billableCustomers, setBillableCustomers] = useState<BillableCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Loading States für Actions
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [finalizingId, setFinalizingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null); // <--- NEU

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info' | 'success';
    confirmText: string;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'info', confirmText: 'OK' });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      // 1. Lade IMMER alle Rechnungen
      const requests = [api.get('/invoices')];
      
      // 2. Wenn Admin: Lade zusätzlich NUR Kunden mit offenen Jobs für das Dropdown
      if (isAdmin) {
          requests.push(api.get('/customers?billable=true'));
      }

      const [invRes, custRes] = await Promise.all(requests);
      setInvoices(invRes.data);
      
      if (custRes) {
          setBillableCustomers(custRes.data);
      }
    } catch (error) {
      toast.error("Daten konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedCustomerId) return toast.error("Bitte einen Kunden wählen");
    setIsGenerating(true);
    const toastId = toast.loading("Erstelle Rechnung...");
    try {
      await api.post('/invoices/generate', { customerId: selectedCustomerId });
      toast.success("Entwurf erfolgreich erstellt", { id: toastId });
      setSelectedCustomerId(''); 
      setCustomerSearch(''); // Reset Search
      fetchData(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Fehler", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const executeFinalize = async (invoice: Invoice) => {
      setFinalizingId(invoice.id);
      const toastId = toast.loading("GoBD Festschreibung...");
      try {
          await api.post(`/invoices/${invoice.id}/finalize`);
          toast.success("Rechnung festgeschrieben", { id: toastId });
          fetchData();
      } catch (error: any) {
          toast.error("Fehler beim Festschreiben", { id: toastId });
      } finally {
          setFinalizingId(null);
      }
  };

  const executeSendEmail = async (invoiceId: string) => {
    setSendingId(invoiceId); 
    const toastId = toast.loading("Sende E-Mail...");
    try {
      await api.post(`/invoices/${invoiceId}/send`);
      toast.success("Erfolgreich versendet", { id: toastId });
      fetchData(); 
    } catch (error) {
      toast.error("Versand fehlgeschlagen", { id: toastId });
    } finally {
      setSendingId(null); 
    }
  };

  // --- NEU: STORNIEREN ---
  const executeCancel = async (invoiceId: string) => {
      setCancellingId(invoiceId);
      const toastId = toast.loading("Storniere Rechnung...");
      try {
          await api.post(`/invoices/${invoiceId}/cancel`);
          toast.success("Rechnung storniert & Jobs freigegeben", { id: toastId });
          fetchData();
      } catch (error: any) {
          toast.error(error.response?.data?.message || "Fehler beim Stornieren", { id: toastId });
      } finally {
          setCancellingId(null);
      }
  };

  // --- ACTIONS (UI) ---
  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingId(invoiceId);
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      const safeFileName = invoiceNumber.replace(/[\/\\]/g, '-'); 

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rechnung_${safeFileName}.pdf`);
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

  const openFinalizeConfirm = (invoice: Invoice) => {
    setConfirmConfig({
      isOpen: true,
      title: "Rechnung festschreiben?",
      message: `Die Rechnung ${invoice.invoiceNumber} wird unwiderruflich gesperrt (GoBD). Änderungen sind danach nicht mehr möglich.`,
      variant: 'warning',
      confirmText: 'Jetzt festschreiben',
      onConfirm: () => executeFinalize(invoice)
    });
  };

  const openSendConfirm = (invoice: Invoice) => {
    setConfirmConfig({
      isOpen: true,
      title: "Rechnung versenden?",
      message: `Soll die Rechnung ${invoice.invoiceNumber} jetzt an den Kunden gesendet werden?`,
      variant: 'info',
      confirmText: 'Senden',
      onConfirm: () => executeSendEmail(invoice.id)
    });
  };

  // --- NEU: STORNO CONFIRM ---
  const openCancelConfirm = (invoice: Invoice) => {
    setConfirmConfig({
      isOpen: true,
      title: "Rechnung stornieren?",
      message: `Möchten Sie die Rechnung ${invoice.invoiceNumber} wirklich stornieren? Die zugehörigen Jobs werden wieder freigegeben und können neu abgerechnet werden.`,
      variant: 'danger',
      confirmText: 'Ja, stornieren',
      onConfirm: () => executeCancel(invoice.id)
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
        'DRAFT': 'bg-slate-100 text-slate-500 border-slate-200',
        'SENT': 'bg-blue-50 text-blue-600 border-blue-100',
        'PAID': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'OVERDUE': 'bg-red-50 text-red-600 border-red-100',
        'CANCELLED': 'bg-gray-100 text-gray-400 border-gray-200 strike-through'
    };
    const labels = {
        'DRAFT': 'Entwurf',
        'SENT': 'Offen',
        'PAID': 'Bezahlt',
        'OVERDUE': 'Überfällig',
        'CANCELLED': 'Storniert'
    };
    const style = styles[status as keyof typeof styles] || styles['DRAFT'];
    const label = labels[status as keyof typeof labels] || status;

    return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${style}`}>{label}</span>;
  };

  const filteredBillableCustomers = billableCustomers.filter(c => {
      const search = customerSearch.toLowerCase();
      return (
          c.lastName.toLowerCase().includes(search) ||
          c.firstName.toLowerCase().includes(search) ||
          (c.companyName && c.companyName.toLowerCase().includes(search))
      );
  });

  return (
    <div className="page-container">
      
      {/* --- HEADER --- */}
      <div className="header-section">
        <div>
          <h1 className="page-title">{isAdmin ? "Rechnungs-Zentrale" : "Meine Belege"}</h1>
          <p className="page-subtitle">{isAdmin ? "Verwaltung und Erstellung von Abrechnungen." : "Übersicht Ihrer Rechnungen."}</p>
        </div>
        
        {isAdmin && (
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <ShieldCheck size={12} />
                <span>GoBD KONFORM</span>
            </div>
        )}
      </div>

      {/* --- GENERATOR BOX (Nur Admin) --- */}
      {isAdmin && (
        <div className="form-card mb-6 !border-indigo-100 !bg-indigo-50/30">
          <div className="form-section-title !mb-3 !text-indigo-700">
             <FileSearch size={14} /> Neue Abrechnung erstellen
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="label-caps !text-indigo-600 mb-1.5">Kunde mit offenen Leistungen wählen</label>
              
              <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-indigo-400">
                      <Search size={16} />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        placeholder="Filter..." 
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="input-standard pl-10 h-8 text-xs border-indigo-200 mb-1"
                      />
                      
                      <div className="relative">
                          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                          <select 
                            className="input-standard pl-10 font-bold cursor-pointer border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200"
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                          >
                            <option value="">
                                {billableCustomers.length > 0 ? "-- Bitte wählen --" : "-- Keine offenen Posten --"}
                            </option>
                            {filteredBillableCustomers.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.companyName || `${c.lastName}, ${c.firstName}`} 
                                {c._count?.jobs ? ` (${c._count.jobs} offene Jobs)` : ''}
                              </option>
                            ))}
                          </select>
                      </div>
                  </div>
              </div>

              {billableCustomers.length === 0 && (
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Info size={10}/> Aktuell gibt es keine erledigten Jobs, die abgerechnet werden müssen.</p>
              )}
            </div>
            <button 
                onClick={handleGenerateInvoice}
                disabled={isGenerating || !selectedCustomerId}
                className="btn-primary min-w-[200px] h-[42px] bg-indigo-600 hover:bg-indigo-700 border-indigo-600 shadow-indigo-200 disabled:opacity-50 disabled:shadow-none mb-[1px]"
            >
                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                {isGenerating ? 'Erstelle...' : 'Rechnung generieren'}
            </button>
          </div>
        </div>
      )}

      {/* --- INVOICE TABLE --- */}
      <div className="table-container animate-in fade-in duration-500">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
            <div className="flex items-center gap-2">
                <History size={14} className="text-slate-400" />
                <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Archiv</h3>
            </div>
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                {invoices.length} Einträge
            </span>
        </div>
        
        <div className="flex-1 custom-scrollbar overflow-y-auto min-h-[400px]">
          <table className="table-main">
            <thead className="table-head">
              <tr>
                <th className="table-cell pl-4 text-left">Nr.</th>
                {isAdmin && <th className="table-cell text-left">Kunde</th>}
                <th className="table-cell text-left">Datum</th>
                <th className="table-cell text-center">Jobs</th>
                <th className="table-cell text-right">Betrag</th>
                <th className="table-cell text-center">Status</th>
                <th className="table-cell text-right pr-4">Optionen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={24}/></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className="py-20 text-center text-slate-400 font-medium">Keine Rechnungen vorhanden</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="table-row group">
                    <td className="table-cell pl-4 align-middle text-left">
                      <div className="font-bold text-slate-700 text-xs">#{inv.invoiceNumber}</div>
                    </td>
                    
                    {isAdmin && (
                      <td className="table-cell align-middle text-left">
                        <div className="font-medium text-slate-700 truncate max-w-[180px] text-xs">
                            {inv.customer.companyName || `${inv.customer.firstName} ${inv.customer.lastName}`}
                        </div>
                      </td>
                    )}

                    <td className="table-cell align-middle text-left whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <CalendarIcon size={10} className="text-slate-300"/>
                        {new Date(inv.date).toLocaleDateString('de-DE')}
                      </div>
                    </td>
                    <td className="table-cell text-center align-middle">
                      <span className="text-slate-400 text-[10px] font-mono">
                        {inv._count?.jobs || 0}
                      </span>
                    </td>
                    <td className="table-cell text-right align-middle">
                      <span className="font-bold text-slate-900 text-[12px]">
                        {Number(inv.totalGross).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </td>
                    <td className="table-cell text-center align-middle">
                      {getStatusBadge(inv.status)}
                    </td>
                    
                    <td className="table-cell text-right pr-4 align-middle">
                      <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-all">
                        
                        <button 
                          onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                          disabled={!!downloadingId}
                          className="btn-icon-only"
                          title="PDF Anzeigen"
                        >
                          {downloadingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        </button>

                        {isAdmin && inv.status === 'DRAFT' && (
                          <button 
                            onClick={() => openFinalizeConfirm(inv)}
                            disabled={!!finalizingId}
                            className="btn-icon-only text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                            title="Festschreiben (GoBD)"
                          >
                            {finalizingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                          </button>
                        )}

                        {isAdmin && inv.status !== 'DRAFT' && (
                          <button 
                            onClick={() => openSendConfirm(inv)}
                            disabled={sendingId === inv.id}
                            className="btn-icon-only text-blue-500 hover:bg-blue-50"
                            title="Per E-Mail senden"
                          >
                            {sendingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          </button>
                        )}

                        {/* --- NEU: STORNIEREN BUTTON --- */}
                        {isAdmin && inv.status !== 'CANCELLED' && inv.status !== 'PAID' && (
                            <button 
                              onClick={() => openCancelConfirm(inv)}
                              disabled={!!cancellingId}
                              className="btn-icon-only text-red-400 hover:text-red-600 hover:bg-red-50"
                              title="Rechnung stornieren"
                            >
                              {cancellingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
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

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        confirmText={confirmConfig.confirmText}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}