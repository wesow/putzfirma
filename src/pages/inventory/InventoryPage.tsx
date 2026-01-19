import { useEffect, useState } from 'react';
import { Package, Plus, AlertTriangle, Search, Trash2, MinusCircle, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

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
  const [searchTerm, setSearchTerm] = useState('');

  // Form State für neues Produkt
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', sku: '', stock: 0, minStock: 5, costPrice: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // 🟢 KORRIGIERT: Nur '/inventory' statt '/api/inventory'
      const res = await api.get('/inventory'); 
      setProducts(res.data);
    } catch (error) {
      toast.error("Konnte Lagerbestand nicht laden");
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = async (id: string, change: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock + change } : p));

    try {
      // 🟢 KORRIGIERT:
      await api.patch(`/inventory/${id}/stock`, { change });
    } catch (error) {
      toast.error("Fehler beim Speichern");
      fetchProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Produkt wirklich löschen?")) return;
    try {
      // 🟢 KORRIGIERT:
      await api.delete(`/inventory/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Produkt gelöscht");
    } catch (error) {
      toast.error("Fehler beim Löschen");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 🟢 KORRIGIERT:
      await api.post('/inventory', newProd);
      toast.success("Produkt angelegt!");
      setIsModalOpen(false);
      setNewProd({ name: '', sku: '', stock: 0, minStock: 5, costPrice: 0 });
      fetchProducts();
    } catch (error) {
      toast.error("Fehler beim Anlegen");
    }
  };

  // Filter Logik
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-blue-600" /> Lager & Material
          </h1>
          <p className="text-slate-500 text-sm">Verwalte Reinigungsmittel und Ausrüstung.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Neues Produkt
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-2">
        <Search className="text-slate-400" />
        <input 
          placeholder="Suche nach Name oder Artikelnummer..." 
          className="w-full outline-none text-slate-700 font-medium"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Bestand</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={4} className="p-6 text-center text-slate-400">Lade...</td></tr> : 
             filteredProducts.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-slate-400">Keine Produkte gefunden.</td></tr> :
             filteredProducts.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition">
                <td className="p-4">
                  <div className="font-bold text-slate-700">{p.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{p.sku || '-'}</div>
                </td>
                
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleStockChange(p.id, -1)} className="text-slate-400 hover:text-red-500 transition"><MinusCircle size={20}/></button>
                    <span className={`font-mono font-bold text-lg w-8 text-center ${p.stock <= p.minStock ? 'text-red-600' : 'text-slate-700'}`}>
                      {p.stock}
                    </span>
                    <button onClick={() => handleStockChange(p.id, 1)} className="text-slate-400 hover:text-green-600 transition"><PlusCircle size={20}/></button>
                  </div>
                </td>

                <td className="p-4">
                  {p.stock <= p.minStock ? (
                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-100 w-fit">
                      <AlertTriangle size={12}/> Knapp! (Min: {p.minStock})
                    </span>
                  ) : (
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-100">
                      OK
                    </span>
                  )}
                </td>

                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-300 hover:text-red-600 transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: NEUES PRODUKT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4">Neues Produkt anlegen</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                <input required className="w-full border rounded-lg p-2" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} placeholder="z.B. Glasreiniger" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Artikelnummer (SKU)</label>
                <input className="w-full border rounded-lg p-2" value={newProd.sku} onChange={e => setNewProd({...newProd, sku: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start-Bestand</label>
                  <input type="number" className="w-full border rounded-lg p-2" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Warnung ab</label>
                  <input type="number" className="w-full border rounded-lg p-2" value={newProd.minStock} onChange={e => setNewProd({...newProd, minStock: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Einkaufspreis (€)</label>
                  <input type="number" step="0.01" className="w-full border rounded-lg p-2" value={newProd.costPrice} onChange={e => setNewProd({...newProd, costPrice: Number(e.target.value)})} />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Abbrechen</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}