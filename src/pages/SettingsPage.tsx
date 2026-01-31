import React, { useState, useEffect } from 'react';
import { 
  Save, Building2, Lock, CreditCard, Mail, 
  MapPin, Phone, Globe, Hash, Loader2, ShieldCheck, Banknote,
  Fingerprint, FileText
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
      toast.error("Einstellungen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Speichere...");
    try {
      await api.put('/settings/company', companyData);
      toast.success("Gespeichert!", { id: toastId });
    } catch (error) {
      toast.error("Fehler beim Speichern.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("Passwörter stimmen nicht überein.");
    setSaving(true);
    try {
      await api.post('/auth/change-password', { 
          currentPassword: passwords.current, 
          newPassword: passwords.new 
      });
      toast.success("Passwort geändert!");
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Fehler beim Ändern.", { id: 'pwd-error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="font-bold text-[10px] uppercase tracking-widest">Lade Konfiguration...</p>
      </div>
    );
  }

  return (
    <div className="page-container space-y-4">
      
      {/* HEADER SECTION (Full Width & Compact) */}
      <div className="header-section">
        <div className="text-left">
          <h1 className="page-title">System-Einstellungen</h1>
          <p className="page-subtitle">Firmenidentität und Sicherheitsprotokolle.</p>
        </div>
        
        {/* TABS RECHTS */}
        <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 inline-flex shrink-0">
            <button 
                onClick={() => setActiveTab('COMPANY')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === 'COMPANY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
                <Building2 size={14} /> Firma
            </button>
            <button 
                onClick={() => setActiveTab('SECURITY')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === 'SECURITY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
                <ShieldCheck size={14} /> Sicherheit
            </button>
        </div>
      </div>

      {/* --- TAB: COMPANY --- */}
      {activeTab === 'COMPANY' && (
        <form onSubmit={handleSaveCompany} className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
            
            {/* GRID LAYOUT (Full Width) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                
                {/* LINKS: STAMMDATEN & KONTAKT */}
                <div className="space-y-4">
                    {/* Karte 1: Identität */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3 mb-4">
                            <Building2 size={14} className="text-blue-500" /> Identität & Standort
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="label-caps">Firmenname</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Building2 size={16} /></div>
                                    <input className="input-standard pl-9 font-bold" value={companyData.companyName} onChange={e => setCompanyData({...companyData, companyName: e.target.value})} placeholder="GlanzOps GmbH" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="label-caps">Straße & Nr.</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><MapPin size={16} /></div>
                                    <input className="input-standard pl-9" value={companyData.street} onChange={e => setCompanyData({...companyData, street: e.target.value})} placeholder="Hauptstraße 1" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="label-caps">PLZ</label>
                                    <input className="input-standard font-mono text-center" value={companyData.zipCode} onChange={e => setCompanyData({...companyData, zipCode: e.target.value})} placeholder="12345" />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="label-caps">Stadt</label>
                                    <input className="input-standard" value={companyData.city} onChange={e => setCompanyData({...companyData, city: e.target.value})} placeholder="Berlin" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Karte 2: Kommunikation */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3 mb-4">
                            <Globe size={14} className="text-blue-500" /> Kommunikation
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="label-caps">E-Mail (Zentrale)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Mail size={16} /></div>
                                    <input type="email" className="input-standard pl-9" value={companyData.email} onChange={e => setCompanyData({...companyData, email: e.target.value})} placeholder="info@firma.de" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="label-caps">Telefon</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Phone size={16} /></div>
                                        <input className="input-standard pl-9" value={companyData.phone} onChange={e => setCompanyData({...companyData, phone: e.target.value})} placeholder="+49..." />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="label-caps">Webseite</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Globe size={16} /></div>
                                        <input className="input-standard pl-9" value={companyData.website} onChange={e => setCompanyData({...companyData, website: e.target.value})} placeholder="www..." />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RECHTS: FINANZEN & STEUERN (Grün Style behalten) */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-[3px] border-l-emerald-500 h-full flex flex-col">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 uppercase tracking-widest border-b border-slate-50 pb-3 mb-4">
                        <Banknote size={14} className="text-emerald-500" /> Finanzdaten & Steuern
                    </div>
                    
                    <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 mb-6">
                        <p className="text-[11px] text-emerald-800 leading-snug font-medium">
                            Diese Daten werden für die automatische <strong>Rechnungserstellung</strong> und den <strong>SEPA-XML-Export</strong> verwendet.
                        </p>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="space-y-1">
                            <label className="label-caps text-emerald-700">Bankname</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors"><Building2 size={16} /></div>
                                <input className="input-standard pl-9 font-bold" value={companyData.bankName} onChange={e => setCompanyData({...companyData, bankName: e.target.value})} placeholder="Volksbank..." />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="label-caps text-emerald-700">IBAN</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors"><CreditCard size={16} /></div>
                                <input className="input-standard pl-9 font-mono font-bold bg-emerald-50/30 focus:bg-white text-emerald-800" value={companyData.iban} onChange={e => setCompanyData({...companyData, iban: e.target.value})} placeholder="DE00..." />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="label-caps">BIC</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors"><Hash size={16} /></div>
                                <input className="input-standard pl-9 font-mono font-bold uppercase" value={companyData.bic} onChange={e => setCompanyData({...companyData, bic: e.target.value})} placeholder="GENO..." />
                            </div>
                        </div>

                        <div className="w-full border-t border-slate-50 my-2"></div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="label-caps">Steuernummer</label>
                                <div className="relative">
                                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                    <input className="input-standard pl-8" value={companyData.taxId} onChange={e => setCompanyData({...companyData, taxId: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="label-caps">USt-IdNr.</label>
                                <input className="input-standard" value={companyData.vatId} onChange={e => setCompanyData({...companyData, vatId: e.target.value})} placeholder="DE..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FLOATING FOOTER */}
            <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-auto z-40">
               <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 hidden md:block">Konfiguration</span>
                  <button 
                    type="submit"
                    disabled={saving} 
                    className="btn-primary py-2.5 px-6 shadow-md min-w-[140px] text-[11px]"
                  >
                    {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save size={14} /> Speichern</>}
                  </button>
               </div>
            </div>
        </form>
      )}

      {/* --- TAB: SECURITY --- */}
      {activeTab === 'SECURITY' && (
        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handlePasswordChange} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6 border-t-[3px] border-t-blue-600">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-3">
                    <Lock size={14} className="text-blue-500" /> Admin-Zugang
                </div>

                <div className="bg-blue-600 rounded-lg p-4 text-white shadow-md relative overflow-hidden">
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md border border-white/10">
                            <Fingerprint size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wide mb-0.5">Passwort ändern</h4>
                            <p className="text-blue-100 text-[11px] leading-snug opacity-90">
                                Wir empfehlen eine regelmäßige Erneuerung des Administrator-Kennworts alle 90 Tage.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="label-caps">Aktuelles Passwort</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Lock size={16} /></div>
                            <input type="password" required className="input-standard pl-9" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                        </div>
                    </div>
                    <div className="w-full border-t border-slate-50"></div>
                    <div className="space-y-1">
                        <label className="label-caps">Neues Passwort</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Lock size={16} /></div>
                            <input type="password" required className="input-standard pl-9" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="label-caps">Bestätigen</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Lock size={16} /></div>
                            <input type="password" required className="input-standard pl-9" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button disabled={saving} className="btn-primary w-full !bg-slate-900 border-slate-900 shadow-md py-3 uppercase tracking-wider font-bold text-[11px]">
                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <><ShieldCheck size={14} /> Passwort aktualisieren</>}
                    </button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
}