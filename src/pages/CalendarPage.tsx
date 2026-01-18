import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  X, UserPlus, User, Plus, Calendar as CalIcon, 
  Clock, MapPin, AlertTriangle, CheckCircle, Palmtree, Thermometer,
  Briefcase, ArrowRight, Trash2
} from 'lucide-react'; 
import toast, { Toaster } from 'react-hot-toast'; 
import api from '../lib/api';

// --- SETUP ---
const locales = { 'de': de };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const dragAndDropFn = (withDragAndDrop as any).default || withDragAndDrop;
const DnDCalendar = dragAndDropFn(Calendar);

// --- TYPEN ---
interface Employee { id: string; firstName: string; lastName: string; }
interface Service { id: string; name: string; duration?: number; }
interface Customer { id: string; companyName: string | null; lastName: string; firstName: string; }

interface Job {
  id: string;
  scheduledDate: string;
  customer: Customer;
  service: Service;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  assignments: { employee: Employee }[];
}

interface Absence {
   id: string;
   startDate: string;
   endDate: string;
   type: 'VACATION' | 'SICKNESS' | 'OTHER';
   employee: Employee;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: {
      type: 'JOB' | 'ABSENCE'; 
      data: Job | Absence;    
  };
}

export default function CalendarPage() {
  // --- STATE ---
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const [isLoading, setIsLoading] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);   

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [newJobData, setNewJobData] = useState({
    date: new Date(),
    customerId: '',
    serviceId: ''
  });

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, empRes, custRes, servRes, absRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/employees'),
        api.get('/customers'),
        api.get('/services'),
        api.get('/absences')
      ]);

      setEmployees(empRes.data);
      setCustomers(custRes.data);
      setServices(servRes.data);

      // 1. Jobs mappen
      const jobEvents: CalendarEvent[] = jobsRes.data.map((job: Job) => {
        const startDate = new Date(job.scheduledDate);
        const duration = job.service.duration || 120; 
        const endDate = new Date(startDate.getTime() + duration * 60000); 
        const customerName = job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`;

        return {
          title: `${job.service.name} - ${customerName}`,
          start: startDate,
          end: endDate,
          allDay: false,
          resource: { type: 'JOB', data: job },
        };
      });

      // 2. Abwesenheiten mappen
      const absenceEvents: CalendarEvent[] = absRes.data.map((abs: Absence) => {
         const start = new Date(abs.startDate); start.setHours(0,0,0);
         const end = new Date(abs.endDate); end.setHours(23,59,59);

         return {
             title: `${abs.employee.firstName}: ${abs.type === 'VACATION' ? 'Urlaub' : 'Krank'}`,
             start: start,
             end: end,
             allDay: true,
             resource: { type: 'ABSENCE', data: abs }
         };
      });

      setEvents([...jobEvents, ...absenceEvents]);
    } catch (error) {
      toast.error('Konnte Kalenderdaten nicht laden.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setNewJobData({ ...newJobData, date: start, customerId: '', serviceId: '' });
    setIsCreateModalOpen(true);
  };

  const handleCreateJob = async () => {
    if (!newJobData.customerId || !newJobData.serviceId) {
      toast.error("Bitte Kunde und Service auswählen");
      return;
    }
    
    setIsSaving(true);
    try {
      await api.post('/jobs', { 
        customerId: newJobData.customerId,
        serviceId: newJobData.serviceId,
        scheduledDate: newJobData.date
      });
      
      toast.success("Job erfolgreich erstellt!");
      setIsCreateModalOpen(false);
      fetchData(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Fehler beim Erstellen");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.resource.type === 'ABSENCE') {
       const abs = event.resource.data as Absence;
       toast(`${abs.employee.firstName} ist abwesend (${abs.type === 'VACATION' ? 'Urlaub' : 'Krank'})`, {
         icon: abs.type === 'VACATION' ? '🌴' : '🤒',
       });
       return;
    }
    setSelectedJob(event.resource.data as Job);
    setIsEditModalOpen(true);
  };

  const handleEventDrop = async ({ event, start }: any) => {
    if (event.resource.type === 'ABSENCE') {
      toast.error("Abwesenheiten können hier nicht verschoben werden.");
      return;
    }

    const job = event.resource.data as Job;
    const duration = event.end.getTime() - event.start.getTime();
    
    // Optimistic UI Update
    setEvents(prev => prev.map(e => {
        if (e.resource.type === 'JOB' && (e.resource.data as Job).id === job.id) {
            return { ...e, start, end: new Date(start.getTime() + duration) };
        }
        return e;
    }));

    try {
      await api.patch(`/jobs/${job.id}`, { scheduledDate: start });
      toast.success("Termin verschoben", { id: 'drag-toast' }); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Fehler beim Verschieben!");
      fetchData(); 
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedJob) return;
    try {
        await api.patch(`/jobs/${selectedJob.id}/status`, { status: newStatus });
        setSelectedJob({ ...selectedJob, status: newStatus as any });
        toast.success("Status aktualisiert");
        fetchData(); 
    } catch (error) { toast.error("Konnte Status nicht ändern"); }
  };

  const handleAssignEmployee = async (employeeId: string) => {
    if (!selectedJob || !employeeId) return;
    const toastId = toast.loading("Prüfe Verfügbarkeit...");

    try {
      await api.post(`/jobs/${selectedJob.id}/assign`, { employeeId });
      toast.success("Mitarbeiter zugewiesen!", { id: toastId });
      setIsEditModalOpen(false);
      fetchData(); 

    } catch (error: any) {
      const msg = error.response?.data?.message || "Fehler bei der Zuweisung";
      toast.error(msg, { id: toastId, duration: 4000 }); 
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!selectedJob) return;
    const previousAssignments = selectedJob.assignments;
    
    // Optimistic UI
    setSelectedJob({
        ...selectedJob,
        assignments: selectedJob.assignments.filter(a => a.employee.id !== employeeId)
    });

    try {
        await api.delete(`/jobs/${selectedJob.id}/assign`, { data: { employeeId } });
        toast.success("Mitarbeiter entfernt");
        fetchData(); 
    } catch (error) {
        setSelectedJob({ ...selectedJob, assignments: previousAssignments });
        toast.error("Konnte Mitarbeiter nicht entfernen");
    }
  };

  // --- CUSTOM EVENT COMPONENT ---
  const EventComponent = ({ event }: any) => {
      const isJob = event.resource.type === 'JOB';
      const data = event.resource.data;
      
      if (!isJob) {
          const isSick = data.type === 'SICKNESS';
          return (
              <div className="flex items-center gap-1.5 h-full w-full px-1 overflow-hidden">
                  {isSick ? <Thermometer size={12} className="shrink-0"/> : <Palmtree size={12} className="shrink-0"/>}
                  <span className="text-[11px] font-medium truncate">{event.title}</span>
              </div>
          );
      }

      return (
          <div className="flex flex-col h-full justify-center px-1.5 border-l-2 border-white/20">
              <div className="text-[11px] font-bold truncate flex items-center gap-1">
                  {data.status === 'COMPLETED' && <CheckCircle size={10} />}
                  {event.title}
              </div>
              <div className="text-[10px] opacity-90 truncate flex items-center gap-1">
                  <Clock size={9} />
                  {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
              </div>
          </div>
      );
  };

  // --- COLOR LOGIC (Das Wichtige!) ---
  const eventStyleGetter = (event: CalendarEvent) => {
    const type = event.resource.type;
    const data = event.resource.data;
    
    let backgroundColor = '#3b82f6'; // Default Blau

    if (type === 'JOB') {
        const job = data as Job;
        if (job.status === 'COMPLETED') {
            backgroundColor = '#10b981'; // Grün (Erledigt)
        } else if (job.status === 'CANCELLED') {
            backgroundColor = '#f43f5e'; // Rot (Storniert)
        } else if (job.assignments && job.assignments.length > 0) {
            backgroundColor = '#f59e0b'; // Orange (Zugewiesen)
        } else {
            backgroundColor = '#3b82f6'; // Blau (Offen)
        }
    } else {
        const abs = data as Absence;
        if (abs.type === 'VACATION') backgroundColor = '#8b5cf6'; // Lila (Urlaub)
        if (abs.type === 'SICKNESS') backgroundColor = '#ef4444'; // Rot (Krank)
    }

    return { 
        style: { 
            backgroundColor, 
            borderRadius: '6px', 
            border: 'none', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Shadow
            color: 'white',
            fontSize: '12px'
        } 
    };
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-5 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* --- Modern Header --- */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><CalIcon size={24} /></div>
                Einsatzplaner
            </h1>
            <p className="text-slate-500 text-sm mt-1 ml-1">
               {isLoading ? 'Lade Daten...' : `Planung für ${format(date, 'MMMM yyyy', { locale: de })}`}
            </p>
         </div>
         
         {/* Legende */}
         <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-inner">
             <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-blue-200"></div> Offen</div>
             <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-amber-200"></div> Zugewiesen</div>
             <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-emerald-200"></div> Erledigt</div>
             <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-rose-200"></div> Problem/Krank</div>
             <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-violet-500 rounded-full ring-2 ring-violet-200"></div> Urlaub</div>
         </div>
      </div>
      
      {/* --- Calendar Container --- */}
      <div className="flex-1 bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden">
        {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        )}
        
        <DnDCalendar
          localizer={localizer}
          events={events}
          view={view} 
          date={date}
          onView={setView}
          onNavigate={setDate}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop} 
          resizable={false}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture="de"
          messages={{ 
              next: "Weiter", previous: "Zurück", today: "Heute", 
              month: "Monat", week: "Woche", day: "Tag", agenda: "Liste" 
          }}
          eventPropGetter={eventStyleGetter}
          components={{ event: EventComponent }}
          onSelectEvent={handleSelectEvent}
          className="modern-calendar" // CSS Klasse für custom Styling falls nötig
        />
      </div>

      {/* --- CREATE MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><Plus size={18} /></div> 
                Neuer Auftrag
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-red-500 transition hover:bg-red-50 p-1 rounded-full">
                  <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl text-sm flex items-center gap-3 border border-blue-100 shadow-sm">
                 <CalIcon size={18} className="shrink-0"/>
                 <div>
                    <span className="block text-xs uppercase font-bold opacity-70">Gewähltes Datum</span>
                    <span className="font-semibold">{newJobData.date.toLocaleDateString('de-DE', { dateStyle: 'full' })}</span>
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kunde</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white shadow-sm"
                  onChange={(e) => setNewJobData({...newJobData, customerId: e.target.value})}
                  value={newJobData.customerId}
                >
                  <option value="">-- Bitte wählen --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.lastName}, ${c.firstName}`}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Service</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white shadow-sm"
                  onChange={(e) => setNewJobData({...newJobData, serviceId: e.target.value})}
                  value={newJobData.serviceId}
                >
                  <option value="">-- Bitte wählen --</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} {s.duration ? `(${s.duration} min)` : ''}</option>)}
                </select>
              </div>

              <div className="pt-4">
                  <button 
                    onClick={handleCreateJob}
                    disabled={isSaving}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Auftrag erstellen'}
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden border border-white/50">
             
             {/* Modal Header */}
             <div className="bg-slate-50/80 backdrop-blur px-6 py-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                     <span className="bg-white border border-slate-200 text-slate-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider shadow-sm">
                        Job-ID: {selectedJob.id.slice(0,6)}
                     </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 leading-tight">{selectedJob.service.name}</h2>
                <div className="flex items-center gap-1.5 text-slate-500 mt-1 text-sm">
                    <MapPin size={14} className="text-blue-500"/>
                    <span className="font-medium">
                       {selectedJob.customer.companyName || `${selectedJob.customer.firstName} ${selectedJob.customer.lastName}`}
                    </span>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-2 rounded-full shadow-sm border border-slate-100 transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 bg-white">
                
                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 flex items-center gap-1"><Clock size={10}/> Zeitplan</p>
                        <p className="font-bold text-slate-700">
                            {new Date(selectedJob.scheduledDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {new Date(selectedJob.scheduledDate).toLocaleTimeString('de-DE', { hour: '2-digit', minute:'2-digit' })} Uhr
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 flex items-center gap-1"><AlertTriangle size={10}/> Status</p>
                        <select 
                            value={selectedJob.status} 
                            onChange={(e) => handleStatusChange(e.target.value)} 
                            className={`w-full border rounded-lg px-2 py-1.5 text-sm outline-none font-bold cursor-pointer transition
                                ${selectedJob.status === 'COMPLETED' ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : 
                                  selectedJob.status === 'CANCELLED' ? 'text-rose-700 border-rose-200 bg-rose-50' : 'text-blue-700 border-blue-200 bg-blue-50'}`}
                        >
                            <option value="SCHEDULED">Geplant 🕒</option>
                            <option value="COMPLETED">Erledigt ✅</option>
                            <option value="CANCELLED">Storniert ❌</option>
                        </select>
                    </div>
                </div>

                <div className="w-full h-px bg-slate-100 my-2"></div>

                {/* Team Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                           <UserPlus className="h-4 w-4 text-indigo-500" /> Team Zuweisung
                        </h3>
                        {selectedJob.assignments.length > 0 && 
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                {selectedJob.assignments.length} Zugewiesen
                            </span>
                        }
                    </div>

                    {/* Assigned List */}
                    <div className="flex flex-col gap-2 mb-4">
                        {selectedJob.assignments.length > 0 ? (
                            selectedJob.assignments.map((a, i) => (
                                <div key={i} className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-indigo-200 transition group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                                            {a.employee.firstName.charAt(0)}{a.employee.lastName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">{a.employee.firstName} {a.employee.lastName}</p>
                                            <p className="text-[10px] text-slate-400">Reinigungskraft</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveEmployee(a.employee.id)}
                                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition"
                                        title="Entfernen"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        ) : ( 
                            <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 gap-2">
                                <Briefcase size={24} className="opacity-20"/>
                                <span className="text-xs font-medium">Noch niemand zugewiesen</span>
                            </div>
                        )}
                    </div>

                    {/* Assign Action */}
                    <div className="relative group">
                        <select 
                           className="w-full p-3.5 pl-11 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none cursor-pointer text-sm font-medium text-slate-700 shadow-sm"
                           onChange={(e) => handleAssignEmployee(e.target.value)} 
                           value=""
                        >
                            <option value="" disabled>+ Mitarbeiter hinzufügen...</option>
                            {employees.map(emp => ( <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option> ))}
                        </select>
                        <UserPlus className="absolute left-3.5 top-3.5 text-indigo-500 w-5 h-5 pointer-events-none group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1.5 ml-1">
                        <CheckCircle size={10} className="text-emerald-500"/> Automatische Konfliktprüfung aktiviert
                    </p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}