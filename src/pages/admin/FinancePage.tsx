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
import toast from 'react-hot-toast';
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
  
  // Action States
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

  // --- ACTIONS ---

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

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="page-container">
      
      {/* HEADER */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title">Finanzen & Controlling</h1>
          <p className="page-subtitle">Liquiditätsmanagement und Banking.</p>
        </div>
      </div>

      {/* 1. CONTROLLING CARDS (Kompakt & Modern) */}
      {analysis && (
          <div className="stats-grid animate-in fade-in slide-in-from-top-4 duration-500">
              {/* UMSATZ */}
              <div className="stat-card relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-5 text-slate-900 group-hover:opacity-10 transition-opacity"><DollarSign size={60}/></div>
                  <div>
                      <p className="label-caps !ml-0 mb-1">Umsatz (Netto)</p>
                      <h3 className="text-2xl font-bold text-slate-900">{formatEuro(analysis.revenue)}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{analysis.period}</p>
                  </div>
              </div>

              {/* KOSTEN */}
              <div className="stat-card relative overflow-hidden group border-l-[3px] border-l-red-500">
                  <div className="absolute top-0 right-0 p-3 opacity-5 text-red-600 group-hover:opacity-10 transition-opacity"><TrendingDown size={60}/></div>
                  <div>
                      <p className="label-caps !ml-0 mb-1 text-red-500">Personalkosten</p>
                      <h3 className="text-2xl font-bold text-slate-900">{formatEuro(analysis.laborCost)}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Kalkulatorisch</p>
                  </div>
              </div>

              {/* GEWINN */}
              <div className={`stat-card relative overflow-hidden text-white ${analysis.profit > 0 ? 'bg-emerald-500 border-emerald-600' : 'bg-red-500 border-red-600'}`}>
                  <div className="absolute top-0 right-0 p-3 opacity-20"><TrendingUp size={60}/></div>
                  <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider opacity-80 mb-1">Rohgewinn</p>
                      <h3 className="text-2xl font-bold">{formatEuro(analysis.profit)}</h3>
                      <div className="inline-block bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold mt-2 backdrop-blur-sm">
                          Marge: {analysis.margin}
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* 2. BANKING SECTION */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
              <div>
                  <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                          <Landmark size={20} />
                      </div>
                      <div>
                          <h2 className="text-sm font-bold text-slate-900">Banking Center</h2>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">SEPA Lastschriften</p>
                      </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                      <div className="flex items-start gap-3">
                          <Receipt size={18} className="text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                              Erstellen Sie hier die XML-Sammellastschrift für Ihre Bank. Dies umfasst alle fälligen Rechnungen von Kunden mit gültigem SEPA-Mandat.
                          </p>
                      </div>
                  </div>
              </div>

              <button 
                  onClick={handleDownloadSepa}
                  disabled={isDownloadingSepa}
                  className="btn-primary w-full justify-center !py-3 shadow-md"
              >
                  {isDownloadingSepa ? <Loader2 size={16} className="animate-spin mr-2" /> : <FileSpreadsheet size={16} className="mr-2" />}
                  {isDownloadingSepa ? 'Generiere...' : 'SEPA XML Datei erstellen'}
              </button>
          </div>

          {/* 3. MAHNWESEN LISTE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
              <div className="px-5 py-3 border-b border-red-100 bg-red-50/40 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      <ShieldAlert size={16} className="text-red-600" />
                      <h2 className="text-xs font-bold text-red-900 uppercase tracking-wide">Mahnwesen</h2>
                  </div>
                  <span className="text-[10px] font-bold bg-white text-red-600 px-2 py-0.5 rounded border border-red-100 shadow-sm">
                      {overdueInvoices.length} Offen
                  </span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {overdueInvoices.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300">
                          <AlertTriangle size={32} className="opacity-20 mb-2" />
                          <p className="text-[10px] font-bold uppercase tracking-wider">Keine überfälligen Posten</p>
                      </div>
                  ) : (
                      overdueInvoices.map(inv => (
                          <div key={inv.id} className="p-3 rounded-lg border border-red-100 bg-white flex items-center justify-between group hover:border-red-200 hover:shadow-sm transition-all">
                              <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                      <span className="font-bold text-slate-800 text-xs">#{inv.invoiceNumber}</span>
                                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                                          Stufe {inv.dunningLevel}
                                      </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-medium truncate mb-0.5">
                                      {inv.customer.companyName || `${inv.customer.firstName} ${inv.customer.lastName}`}
                                  </div>
                                  <div className="text-[10px] text-red-400 font-semibold">
                                      Fällig: {new Date(inv.dueDate).toLocaleDateString()}
                                  </div>
                              </div>

                              <div className="text-right pl-3 shrink-0">
                                  <div className="font-bold text-slate-900 text-sm mb-2">{formatEuro(inv.totalGross)}</div>
                                  <button 
                                      onClick={() => handleExecuteDunning(inv)}
                                      disabled={processingDunningId === inv.id}
                                      className="text-[10px] bg-slate-900 text-white px-2.5 py-1.5 rounded-md font-bold uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center gap-1.5 ml-auto disabled:opacity-50"
                                  >
                                      {processingDunningId === inv.id ? <Loader2 size={10} className="animate-spin"/> : <Send size={10}/>}
                                      Mahnen
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