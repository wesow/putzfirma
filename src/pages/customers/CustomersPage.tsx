import {
  AlertCircle,
  Archive,
  CheckCircle,
  ChevronRight,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';
import ViewSwitcher from '../../components/ViewSwitcher';
import api from '../../lib/api';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  userId: string | null;
  iban?: string;
  isActive: boolean;
  addresses: { id: string; street: string; city: string; zipCode: string; }[];
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [showArchived, setShowArchived] = useState(false);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string; invoices?: string[] }>({ 
    isOpen: false, 
    id: '', 
    name: '' 
  });
  const [archiveModal, setArchiveModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });
  const [restoreModal, setRestoreModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  useEffect(() => { 
    fetchCustomers(); 
  }, [showArchived]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?archived=${showArchived}`);
      setCustomers(res.data);
    } catch (e) { 
      toast.error('Fehler beim Laden der Kundenstamm-Daten.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const confirmArchive = async () => {
    const tid = toast.loading('Kunde wird archiviert...');
    try {
      await api.patch(`/customers/${archiveModal.id}/archive`);
      setCustomers(prev => prev.filter(c => c.id !== archiveModal.id));
      toast.success('Kunde archiviert', { id: tid });
      setArchiveModal({ isOpen: false, id: '', name: '' });
    } catch {
      toast.error('Fehler beim Archivieren', { id: tid });
    }
  };

  const confirmRestore = async () => {
    const tid = toast.loading('Kunde wird reaktiviert...');
    try {
      await api.patch(`/customers/${restoreModal.id}/restore`);
      setCustomers(prev => prev.filter(c => c.id !== restoreModal.id));
      toast.success('Kunde wieder aktiv', { id: tid });
      setRestoreModal({ isOpen: false, id: '', name: '' });
    } catch {
      toast.error('Fehler bei Reaktivierung', { id: tid });
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const tid = toast.loading('Lösche Kunde...');
    try {
      await api.delete(`/customers/${deleteModal.id}`);
      setCustomers(prev => prev.filter(c => c.id !== deleteModal.id));
      toast.success('Kunde gelöscht', { id: tid });
      setDeleteModal({ isOpen: false, id: '', name: '' });
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.invoices) {
        toast.dismiss(tid);
        setDeleteModal(prev => ({ ...prev, invoices: error.response.data.invoices }));
      } else {
        toast.error('Fehler beim Löschen', { id: tid });
      }
    }
  };

  const handleGenerateInvoice = async (customerId: string) => {
    const toastId = toast.loading('Prüfe Jobs...');
    try {
      const genRes = await api.post('/invoices/generate', { customerId });
      const invoice = genRes.data; 
      const pdfRes = await api.get(`/invoices/${invoice.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rechnung-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Rechnung ${invoice.invoiceNumber} erstellt!`, { id: toastId });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Keine fertigen Jobs gefunden.", { id: toastId });
    }
  };

  const filtered = customers.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container pb-safe">
      <div className="header-section flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div>
          <h1 className="page-title">{showArchived ? 'Kunden-Archiv' : 'Kunden-Verwaltung'}</h1>
          <p className="page-subtitle">Verwaltung der Auftraggeber und Zugänge.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2">
           <div className="view-switcher-container w-full sm:w-auto">
              <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md mr-1">
                <button 
                  onClick={() => setShowArchived(false)}
                  className={`px-2.5 py-1 rounded-md text-[9px] font-black transition-all ${!showArchived ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  AKTIV
                </button>
                <button 
                  onClick={() => setShowArchived(true)}
                  className={`px-2.5 py-1 rounded-md text-[9px] font-black transition-all ${showArchived ? 'bg-white shadow-sm text-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  ARCHIV
                </button>
              </div>

              <div className="relative flex-1 sm:w-48 group">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Suchen..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-transparent border-none py-1.5 pl-8 pr-2 text-[12px] font-bold text-slate-700 focus:ring-0" 
                />
              </div>
           </div>

           <button onClick={() => navigate('/dashboard/customers/new')} className="btn-primary w-full sm:w-auto uppercase tracking-wider">
             <Plus size={16} /> Hinzufügen
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
          <span className="label-caps">Lade Kunden...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white m-2 py-20 text-center">
           <AlertCircle size={32} className="text-slate-200 mb-2" />
           <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest text-center">Keine Einträge</p>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 animate-in fade-in duration-500 pb-20 sm:pb-0">
          {filtered.map(c => (
            <div key={c.id} className="customer-card group h-full">
              <div className={`absolute top-0 left-0 w-full h-1 ${!c.isActive ? 'bg-amber-400' : c.companyName ? 'bg-indigo-500' : 'bg-blue-500'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0
                    ${!c.isActive ? 'bg-slate-400' : c.companyName ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                    {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                  </div>
                  <div className="text-left overflow-hidden min-w-0">
                    <h3 className="font-bold text-slate-900 text-[13px] leading-tight truncate pr-2">{c.firstName} {c.lastName}</h3>
                    <span className={`status-badge mt-1 !text-[8px] ${!c.isActive ? 'bg-amber-50 text-amber-700 border-amber-100' : c.companyName ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {!c.isActive ? 'ARCHIVIERT' : c.companyName ? 'GEWERBE' : 'PRIVAT'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => navigate(`/dashboard/customers/edit/${c.id}`)} className="btn-icon-only hover:text-blue-600 hover:bg-blue-50" title="Edit"><Pencil size={14} /></button>
                   {c.isActive ? (
                     <button onClick={() => setArchiveModal({ isOpen: true, id: c.id, name: c.companyName || c.lastName })} className="btn-icon-only hover:text-amber-600 hover:bg-amber-50" title="Archiv"><Archive size={14} /></button>
                   ) : (
                     <button onClick={() => setRestoreModal({ isOpen: true, id: c.id, name: c.companyName || c.lastName })} className="btn-icon-only hover:text-emerald-600 hover:bg-emerald-50" title="Restore"><RefreshCw size={14} /></button>
                   )}
                   <button onClick={() => setDeleteModal({ isOpen: true, id: c.id, name: c.companyName || c.lastName })} className="btn-icon-only hover:text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                  <Mail size={12} className="text-slate-400 shrink-0" /> <span className="truncate">{c.email}</span>
                </div>
                {c.addresses[0] && (
                    <div className="flex items-start gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter px-1 leading-tight">
                        <MapPin size={12} className="text-slate-300 shrink-0 mt-0.5" /> 
                        <span>{c.addresses[0].street}, {c.addresses[0].city}</span>
                    </div>
                )}
              </div>
              
              <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-auto">
                {c.userId && c.isActive ? (
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                      <CheckCircle size={10} /> Portal Aktiv
                    </span>
                  ) : !c.isActive ? (
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-widest">Gesperrt</span>
                  ) : (
                    <button onClick={() => handleGenerateInvoice(c.id)} className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest">
                      <Landmark size={10} /> Abrechnen
                    </button>
                  )}
                  
                  <button onClick={() => navigate(`/dashboard/customers/edit/${c.id}`)} className="text-[10px] font-black text-slate-400 hover:text-blue-600 flex items-center gap-1 uppercase tracking-widest transition-colors">
                    Details <ChevronRight size={12} strokeWidth={3} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container animate-in slide-in-from-bottom-2 duration-300 pb-20 sm:pb-0">
          <div className="overflow-x-auto">
            <table className="table-main w-full min-w-[900px]">
                <thead className="table-head">
                <tr>
                    <th className="table-cell">Kunde / Firma</th>
                    <th className="table-cell">Kontakt</th>
                    <th className="table-cell">Anschrift</th>
                    <th className="table-cell text-center">Status</th>
                    <th className="table-cell text-right pr-4">Aktionen</th>
                </tr>
                </thead>
                <tbody>
                {filtered.map(c => (
                    <tr key={c.id} className="table-row group">
                    <td className="table-cell align-middle">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white shadow-sm shrink-0
                                ${!c.isActive ? 'bg-slate-400' : c.companyName ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                                {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold text-slate-800 text-[13px] leading-tight">{c.firstName} {c.lastName}</div>
                                {c.companyName && <div className="text-[9px] text-blue-600 font-bold uppercase tracking-tighter truncate max-w-[150px]">{c.companyName}</div>}
                            </div>
                        </div>
                    </td>
                    <td className="table-cell align-middle">
                        <div className="flex flex-col gap-0.5 text-[11px] font-bold">
                            <div className="flex items-center gap-1.5 text-slate-600"><Mail size={12} className="text-slate-300" /> {c.email}</div>
                            {c.phone && <div className="flex items-center gap-1.5 text-slate-400"><Phone size={12} className="text-slate-300" /> {c.phone}</div>}
                        </div>
                    </td>
                    <td className="table-cell align-middle text-[11px] font-bold text-slate-500">
                        {c.addresses[0] ? `${c.addresses[0].street}, ${c.addresses[0].city}` : '---'}
                    </td>
                    <td className="table-cell text-center align-middle">
                        <span className={`status-badge text-[9px] ${!c.isActive ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                            {!c.isActive ? 'ARCHIVIERT' : 'AKTIV'}
                        </span>
                    </td>
                    <td className="table-cell text-right pr-4 align-middle">
                        <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-all">
                          {c.isActive && <button onClick={() => handleGenerateInvoice(c.id)} className="btn-icon-only hover:text-emerald-600 hover:bg-emerald-50"><Landmark size={14}/></button>}
                          <button onClick={() => navigate(`/dashboard/customers/edit/${c.id}`)} className="btn-icon-only hover:text-blue-600 hover:bg-blue-50"><Pencil size={14} /></button>
                          {c.isActive ? (
                            <button onClick={() => setArchiveModal({ isOpen: true, id: c.id, name: c.companyName || c.lastName })} className="btn-icon-only hover:text-amber-600 hover:bg-amber-50"><Archive size={14} /></button>
                          ) : (
                            <button onClick={() => setRestoreModal({ isOpen: true, id: c.id, name: c.companyName || c.lastName })} className="btn-icon-only hover:text-emerald-600 hover:bg-emerald-50"><RefreshCw size={14} /></button>
                          )}
                          <button onClick={() => setDeleteModal({ isOpen: true, id: c.id, name: c.companyName || c.lastName })} className="btn-icon-only hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        title={deleteModal.invoices ? "GoBD Sperre" : "Kunden entfernen?"} 
        message={
          deleteModal.invoices ? (
            <div className="space-y-3">
              <p className="text-red-600 font-bold text-[12px] uppercase tracking-widest flex items-center gap-2"><AlertCircle size={14}/> Abrechnungs-Konflikt</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">Aufgrund der GoBD-Vorschriften kann dieser Kunde nicht gelöscht werden, da Rechnungen existieren. Bitte nutzen Sie die Archivierung.</p>
            </div>
          ) : (
            `Möchtest du ${deleteModal.name} unwiderruflich aus dem System löschen?`
          )
        }
        onConfirm={deleteModal.invoices ? undefined : confirmDelete} 
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '' })} 
        variant={deleteModal.invoices ? "warning" : "danger"}
        confirmText={deleteModal.invoices ? undefined : "Unwiderruflich löschen"}
        cancelText={deleteModal.invoices ? "Verstanden" : "Abbrechen"}
      />

      <ConfirmModal 
        isOpen={archiveModal.isOpen} 
        title="Kunden archivieren?" 
        message={`Der Zugriff für ${archiveModal.name} wird sofort gesperrt. Dokumente bleiben erhalten.`} 
        onConfirm={confirmArchive} 
        onCancel={() => setArchiveModal({ isOpen: false, id: '', name: '' })} 
        variant="warning"
        confirmText="Archivieren"
      />

      <ConfirmModal 
        isOpen={restoreModal.isOpen} 
        title="Kunde reaktivieren?" 
        message={`Möchtest du das Konto von ${restoreModal.name} wieder freischalten?`} 
        onConfirm={confirmRestore} 
        onCancel={() => setRestoreModal({ isOpen: false, id: '', name: '' })} 
        variant="success"
        confirmText="Reaktivieren"
      />
    </div>
  );
}