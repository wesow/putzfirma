import {
    Archive,
    Calendar,
    ChevronDown,
    Download,
    FileText,
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
      <div className="table-container flex flex-col h-[500px] animate-in fade-in duration-700">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3 text-left">
                  <div className={`stat-icon-wrapper ${bgClass} ${colorClass}`}>
                      <Icon size={16} />
                  </div>
                  <div>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{title}</h3>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        {filtered.length} Dokumente
                      </span>
                  </div>
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-2">
              {filtered.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                      <Archive size={32} className="mb-2 opacity-10" />
                      <p className="font-bold uppercase tracking-wider text-[10px]">Keine Berichte</p>
                  </div>
              ) : (
                  <div className="space-y-1">
                      {filtered.map((report: any) => (
                          <div key={report.id} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                              <div className="flex items-center gap-3 text-left min-w-0">
                                  <div className="stat-icon-box bg-white border border-slate-100 text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                                      <FileText size={14} />
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-[11px] font-bold text-slate-700 group-hover:text-slate-900 truncate leading-tight">
                                        {report.title}
                                      </p>
                                      <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                          <Calendar size={10} className="text-slate-300" />
                                          {new Date(report.date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                                      </div>
                                  </div>
                              </div>
                              
                              <button 
                                  onClick={() => onDownload(report)}
                                  disabled={!!downloadingId}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-md transition-all sm:opacity-0 group-hover:opacity-100 border border-transparent hover:border-slate-100"
                              >
                                  {downloadingId === report.id ? <Loader2 size={14} className="animate-spin text-blue-600"/> : <Download size={14} />}
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
            title: `BWA / Finanzen ${d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`,
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
    const toastId = toast.loading("PDF wird generiert...");
    
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
      
      toast.success("Dokument geladen", { id: toastId });
    } catch (error) {
      toast.error("Download fehlgeschlagen.", { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="page-container pb-safe">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title">Berichts-Archiv</h1>
          <p className="page-subtitle">Zugriff auf monatliche Exporte und Analysen.</p>
        </div>
        
        {/* YEAR FILTER */}
        <div className="view-switcher-container">
            <div className="flex items-center gap-1.5 px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200">
              <Search size={12} /> Filter
            </div>
            <div className="relative">
                <select 
                    value={filterYear}
                    onChange={(e) => setFilterYear(Number(e.target.value))}
                    className="appearance-none bg-transparent text-slate-800 font-bold text-[11px] py-1.5 pl-3 pr-8 outline-none cursor-pointer"
                >
                    {[2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
        </div>
      </div>

      {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
              <span className="label-caps">Archiv wird indexiert...</span>
          </div>
      ) : (
          <div className="space-y-4">
            {/* KPI STATS */}
            <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="stat-card border-l-[3px] border-l-violet-500">
                    <div className="stat-icon-wrapper icon-purple">
                        <TrendingUp size={16} />
                    </div>
                    <div>
                        <div className="label-caps !mb-0 !ml-0 text-violet-600">HR Berichte</div>
                        <div className="text-base font-bold text-slate-900 leading-tight">
                          {reports.filter(r => r.type === 'HR').length} <span className="text-[10px] text-slate-400 font-medium">Dateien</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card border-l-[3px] border-l-emerald-500">
                    <div className="stat-icon-wrapper icon-success">
                        <PieChart size={16} />
                    </div>
                    <div>
                        <div className="label-caps !mb-0 !ml-0 text-emerald-600">BWA Exporte</div>
                        <div className="text-base font-bold text-slate-900 leading-tight">
                          {reports.filter(r => r.type === 'FINANCE').length} <span className="text-[10px] text-slate-400 font-medium">Dokumente</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* LISTS GRID */}
            <div className="content-grid animate-in fade-in duration-700 delay-200">
                <div className="lg:col-span-6">
                    <ReportList 
                        title="Lohn & Personal" 
                        icon={History} 
                        type="HR"
                        colorClass="text-violet-600"
                        bgClass="bg-violet-50"
                        reports={reports}
                        onDownload={handleDownload}
                        downloadingId={downloadingId}
                    />
                </div>

                <div className="lg:col-span-6">
                    <ReportList 
                        title="Finanz-Berichte" 
                        icon={PieChart} 
                        type="FINANCE"
                        colorClass="text-emerald-600"
                        bgClass="bg-emerald-50"
                        reports={reports}
                        onDownload={handleDownload}
                        downloadingId={downloadingId}
                    />
                </div>
            </div>
          </div>
      )}
    </div>
  );
}