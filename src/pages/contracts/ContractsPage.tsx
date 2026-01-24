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
  Loader2
} from 'lucide-react';
import api from '../../lib/api';

// --- TYPEN ---
interface Contract {
  id: string;
  customer: { companyName: string | null; lastName: string; firstName: string };
  service: { name: string };
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
      const res = await api.get('/contracts');
      setContracts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- HILFSFUNKTIONEN ---
  const translateInterval = (interval: string) => {
    const map: Record<string, string> = {
      'WEEKLY': 'Wöchentlich',
      'BIWEEKLY': 'Alle 2 Wochen',
      'MONTHLY': 'Monatlich'
    };
    return map[interval] || interval;
  };

  const getCustomerName = (c: Contract['customer']) => {
    return c.companyName || `${c.firstName} ${c.lastName}`;
  };

  // --- FILTER LOGIK ---
  const filteredContracts = contracts.filter(c => {
    const term = searchTerm.toLowerCase();
    const customerName = getCustomerName(c.customer).toLowerCase();
    const serviceName = c.service.name.toLowerCase();
    return customerName.includes(term) || serviceName.includes(term);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Laufende Verträge</h1>
          <p className="text-slate-500 mt-1">Automatische Auftragsplanung und Service-Zyklen verwalten.</p>
        </div>
        <Link 
          to="/dashboard/contracts/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Neuer Vertrag
        </Link>
      </div>

      {/* SUCHLEISTE */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Suchen nach Kunde oder Leistung..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
        />
      </div>

      {/* LISTE / TABELLE */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 flex flex-col items-center">
            <Loader2 className="animate-spin mb-2" size={32} />
            Lade Verträge...
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-100">Kunde</th>
                  <th className="px-6 py-4 border-b border-slate-100">Leistung & Intervall</th>
                  <th className="px-6 py-4 border-b border-slate-100">Nächster Termin</th>
                  <th className="px-6 py-4 border-b border-slate-100">Status</th>
                  <th className="px-6 py-4 border-b border-slate-100 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    {/* Kunde */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-base leading-tight">
                        {getCustomerName(contract.customer)}
                      </div>
                      {contract.customer.companyName && (
                        <div className="text-xs text-slate-400 font-medium mt-1">
                          Ansprechpartner: {contract.customer.firstName} {contract.customer.lastName}
                        </div>
                      )}
                    </td>

                    {/* Leistung */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-slate-700 mb-1.5">
                        <FileText className="h-4 w-4 text-blue-500" />
                        {contract.service.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 w-fit px-2 py-0.5 rounded-lg">
                        <Repeat className="h-3 w-3" />
                        {translateInterval(contract.interval)}
                      </div>
                    </td>

                    {/* Nächster Termin */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                            <CalendarClock className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-slate-700">
                          {new Date(contract.nextExecutionDate).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {contract.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[10px] uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          AKTIV
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-slate-500 font-bold text-[10px] uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          PAUSIERT
                        </span>
                      )}
                    </td>

                    {/* Aktionen */}
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-xl transition-all">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredContracts.length === 0 && (
            <div className="px-6 py-20 text-center text-slate-400 bg-slate-50/50">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
                 <AlertCircle className="h-8 w-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-500">Keine aktiven Verträge gefunden.</p>
              <p className="text-sm mt-1">Passen Sie Ihre Suche an oder legen Sie einen neuen Vertrag an.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}