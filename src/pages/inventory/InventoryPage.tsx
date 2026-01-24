import { useEffect, useState } from 'react';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  Search, 
  Trash2, 
  MinusCircle, 
  PlusCircle, 
  Loader2, 
  X, 
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

// --- TYPEN ---
interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  costPrice: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', sku: '', stock: 0, minStock: 5, costPrice: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/inventory'); 
      setProducts(res.data);
    } catch (error) {
      toast.error("Konnte Lagerbestand nicht laden");
    } finally {
      setLoading(false);
    }
  };

  // Optimistic Update für schnelles Feedback beim Klicken
  const handleStockChange = async (id: string, change: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + change) } : p));

    try {
      await api.patch(`/inventory/${id}/stock`, { change });
    } catch (error) {
      toast.error("Fehler beim Speichern - Rollback");
      fetchProducts(); // Rollback bei Fehler
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Produkt wirklich löschen?")) return;
    
    const original = [...products];
    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      await api.delete(`/inventory/${id}`);
      toast.success("Produkt gelöscht");
    } catch (error) {
      setProducts(original);
      toast.error("Fehler beim Löschen");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading("Produkt wird angelegt...");
    try {
      await api.post('/inventory', newProd);
      toast.success("Erfolgreich erstellt!", { id: toastId });
      setIsModalOpen(false);
      setNewProd({ name: '', sku: '', stock: 0, minStock: 5, costPrice: 0 });
      fetchProducts();
    } catch (error) {
      toast.error("Fehler beim Anlegen", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // KPI Berechnungen
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const totalValue = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);

  // Filter Logik
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER & KPIS */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Package className="text-blue-600" size={32} /> Lager & Material
            </h1>
            <p className="text-slate-500 mt-1">Bestand verwalten und Engpässe vermeiden.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
          >
            <Plus size={20} /> Produkt anlegen
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border transition-all shadow-sm flex items-center gap-5 ${lowStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                <div className={`p-3.5 rounded-xl ${lowStockCount > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    <AlertTriangle size={28} />
                </div>
                <div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-60">Kritischer Bestand</div>
                    <div className="text-2xl font-extrabold">{lowStockCount} Artikel</div>
                </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white flex items-center gap-5 shadow-sm">
                <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600">
                    <TrendingUp size={28} />
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lagerwert (EK)</div>
                    <div className="text-2xl font-extrabold text-slate-800">
                        {totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          placeholder="Suche nach Name oder SKU..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                <tr>
                    <th className="px-6 py-4 border-b border-slate-100">Name / SKU</th>
                    <th className="px-6 py-4 border-b border-slate-100">Bestand</th>
                    <th className="px-6 py-4 border-b border-slate-100">Status</th>
                    <th className="px-6 py-4 border-b border-slate-100 text-right">Aktion</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400 flex flex-col items-center"><Loader2 className="animate-spin mb-2" /> Lade Inventar...</td></tr>
                ) : filteredProducts.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                           <div className="flex flex-col items-center gap-2">
                                <Package className="opacity-20 h-10 w-10" />
                                <span>Keine Produkte gefunden.</span>
                           </div>
                        </td>
                    </tr>
                ) : (
                    filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 text-base">{p.name}</div>
                            <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">SKU: {p.sku || '-'}</span>
                                <span className="text-slate-300">|</span>
                                <span className="font-medium">EK: {p.costPrice.toFixed(2)} €</span>
                            </div>
                        </td>
                        
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3 bg-white border border-slate-200 w-fit px-2 py-1 rounded-xl shadow-sm">
                                <button onClick={() => handleStockChange(p.id, -1)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><MinusCircle size={20}/></button>
                                <span className={`font-mono font-bold text-lg min-w-[2.5rem] text-center ${p.stock <= p.minStock ? 'text-red-600' : 'text-slate-700'}`}>
                                    {p.stock}
                                </span>
                                <button onClick={() => handleStockChange(p.id, 1)} className="text-slate-400 hover:text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition-colors"><PlusCircle size={20}/></button>
                            </div>
                        </td>

                        <td className="px-6 py-4">
                            {p.stock <= p.minStock ? (
                                <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-100 animate-pulse">
                                    <AlertCircle size={14}/> 
                                    Nachbestellen
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                    Verfügbar
                                </span>
                            )}
                        </td>

                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => handleDelete(p.id)} 
                                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="Produkt löschen"
                            >
                                <Trash2 size={20} />
                            </button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* MODAL: NEUES PRODUKT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Neues Produkt</h2>
                    <p className="text-sm text-slate-500">Legen Sie einen neuen Bestandsartikel an.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Produktname *</label>
                    <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} placeholder="z.B. Glasreiniger 1L" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Artikelnummer (SKU)</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" value={newProd.sku} onChange={e => setNewProd({...newProd, sku: e.target.value})} placeholder="INV-001"/>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Einkaufspreis (€)</label>
                      <input type="number" step="0.01" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={newProd.costPrice} onChange={e => setNewProd({...newProd, costPrice: Number(e.target.value)})} />
                  </div>
              </div>
              
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-blue-600 uppercase mb-1.5">Aktueller Bestand</label>
                  <input type="number" className="w-full bg-white border border-blue-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase mb-1.5">Warnung ab</label>
                  <input type="number" className="w-full bg-white border border-red-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-red-600" value={newProd.minStock} onChange={e => setNewProd({...newProd, minStock: Number(e.target.value)})} />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Abbrechen</button>
                <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                >
                    {submitting ? <Loader2 className="animate-spin" size={20}/> : <Plus size={20}/>}
                    Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}