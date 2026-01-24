import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Briefcase, 
  Tag, 
  Search, 
  Trash2, 
  Sparkles, 
  Loader2,
  Clock,
  LayoutList,
  Edit // <--- NEU
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface Service {
  id: string;
  name: string;
  description: string | null;
  priceNet: string | number;
  unit: string;
}

export default function ServicesPage() {
  const navigate = useNavigate(); // <--- NEU: Für die Navigation
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Dienstleistungen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Dienstleistung wirklich löschen?")) return;

    const original = [...services];
    setServices(prev => prev.filter(s => s.id !== id));

    try {
        await api.delete(`/services/${id}`);
        toast.success("Gelöscht");
    } catch (error: any) {
        setServices(original);
        const serverMessage = error.response?.data?.message;
        if (serverMessage) {
            toast.error(serverMessage);
        } else {
            toast.error("Konnte nicht löschen (Unbekannter Fehler)");
        }
    }
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(Number(price));
  };

  const getUnitBadge = (unit: string) => {
    const styles = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border";
    switch (unit) {
      case 'hour': 
        return <span className={`${styles} bg-blue-50 text-blue-700 border-blue-100`}><Clock size={12}/> pro Stunde</span>;
      case 'sqm': 
        return <span className={`${styles} bg-purple-50 text-purple-700 border-purple-100`}><LayoutList size={12}/> pro m²</span>;
      case 'flat': 
        return <span className={`${styles} bg-emerald-50 text-emerald-700 border-emerald-100`}><Tag size={12}/> Pauschal</span>;
      default: 
        return <span className={`${styles} bg-slate-100 text-slate-600 border-slate-200`}>{unit}</span>;
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
             <Sparkles className="text-blue-500" /> Dienstleistungen
          </h1>
          <p className="text-slate-500 mt-1">Verwalten Sie Ihren Service-Katalog und Preise.</p>
        </div>
        <Link 
          to="/dashboard/services/new" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Neue Leistung
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        <input 
          placeholder="Suche nach Bezeichnung..." 
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABELLE */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 flex flex-col items-center">
            <Loader2 className="animate-spin mb-2" /> Lade Katalog...
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-xs tracking-wider">
                <tr>
                    <th className="px-6 py-4">Bezeichnung</th>
                    <th className="px-6 py-4">Beschreibung</th>
                    <th className="px-6 py-4">Einheit</th>
                    <th className="px-6 py-4 text-right">Preis (Netto)</th>
                    <th className="px-6 py-4 text-right">Aktion</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-base mb-0.5">{service.name}</div>
                        <div className="text-xs text-slate-400 font-mono">ID: {service.id.slice(0,8)}...</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                        {service.description || <span className="text-slate-300 italic">Keine Beschreibung</span>}
                    </td>
                    <td className="px-6 py-4">
                        {getUnitBadge(service.unit)}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-800 text-lg">
                            {formatPrice(service.priceNet)}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            {/* --- EDIT BUTTON --- */}
                            <button 
                                onClick={() => navigate(`/dashboard/services/${service.id}`)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Bearbeiten"
                            >
                                <Edit size={18} />
                            </button>

                            {/* --- DELETE BUTTON --- */}
                            <button 
                                onClick={() => handleDelete(service.id)}
                                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Löschen"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </td>
                    </tr>
                ))}
                
                {filteredServices.length === 0 && (
                    <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                        <div className="bg-slate-50 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                            <Briefcase className="text-slate-300" size={24} />
                        </div>
                        <p>Keine Dienstleistungen gefunden.</p>
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}