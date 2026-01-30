import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, User, Mail, CreditCard, Briefcase, 
  Badge as BadgeIcon, Loader2, Send, UserPlus, ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', personnelNumber: '',
    role: 'EMPLOYEE', position: 'Reinigungskraft', hourlyWage: '15.00'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Personalakte wird angelegt...');
    
    try {
      await api.post('/employees', { ...formData, sendInvite });
      toast.success(sendInvite ? 'Mitarbeiter erstellt & eingeladen!' : 'Mitarbeiter angelegt!', { id: toastId });
      navigate('/dashboard/team');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Speichern.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/dashboard/team')} 
          className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-2 mb-4 transition-all font-black uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"
        >
          <ArrowLeft size={14} /> Zurück
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="page-title text-3xl">Neues Teammitglied</h1>
            <p className="page-subtitle text-lg">Erfassen Sie Stammdaten und Vertragsdetails für neue Mitarbeiter.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-24">
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* LINKE SPALTE: PERSÖNLICHE DATEN */}
          <div className="space-y-6">
            <div className="form-card space-y-6">
              <div className="form-section-title">
                <User size={16} className="text-blue-500" /> Persönliche Daten
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="label-caps">Vorname *</label>
                    <input name="firstName" required placeholder="Max" className="input-standard font-bold" value={formData.firstName} onChange={handleChange} />
                  </div>
                  <div className="space-y-1">
                    <label className="label-caps">Nachname *</label>
                    <input name="lastName" required placeholder="Mustermann" className="input-standard font-bold" value={formData.lastName} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="label-caps">Dienst-E-Mail *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="email" type="email" required placeholder="m.mustermann@glanzops.de" className="input-standard pl-10" value={formData.email} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* EINLADUNGS OPTION */}
            <div 
              onClick={() => setSendInvite(!sendInvite)}
              className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                sendInvite ? 'bg-blue-600 border-blue-700 shadow-xl shadow-blue-500/20' : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sendInvite ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Send size={20} />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${sendInvite ? 'text-white' : 'text-slate-900'}`}>App-Zugang senden</h4>
                  <p className={`text-xs ${sendInvite ? 'text-blue-100' : 'text-slate-500'}`}>Mitarbeiter erhält Link zur Passwort-Erstellung.</p>
                </div>
              </div>
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sendInvite ? 'bg-emerald-400' : 'bg-slate-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sendInvite ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </div>
          </div>

          {/* RECHTE SPALTE: VERTRAGSDATEN */}
          <div className="space-y-6">
            <div className="form-card space-y-6 border-l-4 border-l-indigo-500 h-full">
              <div className="form-section-title text-indigo-700">
                <Briefcase size={16} className="text-indigo-500" /> Vertrag & Rolle
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="label-caps">Personalnummer (PNR)</label>
                        <div className="relative">
                            <BadgeIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input name="personnelNumber" className="input-standard pl-10 font-mono text-indigo-600 font-bold" value={formData.personnelNumber} onChange={handleChange} placeholder="P-001" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="label-caps">Stundenlohn (€)</label>
                        <div className="relative">
                            <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                            <input type="number" step="0.01" name="hourlyWage" className="input-standard pl-10 font-black text-emerald-700" value={formData.hourlyWage} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                  <label className="label-caps">Position / Titel</label>
                  <input name="position" className="input-standard font-bold" value={formData.position} onChange={handleChange} placeholder="z.B. Vorarbeiter" />
                </div>

                <div className="space-y-1">
                  <label className="label-caps">System-Rolle</label>
                  <div className="relative">
                    <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <select name="role" value={formData.role} onChange={handleChange} className="input-standard pl-10 appearance-none cursor-pointer font-bold bg-white">
                      <option value="EMPLOYEE">Mitarbeiter (App Zugriff)</option>
                      <option value="MANAGER">Manager (Eingeschränktes Dashboard)</option>
                      <option value="ADMIN">Administrator (Vollzugriff)</option>
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
              <button type="submit" disabled={loading} className="btn-primary py-3 px-8 shadow-lg shadow-blue-600/20 min-w-[200px]">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><UserPlus size={18} /> Anlegen</>}
              </button>
           </div>
        </div>

      </form>
    </div>
  );
}