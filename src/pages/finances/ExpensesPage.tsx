import { useEffect, useState } from 'react';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import api from '../../lib/api';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Material');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/expenses', {
        description: desc,
        amount: parseFloat(amount),
        category: category,
        date: new Date()
      });
      setExpenses([res.data, ...expenses]); // Oben einfügen
      setDesc(''); setAmount('');
    } catch (err) {
      alert("Fehler beim Speichern");
    }
  };

  const formatEuro = (val: number) => Number(val).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LINKKS: LISTE */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Receipt className="text-blue-600" /> Ausgabenübersicht
        </h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="p-4">Datum</th>
                <th className="p-4">Beschreibung</th>
                <th className="p-4">Kategorie</th>
                <th className="p-4 text-right">Betrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-500">
                    {new Date(ex.date).toLocaleDateString('de-DE')}
                  </td>
                  <td className="p-4 font-medium text-slate-700">{ex.description}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-600 border border-slate-200">
                      {ex.category}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-red-600">
                    - {formatEuro(ex.amount)}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && !loading && (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Keine Ausgaben gebucht.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECHTS: NEUE AUSGABE */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
        <h3 className="font-bold text-slate-800 mb-4">Ausgabe erfassen</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Beschreibung</label>
            <input 
              required
              value={desc} onChange={e => setDesc(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="z.B. Tanken Shell"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Betrag (€)</label>
              <input 
                required type="number" step="0.01"
                value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Kategorie</label>
              <select 
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="Material">Material</option>
                <option value="Fuhrpark">Fuhrpark</option>
                <option value="Büro">Büro</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2">
            <Plus size={18} /> Buchen
          </button>
        </form>
      </div>

    </div>
  );
}