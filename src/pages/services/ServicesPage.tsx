import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Tag } from 'lucide-react';
import api from '../../lib/api';

interface Service {
  id: string;
  name: string;
  description: string | null;
  priceNet: string; // Kommt oft als String aus der DB (Decimal)
  unit: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Preis formatieren (z.B. 45.00 €)
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(Number(price));
  };

  // Einheit übersetzen
  const formatUnit = (unit: string) => {
    switch (unit) {
      case 'hour': return 'pro Stunde';
      case 'sqm': return 'pro m²';
      case 'flat': return 'Pauschal';
      default: return unit;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dienstleistungen</h1>
          <p className="text-slate-500">Verwalte deine Preise und Angebote</p>
        </div>
        <Link 
          to="/dashboard/services/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Neue Leistung
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Lade Services...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Bezeichnung</th>
                <th className="px-6 py-4">Beschreibung</th>
                <th className="px-6 py-4">Preis (Netto)</th>
                <th className="px-6 py-4">Einheit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    {service.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                    {service.description || '-'}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {formatPrice(service.priceNet)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      <Tag className="h-3 w-3" />
                      {formatUnit(service.unit)}
                    </span>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                    Noch keine Dienstleistungen angelegt.
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