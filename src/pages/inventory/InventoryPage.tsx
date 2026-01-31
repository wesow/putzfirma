import {
  AlertTriangle,
  BarChart3,
  Loader2,
  MinusCircle,
  Package,
  Pencil,
  Plus,
  PlusCircle,
  Search, Trash2,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../lib/api';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  costPrice: number | string | any;
}

export default function InventoryPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/inventory'); 
      setProducts(res.data);
    } catch (error: any) {
      toast.error("Bestand konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = async (id: string, change: number) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock + change) } : p
    ));
    try {
      await api.patch(`/inventory/${id}/stock`, { change });
    } catch (error) {
      toast.error("Synchronisierungsfehler.");
      fetchProducts();
    }
  };

  const confirmDelete = async () => {
    const tid = toast.loading("Lösche Artikel...");
    try {
      await api.delete(`/inventory/${deleteModal.id}`);
      setProducts(prev => prev.filter(p => p.id !== deleteModal.id));
      toast.success("Artikel entfernt", { id: tid });
      setDeleteModal({ ...deleteModal, isOpen: false });
    } catch {
      toast.error("Fehler beim Löschen", { id: tid });
    }
  };

  const formatEuro = (val: number) => val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const totalValue = products.reduce((acc, p) => acc + (p.stock * (parseFloat(p.costPrice) || 0)), 0);
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div>
          <h1 className="page-title">Inventar & Material</h1>
          <p className="page-subtitle">Echtzeit-Überwachung der Lagerbestände und Werte.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Suchen..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-48 bg-white border-none rounded-md py-1.5 pl-8 pr-2 text-[12px] focus:ring-0 placeholder:text-slate-400 font-medium" 
                />
              </div>
           </div>
           <button onClick={() => navigate('/dashboard/inventory/new')} className="btn-primary">
             <Plus size={16} /> Neuer Artikel
           </button>
        </div>
      </div>

      {/* COMPACT KPI STATS */}
      <div className="stats-grid mb-4 md:!grid-cols-3">
          <div className={`stat-card ${lowStockCount > 0 ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
              <div className={`stat-icon-wrapper ${lowStockCount > 0 ? 'icon-critical' : 'icon-success'}`}>
                  <AlertTriangle size={18} />
              </div>
              <div>
                  <span className="label-caps">Mangelbestand</span>
                  <div className={`text-base font-bold leading-none ${lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {lowStockCount} Kritische Artikel
                  </div>
              </div>
          </div>

          <div className="stat-card border-l-blue-500">
              <div className="stat-icon-wrapper icon-info">
                  <TrendingUp size={18} />
              </div>
              <div>
                  <span className="label-caps">Lagerwert</span>
                  <div className="text-base font-bold text-slate-900 leading-none">
                      {formatEuro(totalValue)}
                  </div>
              </div>
          </div>

          <div className="stat-card border-l-slate-300">
              <div className="stat-icon-wrapper bg-slate-100 text-slate-600">
                  <Package size={18} />
              </div>
              <div>
                  <span className="label-caps">Sortiment</span>
                  <div className="text-base font-bold text-slate-800 leading-none">{products.length} Produkte</div>
              </div>
          </div>
      </div>

      {/* MAIN TABLE */}
      <div className="table-container flex-1 animate-in fade-in duration-500">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
            <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-slate-400" />
                <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Lagerbestandsliste</h3>
            </div>
            <span className="status-badge bg-slate-50 text-slate-500 border-slate-200">
                {filteredProducts.length} Einträge
            </span>
        </div>

        <div className="flex-1 custom-scrollbar overflow-y-auto min-h-[400px]">
          <table className="table-main">
            <thead className="table-head">
              <tr>
                <th className="table-cell pl-4 w-[35%] text-left">Produkt / Artikel</th>
                <th className="table-cell text-left">SKU / Referenz</th>
                <th className="table-cell text-center">Bestand</th>
                <th className="table-cell text-right">Einzelpreis EK</th>
                <th className="table-cell text-center">Status</th>
                <th className="table-cell text-right pr-4">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={24}/></td></tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="table-row group">
                    <td className="table-cell pl-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 shrink-0">
                            <Package size={14} />
                        </div>
                        <span className="font-bold text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="table-cell align-middle">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                         {p.sku || 'N/A'}
                      </span>
                    </td>
                    <td className="table-cell align-middle">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleStockChange(p.id, -1)} className="text-slate-300 hover:text-red-500 transition-colors"><MinusCircle size={16}/></button>
                        <div className={`w-8 text-center font-mono font-black text-sm ${p.stock <= p.minStock ? 'text-red-600' : 'text-slate-700'}`}>{p.stock}</div>
                        <button onClick={() => handleStockChange(p.id, 1)} className="text-slate-300 hover:text-emerald-500 transition-colors"><PlusCircle size={16}/></button>
                      </div>
                    </td>
                    <td className="table-cell text-right align-middle font-mono font-bold text-slate-600">
                        {formatEuro(parseFloat(p.costPrice))}
                    </td>
                    <td className="table-cell text-center align-middle">
                      <span className={`status-badge !px-2 !py-0.5 ${p.stock <= p.minStock ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {p.stock <= p.minStock ? 'NACHFÜLLEN' : 'OK'}
                      </span>
                    </td>
                    <td className="table-cell text-right pr-4 align-middle">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => navigate(`/dashboard/inventory/edit/${p.id}`)} className="btn-icon-only text-slate-400 hover:text-blue-600"><Pencil size={14}/></button>
                        <button onClick={() => setDeleteModal({ isOpen: true, id: p.id, name: p.name })} className="btn-icon-only text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        title="Artikel löschen?"
        message={`Möchten Sie "${deleteModal.name}" entfernen?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ ...deleteModal, isOpen: false, id: '', name: '' })}
      />
    </div>
  );
}