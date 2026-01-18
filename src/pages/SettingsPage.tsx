import { useState, useEffect } from 'react';
import { Save, Building2, Lock, CreditCard, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'COMPANY' | 'SECURITY'>('COMPANY');
  const [loading, setLoading] = useState(false);

  // State für Firmendaten
  const [companyData, setCompanyData] = useState({
    companyName: '',
    street: '',
    zipCode: '',
    city: '',
    email: '',
    phone: '',
    taxId: '', // Steuernummer
    vatId: '', // USt-IdNr.
    iban: '',
    bic: '',
    bankName: ''
  });

  // State für Passwort-Änderung
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Wir simulieren hier kurz, dass wir die Daten vom User-Profil laden
      // Später bauen wir das Backend dafür genau passend
      const res = await api.get('/auth/me'); 
      // Falls du diese Felder im Backend noch nicht hast, lassen wir sie leer
      // oder füllen sie mit den User-Daten
      setCompanyData(prev => ({
          ...prev,
          companyName: res.data.companyName || '',
          email: res.data.email || ''
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // HINWEIS: Hierfür brauchen wir gleich noch eine kleine Backend-Route
      await api.put('/settings/company', companyData);
      toast.success("Firmendaten gespeichert!");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("Passwörter stimmen nicht überein");
    
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Einstellungen</h1>

      {/* TABS */}
      <div className="flex gap-4 border-b border-slate-200 mb-8">
        <button 
            onClick={() => setActiveTab('COMPANY')}
            className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 transition-colors relative ${
                activeTab === 'COMPANY' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
            <Building2 size={18} /> Firmendaten
            {activeTab === 'COMPANY' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
        <button 
            onClick={() => setActiveTab('SECURITY')}
            className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 transition-colors relative ${
                activeTab === 'SECURITY' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
        >
            <Lock size={18} /> Sicherheit
            {activeTab === 'SECURITY' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>}
        </button>
      </div>

      {/* INHALT: FIRMA */}
      {activeTab === 'COMPANY' && (
        <form onSubmit={handleSaveCompany} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Firmenname</label>
                    <input value={companyData.companyName} onChange={e => setCompanyData({...companyData, companyName: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="CleanOps GmbH" />
                </div>
                
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Straße & Nr.</label>
                    <input value={companyData.street} onChange={e => setCompanyData({...companyData, street: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Musterstraße 1" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">PLZ</label>
                        <input value={companyData.zipCode} onChange={e => setCompanyData({...companyData, zipCode: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="12345" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Stadt</label>
                        <input value={companyData.city} onChange={e => setCompanyData({...companyData, city: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Berlin" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email (für Rechnungen)</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                        <input value={companyData.email} onChange={e => setCompanyData({...companyData, email: e.target.value})} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Telefon</label>
                    <input value={companyData.phone} onChange={e => setCompanyData({...companyData, phone: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-slate-400"/> Bankverbindung & Steuern</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">IBAN</label>
                        <input value={companyData.iban} onChange={e => setCompanyData({...companyData, iban: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="DE00 0000 0000 0000 0000 00" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">BIC</label>
                        <input value={companyData.bic} onChange={e => setCompanyData({...companyData, bic: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Steuernummer</label>
                        <input value={companyData.taxId} onChange={e => setCompanyData({...companyData, taxId: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">USt-IdNr.</label>
                        <input value={companyData.vatId} onChange={e => setCompanyData({...companyData, vatId: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200">
                    <Save size={18} /> Speichern
                </button>
            </div>
        </form>
      )}

      {/* INHALT: SICHERHEIT */}
      {activeTab === 'SECURITY' && (
          <form onSubmit={handlePasswordChange} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-lg">
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Aktuelles Passwort</label>
                      <input type="password" required value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="border-t border-slate-100 my-4"></div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Neues Passwort</label>
                      <input type="password" required minLength={6} value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Passwort bestätigen</label>
                      <input type="password" required minLength={6} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
              </div>
              <div className="pt-6">
                <button disabled={loading} className="w-full bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-900 transition shadow-lg">
                    Passwort ändern
                </button>
              </div>
          </form>
      )}
    </div>
  );
}