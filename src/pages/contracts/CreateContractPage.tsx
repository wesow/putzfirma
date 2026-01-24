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
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

// --- TYPEN ---
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  addresses: { id: string }[];
}

interface Service {
  id: string;
  name: string;
  priceNet: number;
  unit: string;
}

// --- HILFSKOMPONENTE (AUSSERHALB DEFINIERT GEGEN FOKUS-BUG) ---
const SelectField = ({ label, icon: Icon, value, onChange, options, placeholder, required = true }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">{label} {required && '*'}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Icon size={18} />
      </div>
      <select
        required={required}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer text-slate-700 font-medium"
      >
        <option value="">{placeholder}</option>
        {options}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
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
    const toastId = toast.loading('Vertrag wird erstellt...');
    
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

      toast.success('Vertrag erfolgreich angelegt!', { id: toastId });
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
        <div className="p-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-2" size={32}/> 
            <p className="font-medium">Lade Formular...</p>
        </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/dashboard/contracts')}
          className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
        </button>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Neuen Vertrag anlegen</h1>
        <p className="text-slate-500 mt-1">Definieren Sie wiederkehrende Leistungen für Ihre Kunden.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Info Box */}
        <div className="bg-blue-50/80 p-5 rounded-2xl flex items-start gap-4 border border-blue-100 shadow-sm">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                <AlertCircle size={20} />
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">
                Ein Vertrag erstellt <strong>automatisch</strong> wiederkehrende Jobs im System. 
                Die Planung erfolgt basierend auf dem gewählten Startdatum und dem Intervall.
            </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
            {/* Sektion 1: Auswahl */}
            <div className="grid md:grid-cols-2 gap-6">
                <SelectField 
                    label="Kunde" 
                    icon={User} 
                    value={formData.customerId}
                    onChange={(e: any) => setFormData({...formData, customerId: e.target.value})}
                    placeholder="-- Kunde wählen --"
                    options={customers.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.companyName || `${c.lastName}, ${c.firstName}`}
                        </option>
                    ))}
                />

                <SelectField 
                    label="Dienstleistung" 
                    icon={FileText} 
                    value={formData.serviceId}
                    onChange={(e: any) => setFormData({...formData, serviceId: e.target.value})}
                    placeholder="-- Service wählen --"
                    options={services.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name} ({s.priceNet.toFixed(2)} €)
                        </option>
                    ))}
                />
            </div>

            {/* Sektion 2: Planung */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Startdatum *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Calendar size={18} />
                        </div>
                        <input 
                            required
                            type="date"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all cursor-pointer text-slate-700 font-medium"
                            value={formData.startDate}
                            onChange={e => setFormData({...formData, startDate: e.target.value})}
                        />
                    </div>
                </div>

                <SelectField 
                    label="Reinigungs-Intervall" 
                    icon={Repeat} 
                    value={formData.interval}
                    onChange={(e: any) => setFormData({...formData, interval: e.target.value})}
                    placeholder=""
                    options={
                        <>
                            <option value="WEEKLY">Wöchentlich</option>
                            <option value="BIWEEKLY">Alle 2 Wochen</option>
                            <option value="MONTHLY">Monatlich</option>
                        </>
                    }
                />
            </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/dashboard/contracts')}
            className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            Abbrechen
          </button>
          
          <button 
            type="submit" 
            disabled={loading}
            className="px-10 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Erstelle Vertrag...
                </>
            ) : (
                <>
                    <Save className="h-5 w-5" />
                    Vertrag speichern
                </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}