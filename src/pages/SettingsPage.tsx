import { useState, useEffect } from 'react';
import { 
  Save, Building2, Lock, CreditCard, Mail, 
  MapPin, Phone, Globe, Hash, Loader2, ShieldCheck, Banknote,
  ChevronRight,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'SECURITY'>('COMPANY');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companyData, setCompanyData] = useState({
    companyName: '',
    street: '',
    zipCode: '',
    city: '',
    email: '',
    phone: '',
    website: '',
    taxId: '',
    vatId: '',
    iban: '',
    bic: '',
    bankName: ''
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/company');
      if (res.data) {
          setCompanyData(prev => ({ ...prev, ...res.data }));
      }
    } catch (e) {
      toast.error("Fehler beim Laden der Einstellungen.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Änderungen werden übernommen...");
    try {
      await api.put('/settings/company', companyData);
      toast.success("Firmendaten erfolgreich aktualisiert!", { id: toastId });
    } catch (error) {
      toast.error("Fehler beim Speichern.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("Die neuen Passwörter stimmen nicht überein.");
    setSaving(true);
    try {
      await api.post('/auth/change-password', { 
          currentPassword: passwords.current, 
          newPassword: passwords.new 
      });
      toast.success("Passwort wurde erfolgreich geändert!");
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Fehler bei der Passwortänderung.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={44} />
          <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Synchronisiere System-Konfiguration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-5xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title leading-none">System-Einstellungen</h1>
          <p className="page-subtitle text-slate-500 mt-2 font-medium">Verwaltung der globalen Firmen-Identität und Sicherheitsprotokolle.</p>
        </div>
      </div>

      {/* CUSTOM TAB NAVIGATION */}
      <div className="flex justify-center md:justify-start mb-6 animate-in fade-in duration-500">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 inline-flex shadow-inner">
            <button 
                onClick={() => setActiveTab('COMPANY')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'COMPANY' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
                <Building2 size={16} /> Firmendaten
            </button>
            <button 
                onClick={() => setActiveTab('SECURITY')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'SECURITY' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
                <ShieldCheck size={16} /> Sicherheit
            </button>
          </div>
      </div>

      {/* --- TAB: COMPANY --- */}
      {activeTab === 'COMPANY' && (
        <form onSubmit={handleSaveCompany} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="form-card space-y-10">
                <div className="form-section-title">
                    <Building2 size={16} className="text-blue-500" /> 1. Identität & Standort
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="label-caps">Offizieller Firmenname</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Building2 size={20} /></div>
                            <input className="input-standard pl-12 font-black text-lg" value={companyData.companyName} onChange={e => setCompanyData({...companyData, companyName: e.target.value})} placeholder="z.B. GlanzOps Gebäudereinigung GmbH" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="label-caps">Straße & Hausnummer</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><MapPin size={20} /></div>
                            <input className="input-standard pl-12 font-bold" value={companyData.street} onChange={e => setCompanyData({...companyData, street: e.target.value})} placeholder="Musterstraße 12" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-1 space-y-1.5">
                            <label className="label-caps">PLZ</label>
                            <input className="input-standard font-black font-mono text-center tracking-tighter" value={companyData.zipCode} onChange={e => setCompanyData({...companyData, zipCode: e.target.value})} placeholder="12345" />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <label className="label-caps">Stadt</label>
                            <input className="input-standard font-bold" value={companyData.city} onChange={e => setCompanyData({...companyData, city: e.target.value})} placeholder="Berlin" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-card space-y-10">
                <div className="form-section-title">
                    <Mail size={16} className="text-blue-500" /> 2. Digitale Erreichbarkeit
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="space-y-1.5">
                        <label className="label-caps">Zentrale E-Mail</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Mail size={18} /></div>
                            <input type="email" className="input-standard pl-12" value={companyData.email} onChange={e => setCompanyData({...companyData, email: e.target.value})} placeholder="office@glanzops.de" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="label-caps">Zentrale Telefonnummer</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Phone size={18} /></div>
                            <input className="input-standard pl-12 font-bold" value={companyData.phone} onChange={e => setCompanyData({...companyData, phone: e.target.value})} placeholder="+49 30 123456" />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="label-caps">Webseite (URL)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Globe size={18} /></div>
                            <input className="input-standard pl-12" value={companyData.website} onChange={e => setCompanyData({...companyData, website: e.target.value})} placeholder="www.glanzops.de" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-card space-y-10">
                <div className="form-section-title">
                    <Banknote size={16} className="text-blue-500" /> 3. Finanz- & Steuerparameter
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="label-caps">Name des Kreditinstituts</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Building2 size={18} /></div>
                            <input className="input-standard pl-12 font-black" value={companyData.bankName} onChange={e => setCompanyData({...companyData, bankName: e.target.value})} placeholder="Beispielbank AG" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="label-caps text-blue-600">IBAN</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><CreditCard size={18} /></div>
                            <input className="input-standard pl-12 font-mono font-black" value={companyData.iban} onChange={e => setCompanyData({...companyData, iban: e.target.value})} placeholder="DE00 0000 0000..." />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="label-caps">BIC (SWIFT-Code)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Hash size={18} /></div>
                            <input className="input-standard pl-12 font-mono uppercase font-black" value={companyData.bic} onChange={e => setCompanyData({...companyData, bic: e.target.value})} placeholder="BANKDE..." />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="label-caps">Steuernummer</label>
                        <input className="input-standard font-bold" value={companyData.taxId} onChange={e => setCompanyData({...companyData, taxId: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="label-caps">Umsatzsteuer-Identifikationsnummer</label>
                        <input className="input-standard font-black uppercase" value={companyData.vatId} onChange={e => setCompanyData({...companyData, vatId: e.target.value})} placeholder="DE123456789" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 bg-slate-100/50 p-6 rounded-[2.5rem] border border-slate-100">
                <button 
                    type="submit"
                    disabled={saving} 
                    className="btn-primary min-w-[240px] shadow-xl shadow-blue-500/20 py-4 uppercase tracking-[0.2em] font-black text-[10px]"
                >
                    {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save size={18} /> System-Update speichern</>}
                </button>
            </div>
        </form>
      )}

      {/* --- TAB: SECURITY --- */}
      {activeTab === 'SECURITY' && (
        <div className="max-w-2xl mx-auto md:mx-0 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <form onSubmit={handlePasswordChange} className="form-card space-y-10">
                <div className="form-section-title">
                    <Lock size={16} className="text-blue-500" /> System-Identität schützen
                </div>

                <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden group mb-8">
                    <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="flex items-start gap-5 relative z-10">
                        <div className="bg-white/20 p-3.5 rounded-2xl backdrop-blur-md shadow-xl border border-white/10">
                            <Fingerprint size={28} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-black text-lg uppercase tracking-widest mb-1">Passwort-Richtlinie</h4>
                            <p className="text-blue-100 text-sm leading-relaxed font-medium">
                                Nutzen Sie ein sicheres Passwort mit mindestens 10 Zeichen, bestehend aus Sonderzeichen, Ziffern sowie Groß- und Kleinschreibung.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 text-left">
                    <div className="space-y-1.5">
                        <label className="label-caps">Aktuelles System-Passwort</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Lock size={18} /></div>
                            <input type="password" required className="input-standard pl-12 font-bold" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="label-caps">Neues Passwort festlegen</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Lock size={18} /></div>
                            <input type="password" required className="input-standard pl-12 font-bold" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="label-caps">Sicherheitsbestätigung (Wiederholen)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Lock size={18} /></div>
                            <input type="password" required className="input-standard pl-12 font-bold" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                    <button disabled={saving} className="btn-primary w-full !bg-slate-950 border-slate-950 shadow-2xl py-5 uppercase tracking-[0.2em] font-black text-[10px]">
                        {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <><ShieldCheck size={20} /> Zugangsdaten aktualisieren</>}
                    </button>
                </div>
            </form>
        </div>
      )}

      {/* SYSTEM FOOTER */}
      <div className="mt-16 text-center border-t border-slate-100 pt-10">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
          GlanzOps Configuration Module v2.0 • Security Verified
        </p>
      </div>
    </div>
  );
}