import {
  Building2,
  ChevronLeft,
  CreditCard,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Send,
  ShieldCheck,
  User
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendInvite, setSendInvite] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '', email: '', phone: '',
    street: '', zipCode: '', city: '',
    iban: '', bic: '', vatId: '', taxId: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Kunde wird angelegt...');

    try {
      const payload = {
        ...formData,
        companyName: formData.companyName || undefined,
        phone: formData.phone || undefined,
        iban: formData.iban || undefined,
        bic: formData.bic || undefined,
        vatId: formData.vatId || undefined,
        taxId: formData.taxId || undefined,
        address: {
          street: formData.street,
          zipCode: formData.zipCode,
          city: formData.city
        },
        sendInvite
      };

      await api.post('/customers', payload);
      toast.success('Kunde erfolgreich angelegt!', { id: toastId });
      navigate('/dashboard/customers');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Speichern.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container pb-safe">
      
      {/* HEADER SECTION */}
      <div className="header-section">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard/customers')} 
            className="btn-secondary !p-1.5"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="page-title text-base">Neuer Kunde</h1>
            <p className="page-subtitle">Stammdaten und Finanzinformationen erfassen.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-32">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* LINKS: STAMMDATEN & ADRESSE */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="form-section-title">
                <User size={14} className="text-blue-500" /> 1. Persönliche Daten & Firma
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="label-caps">Unternehmen / Organisation (Optional)</label>
                  <div className="relative group">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input name="companyName" placeholder="z.B. Muster GmbH" className="input-standard pl-10 font-bold text-slate-900" value={formData.companyName} onChange={handleChange} />
                  </div>
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="label-caps text-blue-600">E-Mail (Rechnungsempfang) *</label>
                        <div className="relative group">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input name="email" type="email" required placeholder="max@beispiel.de" className="input-standard pl-10 font-bold" value={formData.email} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="label-caps">Telefonnummer</label>
                        <div className="relative group">
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input name="phone" placeholder="+49 123..." className="input-standard pl-10" value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="form-section-title">
                <MapPin size={14} className="text-blue-500" /> 2. Rechnungsanschrift
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="label-caps">Straße & Hausnummer *</label>
                  <input name="street" required placeholder="Hauptstraße 123" className="input-standard font-medium" value={formData.street} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="label-caps">PLZ *</label>
                    <input name="zipCode" required placeholder="12345" className="input-standard font-mono font-bold" value={formData.zipCode} onChange={handleChange} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="label-caps">Stadt *</label>
                    <input name="city" required placeholder="Musterstadt" className="input-standard font-medium" value={formData.city} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECHTE SPALTE: FINANZEN & PORTAL */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-[3px] border-l-emerald-500">
              <div className="form-section-title !text-emerald-600">
                <Landmark size={14} /> 3. Zahlungsdaten
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="label-caps text-emerald-700">IBAN (SEPA-Lastschrift)</label>
                  <div className="relative group">
                    <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input name="iban" placeholder="DE00 0000..." className="input-standard pl-10 font-mono font-bold text-emerald-800 bg-emerald-50/20 focus:bg-white" value={formData.iban} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="label-caps">BIC</label>
                        <input name="bic" placeholder="BIC..." className="input-standard font-mono uppercase text-[11px]" value={formData.bic} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <label className="label-caps">USt-IdNr.</label>
                        <input name="vatId" placeholder="DE..." className="input-standard text-[11px]" value={formData.vatId} onChange={handleChange} />
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
              <div className="flex items-center gap-3 text-left">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sendInvite ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Send size={16} />
                </div>
                <div>
                  <h4 className={`text-[11px] font-black uppercase tracking-widest ${sendInvite ? 'text-white' : 'text-slate-900'}`}>Kunden-Portal</h4>
                  <p className={`text-[10px] font-medium ${sendInvite ? 'text-blue-100' : 'text-slate-500'}`}>Einladung zur Aktivierung senden</p>
                </div>
              </div>
              <div className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${sendInvite ? 'bg-emerald-400' : 'bg-slate-200'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${sendInvite ? 'translate-x-5.5' : 'translate-x-1'}`} />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
                <ShieldCheck size={18} className="text-slate-400 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium">
                    Die Daten werden ausschließlich zur Auftragsabwicklung gemäß GoBD verwendet.
                </p>
            </div>
          </div>
        </div>

        {/* FLOATING ACTION FOOTER - ANGEPASST FÜR NAVBAR */}
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 md:left-auto md:w-auto z-30">
          <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <button type="button" onClick={() => navigate('/dashboard/customers')} className="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50">
              Abbrechen
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-[2] md:flex-none py-2.5 px-8 shadow-lg shadow-blue-600/20 min-w-[160px] text-[11px] uppercase tracking-widest font-black">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Speichern</>}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}