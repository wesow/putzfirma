import {
    AlertTriangle,
    ArrowRight,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    Loader2,
    Palmtree,
    Plus, Thermometer,
    Trash2,
    User,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

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

interface ConflictData {
  conflicts: any[];
  availableEmployees: Employee[];
}

// Compact Absence Card
const AbsenceCard = ({ data, onDelete }: { data: Absence, onDelete: (id: string) => void }) => {
    const getStyle = () => {
        switch (data.type) {
            case 'VACATION': return { 
                borderClass: 'border-l-orange-500', 
                iconBg: 'bg-orange-50', 
                iconColor: 'text-orange-600', 
                icon: <Palmtree size={16} />,
                badgeClass: 'bg-orange-50 text-orange-700 border-orange-100',
                label: 'Urlaub'
            };
            case 'SICKNESS': return { 
                borderClass: 'border-l-red-500', 
                iconBg: 'bg-red-50', 
                iconColor: 'text-red-600', 
                icon: <Thermometer size={16} />,
                badgeClass: 'bg-red-50 text-red-700 border-red-100',
                label: 'Krank'
            };
            default: return { 
                borderClass: 'border-l-slate-400', 
                iconBg: 'bg-slate-100', 
                iconColor: 'text-slate-600', 
                icon: <Briefcase size={16} />,
                badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
                label: 'Sonstiges'
            };
        }
    };

    const style = getStyle();

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-0 overflow-hidden relative group hover:shadow-md transition-all`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.borderClass.replace('border-l-', 'bg-')}`}></div>
            <div className="p-3 pl-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white ${style.iconBg} ${style.iconColor}`}>
                        {style.icon}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-none mb-1">
                            {data.employee.firstName} {data.employee.lastName}
                        </h4>
                        <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${style.badgeClass}`}>
                                {style.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => onDelete(data.id)} 
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16}/>
                </button>
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

  const [conflictData, setConflictData] = useState<ConflictData | null>(null);
  const [reassignments, setReassignments] = useState<Record<string, string>>({});

  useEffect(() => { loadData(); }, []);

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
        toast.error("Daten konnten nicht geladen werden");
    } finally {
        setLoading(false);
    }
  };

  const handleCreate = async (e?: React.FormEvent, force = false) => {
    if (e) e.preventDefault();
    if (new Date(start) > new Date(end)) return toast.error("Zeitraum ungültig!");
    
    setSubmitting(true);
    const toastId = toast.loading(force ? "Löse Konflikte..." : "Speichere...");

    try {
      await api.post('/absences', {
        employeeId: empId,
        startDate: start,
        endDate: end,
        type,
        comment: 'Manuelle Buchung',
        force,
        reassignments 
      });
      
      toast.success("Gespeichert", { id: toastId });
      loadData();
      
      setStart(''); 
      setEnd('');
      setConflictData(null);
      setReassignments({});

    } catch (err: any) {
      if (err.response?.status === 409 && err.response.data.requireResolution) {
          setConflictData(err.response.data);
          toast.dismiss(toastId);
          toast("Konflikte gefunden", { icon: '⚠️' });
      } else {
          toast.error(err.response?.data?.message || "Fehler", { id: toastId });
      }
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
        toast.error("Fehler");
    }
  };

  return (
    <div className="page-container space-y-4">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
            <h1 className="page-title">Team-Verfügbarkeit</h1>
            <p className="page-subtitle">Urlaubsplanung und Abwesenheitsmanagement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* LEFT: LISTE */}
        <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wide">
                    <Clock size={14} /> Aktuelle Planung
                </div>
                <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">
                    {absences.length} Buchungen
                </span>
            </div>
            
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Lade Kalender...</span>
                </div>
            ) : absences.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-lg border border-dashed border-slate-200">
                    <Palmtree size={24} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Keine Einträge</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {absences.map(a => (
                        <AbsenceCard key={a.id} data={a} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>

        {/* RIGHT: FORMULAR */}
        <div className="xl:sticky xl:top-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    <div className="bg-orange-500 p-1 rounded-md text-white shadow-sm">
                        <Plus size={14} />
                    </div>
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wide">Eintrag erstellen</span>
                </div>

                <form onSubmit={(e) => handleCreate(e, false)} className="p-4 space-y-4">
                    <div className="space-y-1">
                        <label className="label-caps text-blue-600">Mitarbeiter</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <User size={16} />
                            </div>
                            <select 
                                value={empId} 
                                onChange={e => setEmpId(e.target.value)} 
                                className="input-standard pl-9 py-2 appearance-none cursor-pointer font-semibold text-sm"
                            >
                                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="label-caps">Typ</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button type="button" onClick={() => setType('VACATION')} className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg border transition-all ${type === 'VACATION' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                <Palmtree size={16}/>
                                <span className="text-[9px] font-bold uppercase">Urlaub</span>
                            </button>
                            <button type="button" onClick={() => setType('SICKNESS')} className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg border transition-all ${type === 'SICKNESS' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                <Thermometer size={16}/>
                                <span className="text-[9px] font-bold uppercase">Krank</span>
                            </button>
                            <button type="button" onClick={() => setType('OTHER')} className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg border transition-all ${type === 'OTHER' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                <Briefcase size={16}/>
                                <span className="text-[9px] font-bold uppercase">Sonst.</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="label-caps">Von</label>
                            <input required type="date" value={start} onChange={e => setStart(e.target.value)} className="input-standard py-2 font-semibold text-xs"/>
                        </div>
                        <div className="space-y-1">
                            <label className="label-caps">Bis</label>
                            <input required type="date" value={end} onChange={e => setEnd(e.target.value)} className="input-standard py-2 font-semibold text-xs"/>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full justify-center py-2.5 shadow-md uppercase tracking-wider font-bold text-[11px]"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} className="mr-1.5" />}
                        Speichern
                    </button>
                </form>
            </div>
        </div>

      </div>

      {/* --- KONFLIKT MODAL --- */}
      {conflictData && (
          <div className="modal-overlay">
              <div className="modal-content !max-w-2xl border-2 border-amber-400">
                  <div className="modal-header bg-amber-500 text-white !py-3">
                      <div className="flex items-center gap-2">
                          <AlertTriangle size={18}/>
                          <h2 className="text-xs font-black uppercase tracking-wide">Konflikte lösen</h2>
                      </div>
                      <button onClick={() => setConflictData(null)} className="hover:bg-white/20 p-1.5 rounded"><X size={18}/></button>
                  </div>
                  
                  <div className="modal-body p-4 space-y-4 text-left">
                      <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-[11px] font-medium border border-amber-100">
                          Konflikt mit <strong>{conflictData.conflicts.length} Jobs</strong>. Bitte neu zuweisen oder leer lassen (unbesetzt).
                      </div>

                      <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar pr-1">
                          {conflictData.conflicts.map((conflict: any) => (
                              <div key={conflict.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col md:flex-row items-center gap-3">
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                                          <Calendar size={10}/> {new Date(conflict.job.scheduledDate).toLocaleDateString()}
                                      </div>
                                      <div className="font-bold text-slate-800 text-xs truncate">
                                          {conflict.job.customer.companyName || conflict.job.customer.lastName}
                                      </div>
                                      <div className="text-[10px] text-blue-600 font-bold truncate">
                                          {conflict.job.service.name}
                                      </div>
                                  </div>

                                  <ArrowRight className="text-slate-300 hidden md:block" size={14} />

                                  <div className="w-full md:w-56">
                                    <select 
                                        className={`input-standard py-1.5 font-bold text-[11px] ${reassignments[conflict.job.id] ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}`}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setReassignments(prev => {
                                                const next = { ...prev };
                                                if (!val) delete next[conflict.job.id];
                                                else next[conflict.job.id] = val;
                                                return next;
                                            });
                                        }}
                                        value={reassignments[conflict.job.id] || ''}
                                    >
                                        <option value="">-- Unbesetzt lassen --</option>
                                        {conflictData.availableEmployees
                                            .filter(emp => !conflict.job.assignments.some((a: any) => a.employeeId === emp.id))
                                            .map(e => (
                                                <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                                        ))}
                                    </select>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="modal-footer bg-slate-50 flex justify-between items-center py-3">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                          {Object.keys(reassignments).length} Neuzuweisungen
                      </span>
                      <div className="flex gap-2">
                          <button onClick={() => setConflictData(null)} className="btn-secondary !py-2 !text-[11px]">Abbruch</button>
                          <button onClick={() => handleCreate(undefined, true)} className="btn-primary bg-amber-500 border-amber-600 hover:bg-amber-600 shadow-sm !py-2 !text-[11px]">
                              <CheckCircle2 size={14} className="mr-1.5"/> Anwenden
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}