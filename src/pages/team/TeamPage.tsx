import {
  AlertCircle,
  CheckCircle,
  Hash,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus, Search,
  Send,
  Shield,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';
import ViewSwitcher from '../../components/ViewSwitcher';
import api from '../../lib/api';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string; 
  personnelNumber: string;
  userId: string | null;
  user?: {
    isActive: boolean;
    role: string; 
  } | null;
}

export default function TeamPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });

  useEffect(() => { fetchTeam(); }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (e) {
      toast.error('Team konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvite = async (email: string) => {
    const tid = toast.loading('Sende Einladung...');
    try {
      await api.post('/auth/invite', { email, role: 'EMPLOYEE' });
      toast.success('Einladung erneut versendet', { id: tid });
    } catch {
      toast.error('Versand fehlgeschlagen', { id: tid });
    }
  };

  const confirmDelete = async () => {
    const tid = toast.loading('Mitarbeiter wird entfernt...');
    try {
      await api.delete(`/employees/${deleteModal.id}`);
      setEmployees(employees.filter(e => e.id !== deleteModal.id));
      toast.success('Mitarbeiter gelöscht', { id: tid });
      setDeleteModal({ ...deleteModal, isOpen: false });
    } catch {
      toast.error('Löschen fehlgeschlagen', { id: tid });
    }
  };

  const filtered = employees.filter(e => 
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.personnelNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        <div>
          <h1 className="page-title">Team-Verwaltung</h1>
          <p className="page-subtitle">Personalstamm und Zugriffsberechtigungen verwalten.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
           {/* Search & View Switcher Group */}
           <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 p-1 rounded-lg border border-slate-200">
              <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
              <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Suchen..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-white border-none rounded-md py-1.5 pl-8 pr-2 text-[12px] focus:ring-0 placeholder:text-slate-400 font-medium" 
                />
              </div>
           </div>

           <button onClick={() => navigate('/dashboard/team/new')} className="btn-primary w-full sm:w-auto whitespace-nowrap">
             <Plus size={16} /> Mitglied hinzufügen
           </button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lade Teamdaten...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 m-4 py-20">
          <AlertCircle size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-bold text-sm">Keine Mitarbeiter gefunden.</p>
          <p className="text-slate-400 text-xs mt-1">Erstelle einen neuen Eintrag oder ändere die Suche.</p>
        </div>
      ) : viewMode === 'GRID' ? (
        
        /* --- GRID VIEW --- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300 pb-safe">
          {filtered.map(emp => (
            <div key={emp.id} className="employee-card group h-full">
              {/* Farbstreifen oben (Role Indicator) */}
              <div className={`absolute top-0 left-0 w-full h-1 ${emp.user?.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
              
              <div className="flex justify-between items-start mb-4 pt-1">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm
                        ${emp.user?.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                        {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                    </div>
                    <div className="text-left overflow-hidden">
                        <h3 className="font-bold text-slate-900 text-sm leading-tight truncate w-32">
                            {emp.firstName} {emp.lastName}
                        </h3>
                        <span className={`status-badge mt-1 ${emp.user?.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {emp.role}
                        </span>
                    </div>
                </div>
                
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => navigate(`/dashboard/team/${emp.id}`)} className="btn-icon-only hover:text-blue-600"><Pencil size={14} /></button>
                   <button onClick={() => setDeleteModal({ isOpen: true, id: emp.id, name: `${emp.firstName} ${emp.lastName}` })} className="btn-icon-only hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium bg-slate-50 p-1.5 rounded border border-slate-100">
                  <Mail size={12} className="text-slate-400 shrink-0" /> <span className="truncate">{emp.email}</span>
                </div>
                {emp.personnelNumber && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium px-1.5">
                    <Hash size={12} className="text-slate-300 shrink-0" /> <span className="font-mono">PNR: {emp.personnelNumber}</span>
                    </div>
                )}
              </div>
              
              <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-auto">
                 {emp.userId ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                      <CheckCircle size={10} /> AKTIV
                    </span>
                  ) : (
                    <button onClick={() => handleResendInvite(emp.email)} className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 hover:bg-amber-100 transition-colors">
                      <Send size={10} /> EINLADEN
                    </button>
                  )}
                  
                  <button 
                    onClick={() => navigate(`/dashboard/team/${emp.id}`)}
                    className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 uppercase tracking-wider transition-colors"
                  >
                    Details <ChevronRight size={12} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* --- TABLE VIEW --- */
        <div className="table-container animate-in slide-in-from-bottom-2 duration-300 pb-safe">
          <div className="flex-1 custom-scrollbar overflow-y-auto">
            <table className="table-main">
                <thead className="table-head sticky top-0 z-10">
                <tr>
                    <th className="px-4 py-3 text-left">Mitarbeiter</th>
                    <th className="px-4 py-3 text-left">Kontakt</th>
                    <th className="px-4 py-3 text-left">PNR</th>
                    <th className="px-4 py-3 text-left">Rolle / Status</th>
                    <th className="px-4 py-3 text-right">Aktionen</th>
                </tr>
                </thead>
                <tbody>
                {filtered.map(emp => (
                    <tr key={emp.id} className="table-row group">
                    <td className="table-cell pl-4 align-middle">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white border-2 border-white shadow-sm
                                ${emp.user?.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">{emp.firstName} {emp.lastName}</div>
                                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{emp.role}</div>
                            </div>
                        </div>
                    </td>
                    <td className="table-cell align-middle">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <Mail size={12} /> {emp.email}
                            </div>
                            {emp.phone && (
                                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                    <Phone size={12} /> {emp.phone}
                                </div>
                            )}
                        </div>
                    </td>
                    <td className="table-cell align-middle">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {emp.personnelNumber || '---'}
                        </span>
                    </td>
                    <td className="table-cell align-middle">
                         {emp.userId ? (
                             <span className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100">
                                <Shield size={10} /> {emp.user?.role || 'USER'}
                             </span>
                         ) : (
                             <button onClick={() => handleResendInvite(emp.email)} className="status-badge bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 cursor-pointer">
                                <Send size={10} /> AUSSTEHEND
                             </button>
                         )}
                    </td>
                    <td className="table-cell text-right pr-4 align-middle">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => navigate(`/dashboard/team/${emp.id}`)} className="btn-icon-only hover:text-blue-600"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteModal({ isOpen: true, id: emp.id, name: `${emp.firstName} ${emp.lastName}` })} className="btn-icon-only hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        title="Mitarbeiter löschen?" 
        message={`Möchtest du ${deleteModal.name} wirklich unwiderruflich aus dem System entfernen? Alle verknüpften Daten bleiben archiviert, aber der Zugriff wird sofort gesperrt.`} 
        onConfirm={confirmDelete} 
        onCancel={() => setDeleteModal({ ...deleteModal, isOpen: false, id: '', name: '' })} 
      />
    </div>
  );
}

// Helper component für den kleinen Pfeil unten im Grid
function ChevronRight({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m9 18 6-6-6-6"/>
        </svg>
    )
}