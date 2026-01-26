import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  User, 
  Mail, 
  CreditCard, 
  Briefcase, 
  Badge as BadgeIcon, 
  Loader2, 
  Send, 
  CheckCircle, 
  ShieldCheck 
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
    hasUser: boolean;
    hasInvite: boolean;
  }>({ hasUser: false, hasInvite: false });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    personnelNumber: '',
    role: 'EMPLOYEE',
    position: '',
    hourlyWage: ''
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
        console.error("Fehler beim Laden:", error);
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
    const toastId = toast.loading('Einladung wird erneut versendet...');
    try {
      await api.post('/auth/invite', { email: formData.email, role: formData.role });
      toast.success('Einladung erfolgreich erneut versendet!', { id: toastId });
    } catch (error) {
      toast.error('Fehler beim Versenden der Einladung.', { id: toastId });
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
    const toastId = toast.loading('Änderungen werden gespeichert...');

    try {
      await api.put(`/employees/${id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        personnelNumber: formData.personnelNumber,
        role: formData.role,
        position: formData.position,
        hourlyWage: Number(formData.hourlyWage)
      });
      
      toast.success('Mitarbeiter erfolgreich aktualisiert!', { id: toastId });
      navigate('/dashboard/team');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Aktualisieren.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Lade Personalakte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      
      {/* HEADER & NAVIGATION */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/team')} 
          className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-2 mb-4 transition-all font-black uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"
        >
          <ArrowLeft size={14} /> Zurück zur Teamverwaltung
        </button>
        <div className="header-section !bg-transparent !border-none !p-0 !shadow-none">
          <div className="text-left">
            <h1 className="page-title text-3xl font-black">Personalakte bearbeiten</h1>
            <p className="page-subtitle text-lg">Aktualisieren Sie die Daten von <span className="text-slate-900 font-bold">{formData.firstName} {formData.lastName}</span>.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ACCOUNT STATUS BANNER */}
        <div className={`p-6 rounded-[2rem] border flex flex-col md:flex-row items-center justify-between gap-6 transition-all shadow-xl ${
          employeeState.hasUser 
            ? 'bg-emerald-50 border-emerald-100 shadow-emerald-600/5' 
            : 'bg-blue-50 border-blue-100 shadow-blue-600/5'
        }`}>
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
              employeeState.hasUser ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {employeeState.hasUser ? <ShieldCheck size={28} /> : <Send size={28} />}
            </div>
            <div className="text-left">
              <h4 className={`text-lg font-black tracking-tight ${employeeState.hasUser ? 'text-emerald-900' : 'text-blue-900'}`}>
                {employeeState.hasUser ? 'System-Zugriff Aktiv' : 'Einladung Ausstehend'}
              </h4>
              <p className={`text-sm font-medium leading-relaxed ${employeeState.hasUser ? 'text-emerald-700' : 'text-blue-700'} max-w-md`}>
                {employeeState.hasUser 
                  ? 'Dieser Mitarbeiter nutzt bereits einen aktiven GlanzOps Account für das Team-Portal.' 
                  : 'Der Mitarbeiter wurde eingeladen, hat seinen Account aber noch nicht vollständig aktiviert.'}
              </p>
            </div>
          </div>
          
          {!employeeState.hasUser && (
            <button 
              type="button"
              onClick={handleResendInvite}
              disabled={resending}
              className="btn-primary !bg-blue-600 !border-blue-700 min-w-[200px] shadow-lg shadow-blue-500/20"
            >
              {resending ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Einladung senden</>}
            </button>
          )}
        </div>

        {/* PERSÖNLICHE DATEN CARD */}
        <div className="form-card space-y-8">
          <div className="form-section-title">
            <User size={16} className="text-blue-500" /> 1. Persönliche Informationen
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 text-left">
              <label className="label-caps">Vorname *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  name="firstName" 
                  required 
                  className="input-standard pl-12 font-black" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="label-caps">Nachname *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  name="lastName" 
                  required 
                  className="input-standard pl-12 font-black" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5 text-left opacity-60">
              <label className="label-caps text-slate-400">Dienst-Email (Primärschlüssel - Schreibgeschützt)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  name="email" 
                  type="email" 
                  disabled 
                  className="input-standard pl-12 bg-slate-50 cursor-not-allowed border-dashed" 
                  value={formData.email} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM & VERTRAG CARD */}
        <div className="form-card space-y-8">
          <div className="form-section-title">
            <ShieldCheck size={16} className="text-blue-500" /> 2. Rolle & Vertragsdetails
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5 text-left">
              <label className="label-caps">System-Berechtigung</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <ShieldCheck size={18} />
                </div>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  className="input-standard pl-12 appearance-none cursor-pointer font-bold"
                >
                  <option value="EMPLOYEE">Standard-Mitarbeiter (Team-App)</option>
                  <option value="ADMIN">Administrator (Vollzugriff Dashboard)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="label-caps">Funktion / Berufsbezeichnung</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Briefcase size={18} />
                </div>
                <input 
                  name="position" 
                  className="input-standard pl-12 font-bold" 
                  value={formData.position} 
                  onChange={handleChange} 
                  placeholder="z.B. Objektleitung" 
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="label-caps">Personalnummer (PNR) *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <BadgeIcon size={18} />
                </div>
                <input 
                  name="personnelNumber" 
                  required 
                  className="input-standard pl-12 font-mono font-black text-blue-600" 
                  value={formData.personnelNumber} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5 text-left">
              <label className="label-caps text-emerald-600">Stundenlohn (€)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <CreditCard size={18} />
                </div>
                <input 
                  name="hourlyWage" 
                  type="number" 
                  step="0.01"
                  className="input-standard pl-12 font-black text-emerald-700" 
                  value={formData.hourlyWage} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-4 bg-slate-100/50 p-6 rounded-[2rem] border border-slate-100">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard/team')} 
            className="btn-secondary !shadow-none border-transparent hover:bg-slate-200"
          >
            Abbrechen
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className="btn-primary min-w-[240px] shadow-xl shadow-blue-500/20 py-4 uppercase tracking-widest font-black text-[10px]"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Änderungen speichern</>}
          </button>
        </div>
      </form>
    </div>
  );
}