import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Mail, Phone, MoreVertical, 
  UserCog, Badge
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  personnelNumber: string;
  role: string;
}

// --- WICHTIG: EmployeeCard AUSSERHALB der Hauptfunktion ---
const EmployeeCard = ({ emp, onClick }: { emp: Employee, onClick: (id: string) => void }) => (
    <div 
        onClick={() => onClick(emp.id)}
        className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden flex flex-col"
    >
        {/* Role Stripe */}
        <div className={`absolute top-0 left-0 w-full h-1 ${
            emp.role === 'Manager' ? 'bg-purple-500' : 
            emp.role === 'Vorarbeiter' ? 'bg-orange-500' : 'bg-blue-500'
        }`}></div>

        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl border border-slate-200 shadow-inner">
                    {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                        {emp.firstName} {emp.lastName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            emp.role === 'Manager' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                            emp.role === 'Vorarbeiter' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                            {emp.role}
                        </span>
                    </div>
                </div>
            </div>
            <button className="text-slate-300 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition">
                <MoreVertical size={20} />
            </button>
        </div>

        <div className="space-y-3 mb-6 flex-1">
            <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <Badge size={16} className="text-slate-400 shrink-0" />
                <span className="font-mono text-xs text-slate-500">PNR: {emp.personnelNumber}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-slate-600 px-2">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <span className="truncate">{emp.email}</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
            <button 
                onClick={(e) => { e.stopPropagation(); window.location.href=`mailto:${emp.email}`; }}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
            >
                <Mail size={16} /> Email
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); toast('Anruf-Funktion folgt...', { icon: '📞' }); }}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-green-300 hover:text-green-600 text-slate-600 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
            >
                <Phone size={16} /> Anruf
            </button>
        </div>
    </div>
);

export default function TeamPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (error) {
      toast.error('Konnte Team-Daten nicht laden');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.personnelNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <UserCog className="text-indigo-600" size={32} /> Team Übersicht
          </h1>
          <p className="text-slate-500 mt-1">Verwalten Sie Ihre {employees.length} Mitarbeiter.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/team/new')} 
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} /> Mitarbeiter anlegen
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Suchen nach Name oder Personal-Nr..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
          />
        </div>
        <div className="relative min-w-[200px]">
           <Filter className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
           <select 
             value={roleFilter}
             onChange={(e) => setRoleFilter(e.target.value)}
             className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none cursor-pointer shadow-sm text-slate-700"
           >
             <option value="ALL">Alle Positionen</option>
             <option value="Reinigungskraft">Reinigungskräfte</option>
             <option value="Vorarbeiter">Vorarbeiter</option>
             <option value="Büro">Büro</option>
             <option value="Manager">Manager</option>
           </select>
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Lade Team...</div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-400">Keine Mitarbeiter gefunden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map(emp => (
            <EmployeeCard 
                key={emp.id} 
                emp={emp} 
                onClick={(id) => navigate(`/dashboard/team/${id}`)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}