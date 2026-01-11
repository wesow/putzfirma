import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, MapPin, Play, RefreshCw, UserPlus, X } from 'lucide-react';
import api from '../../lib/api';

// --- TYPEN ---
interface Employee { id: string; firstName: string; lastName: string; }
interface Job {
  id: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  customer: { companyName: string | null; firstName: string; lastName: string; };
  service: { name: string };
  address: { street: string; city: string };
  assignments: { employee: Employee }[];
  actualDurationMinutes: number | null;
}

export default function JobsPage() {
  // --- STATE ---
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [durationInput, setDurationInput] = useState('');

  // Rollen-Check
  const role = localStorage.getItem('role');
  const isAdmin = role === 'ADMIN';

  // --- EFFEKTE ---
  useEffect(() => {
    fetchData();
  }, []);

  // --- API CALLS ---
  const fetchData = async () => {
    try {
      const promises = [api.get('/jobs')];
      
      // Nur Admins brauchen die Mitarbeiter-Liste für das Dropdown
      if (isAdmin) {
        promises.push(api.get('/employees'));
      }

      const [jobsRes, employeesRes] = await Promise.all(promises);

      // Sortieren: Neueste zuerst
      const sortedJobs = jobsRes.data.sort((a: Job, b: Job) => 
        new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
      );

      setJobs(sortedJobs);
      if (employeesRes) setEmployees(employeesRes.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateJobs = async () => { 
      try { 
        await api.post('/jobs/generate'); 
        fetchData(); 
        alert("Jobs erfolgreich generiert!"); 
      } catch(e) { 
        alert("Fehler beim Generieren."); 
      }
  };

  // Status ändern (wird für STORNIEREN genutzt)
  const handleStatusChange = async (id: string, s: string) => { 
     try { 
       await api.patch(`/jobs/${id}/status`, { status: s }); 
       fetchData(); 
     } catch(e) { 
       alert("Fehler beim Status-Update"); 
     }
  };

  const handleAssignEmployee = async (jid: string, eid: string) => {
     try { 
       await api.post(`/jobs/${jid}/assign`, { employeeId: eid }); 
       fetchData(); 
     } catch(e) { 
       alert("Fehler bei der Zuweisung"); 
     }
  };

  // --- MODAL LOGIK ---
  
  const openCompletionModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setDurationInput(''); 
    setIsModalOpen(true);
  };

  const confirmCompletion = async () => {
    if (!selectedJobId || !durationInput) {
        alert("Bitte Zeit eintragen!");
        return;
    }

    try {
        await api.patch(`/jobs/${selectedJobId}`, {
            status: 'COMPLETED',
            actualDurationMinutes: Number(durationInput)
        });
        
        setIsModalOpen(false);
        fetchData(); // Liste aktualisieren
    } catch (error) {
        console.error(error);
        alert("Fehler beim Speichern.");
    }
  };

  // --- HELPER ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold"><CheckCircle size={14}/> Erledigt</span>;
      case 'CANCELLED': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-bold"><XCircle size={14}/> Storniert</span>;
      default: return <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-bold"><Clock size={14}/> Geplant</span>;
    }
  };

  // --- RENDER ---
  return (
    <div className="space-y-6 relative">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isAdmin ? 'Auftragsübersicht' : 'Meine Aufträge'}
          </h1>
          <p className="text-slate-500">
            {isAdmin ? 'Planung & Zuweisung' : 'Deine anstehenden Einsätze'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white" title="Aktualisieren">
            <RefreshCw className="h-5 w-5" />
          </button>
          
          {isAdmin && (
            <button onClick={handleGenerateJobs} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors font-medium shadow-sm">
              <Play className="h-4 w-4" />
              Jobs generieren
            </button>
          )}
        </div>
      </div>

      {/* LISTE */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">Lade Daten...</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:shadow-md transition-shadow">
              
              {/* LINKER TEIL: INFOS */}
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
                  
                  {/* Anzeige der Dauer, falls erledigt */}
                  {job.status === 'COMPLETED' && job.actualDurationMinutes && (
                      <div className="flex items-center gap-1.5 text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded border border-green-100">
                        <Clock className="h-4 w-4" />
                        {job.actualDurationMinutes} Min.
                      </div>
                  )}
                </div>
              </div>

              {/* MITTLERER TEIL: ZUWEISUNG */}
              <div className="w-full lg:w-auto flex flex-col gap-2 min-w-[200px]">
                {isAdmin && (
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <UserPlus className="h-3 w-3" /> Team Zuweisung
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {job.assignments.map((assignment, index) => (
                    <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                      {assignment.employee.firstName}
                    </span>
                  ))}

                  {isAdmin && (
                    <select 
                      className="text-sm bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500 cursor-pointer hover:bg-white transition" 
                      onChange={(e) => handleAssignEmployee(job.id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>+</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* RECHTER TEIL: AKTIONEN */}
              <div className="flex items-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 mt-2 lg:mt-0 w-full lg:w-auto justify-end">
                
                {/* Nur anzeigen wenn noch geplant */}
                {job.status === 'SCHEDULED' && (
                  <>
                    {/* Stornieren Button */}
                    <button 
                      onClick={() => handleStatusChange(job.id, 'CANCELLED')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors"
                      title="Auftrag stornieren"
                    >
                      <XCircle size={20} />
                    </button>

                    {/* Erledigen Button */}
                    <button 
                      onClick={() => openCompletionModal(job.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Als Erledigt markieren
                    </button>
                  </>
                )}
              </div>

            </div>
          ))}

          {jobs.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">
                {isAdmin ? 'Keine Aufträge vorhanden.' : 'Keine Aufträge für dich gefunden. Gut gemacht! 🎉'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL FÜR ZEITERFASSUNG --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-800">Job abschließen</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Wie lange hast du gebraucht?
                    </label>
                    <div className="relative group">
                        <Clock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                        <input 
                            type="number" 
                            autoFocus
                            placeholder="z.B. 120"
                            value={durationInput}
                            onChange={(e) => setDurationInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmCompletion()}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg font-semibold transition-all"
                        />
                        <span className="absolute right-4 top-3 text-slate-400 text-sm font-medium">Minuten</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Diese Zeit wird für die Abrechnung und deinen Lohn verwendet.
                    </p>
                </div>

                <button 
                    onClick={confirmCompletion}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 active:scale-[0.98]"
                >
                    Bestätigen & Abschließen
                </button>
            </div>
        </div>
      )}

    </div>
  );
}