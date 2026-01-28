import { useEffect, useState, useRef } from 'react';
import { 
  Play, Clock, MapPin, CheckCircle, Calendar, 
  Camera, UploadCloud, X, AlertCircle, ListTodo, 
  ChevronRight, CheckSquare, Square as EmptySquare, Loader2, Sparkles, Navigation, Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface MyJob {
  id: string; 
  assignmentId: string;
  scheduledDate: string;
  customer: { companyName: string | null; lastName: string; firstName: string; addresses?: any[] };
  service: { 
      name: string; 
      duration: number;
      checklist: any; // <--- Typ gelockert, wir parsen es manuell
  };
  address: { street: string; city: string; zipCode: string };
  status: string; 
  myStatus: string; 
  startedAt?: string;
  finishedAt?: string;
  proofs?: { id: string, url: string }[];
}

// Hilfskomponente für die Karte
const JobCard = ({ job, label, colorClass, onClick }: { job: MyJob, label?: string, colorClass?: string, onClick: (job: MyJob) => void }) => (
    <div 
        onClick={() => onClick(job)}
        className={`bg-white rounded-[1.5rem] shadow-lg border p-5 mb-4 relative cursor-pointer active:scale-[0.97] transition-all duration-300 ${
            job.myStatus === 'IN_PROGRESS' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-100'
        }`}
    >
        {label && (
          <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase rounded-bl-2xl tracking-[0.1em] shadow-sm ${colorClass}`}>
            {label}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                <Clock size={12} className="text-blue-500"/> 
                {new Date(job.scheduledDate).toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})} Uhr
            </span>
            {job.myStatus === 'IN_PROGRESS' && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
            )}
        </div>

        <h3 className="font-black text-slate-900 text-lg leading-tight mb-1 tracking-tight text-left">
            {job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`}
        </h3>
        
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold italic mb-5 text-left">
            <MapPin size={12} className="shrink-0 text-blue-400"/>
            <span className="truncate uppercase not-italic tracking-tighter text-slate-400">{job.address.street}, {job.address.city}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <span className="text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                {job.service.name}
            </span>
            <div className="flex items-center text-blue-600 text-[10px] font-black gap-1 uppercase tracking-[0.15em]">
                Details <ChevronRight size={14} strokeWidth={3}/>
            </div>
        </div>
    </div>
);

export default function EmployeeDashboard() {
  const [jobs, setJobs] = useState<MyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const firstName = localStorage.getItem('firstName') || 'Mitarbeiter';

  const [activeJob, setActiveJob] = useState<MyJob | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State für manuelles Nachtragen
  const [showManualTime, setShowManualTime] = useState(false);
  const [manualStart, setManualStart] = useState('');
  const [manualEnd, setManualEnd] = useState('');

  useEffect(() => { fetchMyJobs(); }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/jobs/me'); 
      setJobs(res.data);
    } catch (e) { setJobs([]); } 
    finally { setLoading(false); }
  };

  const getSafeChecklist = (job: MyJob): string[] => {
      try {
          if (Array.isArray(job.service.checklist)) return job.service.checklist;
          if (typeof job.service.checklist === 'string') return JSON.parse(job.service.checklist);
          return [];
      } catch (e) { return []; }
  };

  const grouped = (() => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      const isSameDay = (d1: Date, d2: Date) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

      const res = { overdue: [] as MyJob[], today: [] as MyJob[], tomorrow: [] as MyJob[], future: [] as MyJob[], completed: [] as MyJob[] };
      jobs.forEach(job => {
          const d = new Date(job.scheduledDate);
          if (job.myStatus === 'COMPLETED' || job.status === 'COMPLETED') res.completed.push(job);
          else if (isSameDay(d, today)) res.today.push(job);
          else if (isSameDay(d, tomorrow)) res.tomorrow.push(job);
          else if (d < today) res.overdue.push(job);
          else res.future.push(job);
      });
      return res;
  })();

  const handleStart = async (job: MyJob) => {
      const toastId = toast.loading("Arbeitszeit wird gestartet...");
      try {
          await api.post('/time/start', { assignmentId: job.assignmentId });
          toast.success("Viel Erfolg! 🚀", { id: toastId });
          fetchMyJobs();
          setActiveJob({ ...job, myStatus: 'IN_PROGRESS' }); 
      } catch (e) { toast.error("Fehler beim Starten", { id: toastId }); }
  };

  const handleStop = async (job: MyJob) => {
      const list = getSafeChecklist(job);
      const totalItems = list.length;
      const checkedCount = Object.values(checkedItems).filter(Boolean).length;
      
      if (totalItems > 0 && checkedCount < totalItems) {
          if(!confirm(`Checkliste unvollständig (${checkedCount}/${totalItems}). Trotzdem beenden?`)) return;
      }
      
      const toastId = toast.loading("Job wird abgeschlossen...");
      try {
          await api.post('/time/stop', { assignmentId: job.assignmentId });
          toast.success("Super Arbeit! 🎉", { id: toastId });
          setActiveJob(null);
          setCheckedItems({}); 
          fetchMyJobs();
      } catch (e) { toast.error("Fehler beim Beenden", { id: toastId }); }
  };

  // Manuelles Nachtragen
  const handleManualSubmit = async () => {
      if(!activeJob || !manualStart || !manualEnd) return toast.error("Zeiten fehlen");
      
      // Datum vom Job nehmen, Uhrzeit vom Input
      const baseDate = activeJob.scheduledDate.split('T')[0];
      const startIso = `${baseDate}T${manualStart}:00.000Z`; // Vereinfacht (besser wäre local time handling)
      const endIso = `${baseDate}T${manualEnd}:00.000Z`;

      const toastId = toast.loading("Speichere Nachtrag...");
      try {
          await api.patch(`/time/${activeJob.assignmentId}/manual`, { 
              startTime: new Date(`${baseDate}T${manualStart}`), 
              endTime: new Date(`${baseDate}T${manualEnd}`) 
          });
          toast.success("Zeit nachgetragen!", { id: toastId });
          setShowManualTime(false);
          setActiveJob(null);
          fetchMyJobs();
      } catch (e) { toast.error("Fehler beim Speichern", { id: toastId }); }
  };

  const handleUpload = async () => {
      if (!activeJob || !selectedFile) return;
      const toastId = toast.loading("Foto wird übertragen...");
      const formData = new FormData();
      formData.append('image', selectedFile); 
      try {
          await api.post(`/jobs/${activeJob.id}/proof`, formData);
          toast.success("Foto gespeichert!", { id: toastId });
          setSelectedFile(null);
          fetchMyJobs();
      } catch (e) { toast.error("Upload fehlgeschlagen", { id: toastId }); }
  };

  const toggleCheckItem = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-slate-400 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={44} />
        <p className="font-black text-[10px] uppercase tracking-[0.2em]">Synchronisiere Dienstplan...</p>
    </div>
  );

  const checklistItems = activeJob ? getSafeChecklist(activeJob) : [];

  return (
    <div className="max-w-md mx-auto p-4 pb-24 animate-in fade-in duration-500">
      
      {/* 1. WELCOME HEADER */}
      <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl shadow-blue-900/20 mb-8 flex justify-between items-center relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-all duration-700"></div>
          <div className="relative z-10 text-left">
            <h1 className="text-xl font-black text-white tracking-tight leading-none mb-2">Moin, {firstName}!</h1>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Deine heutigen Einsätze</p>
          </div>
          <div className="bg-white/10 text-white p-3 rounded-2xl border border-white/10 backdrop-blur-md relative z-10 shadow-xl">
            <Calendar size={22} />
          </div>
      </div>

      {/* 2. JOB SECTIONS */}
      <div className="space-y-10">
          {grouped.overdue.length > 0 && (
              <div>
                  <div className="flex items-center gap-2 mb-4 px-2 text-red-600 font-black uppercase text-[10px] tracking-[0.2em]"><AlertCircle size={14}/> Dringend / Überfällig</div>
                  {grouped.overdue.map(j => <JobCard key={j.id} job={j} label="Priorität" colorClass="bg-red-500 text-white" onClick={setActiveJob} />)}
              </div>
          )}
          
          {grouped.today.length > 0 && (
              <div>
                  <div className="mb-4 px-2 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Heute</div>
                  {grouped.today.map(j => <JobCard key={j.id} job={j} label="Heute" colorClass="bg-blue-600 text-white" onClick={setActiveJob} />)}
              </div>
          )}

          {grouped.tomorrow.length > 0 && (
              <div>
                  <div className="mb-4 px-2 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Morgen</div>
                  {grouped.tomorrow.map(j => <JobCard key={j.id} job={j} onClick={setActiveJob} />)}
              </div>
          )}

          {grouped.completed.length > 0 && (
              <div className="opacity-60 grayscale-[0.5]">
                  <div className="mb-4 px-2 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Erledigt</div>
                  {grouped.completed.map(j => <JobCard key={j.id} job={j} onClick={setActiveJob} />)}
              </div>
          )}

          {jobs.length === 0 && (
              <div className="text-center py-24 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <Sparkles size={40} className="text-slate-200 mx-auto mb-4"/>
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Aktuell keine Einsätze geplant</p>
              </div>
          )}
      </div>

      {/* --- DETAIL SCREEN (MOBILE FULLSCREEN) --- */}
      {activeJob && (
          <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-500">
              <div className="bg-white p-5 flex justify-between items-center shadow-xl shadow-slate-200/50 sticky top-0 z-10 border-b border-slate-100">
                  <button onClick={() => { setActiveJob(null); setShowManualTime(false); }} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all"><X size={24}/></button>
                  <span className="font-black text-slate-900 text-xs uppercase tracking-[0.2em]">Einsatz-Details</span>
                  <div className="w-10"></div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-40 text-left">
                  {/* ZEIT-NACHTRAGEN MODUS */}
                  {showManualTime ? (
                      <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 space-y-4">
                          <h3 className="font-black text-lg">Zeit nachtragen</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="label-caps">Start</label>
                                  <input type="time" className="input-standard text-center" value={manualStart} onChange={e => setManualStart(e.target.value)} />
                              </div>
                              <div>
                                  <label className="label-caps">Ende</label>
                                  <input type="time" className="input-standard text-center" value={manualEnd} onChange={e => setManualEnd(e.target.value)} />
                              </div>
                          </div>
                          <button onClick={handleManualSubmit} className="btn-primary w-full justify-center">Speichern</button>
                      </div>
                  ) : (
                      <>
                          {activeJob.myStatus === 'IN_PROGRESS' && (
                              <div className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-xl shadow-blue-600/20 mb-8 flex items-center justify-between group">
                                  <div className="flex items-center gap-4">
                                      <div className="bg-white/20 p-3 rounded-2xl animate-pulse"><Play size={20} fill="currentColor"/></div>
                                      <div>
                                        <span className="font-black text-sm uppercase tracking-widest block">Live am Einsatz</span>
                                        <p className="text-[10px] text-blue-100 font-medium uppercase mt-0.5 opacity-80 tracking-widest">Die Zeit wird erfasst</p>
                                      </div>
                                  </div>
                                  <Clock size={20} className="animate-spin-slow opacity-30" />
                              </div>
                          )}

                          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-6">
                              <div className="label-caps !text-blue-600 !ml-0 mb-2">Kunde & Standort</div>
                              <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-none">
                                  {activeJob.customer.companyName || `${activeJob.customer.firstName} ${activeJob.customer.lastName}`}
                              </h2>
                              <div className="flex gap-2">
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeJob.address.street + ', ' + activeJob.address.zipCode + ' ' + activeJob.address.city)}`}
                                  target="_blank" rel="noreferrer"
                                  className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.15em] bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all w-full justify-center"
                                >
                                  <Navigation size={16} fill="currentColor"/> Route starten
                                </a>
                              </div>
                          </div>

                          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-6">
                              <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                                <div className="label-caps !text-indigo-600 !mb-0 flex items-center gap-2"><ListTodo size={16}/> Checkliste</div>
                                <span className="status-badge bg-indigo-50 text-indigo-700 border-indigo-100 !rounded-md font-black">{activeJob.service.name}</span>
                              </div>
                              
                              {checklistItems.length > 0 ? (
                                  <div className="space-y-3">
                                      {checklistItems.map((item, idx) => (
                                          <div 
                                            key={idx} 
                                            onClick={() => toggleCheckItem(item)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${checkedItems[item] ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}
                                          >
                                              <div className={`${checkedItems[item] ? 'text-emerald-500' : 'text-slate-300'} shrink-0`}>
                                                  {checkedItems[item] ? <CheckSquare size={24} strokeWidth={2.5}/> : <EmptySquare size={24} strokeWidth={2.5}/>}
                                              </div>
                                              <span className={`text-sm font-bold ${checkedItems[item] ? 'text-emerald-900 line-through' : 'text-slate-700'}`}>{item}</span>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <div className="py-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic opacity-50">Keine Aufgaben hinterlegt</div>
                              )}
                          </div>

                          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                              <div className="label-caps !text-amber-600 !ml-0 mb-4 flex items-center gap-2"><Camera size={16}/> Arbeitsnachweis</div>
                              <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-[1.5rem] p-10 flex flex-col items-center justify-center transition-all ${selectedFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 text-slate-400 active:bg-slate-100'}`}
                              >
                                  <UploadCloud size={32} className="mb-3"/>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-center">
                                    {selectedFile ? 'Foto erfasst ✓' : 'Kamera öffnen & Foto aufnehmen'}
                                  </span>
                                  <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} className="hidden"/>
                              </div>
                              {selectedFile && (
                                  <button onClick={handleUpload} className="btn-primary w-full mt-4 !py-4 justify-center !bg-slate-900 border-slate-900 shadow-xl font-black text-[10px] uppercase tracking-widest">Foto jetzt hochladen</button>
                              )}
                          </div>
                      </>
                  )}
              </div>

              {/* FOOTER ACTIONS */}
         {/* FOOTER ACTIONS */}
              {activeJob.myStatus !== 'COMPLETED' && !showManualTime && (
                  <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-[70] pb-safe shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
                      
                      {/* Zeige START Button, wenn Status NICHT "IN_PROGRESS" ist */}
                      {activeJob.myStatus !== 'IN_PROGRESS' ? (
                          <div className="flex gap-3">
                              <button 
                                onClick={() => handleStart(activeJob)} 
                                className="btn-primary flex-1 !py-5 justify-center text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30"
                              >
                                <Play fill="currentColor" size={18}/> Start
                              </button>
                              
                              {/* BUTTON FÜR MANUELLES NACHTRAGEN */}
                              <button 
                                onClick={() => setShowManualTime(true)}
                                className="p-4 bg-slate-100 rounded-2xl text-slate-500 hover:text-slate-800"
                              >
                                  <Edit3 size={24} />
                              </button>
                          </div>
                      ) : (
                          /* Zeige STOP Button, wenn Status "IN_PROGRESS" IST */
                          <button 
                            onClick={() => handleStop(activeJob)} 
                            className="btn-primary w-full !py-5 justify-center text-sm font-black uppercase tracking-[0.2em] !bg-emerald-600 border-emerald-700 shadow-2xl shadow-emerald-600/30"
                          >
                            <CheckCircle size={20}/> Arbeit beenden
                          </button>
                      )}
                  </div>
              )}
          </div>
      )}
    </div>
  );
}