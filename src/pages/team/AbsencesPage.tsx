import { useEffect, useState } from 'react';
import { Palmtree, Calendar, Trash2, Plus, Thermometer, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function AbsencesPage() {
  const [absences, setAbsences] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
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
        if(resEmp.data.length > 0) setEmpId(resEmp.data[0].id);
    } catch (err) {
        toast.error("Konnte Daten nicht laden");
    } finally {
        setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(start) > new Date(end)) {
        toast.error("Enddatum muss nach Startdatum sein!");
        return;
    }
    
    try {
      await api.post('/absences', {
        employeeId: empId,
        startDate: start,
        endDate: end,
        type,
        comment: 'Manuell erstellt'
      });
      toast.success("Abwesenheit eingetragen");
      loadData();
      setStart(''); setEnd('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Fehler beim Speichern");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Eintrag löschen?")) return;
    try {
        await api.delete(`/absences/${id}`);
        setAbsences(absences.filter(a => a.id !== id));
        toast.success("Gelöscht");
    } catch (err) {
        toast.error("Fehler beim Löschen");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Lade Urlaubsplan...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Palmtree className="text-orange-500" /> Urlaubs- & Krankheitsplaner
            </h1>
            <p className="text-slate-500 text-sm">Verwalte Abwesenheiten für die Einsatzplanung.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* RECHTS: FORMULAR (Auf Desktop rechts, mobil unten) */}
        <div className="xl:col-start-3 xl:row-start-1 h-fit">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 sticky top-4">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" /> Neu eintragen
                </h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mitarbeiter</label>
                    <select value={empId} onChange={e => setEmpId(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-500">
                        {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Typ</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="VACATION">Urlaub 🏖️</option>
                        <option value="SICKNESS">Krankheit 🤒</option>
                        <option value="OTHER">Sonstiges ⚪</option>
                    </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Von</label>
                        <input required type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bis</label>
                        <input required type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    </div>
                    <button className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 active:scale-95">
                        Speichern
                    </button>
                </form>
            </div>
        </div>

        {/* LINKS: LISTE */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
          {absences.map(a => (
            <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${a.type === 'VACATION' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                    {a.type === 'VACATION' ? <Palmtree size={24}/> : <Thermometer size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{a.employee.firstName} {a.employee.lastName}</h4>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${a.type === 'VACATION' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                        {a.type === 'VACATION' ? 'Urlaub' : 'Krankheit'}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                    <Trash2 size={18}/>
                </button>
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3 text-sm text-slate-600 font-medium">
                <Calendar size={16} className="text-slate-400" />
                <span>
                  {new Date(a.startDate).toLocaleDateString('de-DE')} 
                  <span className="mx-2 text-slate-300">➜</span> 
                  {new Date(a.endDate).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
          ))}
          
          {absences.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Info className="w-10 h-10 mb-2 opacity-50" />
                <p>Keine Abwesenheiten geplant.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}