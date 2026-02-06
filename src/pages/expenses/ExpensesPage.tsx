import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Euro,
  FileText,
  History,
  Info,
  Loader2,
  Plus,
  Receipt,
  Tag,
  Trash2,
  TrendingDown
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
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
    
    // Form States
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Material');

    // Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null);

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
        if (!amount) return toast.error("Bitte einen Betrag eingeben");
        
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
            toast.success("Ausgabe erfolgreich gebucht", { id: toastId });
            
        } catch (err) {
            toast.error("Fehler beim Speichern der Buchung.", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    const executeDelete = async () => {
        if (!deleteId) return;

        const originalExpenses = [...expenses];
        setExpenses(expenses.filter(e => e.id !== deleteId));

        try {
            await api.delete(`/expenses/${deleteId}`);
            toast.success("Buchung erfolgreich entfernt");
        } catch (error) {
            setExpenses(originalExpenses);
            toast.error("Fehler beim Löschen der Ausgabe.");
        } finally {
            setDeleteId(null);
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
        return <span className={`status-badge !text-[9px] ${cls}`}>{cat.toUpperCase()}</span>;
    };

    return (
        <div className="page-container pb-safe">
            
            {/* --- HEADER SECTION --- */}
            <div className="header-section">
                <div>
                    <h1 className="page-title">Betriebsausgaben</h1>
                    <p className="page-subtitle">Erfassung und Kontrolle geschäftlicher Kostenstellen.</p>
                </div>

                <div className="stat-card border-l-[3px] border-l-red-500 min-w-[200px] sm:min-w-[240px]">
                    <div className="stat-icon-wrapper icon-danger">
                        <TrendingDown size={18} />
                    </div>
                    <div>
                        <span className="label-caps !ml-0 !mb-0 text-red-600/70">Gesamtausgaben</span>
                        <div className="text-base font-black text-slate-900 leading-tight">
                            {formatEuro(getTotalAmount())}
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-grid animate-in fade-in slide-in-from-bottom-2 duration-500">
                
                {/* --- LINKS: HISTORIE --- */}
                <div className="lg:col-span-8 flex flex-col min-h-0">
                    <div className="table-container flex flex-col h-[600px]">
                        <div className="px-4 py-3 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
                            <div className="flex items-center gap-2">
                                <div className="stat-icon-box icon-info"><History size={14} /></div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Transaktions-Historie</h3>
                            </div>
                            <span className="status-badge bg-slate-50 text-slate-400 border-slate-200 !text-[8px]">
                                {expenses.length} BELEGE
                            </span>
                        </div>
                        
                        <div className="flex-1 custom-scrollbar overflow-y-auto bg-white">
                            <table className="table-main">
                                <thead className="table-head sticky top-0 z-10 bg-white">
                                    <tr>
                                        <th className="table-cell">Datum</th>
                                        <th className="table-cell">Beschreibung</th>
                                        <th className="table-cell text-center">Kategorie</th>
                                        <th className="table-cell text-right">Betrag</th>
                                        <th className="table-cell text-right pr-4">Aktion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <Loader2 className="animate-spin mx-auto mb-2 text-blue-600" size={32} /> 
                                                <span className="label-caps">Lade Buchungen...</span>
                                            </td>
                                        </tr>
                                    ) : expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <AlertCircle size={32} className="mx-auto text-slate-200 mb-2" />
                                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Keine Buchungen vorhanden</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses.map((ex) => (
                                            <tr key={ex.id} className="table-row group">
                                                <td className="table-cell align-middle">
                                                    <div className="flex items-center gap-1.5 font-bold text-slate-500 text-[11px]">
                                                        <CalendarDays size={12} className="text-slate-300"/>
                                                        {new Date(ex.date).toLocaleDateString('de-DE')}
                                                    </div>
                                                </td>
                                                <td className="table-cell align-middle text-left">
                                                    <div className="font-bold text-slate-800 text-[12px] leading-tight truncate max-w-[200px]">{ex.description}</div>
                                                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">REF: {ex.id.substring(0, 8).toUpperCase()}</div>
                                                </td>
                                                <td className="table-cell text-center align-middle">
                                                    {getCategoryBadge(ex.category)}
                                                </td>
                                                <td className="table-cell text-right align-middle">
                                                    <span className="font-black text-slate-900 text-[13px]">
                                                        {formatEuro(ex.amount)}
                                                    </span>
                                                </td>
                                                <td className="table-cell text-right pr-4 align-middle">
                                                    <button 
                                                        onClick={() => setDeleteId(ex.id)} 
                                                        className="btn-icon-only ml-auto sm:opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all"
                                                    >
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

                {/* --- RECHTS: NEUE BUCHUNG --- */}
                <div className="lg:col-span-4">
                    <div className="form-card !p-0 overflow-hidden sticky top-4">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                            <div className="bg-blue-600 p-1 rounded-md text-white shadow-sm">
                                <Receipt size={14} />
                            </div>
                            <span className="font-black text-slate-800 text-[11px] uppercase tracking-wider">Ausgabe erfassen</span>
                        </div>

                        <form onSubmit={handleCreate} className="p-5 space-y-5">
                            <div className="space-y-1.5">
                                <label className="label-caps !ml-0 text-blue-600">Beschreibung / Zweck</label>
                                <div className="relative group">
                                    <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input 
                                        required
                                        value={desc} 
                                        onChange={e => setDesc(e.target.value)}
                                        className="input-standard pl-10 font-bold text-[12px]"
                                        placeholder="z.B. Tanken Firmenwagen"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="label-caps !ml-0">Betrag Brutto (€)</label>
                                <div className="relative group">
                                    <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                        required
                                        value={amount} 
                                        onChange={e => setAmount(e.target.value)}
                                        className="input-standard pl-10 font-black text-slate-900 text-sm"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="label-caps !ml-0">Kostenstelle</label>
                                <div className="relative group">
                                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <select 
                                        value={category} 
                                        onChange={e => setCategory(e.target.value)}
                                        className="input-standard pl-10 appearance-none cursor-pointer font-bold text-[12px]"
                                    >
                                        <option value="Material">Reinigungsmaterial</option>
                                        <option value="Fuhrpark">Fuhrpark / KFZ</option>
                                        <option value="Büro">Büro & Verwaltung</option>
                                        <option value="Sonstiges">Sonstige Ausgaben</option>
                                    </select>
                                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="btn-primary w-full py-2.5 justify-center shadow-lg shadow-blue-500/20 font-black uppercase tracking-[0.1em] text-[11px]"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} className="mr-1.5" />}
                                Buchung speichern
                            </button>
                            
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-2">
                                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-blue-800 font-bold leading-tight uppercase tracking-tighter">
                                    Echtzeit-Abgleich: Buchungen werden sofort in die Rentabilitätsrechnung übernommen.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

            </div>

            {/* --- CONFIRM MODAL --- */}
            <ConfirmModal 
                isOpen={!!deleteId}
                title="Buchung löschen?"
                message="Möchten Sie diese Ausgabe wirklich dauerhaft aus der Buchhaltung entfernen? Dieser Vorgang kann nicht rückgängig gemacht werden."
                variant="danger"
                onConfirm={executeDelete}
                onCancel={() => setDeleteId(null)}
            />

        </div>
    );
}