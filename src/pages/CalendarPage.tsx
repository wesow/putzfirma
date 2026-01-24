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
  Trash2, Loader2, Info 
} from 'lucide-react'; 
import toast from 'react-hot-toast'; 
import api from '../lib/api';

// --- SETUP ---
const locales = { 'de': de };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const dragAndDropFn = (withDragAndDrop as any).default || withDragAndDrop;
const DnDCalendar = dragAndDropFn(Calendar);

// --- TYPEN ---
interface Employee { id: string; firstName: string; lastName: string; }
interface Service { 
  id: string; 
  name: string; 
  duration?: number; 
  priceNet: number | string; // Erlaube beides vom Backend
}
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

// --- HELPER COMPONENT (AUSSERHALB) ---
const EventComponent = ({ event }: any) => {
    const isJob = event.resource.type === 'JOB';
    const data = event.resource.data;
    
    if (!isJob) {
        return (
            <div className="flex items-center gap-1.5 h-full w-full px-2 overflow-hidden italic opacity-90">
                {data.type === 'SICKNESS' ? <Thermometer size={12}/> : <Palmtree size={12}/>}
                <span className="text-[11px] font-bold truncate">{event.title}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full justify-center px-2 border-l-4 border-black/10">
            <div className="text-[11px] font-extrabold truncate flex items-center gap-1">
                {data.status === 'COMPLETED' && <CheckCircle size={10} className="text-white" />}
                {event.title}
            </div>
            <div className="text-[9px] font-medium opacity-80 truncate flex items-center gap-1 mt-0.5">
                <Clock size={9} />
                {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
            </div>
        </div>
    );
};

export default function CalendarPage() {
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
  time: '08:00', // Standard-Uhrzeit
  customerId: '', 
  serviceId: '' 
});

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
          title: `${job.customer.companyName || job.customer.lastName} (${job.service.name})`,
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
    } catch (e) { toast.error('Laden fehlgeschlagen'); } finally { setIsLoading(false); }
  };

  // --- HANDLERS ---
  const handleEventDrop = async ({ event, start }: any) => {
    if (event.resource.type === 'ABSENCE') return toast.error("Abwesenheiten sind fixiert.");
    const job = event.resource.data as Job;
    try {
      await api.patch(`/jobs/${job.id}`, { scheduledDate: start });
      toast.success("Termin verschoben", { id: 'drag' });
      fetchData();
    } catch (e) { toast.error("Fehler beim Verschieben"); }
  };

const handleJobUpdate = async (updates: { status?: string; scheduledDate?: Date }) => {
  if (!selectedJob) return;
  const toastId = toast.loading("Aktualisiere Auftrag...");
  try {
    const payload = {
      status: updates.status || selectedJob.status,
      scheduledDate: updates.scheduledDate ? updates.scheduledDate.toISOString() : selectedJob.scheduledDate
    };

    await api.patch(`/jobs/${selectedJob.id}`, payload);
    toast.success("Änderungen gespeichert", { id: toastId });
    fetchData();
    setIsEditModalOpen(false);
  } catch (e) {
    toast.error("Fehler beim Aktualisieren", { id: toastId });
  }
};

  const handleAssignEmployee = async (employeeId: string) => {
    if (!selectedJob) return;
    const toastId = toast.loading("Zuweisung...");
    try {
      await api.post(`/jobs/${selectedJob.id}/assign`, { employeeId });
      toast.success("Team aktualisiert", { id: toastId });
      fetchData();
      setIsEditModalOpen(false);
    } catch (e: any) { toast.error(e.response?.data?.message || "Fehler", { id: toastId }); }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!selectedJob) return;
    const previousAssignments = selectedJob.assignments;
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
      toast.error("Entfernen fehlgeschlagen");
    }
  };

const handleCreateJob = async () => {
  if (!newJobData.customerId || !newJobData.serviceId) return toast.error("Daten unvollständig");
  
  setIsSaving(true);
  try {
    // Datum und Uhrzeit kombinieren
    const [hours, minutes] = newJobData.time.split(':');
    const combinedDate = new Date(newJobData.date);
    combinedDate.setHours(parseInt(hours), parseInt(minutes), 0);

    await api.post('/jobs', { 
      customerId: newJobData.customerId,
      serviceId: newJobData.serviceId,
      scheduledDate: combinedDate.toISOString() // Als ISO-String senden
    });

    toast.success("Job erstellt!");
    setIsCreateModalOpen(false);
    fetchData();
  } catch (e) { 
    toast.error("Fehler beim Erstellen"); 
  } finally { 
    setIsSaving(false); 
  }
};

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6';
    if (event.resource.type === 'JOB') {
        const job = event.resource.data as Job;
        if (job.status === 'COMPLETED') backgroundColor = '#10b981';
        else if (job.status === 'CANCELLED') backgroundColor = '#ef4444';
        else if (job.assignments.length > 0) backgroundColor = '#f59e0b';
    } else {
        backgroundColor = (event.resource.data as Absence).type === 'VACATION' ? '#8b5cf6' : '#f43f5e';
    }
    return { style: { backgroundColor, borderRadius: '8px', border: 'none', color: 'white' } };
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
                <CalIcon size={28} />
            </div>
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Einsatzplaner</h1>
                <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                    <Info size={14} className="text-blue-500" /> Verwalte Aufträge und Abwesenheiten per Drag & Drop
                </p>
            </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm border border-slate-100 text-[11px] font-bold text-slate-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Offen
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm border border-slate-100 text-[11px] font-bold text-slate-600">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div> Team aktiv
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm border border-slate-100 text-[11px] font-bold text-slate-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Erledigt
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm border border-slate-100 text-[11px] font-bold text-slate-600">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div> Abwesend
            </div>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="flex-1 bg-white p-6 rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-white relative overflow-hidden">
        {isLoading && (
            <div className="absolute inset-0 bg-white/60 z-20 backdrop-blur-[2px] flex items-center justify-center">
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

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white">
                  <div className="p-8">
                      <div className="flex justify-between items-center mb-8">
                          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Plus size={24} /></div>
                              Neuer Auftrag
                          </h2>
                          <button onClick={() => setIsCreateModalOpen(false)} className="bg-slate-50 p-2 rounded-full hover:bg-slate-100 transition"><X /></button>
                      </div>

                  <div className="space-y-6">
    {/* Datum & Zeit Row */}
    <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Datum</label>
            <div className="text-blue-800 font-bold">{format(newJobData.date, 'dd.MM.yyyy', { locale: de })}</div>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Uhrzeit</label>
            <input 
                type="time" 
                value={newJobData.time}
                onChange={e => setNewJobData({...newJobData, time: e.target.value})}
                className="bg-transparent font-bold text-slate-800 outline-none w-full cursor-pointer"
            />
        </div>
    </div>
    
    {/* Kunde wählen */}
    <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Kunde wählen</label>
        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none font-medium focus:ring-2 focus:ring-blue-500 transition-all" 
            onChange={e => setNewJobData({...newJobData, customerId: e.target.value})} value={newJobData.customerId}>
            <option value="">Bitte wählen...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.lastName}, ${c.firstName}`}</option>)}
        </select>
    </div>

    {/* Leistung wählen */}
    <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Leistung wählen</label>
        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none font-medium focus:ring-2 focus:ring-blue-500 transition-all" 
            onChange={e => setNewJobData({...newJobData, serviceId: e.target.value})} value={newJobData.serviceId}>
            <option value="">Bitte wählen...</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} ({Number(s.priceNet).toFixed(2)} €)</option>)}
        </select>
    </div>

    <button onClick={handleCreateJob} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2">
        {isSaving ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
        Auftrag planen
    </button>
</div>
                  </div>
              </div>
          </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-lg animate-in fade-in zoom-in duration-200">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
                  <div className="p-8 overflow-y-auto space-y-8">
                      <div className="flex justify-between items-start">
                          <div className="space-y-1">
                              <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedJob.service.name}</h2>
                              <div className="flex items-center gap-2 text-slate-500 font-bold">
                                  <MapPin size={16} className="text-blue-500" /> {selectedJob.customer.companyName || selectedJob.customer.lastName}
                              </div>
                          </div>
                          <button onClick={() => setIsEditModalOpen(false)} className="bg-slate-100 p-2.5 rounded-full hover:bg-slate-200 transition"><X /></button>
                      </div>

                      {/* EDIT MODAL BODY */}
<div className="grid grid-cols-2 gap-4">
  {/* Status Select */}
  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-sm">
    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Status</label>
    <select 
      value={selectedJob.status} 
      onChange={e => handleJobUpdate({ status: e.target.value })} 
      className="w-full bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
    >
      <option value="SCHEDULED">🕒 Geplant</option>
      <option value="IN_PROGRESS">🔄 In Arbeit</option>
      <option value="COMPLETED">✅ Erledigt</option>
      <option value="CANCELLED">❌ Storniert</option>
    </select>
  </div>

  {/* Uhrzeit Bearbeiten */}
  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-sm">
    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Uhrzeit anpassen</label>
    <input 
      type="time"
      defaultValue={format(new Date(selectedJob.scheduledDate), 'HH:mm')}
      onBlur={(e) => {
        const [hours, minutes] = e.target.value.split(':');
        const newDate = new Date(selectedJob.scheduledDate);
        newDate.setHours(parseInt(hours), parseInt(minutes));
        handleJobUpdate({ scheduledDate: newDate });
      }}
      className="w-full bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
    />
  </div>
</div>

{/* Datums-Info (Nur Anzeige, da Verschieben per Drag & Drop geht) */}
<div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
    <div className="flex items-center gap-3">
        <CalIcon size={18} className="text-blue-600" />
        <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase">Geplanter Tag</p>
            <p className="text-sm font-bold text-blue-900">
                {format(new Date(selectedJob.scheduledDate), 'EEEE, dd. MMMM yyyy', { locale: de })}
            </p>
        </div>
    </div>
    <div className="text-xs text-blue-600 font-medium italic">
        Verschieben per Drag & Drop
    </div>
</div>

                      <div className="space-y-4">
                          <h3 className="font-black text-slate-800 text-sm uppercase px-1">Team Management</h3>
                          <div className="flex flex-col gap-3">
                              {selectedJob.assignments.map(a => (
                                  <div key={a.employee.id} className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                                      <span className="font-bold text-slate-800">{a.employee.firstName} {a.employee.lastName}</span>
                                      <button onClick={() => handleRemoveEmployee(a.employee.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2"><Trash2 size={18}/></button>
                                  </div>
                              ))}
                              <select onChange={e => handleAssignEmployee(e.target.value)} value=""
                                className="w-full bg-white border-2 border-dashed border-slate-200 p-4 rounded-2xl font-bold text-slate-400 outline-none cursor-pointer appearance-none text-center">
                                  <option value="">+ Mitarbeiter zuweisen</option>
                                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                              </select>
                          </div>
                      </div>

                      <button onClick={() => setIsEditModalOpen(false)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition">Schließen</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}