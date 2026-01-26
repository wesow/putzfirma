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
  Info,
  History,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

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
      toast.error("Fehler beim Speichern.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Eintrag unwiderruflich löschen?")) return;
    
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

  const getCategoryClass = (cat: string) => {
    const map: Record<string, string> = {
      'Material': 'bg-blue-50 text-blue-700 border-blue-100',
      'Fuhrpark': 'bg-purple-50 text-purple-700 border-purple-100',
      'Büro': 'bg-amber-50 text-amber-700 border-amber-100',
      'Sonstiges': 'bg-slate-50 text-slate-700 border-slate-200'
    };
    return map[cat] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="page-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title flex items-center gap-3">
             Betriebsausgaben
          </h1>
          <p className="page-subtitle">Erfassung und Kontrolle geschäftlicher Kostenstellen.</p>
        </div>

        <div className="stat-card !border-l-red-500 !bg-red-50/30 min-w-[280px]">
            <div className="stat-icon-wrapper icon-critical shadow-sm">
                <TrendingDown size={22} />
            </div>
            <div className="text-left">
                <div className="label-caps !mb-0">Gesamtausgaben</div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatEuro(getTotalAmount())}
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* LINKS: TABELLE DER AUSGABEN */}
        <div className="lg:col-span-2 space-y-4">
          <div className="table-container shadow-xl shadow-slate-200/50">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-2">
                   <History size={18} className="text-slate-400" />
                   <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Buchungshistorie</h3>
                </div>
                <span className="status-badge bg-slate-100 text-slate-600 border-slate-200 font-black">
                    {expenses.length} BELEGE
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="table-main">
                <thead className="table-head">
                    <tr>
                      <th className="table-cell">Datum</th>
                      <th className="table-cell">Beschreibung</th>
                      <th className="table-cell text-center">Kategorie</th>
                      <th className="table-cell text-right">Betrag</th>
                      <th className="table-cell text-right">Aktion</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                          <td colSpan={5} className="py-20 text-center">
                            <Loader2 className="animate-spin mx-auto mb-3 text-blue-600" size={32} /> 
                            <span className="label-caps italic">Synchronisiere Buchhaltung...</span>
                          </td>
                        </tr>
                    ) : expenses.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-20 text-center">
                                <div className="flex flex-col items-center gap-3 text-slate-300">
                                    <AlertCircle size={48} className="opacity-20" />
                                    <p className="font-bold uppercase tracking-widest text-xs">Keine Buchungen vorhanden</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        expenses.map((ex) => (
                        <tr key={ex.id} className="table-row group">
                            <td className="table-cell">
                                <div className="flex items-center gap-2 font-bold text-slate-500 text-xs">
                                    <CalendarDays size={14} className="text-slate-300"/>
                                    {new Date(ex.date).toLocaleDateString('de-DE')}
                                </div>
                            </td>
                            <td className="table-cell">
                                <div className="font-black text-slate-800 text-sm">{ex.description}</div>
                                <div className="text-[9px] text-slate-400 uppercase tracking-tighter font-bold">Beleg-ID: {ex.id.split('-')[0]}</div>
                            </td>
                            <td className="table-cell text-center">
                                <span className={`status-badge !rounded-md font-black ${getCategoryClass(ex.category)}`}>
                                    {ex.category.toUpperCase()}
                                </span>
                            </td>
                            <td className="table-cell text-right">
                                <span className="font-black text-slate-900 text-sm">
                                  {formatEuro(ex.amount)}
                                </span>
                            </td>
                            <td className="table-cell text-right">
                                <button onClick={() => handleDelete(ex.id)} className="btn-ghost-danger opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={16} />
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

        {/* RECHTS: FORMULAR */}
        <div className="lg:sticky lg:top-8">
            <div className="form-card !p-0 overflow-hidden border-none shadow-2xl shadow-blue-900/5">
                <div className="bg-slate-900 p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Plus size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-widest">Neue Buchung</h3>
                            <p className="text-slate-400 text-[10px] font-bold tracking-tight">Echtzeit-Kostenerfassung</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleCreate} className="p-8 space-y-6 bg-white">
                    <div className="space-y-1.5">
                        <label className="label-caps">Beschreibung des Belegs</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <FileText size={18} />
                            </div>
                            <input 
                                required
                                value={desc} 
                                onChange={e => setDesc(e.target.value)}
                                className="input-standard pl-12"
                                placeholder="z.B. Tanken Firmenwagen"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-1.5">
                            <label className="label-caps">Rechnungsbetrag</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Euro size={18} />
                                </div>
                                <input 
                                    required
                                    value={amount} 
                                    onChange={e => setAmount(e.target.value)}
                                    className="input-standard pl-12 font-black text-lg"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="label-caps">Kostenstelle / Kategorie</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <Tag size={18} />
                                </div>
                                <select 
                                    value={category} 
                                    onChange={e => setCategory(e.target.value)}
                                    className="input-standard pl-12 appearance-none cursor-pointer"
                                >
                                    <option value="Material">Reinigungsmaterial</option>
                                    <option value="Fuhrpark">Fuhrpark / KFZ</option>
                                    <option value="Büro">Büro & Verwaltung</option>
                                    <option value="Sonstiges">Sonstige Ausgaben</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="btn-primary w-full py-4 justify-center shadow-xl shadow-blue-500/20"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <SaveIcon size={20} />}
                        <span className="font-black uppercase tracking-widest text-[11px]">Buchung abschließen</span>
                    </button>
                    
                    <div className="bg-blue-50 rounded-2xl p-4 flex gap-3 border border-blue-100">
                        <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-800/80 font-bold leading-relaxed uppercase tracking-tight">
                            Diese Ausgabe wird sofort in der G&V Rechnung sowie im Dashboard-Profit berücksichtigt.
                        </p>
                    </div>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
}

// Hilfskomponente für den Save Button
function SaveIcon({size}: {size: number}) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
    )
}