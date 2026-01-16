import { useEffect, useState } from 'react';
import { Palmtree, Calendar, User, Trash2 } from 'lucide-react';
import api from '../../lib/api';

export default function AbsencesPage() {
  const [absences, setAbsences] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]); // Für Dropdown
  
  // Form
  const [empId, setEmpId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [type, setType] = useState('VACATION');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [resAbs, resEmp] = await Promise.all([
      api.get('/absences'),
      api.get('/employees')
    ]);
    setAbsences(resAbs.data);
    setEmployees(resEmp.data);
    if(resEmp.data.length > 0) setEmpId(resEmp.data[0].id);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/absences', {
        employeeId: empId,
        startDate: start,
        endDate: end,
        type,
        comment: 'Manuell erstellt'
      });
      loadData(); // Reload
      setStart(''); setEnd('');
    } catch (err) {
      alert("Fehler beim Speichern");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Wirklich löschen?")) return;
    await api.delete(`/absences/${id}`);
    setAbsences(absences.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Palmtree className="text-orange-500" /> Urlaubsplaner
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LINKS: LISTE */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {absences.map(a => (
            <div key={a.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${a.type === 'VACATION' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                    {a.type === 'VACATION' ? <Palmtree size={20}/> : <div className="font-bold px-1">K</div>}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700">{a.employee.firstName} {a.employee.lastName}</h4>
                    <p className="text-xs text-slate-500">{a.type === 'VACATION' ? 'Urlaub' : 'Krankheit'}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={14} />
                <span>
                  {new Date(a.startDate).toLocaleDateString('de-DE')} - {new Date(a.endDate).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
          ))}
          {absences.length === 0 && <div className="text-slate-400">Keine Abwesenheiten geplant.</div>}
        </div>

        {/* RECHTS: FORMULAR */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className="font-bold text-slate-800 mb-4">Abwesenheit eintragen</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Mitarbeiter</label>
              <select value={empId} onChange={e => setEmpId(e.target.value)} className="w-full p-2 border rounded-lg bg-white">
                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Typ</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 border rounded-lg bg-white">
                <option value="VACATION">Urlaub 🏖️</option>
                <option value="SICKNESS">Krankheit 🤒</option>
                <option value="OTHER">Sonstiges</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Von</label>
                <input required type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full p-2 border rounded-lg"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Bis</label>
                <input required type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full p-2 border rounded-lg"/>
              </div>
            </div>
            <button className="w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700">Speichern</button>
          </form>
        </div>
      </div>
    </div>
  );
}