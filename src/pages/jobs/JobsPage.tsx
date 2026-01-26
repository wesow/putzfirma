import { useEffect, useState, useRef } from 'react';
import { 
  CheckCircle, Calendar, MapPin, Play, RefreshCw, X, 
  Loader2, Camera, UploadCloud, UserPlus, Filter, Trash2,
  Clock, Plus
} from 'lucide-react'; 
import { format } from 'date-fns';
import toast from 'react-hot-toast'; 
import api from '../../lib/api';
import ViewSwitcher from '../../components/ViewSwitcher';

const API_BASE_URL = import.meta.env.PROD ? 'https://glanzops.de' : 'http://localhost:3000';

interface Employee { id: string; firstName: string; lastName: string; }
interface JobProof { id: string; url: string; type: string; }

interface Job {
  id: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  customer: { 
    companyName: string | null; 
    firstName: string; 
    lastName: string;
    addresses?: { street: string; city: string; zipCode: string }[];
  };
  service: { name: string };
  address?: { street: string; city: string; zipCode: string };
  assignments: { employee: Employee }[];
  actualDurationMinutes: number | null;
  proofs: JobProof[];
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'DONE'>('OPEN');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'COMPLETE' | 'UPLOAD'>('COMPLETE');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [durationInput, setDurationInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = localStorage.getItem('role') === 'ADMIN';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, employeesRes] = await Promise.all([
        api.get('/jobs'),
        isAdmin ? api.get('/employees') : Promise.resolve({ data: [] })
      ]);
      
      const sortedJobs = jobsRes.data.sort((a: Job, b: Job) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );
      
      setJobs(sortedJobs);
      if (employeesRes) setEmployees(employeesRes.data);
    } catch (error) {
      toast.error("Daten konnten nicht geladen werden");
    } finally { setLoading(false); }
  };

  const getAddressString = (job: Job) => {
    if (job.address?.street) return `${job.address.street}, ${job.address.city}`;
    if (job.customer?.addresses && job.customer.addresses.length > 0) {
        const a = job.customer.addresses[0];
        return `${a.street}, ${a.city}`;
    }
    return "Keine Adresse hinterlegt";
  };

  const handleStatusChange = async (id: string, s: string) => { 
    try { 
      await api.patch(`/jobs/${id}/status`, { status: s }); 
      toast.success("Status aktualisiert");
      fetchData(); 
    } catch(e) { toast.error("Fehler beim Status-Update"); }
  };

  const handleAssignEmployee = async (jid: string, eid: string) => {
    if(!eid) return;
    const toastId = toast.loading("Zuweisung...");
    try { 
      await api.post(`/jobs/${jid}/assign`, { employeeId: eid }); 
      toast.success("Mitarbeiter zugewiesen", { id: toastId });
      fetchData();
    } catch(e: any) { 
      toast.error(e.response?.data?.message || "Fehler", { id: toastId }); 
    }
  };

  const handleUnassignEmployee = async (jid: string, eid: string) => {
    if(!confirm("Mitarbeiter entfernen?")) return;
    try {
      await api.delete(`/jobs/${jid}/assign`, { data: { employeeId: eid } });
      toast.success("Entfernt");
      fetchData();
    } catch (error) { toast.error("Fehler"); }
  };

  const handleSubmit = async () => {
    if (modalMode === 'COMPLETE' && !durationInput) return toast.error("Dauer angeben!");
    setIsSubmitting(true);
    try {
        if (selectedFile) {
          const fd = new FormData();
          fd.append('image', selectedFile);
          await api.post(`/jobs/${selectedJobId}/proof`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
        }
        if (modalMode === 'COMPLETE') {
            await api.patch(`/jobs/${selectedJobId}`, { status: 'COMPLETED', actualDurationMinutes: Number(durationInput) });
        }
        setIsModalOpen(false);
        fetchData(); 
        toast.success("Erfolgreich gespeichert!");
    } catch (error) { toast.error("Fehler"); } 
    finally { setIsSubmitting(false); }
  };

  const filteredJobs = jobs.filter(job => {
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'OPEN') return ['SCHEDULED', 'IN_PROGRESS'].includes(job.status);
      return ['COMPLETED', 'CANCELLED'].includes(job.status);
  });

  return (
    <div className="page-container">
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title">{isAdmin ? 'Einsatz-Zentrale' : 'Meine Aufträge'}</h1>
          <p className="page-subtitle text-slate-500 font-medium">Live-Übersicht und Team-Steuerung der GlanzOps Aufträge.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
          
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['OPEN', 'DONE', 'ALL'] as const).map((s) => (
              <button 
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filterStatus === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {s === 'OPEN' ? 'Offen' : s === 'DONE' ? 'Fertig' : 'Alle'}
              </button>
            ))}
          </div>

          <button onClick={fetchData} className="btn-secondary !p-3">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-3 text-blue-600" size={32} />
          <span className="font-bold text-xs uppercase tracking-widest italic">Synchronisiere Live-Daten...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
          <Filter className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Keine Einsätze gefunden</p>
        </div>
      ) : viewMode === 'GRID' ? (
        /* --- GRID VIEW (KARTEN) --- */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {filteredJobs.map((job) => (
            <div key={job.id} className="customer-card !p-0 overflow-hidden border-none shadow-lg bg-white">
              {/* Status Stripe */}
              <div className={`h-1.5 w-full ${job.status === 'COMPLETED' ? 'bg-emerald-500' : job.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-left overflow-hidden">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-2 py-1 rounded mb-2 inline-block">
                      {job.service.name}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 leading-tight truncate">
                      {job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`}
                    </h3>
                  </div>
                  <span className={`status-badge shrink-0 ${job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                    {job.status}
                  </span>
                </div>

                <div className="space-y-2 text-left text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> {format(new Date(job.scheduledDate), 'EEEE, dd. MMMM')}</div>
                  <div className="flex items-center gap-2"><Clock size={14} className="text-slate-400" /> {format(new Date(job.scheduledDate), 'HH:mm')} Uhr</div>
                  <div className="flex items-start gap-2 pt-1">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" /> 
                    <span className="font-bold text-slate-700 leading-snug">{getAddressString(job)}</span>
                  </div>
                </div>

                {/* Team Sektion */}
                <div className="pt-4 border-t border-slate-50 text-left">
                  <label className="label-caps !text-[9px] mb-2">Team</label>
                  <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                    {job.assignments.map(a => (
                      <div key={a.employee.id} className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-600 border border-slate-200">
                        {a.employee.firstName}
                        {isAdmin && <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => handleUnassignEmployee(job.id, a.employee.id)}/>}
                      </div>
                    ))}
                    {isAdmin && (
                      <div className="relative">
                        <select 
                          className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full" 
                          onChange={(e) => handleAssignEmployee(job.id, e.target.value)} 
                          value=""
                        >
                          <option value="">Wählen...</option>
                          {employees.map(e => (
                             <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                          ))}
                        </select>
                        <div className="w-7 h-7 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all">
                          <Plus size={14} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex gap-2">
                  {['SCHEDULED', 'IN_PROGRESS'].includes(job.status) ? (
                    <>
                      <button onClick={() => { setSelectedJobId(job.id); setModalMode('UPLOAD'); setIsModalOpen(true); }} className="btn-secondary flex-1 !py-2.5 shadow-sm text-xs"><Camera size={14} /> Foto</button>
                      <button onClick={() => { setSelectedJobId(job.id); setModalMode('COMPLETE'); setIsModalOpen(true); }} className="btn-primary flex-1 !py-2.5 shadow-blue-200 text-xs uppercase tracking-widest">Erledigt</button>
                    </>
                  ) : (
                    <div className="w-full text-center py-3 bg-slate-50 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 italic">Abgeschlossen</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* --- TABLE VIEW (LISTE) --- */
        <div className="table-container animate-in slide-in-from-bottom-4 duration-500 bg-white">
          <table className="table-main">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Termin</th>
                <th className="table-cell">Kunde & Service</th>
                <th className="table-cell">Adresse</th>
                <th className="table-cell">Team</th>
                <th className="table-cell">Status</th>
                <th className="table-cell text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} className="table-row group">
                  <td className="table-cell">
                    <div className="font-black text-slate-900">{format(new Date(job.scheduledDate), 'dd.MM.yy')}</div>
                    <div className="text-[10px] font-bold text-slate-400">{format(new Date(job.scheduledDate), 'HH:mm')} Uhr</div>
                  </td>
                  <td className="table-cell">
                    <div className="font-black text-slate-800 leading-tight">{job.customer.companyName || job.customer.lastName}</div>
                    <div className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">{job.service.name}</div>
                  </td>
                  <td className="table-cell max-w-[200px] truncate text-slate-700 font-bold text-xs italic">
                    {getAddressString(job)}
                  </td>
                  <td className="table-cell">
                    <div className="flex -space-x-2">
                      {job.assignments.map(a => (
                        <div key={a.employee.id} className="w-7 h-7 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[9px] font-black text-blue-600 uppercase shadow-sm" title={a.employee.firstName}>
                          {a.employee.firstName.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>{job.status}</span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {isAdmin && <button onClick={() => handleStatusChange(job.id, 'CANCELLED')} className="btn-ghost-danger" title="Stornieren"><Trash2 size={16} /></button>}
                      <button onClick={() => { setSelectedJobId(job.id); setModalMode('COMPLETE'); setIsModalOpen(true); }} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL SYSTEM --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content !max-w-md animate-in zoom-in-95">
            <div className="modal-header">
              <div className="text-left">
                <h2 className="text-xl font-black text-slate-900">{modalMode === 'COMPLETE' ? 'Einsatz beenden' : 'Foto-Nachweis'}</h2>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1 italic">Qualitätssicherung GlanzOps</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X /></button>
            </div>
            <div className="modal-body space-y-6">
               <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${previewUrl ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50/10'}`}>
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => {
                    if(e.target.files?.[0]) {
                      setSelectedFile(e.target.files[0]);
                      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }} />
                  {previewUrl ? <img src={previewUrl} className="max-h-48 rounded-2xl shadow-lg" alt="Preview" /> : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Camera size={24} /></div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center leading-tight">Foto aufnehmen oder<br/>Hochladen</p>
                    </>
                  )}
               </div>
               {modalMode === 'COMPLETE' && (
                 <div className="space-y-2 text-left mt-4">
                    <label className="label-caps !ml-0 text-blue-600">Arbeitszeit (Minuten)</label>
                    <input type="number" className="input-standard !text-2xl font-black text-center" placeholder="z.B. 120" value={durationInput} onChange={(e) => setDurationInput(e.target.value)} />
                 </div>
               )}
               <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary w-full !py-4 shadow-xl shadow-blue-200 uppercase tracking-[0.2em] font-black">
                 {isSubmitting ? <Loader2 className="animate-spin" /> : <>{modalMode === 'COMPLETE' ? 'Abschluss speichern' : 'Upload bestätigen'}</>}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}