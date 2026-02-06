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

    const chartData = payrollData?.data
        .sort((a, b) => b.grossPay - a.grossPay)
        .slice(0, 8) 
        .map(emp => ({
            name: `${emp.lastName}, ${emp.firstName.charAt(0)}.`,
            Lohn: emp.grossPay,
            fullValue: formatEuro(emp.grossPay)
        })) || [];

    return (
        <div className="page-container pb-safe">
            
            {/* --- HEADER SECTION --- */}
            <div className="header-section flex-col lg:flex-row items-stretch lg:items-center gap-4">
                <div>
                    <h1 className="page-title">Finanz & Lohn</h1>
                    <p className="page-subtitle">Monatsabrechnung und Kostenanalyse</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                    {/* Datums Wähler */}
                    <div className="view-switcher-container w-full sm:w-auto">
                        <button onClick={prevMonth} className="view-btn text-slate-400 hover:text-blue-600">
                            <ChevronLeft size={16} />
                        </button>
                        <div className="px-4 text-[11px] font-black text-slate-700 uppercase tracking-widest min-w-[140px] text-center">
                            {selectedDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                        </div>
                        <button onClick={nextMonth} className="view-btn text-slate-400 hover:text-blue-600">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Export Button */}
                    <button 
                        onClick={() => handleExport()} 
                        disabled={!payrollData || payrollData.data.length === 0}
                        className="btn-primary w-full sm:w-auto"
                    >
                        <Download size={14} />
                        <span className="uppercase tracking-wider">Exportliste</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                    <span className="label-caps">Lohndaten werden berechnet...</span>
                </div>
            ) : !payrollData ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white m-2 py-20">
                    <AlertCircle size={32} className="text-slate-200 mb-2"/>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest text-center">Keine Daten verfügbar</p>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in duration-500">
                    {/* --- KPI GRID --- */}
                    <div className="stats-grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="stat-card">
                            <div className="stat-icon-wrapper icon-info">
                                <Wallet size={16} />
                            </div>
                            <div>
                                <span className="label-caps !ml-0 !mb-0">Brutto Total</span>
                                <div className="text-base font-bold text-slate-900 leading-tight">
                                    {formatEuro(payrollData.meta.totalPayrollCost)}
                                </div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon-wrapper icon-purple">
                                <Clock size={16} />
                            </div>
                            <div>
                                <span className="label-caps !ml-0 !mb-0">Ist-Stunden</span>
                                <div className="text-base font-bold text-slate-900 leading-tight">
                                    {payrollData.data.reduce((acc, curr) => acc + curr.totalHours, 0).toLocaleString('de-DE')} <span className="text-[10px] text-slate-400 font-medium">h</span>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card col-span-2 lg:col-span-1">
                            <div className="stat-icon-wrapper icon-success">
                                <Users size={16} />
                            </div>
                            <div>
                                <span className="label-caps !ml-0 !mb-0">Abrechnungen</span>
                                <div className="text-base font-bold text-slate-900 leading-tight">
                                    {payrollData.data.length} <span className="text-[10px] text-slate-400 font-medium">Pers.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- CONTENT GRID --- */}
                    <div className="content-grid">
                        
                        {/* LINKS: DIAGRAMM */}
                        <div className="chart-container lg:col-span-4 h-[500px]">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-3">
                                <div className="stat-icon-box icon-info"><PieChart size={14} /></div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Top Verdienste</h3>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 20, top: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis 
                                            dataKey="name" 
                                            type="category" 
                                            width={90} 
                                            tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} 
                                            axisLine={false} 
                                            tickLine={false} 
                                        />
                                        <Tooltip 
                                            cursor={{fill: '#f8fafc'}}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                            formatter={(value: any) => [formatEuro(value), 'Brutto']}
                                        />
                                        <Bar 
                                            dataKey="Lohn" 
                                            fill="#3b82f6" 
                                            radius={[0, 4, 4, 0]} 
                                            barSize={18}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* RECHTS: TABELLE */}
                        <div className="table-container lg:col-span-8 h-[500px] flex flex-col">
                            <div className="px-4 py-3 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
                                 <div className="flex items-center gap-2">
                                    <div className="stat-icon-box icon-purple"><TrendingUp size={14} /></div>
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Personalabrechnung</h3>
                                </div>
                                <span className="status-badge bg-blue-50 text-blue-600 border-blue-100 !text-[8px]">
                                   LIVE
                                </span>
                            </div>

                            <div className="flex-1 custom-scrollbar overflow-y-auto">
                                <table className="table-main">
                                    <thead className="table-head sticky top-0 z-10">
                                        <tr>
                                            <th className="table-cell">Mitarbeiter</th>
                                            <th className="table-cell text-center">Jobs</th>
                                            <th className="table-cell text-right">Ist-Std.</th>
                                            <th className="table-cell text-right">Brutto</th>
                                            <th className="table-cell text-right pr-4">Export</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrollData.data.map((emp) => (
                                            <tr key={emp.employeeId} className="table-row group">
                                                <td className="table-cell align-middle">
                                                    <div className="font-bold text-slate-800 text-[12px]">{emp.lastName}, {emp.firstName}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">PNR: {emp.personnelNumber}</div>
                                                </td>
                                                <td className="table-cell text-center align-middle">
                                                    <span className="bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-black border border-slate-100">
                                                        {emp.jobsCount}
                                                    </span>
                                                </td>
                                                <td className="table-cell text-right font-mono font-bold text-slate-600 align-middle">
                                                    {emp.totalHours.toFixed(1)} <span className="text-[8px] font-normal text-slate-300 italic">h</span>
                                                </td>
                                                <td className="table-cell text-right align-middle">
                                                    <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[11px]">
                                                        {formatEuro(emp.grossPay)}
                                                    </span>
                                                </td>
                                                <td className="table-cell text-right pr-4 align-middle">
                                                    <button 
                                                        onClick={() => handleExport(emp.employeeId)}
                                                        className="btn-icon-only ml-auto sm:opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-all"
                                                        title="PDF Einzelabrechnung"
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
                </div>
            )}
        </div>
    );
}