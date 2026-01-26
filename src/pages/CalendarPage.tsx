import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  X, Plus, Calendar as CalIcon, 
  Clock, MapPin, CheckCircle, Palmtree, Thermometer,
  Trash2, Loader2, Users, Briefcase, ChevronRight, Sparkles, Navigation, CalendarDays
} from 'lucide-react'; 
import toast from 'react-hot-toast'; 
import api from '../lib/api';

const locales = { 'de': de };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const dragAndDropFn = (withDragAndDrop as any).default || withDragAndDrop;
const DnDCalendar = dragAndDropFn(Calendar);

// --- TYPEN ---
interface Employee { id: string; firstName: string; lastName: string; }
interface Service { id: string; name: string; duration?: number; priceNet: number | string; }
interface Customer { id: string; companyName: string | null; lastName: string; firstName: string; }
interface Job {
  id: string;
  scheduledDate: string;
  customer: Customer;
  service: Service;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  address: { street: string; city: string };
  assignments: { employee: Employee }[];
}
interface Absence { id: string; startDate: string; endDate: string; type: 'VACATION' | 'SICKNESS' | 'OTHER'; employee: Employee; }
interface CalendarEvent { title: string; start: Date; end: Date; allDay?: boolean; resource: { type: 'JOB' | 'ABSENCE'; data: Job | Absence; }; }

// --- CUSTOM EVENT COMPONENT ---
const EventComponent = ({ event }: any) => {
    const isJob = event.resource.type === 'JOB';
    const data = event.resource.data;
    
    if (!isJob) {
        return (
            <div className="flex items-center gap-1.5 h-full w-full px-2 overflow-hidden italic opacity-90">
                {data.type === 'SICKNESS' ? <Thermometer size={12}/> : <Palmtree size={12}/>}
                <span className="text-[10px] font-black truncate tracking-tight uppercase">{event.title}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full justify-center px-2 py-1 border-l-[3px] border-black/10 text-left">
            <div className="text-[10px] font-black truncate flex items-center gap-1 leading-tight uppercase tracking-tighter">
                {data.status === 'COMPLETED' && <CheckCircle size={10} className="text-white fill-emerald-500" />}
                {event.title}
            </div>
            <div className="text-[8px] font-bold opacity-70 truncate flex items-center gap-1 mt-0.5 uppercase tracking-widest text-left">
                {format(event.start, 'HH:mm')} • {data.assignments.length} P.
            </div>
        </div>
    );
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);   

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [newJobData, setNewJobData] = useState({ date: new Date(), time: '08:00', customerId: '', serviceId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, empRes, custRes, servRes, absRes] = await Promise.all([
        api.get('/jobs'), api.get('/employees'), api.get('/customers'), api.get('/services'), api.get('/absences')
      ]);
      setEmployees(empRes.data);
      setCustomers(custRes.data);
      setServices(servRes.data);

      const jobEvents = jobsRes.data.map((job: Job) => ({
          title: `${job.customer.companyName || job.customer.lastName}`,
          start: new Date(job.scheduledDate),
          end: new Date(new Date(job.scheduledDate).getTime() + (job.service.duration || 120) * 60000),
          resource: { type: 'JOB', data: job }
      }));

      const absenceEvents = absRes.data.map((abs: Absence) => ({
          title: `${abs.employee.firstName}: ${abs.type === 'VACATION' ? 'Urlaub' : 'Krank'}`,
          start: new Date(abs.startDate),
          end: new Date(abs.endDate),
          allDay: true,
          resource: { type: 'ABSENCE', data: abs }
      }));

      setEvents([...jobEvents, ...absenceEvents]);
    } catch (e) { toast.error('Synchronisierung fehlgeschlagen'); } finally { setIsLoading(false); }
  };

  const handleEventDrop = async ({ event, start }: any) => {
    if (event.resource.type === 'ABSENCE') return toast.error("Abwesenheiten sind fixiert.");
    const job = event.resource.data as Job;
    const tid = toast.loading("Verschiebe Termin...");
    try {
      await api.patch(`/jobs/${job.id}`, { scheduledDate: start });
      toast.success("Einsatz aktualisiert", { id: tid });
      fetchData();
    } catch (e) { toast.error("Fehler beim Verschieben", { id: tid }); }
  };

  const handleJobUpdate = async (updates: { status?: string; scheduledDate?: Date }) => {
    if (!selectedJob) return;
    try {
      const payload = {
        status: updates.status || selectedJob.status,
        scheduledDate: updates.scheduledDate ? updates.scheduledDate.toISOString() : selectedJob.scheduledDate
      };
      await api.patch(`/jobs/${selectedJob.id}`, payload);
      toast.success("Änderung gespeichert");
      fetchData();
      setIsEditModalOpen(false);
    } catch (e) { toast.error("Update fehlgeschlagen"); }
  };

  const handleAssignEmployee = async (employeeId: string) => {
    if (!selectedJob || !employeeId) return;
    try {
      await api.post(`/jobs/${selectedJob.id}/assign`, { employeeId });
      toast.success("Mitarbeiter zugewiesen");
      fetchData();
      setIsEditModalOpen(false);
    } catch (e: any) { toast.error(e.response?.data?.message || "Fehler"); }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!selectedJob) return;
    try {
      await api.delete(`/jobs/${selectedJob.id}/assign`, { data: { employeeId } });
      toast.success("Mitarbeiter entfernt");
      fetchData();
      setIsEditModalOpen(false);
    } catch (error) { toast.error("Fehler"); }
  };

  const handleCreateJob = async () => {
    if (!newJobData.customerId || !newJobData.serviceId) return toast.error("Kunde & Leistung wählen");
    setIsSaving(true);
    try {
      const [hours, minutes] = newJobData.time.split(':');
      const combinedDate = new Date(newJobData.date);
      combinedDate.setHours(parseInt(hours), parseInt(minutes), 0);
      await api.post('/jobs', { customerId: newJobData.customerId, serviceId: newJobData.serviceId, scheduledDate: combinedDate.toISOString() });
      toast.success("Einsatz erfolgreich angelegt");
      setIsCreateModalOpen(false);
      fetchData();
    } catch (e) { toast.error("Planungsfehler"); } finally { setIsSaving(false); }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#2563eb';
    if (event.resource.type === 'JOB') {
        const job = event.resource.data as Job;
        if (job.status === 'COMPLETED') backgroundColor = '#10b981';
        else if (job.status === 'CANCELLED') backgroundColor = '#ef4444';
        else if (job.assignments.length > 0) backgroundColor = '#f59e0b';
    } else {
        backgroundColor = (event.resource.data as Absence).type === 'VACATION' ? '#8b5cf6' : '#f43f5e';
    }
    return { style: { backgroundColor, borderRadius: '6px', border: 'none', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } };
  };

  return (
    <div className="page-container h-screen flex flex-col !p-0 overflow-hidden bg-slate-50">
      
      {/* HEADER / TOOLBAR */}
      <div className="bg-white px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-slate-200 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                <CalendarDays size={24} />
            </div>
            <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1 uppercase">Dienstplan</h1>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Live Operations
                </p>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-[9px] font-black text-slate-600 shadow-sm uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Offen</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-[9px] font-black text-slate-600 shadow-sm uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div> Aktiv</span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-[9px] font-black text-slate-600 shadow-sm uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Fertig</span>
            </div>
            <button onClick={() => setDate(new Date())} className="btn-secondary !py-2.5 !px-5 text-[10px] font-black uppercase tracking-widest bg-white shadow-md">Heute</button>
        </div>
      </div>

      {/* CALENDAR ENGINE */}
      <div className="flex-1 relative p-4 lg:p-6">
        <div className="h-full bg-white rounded-[2rem] shadow-xl shadow-slate-200 border border-white p-4 relative overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 z-30 backdrop-blur-sm flex items-center justify-center rounded-[2rem]">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            )}
            <DnDCalendar
              localizer={localizer}
              events={events}
              date={date}
              onNavigate={setDate}
              view={view}
              onView={setView}
              selectable
              onSelectSlot={({ start }: { start: Date }) => { setNewJobData({ ...newJobData, date: start }); setIsCreateModalOpen(true); }}
              onSelectEvent={(e: any) => { if(e.resource.type === 'JOB') { setSelectedJob(e.resource.data); setIsEditModalOpen(true); } }}
              onEventDrop={handleEventDrop}
              eventPropGetter={eventStyleGetter}
              components={{ event: EventComponent }}
              style={{ height: '100%' }}
              culture="de"
              messages={{ next: "Vor", previous: "Zurück", today: "Heute", month: "Monat", week: "Woche", day: "Tag", agenda: "Liste" }}
            />
        </div>
      </div>

      {/* MODAL: CREATE JOB (KOMPAKT) */}
      {isCreateModalOpen && (
          <div className="modal-overlay px-4">
              <div className="modal-content !max-w-md animate-in zoom-in-95 duration-200 shadow-2xl">
                  <div className="modal-header !p-5 border-b border-slate-100 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg"><Plus size={20} /></div>
                        <h2 className="text-base font-black uppercase tracking-tight text-slate-800">Einsatz planen</h2>
                      </div>
                      <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><X size={20}/></button>
                  </div>

                  <div className="modal-body space-y-5 !p-6 text-left">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <label className="label-caps !text-[9px] mb-1 !ml-0 text-blue-500">Datum</label>
                            <div className="text-sm font-black text-slate-800">{format(newJobData.date, 'dd.MM.yyyy')}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <label className="label-caps !text-[9px] mb-1 !ml-0 text-blue-500">Startzeit</label>
                            <input type="time" value={newJobData.time} onChange={e => setNewJobData({...newJobData, time: e.target.value})} className="bg-transparent font-black text-sm text-slate-800 outline-none w-full cursor-pointer" />
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="label-caps !text-[9px] !ml-0">Kunde / Objekt</label>
                        <select className="input-standard !py-2.5 !text-sm font-bold" onChange={e => setNewJobData({...newJobData, customerId: e.target.value})} value={newJobData.customerId}>
                            <option value="">Wählen...</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.lastName}, ${c.firstName}`}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="label-caps !text-[9px] !ml-0">Dienstleistung</label>
                        <select className="input-standard !py-2.5 !text-sm font-bold" onChange={e => setNewJobData({...newJobData, serviceId: e.target.value})} value={newJobData.serviceId}>
                            <option value="">Wählen...</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <button onClick={handleCreateJob} disabled={isSaving} className="btn-primary w-full justify-center !py-3.5 shadow-xl shadow-blue-100 uppercase tracking-widest font-black text-[10px] mt-2">
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Termin festlegen'}
                    </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: EDIT JOB (KOMPAKT) */}
      {isEditModalOpen && selectedJob && (
          <div className="modal-overlay px-4">
              <div className="modal-content !max-w-lg animate-in zoom-in-95 duration-200 shadow-2xl">
                  <div className="p-5 border-b border-slate-100 bg-slate-900 text-white rounded-t-[1.5rem] flex justify-between items-center">
                      <div className="text-left overflow-hidden">
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">{selectedJob.service.name}</span>
                          <h2 className="text-lg font-black text-white truncate leading-tight tracking-tight">{selectedJob.customer.companyName || selectedJob.customer.lastName}</h2>
                      </div>
                      <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors shrink-0"><X size={20}/></button>
                  </div>

                  <div className="modal-body space-y-6 !p-6 text-left max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm group">
                            <label className="label-caps !text-[9px] !ml-0 text-blue-600 mb-1.5">Auftragsstatus</label>
                            <select value={selectedJob.status} onChange={e => handleJobUpdate({ status: e.target.value })} className="bg-transparent font-black text-[11px] uppercase tracking-widest outline-none cursor-pointer w-full text-slate-800">
                                <option value="SCHEDULED">Geplant</option>
                                <option value="IN_PROGRESS">Aktiv</option>
                                <option value="COMPLETED">Fertig</option>
                                <option value="CANCELLED">Storno</option>
                            </select>
                        </div>
                        <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                            <label className="label-caps !text-[9px] !ml-0 text-slate-400 mb-1.5">Beginn</label>
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-blue-500" />
                                <input type="time" defaultValue={format(new Date(selectedJob.scheduledDate), 'HH:mm')} onBlur={(e) => {
                                    const [h, m] = e.target.value.split(':');
                                    const d = new Date(selectedJob.scheduledDate);
                                    d.setHours(parseInt(h), parseInt(m));
                                    handleJobUpdate({ scheduledDate: d });
                                }} className="bg-transparent font-black text-sm text-slate-800 outline-none w-full cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100 group transition-all hover:bg-blue-50">
                        <div className="overflow-hidden flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 shrink-0"><MapPin size={16} /></div>
                            <div className="overflow-hidden text-left">
                                <p className="text-[11px] font-black text-slate-700 truncate leading-tight uppercase tracking-tight">{selectedJob.address.street}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{selectedJob.address.city}</p>
                            </div>
                        </div>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.address.street + ' ' + selectedJob.address.city)}`} target="_blank" rel="noreferrer" className="p-2.5 bg-white text-blue-600 rounded-xl shadow-sm border border-blue-100 active:scale-90 transition-all"><Navigation size={18} fill="currentColor" /></a>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1 text-left">
                            <h3 className="label-caps !text-[9px] !ml-0 !mb-0 text-slate-800 flex items-center gap-2"><Users size={14} className="text-blue-600" /> Team-Besetzung</h3>
                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{selectedJob.assignments.length} Personen</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {selectedJob.assignments.map(a => (
                                <div key={a.employee.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 group/item hover:bg-white hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[10px] uppercase shadow-sm italic">{a.employee.firstName.charAt(0)}{a.employee.lastName.charAt(0)}</div>
                                        <span className="text-xs font-black text-slate-700">{a.employee.firstName} {a.employee.lastName}</span>
                                    </div>
                                    <button onClick={() => handleRemoveEmployee(a.employee.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <div className="relative mt-1">
                                <select onChange={e => handleAssignEmployee(e.target.value)} value="" className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full">
                                    <option value="">Mitglied hinzufügen...</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                                </select>
                                <div className="w-full py-3 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center justify-center gap-2">
                                    <Plus size={14} /> Mitarbeiter hinzufügen
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-[1.5rem]">
                      <button onClick={() => setIsEditModalOpen(false)} className="btn-secondary w-full justify-center !py-3.5 font-black text-[10px] uppercase tracking-widest shadow-sm">Fenster schließen</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}