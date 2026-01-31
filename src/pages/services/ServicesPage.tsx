import {
  AlertCircle,
  Briefcase,
  ChevronRight,
  Clock,
  LayoutList,
  Loader2,
  Pencil,
  Plus, Search,
  Tag,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';
import ViewSwitcher from '../../components/ViewSwitcher';
import api from '../../lib/api';

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
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
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

  const getUnitInfo = (unit: string) => {
    switch (unit) {
      case 'hour': 
        return { text: 'Std.', icon: Clock, color: 'bg-blue-500', badge: 'bg-blue-50 text-blue-600 border-blue-100' };
      case 'sqm': 
        return { text: 'm²', icon: LayoutList, color: 'bg-purple-500', badge: 'bg-purple-50 text-purple-600 border-purple-100' };
      case 'flat': 
        return { text: 'Pausch.', icon: Tag, color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      default: 
        return { text: unit, icon: Tag, color: 'bg-slate-400', badge: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  const filtered = services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page-container">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        <div>
          <h1 className="page-title">Leistungskatalog</h1>
          <p className="page-subtitle">Definition Ihrer Dienstleistungen und Preise für Angebote.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 p-1 rounded-lg border border-slate-200">
            <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Suchen..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-white border-none rounded-md py-1.5 pl-8 pr-2 text-[12px] focus:ring-0 placeholder:text-slate-400 font-medium" 
              />
            </div>
          </div>

          <Link to="/dashboard/services/new" className="btn-primary w-full sm:w-auto whitespace-nowrap">
            <Plus size={16} /> Neue Leistung
          </Link>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lade Katalog...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 m-4 py-20">
          <AlertCircle size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-bold text-sm">Keine Leistungen gefunden.</p>
          <p className="text-slate-400 text-xs mt-1">Legen Sie Ihre erste Dienstleistung im System an.</p>
        </div>
      ) : viewMode === 'GRID' ? (
        
        /* --- GRID VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300 pb-safe">
          {filtered.map(s => {
            const ui = getUnitInfo(s.unit);
            const Icon = ui.icon;

            return (
              <div key={s.id} className="employee-card group h-full">
                <div className={`absolute top-0 left-0 w-full h-1 ${ui.color}`}></div>
                
                <div className="flex justify-between items-start mb-4 pt-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm ${ui.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="text-left overflow-hidden">
                      <h3 className="font-bold text-slate-900 text-sm leading-tight truncate w-32">
                        {s.name}
                      </h3>
                      <span className={`status-badge mt-1 ${ui.badge}`}>
                        {ui.text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/dashboard/services/edit/${s.id}`)} className="btn-icon-only hover:text-blue-600"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteModal({ isOpen: true, id: s.id, name: s.name })} className="btn-icon-only hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-start gap-2 text-[11px] text-slate-500 font-medium bg-slate-50 p-2 rounded border border-slate-100 min-h-[44px]">
                    <Briefcase size={12} className="text-slate-300 mt-0.5 shrink-0" /> 
                    <span className="line-clamp-2 leading-relaxed">{s.description || 'Keine Beschreibung verfügbar.'}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="label-caps !mb-0 !ml-0">Preis (Netto)</span>
                    <span className="font-black text-slate-900 text-sm tracking-tight">
                      {formatPrice(s.priceNet)}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/dashboard/services/edit/${s.id}`)}
                    className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 uppercase tracking-wider transition-colors"
                  >
                    Details <ChevronRight size={12} strokeWidth={3} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* --- TABLE VIEW --- */
        <div className="table-container animate-in slide-in-from-bottom-2 duration-300 pb-safe">
          <div className="flex-1 custom-scrollbar overflow-y-auto">
            <table className="table-main">
              <thead className="table-head sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left">Leistung</th>
                  <th className="px-4 py-3 text-left">Beschreibung</th>
                  <th className="px-4 py-3 text-left">Einheit</th>
                  <th className="px-4 py-3 text-right">Netto-Preis</th>
                  <th className="px-4 py-3 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const ui = getUnitInfo(s.unit);
                  const UnitIcon = ui.icon;
                  return (
                    <tr key={s.id} className="table-row group">
                      <td className="table-cell pl-4 align-middle">
                        <div className="font-bold text-slate-800">{s.name}</div>
                      </td>
                      <td className="table-cell align-middle">
                        <div className="text-slate-500 text-[11px] truncate max-w-[250px]" title={s.description || ''}>
                          {s.description || '---'}
                        </div>
                      </td>
                      <td className="table-cell align-middle">
                        <span className={`status-badge flex items-center gap-1.5 w-fit ${ui.badge}`}>
                          <UnitIcon size={10} /> {ui.text}
                        </span>
                      </td>
                      <td className="table-cell text-right align-middle">
                        <span className="font-mono font-bold text-slate-900">
                          {formatPrice(s.priceNet)}
                        </span>
                      </td>
                      <td className="table-cell text-right pr-4 align-middle">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => navigate(`/dashboard/services/edit/${s.id}`)} className="btn-icon-only hover:text-blue-600"><Pencil size={14} /></button>
                          <button onClick={() => setDeleteModal({ isOpen: true, id: s.id, name: s.name })} className="btn-icon-only hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        title="Leistung entfernen?" 
        message={`Möchten Sie "${deleteModal.name}" wirklich aus dem Leistungskatalog löschen? Bereits erstellte Angebote bleiben davon unberührt.`} 
        onConfirm={confirmDelete} 
        onCancel={() => setDeleteModal({ ...deleteModal, isOpen: false, id: '', name: '' })} 
      />
    </div>
  );
}