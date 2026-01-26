import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Search, MapPin, Phone, Mail, 
  Loader2, CheckCircle, Pencil, Trash2, 
  AlertCircle 
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import ViewSwitcher from '../../components/ViewSwitcher';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  userId: string | null;
  invitation?: { id: string; isAccepted: boolean; } | null;
  addresses: { street: string; city: string; zipCode: string; }[];
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (e) { 
      toast.error('Fehler beim Laden der Kunden'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleGenerateInvoice = async (customerId: string) => {
    const toastId = toast.loading('Prüfe abrechenbare Jobs...');
    try {
      const genRes = await api.post('/invoices/generate', { customerId });
      const invoice = genRes.data; 
      toast.loading('Generiere PDF...', { id: toastId });
      const pdfRes = await api.get(`/invoices/${invoice.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rechnung-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Rechnung ${invoice.invoiceNumber} erstellt!`, { id: toastId });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Keine fertigen Jobs gefunden.";
      toast.error(msg, { id: toastId });
    }
  };

  const confirmDelete = async () => {
    const tid = toast.loading('Lösche...');
    try {
      await api.delete(`/customers/${deleteModal.id}`);
      setCustomers(customers.filter(c => c.id !== deleteModal.id));
      toast.success('Gelöscht', { id: tid });
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
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title">Kundenstamm</h1>
          <p className="page-subtitle text-slate-500 font-medium tracking-tight">Übersicht aller gewerblichen und privaten Auftraggeber.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />

          <div className="relative flex-1 md:flex-initial min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Kunde suchen..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="input-standard pl-10" 
            />
          </div>
          <Link to="/dashboard/customers/new" className="btn-primary">
            <Plus size={18} /> Neuer Kunde
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-3 text-blue-600" size={32} />
          <span className="font-bold text-xs uppercase tracking-widest italic text-slate-500">Kunden werden synchronisiert...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 shadow-sm">
           <AlertCircle className="h-10 w-10 text-slate-200 mx-auto mb-3" />
           <p className="text-slate-500 font-bold uppercase text-xs">Keine Einträge gefunden</p>
        </div>
      ) : viewMode === 'GRID' ? (
        /* --- GRID VIEW --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
          {filtered.map(c => (
            <div key={c.id} className="customer-card group">
              <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${c.companyName ? 'bg-indigo-500' : 'bg-blue-500'}`}></div>
              
              <div className="flex justify-between items-start mb-6 pt-2">
                <div className="text-left overflow-hidden">
                  <h3 className="font-black text-slate-900 text-lg leading-tight truncate">
                    {c.companyName || `${c.firstName} ${c.lastName}`}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`status-badge !rounded-md ${c.companyName ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                      {c.companyName ? 'GEWERBLICH' : 'PRIVAT'}
                    </span>
                    {c.userId && (
                      <span className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm">
                        <CheckCircle size={10} /> AKTIV
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                  <button onClick={() => navigate(`/dashboard/customers/edit/${c.id}`)} className="btn-ghost-danger hover:text-blue-600 hover:bg-blue-50"><Pencil size={16} /></button>
                  <button onClick={() => setDeleteModal({ isOpen: true, id: c.id, name: c.companyName || c.lastName })} className="btn-ghost-danger"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-left">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <Mail size={14} className="text-slate-300" /> <span className="truncate">{c.email}</span>
                </div>
                {c.phone && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <Phone size={14} className="text-slate-300" /> {c.phone}
                  </div>
                )}
                {c.addresses[0] && (
                  <div className="flex items-start gap-2 pt-4 mt-3 border-t border-slate-50 text-[11px] text-slate-700 font-bold italic tracking-tight leading-tight">
                    <MapPin size={14} className="text-blue-400 shrink-0" />
                    <div className="truncate">
                      <div>{c.addresses[0].street}</div>
                      <div className="text-slate-400 uppercase tracking-tighter not-italic">{c.addresses[0].zipCode} {c.addresses[0].city}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => handleGenerateInvoice(c.id)} 
                className="btn-secondary w-full py-3 justify-center text-[10px] uppercase tracking-[0.2em] font-black shadow-sm"
              >
                Rechnung erstellen
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* --- TABLE VIEW --- */
        <div className="table-container animate-in slide-in-from-bottom-2 duration-500">
          <table className="table-main">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Kunde / Firma</th>
                <th className="table-cell">Kontakt</th>
                <th className="table-cell">Standort</th>
                <th className="table-cell text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="table-row group">
                  <td className="table-cell">
                    <div className="font-bold text-slate-800 leading-tight">{c.companyName || `${c.firstName} ${c.lastName}`}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.companyName ? 'Gewerblich' : 'Privat'}</div>
                  </td>
                  <td className="table-cell text-xs text-slate-600">
                    <div className="flex items-center gap-1.5"><Mail size={12} className="text-slate-300"/> {c.email}</div>
                    <div className="font-bold mt-0.5">{c.phone}</div>
                  </td>
                  <td className="table-cell text-xs text-slate-500 font-medium">
                    {c.addresses[0] ? (
                      <>
                        <div className="text-slate-700">{c.addresses[0].street}</div>
                        <div className="text-[10px]">{c.addresses[0].zipCode} {c.addresses[0].city}</div>
                      </>
                    ) : '---'}
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleGenerateInvoice(c.id)} className="btn-ghost-danger hover:text-blue-600 hover:bg-blue-50">Abrechnen</button>
                      <button onClick={() => navigate(`/dashboard/customers/edit/${c.id}`)} className="btn-ghost-danger hover:text-blue-600 hover:bg-blue-50"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: c.id, name: c.companyName || c.lastName })} className="btn-ghost-danger"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        title="Kunde löschen?" 
        message={`Möchtest du ${deleteModal.name} wirklich unwiderruflich entfernen?`} 
        onConfirm={confirmDelete} 
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '' })} 
      />
    </div>
  );
}