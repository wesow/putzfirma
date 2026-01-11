import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MapPin, Phone, Mail, FileText } from 'lucide-react'; // Icons
import api from '../../lib/api';

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
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const company = c.companyName?.toLowerCase() || '';
    const email = c.email.toLowerCase();

    return (
      fullName.includes(term) || 
      company.includes(term) || 
      email.includes(term)
    );
  });

  const handleDownloadInvoice = async (customerId: string, lastName: string) => {
    try {
      const response = await api.get(`/invoices/customer/${customerId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rechnung_${lastName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Konnte Rechnung nicht erstellen (Vielleicht keine erledigten Jobs?)");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kundenverwaltung</h1>
          <p className="text-slate-500">Verwalte deine Privat- und Geschäftskunden</p>
        </div>
        <Link 
          to="/dashboard/customers/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Neuer Kunde
        </Link>
      </div>

      {/* Suchleiste */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Suchen nach Name, Firma..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">Lade Kunden...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between">
              
              {/* Oberer Teil der Karte */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      {customer.companyName || `${customer.firstName} ${customer.lastName}`}
                    </h3>
                    {customer.companyName && (
                      <p className="text-sm text-slate-500">{customer.firstName} {customer.lastName}</p>
                    )}
                  </div>
                  <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                    {customer.companyName ? 'FIRMA' : 'PRIVAT'}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <a href={`mailto:${customer.email}`} className="hover:text-blue-600 truncate">{customer.email}</a>
                  </div>
                  
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{customer.phone}</span>
                    </div>
                  )}

                  {customer.addresses.length > 0 && (
                    <div className="flex items-start gap-2 pt-2 border-t border-slate-100 mt-3">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <span>
                        {customer.addresses[0].street}<br />
                        {customer.addresses[0].zipCode} {customer.addresses[0].city}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Unterer Teil: Buttons (HIER IST DER BUTTON JETZT RICHTIG) */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleDownloadInvoice(customer.id, customer.lastName)}
                  className="flex items-center gap-2 text-sm bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                  title="Alle erledigten Jobs abrechnen"
                >
                  <FileText className="h-4 w-4" />
                  Rechnung
                </button>
              </div>

            </div>
          ))}
          
          {filteredCustomers.length === 0 && (
            <div className="col-span-full text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              Keine Kunden gefunden.
            </div>
          )}
        </div>
      )}
    </div>
  );
} 