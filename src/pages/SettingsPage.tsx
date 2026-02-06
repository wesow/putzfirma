import {
    Banknote,
    Building2,
    CreditCard,
    Fingerprint,
    Globe,
    Hash,
    Loader2,
    Lock,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
            <div className="page-container flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <span className="label-caps">Lade Konfiguration...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container pb-safe">

            {/* HEADER SECTION */}
            <div className="header-section flex-col lg:flex-row items-stretch lg:items-center gap-4">
                <div>
                    <h1 className="page-title">System-Einstellungen</h1>
                    <p className="page-subtitle">Zentrale Konfiguration der Firmenidentität und Sicherheit.</p>
                </div>

                <div className="view-switcher-container">
                    <button
                        onClick={() => setActiveTab('COMPANY')}
                        className={`view-btn text-[9px] font-black px-4 ${activeTab === 'COMPANY' ? 'view-btn-active text-blue-600' : 'view-btn-inactive'}`}
                    >
                        <Building2 size={14} className="mr-1.5" /> FIRMA
                    </button>
                    <button
                        onClick={() => setActiveTab('SECURITY')}
                        className={`view-btn text-[9px] font-black px-4 ${activeTab === 'SECURITY' ? 'view-btn-active text-blue-600' : 'view-btn-inactive'}`}
                    >
                        <ShieldCheck size={14} className="mr-1.5" /> SICHERHEIT
                    </button>
                </div>
            </div>

            {/* --- TAB: COMPANY --- */}
            {activeTab === 'COMPANY' && (
                <form onSubmit={handleSaveCompany} className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

                        {/* LINKS: STAMMDATEN */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="form-card">
                                <div className="form-section-title">
                                    <Building2 size={14} className="text-blue-500" /> 1. Identität & Standort
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="label-caps !ml-0">Offizieller Firmenname</label>
                                        <div className="relative group">
                                            <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <input className="input-standard pl-10 font-bold" value={companyData.companyName} onChange={e => setCompanyData({ ...companyData, companyName: e.target.value })} placeholder="GlanzOps GmbH" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="label-caps !ml-0">Straße & Hausnummer</label>
                                        <div className="relative group">
                                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <input className="input-standard pl-10 font-medium" value={companyData.street} onChange={e => setCompanyData({ ...companyData, street: e.target.value })} placeholder="Hauptstraße 1" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="label-caps !ml-0">PLZ</label>
                                            <input className="input-standard font-mono font-bold text-center" value={companyData.zipCode} onChange={e => setCompanyData({ ...companyData, zipCode: e.target.value })} placeholder="12345" />
                                        </div>
                                        <div className="col-span-2 space-y-1.5">
                                            <label className="label-caps !ml-0">Stadt</label>
                                            <input className="input-standard font-medium" value={companyData.city} onChange={e => setCompanyData({ ...companyData, city: e.target.value })} placeholder="Berlin" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-card">
                                <div className="form-section-title">
                                    <Globe size={14} className="text-blue-500" /> 2. Erreichbarkeit
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="label-caps !ml-0">Zentrale E-Mail</label>
                                        <div className="relative group">
                                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <input type="email" className="input-standard pl-10 font-bold" value={companyData.email} onChange={e => setCompanyData({ ...companyData, email: e.target.value })} placeholder="info@firma.de" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="label-caps !ml-0">Telefon</label>
                                            <div className="relative group">
                                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                                <input className="input-standard pl-10 font-medium" value={companyData.phone} onChange={e => setCompanyData({ ...companyData, phone: e.target.value })} placeholder="+49..." />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="label-caps !ml-0">Webseite</label>
                                            <div className="relative group">
                                                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                                <input className="input-standard pl-10 font-medium" value={companyData.website} onChange={e => setCompanyData({ ...companyData, website: e.target.value })} placeholder="www..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RECHTS: FINANZEN */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="form-card border-l-[3px] border-l-emerald-500">
                                <div className="form-section-title !text-emerald-600">
                                    <Banknote size={14} /> 3. Finanzdaten & Steuern
                                </div>
                                <div className="space-y-5">
                                    <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                                        <p className="text-[10px] text-emerald-800 leading-snug font-bold uppercase tracking-tighter">
                                            Wird für automatisierte Rechnungen und SEPA-Exporte verwendet.
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="label-caps !text-emerald-700 !ml-0">Bankinstitut</label>
                                        <div className="relative group">
                                            <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                            <input className="input-standard pl-10 font-bold" value={companyData.bankName} onChange={e => setCompanyData({ ...companyData, bankName: e.target.value })} placeholder="Bankname..." />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="label-caps !text-emerald-700 !ml-0">IBAN</label>
                                        <div className="relative group">
                                            <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                            <input className="input-standard pl-10 font-mono font-bold bg-emerald-50/10 text-emerald-800" value={companyData.iban} onChange={e => setCompanyData({ ...companyData, iban: e.target.value })} placeholder="DE00..." />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="label-caps !ml-0">BIC (SWIFT)</label>
                                        <div className="relative group">
                                            <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                            <input className="input-standard pl-10 font-mono font-bold uppercase" value={companyData.bic} onChange={e => setCompanyData({ ...companyData, bic: e.target.value })} placeholder="BIC..." />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                                        <div className="space-y-1.5">
                                            <label className="label-caps !ml-0">Steuernummer</label>
                                            <input className="input-standard font-medium text-[11px]" value={companyData.taxId} onChange={e => setCompanyData({ ...companyData, taxId: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="label-caps !ml-0">USt-IdNr.</label>
                                            <input className="input-standard font-medium text-[11px]" value={companyData.vatId} onChange={e => setCompanyData({ ...companyData, vatId: e.target.value })} placeholder="DE..." />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FLOATING FOOTER */}
                    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 md:left-auto md:w-auto z-30 pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-2xl flex items-center gap-3 pointer-events-auto animate-in slide-in-from-bottom-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 hidden md:block">System-Konfiguration</span>
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary py-2.5 px-8 shadow-lg shadow-blue-600/20 min-w-[160px] text-[11px] uppercase tracking-widest font-black"
                            >
                                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save size={14} /> Speichern</>}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* --- TAB: SECURITY --- */}
            {activeTab === 'SECURITY' && (
                <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <form onSubmit={handlePasswordChange} className="form-card !p-0 overflow-hidden border-t-[3px] border-t-blue-600 shadow-xl shadow-slate-200/50">
                        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="stat-icon-box bg-slate-900 text-white"><Lock size={14} /></div>
                                <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">Passwortverwaltung</h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-blue-600 rounded-xl p-4 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 opacity-10 rotate-12"><ShieldCheck size={100} /></div>
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md border border-white/10 shrink-0">
                                        <Fingerprint size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-xs uppercase tracking-widest mb-1">Sicherheits-Empfehlung</h4>
                                        <p className="text-blue-50 text-[10px] leading-relaxed font-medium opacity-90">
                                            Ändern Sie Ihr Administrator-Kennwort in regelmäßigen Abständen. Verwenden Sie mindestens 12 Zeichen, Sonderzeichen und Zahlen.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="label-caps !ml-0">Aktuelles Passwort</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors"><Lock size={16} /></div>
                                        <input type="password" required className="input-standard pl-10" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} />
                                    </div>
                                </div>
                                <div className="h-px bg-slate-100 w-full"></div>
                                <div className="space-y-1.5">
                                    <label className="label-caps !ml-0">Neues Passwort</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors"><Lock size={16} /></div>
                                        <input type="password" required className="input-standard pl-10 font-bold" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="label-caps !ml-0">Passwort bestätigen</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors"><Lock size={16} /></div>
                                        <input type="password" required className="input-standard pl-10 font-bold" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <button disabled={saving} className="btn-primary w-full !bg-slate-900 !border-slate-800 shadow-xl py-3 uppercase tracking-widest font-black text-[10px]">
                                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <><ShieldCheck size={14} className="mr-2" /> Identität verifizieren & speichern</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}