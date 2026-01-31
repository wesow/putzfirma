import {
  ArrowLeft,
  Badge as BadgeIcon,
  Briefcase,
  CreditCard,
  Loader2,
  Mail,
  Save,
  Send, ShieldCheck,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';

export default function EditEmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  
  const [employeeState, setEmployeeState] = useState<{
    hasUser: boolean; hasInvite: boolean;
  }>({ hasUser: false, hasInvite: false });

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', personnelNumber: '',
    role: 'EMPLOYEE', position: '', hourlyWage: ''
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        const emp = res.data;
        
        setEmployeeState({
          hasUser: !!emp.userId,
          hasInvite: !!emp.invitation && !emp.invitation.isAccepted
        });

        setFormData({
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          email: emp.email || '',
          personnelNumber: emp.personnelNumber || '',
          role: emp.user?.role || 'EMPLOYEE',
          position: emp.role || '', 
          hourlyWage: emp.hourlyWage ? String(emp.hourlyWage) : ''
        });
      } catch (error) {
        toast.error("Mitarbeiter konnte nicht geladen werden.");
        navigate('/dashboard/team');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeData();
  }, [id, navigate]);

  const handleResendInvite = async () => {
    setResending(true);
    const toastId = toast.loading('Sende Einladung...');
    try {
      await api.post('/auth/invite', { email: formData.email, role: formData.role });
      toast.success('Versendet!', { id: toastId });
    } catch (error) {
      toast.error('Fehler beim Senden.', { id: toastId });
    } finally {
      setResending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Speichere...');

    try {
      await api.put(`/employees/${id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        personnelNumber: formData.personnelNumber,
        role: formData.role,
        position: formData.position,
        hourlyWage: Number(formData.hourlyWage)
      });
      
      toast.success('Gespeichert!', { id: toastId });
      navigate('/dashboard/team');
    } catch (error: any) {
      toast.error('Fehler beim Speichern.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="text-[10px] uppercase tracking-widest font-bold">Lade Akte...</span>
    </div>
  );

  return (
    <div className="page-container space-y-4">
      
      {/* HEADER */}
      <div className="header-section">
        <div className="text-left">
            <button 
                onClick={() => navigate('/dashboard/team')} 
                className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 mb-2 font-bold uppercase tracking-wider transition-colors"
            >
                <ArrowLeft size={12} /> Zurück zur Liste
            </button>
            <h1 className="page-title">Personalakte bearbeiten</h1>
            <p className="page-subtitle">Daten von <span className="text-slate-900 font-bold">{formData.firstName} {formData.lastName}</span>.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        {/* STATUS BANNER */}
        <div className={`p-4 mb-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${
          employeeState.hasUser ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${employeeState.hasUser ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
              {employeeState.hasUser ? <ShieldCheck size={20} /> : <Send size={20} />}
            </div>
            <div>
              <h4 className={`text-sm font-bold tracking-tight ${employeeState.hasUser ? 'text-emerald-900' : 'text-blue-900'}`}>
                {employeeState.hasUser ? 'Account Aktiv' : 'Zugang Ausstehend'}
              </h4>
              <p className={`text-[11px] ${employeeState.hasUser ? 'text-emerald-700' : 'text-blue-700'}`}>
                {employeeState.hasUser ? 'Mitarbeiter kann sich einloggen.' : 'Einladung noch nicht angenommen.'}
              </p>
            </div>
          </div>
          {!employeeState.hasUser && (
            <button type="button" onClick={handleResendInvite} disabled={resending} className="btn-primary !bg-blue-600 !border-blue-700 !py-2 !px-4 text-[11px]">
              {resending ? <Loader2 className="animate-spin" size={14} /> : 'Einladung erneut senden'}
            </button>
          )}
        </div>

        {/* 2-SPALTEN LAYOUT (FULL WIDTH) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">

            {/* LINKE SPALTE */}
            <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-4">
                        <User size={14} className="text-blue-500" /> Stammdaten
                    </div>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="label-caps">Vorname</label>
                                <input name="firstName" className="input-standard font-bold" value={formData.firstName} onChange={handleChange} />
                            </div>
                            <div className="space-y-1">
                                <label className="label-caps">Nachname</label>
                                <input name="lastName" className="input-standard font-bold" value={formData.lastName} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="label-caps">E-Mail (System)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail size={16} /></div>
                                <input disabled className="input-standard pl-9 bg-slate-50 text-slate-400 cursor-not-allowed" value={formData.email} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RECHTE SPALTE */}
            <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-[3px] border-l-indigo-500 h-full">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-700 uppercase tracking-widest border-b border-slate-50 pb-2 mb-4">
                        <Briefcase size={14} className="text-indigo-500" /> Vertrag & Rolle
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="label-caps">Personal-Nr.</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><BadgeIcon size={16} /></div>
                                    <input name="personnelNumber" className="input-standard pl-9 font-mono text-indigo-600 font-bold" value={formData.personnelNumber} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="label-caps">Stundenlohn</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><CreditCard size={16} /></div>
                                    <input type="number" step="0.01" name="hourlyWage" className="input-standard pl-9 font-bold text-emerald-700" value={formData.hourlyWage} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="label-caps">Position</label>
                            <input name="position" className="input-standard font-bold" value={formData.position} onChange={handleChange} />
                        </div>
                        <div className="space-y-1">
                            <label className="label-caps">System-Rolle</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><ShieldCheck size={16} /></div>
                                <select name="role" value={formData.role} onChange={handleChange} className="input-standard pl-9 cursor-pointer font-bold bg-white appearance-none">
                                    <option value="EMPLOYEE">Mitarbeiter</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="ADMIN">Administrator</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* FLOATING FOOTER */}
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-auto z-40">
           <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
              <button type="button" onClick={() => navigate('/dashboard/team')} className="px-4 py-2 rounded-lg text-slate-500 font-bold text-[11px] uppercase hover:bg-slate-50 transition-colors">Abbrechen</button>
              <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6 shadow-md min-w-[140px] text-[11px]">
                {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Speichern</>}
              </button>
           </div>
        </div>

      </form>
    </div>
  );
}