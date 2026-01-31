import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    FileText,
    Loader2,
    PieChart,
    TrendingUp,
    Users,
    Wallet
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import api from '../../lib/api';

// --- Types ---
interface EmployeeReport {
  employeeId: string;
  firstName: string;
  lastName: string;
  personnelNumber: string;
  hourlyWage: number;
  totalHours: number;
  grossPay: number;
  jobsCount: number;
}

interface PayrollResponse {
  meta: {
    month: number;
    year: number;
    totalPayrollCost: number;
  };
  data: EmployeeReport[];
}

export default function PayrollPage() {
  const [payrollData, setPayrollData] = useState<PayrollResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchPayrollData();
  }, [selectedDate]);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      const res = await api.get(`/reports/payroll?month=${month}&year=${year}`);
      setPayrollData(res.data);
    } catch (error) {
      toast.error("Fehler beim Laden der Lohndaten.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (employeeId?: string) => {
    const toastId = toast.loading("PDF wird generiert...");
    try {
        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();
        let url = `/reports/payroll/pdf?month=${month}&year=${year}`;
        if (employeeId) url += `&employeeId=${employeeId}`;

        const response = await api.get(url, { responseType: 'blob' });
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        const filename = employeeId 
            ? `Abrechnung_${employeeId}_${month}_${year}.pdf` 
            : `Lohnliste_Gesamt_${month}_${year}.pdf`;
            
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        toast.success("Download erfolgreich", { id: toastId });
    } catch (e) {
        toast.error("Export fehlgeschlagen", { id: toastId });
    }
  };

  const prevMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  const nextMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  
  const formatEuro = (val: number) => val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  // Daten für Chart aufbereiten (Top 8)
  const chartData = payrollData?.data
    .sort((a, b) => b.grossPay - a.grossPay)
    .slice(0, 8) 
    .map(emp => ({
        name: `${emp.lastName}, ${emp.firstName.charAt(0)}.`,
        Lohn: emp.grossPay,
        fullValue: formatEuro(emp.grossPay)
    })) || [];

  return (
    <div className="page-container">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        {/* Titel Bereich */}
        <div>
           <h1 className="page-title">Finanz & Lohn</h1>
           <p className="page-subtitle">Monatsabrechnung und Kostenanalyse</p>
        </div>

        {/* Buttons Rechts (Datum + Export gruppiert) */}
        <div className="flex items-center gap-3">
            
            {/* Datums Wähler */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-500 hover:text-blue-600 transition-all">
                    <ChevronLeft size={16} />
                </button>
                <div className="px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wide min-w-[130px] text-center">
                    {selectedDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-500 hover:text-blue-600 transition-all">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Trennlinie */}
            <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

            {/* Export Button */}
            <button 
                onClick={() => handleExport()} 
                disabled={!payrollData || payrollData.data.length === 0}
                className="btn-primary"
            >
                <Download size={14} />
                <span>Exportliste</span>
            </button>
        </div>
      </div>

      {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lade Daten...</span>
          </div>
      ) : !payrollData ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 m-4">
             <AlertCircle size={32} className="text-slate-300 mb-2"/>
             <p className="text-slate-400 font-medium">Keine Daten für diesen Monat verfügbar</p>
          </div>
      ) : (
        <>
            {/* --- KPI GRID --- */}
            {/* Wir nutzen stats-grid, überschreiben aber auf 3 Spalten für dieses Layout */}
            <div className="stats-grid md:!grid-cols-3 lg:!grid-cols-3 mb-4">
                <div className="stat-card">
                    <div className="stat-icon-wrapper icon-info">
                        <Wallet size={18} />
                    </div>
                    <div>
                        <span className="label-caps">Brutto Total</span>
                        <div className="text-lg font-bold text-slate-900 leading-none">
                            {formatEuro(payrollData.meta.totalPayrollCost)}
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper icon-purple">
                        <Clock size={18} />
                    </div>
                    <div>
                        <span className="label-caps">Stunden Gesamt</span>
                        <div className="text-lg font-bold text-slate-900 leading-none">
                            {payrollData.data.reduce((acc, curr) => acc + curr.totalHours, 0).toLocaleString('de-DE')} <span className="text-xs text-slate-400 font-normal">h</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper icon-success">
                        <Users size={18} />
                    </div>
                    <div>
                        <span className="label-caps">Mitarbeiter</span>
                        <div className="text-lg font-bold text-slate-900 leading-none">
                            {payrollData.data.length} <span className="text-xs text-slate-400 font-normal">Pers.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT GRID (Chart Left / Table Right) --- */}
            <div className="content-grid">
                
                {/* LINKS: DIAGRAMM CONTAINER (33% Breite auf LG) */}
                <div className="chart-container lg:col-span-4 h-[500px]">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
                        <PieChart size={14} className="text-slate-400" />
                        <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Top Verdienste</h3>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={90} 
                                    tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                    formatter={(value: any) => [formatEuro(value), 'Brutto']}
                                />
                                <Bar 
                                    dataKey="Lohn" 
                                    fill="#3b82f6" 
                                    radius={[0, 4, 4, 0]} 
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* RECHTS: TABELLEN CONTAINER (66% Breite auf LG) */}
                <div className="table-container lg:col-span-8 h-[500px] flex flex-col">
                    <div className="px-4 py-3 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
                         <div className="flex items-center gap-2">
                            <TrendingUp size={14} className="text-slate-400" />
                            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Lohnliste Details</h3>
                        </div>
                        <span className="status-badge bg-blue-50 text-blue-600 border-blue-100">
                           {payrollData.data.length} Einträge
                        </span>
                    </div>

                    <div className="flex-1 custom-scrollbar overflow-y-auto">
                        <table className="table-main">
                            <thead className="table-head bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left">Mitarbeiter</th>
                                    <th className="px-4 py-3 text-center">Jobs</th>
                                    <th className="px-4 py-3 text-right">Stunden</th>
                                    <th className="px-4 py-3 text-right">Brutto</th>
                                    <th className="px-4 py-3 text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrollData.data.map((emp) => (
                                    <tr key={emp.employeeId} className="table-row group">
                                        <td className="table-cell pl-4 align-middle">
                                            <div className="font-bold text-slate-700">{emp.lastName}, {emp.firstName}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">#{emp.personnelNumber}</div>
                                        </td>
                                        <td className="table-cell text-center align-middle">
                                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                                                {emp.jobsCount}
                                            </span>
                                        </td>
                                        <td className="table-cell text-right font-mono text-slate-600 align-middle">
                                            {emp.totalHours.toFixed(1)}
                                        </td>
                                        <td className="table-cell text-right align-middle">
                                            <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                                {formatEuro(emp.grossPay)}
                                            </span>
                                        </td>
                                        <td className="table-cell text-right pr-4 align-middle">
                                            <button 
                                                onClick={() => handleExport(emp.employeeId)}
                                                className="btn-icon-only inline-flex opacity-0 group-hover:opacity-100"
                                                title="PDF laden"
                                            >
                                                <FileText size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
}