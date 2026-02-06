import {
  AlertTriangle,
  BarChart3,
  Loader2,
  MinusCircle,
  Package,
  Pencil,
  Plus,
  PlusCircle,
  Search,
  Trash2,
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
        <div className="page-container pb-safe">
            
            {/* HEADER SECTION */}
            <div className="header-section flex-col lg:flex-row items-stretch lg:items-center gap-4">
                <div>
                    <h1 className="page-title">Lager & Material</h1>
                    <p className="page-subtitle">Echtzeit-Überwachung der Bestände und Warenwerte.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="view-switcher-container w-full sm:w-auto px-1">
                        <div className="relative flex-1 sm:w-48 group">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Artikel suchen..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full bg-transparent border-none py-1.5 pl-8 pr-2 text-[12px] font-bold text-slate-700 focus:ring-0" 
                            />
                        </div>
                    </div>
                    <button onClick={() => navigate('/dashboard/inventory/new')} className="btn-primary w-full sm:w-auto uppercase tracking-wider">
                        <Plus size={16} /> Hinzufügen
                    </button>
                </div>
            </div>

            {/* KPI STATS */}
            <div className="stats-grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4 animate-in fade-in duration-500">
                <div className={`stat-card border-l-[3px] ${lowStockCount > 0 ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
                    <div className={`stat-icon-wrapper ${lowStockCount > 0 ? 'icon-danger' : 'icon-success'}`}>
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <span className="label-caps !ml-0 !mb-0">Kritisch</span>
                        <div className={`text-base font-black leading-tight ${lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {lowStockCount} <span className="text-[10px] font-bold">Mangel</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card border-l-[3px] border-l-blue-500">
                    <div className="stat-icon-wrapper icon-info">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <span className="label-caps !ml-0 !mb-0 text-blue-600/70">Warenwert</span>
                        <div className="text-base font-black text-slate-900 leading-tight">
                            {formatEuro(totalValue)}
                        </div>
                    </div>
                </div>

                <div className="stat-card border-l-[3px] border-l-slate-400 col-span-2 lg:col-span-1">
                    <div className="stat-icon-wrapper bg-slate-50 text-slate-500 border border-slate-100">
                        <Package size={18} />
                    </div>
                    <div>
                        <span className="label-caps !ml-0 !mb-0">Sortiment</span>
                        <div className="text-base font-black text-slate-900 leading-tight">
                            {products.length} <span className="text-[10px] font-bold">Artikel</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN TABLE */}
            <div className="table-container flex flex-col h-[600px] animate-in fade-in duration-500 pb-20 sm:pb-0">
                <div className="px-4 py-3 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                        <div className="stat-icon-box icon-purple"><BarChart3 size={14} /></div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Lagerbestand</h3>
                    </div>
                    <span className="status-badge bg-slate-50 text-slate-400 border-slate-200 !text-[8px]">
                        {filteredProducts.length} POSITIONEN
                    </span>
                </div>

                <div className="flex-1 custom-scrollbar overflow-y-auto bg-white">
                    <table className="table-main w-full">
                        <thead className="table-head sticky top-0 z-10 bg-white">
                            <tr>
                                <th className="table-cell">Produkt</th>
                                <th className="table-cell">SKU</th>
                                <th className="table-cell text-center">Bestand</th>
                                <th className="table-cell text-right">Einkaufspreis</th>
                                <th className="table-cell text-center">Status</th>
                                <th className="table-cell text-right pr-4">Aktion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={32}/>
                                        <span className="label-caps">Lagerdaten werden abgeglichen...</span>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Package size={32} className="mx-auto text-slate-200 mb-2" />
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Keine Artikel gefunden</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(p => (
                                    <tr key={p.id} className="table-row group">
                                        <td className="table-cell align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 shrink-0 shadow-sm group-hover:text-blue-500 transition-colors">
                                                    <Package size={14} />
                                                </div>
                                                <span className="font-bold text-slate-800 text-[13px]">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="table-cell align-middle">
                                            <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">
                                                {p.sku || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="table-cell align-middle">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => handleStockChange(p.id, -1)} className="text-slate-300 hover:text-red-500 transition-all hover:scale-110 active:scale-95"><MinusCircle size={18}/></button>
                                                <div className={`w-8 text-center font-mono font-black text-sm ${p.stock <= p.minStock ? 'text-red-600' : 'text-slate-700'}`}>{p.stock}</div>
                                                <button onClick={() => handleStockChange(p.id, 1)} className="text-slate-300 hover:text-emerald-500 transition-all hover:scale-110 active:scale-95"><PlusCircle size={18}/></button>
                                            </div>
                                        </td>
                                        <td className="table-cell text-right align-middle font-mono font-bold text-slate-600 text-[12px]">
                                            {formatEuro(parseFloat(p.costPrice))}
                                        </td>
                                        <td className="table-cell text-center align-middle">
                                            <span className={`status-badge !px-2 !py-0.5 !text-[8px] ${p.stock <= p.minStock ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {p.stock <= p.minStock ? 'NACHBESTELLEN' : 'BESTAND OK'}
                                            </span>
                                        </td>
                                        <td className="table-cell text-right pr-4 align-middle">
                                            <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => navigate(`/dashboard/inventory/edit/${p.id}`)} className="btn-icon-only text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Pencil size={14}/></button>
                                                <button onClick={() => setDeleteModal({ isOpen: true, id: p.id, name: p.name })} className="btn-icon-only text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14}/></button>
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
                message={`Möchten Sie den Artikel "${deleteModal.name}" wirklich aus dem Bestand entfernen?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ ...deleteModal, isOpen: false, id: '', name: '' })}
                variant="danger"
            />
        </div>
    );
}