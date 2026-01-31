import {
    Archive,
    Calendar,
    ChevronDown,
    Download, FileText,
    History,
    Loader2,
    PieChart,
    Search,
    TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface PayrollReport {
  id: string;
  title: string;
  type: 'HR' | 'FINANCE';
  date: string;
  month: number;
  year: number;
}

const ReportList = ({ title, icon: Icon, type, colorClass, bgClass, reports, onDownload, downloadingId }: any) => {
    const filtered = reports.filter((r: any) => r.type === type);
    
    return (
      <div className="table-container shadow-sm border border-slate-200 flex flex-col h-[500px] animate-in fade-in duration-700">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3 text-left">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border border-white ${bgClass} ${colorClass}`}>
                      <Icon size={16} />
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] leading-none mb-1">{title}</h3>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        {filtered.length} Archiviert
                      </span>
                  </div>
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              {filtered.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                      <Archive size={32} className="mb-2 opacity-20" />
                      <p className="font-bold uppercase tracking-wider text-[10px]">Leer</p>
                  </div>
              ) : (
                  <div className="divide-y divide-slate-50">
                      {filtered.map((report: any) => (
                          <div key={report.id} className="group flex items-center justify-between px-4 py-3 hover:bg-blue-50/30 transition-all cursor-default">
                              <div className="flex items-center gap-3 text-left min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm border border-transparent group-hover:border-blue-100 transition-all shrink-0">
                                      <FileText size={16} />
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-[12px] font-semibold text-slate-700 group-hover:text-blue-700 transition-colors truncate leading-tight">
                                        {report.title}
                                      </p>
                                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                          <Calendar size={10} className="text-slate-300" />
                                          {new Date(report.date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                                      </div>
                                  </div>
                              </div>
                              
                              <button 
                                  onClick={() => onDownload(report)}
                                  disabled={!!downloadingId}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-lg transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-slate-100"
                                  title="Download"
                              >
                                  {downloadingId === report.id ? <Loader2 size={16} className="animate-spin text-blue-600"/> : <Download size={16} />}
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

  useEffect(() => {
    fetchAvailableReports();
  }, [filterYear]);

  const fetchAvailableReports = async () => {
    setLoading(true);
    // Simulierter Delay für UX
    await new Promise(r => setTimeout(r, 400));

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
            title: `Finanzbericht / BWA ${d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`,
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

  const handleDownload = async (report: PayrollReport) => {
    setDownloadingId(report.id);
    const toastId = toast.loading("Lade Dokument...");
    
    try {
      let endpoint = report.type === 'HR' 
        ? `/reports/payroll/pdf?month=${report.month}&year=${report.year}`
        : `/reports/finance/pdf?month=${report.month}&year=${report.year}`;

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
      
      toast.success("Download gestartet", { id: toastId });
    } catch (error) {
      toast.error("Export-Fehler.", { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="page-container space-y-4">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title">Berichts-Archiv</h1>
          <p className="page-subtitle">Zentraler Zugriff auf alle monatlichen Exporte.</p>
        </div>
        
        {/* YEAR FILTER */}
        <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <Search size={12} /> Zeitraum
            </div>
            <div className="relative">
                <select 
                    value={filterYear}
                    onChange={(e) => setFilterYear(Number(e.target.value))}
                    className="appearance-none bg-white border border-slate-200 text-slate-700 font-bold text-[11px] py-1.5 pl-3 pr-8 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer transition-all hover:border-slate-300"
                >
                    {[2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y} Gesamt</option>
                    ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
        </div>
      </div>

      {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
              <span className="font-bold text-[10px] uppercase tracking-wider">Indexiere Archiv...</span>
          </div>
      ) : (
          <>
            {/* KPI STATS */}
            <div className="stats-grid animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="stat-card border-l-[3px] border-l-purple-500">
                    <div className="stat-icon-wrapper bg-purple-50 text-purple-600">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <div className="label-caps !mb-0 text-purple-600 !ml-0">Personalberichte</div>
                        <div className="text-xl font-bold text-slate-900 tracking-tight">
                          {reports.filter(r => r.type === 'HR').length} <span className="text-xs text-slate-400 font-medium">Files</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card border-l-[3px] border-l-emerald-500">
                    <div className="stat-icon-wrapper bg-emerald-50 text-emerald-600">
                        <PieChart size={18} />
                    </div>
                    <div>
                        <div className="label-caps !mb-0 text-emerald-600 !ml-0">Finanzberichte</div>
                        <div className="text-xl font-bold text-slate-900 tracking-tight">
                          {reports.filter(r => r.type === 'FINANCE').length} <span className="text-xs text-slate-400 font-medium">BWAs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* LISTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start animate-in fade-in duration-700 delay-200">
                <ReportList 
                    title="Personalabrechnung" 
                    icon={History} 
                    type="HR"
                    colorClass="text-purple-600"
                    bgClass="bg-purple-50"
                    reports={reports}
                    onDownload={handleDownload}
                    downloadingId={downloadingId}
                />

                <ReportList 
                    title="Finanz-Analysen" 
                    icon={PieChart} 
                    type="FINANCE"
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50"
                    reports={reports}
                    onDownload={handleDownload}
                    downloadingId={downloadingId}
                />
            </div>
          </>
      )}
    </div>
  );
}