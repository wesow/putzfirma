import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  CalendarClock, 
  Search, 
  MoreVertical, 
  Repeat,
  AlertCircle,
  Loader2,
  CheckCircle,
  PauseCircle,
  Pencil,
  MapPin
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Contract {
  id: string;
  customer: { companyName: string | null; lastName: string; firstName: string };
  service: { name: string };
  address?: { street: string; city: string };
  interval: string;
  nextExecutionDate: string;
  isActive: boolean;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contracts');
      setContracts(res.data);
    } catch (error) {
      toast.error("Fehler beim Laden der Verträge");
    } finally {
      setLoading(false);
    }
  };

  const translateInterval = (interval: string) => {
    const map: Record<string, string> = {
      'WEEKLY': 'WÖCHENTLICH',
      'BIWEEKLY': 'ALLE 2 WOCHEN',
      'MONTHLY': 'MONATLICH'
    };
    return map[interval] || interval;
  };

  const getCustomerName = (c: Contract['customer']) => {
    return c.companyName || `${c.firstName} ${c.lastName}`;
  };

  const filteredContracts = contracts.filter(c => {
    const term = searchTerm.toLowerCase();
    const customerName = getCustomerName(c.customer).toLowerCase();
    const serviceName = c.service.name.toLowerCase();
    return customerName.includes(term) || serviceName.includes(term);
  });

  return (
    <div className="page-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title leading-none">Daueraufträge</h1>
          <p className="page-subtitle text-slate-500 mt-2 font-medium">Automatisierte Reinigungszyklen und aktive Service-Verträge.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Verträge durchsuchen..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-standard pl-10"
            />
          </div>
          <Link to="/dashboard/contracts/new" className="btn-primary shadow-xl shadow-blue-500/20">
            <Plus size={18} /> <span>Neuer Vertrag</span>
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-4 text-blue-600" size={44} />
          <span className="font-black text-[10px] uppercase tracking-[0.2em] italic">Synchronisiere Verträge...</span>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm animate-in fade-in duration-500">
          <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Keine aktiven Verträge gefunden</p>
        </div>
      ) : (
        <div className="table-container shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <table className="table-main">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Kunde & Objekt</th>
                <th className="table-cell">Leistung & Turnus</th>
                <th className="table-cell">Nächster Termin</th>
                <th className="table-cell text-center">Status</th>
                <th className="table-cell text-right">Optionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="table-row group">
                  
                  {/* Kunde & Adresse */}
                  <td className="table-cell">
                    <div className="font-black text-slate-900 text-sm leading-tight">
                      {getCustomerName(contract.customer)}
                    </div>
                    {contract.address && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase mt-1 italic tracking-tight">
                        <MapPin size={10} className="text-slate-300" />
                        {contract.address.street}, {contract.address.city}
                      </div>
                    )}
                  </td>

                  {/* Leistung & Intervall */}
                  <td className="table-cell">
                    <div className="flex items-center gap-2 font-black text-blue-600 text-xs mb-1.5 uppercase tracking-tighter">
                      <FileText size={14} className="text-blue-400" />
                      {contract.service.name}
                    </div>
                    <span className="status-badge bg-slate-50 text-slate-500 border-slate-200 !rounded-md font-black text-[9px]">
                      <Repeat size={10} className="mr-1" />
                      {translateInterval(contract.interval)}
                    </span>
                  </td>

                  {/* Nächster Termin */}
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner border border-blue-100/50">
                        <CalendarClock size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Geplant am</p>
                        <span className="font-black text-slate-700 text-sm tracking-tight">
                          {new Date(contract.nextExecutionDate).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="table-cell text-center">
                    {contract.isActive ? (
                      <span className="status-badge bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] shadow-sm">
                        <CheckCircle size={10} className="mr-1" />
                        AKTIV
                      </span>
                    ) : (
                      <span className="status-badge bg-slate-50 text-slate-400 border-slate-200 font-black text-[10px]">
                        <PauseCircle size={10} className="mr-1" />
                        PAUSIERT
                      </span>
                    )}
                  </td>

                  {/* Aktionen */}
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm">
                        <Pencil size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all shadow-sm">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}