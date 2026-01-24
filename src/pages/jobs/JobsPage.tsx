import { useEffect, useState, useRef } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  Play, 
  RefreshCw, 
  X, 
  Loader2, 
  Camera, 
  UploadCloud,
  UserPlus,
  Filter,
  Trash2
} from 'lucide-react'; 
import toast from 'react-hot-toast'; 
import api from '../../lib/api';

const API_BASE_URL = import.meta.env.PROD ? 'https://glanzops.de' : 'http://localhost:3000';

// --- TYPEN ---
interface Employee { id: string; firstName: string; lastName: string; }
interface JobProof { id: string; url: string; type: string; }
interface Job {
  id: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  customer: { companyName: string | null; firstName: string; lastName: string; };
  service: { name: string };
  address: { street: string; city: string };
  assignments: { employee: Employee }[];
  actualDurationMinutes: number | null;
  proofs: JobProof[];
}

// --- HELPER COMPONENT: STATUS BADGE ---
const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'COMPLETED': return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200"><CheckCircle size={14}/> Erledigt</span>;
      case 'CANCELLED': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200"><XCircle size={14}/> Storniert</span>;
      case 'IN_PROGRESS': return <span className="flex items-center gap-1 text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200"><Clock size={14}/> In Arbeit</span>;
      default: return <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200"><Calendar size={14}/> Geplant</span>;
    }
};

// --- HELPER COMPONENT: JOB LIST ITEM ---
const JobListItem = ({ job, isAdmin, employees, onOpenUpload, onOpenComplete, onStatusChange, onAssign, onUnassign }: any) => {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group relative overflow-hidden">
            {/* Status Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${job.status === 'COMPLETED' ? 'bg-green-500' : job.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'}`}></div>

            <div className="flex flex-col lg:flex-row gap-6 pl-4">
                
                {/* TEIL 1: INFOS */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between lg:justify-start gap-4">
                        <h3 className="font-bold text-lg text-slate-900 truncate">
                            {job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`}
                        </h3>
                        <StatusBadge status={job.status} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={16}/></div>
                            <span className="font-medium">
                                {new Date(job.scheduledDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><MapPin size={16}/></div>
                            <span className="truncate">{job.address?.street}, {job.address?.city}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            {job.service.name}
                        </span>
                        {job.actualDurationMinutes && (
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 flex items-center gap-1">
                                <Clock size={12}/> {job.actualDurationMinutes} Min
                            </span>
                        )}
                    </div>
                </div>

                {/* TEIL 2: MITARBEITER */}
                <div className="flex flex-col gap-2 min-w-[200px] border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                    <p className="text-xs font-bold text-slate-400 uppercase">Team</p>
                    <div className="flex flex-wrap gap-2">
                        {job.assignments.map((assignment: any) => (
                            <div key={assignment.employee.id} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                {assignment.employee.firstName}
                                {isAdmin && ['SCHEDULED', 'IN_PROGRESS'].includes(job.status) && (
                                    <button 
                                        onClick={() => onUnassign(job.id, assignment.employee.id)}
                                        className="text-slate-400 hover:text-red-500 transition ml-1"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        
                        {/* Add Employee Button */}
                        {isAdmin && ['SCHEDULED', 'IN_PROGRESS'].includes(job.status) && (
                            <div className="relative inline-block">
                                <select 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => onAssign(job.id, e.target.value)}
                                    value=""
                                >
                                    <option value="" disabled>Wählen...</option>
                                    {employees.map((emp: Employee) => (
                                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                    ))}
                                </select>
                                <button className="inline-flex items-center gap-1.5 bg-white border border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                    <UserPlus size={14} /> <span className="hidden sm:inline">Dazu</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* TEIL 3: ACTIONS & PHOTOS */}
                <div className="flex flex-col items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 min-w-[180px]">
                    <div className="flex -space-x-2 overflow-hidden">
                        {job.proofs.map((proof: JobProof) => (
                            <a 
                                key={proof.id} 
                                href={`${API_BASE_URL}/${proof.url}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden shadow-sm hover:scale-110 hover:z-10 transition-transform relative bg-slate-100"
                            >
                                <img src={`${API_BASE_URL}/${proof.url}`} className="w-full h-full object-cover" />
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 w-full justify-end">
                        {['SCHEDULED', 'IN_PROGRESS'].includes(job.status) ? (
                            <>
                                <button 
                                    onClick={() => onOpenUpload(job.id)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Foto hochladen"
                                >
                                    <Camera size={20} />
                                </button>
                                {isAdmin && (
                                    <button 
                                        onClick={() => onStatusChange(job.id, 'CANCELLED')}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Stornieren"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => onOpenComplete(job.id)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-green-200 hover:bg-green-700 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <CheckCircle size={16} /> Fertig
                                </button>
                            </>
                        ) : (
                            <span className="text-xs font-medium text-slate-400 italic">Abgeschlossen</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'DONE'>('OPEN');

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'COMPLETE' | 'UPLOAD'>('COMPLETE');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [durationInput, setDurationInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const role = localStorage.getItem('role');
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const promises = [api.get('/jobs')];
      if (isAdmin) promises.push(api.get('/employees'));

      const [jobsRes, employeesRes] = await Promise.all(promises);

      const sortedJobs = jobsRes.data.sort((a: Job, b: Job) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );

      setJobs(sortedJobs);
      if (employeesRes) setEmployees(employeesRes.data);

    } catch (error) {
      console.error(error);
      toast.error("Daten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---
  const filteredJobs = jobs.filter(job => {
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'OPEN') return ['SCHEDULED', 'IN_PROGRESS'].includes(job.status);
      if (filterStatus === 'DONE') return ['COMPLETED', 'CANCELLED'].includes(job.status);
      return true;
  });

  const handleGenerateJobs = async () => { 
      setIsGenerating(true);
      try { 
        const res = await api.post('/jobs/generate'); 
        await fetchData(); 
        toast.success(res.data.message || "Jobs generiert!"); 
      } catch(e: any) { 
        toast.error("Fehler beim Generieren."); 
      } finally {
        setIsGenerating(false);
      }
  };

  const handleStatusChange = async (id: string, s: string) => { 
     if(!confirm("Status wirklich ändern?")) return;
     try { 
       await api.patch(`/jobs/${id}/status`, { status: s }); 
       toast.success("Status aktualisiert");
       fetchData(); 
     } catch(e) { 
       toast.error("Fehler beim Update"); 
     }
  };

  const handleAssignEmployee = async (jid: string, eid: string) => {
     if(!eid) return;
     const toastId = toast.loading("Zuweisung...");
     try { 
       await api.post(`/jobs/${jid}/assign`, { employeeId: eid }); 
       toast.success("Zugewiesen", { id: toastId });
       fetchData(); 
     } catch(e: any) { 
       toast.error("Fehler bei Zuweisung", { id: toastId }); 
     }
  };

  const handleUnassignEmployee = async (jid: string, eid: string) => {
      if(!confirm("Mitarbeiter entfernen?")) return;
      try {
          await api.delete(`/jobs/${jid}/assign`, { data: { employeeId: eid } });
          toast.success("Entfernt");
          fetchData();
      } catch (error) {
          toast.error("Fehler beim Entfernen");
      }
  }

  // --- MODAL HANDLERS ---
  const openCompletionModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setModalMode('COMPLETE'); 
    setDurationInput(''); 
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const openUploadModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setModalMode('UPLOAD'); 
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedJobId) return;
    
    if (modalMode === 'COMPLETE' && !durationInput) return toast.error("Zeit fehlt!");
    if (modalMode === 'UPLOAD' && !selectedFile) return toast.error("Foto fehlt!");

    setIsSubmitting(true);

    try {
        if (selectedFile) {
          const formData = new FormData();
          formData.append('image', selectedFile);
          await api.post(`/jobs/${selectedJobId}/proof`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        }

        if (modalMode === 'COMPLETE') {
            await api.patch(`/jobs/${selectedJobId}`, {
                status: 'COMPLETED',
                actualDurationMinutes: Number(durationInput)
            });
            toast.success("Job erledigt!");
        } else {
            toast.success("Foto hochgeladen!");
        }
        
        setIsModalOpen(false);
        fetchData(); 
    } catch (error) {
        toast.error("Fehler beim Speichern.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{isAdmin ? 'Auftragsübersicht' : 'Meine Aufträge'}</h1>
          <p className="text-slate-500 mt-1">{isAdmin ? 'Planung, Zuweisung & Kontrolle' : 'Deine anstehenden Einsätze'}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
              <button onClick={() => setFilterStatus('OPEN')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'OPEN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Offen</button>
              <button onClick={() => setFilterStatus('DONE')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'DONE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Erledigt</button>
              <button onClick={() => setFilterStatus('ALL')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Alle</button>
          </div>

          <button onClick={fetchData} className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 bg-white transition active:scale-95">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {isAdmin && (
            <button onClick={handleGenerateJobs} disabled={isGenerating} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 ${isGenerating ? 'bg-slate-400 cursor-not-allowed text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
              {isGenerating ? 'Generiere...' : 'Jobs generieren'}
            </button>
          )}
        </div>
      </div>

      {/* JOB LISTE */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-4"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>Lade Aufträge...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <JobListItem 
                key={job.id}
                job={job}
                isAdmin={isAdmin}
                employees={employees}
                onOpenUpload={openUploadModal}
                onOpenComplete={openCompletionModal}
                onStatusChange={handleStatusChange}
                onAssign={handleAssignEmployee}
                onUnassign={handleUnassignEmployee}
            />
          ))}
          
          {filteredJobs.length === 0 && (
            <div className="text-center py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm"><Filter className="text-slate-300 h-8 w-8" /></div>
              <h3 className="text-lg font-bold text-slate-800">Keine Aufträge gefunden</h3>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{modalMode === 'COMPLETE' ? 'Job abschließen' : 'Foto hochladen'}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{modalMode === 'COMPLETE' ? 'Bitte Arbeitszeit erfassen.' : 'Dokumentation hinzufügen.'}</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-full transition"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    <div onClick={() => fileInputRef.current?.click()} className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all min-h-[180px] ${previewUrl ? 'border-green-400 bg-green-50/50' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/50'}`}>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                        {previewUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img src={previewUrl} alt="Vorschau" className="max-h-[200px] w-auto rounded-xl shadow-sm object-contain" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-white font-medium gap-2"><RefreshCw size={16}/> Ändern</div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="bg-white border border-slate-200 text-blue-600 p-4 rounded-full w-fit mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform"><Camera size={28} /></div>
                                <p className="font-bold text-slate-800">Foto auswählen</p>
                            </div>
                        )}
                    </div>

                    {modalMode === 'COMPLETE' && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Benötigte Zeit</label>
                            <div className="relative">
                                <input type="number" placeholder="0" value={durationInput} onChange={(e) => setDurationInput(e.target.value)} className="w-full pl-4 pr-16 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-2xl font-bold text-slate-900" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Minuten</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <button onClick={handleSubmit} disabled={isSubmitting} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                        {isSubmitting ? <><Loader2 className="animate-spin" /> Speichere...</> : modalMode === 'COMPLETE' ? <><CheckCircle size={20} /> Job abschließen</> : <><UploadCloud size={20} /> Hochladen</>}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}