import { useState, useEffect } from 'react';
import { 
  Save, Building2, Lock, CreditCard, Mail, 
  MapPin, Phone, Globe, Hash, Loader2, ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

// --- WICHTIG: Diese Komponente muss AUSSERHALB stehen! ---
const InputGroup = ({ label, icon: Icon, value, onChange, placeholder, type = "text", disabled = false }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icon size={18} />
            </div>
            <input 
                type={type}
                value={value} 
                onChange={onChange} 
                disabled={disabled}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700 disabled:opacity-60 disabled:cursor-not-allowed" 
                placeholder={placeholder}
            />
        </div>
    </div>
);

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'SECURITY'>('COMPANY');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State für Firmendaten
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

  // State für Passwort
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
      console.error("Fehler beim Laden", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Speichere Firmendaten...");
    try {
      await api.put('/settings/company', companyData);
      toast.success("Erfolgreich gespeichert!", { id: toastId });
    } catch (error) {
      toast.error("Fehler beim Speichern", { id: toastId });
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
      toast.error(error.response?.data?.message || "Fehler beim Ändern");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Einstellungen</h1>
          <p className="text-slate-500 mt-1">Verwalten Sie Ihre Firmeninformationen.</p>
      </div>

      {/* TABS */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex mb-8 shadow-sm">
        <button 
            onClick={() => setActiveTab('COMPANY')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'COMPANY' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
        >
            <Building2 size={18} /> Firmendaten
        </button>
        <button 
            onClick={() => setActiveTab('SECURITY')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'SECURITY' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
        >
            <ShieldCheck size={18} /> Sicherheit
        </button>
      </div>

      {/* --- TAB: FIRMA --- */}
      {activeTab === 'COMPANY' && (
        <form onSubmit={handleSaveCompany} className="space-y-6">
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Allgemeine Informationen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <InputGroup label="Firmenname" icon={Building2} value={companyData.companyName} onChange={(e: any) => setCompanyData({...companyData, companyName: e.target.value})} placeholder="CleanOps GmbH" />
                    </div>
                    <InputGroup label="Straße & Nr." icon={MapPin} value={companyData.street} onChange={(e: any) => setCompanyData({...companyData, street: e.target.value})} placeholder="Musterstraße 1" />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <InputGroup label="PLZ" icon={Hash} value={companyData.zipCode} onChange={(e: any) => setCompanyData({...companyData, zipCode: e.target.value})} placeholder="12345" />
                        </div>
                        <div className="col-span-2">
                            <InputGroup label="Stadt" icon={MapPin} value={companyData.city} onChange={(e: any) => setCompanyData({...companyData, city: e.target.value})} placeholder="Berlin" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Kontakt</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Email (Rechnung)" icon={Mail} value={companyData.email} onChange={(e: any) => setCompanyData({...companyData, email: e.target.value})} placeholder="rechnung@firma.de" />
                    <InputGroup label="Telefon" icon={Phone} value={companyData.phone} onChange={(e: any) => setCompanyData({...companyData, phone: e.target.value})} placeholder="+49 123 45678" />
                    <div className="md:col-span-2">
                        <InputGroup label="Webseite" icon={Globe} value={companyData.website} onChange={(e: any) => setCompanyData({...companyData, website: e.target.value})} placeholder="www.cleanops.de" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Finanzen & Steuern</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="IBAN" icon={CreditCard} value={companyData.iban} onChange={(e: any) => setCompanyData({...companyData, iban: e.target.value})} placeholder="DE00..." />
                    <InputGroup label="BIC" icon={Hash} value={companyData.bic} onChange={(e: any) => setCompanyData({...companyData, bic: e.target.value})} placeholder="GENO..." />
                    <InputGroup label="Steuernummer" icon={Hash} value={companyData.taxId} onChange={(e: any) => setCompanyData({...companyData, taxId: e.target.value})} />
                    <InputGroup label="USt-IdNr." icon={Hash} value={companyData.vatId} onChange={(e: any) => setCompanyData({...companyData, vatId: e.target.value})} />
                    <div className="md:col-span-2">
                        <InputGroup label="Bankname" icon={Building2} value={companyData.bankName} onChange={(e: any) => setCompanyData({...companyData, bankName: e.target.value})} placeholder="Berliner Sparkasse" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    disabled={saving} 
                    className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-70"
                >
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Speichern
                </button>
            </div>
        </form>
      )}

      {/* --- TAB: SICHERHEIT --- */}
      {activeTab === 'SECURITY' && (
        <div className="max-w-2xl">
            <form onSubmit={handlePasswordChange} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">Passwort ändern</h3>
                <div className="space-y-4">
                    <InputGroup label="Aktuelles Passwort" icon={Lock} type="password" value={passwords.current} onChange={(e: any) => setPasswords({...passwords, current: e.target.value})} />
                    <InputGroup label="Neues Passwort" icon={Lock} type="password" value={passwords.new} onChange={(e: any) => setPasswords({...passwords, new: e.target.value})} />
                    <InputGroup label="Bestätigen" icon={Lock} type="password" value={passwords.confirm} onChange={(e: any) => setPasswords({...passwords, confirm: e.target.value})} />
                </div>
                <div className="pt-4">
                    <button disabled={saving} className="w-full bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-900 transition shadow-lg flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70">
                        {saving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />} Passwort aktualisieren
                    </button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
}