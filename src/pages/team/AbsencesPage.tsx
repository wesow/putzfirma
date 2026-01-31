import {
    AlertTriangle,
    ArrowRight,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    Info,
    Loader2,
    Palmtree,
    Plus,
    Thermometer,
    Trash2,
    User,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import api from '../../lib/api';

interface Employee { id: string; firstName: string; lastName: string; }

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

const AbsenceCard = ({ data, onDelete }: { data: Absence, onDelete: (id: string) => void }) => {
    const getStyle = () => {
        switch (data.type) {
            case 'VACATION': return { 
                borderClass: 'bg-orange-500', 
                iconBg: 'bg-orange-50', 
                iconColor: 'text-orange-600', 
                icon: <Palmtree size={16} />,
                badgeClass: 'bg-orange-50 text-orange-700 border-orange-100',
                label: 'Urlaub'
            };
            case 'SICKNESS': return { 
                borderClass: 'bg-red-500', 
                iconBg: 'bg-red-50', 
                iconColor: 'text-red-600', 
                icon: <Thermometer size={16} />,
                badgeClass: 'bg-red-50 text-red-700 border-red-100',
                label: 'Krank'
            };
            default: return { 
                borderClass: 'bg-slate-400', 
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-0 overflow-hidden relative group hover:shadow-md transition-all">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.borderClass}`}></div>
            <div className="p-3 pl-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border border-white shadow-sm ${style.iconBg} ${style.iconColor}`}>
                        {style.icon}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-none mb-1.5">
                            {data.employee.firstName} {data.employee.lastName}
                        </h4>
                        <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${style.badgeClass}`}>
                                {style.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                {new Date(data.startDate).toLocaleDateString('de-DE')} - {new Date(data.endDate).toLocaleDateString('de-DE')}
                            </span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => onDelete(data.id)} 
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
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

  // Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      
      toast.success("Erfolgreich gespeichert", { id: toastId });
      loadData();
      
      setStart(''); 
      setEnd('');
      setConflictData(null);
      setReassignments({});

    } catch (err: any) {
      if (err.response?.status === 409 && err.response.data.requireResolution) {
          setConflictData(err.response.data);
          toast.dismiss(toastId);
      } else {
          toast.error(err.response?.data?.message || "Fehler", { id: toastId });
      }
    } finally {
        setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
        await api.delete(`/absences/${deleteId}`);
        setAbsences(absences.filter(a => a.id !== deleteId));
        toast.success("Eintrag entfernt");
    } catch (err) {
        toast.error("Löschen fehlgeschlagen");
    } finally {
        setDeleteId(null);
    }
  };

  return (
    <div className="page-container space-y-4">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div>
            <h1 className="page-title">Personal-Verfügbarkeit</h1>
            <p className="page-subtitle">Zentrale Planung von Urlaub und Krankmeldungen.</p>
        </div>
      </div>

      <div className="content-grid lg:grid-cols-12 gap-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* LINKS: LISTE DER ABWESENHEITEN */}
        <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-[0.15em]">
                    <Clock size={14} className="text-blue-500" /> Aktuelle Planung
                </div>
                <span className="status-badge bg-white text-slate-600 border-slate-200">
                    {absences.length} Buchungen
                </span>
            </div>
            
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-100">
                    <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
                    <span className="text-[10px] uppercase tracking-widest font-black">Synchronisiere...</span>
                </div>
            ) : absences.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
                    <Palmtree size={40} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Keine aktiven Abwesenheiten</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {absences.map(a => (
                        <AbsenceCard key={a.id} data={a} onDelete={(id) => setDeleteId(id)} />
                    ))}
                </div>
            )}
        </div>

        {/* RECHTS: FORMULAR ZUR BUCHUNG */}
        <div className="lg:col-span-4 lg:sticky lg:top-4">
            <div className="form-card !p-0 overflow-hidden shadow-xl shadow-slate-200/50">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                    <div className="bg-blue-600 p-1 rounded-lg text-white shadow-lg shadow-blue-500/20">
                        <Plus size={14} />
                    </div>
                    <span className="font-black text-slate-800 text-[11px] uppercase tracking-wider">Neu Erfassen</span>
                </div>

                <form onSubmit={(e) => handleCreate(e, false)} className="p-5 space-y-5">
                    <div className="space-y-1.5">
                        <label className="label-caps !ml-0 text-blue-600">Team-Mitglied</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select 
                                value={empId} 
                                onChange={e => setEmpId(e.target.value)} 
                                className="input-standard pl-10 appearance-none cursor-pointer font-bold text-sm"
                            >
                                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="label-caps !ml-0">Art der Abwesenheit</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button type="button" onClick={() => setType('VACATION')} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${type === 'VACATION' ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-orange-100'}`}>
                                <Palmtree size={18}/>
                                <span className="text-[9px] font-black uppercase">Urlaub</span>
                            </button>
                            <button type="button" onClick={() => setType('SICKNESS')} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${type === 'SICKNESS' ? 'bg-red-50 border-red-200 text-red-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-red-100'}`}>
                                <Thermometer size={18}/>
                                <span className="text-[9px] font-black uppercase">Krank</span>
                            </button>
                            <button type="button" onClick={() => setType('OTHER')} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${type === 'OTHER' ? 'bg-slate-100 border-slate-300 text-slate-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                <Briefcase size={18}/>
                                <span className="text-[9px] font-black uppercase">Sonst.</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="label-caps !ml-0">Von</label>
                            <input required type="date" value={start} onChange={e => setStart(e.target.value)} className="input-standard font-bold text-xs"/>
                        </div>
                        <div className="space-y-1.5">
                            <label className="label-caps !ml-0">Bis (inkl.)</label>
                            <input required type="date" value={end} onChange={e => setEnd(e.target.value)} className="input-standard font-bold text-xs"/>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full justify-center py-3 shadow-xl shadow-blue-600/20 uppercase tracking-[0.1em] font-black text-[11px]"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} className="mr-2" />}
                        Planung speichern
                    </button>
                </form>
            </div>
        </div>

      </div>

      {/* --- KONFLIKT MODAL (Enterprise Style) --- */}
      {conflictData && (
          <div className="modal-overlay">
              <div className="modal-content !max-w-2xl border-t-4 border-t-amber-500 overflow-hidden">
                  <div className="modal-header !bg-amber-50/50">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <AlertTriangle size={20}/>
                          </div>
                          <div>
                            <h2 className="text-sm font-black uppercase tracking-tight text-amber-900">Belegungs-Konflikte</h2>
                            <p className="text-[10px] font-bold text-amber-700/60 uppercase">Jobs während der Abwesenheit gefunden</p>
                          </div>
                      </div>
                      <button onClick={() => setConflictData(null)} className="p-2 hover:bg-amber-100 rounded-xl text-amber-900 transition-all"><X size={20}/></button>
                  </div>
                  
                  <div className="modal-body p-6 space-y-4">
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                          <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-900 leading-relaxed font-medium">
                            Der Mitarbeiter ist für <strong>{conflictData.conflicts.length} Einsätze</strong> eingeteilt. Bitte weisen Sie diese neu zu oder lassen Sie sie unbesetzt, um fortzufahren.
                          </p>
                      </div>

                      <div className="max-h-[350px] overflow-y-auto space-y-2.5 custom-scrollbar pr-2">
                          {conflictData.conflicts.map((conflict: any) => (
                              <div key={conflict.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row items-center gap-4 hover:border-amber-300 transition-colors">
                                  <div className="flex-1 min-w-0 text-left">
                                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase mb-1">
                                          <Calendar size={12}/> {new Date(conflict.job.scheduledDate).toLocaleDateString('de-DE')}
                                      </div>
                                      <div className="font-bold text-slate-900 text-[13px] truncate">
                                          {conflict.job.customer.companyName || conflict.job.customer.lastName}
                                      </div>
                                      <div className="text-[10px] text-blue-600 font-black uppercase tracking-tight">
                                          {conflict.job.service.name}
                                      </div>
                                  </div>

                                  <ArrowRight className="text-slate-300 hidden md:block" size={16} />

                                  <div className="w-full md:w-60">
                                    <select 
                                        className={`input-standard py-2 font-bold text-[11px] ${reassignments[conflict.job.id] ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}`}
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

                  <div className="modal-footer !bg-slate-50 flex justify-between items-center py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">Status</span>
                        <span className="text-xs font-bold text-slate-900">{Object.keys(reassignments).length} von {conflictData.conflicts.length} gelöst</span>
                      </div>
                      <div className="flex gap-3">
                          <button onClick={() => setConflictData(null)} className="btn-secondary !py-2.5 !px-5 text-[11px]">Abbruch</button>
                          <button onClick={() => handleCreate(undefined, true)} className="btn-primary !bg-amber-600 !border-amber-700 shadow-lg shadow-amber-500/20 !py-2.5 !px-6 text-[11px]">
                              <CheckCircle2 size={16} className="mr-2"/> Konflikte lösen & Speichern
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmModal 
        isOpen={!!deleteId}
        title="Eintrag löschen?"
        message="Möchten Sie diese Abwesenheit wirklich entfernen? Der Mitarbeiter steht danach sofort wieder für neue Jobs zur Verfügung."
        variant="danger"
        confirmText="Löschen"
        onConfirm={executeDelete}
        onCancel={() => setDeleteId(null)}
      />

    </div>
  );
}