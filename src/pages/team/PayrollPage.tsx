import { useEffect, useState } from 'react';
import { Clock, Users, Wallet, AlertCircle, Download, ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import toast from 'react-hot-toast';

// Typen
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
  
  // Startet mit dem aktuellen Monat
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
      console.error("Daten laden fehlgeschlagen", error);
    } finally {
      setLoading(false);
    }
  };

  // --- PDF EXPORT FUNKTION ---
  const handleExport = async (employeeId?: string) => {
    const toastId = toast.loading("Erstelle PDF...");
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
            ? `Abrechnung_Mitarbeiter_${month}_${year}.pdf` 
            : `Lohnliste_Gesamt_${month}_${year}.pdf`;
            
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        toast.success("Download gestartet!", { id: toastId });
    } catch (e) {
        toast.error("Fehler beim PDF Export", { id: toastId });
        console.error(e);
    }
  };

  // Navigation
  const prevMonth = () => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)));
  const nextMonth = () => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)));
  const formatEuro = (val: number) => val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  // Chart Daten vorbereiten (Top 5 Verdiener)
  const chartData = payrollData?.data
    .sort((a, b) => b.grossPay - a.grossPay)
    .slice(0, 10) 
    .map(emp => ({
        name: `${emp.firstName} ${emp.lastName.charAt(0)}.`,
        Lohn: emp.grossPay
    })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Wallet className="text-blue-600 h-8 w-8" />
            Lohnabrechnung
            </h1>
            <p className="text-slate-500 mt-1">Monatliche Übersicht & Export.</p>
        </div>

        <div className="flex gap-4">
            {/* Datum */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button onClick={prevMonth} className="p-2.5 hover:bg-slate-50 rounded-lg text-slate-500 transition"><ChevronLeft size={20} /></button>
                <div className="px-4 font-bold text-slate-700 min-w-[160px] text-center">
                    {selectedDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={nextMonth} className="p-2.5 hover:bg-slate-50 rounded-lg text-slate-500 transition"><ChevronRight size={20} /></button>
            </div>
            
            {/* Export Alle */}
            <button 
                onClick={() => handleExport()} 
                disabled={!payrollData || payrollData.data.length === 0}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
                <Download size={18} /> Gesamtliste
            </button>
        </div>
      </div>

      {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mr-2" /> Lade Daten...
          </div>
      ) : !payrollData ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
             <AlertCircle size={32} className="opacity-20"/>
             <span>Keine Daten verfügbar.</span>
          </div>
      ) : (
        <>
            {/* --- KPI KARTEN --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                    <p className="text-xs font-bold text-blue-400 uppercase mb-1 tracking-wider">Brutto-Lohnsumme</p>
                    <div className="text-3xl font-extrabold text-slate-800">{formatEuro(payrollData.meta.totalPayrollCost)}</div>
                    <Wallet className="absolute bottom-4 right-4 text-blue-50 group-hover:text-blue-100 transition-colors pointer-events-none" size={64} />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                    <p className="text-xs font-bold text-indigo-400 uppercase mb-1 tracking-wider">Gesamtstunden</p>
                    <div className="text-3xl font-extrabold text-slate-800">{payrollData.data.reduce((acc, curr) => acc + curr.totalHours, 0).toFixed(1)} h</div>
                    <Clock className="absolute bottom-4 right-4 text-indigo-50 group-hover:text-indigo-100 transition-colors pointer-events-none" size={64} />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Mitarbeiter aktiv</p>
                    <div className="text-3xl font-extrabold text-slate-800">{payrollData.data.length}</div>
                    <Users className="absolute bottom-4 right-4 text-slate-50 group-hover:text-slate-100 transition-colors pointer-events-none" size={64} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 flex flex-col h-[500px]">
                    <h3 className="font-bold text-slate-800 mb-6">Top Verdienste</h3>
                    <div className="flex-1 w-full min-h-0"> 
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30, top: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    formatter={(val: any) => formatEuro(Number(val))} 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                                />
                                <Bar dataKey="Lohn" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TABELLE */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 overflow-hidden flex flex-col h-[500px]">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                        <h3 className="font-bold text-slate-800">Mitarbeiter Liste</h3>
                    </div>
                    
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 bg-slate-50">Mitarbeiter</th>
                                    <th className="px-6 py-4 text-center bg-slate-50">Jobs</th>
                                    <th className="px-6 py-4 text-right bg-slate-50">Std.</th>
                                    <th className="px-6 py-4 text-right bg-slate-50">Brutto</th>
                                    <th className="px-6 py-4 text-right bg-slate-50">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payrollData.data.map((emp) => (
                                    <tr key={emp.employeeId} className="hover:bg-slate-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700">{emp.firstName} {emp.lastName}</div>
                                            <div className="text-xs text-slate-400 font-mono">PNr: {emp.personnelNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600">{emp.jobsCount}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-600 font-mono font-medium">
                                            {emp.totalHours.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                            {formatEuro(emp.grossPay)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleExport(emp.employeeId)}
                                                className="text-slate-300 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition"
                                                title="PDF Abrechnung laden"
                                            >
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {payrollData.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-400">Keine Abrechnungsdaten für diesen Monat.</td>
                                    </tr>
                                )}
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