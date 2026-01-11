import { useEffect, useState } from 'react';
import { BarChart3, Calendar, ChevronDown, ChevronRight, Clock, MapPin } from 'lucide-react';
import api from '../lib/api';

// --- TYPEN ---
interface JobDetail {
  id: string;
  date: string;
  customerName: string;
  serviceName: string;
  durationMinutes: number;
}

interface PayrollEntry {
  id: string;
  firstName: string;
  lastName: string;
  jobCount: number;
  totalMinutes: number;
  totalHours: number;
  details: JobDetail[]; // Das ist neu!
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State für "aufgeklappte" Mitarbeiter
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReport();
    setExpandedEmployeeId(null); // Zuklappen wenn Monat gewechselt wird
  }, [selectedMonth, selectedYear]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/payroll?month=${selectedMonth}&year=${selectedYear}`);
      setReportData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedEmployeeId === id) {
      setExpandedEmployeeId(null); // Zuklappen
    } else {
      setExpandedEmployeeId(id); // Aufklappen
    }
  };

  const totalHoursCompany = reportData.reduce((sum, item) => sum + item.totalHours, 0);

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" /> 
            Auswertungen
          </h1>
          <p className="text-slate-500">Detaillierte Arbeitszeitnachweise</p>
        </div>

        {/* DATUM FILTER */}
        <div className="flex gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
           <div className="flex items-center gap-2 px-2">
              <Calendar size={16} className="text-slate-400"/>
           </div>
           <select 
             value={selectedMonth} 
             onChange={(e) => setSelectedMonth(Number(e.target.value))}
             className="bg-transparent outline-none font-medium text-slate-700 cursor-pointer"
           >
             {[...Array(12)].map((_, i) => (
               <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleDateString('de-DE', { month: 'long' })}</option>
             ))}
           </select>
           <select 
             value={selectedYear} 
             onChange={(e) => setSelectedYear(Number(e.target.value))}
             className="bg-transparent outline-none font-medium text-slate-700 border-l pl-2 cursor-pointer"
           >
             <option value="2024">2024</option>
             <option value="2025">2025</option>
             <option value="2026">2026</option>
           </select>
        </div>
      </div>

      {/* KPI BOXEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <p className="text-sm text-slate-500 font-medium uppercase">Gesamtstunden</p>
             <p className="text-3xl font-bold text-slate-800 mt-2">{totalHoursCompany.toFixed(1)} h</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <p className="text-sm text-slate-500 font-medium uppercase">Lohn-Minuten</p>
             <p className="text-3xl font-bold text-slate-800 mt-2">{(totalHoursCompany * 60).toFixed(0)} min</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <p className="text-sm text-slate-500 font-medium uppercase">Aktive Mitarbeiter</p>
             <p className="text-3xl font-bold text-slate-800 mt-2">{reportData.filter(d => d.totalHours > 0).length}</p>
          </div>
      </div>

      {/* HAUPTTABELLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
           <h3 className="font-bold text-lg text-slate-800">Stundenzettel {selectedMonth}/{selectedYear}</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 w-10"></th> {/* Pfeil Spalte */}
                <th className="px-6 py-4">Mitarbeiter</th>
                <th className="px-6 py-4 text-center">Einsätze</th>
                <th className="px-6 py-4 text-right">Summe Stunden</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-slate-500">Lade Daten...</td></tr>
              ) : reportData.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-slate-500">Keine Daten für diesen Monat.</td></tr>
              ) : (
                reportData.map((row) => (
                  <>
                    {/* ZUSAMMENFASSUNG ZEILE */}
                    <tr 
                        key={row.id} 
                        onClick={() => toggleExpand(row.id)}
                        className={`cursor-pointer transition-colors ${expandedEmployeeId === row.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-6 py-4 text-slate-400">
                         {expandedEmployeeId === row.id ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{row.jobCount}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">
                        {row.totalHours.toLocaleString('de-DE')} h
                      </td>
                    </tr>

                    {/* DETAIL TABELLE (Nur sichtbar wenn aufgeklappt) */}
                    {expandedEmployeeId === row.id && (
                        <tr className="bg-slate-50/50 animate-in fade-in slide-in-from-top-1">
                            <td colSpan={4} className="p-4 sm:p-6 border-b border-slate-100 shadow-inner">
                                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium">Datum</th>
                                                <th className="px-4 py-2 text-left font-medium">Kunde</th>
                                                <th className="px-4 py-2 text-left font-medium">Service</th>
                                                <th className="px-4 py-2 text-right font-medium">Dauer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {row.details.length === 0 ? (
                                                <tr><td colSpan={4} className="p-4 text-center text-slate-400">Keine Einträge</td></tr>
                                            ) : (
                                                row.details.map((detail) => (
                                                    <tr key={detail.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 text-slate-600">
                                                            {new Date(detail.date).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-slate-800">
                                                            {detail.customerName}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600">
                                                            {detail.serviceName}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono text-slate-700">
                                                            {detail.durationMinutes} min
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        {/* Summenzeile unten drunter */}
                                        <tfoot className="bg-slate-50 border-t border-slate-200">
                                            <tr>
                                                <td colSpan={3} className="px-4 py-2 text-right font-bold text-slate-500 uppercase text-xs">Summe:</td>
                                                <td className="px-4 py-2 text-right font-bold text-slate-800">{row.totalMinutes} min</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}