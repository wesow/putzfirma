import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, User, Building2, Mail, Phone, MapPin, Loader2, Send, CheckCircle, ShieldCheck } from 'lucide-react';
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
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    street: '',
    zipCode: '',
    city: ''
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
          city: billingAddress?.city || ''
        });
      } catch (error) {
        console.error("Fehler beim Laden:", error);
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
    const toastId = toast.loading('Einladung wird erneut versendet...');
    try {
      await api.post('/auth/invite', { email: formData.email, role: 'CUSTOMER' });
      toast.success('Einladung erfolgreich erneut versendet!', { id: toastId });
    } catch (error) {
      toast.error('Fehler beim Versenden der Einladung.', { id: toastId });
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
        }
      });
      
      toast.success('Kundendaten erfolgreich aktualisiert!', { id: toastId });
      navigate('/dashboard/customers');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Aktualisieren.';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Synchronisiere Datenbank...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      
      {/* HEADER & NAVIGATION */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/customers')} 
          className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-2 mb-4 transition-all font-black uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"
        >
          <ArrowLeft size={14} /> Zurück zur Übersicht
        </button>
        <div className="header-section !bg-transparent !border-none !p-0 !shadow-none">
          <div className="text-left">
            <h1 className="page-title text-3xl">Kundenprofil bearbeiten</h1>
            <p className="page-subtitle text-lg">Aktualisieren Sie Stammdaten für <span className="text-slate-900 font-bold">{formData.companyName || `${formData.firstName} ${formData.lastName}`}</span>.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* PORTAL STATUS BANNER (MODERN DESIGN) */}
        <div className={`p-6 rounded-[2rem] border flex flex-col md:flex-row items-center justify-between gap-6 transition-all shadow-xl ${
          customerState.hasUser 
            ? 'bg-emerald-50 border-emerald-100 shadow-emerald-600/5' 
            : 'bg-blue-50 border-blue-100 shadow-blue-600/5'
        }`}>
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
              customerState.hasUser ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {customerState.hasUser ? <ShieldCheck size={28} /> : <Send size={28} />}
            </div>
            <div className="text-left">
              <h4 className={`text-lg font-black tracking-tight ${customerState.hasUser ? 'text-emerald-900' : 'text-blue-900'}`}>
                {customerState.hasUser ? 'Account Aktiviert' : 'Portal Zugang Ausstehend'}
              </h4>
              <p className={`text-sm font-medium leading-relaxed ${customerState.hasUser ? 'text-emerald-700' : 'text-blue-700'} max-w-md`}>
                {customerState.hasUser 
                  ? 'Dieser Kunde hat seinen Zugang zum GlanzOps Self-Service-Portal bereits aktiviert.' 
                  : 'Der Kunde hat noch keinen aktiven Zugang. Sie können die Einladung hier erneut versenden.'}
              </p>
            </div>
          </div>
          
          {!customerState.hasUser && (
            <button 
              type="button"
              onClick={handleResendInvite}
              disabled={resending}
              className="btn-primary !bg-blue-600 !border-blue-700 min-w-[200px]"
            >
              {resending ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Einladung senden</>}
            </button>
          )}
        </div>

        {/* STAMMDATEN CARD */}
        <div className="form-card space-y-8">
          <div className="form-section-title">
            <User size={16} className="text-blue-500" /> 1. Persönliche Stammdaten
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="label-caps">Unternehmen / Firmenname</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Building2 size={18} />
                </div>
                <input 
                  name="companyName" 
                  placeholder="Unternehmen eingeben..." 
                  className="input-standard pl-12" 
                  value={formData.companyName} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-caps">Vorname *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  name="firstName" 
                  required 
                  className="input-standard pl-12 font-bold" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-caps">Nachname *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  name="lastName" 
                  required 
                  className="input-standard pl-12 font-bold" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="space-y-1.5 opacity-60">
              <label className="label-caps text-slate-400">E-Mail (Primärschlüssel - Schreibgeschützt)</label>
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

            <div className="space-y-1.5">
              <label className="label-caps">Telefon / Mobil</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Phone size={18} />
                </div>
                <input 
                  name="phone" 
                  placeholder="+49..." 
                  className="input-standard pl-12 font-medium" 
                  value={formData.phone} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* ANSCHRIFT CARD */}
        <div className="form-card space-y-8">
          <div className="form-section-title">
            <MapPin size={16} className="text-blue-500" /> 2. Adressinformationen
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="label-caps">Straße & Hausnummer *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <MapPin size={18} />
                </div>
                <input 
                  name="street" 
                  required 
                  className="input-standard pl-12" 
                  value={formData.street} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="label-caps">PLZ *</label>
                <input 
                  name="zipCode" 
                  required 
                  className="input-standard font-mono" 
                  value={formData.zipCode} 
                  onChange={handleChange} 
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="label-caps">Stadt *</label>
                <input 
                  name="city" 
                  required 
                  className="input-standard" 
                  value={formData.city} 
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
            onClick={() => navigate('/dashboard/customers')} 
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