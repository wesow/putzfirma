import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, ArrowLeft, User, Building2, Mail, Phone, MapPin, 
  Loader2, Send, CheckCircle, ShieldCheck, Banknote, CreditCard, FileText 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

export default function EditCustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  
  const [customerState, setCustomerState] = useState<{
    hasUser: boolean;
    hasInvite: boolean;
  }>({ hasUser: false, hasInvite: false });

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '', email: '', phone: '',
    street: '', zipCode: '', city: '',
    iban: '', bic: '', vatId: '', taxId: ''
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const res = await api.get(`/customers/${id}`);
        const customer = res.data;
        
        const billingAddress = customer.addresses.find((a: any) => a.type === 'BILLING') || customer.addresses[0];

        setCustomerState({
          hasUser: !!customer.userId,
          hasInvite: !!customer.invitation && !customer.invitation.isAccepted
        });

        setFormData({
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          companyName: customer.companyName || '',
          email: customer.email || '',
          phone: customer.phone || '',
          street: billingAddress?.street || '',
          zipCode: billingAddress?.zipCode || '',
          city: billingAddress?.city || '',
          iban: customer.iban || '',
          bic: customer.bic || '',
          vatId: customer.vatId || '',
          taxId: customer.taxId || ''
        });
      } catch (error) {
        toast.error("Kunde konnte nicht geladen werden.");
        navigate('/dashboard/customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id, navigate]);

  const handleResendInvite = async () => {
    setResending(true);
    const toastId = toast.loading('Einladung wird gesendet...');
    try {
      await api.post('/auth/invite', { email: formData.email, role: 'CUSTOMER' });
      toast.success('Versendet!', { id: toastId });
    } catch (error) {
      toast.error('Fehler beim Senden.', { id: toastId });
    } finally {
      setResending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Änderungen werden gespeichert...');

    try {
      await api.put(`/customers/${id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName || undefined,
        phone: formData.phone || undefined,
        address: {
          street: formData.street,
          zipCode: formData.zipCode,
          city: formData.city
        },
        // Wichtig: Finanzdaten mitgeben
        iban: formData.iban || null,
        bic: formData.bic || null,
        vatId: formData.vatId || null,
        taxId: formData.taxId || null
      });
      
      toast.success('Gespeichert!', { id: toastId });
      navigate('/dashboard/customers');
    } catch (error: any) {
      toast.error('Fehler beim Speichern.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-container flex justify-center py-40"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="page-container max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-6">
        <button onClick={() => navigate('/dashboard/customers')} className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-2 mb-4 font-black uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm transition-all">
          <ArrowLeft size={14} /> Zurück zur Übersicht
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="page-title text-3xl">Kundenprofil bearbeiten</h1>
                <p className="page-subtitle text-lg">
                    Daten für <span className="text-slate-900 font-bold">{formData.companyName || `${formData.firstName} ${formData.lastName}`}</span> verwalten.
                </p>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-20">
        
        {/* PORTAL STATUS BANNER */}
        <div className={`p-6 mb-8 rounded-[2rem] border flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm ${
          customerState.hasUser ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${customerState.hasUser ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
              {customerState.hasUser ? <ShieldCheck size={28} /> : <Send size={28} />}
            </div>
            <div>
              <h4 className={`text-lg font-black tracking-tight ${customerState.hasUser ? 'text-emerald-900' : 'text-blue-900'}`}>
                {customerState.hasUser ? 'Portal-Account Aktiv' : 'Kein Portal-Zugang'}
              </h4>
              <p className={`text-sm ${customerState.hasUser ? 'text-emerald-700' : 'text-blue-700'}`}>
                {customerState.hasUser ? 'Kunde kann sich einloggen und Rechnungen einsehen.' : 'Kunde hat noch keinen Zugriff auf das Self-Service Portal.'}
              </p>
            </div>
          </div>
          {!customerState.hasUser && (
            <button type="button" onClick={handleResendInvite} disabled={resending} className="btn-primary !bg-blue-600 !border-blue-700 min-w-[200px]">
              {resending ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Einladung senden</>}
            </button>
          )}
        </div>

        {/* 2-SPALTEN LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* LINKE SPALTE */}
            <div className="space-y-6">
                <div className="form-card space-y-6">
                    <div className="form-section-title"><User size={16} className="text-blue-500" /> Stammdaten</div>
                    
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="label-caps">Firma</label>
                            <input name="companyName" className="input-standard" value={formData.companyName} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                            <label className="label-caps">E-Mail (Locked)</label>
                            <input disabled className="input-standard bg-slate-50 text-slate-400 cursor-not-allowed border-dashed" value={formData.email} />
                        </div>
                        <div className="space-y-1">
                            <label className="label-caps">Telefon</label>
                            <input name="phone" className="input-standard" value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="form-card space-y-6">
                    <div className="form-section-title"><MapPin size={16} className="text-blue-500" /> Rechnungsanschrift</div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="label-caps">Straße</label>
                            <input name="street" className="input-standard" value={formData.street} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="label-caps">PLZ</label>
                                <input name="zipCode" className="input-standard font-mono" value={formData.zipCode} onChange={handleChange} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="label-caps">Stadt</label>
                                <input name="city" className="input-standard" value={formData.city} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RECHTE SPALTE */}
            <div className="space-y-6">
                <div className="form-card space-y-6 border-l-4 border-l-emerald-500 h-full">
                    <div className="form-section-title text-emerald-700">
                        <Banknote size={16} className="text-emerald-500" /> Finanzen & SEPA
                    </div>
                    
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mb-4">
                        <p className="text-xs text-emerald-800 leading-relaxed">
                            Tragen Sie hier die Bankverbindung für Lastschriften ein. Diese Daten werden für den <strong>SEPA-Export</strong> benötigt.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-1">
                            <label className="label-caps text-emerald-700">IBAN</label>
                            <div className="relative">
                                <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                <input 
                                    name="iban" 
                                    placeholder="DE..." 
                                    className="input-standard pl-10 font-mono font-bold text-emerald-800 bg-emerald-50/30 focus:bg-white focus:border-emerald-500" 
                                    value={formData.iban} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="label-caps">BIC</label>
                            <input name="bic" className="input-standard font-mono uppercase" value={formData.bic} onChange={handleChange} />
                        </div>
                        
                        <div className="w-full border-t border-slate-100 my-2"></div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="label-caps">USt-IdNr.</label>
                                <div className="relative">
                                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input name="vatId" className="input-standard pl-8" value={formData.vatId} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="label-caps">Steuernummer</label>
                                <input name="taxId" className="input-standard" value={formData.taxId} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* FLOATING FOOTER */}
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-auto z-40">
           <div className="bg-white/90 backdrop-blur-md p-2 rounded-[2rem] border border-slate-200 shadow-2xl flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => navigate('/dashboard/customers')} 
                className="px-6 py-3 rounded-xl text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 transition-colors"
              >
                Abbrechen
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className="btn-primary py-3 px-8 shadow-lg shadow-blue-600/20 min-w-[200px]"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Speichern</>}
              </button>
           </div>
        </div>

      </form>
    </div>
  );
}