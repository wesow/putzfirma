import { useEffect, useState } from 'react';
import { 
  Palmtree, 
  Calendar, 
  Trash2, 
  Plus, 
  Thermometer, 
  Briefcase,
  Loader2,
  User,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

// --- TYPEN ---
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface Absence {
  id: string;
  type: 'VACATION' | 'SICKNESS' | 'OTHER';
  startDate: string;
  endDate: string;
  employee: Employee;
  comment?: string;
}

// --- HELPER COMPONENT: ABSENCE CARD (AUSSERHALB) ---
const AbsenceCard = ({ data, onDelete }: { data: Absence, onDelete: (id: string) => void }) => {
    // Styling basierend auf Typ
    const getStyle = () => {
        switch (data.type) {
            case 'VACATION': return { 
                border: 'border-l-orange-400', 
                iconBg: 'bg-orange-50', 
                iconColor: 'text-orange-500', 
                icon: <Palmtree size={20} />,
                badge: 'bg-orange-100 text-orange-700',
                label: 'Urlaub'
            };
            case 'SICKNESS': return { 
                border: 'border-l-red-500', 
                iconBg: 'bg-red-50', 
                iconColor: 'text-red-500', 
                icon: <Thermometer size={20} />,
                badge: 'bg-red-100 text-red-700',
                label: 'Krankheit'
            };
            default: return { 
                border: 'border-l-slate-400', 
                iconBg: 'bg-slate-100', 
                iconColor: 'text-slate-500', 
                icon: <Briefcase size={20} />,
                badge: 'bg-slate-100 text-slate-600',
                label: 'Sonstiges'
            };
        }
    };

    const style = getStyle();

    return (
        <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden border-l-[6px] ${style.border}`}>
            <div className="flex justify-between items-start pl-2">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-white ${style.iconBg} ${style.iconColor}`}>
                        {style.icon}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg leading-tight">
                            {data.employee.firstName} {data.employee.lastName}
                        </h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1 inline-block ${style.badge}`}>
                            {style.label}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => onDelete(data.id)} 
                    className="text-slate-300 hover:text-red-500 p-2 rounded-lg transition hover:bg-red-50 opacity-0 group-hover:opacity-100"
                    title="Löschen"
                >
                    <Trash2 size={18}/>
                </button>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-3 text-sm text-slate-600 font-medium pl-2">
                <div className="bg-slate-50 p-1.5 rounded text-slate-400"><Calendar size={14}/></div>
                <span>
                    {new Date(data.startDate).toLocaleDateString('de-DE')} 
                    <span className="mx-2 text-slate-300">bis</span> 
                    {new Date(data.endDate).toLocaleDateString('de-DE')}
                </span>
            </div>
        </div>
    );
};

export default function AbsencesPage() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [empId, setEmpId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [type, setType] = useState('VACATION');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        const [resAbs, resEmp] = await Promise.all([
            api.get('/absences'),
            api.get('/employees')
        ]);
        setAbsences(resAbs.data);
        setEmployees(resEmp.data);
        if(resEmp.data.length > 0 && !empId) setEmpId(resEmp.data[0].id);
    } catch (err) {
        toast.error("Konnte Daten nicht laden");
    } finally {
        setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(start) > new Date(end)) return toast.error("Enddatum muss nach Startdatum sein!");
    
    setSubmitting(true);
    const toastId = toast.loading("Speichere...");

    try {
      await api.post('/absences', {
        employeeId: empId,
        startDate: start,
        endDate: end,
        type,
        comment: 'Manuell erstellt'
      });
      toast.success("Abwesenheit eingetragen", { id: toastId });
      loadData();
      setStart(''); 
      setEnd('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Fehler beim Speichern", { id: toastId });
    } finally {
        setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Eintrag wirklich löschen?")) return;
    try {
        await api.delete(`/absences/${id}`);
        setAbsences(absences.filter(a => a.id !== id));
        toast.success("Gelöscht");
    } catch (err) {
        toast.error("Fehler beim Löschen");
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400"><Loader2 className="animate-spin mx-auto mb-2"/> Lade Planer...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
               <Palmtree className="text-orange-500" size={32} /> Abwesenheitsplaner
            </h1>
            <p className="text-slate-500 mt-1">Urlaub, Krankheit und sonstige Ausfälle verwalten.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LINKS: LISTE */}
        <div className="xl:col-span-2">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                Aktuelle Einträge <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{absences.length}</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {absences.map(a => (
                    <AbsenceCard key={a.id} data={a} onDelete={handleDelete} />
                ))}
                
                {absences.length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                            <Info className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-medium">Keine Abwesenheiten geplant.</p>
                    </div>
                )}
            </div>
        </div>

        {/* RECHTS: FORMULAR CARD (STICKY) */}
        <div className="xl:col-start-3 h-fit sticky top-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                        <Plus size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800">Neue Abwesenheit</h3>
                </div>

                <form onSubmit={handleCreate} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Mitarbeiter</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <User size={18} />
                            </div>
                            <select 
                                value={empId} 
                                onChange={e => setEmpId(e.target.value)} 
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none cursor-pointer font-medium text-slate-700"
                            >
                                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Grund</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button 
                                type="button" 
                                onClick={() => setType('VACATION')} 
                                className={`p-2.5 rounded-xl text-sm font-bold transition flex flex-col items-center gap-1 ${type === 'VACATION' ? 'bg-orange-50 border-2 border-orange-200 text-orange-600' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Palmtree size={18}/> Urlaub
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setType('SICKNESS')} 
                                className={`p-2.5 rounded-xl text-sm font-bold transition flex flex-col items-center gap-1 ${type === 'SICKNESS' ? 'bg-red-50 border-2 border-red-200 text-red-600' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Thermometer size={18}/> Krank
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setType('OTHER')} 
                                className={`p-2.5 rounded-xl text-sm font-bold transition flex flex-col items-center gap-1 ${type === 'OTHER' ? 'bg-slate-100 border-2 border-slate-300 text-slate-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Briefcase size={18}/> Sonstiges
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Von</label>
                            <input required type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full p-2.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Bis</label>
                            <input required type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full p-2.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"/>
                        </div>
                    </div>

                    <button 
                        disabled={submitting}
                        className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : <Plus size={20} />} Eintragen
                    </button>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
}