import {
    AlertTriangle,
    DollarSign,
    FileSpreadsheet,
    Landmark,
    Loader2,
    Receipt,
    Send,
    ShieldAlert,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

// --- TYPEN ---
interface AnalysisData {
    period: string;
    revenue: number;
    laborCost: number;
    profit: number;
    margin: string;
}

interface OverdueInvoice {
    id: string;
    invoiceNumber: string;
    dueDate: string;
    totalGross: number;
    dunningLevel: number;
    lastDunningDate: string | null;
    customer: {
        companyName: string | null;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default function FinancePage() {
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [overdueInvoices, setOverdueInvoices] = useState<OverdueInvoice[]>([]);
    
    const [isDownloadingSepa, setIsDownloadingSepa] = useState(false);
    const [processingDunningId, setProcessingDunningId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [analysisRes, overdueRes] = await Promise.all([
                api.get('/finance/analysis'),
                api.get('/finance/dunning/candidates')
            ]);
            setAnalysis(analysisRes.data);
            setOverdueInvoices(overdueRes.data);
        } catch (e) {
            toast.error("Finanzdaten konnten nicht geladen werden.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadSepa = async () => {
        setIsDownloadingSepa(true);
        const toastId = toast.loading("Generiere XML...");
        try {
            const response = await api.get('/finance/sepa-xml', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `SEPA_${new Date().toISOString().split('T')[0]}.xml`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success("Download gestartet!", { id: toastId });
        } catch (error: any) {
            toast.error("Keine offenen Lastschriften.", { id: toastId });
        } finally {
            setIsDownloadingSepa(false);
        }
    };

    const handleExecuteDunning = async (invoice: OverdueInvoice) => {
        const nextLevel = invoice.dunningLevel + 1;
        if(!confirm(`Mahnstufe ${nextLevel} für ${invoice.invoiceNumber} auslösen?`)) return;

        setProcessingDunningId(invoice.id);
        const toastId = toast.loading("Sende Mahnung...");
        try {
            await api.post('/finance/dunning/execute', { invoiceId: invoice.id });
            toast.success(`Mahnstufe ${nextLevel} erreicht!`, { id: toastId });
            fetchData(); 
        } catch (e) {
            toast.error("Fehler beim Mahnen", { id: toastId });
        } finally {
            setProcessingDunningId(null);
        }
    };

    const formatEuro = (val: number) => Number(val).toLocaleString('de-DE', {style:'currency', currency:'EUR'});

    if (loading) return (
        <div className="page-container flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    return (
        <div className="page-container pb-safe">
            
            {/* HEADER */}
            <div className="header-section">
                <div>
                    <h1 className="page-title">Finanzen & Controlling</h1>
                    <p className="page-subtitle">Liquiditätsmanagement und Rentabilitätsanalyse.</p>
                </div>
            </div>

            {/* 1. CONTROLLING CARDS */}
            {analysis && (
                <div className="stats-grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="stat-card relative overflow-hidden group border-l-[3px] border-l-blue-500">
                        <div className="absolute -top-2 -right-2 p-3 opacity-[0.03] text-slate-900 group-hover:scale-110 transition-transform"><DollarSign size={80}/></div>
                        <div className="relative z-10">
                            <p className="label-caps !ml-0 !mb-0 text-blue-600/70">Umsatz (Netto)</p>
                            <h3 className="text-xl font-black text-slate-900 mt-1">{formatEuro(analysis.revenue)}</h3>
                            <p className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md w-fit border border-slate-100">{analysis.period}</p>
                        </div>
                    </div>

                    <div className="stat-card relative overflow-hidden group border-l-[3px] border-l-red-500">
                        <div className="absolute -top-2 -right-2 p-3 opacity-[0.03] text-red-600 group-hover:scale-110 transition-transform"><TrendingDown size={80}/></div>
                        <div className="relative z-10">
                            <p className="label-caps !ml-0 !mb-0 text-red-600/70">Personalkosten</p>
                            <h3 className="text-xl font-black text-slate-900 mt-1">{formatEuro(analysis.laborCost)}</h3>
                            <p className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">Kalkulatorisch</p>
                        </div>
                    </div>

                    <div className={`stat-card relative overflow-hidden text-white border-none ${analysis.profit > 0 ? 'bg-emerald-600 shadow-emerald-200' : 'bg-red-600 shadow-red-200'} shadow-lg`}>
                        <div className="absolute -top-2 -right-2 p-3 opacity-20"><TrendingUp size={80}/></div>
                        <div className="relative z-10">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Rohgewinn</p>
                            <h3 className="text-xl font-black">{formatEuro(analysis.profit)}</h3>
                            <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-black mt-3 backdrop-blur-md uppercase tracking-wider">
                                Marge: {analysis.margin}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* 2. BANKING SECTION */}
                <div className="lg:col-span-5 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-[400px]">
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="stat-icon-box icon-info">
                                <Landmark size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Banking Center</h2>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">SEPA Lastschriften</p>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 mb-4">
                            <div className="flex items-start gap-3">
                                <Receipt size={18} className="text-slate-400 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                    Erstellen Sie die <strong>XML-Sammellastschrift</strong> für Ihr Online-Banking. Das System bündelt alle fälligen Posten von Kunden mit aktivem Mandat.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={handleDownloadSepa}
                            disabled={isDownloadingSepa}
                            className="btn-primary w-full justify-center !py-3.5 shadow-lg shadow-blue-500/20 uppercase font-black text-[10px] tracking-[0.15em]"
                        >
                            {isDownloadingSepa ? <Loader2 size={16} className="animate-spin mr-2" /> : <FileSpreadsheet size={16} className="mr-2" />}
                            {isDownloadingSepa ? 'Generiere XML...' : 'SEPA Datei exportieren'}
                        </button>
                        <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-tighter italic">Standard: pain.008.001.02</p>
                    </div>
                </div>

                {/* 3. MAHNWESEN LISTE */}
                <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
                    <div className="px-5 py-4 border-b border-red-50 bg-red-50/30 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="stat-icon-box icon-danger">
                                <ShieldAlert size={16} />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-red-900 uppercase tracking-widest leading-none">Debitoren / Mahnwesen</h2>
                                <p className="text-[9px] font-bold text-red-600/60 uppercase mt-1">Überfällige Forderungen</p>
                            </div>
                        </div>
                        <span className="status-badge bg-white text-red-600 border-red-100 shadow-sm !text-[9px]">
                            {overdueInvoices.length} POSITIONEN
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {overdueInvoices.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale">
                                <AlertTriangle size={32} className="text-slate-300 mb-2" />
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Keine Rückstände</p>
                            </div>
                        ) : (
                            overdueInvoices.map(inv => (
                                <div key={inv.id} className="p-3 rounded-xl border border-slate-100 bg-white flex items-center justify-between group hover:border-red-200 hover:shadow-md transition-all duration-300">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-slate-900 text-[11px] tracking-tight">#{inv.invoiceNumber}</span>
                                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                                                Level {inv.dunningLevel}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-bold truncate">
                                            {inv.customer.companyName || `${inv.customer.firstName} ${inv.customer.lastName}`}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] text-red-400 font-black uppercase tracking-tighter mt-1">
                                            Fällig seit: {new Date(inv.dueDate).toLocaleDateString('de-DE')}
                                        </div>
                                    </div>

                                    <div className="text-right pl-4 shrink-0 border-l border-slate-50">
                                        <div className="font-black text-slate-900 text-[13px] mb-2">{formatEuro(inv.totalGross)}</div>
                                        <button 
                                            onClick={() => handleExecuteDunning(inv)}
                                            disabled={processingDunningId === inv.id}
                                            className="text-[9px] bg-slate-900 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {processingDunningId === inv.id ? <Loader2 size={10} className="animate-spin"/> : <Send size={10}/>}
                                            Mahnung
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}