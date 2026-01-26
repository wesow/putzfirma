import { useEffect, useState } from 'react';
import { 
  Plus, AlertTriangle, Search, Trash2, 
  MinusCircle, PlusCircle, Loader2, X, TrendingUp,
  AlertCircle, CheckCircle, Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import ConfirmModal from '../../components/ConfirmModal';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  costPrice: number | string | any;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });
  
  const [newProd, setNewProd] = useState({ 
    name: '', sku: '', stock: 0, minStock: 5, costPrice: 0 
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/inventory'); 
      setProducts(res.data);
    } catch (error: any) {
      toast.error("Fehler beim Laden des Bestands.");
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
      toast.error("Synchronisierung fehlgeschlagen.");
      fetchProducts();
    }
  };

  const confirmDelete = async () => {
    const tid = toast.loading("Wird gelöscht...");
    try {
      await api.delete(`/inventory/${deleteModal.id}`);
      setProducts(prev => prev.filter(p => p.id !== deleteModal.id));
      toast.success("Gelöscht", { id: tid });
      setDeleteModal({ ...deleteModal, isOpen: false });
    } catch {
      toast.error("Fehler", { id: tid });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const tid = toast.loading("Speichere...");
    try {
      await api.post('/inventory', newProd);
      toast.success("Angelegt!", { id: tid });
      setIsModalOpen(false);
      setNewProd({ name: '', sku: '', stock: 0, minStock: 5, costPrice: 0 });
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Fehler", { id: tid });
    } finally { setSubmitting(false); }
  };

  const formatPrice = (price: any) => {
    const num = parseFloat(price);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const totalValue = products.reduce((acc, p) => acc + (p.stock * (parseFloat(p.costPrice) || 0)), 0);
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      
      {/* HEADER */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title leading-none">Inventar-Verwaltung</h1>
          <p className="page-subtitle text-slate-500 mt-2 font-medium">Bestände und Lagerwerte in Echtzeit kontrollieren.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                    placeholder="Artikel oder SKU suchen..." 
                    className="input-standard pl-10" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary shadow-blue-200">
                <Plus size={18} /> <span>Neuer Artikel</span>
            </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid animate-in fade-in slide-in-from-top-4 duration-500">
          <div className={`stat-card border-l-4 transition-all ${lowStockCount > 0 ? 'border-l-red-500 bg-red-50/30' : 'border-l-emerald-500 bg-emerald-50/30'}`}>
              <div className={`stat-icon-wrapper ${lowStockCount > 0 ? 'icon-critical' : 'icon-success'} shadow-sm`}>
                  <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                  <div className="label-caps !mb-0">Mangelbestand</div>
                  <div className={`text-2xl font-black tracking-tight ${lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {lowStockCount} Artikel
                  </div>
              </div>
          </div>

          <div className="stat-card border-l-4 border-l-blue-500">
              <div className="stat-icon-wrapper icon-info shadow-sm">
                  <TrendingUp size={20} />
              </div>
              <div className="flex-1">
                  <div className="label-caps !mb-0">Gesamtwert</div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                      {totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </div>
              </div>
          </div>

          <div className="stat-card border-slate-200">
              <div className="stat-icon-wrapper bg-slate-100 text-slate-600 shadow-sm">
                  <Package size={20} />
              </div>
              <div className="flex-1">
                  <div className="label-caps !mb-0">Produkttypen</div>
                  <div className="text-2xl font-black text-slate-800 tracking-tight">{products.length}</div>
              </div>
          </div>
      </div>

      {/* TABLE */}
      <div className="table-container shadow-xl shadow-slate-200/50 animate-in fade-in duration-700">
        <div className="overflow-x-auto">
            <table className="table-main">
              <thead className="table-head">
                  <tr>
                      <th className="table-cell">Artikel & Identifikation</th>
                      <th className="table-cell">Aktueller Bestand</th>
                      <th className="table-cell text-center">Status</th>
                      <th className="table-cell text-right">Aktionen</th>
                  </tr>
              </thead>
              <tbody>
                  {loading ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <Loader2 className="animate-spin mx-auto text-blue-600 mb-3" size={40} />
                          <span className="label-caps italic">Inventur läuft...</span>
                        </td>
                      </tr>
                  ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                            <AlertCircle size={40} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Keine Artikel gefunden</p>
                        </td>
                      </tr>
                  ) : (
                      filteredProducts.map(p => (
                      <tr key={p.id} className="table-row group">
                          <td className="table-cell">
                              <div className="flex flex-col text-left">
                                <span className="font-black text-slate-800 text-sm">{p.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded tracking-tighter">SKU: {p.sku || 'N/A'}</span>
                                    <span className="text-blue-600 font-black text-[10px] italic">{formatPrice(p.costPrice)} € / Einheit</span>
                                </div>
                              </div>
                          </td>
                          <td className="table-cell">
                              <div className="flex items-center gap-3 bg-slate-50 w-fit px-2 py-1 rounded-xl border border-slate-100">
                                  <button 
                                    onClick={() => handleStockChange(p.id, -1)} 
                                    className="text-slate-400 hover:text-red-500 transition-colors active:scale-90"
                                  >
                                    <MinusCircle size={20}/>
                                  </button>
                                  <span className={`font-mono font-black text-base min-w-[30px] text-center ${p.stock <= p.minStock ? 'text-red-600' : 'text-slate-700'}`}>
                                    {p.stock}
                                  </span>
                                  <button 
                                    onClick={() => handleStockChange(p.id, 1)} 
                                    className="text-slate-400 hover:text-emerald-500 transition-colors active:scale-90"
                                  >
                                    <PlusCircle size={20}/>
                                  </button>
                              </div>
                          </td>
                          <td className="table-cell text-center">
                              <span className={`status-badge !rounded-md font-black shadow-sm ${p.stock <= p.minStock ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                                {p.stock <= p.minStock ? <AlertTriangle size={12} className="mr-1" /> : <CheckCircle size={12} className="mr-1" />}
                                {p.stock <= p.minStock ? 'BESTELLEN' : 'VORRÄTIG'}
                              </span>
                          </td>
                          <td className="table-cell text-right">
                              <button 
                                onClick={() => setDeleteModal({ isOpen: true, id: p.id, name: p.name })} 
                                className="btn-ghost-danger opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                          </td>
                      </tr>
                      ))
                  )}
              </tbody>
            </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content !max-w-md animate-in zoom-in-95 duration-200">
            <div className="modal-header !bg-slate-900 !text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Package size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-black uppercase tracking-widest">Artikel erfassen</h2>
                    <p className="text-[10px] text-slate-400 font-bold tracking-tight">Neuzugang im Lagerbestand</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors">
                  <X size={20}/>
                </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body space-y-6 !p-8">
                <div className="space-y-1.5 text-left">
                  <label className="label-caps">Produktbezeichnung *</label>
                  <input required className="input-standard font-bold" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} placeholder="z.B. Microfasertuch Blau" />
                </div>

                <div className="grid grid-cols-2 gap-6 text-left">
                  <div className="space-y-1.5">
                    <label className="label-caps">SKU / Barcode</label>
                    <input className="input-standard font-mono" value={newProd.sku} onChange={e => setNewProd({...newProd, sku: e.target.value})} placeholder="REF-001" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-caps">EK-Preis (€)</label>
                    <input type="number" step="0.01" className="input-standard font-black" value={newProd.costPrice} onChange={e => setNewProd({...newProd, costPrice: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 text-left">
                  <div className="space-y-1.5">
                    <label className="label-caps text-blue-600">Startbestand</label>
                    <input type="number" className="input-standard bg-white font-black" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-caps text-red-500">Warnschwelle</label>
                    <input type="number" className="input-standard bg-white font-black" value={newProd.minStock} onChange={e => setNewProd({...newProd, minStock: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="modal-footer !bg-slate-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary !shadow-none !border-transparent">
                  Abbrechen
                </button>
                <button type="submit" disabled={submitting} className="btn-primary min-w-[160px] py-3 shadow-blue-500/20">
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                        <Plus size={18} />
                        <span className="font-black uppercase tracking-widest text-[10px]">Speichern</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        title="Artikel dauerhaft entfernen"
        message={`Möchten Sie "${deleteModal.name}" wirklich aus dem Bestand löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ ...deleteModal, isOpen: false })}
      />
    </div>
  );
}