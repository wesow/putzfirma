import {
  AlertCircle,
  Building2,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
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
  addresses: { id: string; street: string; city: string; zipCode: string; }[];
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  
  // State für das Löschen-Modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({ 
    isOpen: false, 
    id: '', 
    name: '' 
  });

  useEffect(() => { 
    fetchCustomers(); 
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (e) { 
      toast.error('Fehler beim Laden der Kundenstamm-Daten.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleGenerateInvoice = async (customerId: string) => {
    const toastId = toast.loading('Prüfe abrechenbare Einsätze...');
    try {
      // 1. Rechnung generieren
      const genRes = await api.post('/invoices/generate', { customerId });
      const invoice = genRes.data; 
      
      // 2. PDF laden
      toast.loading('Generiere PDF...', { id: toastId });
      const pdfRes = await api.get(`/invoices/${invoice.id}/pdf`, { responseType: 'blob' });
      
      // 3. Download starten
      const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rechnung-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url); // WICHTIG: Speicher freigeben

      toast.success(`Rechnung ${invoice.invoiceNumber} erstellt!`, { id: toastId });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Keine fertigen Jobs gefunden.";
      toast.error(msg, { id: toastId });
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    
    const tid = toast.loading('Kunde wird entfernt...');
    try {
      await api.delete(`/customers/${deleteModal.id}`);
      setCustomers(prev => prev.filter(c => c.id !== deleteModal.id));
      toast.success('Kunde erfolgreich gelöscht', { id: tid });
      setDeleteModal({ isOpen: false, id: '', name: '' });
    } catch { 
      toast.error('Löschen fehlgeschlagen', { id: tid }); 
    }
  };

  const filtered = customers.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        <div>
          <h1 className="page-title">Kundenstamm</h1>
          <p className="page-subtitle">Zentrale Verwaltung aller Auftraggeber und Rechnungsanschriften.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Filter & Suche Gruppe */}
          <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 p-1 rounded-lg border border-slate-200">
            <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Kunden suchen..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-white border-none rounded-md py-1.5 pl-8 pr-2 text-[12px] focus:ring-0 placeholder:text-slate-400 font-medium" 
              />
            </div>
          </div>

          <button onClick={() => navigate('/dashboard/customers/new')} className="btn-primary w-full sm:w-auto">
            <Plus size={16} /> Neuer Kunde
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">Kundenstamm wird synchronisiert...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 m-4 py-20">
           <AlertCircle size={40} className="text-slate-300 mb-3" />
           <p className="text-slate-500 font-bold text-sm">Keine Einträge gefunden</p>
        </div>
      ) : viewMode === 'GRID' ? (
        
        /* --- GRID VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500 pb-safe">
          {filtered.map(c => (
            <div key={c.id} className="employee-card group h-full relative overflow-hidden">
              {/* Farbstreifen oben passend zum Kundentyp */}
              <div className={`absolute top-0 left-0 w-full h-1 ${c.companyName ? 'bg-indigo-500' : 'bg-blue-500'}`}></div>
              
              <div className="flex justify-between items-start mb-4 pt-1">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0 ${c.companyName ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                        {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                    </div>
                    <div className="text-left overflow-hidden">
                        <h3 className="font-bold text-slate-900 text-sm leading-tight truncate w-32">
                            {c.firstName} {c.lastName}
                        </h3>
                        <span className={`status-badge mt-1 ${c.companyName ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                            {c.companyName ? 'GEWERBE' : 'PRIVAT'}
                        </span>
                    </div>
                </div>
                
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => navigate(`/dashboard/customers/edit/${c.id}`)} className="btn-icon-only hover:text-blue-600"><Pencil size={14} /></button>
                   <button onClick={() => setDeleteModal({ isOpen: true, id: c.id, name: c.companyName || c.lastName })} className="btn-icon-only hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium bg-slate-50 p-1.5 rounded border border-slate-100">
                  <Mail size={12} className="text-slate-400 shrink-0" /> <span className="truncate">{c.email}</span>
                </div>
                {c.companyName && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium px-1.5">
                    <Building2 size={12} className="text-slate-300 shrink-0" /> <span className="truncate">{c.companyName}</span>
                  </div>
                )}
                {c.addresses[0] && (
                  <div className="flex items-start gap-2 text-[11px] text-slate-400 font-medium px-1.5 mt-1">
                    <MapPin size={12} className="text-slate-300 shrink-0 mt-0.5" /> 
                    <span className="leading-tight">{c.addresses[0].street}, {c.addresses[0].city}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-auto">
                 {c.userId ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                      <CheckCircle size={10} /> PORTAL AKTIV
                    </span>
                  ) : (
                    <button onClick={() => handleGenerateInvoice(c.id)} className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors">
                      <Landmark size={10} /> ABRECHNEN
                    </button>
                  )}
                  
                  <button 
                    onClick={() => navigate(`/dashboard/customers/edit/${c.id}`)}
                    className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 uppercase tracking-wider transition-colors"
                  >
                    Details <ChevronRight size={12} strokeWidth={3} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* --- TABLE VIEW --- */
        <div className="table-container animate-in slide-in-from-bottom-2 duration-300 pb-safe">
          <div className="flex-1 custom-scrollbar overflow-y-auto">
            <table className="table-main">
                <thead className="table-head sticky top-0 z-10">
                <tr>
                    <th className="px-4 py-3 text-left">Kunde / Firma</th>
                    <th className="px-4 py-3 text-left">Kontakt</th>
                    <th className="px-4 py-3 text-left">Anschrift</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right pr-4">Aktionen</th>
                </tr>
                </thead>
                <tbody>
                {filtered.map(c => (
                    <tr key={c.id} className="table-row group">
                      <td className="table-cell pl-4 align-middle">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white border-2 border-white shadow-sm shrink-0 ${c.companyName ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                                {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">{c.firstName} {c.lastName}</div>
                                {c.companyName && <div className="text-[10px] text-blue-600 font-bold uppercase">{c.companyName}</div>}
                            </div>
                        </div>
                      </td>
                      <td className="table-cell align-middle text-slate-500">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5"><Mail size={12} className="text-slate-300" /> {c.email}</div>
                            {c.phone && <div className="flex items-center gap-1.5"><Phone size={12} className="text-slate-300" /> {c.phone}</div>}
                        </div>
                      </td>
                      <td className="table-cell align-middle">
                        {c.addresses[0] ? (
                            <div className="text-[11px] leading-tight text-slate-500">
                                {c.addresses[0].street}<br/>
                                {c.addresses[0].zipCode} {c.addresses[0].city}
                            </div>
                        ) : '---'}
                      </td>
                      <td className="table-cell align-middle">
                        {c.iban ? (
                            <span className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100">
                                <CreditCard size={10} /> SEPA
                            </span>
                        ) : (
                            <span className="status-badge bg-slate-50 text-slate-400 border-slate-200">
                                RECHNUNG
                            </span>
                        )}
                      </td>
                      <td className="table-cell text-right pr-4 align-middle">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => handleGenerateInvoice(c.id)} className="btn-icon-only hover:text-emerald-600" title="Rechnung"><Landmark size={14}/></button>
                          <button onClick={() => navigate(`/dashboard/customers/edit/${c.id}`)} className="btn-icon-only hover:text-blue-600"><Pencil size={14} /></button>
                          <button onClick={() => setDeleteModal({ isOpen: true, id: c.id, name: c.companyName || c.lastName })} className="btn-icon-only hover:text-red-600"><Trash2 size={14} /></button>
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
        title="Kunden entfernen?" 
        message={`Möchtest du ${deleteModal.name} wirklich unwiderruflich löschen? Alle verknüpften Rechnungen bleiben archiviert.`} 
        onConfirm={confirmDelete} 
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '' })} 
        variant="danger"
        confirmText="Löschen"
      />
    </div>
  );
}