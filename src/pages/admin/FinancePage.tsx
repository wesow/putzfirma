import { useEffect, useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Download, 
  AlertTriangle, Send, Loader2, Landmark, FileSpreadsheet, ShieldAlert
} from 'lucide-react';
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
    const toastId = toast.loading("SEPA-Datei wird generiert...");
    
    try {
      const response = await api.get('/finance/sepa-xml', { responseType: 'blob' });
      
      // Download triggern
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SEPA_Export_${new Date().toISOString().split('T')[0]}.xml`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      toast.success("Download gestartet!", { id: toastId });
    } catch (error: any) {
        // Blob Error Handling ist tricky, wir versuchen den Text zu lesen
        toast.error("Keine offenen SEPA-Lastschriften gefunden.", { id: toastId });
    } finally {
      setIsDownloadingSepa(false);
    }
  };

  const handleExecuteDunning = async (invoice: OverdueInvoice) => {
    const nextLevel = invoice.dunningLevel + 1;
    if(!confirm(`Mahnstufe ${nextLevel} für ${invoice.invoiceNumber} auslösen?\n\nDies sendet eine E-Mail an den Kunden und erhöht die Gebühren.`)) return;

    setProcessingDunningId(invoice.id);
    const toastId = toast.loading("Sende Mahnung...");

    try {
        await api.post('/finance/dunning/execute', { invoiceId: invoice.id });
        toast.success(`Mahnstufe ${nextLevel} erreicht!`, { id: toastId });
        fetchData(); // Liste aktualisieren
    } catch (e) {
        toast.error("Fehler beim Mahnen", { id: toastId });
    } finally {
        setProcessingDunningId(null);
    }
  };

  // Helper
  const formatEuro = (val: number) => Number(val).toLocaleString('de-DE', {style:'currency', currency:'EUR'});

  if (loading) return <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="page-container">
      
      {/* HEADER */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title leading-none">Finanzen & Controlling</h1>
          <p className="page-subtitle text-slate-500 mt-2 font-medium">Liquiditätsmanagement und Banking.</p>
        </div>
      </div>

      {/* 1. CONTROLLING CARDS */}
      {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* UMSATZ */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80}/></div>
                  <p className="label-caps !ml-0 mb-1">Umsatz (Netto)</p>
                  <h3 className="text-3xl font-black text-slate-900">{formatEuro(analysis.revenue)}</h3>
                  <p className="text-xs text-slate-400 mt-2 font-bold">{analysis.period}</p>
              </div>

              {/* KOSTEN */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500"><TrendingDown size={80}/></div>
                  <p className="label-caps !ml-0 mb-1 text-red-400">Personalkosten (Kalk.)</p>
                  <h3 className="text-3xl font-black text-slate-900">{formatEuro(analysis.laborCost)}</h3>
                  <p className="text-xs text-slate-400 mt-2 font-bold">Basierend auf Stundensätzen</p>
              </div>

              {/* GEWINN */}
              <div className={`p-6 rounded-[2rem] shadow-lg border relative overflow-hidden ${analysis.profit > 0 ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-20"><TrendingUp size={80}/></div>
                  <p className="label-caps !ml-0 mb-1 !text-white/70">Rohgewinn</p>
                  <h3 className="text-4xl font-black">{formatEuro(analysis.profit)}</h3>
                  <div className="flex items-center gap-2 mt-2">
                      <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">Marge: {analysis.margin}</span>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* 2. BANKING SECTION */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between">
              <div>
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Landmark size={24} />
                      </div>
                      <div>
                          <h2 className="text-lg font-black text-slate-900">Banking Center</h2>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">SEPA Lastschriften</p>
                      </div>
                  </div>
                  
                  <div className="prose prose-sm text-slate-500 mb-8">
                      <p>Erstellen Sie hier die Sammellastschrift-Datei (XML) für Ihre Bank. Dies umfasst alle offenen Rechnungen von Kunden mit SEPA-Mandat.</p>
                  </div>
              </div>

              <button 
                  onClick={handleDownloadSepa}
                  disabled={isDownloadingSepa}
                  className="btn-primary w-full justify-center !py-4 shadow-xl shadow-blue-500/20"
              >
                  {isDownloadingSepa ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />}
                  {isDownloadingSepa ? 'Generiere XML...' : 'SEPA XML Datei erstellen'}
              </button>
          </div>

          {/* 3. MAHNWESEN LISTE */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-red-50/30">
                  <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                          <ShieldAlert size={24} />
                      </div>
                      <div>
                          <h2 className="text-lg font-black text-red-900">Mahnwesen</h2>
                          <p className="text-xs text-red-400 font-bold uppercase tracking-wider">{overdueInvoices.length} Überfällige Posten</p>
                      </div>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[400px] p-4 custom-scrollbar">
                  {overdueInvoices.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                          <AlertTriangle size={48} className="opacity-20 mb-2" />
                          <p className="text-xs font-black uppercase tracking-widest">Alle Zahlungen aktuell</p>
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {overdueInvoices.map(inv => (
                              <div key={inv.id} className="p-4 rounded-2xl border border-red-100 bg-white shadow-sm flex items-center justify-between group hover:border-red-200 transition-all">
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className="font-black text-slate-800 text-sm">#{inv.invoiceNumber}</span>
                                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">
                                              Stufe {inv.dunningLevel}
                                          </span>
                                      </div>
                                      <div className="text-xs text-slate-500 font-medium mb-1">
                                          {inv.customer.companyName || `${inv.customer.firstName} ${inv.customer.lastName}`}
                                      </div>
                                      <div className="text-[10px] text-red-400 font-bold">
                                          Fällig seit: {new Date(inv.dueDate).toLocaleDateString()}
                                      </div>
                                  </div>

                                  <div className="text-right">
                                      <div className="font-black text-slate-900 mb-2">{formatEuro(inv.totalGross)}</div>
                                      <button 
                                          onClick={() => handleExecuteDunning(inv)}
                                          disabled={processingDunningId === inv.id}
                                          className="text-[10px] bg-slate-900 text-white px-3 py-2 rounded-lg font-bold uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center gap-2 ml-auto disabled:opacity-50"
                                      >
                                          {processingDunningId === inv.id ? <Loader2 size={12} className="animate-spin"/> : <Send size={12}/>}
                                          Mahnen
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
}