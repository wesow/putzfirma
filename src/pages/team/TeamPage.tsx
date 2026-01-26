import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Mail, Loader2, Send, 
  CheckCircle, Pencil, Trash2, Shield, 
  Hash, AlertCircle 
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';
import ViewSwitcher from '../../components/ViewSwitcher';

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
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title">Team-Verwaltung</h1>
          <p className="text-slate-500 text-sm font-medium tracking-tight">Personalstamm und Berechtigungen.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
          
          <div className="relative flex-1 md:flex-initial min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Suchen..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="input-standard pl-10" 
            />
          </div>

          <button onClick={() => navigate('/dashboard/team/new')} className="btn-primary">
            <Plus size={18} /> Mitglied einladen
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-3 text-blue-600" size={32} />
          <span className="font-bold text-xs uppercase tracking-widest italic text-slate-500">Daten werden synchronisiert...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
          <AlertCircle className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">Keine Teammitglieder gefunden.</p>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300">
          {filtered.map(emp => (
            <div key={emp.id} className="employee-card group">
              {/* Farbstreifen oben passend zur technischen Rolle */}
              <div className={`absolute top-0 left-0 w-full h-1 ${emp.user?.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
              
              <div className="flex justify-between items-start mb-6 pt-2">
                <div className="text-left overflow-hidden">
                  <h3 className="font-black text-slate-900 text-lg leading-tight truncate">
                    {emp.firstName} {emp.lastName}
                  </h3>
                  <span className={`status-badge mt-1.5 ${emp.user?.role === 'ADMIN' ? 'role-badge-admin' : 'role-badge-employee'}`}>
                    {emp.role}
                  </span>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                  <button onClick={() => navigate(`/dashboard/team/${emp.id}`)} className="btn-ghost-danger hover:text-blue-600 hover:bg-blue-50"><Pencil size={16} /></button>
                  <button onClick={() => setDeleteModal({ isOpen: true, id: emp.id, name: `${emp.firstName} ${emp.lastName}` })} className="btn-ghost-danger"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-left">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <Mail size={14} className="text-slate-300" /> <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-700 font-bold italic tracking-tight">
                  <Hash size={14} className="text-blue-400" /> PNR: {emp.personnelNumber || 'N/A'}
                </div>
                
                <div className="flex items-center gap-2 pt-4 mt-3 border-t border-slate-50">
                  {emp.userId ? (
                    <span className="status-badge bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm">
                      <CheckCircle size={10} /> AKTIVIERT
                    </span>
                  ) : (
                    <button onClick={() => handleResendInvite(emp.email)} className="status-badge bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 transition-all font-black">
                      <Send size={10} /> RE-INVITE
                    </button>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => navigate(`/dashboard/team/${emp.id}`)}
                className="btn-secondary w-full py-2.5 justify-center text-[10px] uppercase tracking-[0.2em] font-black"
              >
                Personalakte öffnen
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* --- TABLE VIEW --- */
        <div className="table-container animate-in slide-in-from-bottom-2 duration-300">
          <table className="table-main text-left">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Mitarbeiter</th>
                <th className="table-cell">PNR</th>
                <th className="table-cell">Position</th>
                <th className="table-cell text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} className="table-row group">
                  <td className="table-cell">
                    <div className="font-bold text-slate-800 leading-tight">{emp.firstName} {emp.lastName}</div>
                    <div className="text-[10px] text-slate-400 font-medium lowercase italic">{emp.email}</div>
                  </td>
                  <td className="table-cell font-mono text-xs font-bold text-slate-600">
                    {emp.personnelNumber || '---'}
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${emp.user?.role === 'ADMIN' ? 'role-badge-admin' : 'role-badge-employee'}`}>
                      <Shield size={10} /> {emp.role}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => navigate(`/dashboard/team/${emp.id}`)} className="btn-ghost-danger hover:text-blue-600 hover:bg-blue-50"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: emp.id, name: `${emp.firstName} ${emp.lastName}` })} className="btn-ghost-danger hover:text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        title="Mitglied entfernen?" 
        message={`Möchtest du ${deleteModal.name} wirklich unwiderruflich löschen?`} 
        onConfirm={confirmDelete} 
        onCancel={() => setDeleteModal({ ...deleteModal, isOpen: false, id: '', name: '' })} 
      />
    </div>
  );
}