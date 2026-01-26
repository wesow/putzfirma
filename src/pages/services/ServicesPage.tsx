import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Search, Trash2, Loader2, Clock, 
  LayoutList, Tag, Pencil, Briefcase, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import ConfirmModal from '../../components/ConfirmModal';

interface Service {
  id: string;
  name: string;
  description: string | null;
  priceNet: string | number;
  unit: string;
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch { 
      toast.error("Katalog konnte nicht geladen werden."); 
    } finally { 
      setLoading(false); 
    }
  };

  const confirmDelete = async () => {
    const tid = toast.loading("Leistung wird entfernt...");
    try {
      await api.delete(`/services/${deleteModal.id}`);
      setServices(services.filter(s => s.id !== deleteModal.id));
      toast.success("Dienstleistung entfernt", { id: tid });
      setDeleteModal({ ...deleteModal, isOpen: false });
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Löschen fehlgeschlagen", { id: tid });
    }
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(price));
  };

  const getUnitBadge = (unit: string) => {
    switch (unit) {
      case 'hour': 
        return <span className="status-badge bg-blue-50 text-blue-700 border-blue-100 font-black"><Clock size={12} className="mr-1"/> PRO STD.</span>;
      case 'sqm': 
        return <span className="status-badge bg-purple-50 text-purple-700 border-purple-100 font-black"><LayoutList size={12} className="mr-1"/> PRO M²</span>;
      case 'flat': 
        return <span className="status-badge bg-emerald-50 text-emerald-700 border-emerald-100 font-black"><Tag size={12} className="mr-1"/> PAUSCHAL</span>;
      default: 
        return <span className="status-badge bg-slate-50 text-slate-500 border-slate-200 font-black uppercase">{unit}</span>;
    }
  };

  const filtered = services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title leading-none">Leistungskatalog</h1>
          <p className="page-subtitle text-slate-500 mt-2 font-medium">Definition Ihrer Dienstleistungen und Kalkulationsgrundlagen.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Leistung suchen..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="input-standard pl-10" 
            />
          </div>
          <Link to="/dashboard/services/new" className="btn-primary shadow-blue-200">
            <Plus size={18} /> <span>Neue Leistung</span>
          </Link>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="table-container shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-3 text-blue-600" size={40} />
            <span className="label-caps italic">Katalog wird synchronisiert...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-main">
              <thead className="table-head">
                <tr>
                  <th className="table-cell">Bezeichnung & Spezifikation</th>
                  <th className="table-cell text-center">Abrechnungsart</th>
                  <th className="table-cell text-right">Netto-Preis</th>
                  <th className="table-cell text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="table-row group">
                    <td className="table-cell">
                      <div className="text-left">
                        <div className="font-black text-slate-900 text-sm">{s.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 max-w-sm truncate font-bold italic">
                          {s.description || 'Keine Detailbeschreibung hinterlegt'}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      {getUnitBadge(s.unit)}
                    </td>
                    <td className="table-cell text-right">
                      <span className="font-black text-blue-600 text-sm tracking-tight">
                        {formatPrice(s.priceNet)}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => navigate(`/dashboard/services/${s.id}`)} 
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Bearbeiten"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: s.id, name: s.name })} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Löschen"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-300">
                        <Briefcase size={48} className="opacity-20" />
                        <p className="font-black uppercase tracking-widest text-xs">Keine Treffer im Katalog</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        title="Leistung unwiderruflich löschen?" 
        message={`Sind Sie sicher, dass Sie "${deleteModal.name}" aus dem Katalog entfernen möchten? Dies kann bestehende Vorlagen beeinflussen.`} 
        onConfirm={confirmDelete} 
        onCancel={() => setDeleteModal({ ...deleteModal, isOpen: false, id: '', name: '' })} 
      />
    </div>
  );
}