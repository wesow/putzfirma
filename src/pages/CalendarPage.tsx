import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  X, UserPlus, User, PlusCircle, Calendar as CalIcon, 
  Clock, MapPin, AlertTriangle, CheckCircle, Briefcase, Palmtree, Thermometer
} from 'lucide-react'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import toast, { Toaster } from 'react-hot-toast'; // HIER: Die neue Library
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

  // Modals & Loading
  const [isLoading, setIsLoading] = useState(false); // Globaler Ladezustand
  const [isSaving, setIsSaving] = useState(false);   // Speichern Ladezustand

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
        // Dauer aus Service oder 2h Fallback
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
         // Wir setzen die Uhrzeit auf 00:00 bis 23:59 damit es den Tag füllt
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
      toast.error('Daten konnten nicht geladen werden.');
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
      fetchData(); // Neu laden um ID etc. zu bekommen
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
    const oldStart = event.start;

    // Optimistisch: UI sofort updaten
    const duration = event.end.getTime() - event.start.getTime();
    setEvents(prev => prev.map(e => {
        if (e.resource.type === 'JOB' && (e.resource.data as Job).id === job.id) {
            return { ...e, start, end: new Date(start.getTime() + duration) };
        }
        return e;
    }));

    // API Call
    try {
      await api.patch(`/jobs/${job.id}`, { scheduledDate: start });
      toast.success("Termin verschoben", { id: 'drag-toast' }); // Verhindert Spam
    } catch (error: any) {
      // Rollback bei Fehler
      toast.error(error.response?.data?.message || "Fehler beim Verschieben!");
      fetchData(); // Reset
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
    
    // Toast Loading starten
    const toastId = toast.loading("Prüfe Verfügbarkeit...");

    try {
      await api.post(`/jobs/${selectedJob.id}/assign`, { employeeId });
      
      toast.success("Mitarbeiter zugewiesen!", { id: toastId });
      setIsEditModalOpen(false);
      fetchData(); 

    } catch (error: any) {
      // HIER kommt deine Backend Nachricht ("Konflikt! Mitarbeiter ist krank...")
      const msg = error.response?.data?.message || "Fehler bei der Zuweisung";
      toast.error(msg, { id: toastId, duration: 5000 }); // 5 Sekunden anzeigen
    }
  };
const handleRemoveEmployee = async (employeeId: string) => {
    if (!selectedJob) return;
    
    // Kleiner Trick: UI sofort updaten (Optimistisch), damit es sich schnell anfühlt
    const previousAssignments = selectedJob.assignments;
    setSelectedJob({
        ...selectedJob,
        assignments: selectedJob.assignments.filter(a => a.employee.id !== employeeId)
    });

    try {
        // DELETE Request senden (Body muss bei axios/fetch oft speziell übergeben werden bei DELETE)
        await api.delete(`/jobs/${selectedJob.id}/assign`, { 
            data: { employeeId } // WICHTIG: Bei DELETE muss der Body oft in 'data' liegen
        });
        toast.success("Mitarbeiter entfernt");
        fetchData(); // Daten im Hintergrund neu laden
    } catch (error) {
        // Falls Fehler: Rückgängig machen
        setSelectedJob({ ...selectedJob, assignments: previousAssignments });
        toast.error("Konnte Mitarbeiter nicht entfernen");
    }
  };
  // --- CUSTOM EVENT COMPONENT (Für schöneren Look im Kalender) ---
  const EventComponent = ({ event }: any) => {
      const isJob = event.resource.type === 'JOB';
      const data = event.resource.data;
      
      if (!isJob) {
          // Abwesenheit
          const isSick = data.type === 'SICKNESS';
          return (
              <div className="flex items-center gap-1 h-full w-full">
                  {isSick ? <Thermometer size={14} /> : <Palmtree size={14} />}
                  <span className="text-xs font-bold truncate">{event.title}</span>
              </div>
          );
      }

      // Job
      return (
          <div className="flex flex-col h-full justify-center px-1">
              <div className="text-xs font-bold truncate flex items-center gap-1">
                  {data.status === 'COMPLETED' && <CheckCircle size={10} />}
                  {event.title}
              </div>
              <div className="text-[10px] opacity-90 truncate flex items-center gap-1">
                  <Clock size={10} />
                  {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
              </div>
          </div>
      );
  };


  // --- STYLING (Hintergrundfarben) ---
  const eventStyleGetter = (event: CalendarEvent) => {
    const type = event.resource.type;
    const data = event.resource.data;
    let backgroundColor = '#3b82f6'; 

    if (type === 'JOB') {
        const job = data as Job;
        if (job.status === 'COMPLETED') backgroundColor = '#10b981'; // Emerald 500
        if (job.status === 'CANCELLED') backgroundColor = '#ef4444'; // Red 500
        if (job.status === 'SCHEDULED') backgroundColor = '#2563eb'; // Blue 600
    } else {
        const abs = data as Absence;
        if (abs.type === 'VACATION') backgroundColor = '#f59e0b'; // Amber 500
        if (abs.type === 'SICKNESS') backgroundColor = '#ef4444'; // Red 500
    }

    return { 
        style: { 
            backgroundColor, 
            borderRadius: '6px', 
            border: 'none', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        } 
    };
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
      {/* Toast Container für Notifications */}
      <Toaster position="top-right" />

      {/* --- Header Area --- */}
      <div className="flex justify-between items-end bg-white p-4 rounded-xl shadow-sm border border-slate-200">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <CalIcon className="text-blue-600" /> Einsatzplaner
            </h1>
            <p className="text-slate-500 text-sm mt-1">
               {isLoading ? 'Lade Daten...' : `${events.length} Einträge geladen`}
            </p>
         </div>
         
         <div className="flex gap-6 text-xs font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></div> Geplant</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div> Erledigt</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div> Urlaub</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div> Krank</div>
         </div>
      </div>
      
      {/* --- Calendar Area --- */}
      <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative">
        {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
              next: "Weiter >", previous: "< Zurück", today: "Heute", 
              month: "Monat", week: "Woche", day: "Tag", agenda: "Liste" 
          }}
          eventPropGetter={eventStyleGetter}
          components={{ event: EventComponent }} // Unser Custom Design
          onSelectEvent={handleSelectEvent}
        />
      </div>

      {/* --- MODAL 1: JOB ERSTELLEN --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="text-blue-600 w-5 h-5" /> Neuer Auftrag
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-red-500 transition">
                  <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-blue-100">
                 <CalIcon size={16} />
                 <span>Datum: <strong>{newJobData.date.toLocaleDateString('de-DE', { dateStyle: 'full' })}</strong></span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kunde</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                  onChange={(e) => setNewJobData({...newJobData, customerId: e.target.value})}
                  value={newJobData.customerId}
                >
                  <option value="">-- Bitte wählen --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.lastName}, ${c.firstName}`}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service / Leistung</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                  onChange={(e) => setNewJobData({...newJobData, serviceId: e.target.value})}
                  value={newJobData.serviceId}
                >
                  <option value="">-- Bitte wählen --</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} {s.duration ? `(${s.duration} min)` : ''}</option>)}
                </select>
              </div>

              <div className="pt-2">
                  <button 
                    onClick={handleCreateJob}
                    disabled={isSaving}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Auftrag anlegen'}
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: JOB BEARBEITEN --- */}
      {isEditModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
             
             {/* Header */}
             <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                     <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wide">Job-Details</span>
                     <span className="text-slate-400 text-xs">ID: {selectedJob.id.slice(0,6)}...</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">{selectedJob.service.name}</h2>
                <div className="flex items-center gap-1 text-slate-600 mt-1">
                    <MapPin size={14} />
                    <p className="font-medium">
                       {selectedJob.customer.companyName || `${selectedJob.customer.firstName} ${selectedJob.customer.lastName}`}
                    </p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-200 p-2 rounded-full shadow-sm transition">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
                {/* Grid Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex items-center gap-1"><CalIcon size={10}/> Geplant für</p>
                        <p className="font-semibold text-slate-700">
                            {new Date(selectedJob.scheduledDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'long' })}
                        </p>
                        <p className="text-sm text-slate-500">
                            {new Date(selectedJob.scheduledDate).toLocaleTimeString('de-DE', { hour: '2-digit', minute:'2-digit' })} Uhr
                        </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex items-center gap-1"><AlertTriangle size={10}/> Status</p>
                        <select 
                            value={selectedJob.status} 
                            onChange={(e) => handleStatusChange(e.target.value)} 
                            className={`w-full border rounded px-2 py-1 text-sm outline-none font-semibold cursor-pointer
                                ${selectedJob.status === 'COMPLETED' ? 'text-green-600 border-green-200 bg-green-50' : 
                                  selectedJob.status === 'CANCELLED' ? 'text-red-600 border-red-200 bg-red-50' : 'text-blue-600 border-blue-200 bg-white'}`}
                        >
                            <option value="SCHEDULED">Geplant 🕒</option>
                            <option value="COMPLETED">Erledigt ✅</option>
                            <option value="CANCELLED">Storniert ❌</option>
                        </select>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Team Zuweisung */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                           <UserPlus className="h-4 w-4 text-indigo-600" /> Mitarbeiter zuweisen
                        </h3>
                        {selectedJob.assignments.length > 0 && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Zugewiesen</span>}
                    </div>

                {/* Liste der aktuellen Mitarbeiter */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {selectedJob.assignments.length > 0 ? (
                        selectedJob.assignments.map((a, i) => (
                            <div key={i} className="group flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-indigo-100 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                                <div className="w-5 h-5 bg-indigo-200 group-hover:bg-red-200 rounded-full flex items-center justify-center text-[10px] text-indigo-800 group-hover:text-red-800">
                                    {a.employee.firstName.charAt(0)}{a.employee.lastName.charAt(0)}
                                </div>
                                <span>{a.employee.firstName} {a.employee.lastName}</span>
                                
                                {/* Das Löschen Icon (erscheint nur beim Hovern oder immer, je nach Geschmack) */}
                                <button 
                                    onClick={() => handleRemoveEmployee(a.employee.id)}
                                    className="ml-1 text-indigo-400 hover:text-red-600 focus:outline-none"
                                    title="Entfernen"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))
                    ) : ( 
                        <div className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-400 text-sm">
                            Noch kein Mitarbeiter für diesen Job eingeteilt.
                        </div>
                    )}
                </div>

                    {/* Dropdown */}
                    <div className="relative">
                        <select 
                           className="w-full p-3 pl-10 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none cursor-pointer hover:border-indigo-400"
                           onChange={(e) => handleAssignEmployee(e.target.value)} 
                           value=""
                        >
                            <option value="" disabled>+ Jemanden auswählen...</option>
                            {employees.map(emp => ( <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option> ))}
                        </select>
                        <User className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 ml-1">
                        * Wählt automatisch aus, ob der Mitarbeiter verfügbar ist (inkl. Krankheits-Check).
                    </p>
                </div>
            </div>
            
            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-600 hover:text-slate-800 font-medium px-4 py-2 hover:bg-slate-200 rounded-lg transition">
                    Schließen
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}