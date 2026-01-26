import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, MapPin, Phone, Mail, Loader2, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  addresses: {
    street: string;
    city: string;
    zipCode: string;
  }[];
}

export default function CustomersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (error) {
      toast.error('Kundenliste konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (customerId: string) => {
    const toastId = toast.loading('Beleg wird generiert...');
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
      toast.success(`Beleg ${invoice.invoiceNumber} erfolgreich erstellt!`, { id: toastId });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Abrechnung fehlgeschlagen.", { id: toastId });
    }
  };

  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) || 
      (c.companyName?.toLowerCase() || '').includes(term) || 
      c.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="page-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title leading-none">Kundenstamm</h1>
          <p className="page-subtitle text-slate-500 mt-2 font-medium">Zentrale Übersicht und Verwaltung Ihres GlanzOps Kundennetzwerks.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Kunde oder Firma suchen..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-standard pl-10"
            />
          </div>
          {isAdmin && (
            <Link to="/dashboard/customers/new" className="btn-primary shadow-blue-200">
              <Plus size={18} /> <span>Neuer Kunde</span>
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <span className="font-black text-[10px] uppercase tracking-[0.2em] italic">Synchronisiere Kundenstamm...</span>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm animate-in fade-in duration-500">
           <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Keine Ergebnisse gefunden</p>
        </div>
      ) : (
        /* --- CUSTOMER GRID --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {filteredCustomers.map((c) => (
            <div key={c.id} className="customer-card group">
              {/* Status Indicator Top */}
              <div className={`absolute top-0 left-0 w-full h-1.5 ${c.companyName ? 'bg-indigo-500' : 'bg-blue-500'}`}></div>

              <div className="p-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-left overflow-hidden">
                    <h3 className="font-black text-slate-900 text-lg leading-tight truncate pr-2 group-hover:text-blue-600 transition-colors">
                      {c.companyName || `${c.firstName} ${c.lastName}`}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className={`status-badge !rounded-md !px-2 font-black text-[9px] ${c.companyName ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {c.companyName ? 'GEWERBLICH' : 'PRIVAT'}
                        </span>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => navigate(`/dashboard/customers/edit/${c.id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                            <Pencil size={16} />
                        </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-3 text-slate-500 font-medium text-xs">
                    <Mail size={14} className="text-slate-300 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  
                  {c.phone && (
                    <div className="flex items-center gap-3 text-slate-500 font-medium text-xs">
                      <Phone size={14} className="text-slate-300 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}

                  {c.addresses && c.addresses.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-slate-50 flex items-start gap-3">
                      <MapPin size={14} className="text-blue-400 shrink-0 mt-0.5" />
                      <div className="text-left">
                        <div className="text-xs font-black text-slate-700 leading-tight tracking-tight uppercase">{c.addresses[0].street}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                            {c.addresses[0].zipCode} {c.addresses[0].city}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleGenerateInvoice(c.id)}
                  className="btn-secondary w-full py-3 justify-center text-[10px] uppercase tracking-[0.2em] font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all"
                >
                  Rechnung erstellen
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}