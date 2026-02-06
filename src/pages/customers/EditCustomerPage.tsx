import {
  Building2,
  ChevronLeft,
  CreditCard,
  Landmark, Layers,
  Loader2,
  MapPin,
  Save,
  Send, ShieldCheck
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
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
      toast.error('Fehler.', { id: toastId });
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
    const toastId = toast.loading('Speichere Änderungen...');

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

  if (loading) return (
    <div className="page-container flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="page-container pb-safe">
      
      <div className="header-section">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/customers')} className="btn-secondary !p-1.5"><ChevronLeft size={16} /></button>
          <div>
            <h1 className="page-title">Profil bearbeiten</h1>
            <p className="page-subtitle text-slate-900 font-bold">{formData.companyName || `${formData.firstName} ${formData.lastName}`}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-32">
        
        <div className={`p-4 mb-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${
          customerState.hasUser ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex items-center gap-4 text-left w-full">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm shrink-0 ${customerState.hasUser ? 'bg-emerald-500 text-white' : 'bg-blue-50 text-white'}`}>
              {customerState.hasUser ? <ShieldCheck size={20} /> : <Send size={20} />}
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800">{customerState.hasUser ? 'Portal Aktiv' : 'Zugang ausstehend'}</h4>
              <p className="text-[10px] font-medium text-slate-500 truncate">{customerState.hasUser ? 'Kunde hat aktiven Zugriff.' : 'Aktivierung durch E-Mail erforderlich.'}</p>
            </div>
          </div>
          {!customerState.hasUser && (
            <button type="button" onClick={handleResendInvite} disabled={resending} className="btn-primary whitespace-nowrap !py-1.5 !px-4 text-[10px] font-black uppercase tracking-widest">
              {resending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />} Einladung
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="form-section-title"><Layers size={14} /> 1. Stammdaten</div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="label-caps">Unternehmen</label>
                  <div className="relative group">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input name="companyName" className="input-standard pl-10 font-bold" value={formData.companyName} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-caps">Vorname</label><input name="firstName" className="input-standard font-bold" value={formData.firstName} onChange={handleChange} /></div>
                  <div><label className="label-caps">Nachname</label><input name="lastName" className="input-standard font-bold" value={formData.lastName} onChange={handleChange} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="label-caps opacity-50">E-Mail (ID)</label><input disabled className="input-standard bg-slate-50 text-slate-400 cursor-not-allowed font-medium" value={formData.email} /></div>
                    <div><label className="label-caps">Telefon</label><input name="phone" className="input-standard font-bold" value={formData.phone} onChange={handleChange} /></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="form-section-title"><MapPin size={14} /> 2. Anschrift</div>
              <div className="space-y-3">
                <div><label className="label-caps">Straße & Hausnummer</label><input name="street" className="input-standard font-medium" value={formData.street} onChange={handleChange} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="label-caps">PLZ</label><input name="zipCode" className="input-standard font-mono font-bold text-center" value={formData.zipCode} onChange={handleChange} /></div>
                  <div className="col-span-2"><label className="label-caps">Stadt</label><input name="city" className="input-standard font-medium" value={formData.city} onChange={handleChange} /></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-[3px] border-l-emerald-500 h-full">
              <div className="form-section-title !text-emerald-600"><Landmark size={14} /> 3. Finanzdaten</div>
              <div className="space-y-4">
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100"><p className="text-[10px] text-emerald-800 uppercase font-bold tracking-tighter leading-tight">Daten für automatische Abrechnung und SEPA.</p></div>
                <div>
                  <label className="label-caps text-emerald-700 font-bold">IBAN (SEPA)</label>
                  <div className="relative group">
                    <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input name="iban" className="input-standard pl-10 font-mono font-bold text-emerald-800 bg-emerald-50/10" value={formData.iban} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-3">
                    <div className="space-y-1"><label className="label-caps">BIC (SWIFT)</label><input name="bic" className="input-standard font-mono" value={formData.bic} onChange={handleChange} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><label className="label-caps">USt-IdNr.</label><input name="vatId" placeholder="DE..." className="input-standard" value={formData.vatId} onChange={handleChange} /></div>
                        <div className="space-y-1"><label className="label-caps">Steuernummer</label><input name="taxId" className="input-standard" value={formData.taxId} onChange={handleChange} /></div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FLOATING ACTION FOOTER - ANGEPASST FÜR NAVBAR */}
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 md:left-auto md:w-auto z-30">
          <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <button type="button" onClick={() => navigate('/dashboard/customers')} className="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50">
              Abbrechen
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-[2] md:flex-none py-2.5 px-8 shadow-lg shadow-blue-600/20 min-w-[160px] text-[11px] uppercase tracking-widest font-black">
              {saving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Speichern</>}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}