import {
  ArrowLeft,
  Badge as BadgeIcon,
  Briefcase,
  CreditCard,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
  User,
  UserPlus
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
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
    const toastId = toast.loading('Lege Personalakte an...');
    
    try {
      await api.post('/employees', { ...formData, sendInvite });
      toast.success(sendInvite ? 'Erstellt & eingeladen!' : 'Erstellt!', { id: toastId });
      navigate('/dashboard/team');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Speichern.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="page-title">Neues Teammitglied</h1>
            <p className="page-subtitle">Erfassen Sie Stammdaten und Vertragsdetails für neue Mitarbeiter.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
          
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-4">
                <User size={14} className="text-blue-500" /> Persönliche Daten
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
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
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Mail size={16} /></div>
                    <input name="email" type="email" required placeholder="m.mustermann@glanzops.de" className="input-standard pl-9" value={formData.email} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setSendInvite(!sendInvite)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                sendInvite ? 'bg-blue-600 border-blue-700 shadow-md' : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sendInvite ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Send size={16} />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${sendInvite ? 'text-white' : 'text-slate-900'}`}>App-Zugang senden</h4>
                  <p className={`text-[10px] ${sendInvite ? 'text-blue-100' : 'text-slate-500'}`}>Mitarbeiter erhält Einladungs-Link.</p>
                </div>
              </div>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${sendInvite ? 'bg-emerald-400' : 'bg-slate-300'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${sendInvite ? 'translate-x-4.5' : 'translate-x-1'}`} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-[3px] border-l-indigo-500 h-full">
              <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-700 uppercase tracking-widest border-b border-slate-50 pb-2 mb-4">
                <Briefcase size={14} className="text-indigo-500" /> Vertrag & Rolle
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="label-caps">Personalnummer</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors"><BadgeIcon size={16} /></div>
                            <input name="personnelNumber" className="input-standard pl-9 font-mono text-indigo-600 font-bold" value={formData.personnelNumber} onChange={handleChange} placeholder="P-001" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="label-caps">Stundenlohn (€)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors"><CreditCard size={16} /></div>
                            <input type="number" step="0.01" name="hourlyWage" className="input-standard pl-9 font-bold text-emerald-700" value={formData.hourlyWage} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                  <label className="label-caps">Position / Titel</label>
                  <input name="position" className="input-standard font-bold" value={formData.position} onChange={handleChange} placeholder="z.B. Vorarbeiter" />
                </div>

                <div className="space-y-1">
                  <label className="label-caps">System-Rolle</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors"><ShieldCheck size={16} /></div>
                    <select name="role" value={formData.role} onChange={handleChange} className="input-standard pl-9 appearance-none cursor-pointer font-bold bg-white">
                      <option value="EMPLOYEE">Mitarbeiter (App Zugriff)</option>
                      <option value="MANAGER">Manager (Eingeschränkt)</option>
                      <option value="ADMIN">Administrator (Vollzugriff)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* FLOATING FOOTER - ANGEPASST FÜR NAVBAR */}
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 md:left-auto md:w-auto z-30">
           <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
              <button type="button" onClick={() => navigate('/dashboard/team')} className="flex-1 md:flex-none px-4 py-2 rounded-lg text-slate-500 font-bold text-[11px] uppercase hover:bg-slate-50 transition-colors">Abbrechen</button>
              <button type="submit" disabled={loading} className="btn-primary flex-[2] md:flex-none py-2.5 px-8 shadow-lg shadow-blue-600/20 min-w-[140px] text-[11px] uppercase tracking-widest font-black">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <><UserPlus size={16} /> Anlegen</>}
              </button>
           </div>
        </div>

      </form>
    </div>
  );
}