import { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { addMinutes, differenceInMinutes, format, getDay, parse, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Camera, CheckCircle,
  ChevronRight,
  Clock,
  Loader2,
  Lock,
  MapPin,
  Navigation, Play,
  RefreshCw,
  Trash2,
  UserPlus,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

// --- LOCALIZER ---
const locales = { 'de': de };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), 
    getDay,
    locales,
});

// --- VITE FIX ---
const DnDCalendar = (withDragAndDrop as any).default 
    ? (withDragAndDrop as any).default(Calendar) 
    : withDragAndDrop(Calendar);

// --- CONFIG ---
const formats = {
    timeGutterFormat: 'HH:mm',
    eventTimeRangeFormat: ({ start, end }: any) => `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
    agendaTimeRangeFormat: ({ start, end }: any) => `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
    dayHeaderFormat: 'eeee, dd.MM.', 
    dayRangeHeaderFormat: ({ start, end }: any) => `${format(start, 'dd.MM.')} – ${format(end, 'dd.MM.yyyy')}`,
};

const messages = {
    allDay: 'Ganztag',
    previous: '<',
    next: '>',
    today: 'Heute',
    month: 'Monat',
    week: 'Woche',
    day: 'Tag',
    agenda: 'Liste',
    date: 'Datum',
    time: 'Zeit',
    event: 'Event',
    noEventsInRange: 'Keine Termine',
};

// --- TYPEN ---
interface Job {
    id: string;
    scheduledDate: string;
    customer: { companyName: string | null; lastName: string; firstName: string; };
    service: { name: string; duration?: number; };
    status: string;
    address: { street: string; city: string };
    assignments: { employee: { id: string; firstName: string; lastName: string } }[];
    actualDurationMinutes?: number;
}

// --- EVENT CARD (Vorlage Design) ---
const JobEvent = ({ event }: { event: any }) => {
    const job = event.resource as Job;
    const isCompleted = job.status === 'COMPLETED';
    const isCancelled = job.status === 'CANCELLED';
    const hasAssignments = job.assignments.length > 0;

    return (
        <div className={`h-full w-full rounded-md border-l-[3px] p-1.5 shadow-sm transition-all overflow-hidden flex flex-col justify-between ${
            isCompleted ? 'bg-emerald-50 border-emerald-500' : 
            isCancelled ? 'bg-red-50 border-red-500' :
            hasAssignments ? 'bg-amber-50 border-amber-500' : 'bg-blue-50 border-blue-500'
        }`}>
            <div className="flex justify-between items-start">
                <span className={`text-[9px] font-black uppercase truncate leading-none ${
                    isCompleted ? 'text-emerald-700' : 
                    isCancelled ? 'text-red-700' :
                    hasAssignments ? 'text-amber-700' : 'text-blue-700'
                }`}>
                    {event.title}
                </span>
                {isCompleted && <CheckCircle size={10} className="text-emerald-600 shrink-0" />}
            </div>
            <div className="flex items-center gap-1 text-[8px] font-bold text-slate-500 truncate mt-1">
                <Clock size={8} /> {format(event.start, 'HH:mm')}
                {hasAssignments && <span className="opacity-60">• {job.assignments.length} P.</span>}
            </div>
        </div>
    );
};

export default function CalendarPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<View>(Views.WEEK);
    const [date, setDate] = useState(new Date());

    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newJobData, setNewJobData] = useState({ date: '', time: '08:00', customerId: '', serviceId: '' });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    
    const [employees, setEmployees] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);

    const [timeInputs, setTimeInputs] = useState({ start: '', end: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isLocked = selectedJob?.status === 'COMPLETED' || selectedJob?.status === 'CANCELLED';
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    const fetchData = async () => {
        setLoading(true);
        try {
            const [jobsRes, empRes, custRes, servRes] = await Promise.all([
                api.get('/jobs'), api.get('/employees'), api.get('/customers'), api.get('/services')
            ]);
            setEmployees(empRes.data); setCustomers(custRes.data); setServices(servRes.data);

            const mappedEvents = jobsRes.data.map((job: Job) => ({
                id: job.id,
                title: job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`,
                start: new Date(job.scheduledDate),
                end: addMinutes(new Date(job.scheduledDate), job.service.duration || 120),
                resource: job,
            }));
            setEvents(mappedEvents);
        } catch (error) { toast.error("Ladefehler"); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const moveEvent = useCallback(async ({ event, start }: any) => {
        if (event.resource.status === 'COMPLETED' || event.resource.status === 'CANCELLED') {
            toast.error("Erledigte Jobs sind fixiert!");
            return;
        }

        const tid = toast.loading("Verschiebe...");
        try {
           setEvents((prev) => prev.map((ev) => ev.id === event.id ? { ...ev, start, end: addMinutes(start, differenceInMinutes(ev.end, ev.start)) } : ev));
           await api.patch(`/jobs/${event.id}`, { scheduledDate: start.toISOString() });
           toast.success("Termin aktualisiert", { id: tid });
           fetchData();
        } catch (e) { toast.error("Fehler", { id: tid }); fetchData(); }
    }, []);

    const handleSelectEvent = (event: any) => { 
        setSelectedJob(event.resource); 
        setIsEditModalOpen(true); 
    };
    
    const handleSelectSlot = ({ start }: any) => {
        if (!isAdmin) return;
        setNewJobData({ date: format(start, 'yyyy-MM-dd'), time: format(start, 'HH:mm'), customerId: '', serviceId: '' });
        setIsCreateModalOpen(true);
    };

    const handleCreateJob = async () => {
        if (!newJobData.customerId || !newJobData.serviceId) return toast.error("Daten unvollständig");
        setIsSaving(true);
        try {
            await api.post('/jobs', { customerId: newJobData.customerId, serviceId: newJobData.serviceId, scheduledDate: `${newJobData.date}T${newJobData.time}:00` });
            toast.success("Einsatz geplant!"); setIsCreateModalOpen(false); fetchData();
        } catch (e) { toast.error("Fehler"); } finally { setIsSaving(false); }
    };

    const handleAssignEmployee = async (eid: string) => { 
        if (isLocked || !selectedJob) return;
        try { 
            await api.post(`/jobs/${selectedJob.id}/assign`, { employeeId: eid }); 
            toast.success("Personal zugewiesen"); fetchData(); setIsEditModalOpen(false); 
        } catch(e) { toast.error("Fehler"); }
    };
    
    const handleRemoveEmployee = async (eid: string) => { 
        if (isLocked || !selectedJob) return;
        try { 
            await api.delete(`/jobs/${selectedJob.id}/assign`, { data: { employeeId: eid } }); 
            toast.success("Entfernt"); fetchData(); setIsEditModalOpen(false); 
        } catch(e) { toast.error("Fehler"); }
    };

    const openCompleteModal = () => {
        if(!selectedJob) return;
        const start = new Date(selectedJob.scheduledDate);
        const end = addMinutes(start, selectedJob.service.duration || 120);
        setTimeInputs({ start: format(start, 'HH:mm'), end: format(end, 'HH:mm') });
        setSelectedFile(null); setPreviewUrl(null);
        setIsEditModalOpen(false); setIsCompleteModalOpen(true); 
    };

    const handleStatusUpdate = async (status: string) => {
        if(!selectedJob) return;
        if (!isAdmin && selectedJob.status === 'COMPLETED' && status !== 'COMPLETED') {
            return toast.error("Nur Admins können fertige Jobs öffnen.");
        }
        if (status === 'COMPLETED') { openCompleteModal(); return; }
        try { 
            await api.patch(`/jobs/${selectedJob.id}`, { status }); 
            toast.success("Status aktualisiert"); fetchData(); setIsEditModalOpen(false); 
        } catch (e) { toast.error("Fehler"); }
    };

    const handleCompleteSubmit = async () => {
        if (!selectedJob) return;
        setIsSubmitting(true);
        try {
            if (selectedFile) {
                const fd = new FormData(); fd.append('image', selectedFile);
                await api.post(`/jobs/${selectedJob.id}/proof`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
            }
            const [sH, sM] = timeInputs.start.split(':').map(Number);
            const [eH, eM] = timeInputs.end.split(':').map(Number);
            const sDate = new Date(selectedJob.scheduledDate); sDate.setHours(sH, sM, 0);
            const eDate = new Date(selectedJob.scheduledDate); eDate.setHours(eH, eM, 0);
            if (eDate < sDate) eDate.setDate(eDate.getDate() + 1);
            
            await api.patch(`/jobs/${selectedJob.id}`, { status: 'COMPLETED', actualDurationMinutes: differenceInMinutes(eDate, sDate) });
            setIsCompleteModalOpen(false); fetchData(); toast.success("Abgeschlossen!");
        } catch (e) { toast.error("Fehler"); } finally { setIsSubmitting(false); }
    };

    return (
        <div className="page-container h-screen flex flex-col overflow-hidden pb-safe">
            
            {/* HEADER SECTION */}
            <div className="header-section shrink-0">
                <div>
                    <h1 className="page-title">Einsatzplan</h1>
                    <p className="page-subtitle">Zentrale Ressourcen- & Terminsteuerung.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setDate(new Date())} className="btn-secondary !py-1.5 !px-3 text-[10px] uppercase tracking-widest font-bold">Heute</button>
                    <button onClick={fetchData} className="btn-secondary !p-2">
                        <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : 'text-slate-400'}/>
                    </button>
                </div>
            </div>

            {/* KALENDER */}
            <div className="table-container flex-1 relative flex flex-col min-h-0">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 z-50 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 size={32} className="animate-spin text-blue-600"/>
                    </div>
                )}

                <DnDCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor={(e: any) => new Date(e.start)}
                    endAccessor={(e: any) => new Date(e.end)}
                    date={date}
                    onNavigate={setDate}
                    view={view}
                    onView={(v:any) => setView(v)}
                    onEventDrop={moveEvent}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable={isAdmin}
                    step={30}
                    timeslots={2}
                    min={new Date(0, 0, 0, 7, 0, 0)}
                    max={new Date(0, 0, 0, 22, 0, 0)}
                    culture="de"
                    formats={formats}
                    messages={messages}
                    components={{ event: JobEvent }}
                    style={{ height: '100%' }}
                    className="custom-calendar"
                />
            </div>

            {/* --- CREATE MODAL (Vorlage Design) --- */}
            {isCreateModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content !max-w-md">
                        <div className="modal-header">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Play size={16} fill="currentColor"/></div>
                                <h2 className="text-sm font-bold text-slate-900">Neuer Auftrag</h2>
                            </div>
                            <button onClick={()=>setIsCreateModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} className="text-slate-400"/></button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label-caps !ml-0 mb-1">Datum</label>
                                    <input type="date" value={newJobData.date} onChange={e=>setNewJobData({...newJobData, date: e.target.value})} className="input-standard !py-1"/>
                                </div>
                                <div>
                                    <label className="label-caps !ml-0 mb-1">Startzeit</label>
                                    <input type="time" value={newJobData.time} onChange={e=>setNewJobData({...newJobData, time: e.target.value})} className="input-standard !py-1"/>
                                </div>
                            </div>
                            <div>
                                <label className="label-caps">Kunde wählen</label>
                                <select className="input-standard font-bold" onChange={e=>setNewJobData({...newJobData, customerId: e.target.value})} value={newJobData.customerId}>
                                    <option value="">Bitte wählen...</option>
                                    {customers.map(c=><option key={c.id} value={c.id}>{c.companyName || `${c.firstName} ${c.lastName}`}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label-caps">Service / Leistung</label>
                                <select className="input-standard font-bold" onChange={e=>setNewJobData({...newJobData, serviceId: e.target.value})} value={newJobData.serviceId}>
                                    <option value="">Bitte wählen...</option>
                                    {services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={handleCreateJob} disabled={isSaving} className="btn-primary w-full !py-3 shadow-lg shadow-blue-500/20 uppercase tracking-widest font-bold text-[11px]">
                                {isSaving ? <Loader2 className="animate-spin" size={16}/> : 'Einsatz fest einplanen'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EDIT MODAL (Vorlage Design) --- */}
            {isEditModalOpen && selectedJob && (
                <div className="modal-overlay">
                    <div className="modal-content !max-w-md overflow-hidden">
                        <div className={`px-4 py-4 flex justify-between items-center text-white ${isLocked ? 'bg-slate-800' : 'bg-slate-900'}`}>
                            <div className="min-w-0">
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.15em] flex items-center gap-2 mb-1">
                                    {selectedJob.service.name} 
                                    {isLocked && <span className="bg-white/10 px-1.5 py-0.5 rounded text-white flex items-center gap-1 border border-white/10"><Lock size={8}/> FIXIERT</span>}
                                </span>
                                <h2 className="text-sm font-bold truncate leading-tight">{selectedJob.customer.companyName || `${selectedJob.customer.firstName} ${selectedJob.customer.lastName}`}</h2>
                            </div>
                            <button onClick={()=>setIsEditModalOpen(false)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><X size={18}/></button>
                        </div>

                        <div className="modal-body space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white rounded-xl border border-slate-200">
                                    <label className="label-caps !ml-0 mb-1.5 text-blue-600">Status</label>
                                    <select 
                                        value={selectedJob.status} 
                                        onChange={e=>handleStatusUpdate(e.target.value)} 
                                        disabled={isLocked && !isAdmin}
                                        className="w-full text-xs font-bold bg-transparent outline-none cursor-pointer"
                                    >
                                        <option value="SCHEDULED">Geplant</option>
                                        <option value="IN_PROGRESS">Aktiv</option>
                                        <option value="COMPLETED">Erledigt</option>
                                        <option value="CANCELLED">Storniert</option>
                                    </select>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                                    <label className="label-caps !ml-0 mb-0.5">Zeitpunkt</label>
                                    <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-700">
                                        <Clock size={12} className="text-slate-400"/>
                                        {format(new Date(selectedJob.scheduledDate), 'HH:mm')} Uhr
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="stat-icon-box bg-white border border-slate-100 shadow-sm text-blue-600"><MapPin size={14}/></div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Einsatzort</p>
                                        <p className="text-[11px] font-bold text-slate-700 truncate">{selectedJob.address.street}, {selectedJob.address.city}</p>
                                    </div>
                                </div>
                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.address.street + ' ' + selectedJob.address.city)}`} target="_blank" rel="noreferrer" className="p-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-all"><Navigation size={14}/></a>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Personal</h3>
                                    <span className="text-[9px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{selectedJob.assignments.length}</span>
                                </div>
                                <div className="space-y-1.5">
                                    {selectedJob.assignments.map(a=>(
                                        <div key={a.employee.id} className="flex justify-between items-center p-2 rounded-lg bg-white border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-[9px] font-black text-blue-600 border border-blue-100">{a.employee.firstName.charAt(0)}{a.employee.lastName.charAt(0)}</div>
                                                <span className="text-[11px] font-bold text-slate-700">{a.employee.firstName} {a.employee.lastName}</span>
                                            </div>
                                            {!isLocked && (
                                                <button onClick={()=>handleRemoveEmployee(a.employee.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
                                                    <Trash2 size={14}/>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {!isLocked && (
                                        <div className="relative group">
                                            <UserPlus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-blue-500 transition-colors"/>
                                            <select 
                                                onChange={e=>handleAssignEmployee(e.target.value)} 
                                                value="" 
                                                className="w-full pl-9 pr-4 py-2 text-[11px] border-2 border-dashed border-slate-200 rounded-lg font-bold text-slate-400 outline-none cursor-pointer hover:border-blue-300 hover:text-blue-600 transition-all"
                                            >
                                                <option value="">Personal hinzufügen...</option>
                                                {employees.map(emp=><option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {!isLocked && (
                            <div className="p-4 bg-slate-50 border-t border-slate-100">
                                <button onClick={openCompleteModal} className="btn-primary w-full !py-3 font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-blue-500/20">
                                    Abschlussbericht erfassen <ChevronRight size={14} className="ml-1" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- COMPLETE MODAL (Vorlage Design) --- */}
            {isCompleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content !max-w-sm">
                        <div className="modal-header">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={16}/></div>
                                <h2 className="text-sm font-bold text-slate-900">Job abschließen</h2>
                            </div>
                            <button onClick={()=>setIsCompleteModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X size={18}/></button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div 
                                onClick={()=>fileInputRef.current?.click()} 
                                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${previewUrl ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/10'}`}
                            >
                                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e)=>{if(e.target.files?.[0]){setSelectedFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0]));}}}/>
                                {previewUrl ? (
                                    <img src={previewUrl} className="max-h-32 rounded-lg shadow-md" alt="Nachweis"/>
                                ) : (
                                    <>
                                        <Camera size={28} className="text-slate-300 mb-2"/>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Foto-Nachweis (Optional)</span>
                                    </>
                                )}
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <label className="label-caps !ml-0 mb-3 text-blue-600">Ist-Arbeitszeit</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="time" className="input-standard !py-1.5 text-center font-bold" value={timeInputs.start} onChange={e=>setTimeInputs({...timeInputs, start: e.target.value})}/>
                                    <input type="time" className="input-standard !py-1.5 text-center font-bold" value={timeInputs.end} onChange={e=>setTimeInputs({...timeInputs, end: e.target.value})}/>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={handleCompleteSubmit} disabled={isSubmitting} className="btn-primary w-full !py-3 shadow-lg shadow-emerald-500/20 uppercase tracking-widest font-bold text-[11px] !bg-emerald-600 !border-emerald-700">
                                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Bericht speichern & Job schließen'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}