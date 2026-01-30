import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, User, Building2, Mail, Phone, MapPin, 
  Loader2, Send, Banknote, CreditCard, FileText 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendInvite, setSendInvite] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '', email: '', phone: '',
    street: '', zipCode: '', city: '',
    // NEU: Finanzdaten
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
        // Leere Strings zu undefined machen, damit DB sauber bleibt
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
      
      toast.success(sendInvite ? 'Kunde erstellt & Einladung versendet!' : 'Kunde erfolgreich angelegt!', { id: toastId });
      navigate('/dashboard/customers');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Fehler beim Speichern.';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/dashboard/customers')} 
          className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-2 mb-4 transition-all font-black uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"
        >
          <ArrowLeft size={14} /> Zurück
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="page-title text-3xl">Neuen Kunden anlegen</h1>
            <p className="page-subtitle text-lg">Erfassen Sie Stammdaten und Zahlungsinformationen für SEPA.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-24">
          
          {/* LINKE SPALTE: STAMMDATEN & ADRESSE */}
          <div className="space-y-6">
            
            {/* 1. STAMMDATEN */}
            <div className="form-card space-y-6">
              <div className="form-section-title">
                <User size={16} className="text-blue-500" /> Persönliche Daten
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="label-caps">Firma (Optional)</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="companyName" placeholder="GmbH, KG, etc." className="input-standard pl-10" value={formData.companyName} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="label-caps">Vorname *</label>
                    <input name="firstName" required placeholder="Max" className="input-standard font-bold" value={formData.firstName} onChange={handleChange} />
                  </div>
                  <div className="space-y-1">
                    <label className="label-caps">Nachname *</label>
                    <input name="lastName" required placeholder="Mustermann" className="input-standard font-bold" value={formData.lastName} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="label-caps">E-Mail Adresse *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="email" type="email" required placeholder="kontakt@firma.de" className="input-standard pl-10" value={formData.email} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="label-caps">Telefon</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input name="phone" placeholder="+49..." className="input-standard pl-10" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ADRESSE */}
            <div className="form-card space-y-6">
              <div className="form-section-title">
                <MapPin size={16} className="text-blue-500" /> Rechnungsanschrift
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="label-caps">Straße & Hausnummer *</label>
                  <input name="street" required placeholder="Musterstraße 1" className="input-standard" value={formData.street} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="label-caps">PLZ *</label>
                    <input name="zipCode" required placeholder="12345" className="input-standard font-mono" value={formData.zipCode} onChange={handleChange} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="label-caps">Stadt *</label>
                    <input name="city" required placeholder="Berlin" className="input-standard" value={formData.city} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECHTE SPALTE: FINANZEN & STATUS */}
          <div className="space-y-6">
            
            {/* 3. FINANZEN (SEPA) */}
            <div className="form-card space-y-6 border-l-4 border-l-emerald-500 h-fit">
              <div className="form-section-title text-emerald-700">
                <Banknote size={16} className="text-emerald-500" /> Zahlungsdaten & Steuern
              </div>
              
              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                <p className="text-xs text-emerald-800 leading-relaxed">
                  <strong>Hinweis für SEPA:</strong> Bitte hinterlegen Sie IBAN und BIC, um die automatische Lastschrift-Funktion für diesen Kunden zu aktivieren.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="label-caps text-emerald-700">IBAN (Konto)</label>
                  <div className="relative">
                    <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input 
                      name="iban" 
                      placeholder="DE00 0000 0000 0000 0000 00" 
                      className="input-standard pl-10 font-mono font-bold text-emerald-800 bg-emerald-50/30 focus:bg-white focus:border-emerald-500 focus:ring-emerald-200" 
                      value={formData.iban} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="label-caps">BIC (SWIFT)</label>
                  <input name="bic" placeholder="GENO..." className="input-standard font-mono uppercase" value={formData.bic} onChange={handleChange} />
                </div>

                <div className="w-full border-t border-slate-100 my-2"></div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="label-caps">USt-IdNr.</label>
                      <div className="relative">
                         <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input name="vatId" placeholder="DE..." className="input-standard pl-8" value={formData.vatId} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="label-caps">Steuernummer</label>
                      <input name="taxId" placeholder="00/000/..." className="input-standard" value={formData.taxId} onChange={handleChange} />
                    </div>
                </div>
              </div>
            </div>

            {/* 4. EINLADUNG */}
            <div 
              onClick={() => setSendInvite(!sendInvite)}
              className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                sendInvite ? 'bg-blue-600 border-blue-700 shadow-xl shadow-blue-500/20' : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sendInvite ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Send size={20} />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${sendInvite ? 'text-white' : 'text-slate-900'}`}>Portal-Zugang senden</h4>
                  <p className={`text-xs ${sendInvite ? 'text-blue-100' : 'text-slate-500'}`}>Kunde erhält E-Mail zur Aktivierung.</p>
                </div>
              </div>
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sendInvite ? 'bg-emerald-400' : 'bg-slate-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sendInvite ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER ACTIONS */}
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
                disabled={loading} 
                className="btn-primary py-3 px-8 shadow-lg shadow-blue-600/20 min-w-[200px]"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Kunde Speichern</>}
              </button>
           </div>
        </div>

      </form>
    </div>
  );
}