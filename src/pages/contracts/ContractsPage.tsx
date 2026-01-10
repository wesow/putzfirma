import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, CalendarClock } from 'lucide-react';
import api from '../../lib/api';

interface Contract {
  id: string;
  customer: { companyName: string; lastName: string; firstName: string };
  service: { name: string };
  interval: string;
  nextExecutionDate: string;
  isActive: boolean;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

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

  const translateInterval = (interval: string) => {
    const map: Record<string, string> = {
      'WEEKLY': 'Wöchentlich',
      'BIWEEKLY': 'Alle 2 Wochen',
      'MONTHLY': 'Monatlich'
    };
    return map[interval] || interval;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laufende Verträge</h1>
          <p className="text-slate-500">Automatische Auftragsplanung verwalten</p>
        </div>
        <Link 
          to="/dashboard/contracts/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Neuer Vertrag
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Lade Verträge...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kunde</th>
                <th className="px-6 py-4">Leistung</th>
                <th className="px-6 py-4">Intervall</th>
                <th className="px-6 py-4">Nächster Termin</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {contract.customer.companyName || `${contract.customer.firstName} ${contract.customer.lastName}`}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    {contract.service.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">
                      {translateInterval(contract.interval)}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-orange-400" />
                    {new Date(contract.nextExecutionDate).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-6 py-4">
                    {contract.isActive ? (
                      <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-full">AKTIV</span>
                    ) : (
                      <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-full">PAUSIERT</span>
                    )}
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Keine aktiven Verträge.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}