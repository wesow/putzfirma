import { useEffect, useState } from 'react';
import { Clock, TrendingUp, Users, Wallet, AlertCircle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../lib/api';

// Typen passend zum Backend-Response
interface EmployeePayroll {
  id: string;
  name: string;
  hours: string;
  hourlyWage: number;
  payout: number;
}

interface PayrollStats {
  month: string;
  payroll: EmployeePayroll[];
  summary: {
    revenue: number;
    laborCost: number;
    profit: number;
  };
}

export default function PayrollPage() {
  const [data, setData] = useState<PayrollStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      const res = await api.get('/stats/payroll'); // Nutzt deinen existierenden Backend-Endpoint
      setData(res.data);
    } catch (error) {
      console.error("Fehler beim Laden der Abrechnung:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatEuro = (val: number) => val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  if (loading) return <div className="p-10 text-center text-slate-500">Lade Abrechnungsdaten...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Fehler beim Laden der Daten.</div>;

  const chartData = [
    { name: 'Umsatz', value: data.summary.revenue, color: '#16a34a' },
    { name: 'Lohnkosten', value: data.summary.laborCost, color: '#dc2626' },
    { name: 'Gewinn', value: data.summary.profit, color: '#2563eb' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="text-blue-600 h-8 w-8" />
            Lohn & Abrechnung: <span className="text-blue-600">{data.month}</span>
            </h1>
            <p className="text-slate-500">Finanzielle Übersicht über Jobs und Personalkosten.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition shadow-sm">
            <Download size={18} /> Exportieren
        </button>
      </div>

      {/* --- KPI KARTEN --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* UMSATZ */}
        <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <TrendingUp size={60} className="text-green-600" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Echter Umsatz</p>
          <div className="text-3xl font-bold text-green-600">
            {formatEuro(data.summary.revenue)}
          </div>
          <p className="text-xs text-green-700 mt-2 font-medium bg-green-50 inline-block px-2 py-1 rounded">
             Aus erledigten Aufträgen
          </p>
        </div>
        
        {/* KOSTEN */}
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <Users size={60} className="text-red-600" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Personalkosten</p>
          <div className="text-3xl font-bold text-red-600">
             - {formatEuro(data.summary.laborCost)}
          </div>
          <p className="text-xs text-red-700 mt-2 font-medium bg-red-50 inline-block px-2 py-1 rounded">
             Summe der Stundenlöhne
          </p>
        </div>

        {/* GEWINN */}
        <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden ${data.summary.profit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Rohertrag (Gewinn)</p>
          <div className={`text-3xl font-bold ${data.summary.profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {formatEuro(data.summary.profit)}
          </div>
          <p className="text-xs text-slate-500 mt-2">Vor Steuern und sonstigen Ausgaben</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LINKS: CHART --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 min-h-[300px]">
          <h3 className="font-bold text-slate-800 mb-6">Verhältnis auf einen Blick</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  formatter={(val?: number) => formatEuro(val || 0)}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- RECHTS: LOHNLISTE --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Detaillierte Lohnliste</h3>
            <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-500 font-medium">
              {data.payroll.length} Mitarbeiter aktiv
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Mitarbeiter</th>
                  <th className="px-6 py-4 text-right">Stunden</th>
                  <th className="px-6 py-4 text-right">Stundenlohn</th>
                  <th className="px-6 py-4 text-right">Auszahlung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.payroll.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-700 group-hover:text-blue-700">
                      {emp.name}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      <div className="flex justify-end items-center gap-2">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{emp.hours}</span>
                          <Clock size={14} className="text-slate-400"/>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 text-sm font-medium">
                      {formatEuro(emp.hourlyWage)} / h
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800 bg-slate-50/30">
                      {formatEuro(emp.payout)}
                    </td>
                  </tr>
                ))}
                
                {data.payroll.length === 0 && (
                   <tr>
                     <td colSpan={4} className="text-center py-12 text-slate-400">
                       <div className="flex flex-col items-center gap-2">
                         <AlertCircle className="h-8 w-8 opacity-20" />
                         Keine erledigten Jobs in diesem Monat.
                       </div>
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}