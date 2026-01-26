import { useEffect, useState } from 'react';
import { 
  Clock, 
  Users, 
  Wallet, 
  AlertCircle, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Loader2,
  TrendingUp,
  History
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import toast from 'react-hot-toast';

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

        toast.success("Download gestartet", { id: toastId });
    } catch (e) {
        toast.error("Export fehlgeschlagen", { id: toastId });
    }
  };

  const prevMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  const nextMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  const formatEuro = (val: number) => val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  const chartData = payrollData?.data
    .sort((a, b) => b.grossPay - a.grossPay)
    .slice(0, 8) 
    .map(emp => ({
        name: `${emp.firstName} ${emp.lastName.charAt(0)}.`,
        Lohn: emp.grossPay
    })) || [];

  return (
    <div className="page-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title leading-none">Finanz-Dashboard</h1>
          <p className="page-subtitle text-slate-500 mt-2 font-medium">Lohnbuchhaltung und operative Kostenanalyse.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* MONTH NAVIGATOR */}
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                <button onClick={prevMonth} className="p-2 hover:bg-white hover:text-blue-600 rounded-xl transition-all text-slate-500 shadow-sm">
                    <ChevronLeft size={20} />
                </button>
                <div className="px-6 font-black text-slate-800 text-xs uppercase tracking-widest min-w-[160px] text-center">
                    {selectedDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={nextMonth} className="p-2 hover:bg-white hover:text-blue-600 rounded-xl transition-all text-slate-500 shadow-sm">
                    <ChevronRight size={20} />
                </button>
            </div>
            
            <button 
                onClick={() => handleExport()} 
                disabled={!payrollData || payrollData.data.length === 0}
                className="btn-primary py-3.5 shadow-xl shadow-blue-500/20 uppercase tracking-[0.2em] text-[10px]"
            >
                <Download size={18} /> Gesamte Lohnliste
            </button>
        </div>
      </div>

      {loading ? (
          <div className="py-40 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={44} />
              <span className="label-caps italic text-slate-400">Kalkuliere Gehaltsdaten...</span>
          </div>
      ) : !payrollData ? (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
             <AlertCircle size={48} className="text-slate-200 mx-auto mb-4"/>
             <p className="text-slate-500 font-black uppercase text-xs tracking-widest">Keine Daten verfügbar</p>
          </div>
      ) : (
        <>
            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="stat-card border-l-4 border-l-blue-600 !bg-blue-50/30">
                    <div className="stat-icon-wrapper icon-info shadow-sm">
                        <Wallet size={22} />
                    </div>
                    <div className="text-left">
                        <div className="label-caps !mb-0 text-blue-600">Brutto-Lohnsumme</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tighter">
                            {formatEuro(payrollData.meta.totalPayrollCost)}
                        </div>
                    </div>
                </div>
                <div className="stat-card border-l-4 border-l-indigo-500">
                    <div className="stat-icon-wrapper bg-indigo-50 text-indigo-600 shadow-sm">
                        <Clock size={22} />
                    </div>
                    <div className="text-left">
                        <div className="label-caps !mb-0 text-indigo-600">Gesamtstunden</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tighter">
                            {payrollData.data.reduce((acc, curr) => acc + curr.totalHours, 0).toFixed(1)} <span className="text-lg text-slate-400">h</span>
                        </div>
                    </div>
                </div>
                <div className="stat-card border-slate-200">
                    <div className="stat-icon-wrapper bg-slate-100 text-slate-600 shadow-sm">
                        <Users size={22} />
                    </div>
                    <div className="text-left">
                        <div className="label-caps !mb-0 text-slate-400">Aktives Team</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tighter">
                            {payrollData.data.length} <span className="text-lg text-slate-400">Pers.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-700">
                
                {/* LEFT: CHART CONTAINER */}
                <div className="chart-container shadow-xl shadow-slate-200/50 !min-h-[500px]">
                    <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <TrendingUp size={18} />
                        </div>
                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Top 8 Verdienste</h3>
                    </div>
                    <div className="flex-1 min-h-0"> 
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 30, top: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={90} 
                                    tick={{fontSize: 10, fill: '#64748b', fontWeight: 900}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    formatter={(val: any) => formatEuro(Number(val))} 
                                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold'}} 
                                />
                                <Bar dataKey="Lohn" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* RIGHT: TABLE CONTAINER */}
                <div className="table-container lg:col-span-2 shadow-xl shadow-slate-200/50 !h-[500px] flex flex-col">
                    <div className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <History size={18} className="text-slate-400" />
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Personalabrechnung Details</h3>
                        </div>
                        <span className="status-badge bg-slate-50 text-slate-500 font-black">ISO-9001 KONFORM</span>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        <table className="table-main">
                            <thead className="table-head sticky top-0 z-10 bg-slate-50">
                                <tr>
                                    <th className="table-cell">Mitarbeiter</th>
                                    <th className="table-cell text-center">Einsätze</th>
                                    <th className="table-cell text-right">Stunden</th>
                                    <th className="table-cell text-right">Auszahlung</th>
                                    <th className="table-cell text-right">Beleg</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrollData.data.map((emp) => (
                                    <tr key={emp.employeeId} className="table-row group">
                                        <td className="table-cell">
                                            <div className="font-black text-slate-800 text-sm leading-tight">{emp.firstName} {emp.lastName}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1 italic">Personal-Nr: {emp.personnelNumber}</div>
                                        </td>
                                        <td className="table-cell text-center">
                                            <span className="bg-slate-100 px-2 py-1 rounded-lg text-[10px] font-black text-slate-600 border border-slate-200 shadow-sm">
                                                {emp.jobsCount} JOBS
                                            </span>
                                        </td>
                                        <td className="table-cell text-right">
                                            <div className="font-mono font-black text-slate-700 text-xs">
                                                {emp.totalHours.toFixed(2)} <span className="text-[9px] text-slate-400">STD</span>
                                            </div>
                                        </td>
                                        <td className="table-cell text-right">
                                            <div className="font-black text-emerald-600 text-sm">
                                                {formatEuro(emp.grossPay)}
                                            </div>
                                        </td>
                                        <td className="table-cell text-right">
                                            <button 
                                                onClick={() => handleExport(emp.employeeId)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                                title="Einzelauszug generieren"
                                            >
                                                <FileText size={18} />
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