import {
  ArrowLeft,
  Briefcase,
  Loader2,
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
        toast.error("Fehler beim Laden.");
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
      toast.error('Fehler.', { id: toastId });
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
      toast.error('Fehler.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="page-container">
      
      <div className="header-section">
        <div className="text-left">
            <button 
                onClick={() => navigate('/dashboard/team')} 
                className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 mb-2 font-bold uppercase tracking-wider transition-colors"
            >
                <ArrowLeft size={12} /> Zurück zur Liste
            </button>
            <h1 className="page-title">Personalakte bearbeiten</h1>
            <p className="page-subtitle">Daten von {formData.firstName} {formData.lastName}.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
        
        <div className={`p-4 mb-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${
          employeeState.hasUser ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${employeeState.hasUser ? 'bg-emerald-500 text-white' : 'bg-blue-50 text-white'}`}>
              {employeeState.hasUser ? <ShieldCheck size={20} /> : <Send size={20} />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{employeeState.hasUser ? 'Account Aktiv' : 'Zugang Ausstehend'}</h4>
              <p className="text-[11px] text-slate-500">{employeeState.hasUser ? 'Mitarbeiter ist aktiv.' : 'Einladung noch offen.'}</p>
            </div>
          </div>
          {!employeeState.hasUser && (
            <button type="button" onClick={handleResendInvite} disabled={resending} className="btn-primary !py-2 !px-4 text-[10px]">
              {resending ? <Loader2 size={14} className="animate-spin" /> : 'Erneut senden'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
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
                        <input disabled className="input-standard bg-slate-50 text-slate-400" value={formData.email} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-[3px] border-l-indigo-500">
                <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-700 uppercase tracking-widest border-b border-slate-50 pb-2 mb-4">
                    <Briefcase size={14} className="text-indigo-500" /> Vertrag & Rolle
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label-caps">Personal-Nr.</label>
                            <input name="personnelNumber" className="input-standard font-mono text-indigo-600 font-bold" value={formData.personnelNumber} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="label-caps">Stundenlohn</label>
                            <input type="number" step="0.01" name="hourlyWage" className="input-standard font-bold text-emerald-700" value={formData.hourlyWage} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="label-caps">Position</label>
                        <input name="position" className="input-standard font-bold" value={formData.position} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="label-caps">Rolle</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="input-standard font-bold bg-white">
                            <option value="EMPLOYEE">Mitarbeiter</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Administrator</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* FLOATING FOOTER - ANGEPASST FÜR NAVBAR */}
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 md:left-auto md:w-auto z-30">
           <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
              <button type="button" onClick={() => navigate('/dashboard/team')} className="flex-1 md:flex-none px-4 py-2 rounded-lg text-slate-500 font-bold text-[11px] uppercase hover:bg-slate-50 transition-colors">Abbrechen</button>
              <button type="submit" disabled={saving} className="btn-primary flex-[2] md:flex-none py-2.5 px-8 shadow-lg shadow-blue-600/20 min-w-[140px] text-[11px] uppercase tracking-widest font-black">
                {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Speichern</>}
              </button>
           </div>
        </div>

      </form>
    </div>
  );
}