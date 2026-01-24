import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Calendar, 
  PieChart, 
  TrendingUp, 
  Loader2, 
  ChevronDown 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

// Typen
interface PayrollReport {
  id: string;
  title: string;
  type: 'HR' | 'FINANCE';
  date: string;
  month: number;
  year: number;
}

// --- WICHTIG: Diese Komponente muss AUSSERHALB stehen! ---
const ReportList = ({ title, icon: Icon, type, colorClass, bgClass, reports, onDownload, downloadingId }: any) => {
    // Wir filtern hier basierend auf den übergebenen Daten
    const filtered = reports.filter((r: any) => r.type === type);
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${bgClass} ${colorClass}`}>
                      <Icon size={20} />
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-800">{title}</h3>
                      <p className="text-xs text-slate-500">{filtered.length} Berichte verfügbar</p>
                  </div>
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[500px]">
              {filtered.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                      <FileText size={32} className="mb-2 opacity-20" />
                      <p className="text-sm">Keine Berichte gefunden.</p>
                  </div>
              ) : (
                  <div className="divide-y divide-slate-50">
                      {filtered.map((report: any) => (
                          <div key={report.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition">
                                      <FileText size={18} />
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-slate-700">{report.title}</p>
                                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                          <Calendar size={10} />
                                          {new Date(report.date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                                      </div>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => onDownload(report)}
                                  disabled={!!downloadingId}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="PDF Herunterladen"
                              >
                                  {downloadingId === report.id ? <Loader2 size={20} className="animate-spin text-blue-600"/> : <Download size={20} />}
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    );
};

export default function ReportsPage() {
  const [reports, setReports] = useState<PayrollReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // 1. Daten generieren
  useEffect(() => {
    fetchAvailableReports();
  }, [filterYear]);

  const fetchAvailableReports = async () => {
    setLoading(true);
    
    // Kurze künstliche Verzögerung
    await new Promise(r => setTimeout(r, 300));

    const generatedReports: PayrollReport[] = [];
    const today = new Date();

    for (let month = 0; month < 12; month++) {
        const d = new Date(filterYear, month, 1);
        if (d > today) break;

        generatedReports.push({
            id: `payroll-${month + 1}-${filterYear}`,
            title: `Lohnabrechnung ${d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`,
            type: 'HR',
            date: d.toISOString(),
            month: month + 1,
            year: filterYear
        });

        generatedReports.push({
            id: `finance-${month + 1}-${filterYear}`,
            title: `BWA / Umsatz ${d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`,
            type: 'FINANCE',
            date: d.toISOString(),
            month: month + 1,
            year: filterYear
        });
    }

    generatedReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setReports(generatedReports);
    setLoading(false);
  };

  // 2. Download Logik
  const handleDownload = async (report: PayrollReport) => {
    setDownloadingId(report.id);
    const toastId = toast.loading("PDF wird erstellt...");
    
    try {
      let endpoint = '';
      if (report.type === 'HR') endpoint = `/reports/payroll/pdf?month=${report.month}&year=${report.year}`;
      else if (report.type === 'FINANCE') endpoint = `/reports/finance/pdf?month=${report.month}&year=${report.year}`;

      const response = await api.get(endpoint, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `${report.type === 'HR' ? 'Lohn' : 'Finanzen'}_${report.year}_${String(report.month).padStart(2, '0')}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Download gestartet!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Datei konnte nicht geladen werden.", { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  const hrCount = reports.filter(r => r.type === 'HR').length;
  const financeCount = reports.filter(r => r.type === 'FINANCE').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <BarChart3 className="text-blue-600" /> Berichte & Archiv
          </h1>
          <p className="text-slate-500 mt-1">Hier finden Sie alle monatlichen Auswertungen zum Download.</p>
        </div>
        
        {/* JAHR FILTER */}
        <div className="relative group">
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                <ChevronDown size={16} />
            </div>
            <select 
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
                className="appearance-none bg-white border border-slate-300 text-slate-700 font-bold py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition cursor-pointer"
            >
                {[2023, 2024, 2025, 2026].map(y => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
      </div>

      {loading ? (
          <div className="p-20 text-center text-slate-400 flex flex-col items-center">
              <Loader2 className="animate-spin mb-3" size={32} />
              Lade Archiv...
          </div>
      ) : (
          <>
            {/* KPI KARTEN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wide">Personal-Berichte</p>
                            <h3 className="text-3xl font-bold mt-1">{hrCount}</h3>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <TrendingUp size={24} className="text-white" />
                        </div>
                    </div>
                    <p className="text-xs text-indigo-200 mt-4">Lohnabrechnungen & Stundennachweise</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Finanz-Berichte</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-1">{financeCount}</h3>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg">
                            <PieChart size={24} className="text-green-600" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-4">Umsatzanalysen & BWA-Exporte</p>
                </div>
            </div>

            {/* LISTEN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Finanzen */}
                <ReportList 
                    title="Finanzen & Umsatz" 
                    icon={PieChart} 
                    type="FINANCE"
                    colorClass="text-green-600"
                    bgClass="bg-green-100"
                    reports={reports} // Daten müssen übergeben werden
                    onDownload={handleDownload}
                    downloadingId={downloadingId}
                />

                {/* 2. Personal */}
                <ReportList 
                    title="Personal & Lohn" 
                    icon={TrendingUp} 
                    type="HR"
                    colorClass="text-purple-600"
                    bgClass="bg-purple-100"
                    reports={reports} // Daten müssen übergeben werden
                    onDownload={handleDownload}
                    downloadingId={downloadingId}
                />

            </div>
          </>
      )}
    </div>
  );
}