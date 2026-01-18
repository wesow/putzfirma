import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, Mail, Phone, MoreHorizontal, 
  Briefcase, User, Badge 
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

  // Filter-Logik
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.personnelNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="p-10 text-center text-slate-400">Lade Team...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <User className="text-blue-600 h-8 w-8" /> Team Übersicht
          </h1>
          <p className="text-slate-500 text-sm">Verwalte deine {employees.length} Mitarbeiter.</p>
        </div>
        <button 
          // KORRIGIERT: /dashboard/team/new
          onClick={() => navigate('/dashboard/team/new')} 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} /> Mitarbeiter anlegen
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        
        {/* Suche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Suchen nach Name oder Personal-Nr..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative min-w-[200px]">
           <Filter className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
           <select 
             value={roleFilter}
             onChange={(e) => setRoleFilter(e.target.value)}
             className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
           >
             <option value="ALL">Alle Positionen</option>
             <option value="Reinigungskraft">Reinigungskräfte</option>
             <option value="Vorarbeiter">Vorarbeiter</option>
             <option value="Büro">Büro</option>
             <option value="Manager">Manager</option>
           </select>
        </div>
      </div>

      {/* GRID VIEW */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-400">Keine Mitarbeiter gefunden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map(emp => (
            <div 
              key={emp.id} 
              // KORRIGIERT: /dashboard/team/...
              onClick={() => navigate(`/dashboard/team/${emp.id}`)}
              className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Farbiger Balken links */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                emp.role === 'Manager' ? 'bg-purple-500' : 
                emp.role === 'Vorarbeiter' ? 'bg-orange-500' : 'bg-blue-500'
              }`}></div>

              <div className="flex justify-between items-start mb-4 pl-3">
                <div className="flex items-center gap-3">
                  {/* Initialen */}
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg border-2 border-white shadow-sm">
                    {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                      {emp.firstName} {emp.lastName}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1 mt-0.5">
                      <Briefcase size={12} /> {emp.role}
                    </p>
                  </div>
                </div>
                {/* Edit Button */}
                <button className="text-slate-300 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="space-y-3 pl-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                   <Badge size={16} className="text-slate-400" />
                   <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded text-xs text-slate-500 border border-slate-200">
                     {emp.personnelNumber}
                   </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
                   <Mail size={16} className="text-slate-400" />
                   <a href={`mailto:${emp.email}`} onClick={e => e.stopPropagation()} className="hover:underline hover:text-blue-600 truncate">
                     {emp.email}
                   </a>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2 pl-3">
                 <button 
                   onClick={(e) => { e.stopPropagation(); window.location.href=`mailto:${emp.email}`; }}
                   className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                 >
                   <Mail size={16} /> Email
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); toast('Anruf-Funktion folgt...', { icon: '📞' }); }}
                   className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                 >
                   <Phone size={16} /> Anruf
                 </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}