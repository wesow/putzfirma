import { useEffect, useState } from 'react';
import { 
  Plus, 
  Receipt, 
  Trash2, 
  TrendingDown, 
  Loader2, 
  Tag, 
  Euro, 
  FileText,
  CalendarDays,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

// Typ-Definition
interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
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
      toast.error("Ausgaben konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading("Ausgabe wird gebucht...");
    
    try {
      const res = await api.post('/expenses', {
        description: desc,
        amount: parseFloat(amount.replace(',', '.')),
        category: category,
        date: new Date()
      });
      
      setExpenses([res.data, ...expenses]);
      setDesc(''); 
      setAmount('');
      toast.success("Ausgabe erfolgreich gebucht!", { id: toastId });
      
    } catch (err) {
      console.error(err);
      toast.error("Fehler beim Speichern.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Wirklich löschen?")) return;
    
    const originalExpenses = [...expenses];
    setExpenses(expenses.filter(e => e.id !== id));

    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Eintrag entfernt.");
    } catch (error) {
      setExpenses(originalExpenses);
      toast.error("Fehler beim Löschen.");
    }
  };

  const formatEuro = (val: number) => Number(val).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  const getTotalAmount = () => expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const getCategoryBadge = (cat: string) => {
    const styles: Record<string, string> = {
      'Material': 'bg-blue-50 text-blue-700 border-blue-100',
      'Fuhrpark': 'bg-orange-50 text-orange-700 border-orange-100',
      'Büro': 'bg-purple-50 text-purple-700 border-purple-100',
      'Sonstiges': 'bg-slate-50 text-slate-700 border-slate-200'
    };
    return styles[cat] || styles['Sonstiges'];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER & KPI */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Receipt className="text-blue-600" size={32} /> Ausgaben
          </h1>
          <p className="text-slate-500 mt-1">Verwalten und erfassen Sie Ihre Betriebsausgaben.</p>
        </div>

        {/* KPI Card */}
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl relative z-10">
                <TrendingDown size={28} />
            </div>
            <div className="relative z-10">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gesamtausgaben</div>
                <div className="text-2xl font-extrabold text-slate-800">{formatEuro(getTotalAmount())}</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LINKS: LISTE */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Buchungshistorie</h3>
                <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
                    {expenses.length} Einträge
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider border-b border-slate-200">
                    <tr>
                    <th className="px-6 py-4">Datum</th>
                    <th className="px-6 py-4">Beschreibung</th>
                    <th className="px-6 py-4">Kategorie</th>
                    <th className="px-6 py-4 text-right">Betrag</th>
                    <th className="px-6 py-4 text-right">Aktion</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center"><Loader2 className="animate-spin mb-2" /> Lade Buchungen...</td></tr>
                    ) : expenses.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-2">
                                    <FileText className="opacity-20 h-10 w-10" />
                                    <span>Keine Ausgaben erfasst.</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        expenses.map((ex) => (
                        <tr key={ex.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-medium">
                                <div className="flex items-center gap-2">
                                    <CalendarDays size={16} className="text-blue-400"/>
                                    {new Date(ex.date).toLocaleDateString('de-DE')}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700">{ex.description}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${getCategoryBadge(ex.category)}`}>
                                    {ex.category}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-extrabold text-slate-800">
                                {formatEuro(ex.amount)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => handleDelete(ex.id)}
                                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Löschen"
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
        </div>

        {/* RECHTS: FORMULAR (STICKY) */}
        <div className="h-fit sticky top-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                        <Plus size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800">Neue Ausgabe</h3>
                </div>

                <form onSubmit={handleCreate} className="space-y-5">
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Beschreibung</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <FileText size={18} />
                        </div>
                        <input 
                            required
                            value={desc} 
                            onChange={e => setDesc(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                            placeholder="z.B. Tanken Shell"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Betrag (€)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Euro size={18} />
                            </div>
                            <input 
                                required type="text"
                                value={amount} 
                                onChange={e => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold text-slate-700"
                                placeholder="0,00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Kategorie</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Tag size={18} />
                            </div>
                            <select 
                                value={category} 
                                onChange={e => setCategory(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer font-medium text-slate-700"
                            >
                                <option value="Material">Material</option>
                                <option value="Fuhrpark">Fuhrpark</option>
                                <option value="Büro">Büro</option>
                                <option value="Sonstiges">Sonstiges</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                        Kosten buchen
                    </button>
                </div>
                
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 text-blue-700 text-xs">
                    <Info size={16} className="shrink-0" />
                    <p>Diese Ausgaben fließen automatisch in Ihre BWA-Monatsberichte ein.</p>
                </div>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
}