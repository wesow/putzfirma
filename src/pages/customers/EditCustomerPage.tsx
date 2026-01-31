import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, ArrowLeft, User, Building2, Mail, Phone, MapPin, 
  Loader2, Send, ShieldCheck, Banknote, CreditCard, FileText, 
  ChevronLeft, Landmark, Layers 
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
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">Personalakte wird geladen...</span>
    </div>
  );

  return (
    <div className="page-container">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/customers')} 
            className="btn-secondary !p-2"
            title="Zurück"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">Kundenprofil bearbeiten</h1>
            <p className="page-subtitle">
              Verwaltung von <span className="text-slate-900 font-bold">{formData.companyName || `${formData.firstName} ${formData.lastName}`}</span>
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Mandant: {id?.substring(0, 8)}
            </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 pb-24">
        
        {/* --- PORTAL STATUS BANNER --- */}
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${
          customerState.hasUser ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
        }`}>
          <div className="flex items-center gap-4 text-left w-full">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm shrink-0 ${customerState.hasUser ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
              {customerState.hasUser ? <ShieldCheck size={20} /> : <Send size={20} />}
            </div>
            <div>
              <h4 className={`text-[11px] font-bold uppercase tracking-wider ${customerState.hasUser ? 'text-emerald-900' : 'text-blue-900'}`}>
                {customerState.hasUser ? 'Portal-Account Aktiv' : 'Portal-Zugang ausstehend'}
              </h4>
              <p className={`text-[10px] font-medium ${customerState.hasUser ? 'text-emerald-700' : 'text-blue-700'}`}>
                {customerState.hasUser ? 'Kunde hat Zugriff auf das Self-Service Portal.' : 'Senden Sie eine Einladung, um dem Kunden den Zugriff zu ermöglichen.'}
              </p>
            </div>
          </div>
          {!customerState.hasUser && (
            <button type="button" onClick={handleResendInvite} disabled={resending} className="btn-primary whitespace-nowrap !py-1.5">
              {resending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
              Einladung senden
            </button>
          )}
        </div>

        <div className="content-grid lg:grid-cols-12 gap-4">
          
          {/* --- LINKS: STAMMDATEN --- */}
          <div className="lg:col-span-7 space-y-4">
            <div className="form-card">
              <div className="form-section-title">
                <Layers size={14} /> 1. Persönliche Daten & Firma
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="label-caps">Unternehmen / Organisation</label>
                  <div className="relative group">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input name="companyName" className="input-standard pl-10 font-bold" value={formData.companyName} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="label-caps">Vorname</label>
                    <input name="firstName" className="input-standard font-medium" value={formData.firstName} onChange={handleChange} />
                  </div>
                  <div className="space-y-1">
                    <label className="label-caps">Nachname</label>
                    <input name="lastName" className="input-standard font-medium" value={formData.lastName} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                        <label className="label-caps text-slate-400 italic">E-Mail (ID-Schlüssel, nicht änderbar)</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200" />
                            <input disabled className="input-standard pl-10 bg-slate-50 text-slate-400 cursor-not-allowed border-dashed" value={formData.email} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="label-caps">Telefonnummer</label>
                        <div className="relative group">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input name="phone" className="input-standard pl-10" value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>
                </div>
              </div>
            </div>

            <div className="form-card">
              <div className="form-section-title">
                <MapPin size={14} /> 2. Rechnungsanschrift
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="label-caps">Straße & Hausnummer</label>
                  <input name="street" className="input-standard font-medium" value={formData.street} onChange={handleChange} />
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

          {/* --- RECHTE SPALTE: FINANZEN --- */}
          <div className="lg:col-span-5 space-y-4">
            <div className="form-card border-l-2 border-l-emerald-500 h-full">
              <div className="form-section-title !text-emerald-600">
                <Landmark size={14} /> 3. Zahlungsdaten & Steuern
              </div>
              
              <div className="space-y-5">
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex gap-2">
                    <Banknote size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-emerald-800 leading-normal uppercase font-medium">
                        Zahlungsinformationen werden für automatisierte Rechnungen und den SEPA-Export verwendet.
                    </p>
                </div>

                <div className="space-y-1">
                  <label className="label-caps text-emerald-700 font-bold">IBAN (SEPA-Lastschrift)</label>
                  <div className="relative group">
                    <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input 
                      name="iban" 
                      placeholder="DE00 0000..." 
                      className="input-standard pl-10 font-mono font-bold text-emerald-800 bg-emerald-50/30 focus:bg-white" 
                      value={formData.iban} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="label-caps">BIC (SWIFT)</label>
                  <input name="bic" className="input-standard font-mono uppercase" value={formData.bic} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                    <div className="space-y-1">
                        <label className="label-caps">USt-IdNr.</label>
                        <input name="vatId" placeholder="DE..." className="input-standard" value={formData.vatId} onChange={handleChange} />
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

        {/* --- FLOATING ACTION FOOTER --- */}
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[450px] z-50">
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xl flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard/customers')} 
              className="flex-1 px-4 py-2.5 rounded-xl text-slate-500 font-bold text-[11px] uppercase tracking-wider hover:bg-slate-100 transition-colors"
            >
              Abbrechen
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="btn-primary flex-[2] py-2.5 shadow-lg shadow-blue-600/20"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <><Save size={16} /> Änderungen speichern</>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}