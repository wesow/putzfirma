import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View, type EventPropGetter } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { X, UserPlus, User, PlusCircle } from 'lucide-react'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../lib/api';

const locales = { 'de': de };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Fix für Import-Problem
const dragAndDropFn = (withDragAndDrop as any).default || withDragAndDrop;
const DnDCalendar = dragAndDropFn(Calendar);

// --- TYPEN ---
interface Employee { id: string; firstName: string; lastName: string; }
interface Service { id: string; name: string; }
interface Customer { id: string; companyName: string | null; lastName: string; firstName: string; }
interface Job {
  id: string;
  scheduledDate: string;
  customer: Customer;
  service: { name: string };
  status: string;
  assignments: { employee: Employee }[];
}
interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource: Job;
}

export default function CalendarPage() {
  // Daten State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]); // NEU
  const [services, setServices] = useState<Service[]>([]);    // NEU
  
  // Kalender State
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Modals State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // NEU: State für das Erstellen-Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newJobData, setNewJobData] = useState({
    date: new Date(),
    customerId: '',
    serviceId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Wir laden ALLES was wir brauchen parallel
      const [jobsRes, empRes, custRes, servRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/employees'),
        api.get('/customers'), // NEU
        api.get('/services')   // NEU
      ]);

      const jobs: Job[] = jobsRes.data;
      setEmployees(empRes.data);
      setCustomers(custRes.data);
      setServices(servRes.data);

      const mappedEvents: CalendarEvent[] = jobs.map((job) => {
        const startDate = new Date(job.scheduledDate);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); 
        const customerName = job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`;

        return {
          title: `${job.service.name} - ${customerName}`,
          start: startDate,
          end: endDate,
          resource: job,
        };
      });

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    }
  };

  // --- HANDLER ---

  // 1. Klick auf leeres Feld (Erstellen)
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setNewJobData({ ...newJobData, date: start, customerId: '', serviceId: '' });
    setIsCreateModalOpen(true);
  };

  // 2. Neuen Job speichern
  const handleCreateJob = async () => {
    if (!newJobData.customerId || !newJobData.serviceId) {
      alert("Bitte Kunde und Service auswählen");
      return;
    }
    try {
      await api.post('/jobs/manual', {
        customerId: newJobData.customerId,
        serviceId: newJobData.serviceId,
        scheduledDate: newJobData.date
      });
      alert("Job erstellt!");
      setIsCreateModalOpen(false);
      fetchData(); // Neu laden
    } catch (error: any) {
      alert(error.response?.data?.message || "Fehler beim Erstellen");
    }
  };

  // 3. Klick auf Job (Bearbeiten)
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedJob(event.resource);
    setIsEditModalOpen(true);
  };

  // 4. Drop (Verschieben)
  const handleEventDrop = async ({ event, start }: any) => {
    const job = event.resource as Job;
    // Optimistisch
    setEvents(prev => prev.map(e => e.resource.id === job.id ? { ...e, start, end: new Date(start.getTime() + 2*3600000) } : e));
    try {
      await api.patch(`/jobs/${job.id}`, { scheduledDate: start });
    } catch (error) {
      alert("Fehler beim Verschieben!");
      fetchData(); 
    }
  };

  // Helpers für Updates im Edit Modal
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedJob) return;
    try {
        await api.patch(`/jobs/${selectedJob.id}/status`, { status: newStatus });
        setSelectedJob({ ...selectedJob, status: newStatus });
        fetchData(); 
    } catch (error) { alert("Fehler"); }
  };

  const handleAssignEmployee = async (employeeId: string) => {
    if (!selectedJob || !employeeId) return;
    try {
      await api.post(`/jobs/${selectedJob.id}/assign`, { employeeId });
      alert("Zugewiesen!");
      setIsEditModalOpen(false);
      fetchData(); 
    } catch (error) { alert("Fehler"); }
  };

  const eventStyleGetter: EventPropGetter<CalendarEvent> = (event) => {
    let backgroundColor = '#3b82f6';
    if (event.resource.status === 'COMPLETED') backgroundColor = '#10b981';
    if (event.resource.status === 'CANCELLED') backgroundColor = '#ef4444';
    return { style: { backgroundColor, borderRadius: '4px', opacity: 0.9, color: 'white', border: '0px', display: 'block' } };
  };

  return (
    <div className="h-[calc(100vh-120px)] bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col relative">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Einsatzplaner</h1>
      
      <div className="flex-1">
        <DnDCalendar
          localizer={localizer}
          events={events}
          view={view} 
          date={date}
          onView={setView}
          onNavigate={setDate}
          
          selectable={true} // <--- WICHTIG: Erlaubt Auswählen von leeren Feldern
          onSelectSlot={handleSelectSlot} // <--- Handler dafür
          
          onEventDrop={handleEventDrop} 
          resizable={false}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture="de"
          messages={{ next: "Vor", previous: "Zurück", today: "Heute", month: "Monat", week: "Woche", day: "Tag", agenda: "Liste" }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      {/* --- MODAL 1: JOB ERSTELLEN --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <PlusCircle className="text-blue-600" /> Neuer Job
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)}><X className="text-slate-400" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Datum</label>
                <input 
                  type="text" 
                  disabled 
                  value={newJobData.date.toLocaleDateString('de-DE')} 
                  className="w-full bg-slate-100 border border-slate-300 rounded p-2 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kunde</label>
                <select 
                  className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setNewJobData({...newJobData, customerId: e.target.value})}
                  value={newJobData.customerId}
                >
                  <option value="">Wählen...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName || `${c.lastName}, ${c.firstName}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service</label>
                <select 
                  className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setNewJobData({...newJobData, serviceId: e.target.value})}
                  value={newJobData.serviceId}
                >
                  <option value="">Wählen...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleCreateJob}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 mt-4"
              >
                Job erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: JOB BEARBEITEN (Wie vorher) --- */}
      {isEditModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
             <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedJob.service.name}</h2>
                <p className="text-slate-500 font-medium">
                   {selectedJob.customer.companyName || `${selectedJob.customer.firstName} ${selectedJob.customer.lastName}`}
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Datum</p>
                        <p className="font-medium text-slate-700">
                            {new Date(selectedJob.scheduledDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'long' })}
                        </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Status</p>
                        <select value={selectedJob.status} onChange={(e) => handleStatusChange(e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 font-medium">
                            <option value="SCHEDULED">Geplant 🕒</option>
                            <option value="COMPLETED">Erledigt ✅</option>
                            <option value="CANCELLED">Storniert ❌</option>
                        </select>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                        <h3 className="font-bold text-slate-800">Team Zuweisung</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {selectedJob.assignments.length > 0 ? (
                            selectedJob.assignments.map((a, i) => (
                                <span key={i} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                                    <User size={14} /> {a.employee.firstName}
                                </span>
                            ))
                        ) : ( <span className="text-sm text-slate-400 italic">Noch niemand zugewiesen</span> )}
                    </div>
                    <select className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition" onChange={(e) => handleAssignEmployee(e.target.value)} value="">
                        <option value="" disabled>+ Mitarbeiter hinzufügen...</option>
                        {employees.map(emp => ( <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option> ))}
                    </select>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}