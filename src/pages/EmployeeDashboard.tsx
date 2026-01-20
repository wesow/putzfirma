import { useEffect, useState } from 'react';
import { Play, Square, Clock, MapPin, CheckCircle, Calendar, AlertTriangle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

// Typen für die Jobs (angepasst an dein Backend)
interface MyJob {
    id: string; // Job ID
    assignmentId: string; // WICHTIG: Die ID der Zuweisung (JobAssignment)
    scheduledDate: string;
    customer: { companyName: string | null; lastName: string; firstName: string; };
    service: { name: string; duration: number };
    address: { street: string; city: string; zipCode: string };
    status: string; // Job Status
    myStatus: string; // Assignment Status (PENDING, IN_PROGRESS, COMPLETED)
    startedAt?: string;
    finishedAt?: string;
}

export default function EmployeeDashboard() {
  const [jobs, setJobs] = useState<MyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const firstName = localStorage.getItem('firstName') || 'Mitarbeiter';

  // State für manuelles Modal
  const [manualJob, setManualJob] = useState<MyJob | null>(null);
  const [manualTime, setManualTime] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      // Wir rufen den neuen Endpoint auf, den wir vorhin im Backend erstellt haben
      const res = await api.get('/jobs/me'); 
      setJobs(res.data);
    } catch (e) { 
      console.error("Fehler beim Laden:", e);
      // Fallback, falls der Endpoint noch nicht existiert (Leere Liste)
      setJobs([]); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleStart = async (assignmentId: string) => {
      const toastId = toast.loading("Starte Job...");
      try {
          await api.post('/time/start', { assignmentId });
          toast.success("Arbeit gestartet! ⏱️", { id: toastId });
          fetchMyJobs(); // Liste neu laden
      } catch (e) { 
          toast.error("Fehler beim Starten", { id: toastId }); 
      }
  };

  const handleStop = async (assignmentId: string) => {
      const toastId = toast.loading("Beende Job...");
      try {
          await api.post('/time/stop', { assignmentId });
          toast.success("Arbeit beendet! ✅", { id: toastId });
          fetchMyJobs();
      } catch (e) { 
          toast.error("Fehler beim Stoppen", { id: toastId }); 
      }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualJob) return;
      
      const dateStr = new Date(manualJob.scheduledDate).toISOString().split('T')[0]; // Datum vom Job
      // Zeit Strings (HH:MM) in ISO umwandeln
      const startISO = new Date(`${dateStr}T${manualTime.start}:00`).toISOString();
      const endISO = new Date(`${dateStr}T${manualTime.end}:00`).toISOString();

      const toastId = toast.loading("Speichere Zeit...");

      try {
          await api.post('/time/manual', { 
              assignmentId: manualJob.assignmentId, 
              startTime: startISO, 
              endTime: endISO 
          });
          toast.success("Zeit gespeichert!", { id: toastId });
          setManualJob(null);
          setManualTime({ start: '', end: '' });
          fetchMyJobs();
      } catch (e) { 
          toast.error("Fehler beim Speichern. Prüfe die Zeiten.", { id: toastId }); 
      }
  };

  if (loading) return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p>Lade deine Einsätze...</p>
      </div>
  );

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hallo, {firstName}! 👋</h1>
            <p className="text-slate-500 text-xs mt-0.5">Hier sind deine Aufgaben für heute.</p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-full">
              <Calendar size={20} />
          </div>
      </div>

      {/* JOBS LISTE */}
      {jobs.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Alles erledigt!</h3>
              <p className="text-slate-400 text-sm mt-1">Für heute stehen keine weiteren Jobs an.</p>
          </div>
      ) : (
          <div className="space-y-4">
            {jobs.map(job => (
                <div key={job.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
                    job.myStatus === 'IN_PROGRESS' ? 'border-blue-300 ring-4 ring-blue-50/50 shadow-blue-100' : 'border-slate-100'
                }`}>
                    
                    {/* Status Balken */}
                    <div className={`h-1.5 w-full ${
                        job.myStatus === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' : 
                        job.myStatus === 'COMPLETED' ? 'bg-green-500' : 'bg-slate-200'
                    }`}></div>

                    <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                                <Clock size={12}/> 
                                {new Date(job.scheduledDate).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})} Uhr
                            </span>
                            {job.myStatus === 'COMPLETED' ? (
                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-green-100">
                                    <CheckCircle size={12}/> Fertig
                                </span>
                            ) : job.myStatus === 'IN_PROGRESS' ? (
                                <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-blue-100 animate-pulse">
                                    <Play size={12}/> Läuft...
                                </span>
                            ) : (
                                <span className="text-slate-500 bg-slate-50 px-2 py-1 rounded text-xs font-bold border border-slate-100">
                                    Offen
                                </span>
                            )}
                        </div>
                        
                        <h3 className="font-bold text-lg text-slate-800 leading-snug mb-1">
                            {job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-start gap-1.5 mb-5">
                            <MapPin size={15} className="mt-0.5 shrink-0"/> 
                            {job.address.street}, {job.address.zipCode} {job.address.city}
                        </p>

                        {/* ACTION BUTTONS */}
                        {job.myStatus === 'PENDING' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleStart(job.assignmentId)}
                                    className="bg-blue-600 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition shadow-lg shadow-blue-100 hover:bg-blue-700"
                                >
                                    <Play size={18} fill="currentColor" /> Starten
                                </button>
                                <button 
                                    onClick={() => setManualJob(job)}
                                    className="bg-white text-slate-600 border border-slate-200 py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition hover:bg-slate-50"
                                >
                                    <Clock size={18} /> Nachtragen
                                </button>
                            </div>
                        )}

                        {job.myStatus === 'IN_PROGRESS' && (
                            <button 
                                onClick={() => handleStop(job.assignmentId)}
                                className="w-full bg-red-500 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 animate-pulse shadow-lg shadow-red-200 hover:bg-red-600 transition"
                            >
                                <Square size={18} fill="currentColor" /> Arbeit beenden
                            </button>
                        )}

                        {job.myStatus === 'COMPLETED' && (
                             <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span>Leistung: {job.service.name}</span>
                                <span className="font-mono">{job.service.duration} min (Plan)</span>
                             </div>
                        )}
                    </div>
                </div>
            ))}
          </div>
      )}

      {/* MODAL FÜR MANUELLE EINGABE */}
      {manualJob && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">Zeit nachtragen</h3>
                        <p className="text-xs text-slate-400">Für {manualJob.customer.lastName}</p>
                      </div>
                      <div className="bg-orange-100 text-orange-600 p-2 rounded-full"><AlertTriangle size={20}/></div>
                  </div>

                  <form onSubmit={handleManualSubmit} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Startzeit</label>
                              <input 
                                type="time" 
                                required 
                                className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 font-bold text-xl text-center outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" 
                                value={manualTime.start} 
                                onChange={e => setManualTime({...manualTime, start: e.target.value})} 
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Endzeit</label>
                              <input 
                                type="time" 
                                required 
                                className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 font-bold text-xl text-center outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                value={manualTime.end} 
                                onChange={e => setManualTime({...manualTime, end: e.target.value})} 
                              />
                          </div>
                      </div>

                      <div className="pt-2 flex gap-3">
                          <button type="button" onClick={() => setManualJob(null)} className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Abbrechen</button>
                          <button type="submit" className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Speichern</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}