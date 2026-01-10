import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, MapPin, Play, RefreshCw, UserPlus } from 'lucide-react';
import api from '../../lib/api';

// Typen
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface Job {
  id: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  customer: { 
    companyName: string | null; 
    firstName: string; 
    lastName: string;
  };
  service: { name: string };
  address: { street: string; city: string };
  assignments: { employee: Employee }[]; // Hier sind die zugewiesenen Mitarbeiter drin
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]); // Liste für das Dropdown
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Wir laden Jobs UND Mitarbeiter gleichzeitig
      const [jobsRes, employeesRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/employees')
      ]);

      // Jobs sortieren
      const sortedJobs = jobsRes.data.sort((a: Job, b: Job) => 
        new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
      );

      setJobs(sortedJobs);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateJobs = async () => {
    setLoading(true);
    try {
      await api.post('/debug/trigger-cron');
      await new Promise(r => setTimeout(r, 1000));
      await fetchData(); // Alles neu laden
      alert("Jobs wurden erfolgreich generiert!");
    } catch (error) {
      console.error(error);
      alert("Fehler: Konnte CronJob nicht starten.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    if (!confirm(`Status wirklich ändern?`)) return;
    try {
      await api.patch(`/jobs/${jobId}/status`, { status: newStatus });
      fetchData(); 
    } catch (error) {
      console.error(error);
      alert("Fehler beim Speichern");
    }
  };

  // NEU: Mitarbeiter zuweisen
  const handleAssignEmployee = async (jobId: string, employeeId: string) => {
    if (!employeeId) return; // Nichts ausgewählt
    try {
      await api.post(`/jobs/${jobId}/assign`, { employeeId });
      fetchData(); // Liste neu laden, damit der Name angezeigt wird
    } catch (error) {
      console.error(error);
      alert("Fehler bei der Zuweisung.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold"><CheckCircle size={14}/> Erledigt</span>;
      case 'CANCELLED': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-bold"><XCircle size={14}/> Storniert</span>;
      default: return <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-bold"><Clock size={14}/> Geplant</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Auftragsübersicht</h1>
          <p className="text-slate-500">Planung & Zuweisung</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white">
            <RefreshCw className="h-5 w-5" />
          </button>
          <button onClick={handleGenerateJobs} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors font-medium shadow-sm">
            <Play className="h-4 w-4" />
            Jobs generieren
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Lade Daten...</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:shadow-md transition-shadow">
              
              {/* Linke Seite: Job Details */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-slate-800">
                    {job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`}
                  </span>
                  {getStatusBadge(job.status)}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {new Date(job.scheduledDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'long' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {job.address?.street}, {job.address?.city}
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    {job.service.name}
                  </div>
                </div>
              </div>

              {/* Mitte: Mitarbeiter Zuweisung */}
              <div className="w-full lg:w-auto flex flex-col gap-2 min-w-[250px]">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <UserPlus className="h-3 w-3" /> Team
                </div>
                
                {/* Anzeige der bereits zugewiesenen Mitarbeiter */}
                {job.assignments.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {job.assignments.map((assignment, index) => (
                      <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                        {assignment.employee.firstName} {assignment.employee.lastName}
                      </span>
                    ))}
                    {/* Optional: Weitere hinzufügen */}
                     <select 
                      className="text-sm bg-white border border-slate-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500 w-8" 
                      onChange={(e) => handleAssignEmployee(job.id, e.target.value)}
                      value=""
                    >
                      <option value="">+</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  /* Wenn noch niemand zugewiesen ist: Dropdown zeigen */
                  <select 
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    onChange={(e) => handleAssignEmployee(job.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Mitarbeiter wählen --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Rechte Seite: Aktionen */}
              <div className="flex items-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 mt-2 lg:mt-0 w-full lg:w-auto justify-end">
                {job.status === 'SCHEDULED' && (
                  <button 
                    onClick={() => handleStatusChange(job.id, 'COMPLETED')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
                  >
                    Erledigt melden
                  </button>
                )}
              </div>

            </div>
          ))}

          {jobs.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">Keine Aufträge vorhanden.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}