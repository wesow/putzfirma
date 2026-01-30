import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, ArrowLeft, User, Mail, CreditCard, Briefcase, 
  Badge as BadgeIcon, Loader2, Send, CheckCircle, ShieldCheck 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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
          position: emp.role || '', // DB field 'role' is position, user.role is system role
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

  if (loading) return <div className="page-container flex justify-center py-40"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="page-container max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-6">
        <button onClick={() => navigate('/dashboard/team')} className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-2 mb-4 font-black uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm transition-all">
          <ArrowLeft size={14} /> Zurück
        </button>
        <h1 className="page-title text-3xl">Personalakte bearbeiten</h1>
        <p className="page-subtitle text-lg">Daten von <span className="text-slate-900 font-bold">{formData.firstName} {formData.lastName}</span>.</p>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-24">
        
        {/* STATUS BANNER */}
        <div className={`p-6 mb-8 rounded-[2rem] border flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm ${
          employeeState.hasUser ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${employeeState.hasUser ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
              {employeeState.hasUser ? <ShieldCheck size={28} /> : <Send size={28} />}
            </div>
            <div>
              <h4 className={`text-lg font-black tracking-tight ${employeeState.hasUser ? 'text-emerald-900' : 'text-blue-900'}`}>
                {employeeState.hasUser ? 'Account Aktiv' : 'Zugang Ausstehend'}
              </h4>
              <p className={`text-sm ${employeeState.hasUser ? 'text-emerald-700' : 'text-blue-700'}`}>
                {employeeState.hasUser ? 'Mitarbeiter kann sich in die App einloggen.' : 'Mitarbeiter hat Einladung noch nicht angenommen.'}
              </p>
            </div>
          </div>
          {!employeeState.hasUser && (
            <button type="button" onClick={handleResendInvite} disabled={resending} className="btn-primary !bg-blue-600 !border-blue-700 min-w-[200px]">
              {resending ? <Loader2 className="animate-spin" size={18} /> : 'Einladung senden'}
            </button>
          )}
        </div>

        {/* 2-SPALTEN LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* LINKE SPALTE */}
            <div className="space-y-6">
                <div className="form-card space-y-6">
                    <div className="form-section-title"><User size={16} className="text-blue-500" /> Stammdaten</div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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
                            <label className="label-caps">E-Mail (Locked)</label>
                            <input disabled className="input-standard bg-slate-50 text-slate-400 cursor-not-allowed border-dashed" value={formData.email} />
                        </div>
                    </div>
                </div>
            </div>

            {/* RECHTE SPALTE */}
            <div className="space-y-6">
                <div className="form-card space-y-6 border-l-4 border-l-indigo-500 h-full">
                    <div className="form-section-title text-indigo-700"><Briefcase size={16} className="text-indigo-500" /> Vertrag & Rolle</div>
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="label-caps">Personal-Nr.</label>
                                <input name="personnelNumber" className="input-standard font-mono text-indigo-600 font-bold" value={formData.personnelNumber} onChange={handleChange} />
                            </div>
                            <div className="space-y-1">
                                <label className="label-caps">Stundenlohn</label>
                                <input type="number" step="0.01" name="hourlyWage" className="input-standard font-black text-emerald-700" value={formData.hourlyWage} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="label-caps">Position</label>
                            <input name="position" className="input-standard font-bold" value={formData.position} onChange={handleChange} />
                        </div>
                        <div className="space-y-1">
                            <label className="label-caps">System-Rolle</label>
                            <div className="relative">
                                <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                                <select name="role" value={formData.role} onChange={handleChange} className="input-standard pl-10 cursor-pointer font-bold bg-white">
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
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-auto z-40">
           <div className="bg-white/90 backdrop-blur-md p-2 rounded-[2rem] border border-slate-200 shadow-2xl flex items-center gap-2">
              <button type="button" onClick={() => navigate('/dashboard/team')} className="px-6 py-3 rounded-xl text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 transition-colors">Abbrechen</button>
              <button type="submit" disabled={saving} className="btn-primary py-3 px-8 shadow-lg shadow-blue-600/20 min-w-[200px]">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Speichern</>}
              </button>
           </div>
        </div>

      </form>
    </div>
  );
}