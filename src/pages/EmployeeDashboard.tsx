import { useEffect, useState, useRef } from 'react';
import { 
  Play, Clock, MapPin, CheckCircle, Calendar, 
  Camera, UploadCloud, X, AlertCircle, ListTodo, 
  ChevronRight, CheckSquare, Square as EmptySquare, Loader2, Sparkles, Navigation, Edit3, RefreshCw
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
      checklist: any; 
  };
  address: { street: string; city: string; zipCode: string };
  status: string; 
  myStatus: string; 
  startedAt?: string;
  finishedAt?: string;
  proofs?: { id: string, url: string }[];
}

// --- HILFSKOMPONENTE: JOB CARD (KOMPAKT) ---
const JobCard = ({ job, label, colorClass, onClick }: { job: MyJob, label?: string, colorClass?: string, onClick: (job: MyJob) => void }) => (
    <div 
        onClick={() => onClick(job)}
        className={`bg-white rounded-lg border p-4 relative cursor-pointer active:scale-[0.98] transition-all hover:shadow-md group ${
            job.myStatus === 'IN_PROGRESS' 
                ? 'border-blue-500 shadow-sm ring-1 ring-blue-500/10' 
                : 'border-slate-200 hover:border-blue-300'
        }`}
    >
        {/* Label oben rechts */}
        {label && (
          <div className={`absolute -top-px -right-px px-2 py-0.5 text-[9px] font-bold uppercase rounded-bl-lg rounded-tr-lg tracking-wide ${colorClass}`}>
            {label}
          </div>
        )}
        
        {/* Header: Zeit & Status */}
        <div className="flex justify-between items-start mb-2">
            <span className={`text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wide px-2 py-1 rounded-md border ${job.myStatus === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                <Clock size={12} className={job.myStatus === 'IN_PROGRESS' ? 'text-blue-600 animate-pulse' : 'text-slate-400'}/> 
                {new Date(job.scheduledDate).toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})}
            </span>
        </div>

        {/* Inhalt */}
        <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1 truncate">
            {job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`}
        </h3>
        
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-3 truncate">
            <MapPin size={12} className="shrink-0 text-slate-400"/>
            <span className="truncate">{job.address.street}, {job.address.city}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            <span className="text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded uppercase tracking-wide truncate max-w-[70%]">
                {job.service.name}
            </span>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors"/>
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
    setLoading(true);
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
      const toastId = toast.loading("Starte...");
      try {
          await api.post('/time/start', { assignmentId: job.assignmentId });
          toast.success("Gestartet", { id: toastId });
          fetchMyJobs();
          setActiveJob({ ...job, myStatus: 'IN_PROGRESS' }); 
      } catch (e) { toast.error("Fehler", { id: toastId }); }
  };

  const handleStop = async (job: MyJob) => {
      const list = getSafeChecklist(job);
      const totalItems = list.length;
      const checkedCount = Object.values(checkedItems).filter(Boolean).length;
      
      if (totalItems > 0 && checkedCount < totalItems) {
          if(!confirm(`Checkliste unvollständig (${checkedCount}/${totalItems}). Beenden?`)) return;
      }
      
      const toastId = toast.loading("Beende...");
      try {
          await api.post('/time/stop', { assignmentId: job.assignmentId });
          toast.success("Erledigt!", { id: toastId });
          setActiveJob(null);
          setCheckedItems({}); 
          fetchMyJobs();
      } catch (e) { toast.error("Fehler", { id: toastId }); }
  };

  const handleManualSubmit = async () => {
      if(!activeJob || !manualStart || !manualEnd) return toast.error("Zeiten fehlen");
      const baseDate = activeJob.scheduledDate.split('T')[0];
      const toastId = toast.loading("Speichere...");
      try {
          await api.patch(`/time/${activeJob.assignmentId}/manual`, { 
              startTime: new Date(`${baseDate}T${manualStart}`), 
              endTime: new Date(`${baseDate}T${manualEnd}`) 
          });
          toast.success("Gespeichert", { id: toastId });
          setShowManualTime(false);
          setActiveJob(null);
          fetchMyJobs();
      } catch (e) { toast.error("Fehler", { id: toastId }); }
  };

  const handleUpload = async () => {
      if (!activeJob || !selectedFile) return;
      const toastId = toast.loading("Upload...");
      const formData = new FormData();
      formData.append('image', selectedFile); 
      try {
          await api.post(`/jobs/${activeJob.id}/proof`, formData);
          toast.success("Gespeichert", { id: toastId });
          setSelectedFile(null);
          fetchMyJobs();
      } catch (e) { toast.error("Fehler", { id: toastId }); }
  };

  const toggleCheckItem = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="font-bold text-[10px] uppercase tracking-wider">Lade Einsätze...</p>
    </div>
  );

  const checklistItems = activeJob ? getSafeChecklist(activeJob) : [];

  return (
    <div className="page-container">
      
      {/* 1. HEADER (Compact) */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title flex items-center gap-2">
             Moin, {firstName} <Sparkles size={16} className="text-amber-400 fill-amber-400"/>
          </h1>
          <p className="page-subtitle">Deine Aufgabenübersicht</p>
        </div>
        <button onClick={fetchMyJobs} className="btn-secondary !py-2 !px-3"><RefreshCw size={14}/></button>
      </div>

      {/* 2. JOB GRID (Responsive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          
          {/* ÜBERFÄLLIG */}
          {grouped.overdue.length > 0 && (
              <div className="col-span-full">
                  <div className="flex items-center gap-2 mb-3 px-1 text-red-600 font-bold uppercase text-[10px] tracking-wider"><AlertCircle size={14}/> Dringend</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {grouped.overdue.map(j => <JobCard key={j.id} job={j} label="Überfällig" colorClass="bg-red-100 text-red-700" onClick={setActiveJob} />)}
                  </div>
              </div>
          )}
          
          {/* HEUTE */}
          {grouped.today.length > 0 && (
              <div className="col-span-full">
                  <div className="mb-3 px-1 text-slate-500 font-bold uppercase text-[10px] tracking-wider">Heute</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {grouped.today.map(j => <JobCard key={j.id} job={j} label="Heute" colorClass="bg-blue-100 text-blue-700" onClick={setActiveJob} />)}
                  </div>
              </div>
          )}

          {/* MORGEN */}
          {grouped.tomorrow.length > 0 && (
              <div className="col-span-full">
                  <div className="mb-3 px-1 text-slate-500 font-bold uppercase text-[10px] tracking-wider">Morgen</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {grouped.tomorrow.map(j => <JobCard key={j.id} job={j} onClick={setActiveJob} />)}
                  </div>
              </div>
          )}

          {/* EMPTY STATE */}
          {jobs.length === 0 && (
              <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-50">
                  <Calendar size={48} className="text-slate-300 mb-2"/>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Keine offenen Einsätze</p>
              </div>
          )}
      </div>

      {/* --- DETAIL OVERLAY (FULLSCREEN MOBILE, MODAL DESKTOP) --- */}
      {activeJob && (
          <div className="fixed inset-0 z-[100] bg-slate-50 md:bg-slate-900/50 md:backdrop-blur-sm flex justify-center items-end md:items-center animate-in slide-in-from-bottom duration-300">
              
              <div className="bg-slate-50 w-full h-full md:h-auto md:max-h-[90vh] md:w-[600px] md:rounded-2xl flex flex-col shadow-2xl relative">
                  
                  {/* Modal Header */}
                  <div className="bg-white px-5 py-4 flex justify-between items-center shadow-sm z-10 border-b border-slate-100 md:rounded-t-2xl shrink-0">
                      <button onClick={() => { setActiveJob(null); setShowManualTime(false); }} className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-800 transition-colors"><X size={20}/></button>
                      <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Einsatz-Details</span>
                      <div className="w-9"></div> {/* Spacer */}
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pb-32 md:pb-6 custom-scrollbar">
                      
                      {/* MANUAL TIME MODE */}
                      {showManualTime ? (
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                              <h3 className="font-bold text-sm text-slate-800">Zeit nachtragen</h3>
                              <div className="grid grid-cols-2 gap-3">
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
                              {/* STATUS BANNER */}
                              {activeJob.myStatus === 'IN_PROGRESS' && (
                                  <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                          <div className="bg-white/20 p-2 rounded-lg animate-pulse"><Play size={16} fill="currentColor"/></div>
                                          <div>
                                            <span className="font-bold text-xs uppercase tracking-wide block">Aktiv</span>
                                            <p className="text-[10px] text-blue-100 opacity-80">Zeit läuft...</p>
                                          </div>
                                      </div>
                                      <Clock size={18} className="animate-spin-slow opacity-50" />
                                  </div>
                              )}

                              {/* KUNDE */}
                              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                  <div className="label-caps !text-blue-600 !ml-0 mb-1">Kunde & Ort</div>
                                  <h2 className="text-lg font-bold text-slate-900 mb-3 leading-tight">
                                      {activeJob.customer.companyName || `${activeJob.customer.firstName} ${activeJob.customer.lastName}`}
                                  </h2>
                                  <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeJob.address.street + ', ' + activeJob.address.zipCode + ' ' + activeJob.address.city)}`}
                                    target="_blank" rel="noreferrer"
                                    className="btn-secondary w-full justify-center text-[11px] !py-2.5 flex items-center gap-2"
                                  >
                                    <Navigation size={14}/> Navigation starten
                                  </a>
                              </div>

                              {/* CHECKLISTE */}
                              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                  <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                                    <div className="label-caps !text-indigo-600 !mb-0 flex items-center gap-2"><ListTodo size={14}/> Aufgaben</div>
                                    <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">{activeJob.service.name}</span>
                                  </div>
                                  
                                  {checklistItems.length > 0 ? (
                                      <div className="space-y-2">
                                          {checklistItems.map((item, idx) => (
                                              <div 
                                                key={idx} 
                                                onClick={() => toggleCheckItem(item)}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${checkedItems[item] ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200'}`}
                                              >
                                                  <div className={`${checkedItems[item] ? 'text-emerald-500' : 'text-slate-300'} shrink-0`}>
                                                      {checkedItems[item] ? <CheckSquare size={18}/> : <EmptySquare size={18}/>}
                                                  </div>
                                                  <span className={`text-[12px] font-medium ${checkedItems[item] ? 'text-emerald-900 line-through decoration-emerald-300' : 'text-slate-700'}`}>{item}</span>
                                              </div>
                                          ))}
                                      </div>
                                  ) : (
                                      <div className="text-center text-slate-400 text-[10px] italic py-2">Keine Checkliste vorhanden</div>
                                  )}
                              </div>

                              {/* FOTO UPLOAD */}
                              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                  <div className="label-caps !text-amber-600 !ml-0 mb-3 flex items-center gap-2"><Camera size={14}/> Nachweis</div>
                                  <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer ${selectedFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                  >
                                      <UploadCloud size={24} className="mb-2"/>
                                      <span className="text-[10px] font-bold uppercase tracking-wide text-center">
                                        {selectedFile ? 'Foto ausgewählt ✓' : 'Foto aufnehmen'}
                                      </span>
                                      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} className="hidden"/>
                                  </div>
                                  {selectedFile && (
                                      <button onClick={handleUpload} className="btn-primary w-full mt-3 justify-center">Hochladen</button>
                                  )}
                              </div>
                          </>
                      )}
                  </div>

                  {/* Sticky Footer (nur Mobile sichtbar wenn nicht Manual Mode) */}
                  {activeJob.myStatus !== 'COMPLETED' && !showManualTime && (
                      <div className="p-4 bg-white border-t border-slate-100 md:rounded-b-2xl shadow-[0_-10px_20px_rgba(0,0,0,0.03)] sticky bottom-0 z-20">
                          {activeJob.myStatus !== 'IN_PROGRESS' ? (
                              <div className="flex gap-2">
                                  <button onClick={() => handleStart(activeJob)} className="btn-primary flex-1 justify-center py-3 text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20">
                                    <Play fill="currentColor" size={14} className="mr-2"/> Start
                                  </button>
                                  <button onClick={() => setShowManualTime(true)} className="p-3 bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800">
                                    <Edit3 size={18} />
                                  </button>
                              </div>
                          ) : (
                              <button onClick={() => handleStop(activeJob)} className="btn-primary w-full justify-center py-3 text-xs uppercase tracking-widest !bg-emerald-600 border-emerald-600 shadow-lg shadow-emerald-500/20">
                                <CheckCircle size={16} className="mr-2"/> Arbeit beenden
                              </button>
                          )}
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}