import { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Calendar, 
  PieChart, 
  TrendingUp, 
  Loader2, 
  ChevronDown,
  History,
  Archive,
  Search
} from 'lucide-react';
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
      <div className="table-container shadow-xl shadow-slate-200/50 flex flex-col h-full animate-in fade-in duration-700">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4 text-left">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-white ${bgClass} ${colorClass}`}>
                      <Icon size={24} />
                  </div>
                  <div>
                      <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px] leading-none mb-1.5">{title}</h3>
                      <span className="status-badge bg-slate-50 text-slate-400 border-slate-100 !rounded-md font-black text-[9px]">
                        {filtered.length} DOKUMENTE IM ARCHIV
                      </span>
                  </div>
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[480px] custom-scrollbar bg-slate-50/30">
              {filtered.length === 0 ? (
                  <div className="py-24 text-center text-slate-300 flex flex-col items-center">
                      <Archive size={48} className="mb-4 opacity-10" />
                      <p className="font-black uppercase tracking-widest text-[10px]">Sektor leer</p>
                  </div>
              ) : (
                  <div className="divide-y divide-slate-100">
                      {filtered.map((report: any) => (
                          <div key={report.id} className="group flex items-center justify-between p-5 bg-white hover:bg-blue-50 transition-all cursor-default relative overflow-hidden">
                              <div className="flex items-center gap-5 text-left relative z-10">
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-md transition-all">
                                      <FileText size={20} />
                                  </div>
                                  <div>
                                      <p className="text-sm font-black text-slate-700 group-hover:text-blue-700 transition-colors leading-tight">
                                        {report.title}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                                          <Calendar size={12} className="text-slate-300" />
                                          {new Date(report.date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                                      </div>
                                  </div>
                              </div>
                              
                              <button 
                                  onClick={() => onDownload(report)}
                                  disabled={!!downloadingId}
                                  className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-lg rounded-xl transition-all opacity-0 group-hover:opacity-100 z-20"
                                  title="Export PDF"
                              >
                                  {downloadingId === report.id ? <Loader2 size={18} className="animate-spin text-blue-600"/> : <Download size={18} />}
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
    const toastId = toast.loading("Dokument wird generiert...");
    
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
    <div className="page-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title leading-none">Berichts-Archiv</h1>
          <p className="page-subtitle text-slate-500 mt-2 font-medium">Zentraler Zugriff auf alle monatlichen System-Exporte und BWAs.</p>
        </div>
        
        {/* YEAR FILTER UNIT */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            <div className="flex items-center gap-2 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Search size={14} /> Zeitraum
            </div>
            <div className="relative">
                <select 
                    value={filterYear}
                    onChange={(e) => setFilterYear(Number(e.target.value))}
                    className="appearance-none bg-white border border-slate-200 text-slate-900 font-black text-xs py-2 pl-4 pr-10 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer transition-all"
                >
                    {[2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y} GESAMT</option>
                    ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none stroke-[3]" />
            </div>
        </div>
      </div>

      {loading ? (
          <div className="py-40 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={44} />
              <span className="font-black text-[10px] uppercase tracking-[0.2em] italic">Archiv-Daten werden indexiert...</span>
          </div>
      ) : (
          <>
            {/* KPI STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="stat-card border-l-4 border-l-purple-500 !bg-purple-50/30">
                    <div className="stat-icon-wrapper bg-purple-50 text-purple-600 shadow-sm">
                        <TrendingUp size={22} />
                    </div>
                    <div className="text-left">
                        <div className="label-caps !mb-0 text-purple-600">Personalberichte</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tighter">
                          {reports.filter(r => r.type === 'HR').length} <span className="text-lg text-slate-400 uppercase font-bold ml-1">Files</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card border-l-4 border-l-emerald-500 !bg-emerald-50/30">
                    <div className="stat-icon-wrapper bg-emerald-50 text-emerald-600 shadow-sm">
                        <PieChart size={22} />
                    </div>
                    <div className="text-left">
                        <div className="label-caps !mb-0 text-emerald-600">Finanzauswertungen</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tighter">
                          {reports.filter(r => r.type === 'FINANCE').length} <span className="text-lg text-slate-400 uppercase font-bold ml-1">BWAs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* LISTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in duration-700 delay-200">
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
      
      {/* SYSTEM ARCHIVE FOOTER */}
      <div className="mt-12 text-center py-8 border-t border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
            GlanzOps Enterprise &bull; Archivierungssystem v2.0
          </p>
      </div>
    </div>
  );
}