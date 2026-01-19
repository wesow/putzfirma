import { useEffect, useState } from 'react';
import { BarChart3, Download, FileText, Calendar, Filter, PieChart, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

// Typen definieren
interface Report {
  id: string;
  title: string;
  type: 'FINANCE' | 'PERFORMANCE' | 'HR' | 'INVENTORY';
  date: string;
  size: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Daten simulieren (Mock)
  useEffect(() => {
    // Wir tun so, als würden wir Daten laden
    const timer = setTimeout(() => {
      setReports([
        { id: '1', title: 'Umsatzbericht Q1 2026', type: 'FINANCE', date: '2026-04-01', size: '2.4 MB' },
        { id: '2', title: 'Mitarbeiter Stundenübersicht', type: 'HR', date: '2026-03-15', size: '1.1 MB' },
        { id: '3', title: 'Materialverbrauch & Lager', type: 'INVENTORY', date: '2026-03-01', size: '850 KB' },
        { id: '4', title: 'Jahresabschluss 2025', type: 'FINANCE', date: '2026-01-10', size: '5.2 MB' },
        { id: '5', title: 'Kunden-Zufriedenheitsanalyse', type: 'PERFORMANCE', date: '2025-12-20', size: '1.8 MB' },
      ]);
      setLoading(false);
    }, 800); // Kurze Ladezeit simulieren

    return () => clearTimeout(timer);
  }, []);

  // 2. Download Funktion (Client-Side Simulation)
  const handleDownload = (id: string, title: string) => {
    const toastId = toast.loading("Download wird vorbereitet...");

    try {
      // Wir simulieren den Inhalt der Datei
      const dummyContent = `
=========================================
BERICHT: ${title}
ID: ${id}
Erstellt am: ${new Date().toLocaleDateString()}
=========================================

Dies ist ein automatisch generierter Beispiel-Bericht aus der CleanOps App.

ZUSAMMENFASSUNG:
- Umsatz: Stabil
- Mitarbeiter: Alle anwesend
- Lagerbestand: OK

-----------------------------------------
(c) 2026 CleanOps GmbH
      `;

      // Erstelle ein "Blob" (Datei im Speicher)
      const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
      
      // Erstelle eine URL für diesen Blob
      const url = window.URL.createObjectURL(blob);
      
      // Erstelle einen unsichtbaren Link und klicke ihn
      const link = document.createElement('a');
      link.href = url;
      // Dateiname setzen (Leerzeichen durch Unterstriche ersetzen)
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}.txt`);
      
      document.body.appendChild(link);
      link.click();
      
      // Aufräumen
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download erfolgreich!", { id: toastId });
    } catch (error) {
      toast.error("Download fehlgeschlagen", { id: toastId });
    }
  };

  const getCategoryBadge = (type: string) => {
    switch (type) {
        case 'FINANCE': return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded border border-green-200 font-bold">Finanzen</span>;
        case 'HR': return <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded border border-purple-200 font-bold">Personal</span>;
        case 'INVENTORY': return <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded border border-orange-200 font-bold">Lager</span>;
        default: return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded border border-blue-200 font-bold">Allgemein</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-blue-600" /> Berichte & Analysen
          </h1>
          <p className="text-slate-500 text-sm">Lade Auswertungen und Statistiken herunter.</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-sm font-bold shadow-sm transition">
            <Filter size={16} /> Zeitraum filtern
        </button>
      </div>

      {/* KPI KARTEN (Platzhalter Statistiken) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
              <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/20 p-2 rounded-lg"><TrendingUp size={24} color="white"/></div>
                  <span className="text-blue-100 text-xs font-bold bg-white/10 px-2 py-1 rounded">+12%</span>
              </div>
              <p className="text-blue-100 text-sm font-medium mb-1">Gesamtumsatz (Monat)</p>
              <h3 className="text-3xl font-bold">12.450 €</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                   <div className="bg-purple-50 p-2 rounded-lg"><FileText size={24} className="text-purple-600"/></div>
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">Generierte Berichte</p>
              <h3 className="text-3xl font-bold text-slate-800">24</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                   <div className="bg-orange-50 p-2 rounded-lg"><PieChart size={24} className="text-orange-600"/></div>
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">Offene Posten</p>
              <h3 className="text-3xl font-bold text-slate-800">3.200 €</h3>
          </div>
      </div>

      {/* TABELLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Verfügbare Downloads</h3>
            <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{reports.length} Dateien</span>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Kategorie</th>
                    <th className="px-6 py-4">Datum</th>
                    <th className="px-6 py-4">Größe</th>
                    <th className="px-6 py-4 text-right">Aktion</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-400">Lade Berichte...</td></tr>
                ) : reports.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-400">Keine Berichte verfügbar.</td></tr>
                ) : (
                    reports.map((report) => (
                    <tr key={report.id} className="hover:bg-blue-50/50 transition group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 p-2 rounded-lg text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                                    <FileText size={20} />
                                </div>
                                <span className="font-bold text-slate-700 group-hover:text-blue-700 transition">{report.title}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {getCategoryBadge(report.type)}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm font-medium flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(report.date).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                            {report.size}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => handleDownload(report.id, report.title)}
                                className="text-slate-400 hover:text-blue-600 transition p-2 hover:bg-blue-50 rounded-lg flex items-center gap-2 ml-auto"
                                title="Herunterladen"
                            >
                                <span className="text-xs font-bold hidden group-hover:inline">Download</span>
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
    </div>
  );
}