import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, User, FileText, Calendar, Repeat, 
  Loader2, AlertCircle, MapPin, Clock, CheckCircle2, PauseCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

// --- TYPEN ---
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  addresses: { id: string; street: string; city: string; zipCode: string }[];
}

interface Service {
  id: string;
  name: string;
  priceNet: number;
}

// --- HILFSKOMPONENTE ---
const SelectField = ({ label, icon: Icon, value, onChange, options, placeholder, required = true, disabled = false }: any) => (
  <div className="space-y-1.5">
    <label className="label-caps">{label} {required && '*'}</label>
    <div className="relative group">
      <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${disabled ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-blue-500'}`}>
        <Icon size={18} />
      </div>
      <select
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={`input-standard pl-12 appearance-none cursor-pointer pr-10 ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-400' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-300">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
      </div>
    </div>
  </div>
);

export default function CreateContractPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customerId: '',
    addressId: '', 
    serviceId: '',
    startDate: new Date().toISOString().split('T')[0], // Default Heute
    startTime: '08:00', // Default 8 Uhr
    interval: 'WEEKLY',
    endDate: '' // Optionales Enddatum
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, servRes] = await Promise.all([
          api.get('/customers'),
          api.get('/services')
        ]);
        setCustomers(custRes.data);
        setServices(servRes.data);
      } catch (e) {
        toast.error("Stammdaten konnten nicht geladen werden.");
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  // Adressen laden, wenn Kunde gewählt wird
  useEffect(() => {
    if (formData.customerId) {
        const cust = customers.find(c => c.id === formData.customerId);
        setCustomerAddresses(cust?.addresses || []);
        // Adresse resetten bei Kundenwechsel
        setFormData(prev => ({...prev, addressId: ''}));
    } else {
        setCustomerAddresses([]);
    }
  }, [formData.customerId, customers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.addressId) return toast.error("Bitte eine Objekt-Adresse wählen.");

    // Validierung: Enddatum vor Startdatum?
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        return toast.error("Laufzeit-Ende darf nicht vor dem Start liegen.");
    }

    setLoading(true);
    const toastId = toast.loading('Vertrag wird angelegt...');
    
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      
      // Enddatum auf 23:59 setzen
      let endDateTime = null;
      if (formData.endDate && formData.interval !== 'ONCE') {
          endDateTime = new Date(formData.endDate);
          endDateTime.setHours(23, 59, 59);
      }

      await api.post('/contracts', {
        customerId: formData.customerId,
        serviceId: formData.serviceId,
        addressId: formData.addressId,
        startDate: startDateTime.toISOString(),
        interval: formData.interval,
        endDate: endDateTime ? endDateTime.toISOString() : null, // Nur senden wenn nicht ONCE
        quantity: 1
      });

      toast.success(formData.interval === 'ONCE' ? 'Einmal-Auftrag erstellt!' : 'Dauerauftrag aktiviert!', { id: toastId });
      navigate('/dashboard/contracts');

    } catch (error: any) {
      const msg = error.response?.data?.message || 'Fehler beim Speichern.';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <div className="page-container flex justify-center py-40"><Loader2 className="animate-spin text-blue-600" /></div>;

  const isOneTime = formData.interval === 'ONCE';

  return (
    <div className="page-container max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4">
        <button onClick={() => navigate('/dashboard/contracts')} className="w-fit text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-all font-black uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          <ArrowLeft size={14} /> Zurück
        </button>
        <div className="header-section !bg-transparent !border-none !p-0 !shadow-none">
            <div className="text-left">
                <h1 className="page-title text-3xl">Service-Vertrag erstellen</h1>
                <p className="page-subtitle text-lg">Definieren Sie Zyklen oder Einmal-Aufträge.</p>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Intelligenter Info Banner */}
        <div className={`rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group transition-colors duration-500 ${isOneTime ? 'bg-indigo-600 shadow-indigo-200' : 'bg-blue-600 shadow-blue-200'}`}>
            <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
                {isOneTime ? <CheckCircle2 size={120} /> : <Repeat size={120} />}
            </div>
            <div className="flex items-start gap-4 relative z-10">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    {isOneTime ? <PauseCircle size={24} /> : <AlertCircle size={24} />}
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-1">{isOneTime ? 'Einmaliger Auftrag' : 'Automatischer Dauerauftrag'}</h4>
                    <p className={`text-sm leading-relaxed max-w-md ${isOneTime ? 'text-indigo-100' : 'text-blue-100'}`}>
                        {isOneTime 
                            ? "Das System erstellt genau EINEN Job zum gewählten Zeitpunkt. Der Vertrag wird danach automatisch archiviert." 
                            : "Das System plant automatisch wiederkehrende Termine im Kalender und berücksichtigt dabei Feiertage und Laufzeiten."
                        }
                    </p>
                </div>
            </div>
        </div>

        <div className="form-card space-y-12">
            {/* 1. Partner & Leistung */}
            <div className="space-y-8">
                <div className="form-section-title"><User size={16} className="text-blue-500" /> 1. Wer, Wo & Was</div>
                <div className="grid md:grid-cols-2 gap-8">
                    <SelectField 
                        label="Kunde" 
                        icon={User} 
                        value={formData.customerId}
                        onChange={(e: any) => setFormData({...formData, customerId: e.target.value})}
                        placeholder="Vertragspartner wählen"
                        options={customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.lastName}, ${c.firstName}`}</option>)}
                    />
                    <SelectField 
                        label="Objekt / Standort" 
                        icon={MapPin} 
                        value={formData.addressId}
                        onChange={(e: any) => setFormData({...formData, addressId: e.target.value})}
                        placeholder={formData.customerId ? (customerAddresses.length > 0 ? "Adresse wählen" : "Keine Adresse gefunden") : "Erst Kunden wählen"}
                        disabled={!formData.customerId || customerAddresses.length === 0}
                        options={customerAddresses.map(a => <option key={a.id} value={a.id}>{a.street}, {a.zipCode} {a.city}</option>)}
                    />
                </div>
                <SelectField 
                    label="Leistung" 
                    icon={FileText} 
                    value={formData.serviceId}
                    onChange={(e: any) => setFormData({...formData, serviceId: e.target.value})}
                    placeholder="Leistungskatalog öffnen"
                    options={services.map(s => <option key={s.id} value={s.id}>{s.name} — {Number(s.priceNet || 0).toFixed(2)} €</option>)}
                />
            </div>

            {/* 2. Zeitplanung */}
            <div className="space-y-8">
                <div className="form-section-title"><Calendar size={16} className="text-blue-500" /> 2. Zyklus & Laufzeit</div>
                
                {/* Intervall Cards */}
                <div className="space-y-2">
                    <label className="label-caps">Wiederholung</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { id: 'ONCE', label: 'Einmalig', sub: 'Sonderreinigung' },
                            { id: 'WEEKLY', label: 'Wöchentlich', sub: '7 Tage' },
                            { id: 'BIWEEKLY', label: 'Alle 2 Wochen', sub: '14 Tage' },
                            { id: 'MONTHLY', label: 'Monatlich', sub: 'ca. 30 Tage' },
                        ].map(opt => (
                            <div 
                                key={opt.id}
                                onClick={() => setFormData({...formData, interval: opt.id, endDate: opt.id === 'ONCE' ? '' : formData.endDate})}
                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all text-center group ${
                                    formData.interval === opt.id 
                                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-md transform scale-[1.02]' 
                                    : 'border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:text-slate-700'
                                }`}
                            >
                                <div className="font-black text-xs uppercase mb-1">{opt.label}</div>
                                <div className={`text-[10px] font-medium ${formData.interval === opt.id ? 'text-blue-400' : 'text-slate-300'}`}>{opt.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                    <div className="space-y-1.5">
                        <label className="label-caps">{isOneTime ? 'Ausführung am *' : 'Vertragsstart *'}</label>
                        <div className="flex gap-2">
                            <div className="relative group flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500"><Calendar size={18} /></div>
                                <input required type="date" className="input-standard pl-12" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                            </div>
                            <div className="relative group w-32">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500"><Clock size={18} /></div>
                                <input required type="time" className="input-standard pl-12" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className={`space-y-1.5 transition-opacity duration-300 ${isOneTime ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                        <label className="label-caps">Laufzeit Ende (Optional)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500"><Calendar size={18} /></div>
                            <input 
                                type="date" 
                                className="input-standard pl-12 bg-slate-50 border-dashed" 
                                value={formData.endDate} 
                                onChange={e => setFormData({...formData, endDate: e.target.value})} 
                                disabled={isOneTime}
                                placeholder="Unbefristet"
                            />
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium pl-1">Leer lassen für unbefristeten Vertrag.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex items-center justify-end gap-4 bg-slate-100/50 p-6 rounded-[2rem] border border-slate-100">
          <button type="button" onClick={() => navigate('/dashboard/contracts')} className="btn-secondary !shadow-none border-transparent hover:bg-slate-200">Abbrechen</button>
          <button type="submit" disabled={loading} className="btn-primary min-w-[240px] shadow-xl shadow-blue-500/20 py-4">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save size={20} /><span className="uppercase tracking-widest text-[10px]">{isOneTime ? 'Auftrag erstellen' : 'Vertrag aktivieren'}</span></>}
          </button>
        </div>

      </form>
    </div>
  );
}