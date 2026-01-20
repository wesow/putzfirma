import { useEffect, useState, useRef } from 'react';
import { Play, Square, Clock, MapPin, CheckCircle, Calendar, Camera, UploadCloud, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface MyJob {
    id: string; 
    assignmentId: string;
    scheduledDate: string;
    customer: { companyName: string | null; lastName: string; firstName: string; };
    service: { name: string; duration: number };
    address: { street: string; city: string; zipCode: string };
    status: string; 
    myStatus: string; 
    startedAt?: string;
    finishedAt?: string;
    proofs?: { id: string, url: string }[];
}

export default function EmployeeDashboard() {
  const [jobs, setJobs] = useState<MyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const firstName = localStorage.getItem('firstName') || 'Mitarbeiter';

  // --- MODAL STATES ---
  const [manualJob, setManualJob] = useState<MyJob | null>(null);
  const [manualTime, setManualTime] = useState({ start: '', end: '' });
  
  const [uploadJob, setUploadJob] = useState<MyJob | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/jobs/me'); 
      setJobs(res.data);
    } catch (e) { 
      console.error("Fehler beim Laden:", e);
      setJobs([]); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- HILFSFUNKTIONEN FÜR DATUM ---
  const isSameDay = (d1: Date, d2: Date) => {
      return d1.getDate() === d2.getDate() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getFullYear() === d2.getFullYear();
  };

  const getGroupedJobs = () => {
      const now = new Date();
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      // Leere Arrays für die Kategorien
      const grouped = {
          overdue: [] as MyJob[],   // Verpasst / Gestern
          today: [] as MyJob[],     // Heute
          tomorrow: [] as MyJob[],  // Morgen
          future: [] as MyJob[],    // Später
          completed: [] as MyJob[]  // Schon fertig
      };

      jobs.forEach(job => {
          const jobDate = new Date(job.scheduledDate);
          
          // 1. Wenn fertig -> ab zu Completed
          if (job.myStatus === 'COMPLETED' || job.status === 'COMPLETED') {
              grouped.completed.push(job);
              return;
          }

          // 2. Wenn noch offen -> Datum prüfen
          if (isSameDay(jobDate, today)) {
              grouped.today.push(job);
          } else if (isSameDay(jobDate, tomorrow)) {
              grouped.tomorrow.push(job);
          } else if (jobDate < today) {
              // Datum liegt in der Vergangenheit und ist NICHT fertig -> Überfällig
              grouped.overdue.push(job);
          } else {
              // Datum liegt in der Zukunft (nach morgen)
              grouped.future.push(job);
          }
      });

      // Sortieren: Überfällig, Heute, Morgen, Future -> Aufsteigend (älteste zuerst)
      // Completed -> Absteigend (neueste zuerst)
      const sortAsc = (a: MyJob, b: MyJob) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      const sortDesc = (a: MyJob, b: MyJob) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();

      grouped.overdue.sort(sortAsc);
      grouped.today.sort(sortAsc);
      grouped.tomorrow.sort(sortAsc);
      grouped.future.sort(sortAsc);
      grouped.completed.sort(sortDesc);

      return grouped;
  };

  const grouped = getGroupedJobs();

  // --- ACTIONS (Bleiben gleich) ---
  const handleStart = async (assignmentId: string) => {
      const toastId = toast.loading("Starte Job...");
      try {
          await api.post('/time/start', { assignmentId });
          toast.success("Arbeit gestartet! ⏱️", { id: toastId });
          fetchMyJobs();
      } catch (e) { toast.error("Fehler beim Starten", { id: toastId }); }
  };

  const handleStop = async (assignmentId: string) => {
      const toastId = toast.loading("Beende Job...");
      try {
          await api.post('/time/stop', { assignmentId });
          toast.success("Arbeit beendet! ✅", { id: toastId });
          fetchMyJobs();
      } catch (e) { toast.error("Fehler beim Stoppen", { id: toastId }); }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualJob) return;
      const dateStr = new Date(manualJob.scheduledDate).toISOString().split('T')[0];
      const startISO = new Date(`${dateStr}T${manualTime.start}:00`).toISOString();
      const endISO = new Date(`${dateStr}T${manualTime.end}:00`).toISOString();
      try {
          await api.post('/time/manual', { 
              assignmentId: manualJob.assignmentId, startTime: startISO, endTime: endISO 
          });
          toast.success("Zeit gespeichert!");
          setManualJob(null);
          fetchMyJobs();
      } catch (e) { toast.error("Fehler beim Speichern."); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUploadSubmit = async () => {
      if (!uploadJob || !selectedFile) return;
      const toastId = toast.loading("Lade Foto hoch...");
      const formData = new FormData();
      formData.append('image', selectedFile); 
      try {
          await api.post(`/jobs/${uploadJob.id}/proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          toast.success("Foto hochgeladen!", { id: toastId });
          setUploadJob(null);
          setSelectedFile(null);
          fetchMyJobs();
      } catch (e) { toast.error("Upload fehlgeschlagen.", { id: toastId }); }
  };

  // --- UI KOMPONENTE FÜR JOB-KARTE ---
  const JobCard = ({ job, label, colorClass }: { job: MyJob, label?: string, colorClass?: string }) => (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all mb-4 relative ${
        job.myStatus === 'IN_PROGRESS' ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-100'
    }`}>
        {/* Label Badge (z.B. HEUTE) */}
        {label && (
            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl ${colorClass}`}>
                {label}
            </div>
        )}

        <div className="p-5 pt-7"> {/* Etwas mehr Padding oben für das Label */}
            <div className="flex justify-between items-start mb-3">
                <span className="text-lg font-black text-slate-700 flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                    <Clock size={18} className="text-blue-600"/> 
                    {new Date(job.scheduledDate).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})}
                </span>
                
                <button onClick={() => setUploadJob(job)} className="text-slate-400 hover:text-blue-600 transition p-2 bg-slate-50 rounded-full border border-slate-200 active:scale-95">
                    <Camera size={20} />
                </button>
            </div>
            
            <h3 className="font-bold text-xl text-slate-800 leading-snug mb-1">
                {job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`}
            </h3>
            <p className="text-sm text-slate-500 flex items-start gap-1.5 mb-5">
                <MapPin size={15} className="mt-0.5 shrink-0"/> {job.address.street}, {job.address.city}
            </p>

            {job.myStatus === 'PENDING' && (
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleStart(job.assignmentId)} className="bg-blue-600 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition">
                        <Play size={18} fill="currentColor" /> Starten
                    </button>
                    <button onClick={() => setManualJob(job)} className="bg-white text-slate-600 border border-slate-200 py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-slate-50 active:scale-95 transition">
                        <Clock size={18} /> Nachtragen
                    </button>
                </div>
            )}

            {job.myStatus === 'IN_PROGRESS' && (
                <button onClick={() => handleStop(job.assignmentId)} className="w-full bg-red-500 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 animate-pulse shadow-lg shadow-red-200 hover:bg-red-600 transition active:scale-95">
                    <Square size={18} fill="currentColor" /> Arbeit beenden
                </button>
            )}

            {job.myStatus === 'COMPLETED' && (
                 <div className="flex items-center justify-between text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-100 opacity-80">
                    <span className="flex items-center gap-1 font-bold"><CheckCircle size={14}/> Erledigt</span>
                    {job.startedAt && job.finishedAt && (
                        <span className="font-mono">
                            {Math.round((new Date(job.finishedAt).getTime() - new Date(job.startedAt).getTime()) / 60000)} min
                        </span>
                    )}
                 </div>
            )}
        </div>
    </div>
  );

  if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">Lade deine Jobs...</div>;

  const hasAnyJobs = jobs.length > 0;

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6 pb-24 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hallo, {firstName}! 👋</h1>
            <p className="text-slate-500 text-xs mt-0.5">Hier ist dein Plan.</p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-full"><Calendar size={20} /></div>
      </div>

      {!hasAnyJobs ? (
          <div className="text-center py-12 px-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <div className="flex justify-center mb-4 text-slate-300"><CheckCircle size={40}/></div>
              <h3 className="text-lg font-bold text-slate-600">Alles erledigt!</h3>
              <p className="text-slate-400 text-sm">Keine offenen Jobs gefunden.</p>
          </div>
      ) : (
          <div className="space-y-6">
              
              {/* 1. ÜBERFÄLLIG (WICHTIG!) */}
              {grouped.overdue.length > 0 && (
                  <div>
                      <div className="flex items-center gap-2 mb-3 px-1 text-red-600 font-bold uppercase text-xs tracking-wider">
                          <AlertCircle size={14}/> Überfällig / Nachholen
                      </div>
                      {grouped.overdue.map(job => (
                          <JobCard key={job.id} job={job} label="Überfällig" colorClass="bg-red-100 text-red-600" />
                      ))}
                  </div>
              )}

              {/* 2. HEUTE */}
              {grouped.today.length > 0 && (
                  <div>
                      <div className="mb-3 px-1 text-slate-500 font-bold uppercase text-xs tracking-wider">Heute</div>
                      {grouped.today.map(job => (
                          <JobCard key={job.id} job={job} label="Heute" colorClass="bg-blue-100 text-blue-600" />
                      ))}
                  </div>
              )}

              {/* 3. MORGEN */}
              {grouped.tomorrow.length > 0 && (
                  <div>
                      <div className="mb-3 px-1 text-slate-500 font-bold uppercase text-xs tracking-wider">Morgen</div>
                      {grouped.tomorrow.map(job => (
                          <JobCard key={job.id} job={job} label="Morgen" colorClass="bg-orange-100 text-orange-600" />
                      ))}
                  </div>
              )}

              {/* 4. ZUKUNFT */}
              {grouped.future.length > 0 && (
                  <div>
                      <div className="mb-3 px-1 text-slate-500 font-bold uppercase text-xs tracking-wider">Demnächst</div>
                      {grouped.future.map(job => (
                          <JobCard key={job.id} job={job} />
                      ))}
                  </div>
              )}

              {/* 5. ERLEDIGT (Ganz unten, etwas dezenter) */}
              {grouped.completed.length > 0 && (
                  <div className="opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all">
                      <div className="my-6 border-t border-slate-200"></div>
                      <div className="mb-3 px-1 text-slate-400 font-bold uppercase text-xs tracking-wider">Bereits Erledigt</div>
                      {grouped.completed.map(job => (
                          <JobCard key={job.id} job={job} />
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* --- MODALS (Code bleibt gleich, nur Copy&Paste der Logik) --- */}
      {manualJob && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-slate-800">Zeit nachtragen</h3>
                      <button onClick={() => setManualJob(null)}><X className="text-slate-400"/></button>
                  </div>
                  <form onSubmit={handleManualSubmit} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Start</label><input type="time" required className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none" value={manualTime.start} onChange={e => setManualTime({...manualTime, start: e.target.value})} /></div>
                          <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ende</label><input type="time" required className="w-full p-3 border rounded-xl bg-slate-50 font-bold text-center text-lg focus:ring-2 focus:ring-blue-500 outline-none" value={manualTime.end} onChange={e => setManualTime({...manualTime, end: e.target.value})} /></div>
                      </div>
                      <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Speichern</button>
                  </form>
              </div>
          </div>
      )}

      {uploadJob && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom">
                  <div className="flex justify-between items-start mb-4">
                      <div><h3 className="font-bold text-lg text-slate-800">Foto hinzufügen</h3><p className="text-xs text-slate-400">Beweisfoto oder Schaden</p></div>
                      <button onClick={() => {setUploadJob(null); setSelectedFile(null);}}><X className="text-slate-400"/></button>
                  </div>
                  <div className="space-y-4">
                      <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 cursor-pointer transition active:scale-95 ${selectedFile ? 'border-green-500 bg-green-50 text-green-600' : 'border-slate-300 hover:bg-slate-50'}`}>
                          {selectedFile ? (<><CheckCircle size={40} className="mb-2"/><span className="text-sm font-bold truncate max-w-full px-4">{selectedFile.name}</span></>) : (<><Camera size={40} className="mb-2 opacity-50"/><span className="text-sm font-bold">Hier tippen für Foto</span></>)}
                          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                      </div>
                      <button onClick={handleUploadSubmit} disabled={!selectedFile} className="w-full bg-blue-600 disabled:bg-slate-300 disabled:text-slate-500 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-100 transition"><UploadCloud size={20} /> Hochladen</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}