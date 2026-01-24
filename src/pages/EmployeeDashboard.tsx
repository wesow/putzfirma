import { useEffect, useState, useRef } from 'react';
import { 
  Play, Clock, MapPin, CheckCircle, Calendar, 
  Camera, UploadCloud, X, AlertCircle, ListTodo, ChevronRight, CheckSquare, Square as EmptySquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface MyJob {
  id: string; 
  assignmentId: string;
  scheduledDate: string;
  customer: { companyName: string | null; lastName: string; firstName: string; };
  service: { 
      name: string; 
      duration: number;
      checklist: string[]; 
  };
  address: { street: string; city: string; zipCode: string };
  status: string; 
  myStatus: string; 
  startedAt?: string;
  finishedAt?: string;
  proofs?: { id: string, url: string }[];
}

// --- WICHTIG: JobCard AUSSERHALB der Hauptfunktion ---
const JobCard = ({ job, label, colorClass, onClick }: { job: MyJob, label?: string, colorClass?: string, onClick: (job: MyJob) => void }) => (
    <div 
        onClick={() => onClick(job)}
        className={`bg-white rounded-2xl shadow-sm border p-5 mb-4 relative cursor-pointer active:scale-[0.98] transition-all ${
            job.myStatus === 'IN_PROGRESS' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100 hover:shadow-md'
        }`}
    >
        {label && <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl ${colorClass}`}>{label}</div>}
        
        <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                <Clock size={14}/> {new Date(job.scheduledDate).toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})}
            </span>
            {job.myStatus === 'IN_PROGRESS' && <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
        </div>

        <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">
            {job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`}
        </h3>
        <p className="text-sm text-slate-500 flex items-start gap-1 mb-4">
            <MapPin size={14} className="mt-0.5 shrink-0"/> {job.address.street}, {job.address.city}
        </p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                {job.service.name}
            </span>
            <div className="flex items-center text-blue-600 text-sm font-bold gap-1">
                Details <ChevronRight size={16}/>
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

  const getGroupedJobs = () => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const isSameDay = (d1: Date, d2: Date) => 
          d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

      const grouped = { overdue: [] as MyJob[], today: [] as MyJob[], tomorrow: [] as MyJob[], future: [] as MyJob[], completed: [] as MyJob[] };

      jobs.forEach(job => {
          const d = new Date(job.scheduledDate);
          if (job.myStatus === 'COMPLETED' || job.status === 'COMPLETED') { grouped.completed.push(job); return; }
          
          if (isSameDay(d, today)) grouped.today.push(job);
          else if (isSameDay(d, tomorrow)) grouped.tomorrow.push(job);
          else if (d < today) grouped.overdue.push(job);
          else grouped.future.push(job);
      });
      return grouped;
  };
  const grouped = getGroupedJobs();

  const handleStart = async (job: MyJob) => {
      const toastId = toast.loading("Starte Job...");
      try {
          await api.post('/time/start', { assignmentId: job.assignmentId });
          toast.success("Gestartet! Viel Erfolg 🚀", { id: toastId });
          fetchMyJobs();
          setActiveJob({ ...job, myStatus: 'IN_PROGRESS' }); 
      } catch (e) { toast.error("Start fehlgeschlagen", { id: toastId }); }
  };

  const handleStop = async (job: MyJob) => {
      const totalItems = job.service.checklist?.length || 0;
      const checkedCount = Object.values(checkedItems).filter(Boolean).length;
      
      if (totalItems > 0 && checkedCount < totalItems) {
          if(!confirm(`Du hast erst ${checkedCount} von ${totalItems} Punkten erledigt. Wirklich beenden?`)) return;
      }

      const toastId = toast.loading("Beende Job...");
      try {
          await api.post('/time/stop', { assignmentId: job.assignmentId });
          toast.success("Super Arbeit! Job erledigt 🎉", { id: toastId });
          setActiveJob(null);
          setCheckedItems({}); 
          fetchMyJobs();
      } catch (e) { toast.error("Stopp fehlgeschlagen", { id: toastId }); }
  };

  const toggleCheckItem = (item: string) => {
      setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleUpload = async () => {
      if (!activeJob || !selectedFile) return;
      const toastId = toast.loading("Lade hoch...");
      const formData = new FormData();
      formData.append('image', selectedFile); 
      try {
          await api.post(`/jobs/${activeJob.id}/proof`, formData);
          toast.success("Foto gespeichert!", { id: toastId });
          setSelectedFile(null);
          fetchMyJobs();
      } catch (e) { toast.error("Upload Fehler", { id: toastId }); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Lade Jobs...</div>;

  return (
    <div className="max-w-lg mx-auto p-4 pb-24 animate-in fade-in duration-500">
      
      {/* 1. HEADER */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hallo, {firstName}! 👋</h1>
            <p className="text-slate-500 text-xs mt-0.5">Bereit für den Einsatz?</p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-full"><Calendar size={20} /></div>
      </div>

      {/* 2. JOB LISTE */}
      <div className="space-y-6">
          {grouped.overdue.length > 0 && (
              <div>
                  <div className="flex items-center gap-2 mb-2 px-1 text-red-600 font-bold uppercase text-xs tracking-wider"><AlertCircle size={14}/> Überfällig</div>
                  {grouped.overdue.map(j => <JobCard key={j.id} job={j} label="Wichtig" colorClass="bg-red-100 text-red-600" onClick={setActiveJob} />)}
              </div>
          )}
          
          {grouped.today.length > 0 && (
              <div>
                  <div className="mb-2 px-1 text-slate-500 font-bold uppercase text-xs tracking-wider">Heute</div>
                  {grouped.today.map(j => <JobCard key={j.id} job={j} label="Heute" colorClass="bg-blue-100 text-blue-600" onClick={setActiveJob} />)}
              </div>
          )}

          {grouped.tomorrow.length > 0 && (
              <div>
                  <div className="mb-2 px-1 text-slate-500 font-bold uppercase text-xs tracking-wider">Morgen</div>
                  {grouped.tomorrow.map(j => <JobCard key={j.id} job={j} label="Morgen" colorClass="bg-orange-100 text-orange-600" onClick={setActiveJob} />)}
              </div>
          )}

          {grouped.completed.length > 0 && (
              <div className="opacity-60 grayscale-[0.5]">
                  <div className="my-6 border-t border-slate-200"></div>
                  <div className="mb-2 px-1 text-slate-400 font-bold uppercase text-xs tracking-wider">Erledigt</div>
                  {grouped.completed.map(j => <JobCard key={j.id} job={j} onClick={setActiveJob} />)}
              </div>
          )}

          {jobs.length === 0 && (
              <div className="text-center py-12 text-slate-400">Keine Jobs gefunden.</div>
          )}
      </div>

      {/* --- DETAIL SCREEN (Full Screen Overlay) --- */}
      {activeJob && (
          <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-bottom duration-300">
              
              {/* Navbar */}
              <div className="bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
                  <button onClick={() => setActiveJob(null)} className="p-2 -ml-2 text-slate-600"><X /></button>
                  <span className="font-bold text-slate-800">Job Details</span>
                  <div className="w-8"></div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 pb-32">
                  
                  {/* Status Banner */}
                  {activeJob.myStatus === 'IN_PROGRESS' ? (
                      <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-200 mb-6 flex items-center justify-between animate-pulse">
                          <div className="flex items-center gap-3">
                              <div className="bg-white/20 p-2 rounded-lg"><Play size={20} fill="currentColor"/></div>
                              <span className="font-bold">Arbeit läuft...</span>
                          </div>
                          <Clock className="animate-spin-slow" />
                      </div>
                  ) : activeJob.myStatus === 'COMPLETED' ? (
                      <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-3 font-bold border border-green-200">
                          <CheckCircle /> Job abgeschlossen
                      </div>
                  ) : null}

                  {/* Kunden Info */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-4">
                      <h2 className="text-xl font-bold text-slate-800 mb-1">
                          {activeJob.customer.companyName || `${activeJob.customer.firstName} ${activeJob.customer.lastName}`}
                      </h2>
                      <a 
                        href={`https://maps.google.com/?q=${activeJob.address.street}, ${activeJob.address.city}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 flex items-center gap-1.5 mt-2 hover:underline"
                      >
                          <MapPin size={16}/> {activeJob.address.street}, {activeJob.address.city}
                      </a>
                  </div>

                  {/* CHECKLISTE */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-4">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <ListTodo className="text-purple-500" size={20}/> Aufgaben
                      </h3>
                      
                      {activeJob.service.checklist && activeJob.service.checklist.length > 0 ? (
                          <div className="space-y-3">
                              {activeJob.service.checklist.map((item, idx) => (
                                  <div 
                                    key={idx} 
                                    onClick={() => toggleCheckItem(item)}
                                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${checkedItems[item] ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}
                                  >
                                      <div className={`mt-0.5 ${checkedItems[item] ? 'text-green-600' : 'text-slate-300'}`}>
                                          {checkedItems[item] ? <CheckSquare size={20}/> : <EmptySquare size={20}/>}
                                      </div>
                                      <span className={`${checkedItems[item] ? 'text-green-800 line-through opacity-70' : 'text-slate-700'}`}>{item}</span>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <p className="text-slate-400 text-sm italic">Keine spezielle Checkliste.</p>
                      )}
                  </div>

                  {/* FOTO UPLOAD */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-4">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Camera className="text-blue-500" size={20}/> Dokumentation
                      </h3>
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer active:bg-slate-50 transition"
                      >
                          <UploadCloud size={32} className="mb-2"/>
                          <span className="text-sm font-medium">{selectedFile ? selectedFile.name : 'Foto machen / hochladen'}</span>
                          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} className="hidden"/>
                      </div>
                      
                      {selectedFile && (
                          <button onClick={handleUpload} className="w-full mt-3 bg-slate-800 text-white py-3 rounded-xl font-bold">Hochladen bestätigen</button>
                      )}
                  </div>

              </div>

              {/* FOOTER ACTIONS (Sticky Bottom) */}
              {activeJob.myStatus !== 'COMPLETED' && (
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-20 pb-safe">
                      {activeJob.myStatus === 'PENDING' ? (
                          <button 
                            onClick={() => handleStart(activeJob)} 
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 flex justify-center items-center gap-2 active:scale-95 transition"
                          >
                              <Play fill="currentColor" /> Job Starten
                          </button>
                      ) : (
                          <button 
                            onClick={() => handleStop(activeJob)} 
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 active:scale-95 transition"
                          >
                              <CheckCircle /> Job Abschließen
                          </button>
                      )}
                  </div>
              )}

          </div>
      )}

    </div>
  );
}