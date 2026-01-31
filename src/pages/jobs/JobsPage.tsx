import { useEffect, useState, useRef } from 'react';
import { 
  CheckCircle, Calendar, MapPin, Play, RefreshCw, X, 
  Loader2, Camera, UserPlus, Filter, Trash2,
  Clock, Plus, Briefcase, ChevronDown, AlertCircle, Users,
  CheckCircle2, Image as ImageIcon
} from 'lucide-react'; 
import { 
  format, isWithinInterval, parseISO, differenceInMinutes, 
  isToday, isTomorrow, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay 
} from 'date-fns';
import toast from 'react-hot-toast'; 
import api from '../../lib/api';
import ViewSwitcher from '../../components/ViewSwitcher';
import { useAuth } from '../../context/AuthContext';

// --- Interfaces ---
interface Employee { id: string; firstName: string; lastName: string; }
interface JobProof { id: string; url: string; type: string; }
interface Absence { id: string; employeeId: string; startDate: string; endDate: string; type: string; }

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

type TimeFilter = 'ALL' | 'TODAY' | 'TOMORROW' | 'WEEK' | 'MONTH';

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'DONE'>('OPEN');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('WEEK'); // Standardmäßig auf Woche
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'COMPLETE' | 'UPLOAD'>('COMPLETE');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  const [timeInputs, setTimeInputs] = useState({ start: '', end: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUserAdmin = user?.role === 'ADMIN' || localStorage.getItem('role') === 'ADMIN';

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => { fetchData(true); }, []);

  const fetchData = async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      const [jobsRes, employeesRes, absRes] = await Promise.all([
        api.get('/jobs'),
        isUserAdmin ? api.get('/employees') : Promise.resolve({ data: [] }),
        isUserAdmin ? api.get('/absences') : Promise.resolve({ data: [] }) 
      ]);
      
      const sortedJobs = jobsRes.data.sort((a: Job, b: Job) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );
      
      setJobs(sortedJobs);
      if (employeesRes) setEmployees(employeesRes.data);
      if (absRes) setAbsences(absRes.data);
    } catch (error) {
      toast.error("Fehler beim Laden");
    } finally { setLoading(false); }
  };

  const checkAvailability = (employeeId: string, jobDateString: string) => {
      const jobDate = parseISO(jobDateString);
      return absences.find(a => 
          a.employeeId === employeeId && 
          isWithinInterval(jobDate, { start: parseISO(a.startDate), end: parseISO(a.endDate) })
      );
  };

  const handleManualGeneration = async () => {
    if (!confirm("Jobs aus Verträgen generieren?")) return;
    setIsGenerating(true);
    const toastId = toast.loading("Generiere...");
    try {
        await api.post('/debug/trigger-cron');
        toast.success("Erledigt!", { id: toastId });
        fetchData(false); 
    } catch (error) {
        toast.error("Fehler", { id: toastId });
    } finally { setIsGenerating(false); }
  };

  const getAddressString = (job: Job) => {
    if (job.address?.street) return `${job.address.street}, ${job.address.city}`;
    if (job.customer?.addresses && job.customer.addresses.length > 0) {
        const a = job.customer.addresses[0];
        return `${a.street}, ${a.city}`;
    }
    return "Keine Adresse";
  };

  const handleAssignEmployee = async (jid: string, eid: string, jobDate: string) => {
    const conflict = checkAvailability(eid, jobDate);
    if (conflict && !confirm(`WARNUNG: Mitarbeiter ist abwesend (${conflict.type === 'SICKNESS' ? 'Krank' : 'Urlaub'}). Trotzdem zuweisen?`)) return;

    const toastId = toast.loading("Zuweisung...");
    try { 
      await api.post(`/jobs/${jid}/assign`, { employeeId: eid }); 
      toast.success("Zugewiesen", { id: toastId });
      fetchData(false); 
    } catch(e: any) { 
      toast.error("Fehler", { id: toastId }); 
    }
  };

  const handleUnassignEmployee = async (jid: string, eid: string) => {
    if(!confirm("Zuweisung aufheben?")) return;
    try {
      await api.delete(`/jobs/${jid}/assign`, { data: { employeeId: eid } });
      toast.success("Entfernt");
      fetchData(false); 
    } catch (error) { toast.error("Fehler"); }
  };

  const openCompleteModal = (job: Job) => {
      setSelectedJobId(job.id);
      setModalMode('COMPLETE');
      const scheduled = new Date(job.scheduledDate);
      setTimeInputs({ start: format(scheduled, 'HH:mm'), end: format(new Date(), 'HH:mm') });
      setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        if (selectedFile) {
          const fd = new FormData();
          fd.append('image', selectedFile);
          await api.post(`/jobs/${selectedJobId}/proof`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
        }
        if (modalMode === 'COMPLETE') {
            const [startH, startM] = timeInputs.start.split(':').map(Number);
            const [endH, endM] = timeInputs.end.split(':').map(Number);
            const startDate = new Date(); startDate.setHours(startH, startM, 0);
            const endDate = new Date(); endDate.setHours(endH, endM, 0);
            if (endDate < startDate) {
                toast.error("Endzeit ungültig");
                setIsSubmitting(false);
                return;
            }
            const duration = differenceInMinutes(endDate, startDate);
            await api.patch(`/jobs/${selectedJobId}`, { status: 'COMPLETED', actualDurationMinutes: duration });
        }
        setIsModalOpen(false);
        fetchData(false); 
        toast.success("Job abgeschlossen");
    } catch (error) { toast.error("Fehler"); } 
    finally { setIsSubmitting(false); }
  };

  // --- FILTER LOGIK ---
  const filteredJobs = jobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      const now = new Date();

      // 1. Status Filter
      let matchesStatus = true;
      if (filterStatus === 'OPEN') matchesStatus = ['SCHEDULED', 'IN_PROGRESS'].includes(job.status);
      if (filterStatus === 'DONE') matchesStatus = ['COMPLETED', 'CANCELLED'].includes(job.status);

      // 2. Zeit Filter
      let matchesTime = true;
      if (timeFilter === 'TODAY') matchesTime = isToday(jobDate);
      else if (timeFilter === 'TOMORROW') matchesTime = isTomorrow(jobDate);
      else if (timeFilter === 'WEEK') {
        matchesTime = isWithinInterval(jobDate, { 
          start: startOfWeek(now, { weekStartsOn: 1 }), 
          end: endOfWeek(now, { weekStartsOn: 1 }) 
        });
      }
      else if (timeFilter === 'MONTH') {
        matchesTime = isWithinInterval(jobDate, { 
          start: startOfMonth(now), 
          end: endOfMonth(now) 
        });
      }

      return matchesStatus && matchesTime;
  });

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'COMPLETED': return 'bg-emerald-500';
          case 'CANCELLED': return 'bg-red-500';
          case 'IN_PROGRESS': return 'bg-amber-500';
          default: return 'bg-blue-500';
      }
  };

  const TeamSelector = ({ job, assigned }: { job: Job, assigned: any[] }) => (
    <div className="flex items-center gap-2 relative">
        <div className="flex -space-x-1.5">
            {assigned.map((a: any) => (
                <div 
                    key={a.employee.id} 
                    onClick={(e) => { e.stopPropagation(); isUserAdmin && handleUnassignEmployee(job.id, a.employee.id); }} 
                    className="w-7 h-7 rounded-full bg-white border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-600 shadow-sm cursor-pointer hover:scale-110 hover:border-red-100 hover:text-red-500 transition-all z-10" 
                    title={`${a.employee.firstName} (Klicken zum Entfernen)`}
                >
                    {a.employee.firstName.charAt(0)}{a.employee.lastName.charAt(0)}
                </div>
            ))}
        </div>
        {isUserAdmin && (
            <div className="relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); setActiveDropdownId(activeDropdownId === job.id ? null : job.id); }}
                    className={`w-7 h-7 flex items-center justify-center rounded-full border transition-all ${assigned.length === 0 ? 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600'}`}
                >
                    {assigned.length === 0 ? <UserPlus size={14}/> : <Plus size={14} />}
                </button>
                {activeDropdownId === job.id && (
                    <div className="absolute bottom-9 left-0 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-bottom-left" onClick={(e) => e.stopPropagation()}>
                        <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Personal zuweisen</div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                            {employees.map(emp => {
                                const conflict = checkAvailability(emp.id, job.scheduledDate);
                                if(assigned.some((a: any) => a.employee.id === emp.id)) return null;
                                return (
                                    <div key={emp.id} onClick={() => { handleAssignEmployee(job.id, emp.id, job.scheduledDate); setActiveDropdownId(null); }} className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-black ${conflict ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>{emp.firstName.charAt(0)}{emp.lastName.charAt(0)}</div>
                                        <div className="flex-1"><p className="text-[11px] font-bold text-slate-700">{emp.firstName} {emp.lastName}</p></div>
                                        {conflict ? <AlertCircle size={12} className="text-red-400" /> : <Plus size={12} className="text-slate-300" />}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );

  return (
    <div className="page-container">
      {/* HEADER SECTION */}
      <div className="header-section">
        <div>
          <h1 className="page-title">{isUserAdmin ? 'Einsatz-Zentrale' : 'Meine Aufträge'}</h1>
          <p className="page-subtitle">Live-Übersicht und Team-Steuerung.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
          
          {/* Zeit Filter Bar */}
          <div className="view-switcher-container">
            {(['TODAY', 'TOMORROW', 'WEEK', 'MONTH', 'ALL'] as const).map((t) => (
              <button 
                key={t} 
                onClick={() => setTimeFilter(t)} 
                className={`view-btn text-[9px] font-black px-2.5 ${timeFilter === t ? 'view-btn-active' : 'view-btn-inactive'}`}
              >
                {t === 'TODAY' ? 'Heute' : t === 'TOMORROW' ? 'Morgen' : t === 'WEEK' ? 'Woche' : t === 'MONTH' ? 'Monat' : 'Alle'}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* Status Filter Bar */}
          <div className="view-switcher-container">
            {(['OPEN', 'DONE', 'ALL'] as const).map((s) => (
              <button 
                key={s} 
                onClick={() => setFilterStatus(s)} 
                className={`view-btn text-[9px] font-black px-3 ${filterStatus === s ? 'view-btn-active' : 'view-btn-inactive'}`}
              >
                {s === 'OPEN' ? 'Offen' : s === 'DONE' ? 'Erledigt' : 'Status'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-1">
            {isUserAdmin && (
               <button onClick={handleManualGeneration} disabled={isGenerating} className="btn-secondary !p-2 text-indigo-600" title="Jobs generieren">
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
               </button>
            )}
            <button onClick={() => fetchData(true)} className="btn-secondary !p-2"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
          </div>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-info"><Clock size={16} /></div>
          <div>
            <span className="label-caps">In Filter</span>
            <div className="text-base font-bold text-slate-900 leading-none">{filteredJobs.length} Einsätze</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-success"><CheckCircle2 size={16} /></div>
          <div>
            <span className="label-caps">Heute Gesamt</span>
            <div className="text-base font-bold text-slate-900 leading-none">{jobs.filter(j => isToday(new Date(j.scheduledDate))).length} Geplant</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
          <span className="label-caps">Einsatzplan wird geladen...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white m-2 py-20 animate-in fade-in duration-300">
          <Filter size={32} className="text-slate-200 mb-2" />
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest text-center">Keine Einsätze für diesen Zeitraum<br/><span className="text-[9px] font-normal lowercase italic">Ändere den Filter oder erstelle neue Jobs</span></p>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 animate-in fade-in duration-500">
          {filteredJobs.map((job) => (
            <div key={job.id} className="group relative flex flex-col h-full min-h-[180px]"> 
              <div className="absolute inset-0 bg-white rounded-xl border border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-blue-200 transition-all duration-300 overflow-hidden z-0">
                 <div className={`absolute top-0 left-0 w-full h-1 ${getStatusColor(job.status)}`}></div>
              </div>

              <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-left overflow-hidden pr-2">
                    <h3 className="font-bold text-slate-900 text-[13px] leading-tight truncate mb-0.5">
                      {job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-tighter italic">
                        <Briefcase size={10} /> {job.service.name}
                    </div>
                  </div>
                  <span className={`status-badge !px-1.5 !py-0 text-[9px] ${job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {job.status === 'SCHEDULED' ? 'Geplant' : job.status}
                  </span>
                </div>

                <div className="space-y-1.5 mb-4 text-left">
                  <div className="flex items-center gap-2 text-[11px] text-slate-700 font-bold">
                    <Calendar size={14} className="text-blue-500" />
                    <span className={isToday(new Date(job.scheduledDate)) ? 'text-blue-600' : ''}>
                        {format(new Date(job.scheduledDate), 'dd.MM.yy')} <span className="text-slate-300 font-normal">|</span> {format(new Date(job.scheduledDate), 'HH:mm')} Uhr
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-[10px] text-slate-500 leading-snug">
                    <MapPin size={12} className="text-slate-300 mt-0.5 shrink-0" />
                    <span className="line-clamp-1">{getAddressString(job)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <TeamSelector job={job} assigned={job.assignments || []} />
                  {['SCHEDULED', 'IN_PROGRESS'].includes(job.status) ? (
                    <button onClick={() => openCompleteModal(job)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                      <CheckCircle size={16} />
                    </button>
                  ) : (
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10}/> Erledigt</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="table-container bg-white animate-in slide-in-from-bottom-2 duration-300">
          <table className="table-main">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Termin</th>
                <th className="table-cell">Kunde & Service</th>
                <th className="table-cell">Adresse</th>
                <th className="table-cell">Team</th>
                <th className="table-cell text-center">Status</th>
                <th className="table-cell text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} className="table-row group">
                  <td className="table-cell">
                    <div className="font-bold text-slate-900">{format(new Date(job.scheduledDate), 'dd.MM.yy')}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{format(new Date(job.scheduledDate), 'HH:mm')} Uhr</div>
                  </td>
                  <td className="table-cell">
                    <div className="font-bold text-slate-800 leading-tight">{job.customer.companyName || job.customer.lastName}</div>
                    <div className="text-[10px] text-blue-600 font-bold uppercase">{job.service.name}</div>
                  </td>
                  <td className="table-cell text-[11px] text-slate-500 truncate max-w-[150px]">{getAddressString(job)}</td>
                  <td className="table-cell"><TeamSelector job={job} assigned={job.assignments || []} /></td>
                  <td className="table-cell text-center">
                    <span className={`status-badge text-[10px] ${job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {job.status === 'SCHEDULED' ? 'Geplant' : job.status}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    {['SCHEDULED', 'IN_PROGRESS'].includes(job.status) && (
                        <button onClick={() => openCompleteModal(job)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle size={14} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* COMPLETE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content !max-w-sm">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><CheckCircle size={16}/></div>
                 <h2 className="text-sm font-bold text-slate-900">Einsatz abschließen</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
            </div>
            <div className="modal-body space-y-4">
               <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${previewUrl ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/10'}`}>
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => {
                    if(e.target.files?.[0]) {
                      setSelectedFile(e.target.files[0]);
                      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                    }
                  }} />
                  {previewUrl ? <img src={previewUrl} className="max-h-32 rounded-lg shadow-sm" alt="Preview" /> : (
                    <>
                      <ImageIcon size={24} className="text-slate-300 mb-2" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Foto-Nachweis (Optional)</p>
                    </>
                  )}
               </div>

               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <label className="label-caps !ml-0 mb-2">Arbeitszeit</label>
                  <div className="flex items-center gap-3">
                      <div className="flex-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Start</span>
                          <input type="time" className="input-standard !py-1 text-center font-bold" value={timeInputs.start} onChange={e => setTimeInputs({...timeInputs, start: e.target.value})} />
                      </div>
                      <div className="flex-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Ende</span>
                          <input type="time" className="input-standard !py-1 text-center font-bold" value={timeInputs.end} onChange={e => setTimeInputs({...timeInputs, end: e.target.value})} />
                      </div>
                  </div>
               </div>

               <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary w-full !py-2.5 shadow-lg shadow-blue-500/20 font-bold uppercase tracking-widest text-[11px]">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Einsatz speichern'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}