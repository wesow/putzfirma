import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MapPin, Phone, Mail, FileText, Loader2, Building2, User } from 'lucide-react';
import api from '../../lib/api';
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

// --- HELPER COMPONENT: CUSTOMER CARD (AUSSERHALB) ---
const CustomerCard = ({ customer, onGenerateInvoice }: { customer: Customer, onGenerateInvoice: (id: string) => void }) => {
  const isCompany = !!customer.companyName;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
      {/* Visual Indicator Top */}
      <div className={`absolute top-0 left-0 w-full h-1 ${isCompany ? 'bg-indigo-500' : 'bg-blue-500'}`}></div>

      <div>
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-white ${isCompany ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
              {isCompany ? <Building2 size={24} /> : <User size={24} />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                {customer.companyName || `${customer.firstName} ${customer.lastName}`}
              </h3>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1 inline-block ${isCompany ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'}`}>
                {isCompany ? 'Firma' : 'Privat'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-600 mb-6">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            <a href={`mailto:${customer.email}`} className="hover:text-blue-600 truncate transition-colors font-medium">{customer.email}</a>
          </div>
          
          {customer.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <a href={`tel:${customer.phone}`} className="hover:text-blue-600 transition-colors font-medium">{customer.phone}</a>
            </div>
          )}

          {customer.addresses.length > 0 && (
            <div className="flex items-start gap-3 pt-3 border-t border-slate-50 mt-3">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="leading-relaxed">
                {customer.addresses[0].street}<br />
                <span className="text-slate-400 font-medium">{customer.addresses[0].zipCode} {customer.addresses[0].city}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-50">
        <button
          onClick={() => onGenerateInvoice(customer.id)}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          title="Alle fertigen Jobs abrechnen & PDF laden"
        >
          <FileText className="h-4 w-4" />
          Abrechnen
        </button>
      </div>
    </div>
  );
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (error) {
      console.error('Fehler beim Laden der Kunden:', error);
      toast.error('Kunden konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const company = c.companyName?.toLowerCase() || '';
    const email = c.email.toLowerCase();

    return (fullName.includes(term) || company.includes(term) || email.includes(term));
  });

  const handleGenerateInvoice = async (customerId: string) => {
    const toastId = toast.loading('Prüfe offene Jobs...');
    
    try {
      // 1. Rechnung generieren
      const genRes = await api.post('/invoices/generate', { customerId });
      const invoice = genRes.data; 
      
      toast.loading('Generiere PDF...', { id: toastId });

      // 2. PDF laden
      const pdfRes = await api.get(`/invoices/${invoice.id}/pdf`, { responseType: 'blob' });
      
      // 3. Download
      const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rechnung-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Rechnung ${invoice.invoiceNumber} erstellt!`, { id: toastId });

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Konnte Rechnung nicht erstellen.";
      if (error.response?.status === 400) {
          toast.error(msg, { id: toastId, duration: 4000 });
      } else {
          toast.error("Fehler beim Erstellen", { id: toastId });
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Kundenverwaltung</h1>
          <p className="text-slate-500 mt-1">Verwalten Sie Ihre Privat- und Geschäftskunden.</p>
        </div>
        <Link 
          to="/dashboard/customers/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Neuer Kunde
        </Link>
      </div>

      {/* Suchleiste */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Suchen nach Name, Firma, Email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 flex flex-col items-center">
            <Loader2 className="animate-spin mb-2" size={32} />
            Lade Kunden...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              onGenerateInvoice={handleGenerateInvoice} 
            />
          ))}
          
          {filteredCustomers.length === 0 && (
            <div className="col-span-full text-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
                <Search className="text-slate-300 h-8 w-8" />
              </div>
              <p className="text-slate-500 font-medium">Keine Kunden gefunden.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}