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
  Info,
  ChevronRight,
  AlertCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
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

// Typen für Konfliktlösung
interface ConflictData {
    conflicts: any[];
    availableEmployees: Employee[];
}

const AbsenceCard = ({ data, onDelete }: { data: Absence, onDelete: (id: string) => void }) => {
    const getStyle = () => {
        switch (data.type) {
            case 'VACATION': return { 
                borderClass: 'border-l-orange-500', 
                iconBg: 'bg-orange-50', 
                iconColor: 'text-orange-600', 
                icon: <Palmtree size={20} />,
                badgeClass: 'bg-orange-50 text-orange-700 border-orange-100',
                label: 'URLAUB'
            };
            case 'SICKNESS': return { 
                borderClass: 'border-l-red-500', 
                iconBg: 'bg-red-50', 
                iconColor: 'text-red-600', 
                icon: <Thermometer size={20} />,
                badgeClass: 'bg-red-50 text-red-700 border-red-100',
                label: 'KRANKHEIT'
            };
            default: return { 
                borderClass: 'border-l-slate-400', 
                iconBg: 'bg-slate-100', 
                iconColor: 'text-slate-600', 
                icon: <Briefcase size={20} />,
                badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
                label: 'SONSTIGES'
            };
        }
    };

    const style = getStyle();

    return (
        <div className={`customer-card !p-0 overflow-hidden border-none shadow-lg bg-white group transition-all hover:-translate-y-1`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.borderClass.replace('border-l-', 'bg-')}`}></div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4 pl-2">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-white ${style.iconBg} ${style.iconColor}`}>
                            {style.icon}
                        </div>
                        <div className="text-left">
                            <h4 className="font-black text-slate-900 text-base leading-tight">
                                {data.employee.firstName} {data.employee.lastName}
                            </h4>
                            <span className={`status-badge !rounded-md font-black text-[9px] mt-1.5 ${style.badgeClass}`}>
                                {style.label}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => onDelete(data.id)} 
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={18}/>
                    </button>
                </div>
                
                <div className="ml-2 pt-4 border-t border-slate-50 flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-black text-slate-700 text-[11px] tracking-tight">
                        <Calendar size={14} className="text-blue-500"/>
                        {new Date(data.startDate).toLocaleDateString('de-DE')}
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-black text-slate-700 text-[11px] tracking-tight">
                        {new Date(data.endDate).toLocaleDateString('de-DE')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AbsencesPage() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [empId, setEmpId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [type, setType] = useState('VACATION');

  // --- KONFLIKT STATE ---
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
    const toastId = toast.loading(force ? "Löse Konflikte..." : "Wird eingetragen...");

    try {
      await api.post('/absences', {
        employeeId: empId,
        startDate: start,
        endDate: end,
        type,
        comment: 'Manuelle Buchung',
        force,          // <--- WICHTIG
        reassignments   // <--- WICHTIG
      });
      
      toast.success("Abwesenheit gespeichert", { id: toastId });
      loadData();
      
      // Reset Form
      setStart(''); 
      setEnd('');
      setConflictData(null);
      setReassignments({});

    } catch (err: any) {
      // 🚨 KONFLIKT CHECK
      if (err.response?.status === 409 && err.response.data.requireResolution) {
          setConflictData(err.response.data);
          toast.dismiss(toastId);
          toast("Konflikte bei der Planung gefunden.", { icon: '⚠️' });
      } else {
          toast.error(err.response?.data?.message || "Fehler beim Speichern", { id: toastId });
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
        toast.success("Eintrag entfernt");
    } catch (err) {
        toast.error("Löschen fehlgeschlagen");
    }
  };

  const handleReassignmentChange = (jobId: string, employeeId: string) => {
      setReassignments(prev => ({ ...prev, [jobId]: employeeId }));
  };

  return (
    <div className="page-container">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
            <h1 className="page-title leading-none">Team-Verfügbarkeit</h1>
            <p className="page-subtitle text-slate-500 mt-2 font-medium italic">Urlaubsplanung und Abwesenheitsmanagement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* LEFT: LISTE DER ABWESENHEITEN */}
        <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Clock size={18} className="text-slate-400" />
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px]">Aktuelle Planung</h3>
                </div>
                <span className="status-badge bg-slate-100 text-slate-600 border-slate-200 font-black">{absences.length} BUCHUNGEN</span>
            </div>
            
            {loading ? (
                <div className="py-40 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <span className="label-caps italic">Synchronisiere Kalender...</span>
                </div>
            ) : absences.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100"><Palmtree size={32} /></div>
                    <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Keine aktiven Abwesenheiten</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {absences.map(a => (
                        <AbsenceCard key={a.id} data={a} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>

        {/* RIGHT: FORMULAR (STICKY) */}
        <div className="xl:sticky xl:top-8">
            <div className="form-card !p-0 overflow-hidden border-none shadow-2xl shadow-blue-900/5">
                <div className="bg-slate-900 p-6 text-white">
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                            <Plus size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-widest leading-none mb-1">Eintrag erstellen</h3>
                            <p className="text-slate-400 text-[10px] font-bold tracking-tight uppercase">Manuelle Kalenderbuchung</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={(e) => handleCreate(e, false)} className="p-8 space-y-6 bg-white text-left">
                    <div className="space-y-1.5">
                        <label className="label-caps text-blue-600">Personal auswählen</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <User size={18} />
                            </div>
                            <select 
                                value={empId} 
                                onChange={e => setEmpId(e.target.value)} 
                                className="input-standard pl-12 font-black appearance-none cursor-pointer"
                            >
                                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="label-caps">Klassifizierung</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button 
                                type="button" 
                                onClick={() => setType('VACATION')} 
                                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border transition-all ${type === 'VACATION' ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-inner' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                            >
                                <Palmtree size={20}/>
                                <span className="text-[9px] font-black uppercase tracking-widest">Urlaub</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setType('SICKNESS')} 
                                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border transition-all ${type === 'SICKNESS' ? 'bg-red-50 border-red-200 text-red-600 shadow-inner' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                            >
                                <Thermometer size={20}/>
                                <span className="text-[9px] font-black uppercase tracking-widest">Krank</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setType('OTHER')} 
                                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border transition-all ${type === 'OTHER' ? 'bg-slate-100 border-slate-300 text-slate-700 shadow-inner' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                            >
                                <Briefcase size={20}/>
                                <span className="text-[9px] font-black uppercase tracking-widest">Sonst.</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="label-caps">Beginn</label>
                            <input required type="date" value={start} onChange={e => setStart(e.target.value)} className="input-standard !py-3 font-black text-xs"/>
                        </div>
                        <div className="space-y-1.5">
                            <label className="label-caps">Ende</label>
                            <input required type="date" value={end} onChange={e => setEnd(e.target.value)} className="input-standard !py-3 font-black text-xs"/>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full py-4 justify-center shadow-xl shadow-blue-500/20 uppercase tracking-[0.2em] font-black text-[10px]"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <SaveIcon size={18} />}
                        Buchung speichern
                    </button>
                    
                    <div className="bg-blue-50/50 rounded-2xl p-4 flex gap-3 border border-blue-100/50">
                        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-800/80 font-black uppercase tracking-tight leading-relaxed">
                            Einträge werden sofort im Dienstplan und für die Lohnabrechnung gesperrt bzw. markiert.
                        </p>
                    </div>
                </form>
            </div>
        </div>

      </div>

      {/* --- KONFLIKT-LÖSUNGS MODAL --- */}
      {conflictData && (
          <div className="modal-overlay">
              <div className="modal-content animate-in zoom-in-95 !max-w-2xl border-2 border-amber-400">
                  <div className="modal-header bg-amber-500 text-white">
                      <div className="flex items-center gap-3">
                          <AlertTriangle size={20}/>
                          <h2 className="text-sm font-black uppercase">Einsatz-Konflikte lösen</h2>
                      </div>
                      <button onClick={() => setConflictData(null)} className="hover:bg-white/20 p-2 rounded-lg"><X size={20}/></button>
                  </div>
                  
                  <div className="modal-body p-6 space-y-4 text-left">
                      <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-xs font-medium border border-amber-100 leading-relaxed">
                          Der Mitarbeiter ist für <strong>{conflictData.conflicts.length} Jobs</strong> eingeplant. 
                          Bitte weisen Sie diese Jobs jetzt um, oder lassen Sie das Feld leer (Job wird unbesetzt).
                      </div>

                      <div className="max-h-[300px] overflow-y-auto space-y-3 custom-scrollbar pr-2">
                          {conflictData.conflicts.map((conflict: any) => (
                              <div key={conflict.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-4">
                                  
                                  <div className="flex-1">
                                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-1">
                                          <Calendar size={12}/> {new Date(conflict.job.scheduledDate).toLocaleDateString()}
                                      </div>
                                      <div className="font-bold text-slate-800 text-sm">
                                          {conflict.job.customer.companyName || conflict.job.customer.lastName}
                                      </div>
                                      <div className="text-xs text-blue-600 font-bold">
                                          {conflict.job.service.name}
                                      </div>
                                  </div>

                                  <ArrowRight className="text-slate-300 hidden md:block" />

                                  <div className="w-full md:w-64">
                                      <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Ersatzkraft wählen</label>
                                      <select 
                                          className={`input-standard font-bold text-xs ${reassignments[conflict.jobId] ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}`}
                                          onChange={(e) => handleReassignmentChange(conflict.jobId, e.target.value)}
                                          value={reassignments[conflict.jobId] || ''}
                                      >
                                          <option value="">-- Nicht neu besetzen (Job rot) --</option>
                                          {conflictData.availableEmployees.map(e => (
                                              <option key={e.id} value={e.id}>
                                                  {e.firstName} {e.lastName} (Verfügbar)
                                              </option>
                                          ))}
                                      </select>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="modal-footer bg-slate-50 flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-bold">
                          {Object.keys(reassignments).length} von {conflictData.conflicts.length} Jobs neu zugewiesen
                      </span>
                      <div className="flex gap-2">
                          <button onClick={() => setConflictData(null)} className="btn-secondary">Abbrechen</button>
                          <button onClick={() => handleCreate(undefined, true)} className="btn-primary bg-amber-500 border-amber-600 hover:bg-amber-600 shadow-amber-200">
                              <CheckCircle2 size={18}/> Änderungen anwenden
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

// Hilfs-Icon
function SaveIcon({size}: {size: number}) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
    )
}