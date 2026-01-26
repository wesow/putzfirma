import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  User, 
  Mail, 
  CreditCard, 
  Briefcase, 
  Badge as BadgeIcon, 
  Loader2, 
  ShieldCheck, 
  Send,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    personnelNumber: '',
    role: 'EMPLOYEE',
    position: 'Reinigungskraft',
    hourlyWage: '15.00'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Mitarbeiter wird im System angelegt...');
    
    try {
      await api.post('/employees', { ...formData, sendInvite });
      
      toast.success(sendInvite ? 'Mitarbeiter erstellt & Einladung versendet!' : 'Mitarbeiter erfolgreich angelegt!', { id: toastId });
      navigate('/dashboard/team');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Fehler beim Speichern.';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/team')} 
          className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-2 mb-4 transition-all font-black uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"
        >
          <ArrowLeft size={14} /> Zurück zur Übersicht
        </button>
        <div className="header-section !bg-transparent !border-none !p-0 !shadow-none">
          <div className="text-left">
            <h1 className="page-title text-3xl font-black">Neues Teammitglied</h1>
            <p className="page-subtitle text-lg">Erfassen Sie Personaldaten und konfigurieren Sie den Systemzugriff.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* BASISDATEN CARD */}
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
                  placeholder="Max"
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
                  placeholder="Mustermann"
                  className="input-standard pl-12 font-black" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5 text-left">
              <label className="label-caps">E-Mail Adresse (Dienstlich) *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  className="input-standard pl-12" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="m.mustermann@glanzops.de"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BERECHTIGUNGEN CARD */}
        <div className="form-card space-y-8">
          <div className="form-section-title">
            <ShieldCheck size={16} className="text-blue-500" /> 2. Systemrolle & Konditionen
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5 text-left">
              <label className="label-caps">Berechtigungsstufe</label>
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
              <label className="label-caps">Interne Position</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Briefcase size={18} />
                </div>
                <input 
                  name="position" 
                  className="input-standard pl-12 font-bold" 
                  value={formData.position} 
                  onChange={handleChange} 
                  placeholder="z.B. Vorarbeiter"
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
                  placeholder="P-001"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5 text-left">
              <label className="label-caps text-emerald-600">Vereinbarter Stundenlohn (€)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <CreditCard size={18} />
                </div>
                <input 
                  type="number" 
                  name="hourlyWage" 
                  step="0.01" 
                  className="input-standard pl-12 font-black text-emerald-700 text-lg" 
                  value={formData.hourlyWage} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* EINLADUNGS OPTION */}
        <div 
          onClick={() => setSendInvite(!sendInvite)}
          className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer ${
            sendInvite ? 'bg-blue-600 border-blue-700 shadow-xl shadow-blue-200' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-5 text-left">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              sendInvite ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              <Send size={24} />
            </div>
            <div>
              <h4 className={`text-base font-black tracking-tight ${sendInvite ? 'text-white' : 'text-slate-900'}`}>System-Einladung versenden</h4>
              <p className={`text-sm font-medium ${sendInvite ? 'text-blue-100' : 'text-slate-500'}`}>Link zur Passwort-Vergabe wird automatisch generiert.</p>
            </div>
          </div>
          
          <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            sendInvite ? 'bg-emerald-400' : 'bg-slate-200'
          }`}>
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              sendInvite ? 'translate-x-6' : 'translate-x-1'
            }`} />
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
            disabled={loading} 
            className="btn-primary min-w-[240px] shadow-xl shadow-blue-500/20 py-4 uppercase tracking-widest font-black text-[10px]"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                <UserPlus size={18} />
                Mitarbeiter jetzt anlegen
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}