import { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  TrendingDown, 
  Loader2, 
  Tag, 
  Euro, 
  FileText,
  CalendarDays,
  Info,
  History,
  AlertCircle,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

// --- Interfaces ---
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
      toast.success("Ausgabe gebucht", { id: toastId });
      
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
      toast.success("Buchung entfernt");
    } catch (error) {
      setExpenses(originalExpenses);
      toast.error("Fehler beim Löschen.");
    }
  };

  const formatEuro = (val: number) => Number(val).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  const getTotalAmount = () => expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const getCategoryBadge = (cat: string) => {
    const map: Record<string, string> = {
      'Material': 'bg-blue-50 text-blue-600 border-blue-100',
      'Fuhrpark': 'bg-purple-50 text-purple-600 border-purple-100',
      'Büro': 'bg-amber-50 text-amber-600 border-amber-100',
      'Sonstiges': 'bg-slate-50 text-slate-500 border-slate-200'
    };
    const cls = map[cat] || 'bg-slate-50 text-slate-500 border-slate-200';
    return <span className={`status-badge ${cls}`}>{cat.toUpperCase()}</span>;
  };

  return (
    <div className="page-container">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        <div>
          <h1 className="page-title">Betriebsausgaben</h1>
          <p className="page-subtitle">Erfassung und Kontrolle geschäftlicher Kostenstellen.</p>
        </div>

        {/* Kompakte KPI Karte passend zum System */}
        <div className="stat-card !border-l-red-500 min-w-[240px]">
            <div className="stat-icon-wrapper icon-critical">
                <TrendingDown size={18} />
            </div>
            <div>
                <span className="label-caps">Gesamtausgaben</span>
                <div className="text-lg font-bold text-slate-900 leading-none">
                  {formatEuro(getTotalAmount())}
                </div>
            </div>
        </div>
      </div>

      <div className="content-grid lg:grid-cols-12 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {/* --- LINKS: HISTORIE (TABELLE) --- */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <div className="table-container">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
                <div className="flex items-center gap-2">
                   <History size={14} className="text-slate-400" />
                   <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Buchungshistorie</h3>
                </div>
                <span className="status-badge bg-slate-50 text-slate-500 border-slate-200 font-bold">
                    {expenses.length} BELEGE
                </span>
            </div>
            
            <div className="flex-1 custom-scrollbar overflow-y-auto min-h-[500px]">
                <table className="table-main">
                <thead className="table-head">
                    <tr>
                      <th className="table-cell pl-4 w-32">Datum</th>
                      <th className="table-cell">Beschreibung</th>
                      <th className="table-cell text-center">Kategorie</th>
                      <th className="table-cell text-right">Betrag</th>
                      <th className="table-cell text-right pr-4">Aktion</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                          <td colSpan={5} className="py-20 text-center text-slate-400">
                            <Loader2 className="animate-spin mx-auto mb-2" size={24} /> 
                            <span className="label-caps font-medium">Lade Buchungen...</span>
                          </td>
                        </tr>
                    ) : expenses.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-20 text-center">
                                <AlertCircle size={32} className="mx-auto text-slate-200 mb-2" />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Keine Buchungen vorhanden</p>
                            </td>
                        </tr>
                    ) : (
                        expenses.map((ex) => (
                        <tr key={ex.id} className="table-row group">
                            <td className="table-cell pl-4 align-middle">
                                <div className="flex items-center gap-2 font-bold text-slate-500 text-[11px]">
                                    <CalendarDays size={12} className="text-slate-300"/>
                                    {new Date(ex.date).toLocaleDateString('de-DE')}
                                </div>
                            </td>
                            <td className="table-cell align-middle">
                                <div className="font-bold text-slate-800 text-[13px] leading-tight">{ex.description}</div>
                                <div className="text-[9px] text-slate-400 font-mono">ID: {ex.id.substring(0, 8)}</div>
                            </td>
                            <td className="table-cell text-center align-middle">
                                {getCategoryBadge(ex.category)}
                            </td>
                            <td className="table-cell text-right align-middle">
                                <span className="font-black text-slate-900 text-sm">
                                  {formatEuro(ex.amount)}
                                </span>
                            </td>
                            <td className="table-cell text-right pr-4 align-middle">
                                <button onClick={() => handleDelete(ex.id)} className="btn-icon-only text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={14} />
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

        {/* --- RECHTS: NEUE BUCHUNG (FORMULAR) --- */}
        <div className="lg:col-span-4 lg:sticky lg:top-4 h-fit">
            <div className="form-card overflow-hidden">
                <div className="form-section-title !mb-4 !pb-3">
                  <Receipt size={14} className="text-blue-500" /> Neue Ausgabe erfassen
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-1">
                        <label className="label-caps">Beschreibung / Zweck</label>
                        <div className="relative group">
                            <FileText size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                            <input 
                                required
                                value={desc} 
                                onChange={e => setDesc(e.target.value)}
                                className="input-standard pl-9"
                                placeholder="z.B. Tanken Firmenwagen"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <label className="label-caps">Betrag Brutto</label>
                            <div className="relative group">
                                <Euro size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                <input 
                                    required
                                    value={amount} 
                                    onChange={e => setAmount(e.target.value)}
                                    className="input-standard pl-9 font-bold text-slate-900"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="label-caps">Kostenstelle</label>
                            <div className="relative">
                                <Tag size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                <select 
                                    value={category} 
                                    onChange={e => setCategory(e.target.value)}
                                    className="input-standard pl-9 appearance-none cursor-pointer font-medium"
                                >
                                    <option value="Material">Reinigungsmaterial</option>
                                    <option value="Fuhrpark">Fuhrpark / KFZ</option>
                                    <option value="Büro">Büro & Verwaltung</option>
                                    <option value="Sonstiges">Sonstige Ausgaben</option>
                                </select>
                                <ChevronRight size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="btn-primary w-full py-2 justify-center shadow-md shadow-blue-600/10 mt-2"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                        <span>Buchung speichern</span>
                    </button>
                    
                    <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 flex gap-2">
                        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-800 font-medium leading-normal uppercase tracking-tight">
                            Ausgaben werden direkt in die monatliche Rentabilitätsrechnung übernommen.
                        </p>
                    </div>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
}