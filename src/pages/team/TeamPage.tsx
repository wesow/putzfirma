import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Hash,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
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
    <div className="page-container pb-safe">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section flex-col lg:flex-row items-stretch lg:items-center gap-4">
        <div>
          <h1 className="page-title">Team-Verwaltung</h1>
          <p className="page-subtitle">Personalstamm und Zugriffsberechtigungen verwalten.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
           <div className="view-switcher-container w-full sm:w-auto">
              <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              <div className="relative flex-1 sm:w-48 group">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Suchen..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full bg-transparent border-none py-1.5 pl-8 pr-2 text-[12px] font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0" 
                />
              </div>
           </div>

           <button onClick={() => navigate('/dashboard/team/new')} className="btn-primary w-full sm:w-auto">
             <Plus size={16} /> <span className="uppercase tracking-wider">Hinzufügen</span>
           </button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
          <span className="label-caps">Mitarbeiterdaten werden geladen...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white m-2 py-20 animate-in fade-in">
          <AlertCircle size={32} className="text-slate-200 mb-2" />
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest text-center">Keine Mitarbeiter gefunden</p>
        </div>
      ) : viewMode === 'GRID' ? (
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 animate-in fade-in duration-500 pb-20 sm:pb-0">
          {filtered.map(emp => (
            <div key={emp.id} className="employee-card group h-full">
              <div className={`absolute top-0 left-0 w-full h-1 ${emp.user?.role === 'ADMIN' ? 'bg-violet-500' : 'bg-blue-500'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm transition-transform group-hover:scale-105
                        ${emp.user?.role === 'ADMIN' ? 'bg-violet-500' : 'bg-blue-500'}`}>
                        {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                    </div>
                    <div className="text-left overflow-hidden">
                        <h3 className="font-bold text-slate-900 text-[13px] leading-tight truncate pr-2">
                            {emp.firstName} {emp.lastName}
                        </h3>
                        <span className={`status-badge mt-1 ${emp.user?.role === 'ADMIN' ? 'bg-violet-50 text-violet-600 border-violet-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {emp.role}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => navigate(`/dashboard/team/${emp.id}`)} className="btn-icon-only hover:text-blue-600 hover:bg-blue-50"><Pencil size={14} /></button>
                   <button onClick={() => setDeleteModal({ isOpen: true, id: emp.id, name: `${emp.firstName} ${emp.lastName}` })} className="btn-icon-only hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                  <Mail size={12} className="text-slate-400 shrink-0" /> <span className="truncate">{emp.email}</span>
                </div>
                {emp.personnelNumber && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter px-1">
                    <Hash size={12} className="text-slate-300 shrink-0" /> <span>Personal-Nr: {emp.personnelNumber}</span>
                    </div>
                )}
              </div>
              
              <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-auto">
                 {emp.userId ? (
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                      <CheckCircle size={10} /> Aktiv
                    </span>
                  ) : (
                    <button onClick={() => handleResendInvite(emp.email)} className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 hover:bg-amber-600 hover:text-white transition-all uppercase tracking-widest">
                      <Send size={10} /> Einladen
                    </button>
                  )}
                  
                  <button 
                    onClick={() => navigate(`/dashboard/team/${emp.id}`)}
                    className="text-[10px] font-black text-slate-400 hover:text-blue-600 flex items-center gap-1 uppercase tracking-widest transition-colors"
                  >
                    Profil <ChevronRight size={12} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container animate-in slide-in-from-bottom-2 duration-300 pb-20 sm:pb-0">
          <div className="overflow-x-auto">
            <table className="table-main w-full min-w-[800px]">
                <thead className="table-head">
                <tr>
                    <th className="table-cell">Mitglied</th>
                    <th className="table-cell">Kontakt</th>
                    <th className="table-cell">Personalnummer</th>
                    <th className="table-cell text-center">Status</th>
                    <th className="table-cell text-right pr-4">Aktionen</th>
                </tr>
                </thead>
                <tbody>
                {filtered.map(emp => (
                    <tr key={emp.id} className="table-row group">
                    <td className="table-cell">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white shadow-sm
                                ${emp.user?.role === 'ADMIN' ? 'bg-violet-500' : 'bg-blue-500'}`}>
                                {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-slate-800 text-[13px]">{emp.firstName} {emp.lastName}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{emp.role}</div>
                            </div>
                        </div>
                    </td>
                    <td className="table-cell">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                                <Mail size={12} className="text-slate-300"/> {emp.email}
                            </div>
                            {emp.phone && (
                                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                                    <Phone size={11} className="text-slate-300"/> {emp.phone}
                                </div>
                            )}
                        </div>
                    </td>
                    <td className="table-cell">
                        <span className="font-mono text-[11px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            {emp.personnelNumber || '---'}
                        </span>
                    </td>
                    <td className="table-cell text-center">
                         {emp.userId ? (
                             <span className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100">
                                <Shield size={10} /> {emp.user?.role || 'USER'}
                             </span>
                         ) : (
                             <button onClick={() => handleResendInvite(emp.email)} className="status-badge bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white transition-all cursor-pointer">
                                <Send size={10} /> Ausstehend
                             </button>
                         )}
                    </td>
                    <td className="table-cell text-right pr-4">
                        <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => navigate(`/dashboard/team/${emp.id}`)} className="btn-icon-only hover:text-blue-600 hover:bg-blue-50"><Pencil size={14} /></button>
                          <button onClick={() => setDeleteModal({ isOpen: true, id: emp.id, name: `${emp.firstName} ${emp.lastName}` })} className="btn-icon-only hover:text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CONFIRM MODAL (Optimiertes Footer Padding) --- */}
      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        title="Mitarbeiter löschen?" 
        message={`Möchtest du ${deleteModal.name} wirklich unwiderruflich entfernen?`} 
        onConfirm={confirmDelete} 
        onCancel={() => setDeleteModal({ ...deleteModal, isOpen: false, id: '', name: '' })} 
      />

    </div>
  );
}