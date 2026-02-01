import {
    AlertCircle,
    Calendar,
    Camera,
    CheckCircle,
    CheckSquare,
    ChevronRight,
    Clock,
    History,
    ListTodo,
    Loader2,
    MapPin,
    Navigation,
    RefreshCw,
    Sparkles,
    Square,
    UploadCloud,
    X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

// --- TYPES ---
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
  actualDurationMinutes?: number;
  proofs?: { id: string, url: string }[];
}

// --- JOB CARD COMPONENT ---
const JobCard = ({ job, label, colorClass, onClick, isHistory = false }: { job: MyJob, label?: string, colorClass?: string, onClick: (job: MyJob) => void, isHistory?: boolean }) => (
    <div 
        onClick={() => onClick(job)}
        className={`bg-white rounded-xl border p-5 relative cursor-pointer active:scale-[0.99] transition-all hover:shadow-lg group ${
             isHistory ? 'border-slate-200 opacity-75 hover:opacity-100' : 'border-slate-200 hover:border-blue-300'
        }`}
    >
        {label && (
          <div className={`absolute -top-px -right-px px-3 py-1 text-[10px] font-black uppercase rounded-bl-xl rounded-tr-xl tracking-widest ${colorClass}`}>
            {label}
          </div>
        )}
        
        {/* Header: Zeit */}
        <div className="flex justify-between items-start mb-3">
            <span className={`text-[11px] font-bold flex items-center gap-2 uppercase tracking-wide px-2.5 py-1.5 rounded-lg border bg-slate-50 text-slate-500 border-slate-100`}>
                <Clock size={14} className="text-slate-400"/> 
                {new Date(job.scheduledDate).toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})} Uhr
                {isHistory && job.finishedAt && (
                    <span className="text-slate-400 ml-1 font-normal border-l border-slate-200 pl-2">
                       (Erledigt)
                    </span>
                )}
            </span>
        </div>

        {/* Kunde & Adresse */}
        <div className="mb-4">
            <h3 className="font-black text-slate-900 text-base leading-tight mb-1 truncate">
                {job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
                <MapPin size={14} className="shrink-0 text-slate-400"/>
                <span className="truncate">{job.address.street}, {job.address.city}</span>
            </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <span className="text-[10px] font-black bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider truncate max-w-[70%]">
                {job.service.name}
            </span>
            {isHistory ? <CheckCircle size={18} className="text-emerald-500"/> : <div className="p-1.5 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors"><ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors"/></div>}
        </div>
    </div>
);

export default function EmployeeDashboard() {
  const [jobs, setJobs] = useState<MyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState<'OPEN' | 'HISTORY'>('OPEN');
  
  const [activeJob, setActiveJob] = useState<MyJob | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Time State
  const [manualStart, setManualStart] = useState('');
  const [manualEnd, setManualEnd] = useState('');

  const firstName = localStorage.getItem('firstName') || 'Mitarbeiter';

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

  // --- ACTIONS ---
  const toggleCheckItem = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleUpload = async () => {
    if (!activeJob || !selectedFile) return;
    const toastId = toast.loading("Lade Foto hoch...");
    const formData = new FormData();
    formData.append('image', selectedFile);
    try {
        await api.post(`/jobs/${activeJob.id}/proof`, formData);
        toast.success("Foto gespeichert", { id: toastId });
        setSelectedFile(null);
    } catch (e) {
        toast.error("Upload Fehler", { id: toastId });
    }
  };

  const openJobDetails = (job: MyJob) => {
      setActiveJob(job);
      // Vorbelegung: Geplante Startzeit & Aktuelle Zeit als Ende
      const sDate = new Date(job.scheduledDate);
      setManualStart(sDate.toTimeString().substring(0,5));
      
      // Ende: Aktuelle Zeit, aber mindestens Startzeit + Dauer (oder 1h)
      const now = new Date();
      setManualEnd(now.toTimeString().substring(0,5));
  };

  const handleSubmit = async () => {
      if(!activeJob || !manualStart || !manualEnd) return toast.error("Bitte Zeiten eingeben");
      
      const list = getSafeChecklist(activeJob);
      const totalItems = list.length;
      const checkedCount = Object.values(checkedItems).filter(Boolean).length;
      
      if (totalItems > 0 && checkedCount < totalItems) {
          if(!confirm(`Checkliste unvollständig (${checkedCount}/${totalItems}). Trotzdem abschließen?`)) return;
      }

      const toastId = toast.loading("Speichere Bericht...");
      const baseDate = activeJob.scheduledDate.split('T')[0];
      
      try {
          // 1. Foto hochladen wenn vorhanden
          if (selectedFile) {
             const fd = new FormData();
             fd.append('image', selectedFile);
             await api.post(`/jobs/${activeJob.id}/proof`, fd);
          }

          // 2. Manuelle Zeit & Abschluss senden
          await api.patch(`/time/${activeJob.assignmentId}/manual`, { 
              startTime: new Date(`${baseDate}T${manualStart}`), 
              endTime: new Date(`${baseDate}T${manualEnd}`) 
          });

          toast.success("Job erledigt!", { id: toastId });
          setActiveJob(null);
          setCheckedItems({});
          setSelectedFile(null);
          fetchMyJobs();
      } catch (e) { toast.error("Fehler beim Speichern", { id: toastId }); }
  };

  // --- FILTER & LOGIC ---
  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  const openJobs = jobs.filter(j => j.myStatus !== 'COMPLETED').sort((a,b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  const historyJobs = jobs.filter(j => j.myStatus === 'COMPLETED').sort((a,b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  const overdue = openJobs.filter(j => new Date(j.scheduledDate) < today && !isSameDay(new Date(j.scheduledDate), today));
  const todays = openJobs.filter(j => isSameDay(new Date(j.scheduledDate), today));
  const tomorrows = openJobs.filter(j => {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return isSameDay(new Date(j.scheduledDate), tomorrow);
  });
  const futures = openJobs.filter(j => {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return new Date(j.scheduledDate) > tomorrow;
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="font-bold text-[10px] uppercase tracking-wider">Lade Einsätze...</p>
    </div>
  );

  const checklistItems = activeJob ? getSafeChecklist(activeJob) : [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full pb-32">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
             Moin, {firstName} <Sparkles size={24} className="text-amber-400 fill-amber-400 animate-pulse"/>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Hier ist deine aktuelle Aufgabenübersicht.</p>
        </div>
        <button onClick={fetchMyJobs} className="self-start md:self-auto p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all text-slate-500 hover:text-blue-600">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''}/>
        </button>
      </div>

      {/* TABS */}
      <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl mb-8 w-full md:w-auto md:inline-flex shadow-sm">
          <button 
            onClick={() => setViewTab('OPEN')} 
            className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${viewTab === 'OPEN' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Calendar size={16} /> Aktuell <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] ml-1">{openJobs.length}</span>
          </button>
          <button 
            onClick={() => setViewTab('HISTORY')} 
            className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${viewTab === 'HISTORY' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <History size={16} /> Verlauf
          </button>
      </div>

      {/* 2. JOB GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {viewTab === 'OPEN' ? (
              <>
                  {openJobs.length === 0 && (
                      <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-60 border-2 border-dashed border-slate-200 rounded-3xl">
                          <CheckCircle size={64} className="text-emerald-200 mb-4"/>
                          <p className="text-slate-900 font-bold text-lg">Alles erledigt!</p>
                          <p className="text-slate-400 text-sm">Genieß deinen Feierabend.</p>
                      </div>
                  )}

                  {/* ÜBERFÄLLIG */}
                  {overdue.length > 0 && (
                      <div className="col-span-full">
                          <div className="flex items-center gap-2 mb-4 px-1 text-red-600 font-bold uppercase text-xs tracking-widest"><AlertCircle size={16}/> Überfällig</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {overdue.map(j => <JobCard key={j.id} job={j} label="Dringend" colorClass="bg-red-100 text-red-700" onClick={openJobDetails} />)}
                          </div>
                      </div>
                  )}

                  {/* HEUTE */}
                  {todays.length > 0 && (
                      <div className="col-span-full">
                          <div className="mb-4 px-1 text-slate-400 font-bold uppercase text-xs tracking-widest">Heute</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {todays.map(j => <JobCard key={j.id} job={j} label="Heute" colorClass="bg-blue-100 text-blue-700" onClick={openJobDetails} />)}
                          </div>
                      </div>
                  )}

                  {/* KOMMENDE */}
                  {(tomorrows.length > 0 || futures.length > 0) && (
                      <div className="col-span-full mt-4">
                          <div className="mb-4 px-1 text-slate-400 font-bold uppercase text-xs tracking-widest">Demnächst</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-90">
                              {tomorrows.map(j => <JobCard key={j.id} job={j} label="Morgen" colorClass="bg-indigo-50 text-indigo-600" onClick={openJobDetails} />)}
                              {futures.map(j => <JobCard key={j.id} job={j} onClick={openJobDetails} />)}
                          </div>
                      </div>
                  )}
              </>
          ) : (
              // HISTORY VIEW
              <div className="col-span-full">
                  {historyJobs.length === 0 ? (
                      <div className="py-20 text-center text-slate-400 font-medium">Noch keine erledigten Jobs.</div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {historyJobs.map(j => <JobCard key={j.id} job={j} isHistory onClick={() => {}} />)}
                      </div>
                  )}
              </div>
          )}
      </div>

      {/* --- DETAIL OVERLAY (MODAL) --- */}
      {activeJob && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex justify-center items-end md:items-center animate-in fade-in duration-200 p-0 md:p-4">
              
              <div className="bg-slate-50 w-full h-[95vh] md:h-auto md:max-h-[85vh] md:w-[600px] rounded-t-3xl md:rounded-3xl flex flex-col shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
                  
                  {/* Modal Header */}
                  <div className="bg-white px-6 py-5 flex justify-between items-center shadow-sm z-10 border-b border-slate-100 shrink-0">
                      <div>
                          <span className="font-bold text-slate-400 text-[10px] uppercase tracking-widest block mb-1">
                              Bearbeitung
                          </span>
                          <h3 className="font-black text-slate-900 text-lg leading-none">
                              {activeJob.customer.lastName}
                          </h3>
                      </div>
                      <button onClick={() => setActiveJob(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X size={20}/></button>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32 md:pb-6 custom-scrollbar">
                      
                      {/* 1. KUNDE & NAVI */}
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <div className="label-caps !text-slate-400 !ml-0 mb-1">Kunde</div>
                                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                                      {activeJob.customer.companyName || `${activeJob.customer.firstName} ${activeJob.customer.lastName}`}
                                  </h2>
                              </div>
                              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeJob.address.street + ', ' + activeJob.address.zipCode + ' ' + activeJob.address.city)}`} target="_blank" rel="noreferrer" className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                                <Navigation size={20}/>
                              </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                              <MapPin size={16} className="text-slate-400 shrink-0"/>
                              {activeJob.address.street}, {activeJob.address.city}
                          </div>
                      </div>

                      {/* 2. ZEIT ERFASSUNG */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                          <div className="text-center">
                              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <Clock size={20} />
                              </div>
                              <h3 className="font-bold text-sm text-slate-900">Arbeitszeit</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="label-caps !ml-0 mb-2">Start</label>
                                  <input type="time" className="input-standard text-center font-bold text-xl h-14 rounded-xl" value={manualStart} onChange={e => setManualStart(e.target.value)} />
                              </div>
                              <div>
                                  <label className="label-caps !ml-0 mb-2">Ende</label>
                                  <input type="time" className="input-standard text-center font-bold text-xl h-14 rounded-xl" value={manualEnd} onChange={e => setManualEnd(e.target.value)} />
                              </div>
                          </div>
                      </div>

                      {/* 3. CHECKLISTE */}
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                            <div className="label-caps !text-indigo-600 !mb-0 flex items-center gap-2"><ListTodo size={14}/> Aufgaben</div>
                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 uppercase tracking-wide">{activeJob.service.name}</span>
                          </div>
                          
                          {checklistItems.length > 0 ? (
                              <div className="space-y-2">
                                  {checklistItems.map((item, idx) => (
                                      <div key={idx} onClick={() => toggleCheckItem(item)} className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${checkedItems[item] ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-300'}`}>
                                          <div className={`${checkedItems[item] ? 'text-emerald-500' : 'text-slate-300'} shrink-0 mt-0.5`}>
                                              {checkedItems[item] ? <CheckSquare size={20}/> : <Square size={20}/>}
                                          </div>
                                          <span className={`text-sm font-medium leading-snug ${checkedItems[item] ? 'text-emerald-900 line-through decoration-emerald-300' : 'text-slate-700'}`}>{item}</span>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="text-center text-slate-400 text-xs italic py-4 bg-slate-50 rounded-xl">Keine Checkliste vorhanden</div>
                          )}
                      </div>

                      {/* 4. FOTO UPLOAD */}
                      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                          <div className="label-caps !text-amber-600 !ml-0 mb-3 flex items-center gap-2"><Camera size={14}/> Fotobeweis</div>
                          <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                              <UploadCloud size={24} className={`mb-2 ${selectedFile ? 'text-emerald-500' : 'text-slate-300'}`}/>
                              <span className={`text-xs font-bold uppercase tracking-wide text-center ${selectedFile ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {selectedFile ? 'Foto bereit ✓' : 'Tippen zum Aufnehmen'}
                              </span>
                              <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} className="hidden"/>
                          </div>
                          {selectedFile && <button onClick={handleUpload} className="btn-secondary w-full mt-3 text-xs">Nur Foto hochladen</button>}
                      </div>

                  </div>

                  {/* STICKY FOOTER */}
                  {activeJob.myStatus !== 'COMPLETED' && (
                      <div className="p-4 bg-white border-t border-slate-100 rounded-b-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.03)] sticky bottom-0 z-20">
                          <button onClick={handleSubmit} className="btn-primary w-full justify-center py-4 text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 font-black rounded-xl hover:!bg-blue-700 transition-all">
                            <CheckCircle size={18} className="mr-2"/> Fertig & Speichern
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}