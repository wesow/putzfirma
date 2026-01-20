import { useEffect, useState } from 'react';
import { BarChart3, Download, FileText, Calendar, Filter, PieChart, TrendingUp } from 'lucide-react';
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

export default function ReportsPage() {
  const [reports, setReports] = useState<PayrollReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // 1. Daten laden (Berichte generieren)
  useEffect(() => {
    fetchAvailableReports();
  }, [filterYear]);

  const fetchAvailableReports = async () => {
    setLoading(true);
    const generatedReports: PayrollReport[] = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
        const d = new Date(filterYear, today.getMonth() - i, 1);
        if (d > today && filterYear === today.getFullYear()) continue; 

        // Lohnabrechnung
        generatedReports.push({
            id: `payroll-${d.getMonth() + 1}-${d.getFullYear()}`,
            title: `Lohnabrechnung ${d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`,
            type: 'HR',
            date: d.toISOString(),
            month: d.getMonth() + 1,
            year: d.getFullYear()
        });

        // Finanzbericht
        generatedReports.push({
            id: `finance-${d.getMonth() + 1}-${d.getFullYear()}`,
            title: `Umsatzbericht ${d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`,
            type: 'FINANCE',
            date: d.toISOString(),
            month: d.getMonth() + 1,
            year: d.getFullYear()
        });
    }
    setReports(generatedReports);
    setLoading(false);
  };

  // 2. Download
  const handleDownload = async (report: PayrollReport) => {
    const toastId = toast.loading("PDF wird generiert...");
    try {
      let endpoint = '';
      if (report.type === 'HR') endpoint = `/reports/payroll/pdf?month=${report.month}&year=${report.year}`;
      else if (report.type === 'FINANCE') endpoint = `/reports/finance/pdf?month=${report.month}&year=${report.year}`;

      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download erfolgreich!", { id: toastId });
    } catch (error) {
      toast.error("Keine Daten gefunden.", { id: toastId });
    }
  };

  // Hilfskomponente: Eine Tabelle rendern
  const ReportTable = ({ title, icon: Icon, data, colorClass, bgClass }: any) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className={`p-2 rounded-lg ${bgClass}`}>
                <Icon size={20} className={colorClass} />
            </div>
            <h3 className="font-bold text-slate-800">{title}</h3>
            <span className="text-xs text-slate-400 ml-auto bg-white px-2 py-1 rounded border border-slate-100">
                {data.length} Dateien
            </span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                    <tr>
                        <th className="px-6 py-4">Bericht</th>
                        <th className="px-6 py-4">Zeitraum</th>
                        <th className="px-6 py-4 text-right">Aktion</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length === 0 ? (
                        <tr><td colSpan={3} className="p-8 text-center text-slate-400">Keine Berichte verfügbar.</td></tr>
                    ) : (
                        data.map((report: PayrollReport) => (
                            <tr key={report.id} className="hover:bg-slate-50 transition group">
                                <td className="px-6 py-4 font-medium text-slate-700">
                                    {report.title}
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400" />
                                    {new Date(report.date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleDownload(report)}
                                        className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition"
                                        title="Download PDF"
                                    >
                                        <Download size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-blue-600" /> Berichte & Analysen
          </h1>
          <p className="text-slate-500 text-sm">Monatliche Auswertungen als PDF.</p>
        </div>
        
        <div className="relative">
            <button 
                onClick={() => setShowFilter(!showFilter)}
                className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-sm font-bold shadow-sm transition"
            >
                <Filter size={16} /> Jahr: {filterYear}
            </button>
            {showFilter && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-10">
                    {[2024, 2025, 2026].map(y => (
                        <button key={y} onClick={() => { setFilterYear(y); setShowFilter(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterYear === y ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50'}`}>{y}</button>
                    ))}
                </div>
            )}
        </div>
      </div>

      {loading ? (
          <div className="p-12 text-center text-slate-400">Lade Daten...</div>
      ) : (
          <>
            {/* TABELLE 1: FINANZEN */}
            <ReportTable 
                title="Finanzberichte (Umsatz & Rechnungen)" 
                icon={PieChart} 
                data={reports.filter(r => r.type === 'FINANCE')} 
                colorClass="text-green-600"
                bgClass="bg-green-50"
            />

            {/* TABELLE 2: PERSONAL */}
            <ReportTable 
                title="Personalberichte (Lohn & Stunden)" 
                icon={FileText} 
                data={reports.filter(r => r.type === 'HR')} 
                colorClass="text-purple-600"
                bgClass="bg-purple-50"
            />
          </>
      )}
    </div>
  );
}