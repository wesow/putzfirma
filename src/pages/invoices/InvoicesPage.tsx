import {
  Building2,
  Calendar as CalendarIcon,
  Download,
  FileSearch,
  FileText,
  History,
  Loader2,
  Lock,
  Plus,
  Search,
  Send,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
// KORREKTUR 1: "import type" verwenden
import type { Invoice } from '../../types';

// Hilfstyp für die Kundenauswahl (Select)
interface BillableCustomer {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  _count?: { jobs: number };
}

export default function InvoicesPage() {
  const { user } = useAuth();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billableCustomers, setBillableCustomers] = useState<BillableCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  // KORREKTUR 2: Typ-sicheres Promise Handling
  const fetchData = async () => {
    try {
      // Wir definieren die Promises explizit
      const invoicePromise = api.get<Invoice[]>('/invoices');
      const customerPromise = isAdmin ? api.get<BillableCustomer[]>('/customers?billable=true') : Promise.resolve(null);

      // Jetzt weiß TS genau, was an welcher Stelle zurückkommt
      const [invRes, custRes] = await Promise.all([invoicePromise, customerPromise]);

      setInvoices(invRes.data);
      
      // custRes kann null sein, aber wenn es Daten hat, sind es sicher BillableCustomer[]
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
      toast.success("Rechnung erfolgreich erstellt", { id: toastId });
      setSelectedCustomerId(''); 
      setCustomerSearch('');
      fetchData(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Fehler beim Erstellen", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const executeLock = async (invoice: Invoice) => {
      setLockingId(invoice.id);
      const toastId = toast.loading("GoBD Festschreibung...");
      try {
          await api.post(`/invoices/${invoice.id}/lock`);
          toast.success("Rechnung festgeschrieben", { id: toastId });
          fetchData();
      } catch (error: any) {
          toast.error(error.response?.data?.message || "Fehler beim Festschreiben", { id: toastId });
      } finally {
          setLockingId(null);
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

  const executeCancel = async (invoiceId: string) => {
      setCancellingId(invoiceId);
      const toastId = toast.loading("Storniere Rechnung...");
      try {
          await api.post(`/invoices/${invoiceId}/cancel`);
          toast.success("Rechnung storniert", { id: toastId });
          fetchData();
      } catch (error: any) {
          toast.error(error.response?.data?.message || "Fehler beim Stornieren", { id: toastId });
      } finally {
          setCancellingId(null);
      }
  };

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
      toast.error("PDF konnte nicht geladen werden");
    } finally {
        setDownloadingId(null);
    }
  };

  const openLockConfirm = (invoice: Invoice) => {
    setConfirmConfig({
      isOpen: true,
      title: "Rechnung festschreiben?",
      message: `Die Rechnung ${invoice.invoiceNumber} wird unwiderruflich gesperrt (GoBD). Änderungen sind danach nicht mehr möglich.`,
      variant: 'warning',
      confirmText: 'Jetzt festschreiben',
      onConfirm: () => executeLock(invoice)
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

  const openCancelConfirm = (invoice: Invoice) => {
    setConfirmConfig({
      isOpen: true,
      title: "Rechnung stornieren?",
      message: `Möchten Sie die Rechnung ${invoice.invoiceNumber} wirklich stornieren? Die zugehörigen Jobs werden wieder freigegeben.`,
      variant: 'danger',
      confirmText: 'Ja, stornieren',
      onConfirm: () => executeCancel(invoice.id)
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
        'DRAFT': 'bg-slate-100 text-slate-500 border-slate-200',
        'SENT': 'bg-blue-50 text-blue-600 border-blue-100',
        'PAID': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'OVERDUE': 'bg-red-50 text-red-600 border-red-100',
        'CANCELLED': 'bg-gray-100 text-gray-400 border-gray-200 line-through'
    };
    const labels: Record<string, string> = {
        'DRAFT': 'Entwurf',
        'SENT': 'Offen',
        'PAID': 'Bezahlt',
        'OVERDUE': 'Überfällig',
        'REMINDER_1': 'Mahnung 1',
        'REMINDER_2': 'Mahnung 2',
        'CANCELLED': 'Storniert'
    };
    const style = styles[status] || styles['DRAFT'];
    const label = labels[status] || status;
    return <span className={`status-badge !text-[9px] ${style}`}>{label}</span>;
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
    <div className="page-container pb-safe">
      
      {/* --- HEADER --- */}
      <div className="header-section flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div>
          <h1 className="page-title">{isAdmin ? "Rechnungs-Zentrale" : "Meine Belege"}</h1>
          <p className="page-subtitle">{isAdmin ? "Verwaltung und GoBD-konforme Erstellung." : "Übersicht Ihrer Abrechnungen."}</p>
        </div>
        
        {isAdmin && (
            <div className="hidden md:flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 uppercase tracking-widest shrink-0">
                <ShieldCheck size={14} />
                <span>GoBD Konform</span>
            </div>
        )}
      </div>

      {/* --- GENERATOR BOX (Nur Admin) --- */}
      {isAdmin && (
        <div className="form-card mb-6 !border-blue-100 !bg-blue-50/20 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="form-section-title !mb-4 !text-blue-700">
             <FileSearch size={14} /> Abrechnungslauf starten
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-3">
              <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-sm">
                <div className="relative mb-2 group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"/>
                    <input 
                      type="text" 
                      placeholder="Kunde suchen..." 
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-lg py-1.5 pl-9 text-[12px] font-bold focus:ring-0"
                    />
                </div>
                <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                    <select 
                      className="input-standard pl-10 font-bold cursor-pointer !py-2 !text-[12px]"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                      <option value="">
                          {billableCustomers.length > 0 ? "-- Auftraggeber wählen --" : "-- Keine offenen Jobs --"}
                      </option>
                      {filteredBillableCustomers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.companyName || `${c.lastName}, ${c.firstName}`} 
                          {c._count?.jobs ? ` (${c._count.jobs} Jobs)` : ''}
                        </option>
                      ))}
                    </select>
                </div>
              </div>
            </div>
            <button 
                onClick={handleGenerateInvoice}
                disabled={isGenerating || !selectedCustomerId}
                className="btn-primary w-full md:w-auto h-[44px] px-8 bg-blue-600 shadow-blue-200 uppercase tracking-widest font-black text-[11px]"
            >
                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                {isGenerating ? 'Wird erstellt' : 'Generieren'}
            </button>
          </div>
        </div>
      )}

      {/* --- INVOICE TABLE --- */}
      <div className="table-container flex flex-col h-[600px] animate-in fade-in duration-500 pb-20 sm:pb-0">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
            <div className="flex items-center gap-2">
                <div className="stat-icon-box icon-info"><History size={14} /></div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Beleg-Archiv</h3>
            </div>
            <span className="status-badge bg-slate-50 text-slate-400 border-slate-200 !text-[8px]">
                {invoices.length} POSITIONEN
            </span>
        </div>
        
        <div className="flex-1 custom-scrollbar overflow-y-auto bg-white">
          <table className="table-main w-full">
            <thead className="table-head sticky top-0 z-10 bg-white">
              <tr>
                <th className="table-cell">Nr.</th>
                {isAdmin && <th className="table-cell">Kunde</th>}
                <th className="table-cell">Datum</th>
                <th className="table-cell text-center">Jobs</th>
                <th className="table-cell text-right">Betrag</th>
                <th className="table-cell text-center">Status</th>
                <th className="table-cell text-right pr-4">Optionen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={32}/> <span className="label-caps">Lade Belege...</span></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest"><FileText size={32} className="mx-auto mb-2 opacity-20" />Keine Rechnungen vorhanden</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="table-row group">
                    <td className="table-cell align-middle font-black text-slate-900 text-[12px]">
                        <div className="flex items-center gap-1.5">
                            {/* KORREKTUR 3: Tooltip-Wrapper für das Icon */}
                            {inv.isLocked && (
                                <span title="GoBD Festgeschrieben">
                                    <Lock size={10} className="text-amber-500"/>
                                </span>
                            )}
                            #{inv.invoiceNumber}
                        </div>
                    </td>
                    
                    {isAdmin && (
                      <td className="table-cell align-middle text-left min-w-[150px]">
                        <div className="font-bold text-slate-700 truncate text-[12px]">
                            {inv.customer.companyName || `${inv.customer.firstName} ${inv.customer.lastName}`}
                        </div>
                      </td>
                    )}

                    <td className="table-cell align-middle whitespace-nowrap font-bold text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon size={12} className="text-slate-300"/>
                        {new Date(inv.date).toLocaleDateString('de-DE')}
                      </div>
                    </td>
                    <td className="table-cell text-center align-middle">
                      <span className="text-slate-400 text-[10px] font-black">
                        {(inv as any)._count?.jobs || 0}
                      </span>
                    </td>
                    <td className="table-cell text-right align-middle">
                      <span className="font-black text-slate-900 text-[12px]">
                        {Number(inv.totalGross).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </td>
                    <td className="table-cell text-center align-middle">
                      {getStatusBadge(inv.status)}
                    </td>
                    
                    <td className="table-cell text-right pr-4 align-middle">
                      <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-all">
                        {/* 1. PDF DOWNLOAD */}
                        <button onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)} disabled={!!downloadingId} className="btn-icon-only" title="PDF">
                          {downloadingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        </button>
                        
                        {/* 2. FESTSCHREIBEN */}
                        {isAdmin && !inv.isLocked && inv.status === 'DRAFT' && (
                          <button onClick={() => openLockConfirm(inv)} disabled={!!lockingId} className="btn-icon-only text-amber-500 hover:bg-amber-50" title="Sperren">
                            {lockingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                          </button>
                        )}
                        
                        {/* 3. SENDEN */}
                        {isAdmin && inv.status !== 'DRAFT' && inv.status !== 'CANCELLED' && (
                          <button onClick={() => openSendConfirm(inv)} disabled={sendingId === inv.id} className="btn-icon-only text-blue-500 hover:bg-blue-50" title="Mail">
                            {sendingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          </button>
                        )}
                        
                        {/* 4. STORNO */}
                        {isAdmin && inv.status !== 'CANCELLED' && (
                            <button onClick={() => openCancelConfirm(inv)} disabled={!!cancellingId} className="btn-icon-only text-slate-300 hover:text-red-600 hover:bg-red-50" title="Storno">
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