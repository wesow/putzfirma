import { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { addMinutes, differenceInMinutes, format, getDay, parse, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Camera, CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Navigation, Play,
  RefreshCw,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
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

// --- EVENT CARD (Compact) ---
const JobEvent = ({ event }: { event: any }) => {
  const job = event.resource as Job;
  
  let borderClass = 'border-blue-500';
  let bgClass = 'bg-blue-50';
  let textClass = 'text-blue-700';

  if (job.status === 'COMPLETED') {
    borderClass = 'border-emerald-500'; bgClass = 'bg-emerald-50'; textClass = 'text-emerald-700';
  } else if (job.status === 'CANCELLED') {
    borderClass = 'border-red-500'; bgClass = 'bg-red-50'; textClass = 'text-red-700';
  } else if (job.assignments.length > 0) {
    borderClass = 'border-amber-500'; bgClass = 'bg-amber-50'; textClass = 'text-amber-700';
  }

  return (
    <div className={`h-full w-full rounded-[3px] border-l-[3px] ${borderClass} ${bgClass} px-1.5 py-0.5 overflow-hidden leading-tight hover:brightness-95 transition-all shadow-sm`}>
      <div className="flex justify-between items-center">
        <span className={`text-[10px] font-bold uppercase truncate ${textClass}`}>
          {event.title}
        </span>
        {job.status === 'COMPLETED' && <CheckCircle size={10} className="text-emerald-600 shrink-0 ml-1" />}
      </div>
      <div className="flex items-center gap-1 text-[9px] font-medium text-slate-500 truncate mt-0.5">
         <Clock size={8} /> {format(event.start, 'HH:mm')}
         {job.assignments.length > 0 && <span className="opacity-70 ml-1">• {job.assignments.length} Pers.</span>}
      </div>
    </div>
  );
};

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  // Modal States
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newJobData, setNewJobData] = useState({ date: '', time: '08:00', customerId: '', serviceId: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  
  // Data States
  const [employees, setEmployees] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Completion Data
  const [timeInputs, setTimeInputs] = useState({ start: '', end: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- API ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, empRes, custRes, servRes] = await Promise.all([
        api.get('/jobs'), api.get('/employees'), api.get('/customers'), api.get('/services')
      ]);
      setEmployees(empRes.data); setCustomers(custRes.data); setServices(servRes.data);

      const mappedEvents = jobsRes.data.map((job: Job) => ({
          id: job.id,
          title: job.customer.companyName || `${job.customer.lastName} ${job.customer.firstName}`,
          start: new Date(job.scheduledDate),
          end: addMinutes(new Date(job.scheduledDate), job.service.duration || 120),
          resource: job,
      }));
      setEvents(mappedEvents);
    } catch (error) { toast.error("Ladefehler"); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLERS ---
  const moveEvent = useCallback(async ({ event, start }: any) => {
    const tid = toast.loading("...");
    try {
       setEvents((prev) => prev.map((ev) => ev.id === event.id ? { ...ev, start, end: addMinutes(start, differenceInMinutes(ev.end, ev.start)) } : ev));
       await api.patch(`/jobs/${event.id}`, { scheduledDate: start.toISOString() });
       toast.success("Verschoben", { id: tid });
       fetchData();
    } catch (e) { toast.error("Fehler", { id: tid }); fetchData(); }
  }, []);

  const handleSelectEvent = (event: any) => { setSelectedJob(event.resource); setIsEditModalOpen(true); };
  
  const handleSelectSlot = ({ start }: any) => {
      setNewJobData({ date: format(start, 'yyyy-MM-dd'), time: format(start, 'HH:mm'), customerId: '', serviceId: '' });
      setIsCreateModalOpen(true);
  };

  const handleCreateJob = async () => {
    if (!newJobData.customerId || !newJobData.serviceId) return toast.error("Daten fehlen");
    setIsSaving(true);
    try {
      await api.post('/jobs', { customerId: newJobData.customerId, serviceId: newJobData.serviceId, scheduledDate: `${newJobData.date}T${newJobData.time}:00` });
      toast.success("Erstellt!"); setIsCreateModalOpen(false); fetchData();
    } catch (e) { toast.error("Fehler"); } finally { setIsSaving(false); }
  };

  const handleAssignEmployee = async (eid: string) => { if (selectedJob) { try { await api.post(`/jobs/${selectedJob.id}/assign`, { employeeId: eid }); toast.success("Zugewiesen"); fetchData(); setIsEditModalOpen(false); } catch(e) { toast.error("Fehler"); }}};
  const handleRemoveEmployee = async (eid: string) => { if (selectedJob) { try { await api.delete(`/jobs/${selectedJob.id}/assign`, { data: { employeeId: eid } }); toast.success("Entfernt"); fetchData(); setIsEditModalOpen(false); } catch(e) { toast.error("Fehler"); }}};

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
      if (status === 'COMPLETED') { openCompleteModal(); return; }
      try { await api.patch(`/jobs/${selectedJob.id}`, { status }); toast.success("Status OK"); fetchData(); setIsEditModalOpen(false); } catch (e) { toast.error("Fehler"); }
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
    <div className="page-container h-screen flex flex-col overflow-hidden">
      
      {/* HEADER SECTION (Einheitlich mit FinancePage) */}
      <div className="header-section shrink-0">
        <div className="text-left">
          <h1 className="page-title">Einsatzplan</h1>
          <p className="page-subtitle">Ressourcen & Terminplanung.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchData} className="btn-secondary !py-2 !px-3"><RefreshCw size={14} className={loading ? 'animate-spin' : ''}/></button>
            <button onClick={() => setDate(new Date())} className="btn-secondary !py-2 !px-3 text-xs">Heute</button>
        </div>
      </div>

      {/* KALENDER WRAPPER (Nutzt jetzt table-container style) */}
      <div className="table-container flex-1 relative flex flex-col min-h-0">
         {loading && (
            <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-[2px]">
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
            selectable
            step={30}
            timeslots={2}
            
            min={new Date(0, 0, 0, 8, 0, 0)}
            max={new Date(0, 0, 0, 22, 0, 0)}
            
            culture="de"
            formats={formats}
            messages={messages}
            
            components={{ event: JobEvent }}
            
            // Wichtig: style-Attribute für BigCalendar
            style={{ height: '100%', width: '100%' }}
            className="font-sans text-[11px]"
         />
      </div>

      {/* --- CREATE MODAL --- */}
      {isCreateModalOpen && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <div className="modal-header">
                      <h2 className="text-sm font-bold uppercase text-slate-800">Neuer Auftrag</h2>
                      <button onClick={()=>setIsCreateModalOpen(false)}><X size={18} className="text-slate-400"/></button>
                  </div>
                  <div className="modal-body">
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="label-caps">Datum</label><input type="date" value={newJobData.date} onChange={e=>setNewJobData({...newJobData, date: e.target.value})} className="input-standard"/></div>
                        <div><label className="label-caps">Start</label><input type="time" value={newJobData.time} onChange={e=>setNewJobData({...newJobData, time: e.target.value})} className="input-standard"/></div>
                    </div>
                    <div><label className="label-caps">Kunde</label><select className="input-standard" onChange={e=>setNewJobData({...newJobData, customerId: e.target.value})} value={newJobData.customerId}><option value="">Wählen...</option>{customers.map(c=><option key={c.id} value={c.id}>{c.companyName || c.lastName}</option>)}</select></div>
                    <div><label className="label-caps">Leistung</label><select className="input-standard" onChange={e=>setNewJobData({...newJobData, serviceId: e.target.value})} value={newJobData.serviceId}><option value="">Wählen...</option>{services.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                  </div>
                  <div className="modal-footer">
                    <button onClick={handleCreateJob} disabled={isSaving} className="btn-primary w-full justify-center">{isSaving ? <Loader2 className="animate-spin" size={16}/> : 'Planen'}</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && selectedJob && (
          <div className="modal-overlay">
              <div className="modal-content !max-w-lg">
                  <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                      <div><span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{selectedJob.service.name}</span><h2 className="text-sm font-bold">{selectedJob.customer.companyName || selectedJob.customer.lastName}</h2></div>
                      <button onClick={()=>setIsEditModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
                  </div>
                  <div className="modal-body space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 border rounded-lg"><label className="text-[9px] font-bold uppercase text-blue-600 block mb-1">Status</label><select value={selectedJob.status} onChange={e=>handleStatusUpdate(e.target.value)} className="w-full text-xs font-semibold bg-transparent outline-none cursor-pointer"><option value="SCHEDULED">Geplant</option><option value="IN_PROGRESS">Aktiv</option><option value="COMPLETED">Fertig</option><option value="CANCELLED">Storno</option></select></div>
                        <div className="p-2 border rounded-lg"><label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">Zeit</label><div className="flex items-center gap-2 text-xs font-semibold"><Clock size={14} className="text-blue-500"/>{format(new Date(selectedJob.scheduledDate), 'HH:mm')} Uhr</div></div>
                    </div>
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex justify-between items-center">
                        <div className="flex items-center gap-3"><MapPin size={16} className="text-blue-600"/><span className="text-xs font-semibold text-slate-700">{selectedJob.address.street}, {selectedJob.address.city}</span></div>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.address.street + ' ' + selectedJob.address.city)}`} target="_blank" rel="noreferrer" className="p-1.5 bg-white text-blue-600 rounded-md shadow-sm border border-blue-100"><Navigation size={14}/></a>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2"><h3 className="text-[10px] font-bold uppercase text-slate-500">Mitarbeiter</h3><span className="text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">{selectedJob.assignments.length}</span></div>
                        <div className="space-y-1">{selectedJob.assignments.map(a=><div key={a.employee.id} className="flex justify-between items-center p-2 border rounded-lg bg-slate-50"><span className="text-xs font-semibold">{a.employee.firstName} {a.employee.lastName}</span><button onClick={()=>handleRemoveEmployee(a.employee.id)} className="text-slate-400 hover:text-red-500"><X size={14}/></button></div>)}</div>
                        <select onChange={e=>handleAssignEmployee(e.target.value)} value="" className="w-full mt-2 p-1.5 text-[11px] border-2 border-dashed rounded-lg text-center font-bold text-slate-400 cursor-pointer hover:border-blue-400 hover:text-blue-500"><option value="">+ Zuweisen</option>{employees.map(emp=><option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}</select>
                    </div>
                  </div>
                  <div className="modal-footer bg-slate-50">
                    <button onClick={openCompleteModal} className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800"><Play size={12} fill="currentColor"/> Abschließen</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- COMPLETE MODAL --- */}
      {isCompleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h2 className="text-sm font-bold uppercase text-slate-800">Abschlussbericht</h2><button onClick={()=>setIsCompleteModalOpen(false)}><X size={18}/></button></div>
            <div className="modal-body space-y-4">
               <div onClick={()=>fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/10 ${previewUrl ? 'border-emerald-500' : 'border-slate-200'}`}><input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e)=>{if(e.target.files?.[0]){setSelectedFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0]));}}}/>{previewUrl ? <img src={previewUrl} className="h-20 rounded-lg shadow-sm" alt="Preview"/> : <><Camera size={20} className="text-blue-500 mb-1"/><span className="text-[9px] font-bold uppercase text-slate-400">Foto hinzufügen</span></>}</div>
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><label className="label-caps !ml-0 text-blue-600 mb-2 block">Zeiterfassung</label><div className="flex items-center gap-2"><input type="time" className="input-standard text-center font-bold" value={timeInputs.start} onChange={e=>setTimeInputs({...timeInputs, start: e.target.value})}/><span className="text-slate-300">-</span><input type="time" className="input-standard text-center font-bold" value={timeInputs.end} onChange={e=>setTimeInputs({...timeInputs, end: e.target.value})}/></div></div>
            </div>
            <div className="modal-footer">
               <button onClick={handleCompleteSubmit} disabled={isSubmitting} className="btn-primary w-full justify-center">{isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Speichern'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}