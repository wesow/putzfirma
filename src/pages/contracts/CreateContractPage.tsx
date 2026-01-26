import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  User, 
  FileText, 
  Calendar, 
  Repeat, 
  Loader2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

// --- TYPEN ---
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  addresses: { id: string; street: string; city: string }[];
}

interface Service {
  id: string;
  name: string;
  priceNet: number;
  unit: string;
}

// --- HILFSKOMPONENTE FÜR SELECTS (Optimiert für GlanzOps Design) ---
const SelectField = ({ label, icon: Icon, value, onChange, options, placeholder, required = true }: any) => (
  <div className="space-y-1.5">
    <label className="label-caps">{label} {required && '*'}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Icon size={18} />
      </div>
      <select
        required={required}
        value={value}
        onChange={onChange}
        className="input-standard pl-12 appearance-none cursor-pointer pr-10"
      >
        <option value="">{placeholder}</option>
        {options}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-300">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
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

  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    startDate: '',
    interval: 'WEEKLY'
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
        console.error("Fehler beim Laden", e);
        toast.error("Konnte Stammdaten nicht laden.");
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Vertrag wird im System aktiviert...');
    
    try {
      const selectedCustomer = customers.find(c => c.id === formData.customerId);
      if (!selectedCustomer) throw new Error("Kunde nicht gefunden");
      
      if (!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) {
        throw new Error("Dieser Kunde hat keine Adresse hinterlegt.");
      }

      await api.post('/contracts', {
        customerId: formData.customerId,
        serviceId: formData.serviceId,
        addressId: selectedCustomer.addresses[0].id,
        startDate: new Date(formData.startDate).toISOString(),
        interval: formData.interval
      });

      toast.success('Dauerauftrag erfolgreich gestartet!', { id: toastId });
      navigate('/dashboard/contracts');

    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Fehler beim Speichern.';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
      return (
        <div className="page-container flex items-center justify-center py-40">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Konfiguriere Interface...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      
      {/* Header & Navigation */}
      <div className="mb-6 flex flex-col gap-4">
        <button 
          onClick={() => navigate('/dashboard/contracts')}
          className="w-fit text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-all font-black uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"
        >
          <ArrowLeft size={14} /> Zurück zur Übersicht
        </button>
        
        <div className="header-section !bg-transparent !border-none !p-0 !shadow-none">
            <div className="text-left">
                <h1 className="page-title text-3xl">Service-Vertrag erstellen</h1>
                <p className="page-subtitle text-lg">Definieren Sie wiederkehrende Reinigungszyklen.</p>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Info Banner */}
        <div className="bg-blue-600 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Repeat size={120} />
            </div>
            <div className="flex items-start gap-4 relative z-10">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-1">Automatisierung aktiv</h4>
                    <p className="text-blue-100 text-sm leading-relaxed max-w-md">
                        Basierend auf diesem Vertrag generiert das System <strong>automatisch Aufträge</strong> im gewählten Intervall. Die erste Planung startet am gewählten Startdatum.
                    </p>
                </div>
            </div>
        </div>

        <div className="form-card space-y-12">
            {/* Sektion 1: Partner & Leistung */}
            <div className="space-y-8">
                <div className="form-section-title">
                    <User size={16} className="text-blue-500" /> 1. Vertragspartner & Dienstleistung
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <SelectField 
                        label="Kunde / Unternehmen" 
                        icon={User} 
                        value={formData.customerId}
                        onChange={(e: any) => setFormData({...formData, customerId: e.target.value})}
                        placeholder="Vertragspartner wählen"
                        options={customers.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.companyName || `${c.lastName}, ${c.firstName}`}
                            </option>
                        ))}
                    />

                    <SelectField 
                        label="Gewünschte Leistung" 
                        icon={FileText} 
                        value={formData.serviceId}
                        onChange={(e: any) => setFormData({...formData, serviceId: e.target.value})}
                        placeholder="Leistungskatalog öffnen"
                        options={services.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name} — {Number(s.priceNet || 0).toFixed(2)} € (netto)
                            </option>
                        ))}
                    />
                </div>
            </div>

            {/* Sektion 2: Zeitliche Planung */}
            <div className="space-y-8">
                <div className="form-section-title">
                    <Calendar size={16} className="text-blue-500" /> 2. Zyklus & Terminierung
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                        <label className="label-caps">Vertragsbeginn (Erste Ausführung) *</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <Calendar size={18} />
                            </div>
                            <input 
                                required
                                type="date"
                                className="input-standard pl-12"
                                value={formData.startDate}
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                            />
                        </div>
                    </div>

                    <SelectField 
                        label="Wiederholungs-Intervall" 
                        icon={Repeat} 
                        value={formData.interval}
                        onChange={(e: any) => setFormData({...formData, interval: e.target.value})}
                        placeholder=""
                        options={
                            <>
                                <option value="WEEKLY">Wöchentliche Reinigung</option>
                                <option value="BIWEEKLY">Zweiwöchentlicher Rhythmus</option>
                                <option value="MONTHLY">Monatliche Grundreinigung</option>
                            </>
                        }
                    />
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 bg-slate-100/50 p-6 rounded-[2rem] border border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/dashboard/contracts')}
            className="btn-secondary !shadow-none border-transparent hover:bg-slate-200"
          >
            Abbrechen
          </button>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary min-w-[240px] shadow-xl shadow-blue-500/20 py-4"
          >
            {loading ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="uppercase tracking-widest text-[10px]">Wird aktiviert...</span>
                </>
            ) : (
                <>
                    <Save size={20} />
                    <span className="uppercase tracking-widest text-[10px]">Vertrag jetzt aktivieren</span>
                </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}