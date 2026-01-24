import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

// --- TYPEN ---
interface CustomerFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  street: string;
  zipCode: string;
  city: string;
}

// --- HILFSKOMPONENTE (AUSSERHALB DEFINIERT GEGEN FOKUS-BUG) ---
const InputField = ({ label, name, icon: Icon, required = false, type = "text", placeholder = "", value, onChange }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
      />
    </div>
  </div>
);

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    street: '',
    zipCode: '',
    city: ''
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
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName || undefined, 
        email: formData.email,
        phone: formData.phone || undefined,
        address: {
          street: formData.street,
          zipCode: formData.zipCode,
          city: formData.city
        }
      };

      await api.post('/customers', payload);
      
      toast.success('Kunde erfolgreich erstellt!', { id: toastId });
      navigate('/dashboard/customers');

    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Fehler beim Speichern.';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* HEADER AREA */}
      <div className="mb-8">
          <button 
            onClick={() => navigate('/dashboard/customers')}
            className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
          </button>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Neuen Kunden anlegen</h1>
          <p className="text-slate-500 mt-1">Erstellen Sie einen neuen Privat- oder Geschäftskunden-Eintrag.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Card 1: Stammdaten */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                <User size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Persönliche Daten</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <InputField label="Firma (Optional)" name="companyName" icon={Building2} placeholder="Muster GmbH" value={formData.companyName} onChange={handleChange} />
            </div>
            
            <InputField label="Vorname" name="firstName" icon={User} required placeholder="Max" value={formData.firstName} onChange={handleChange} />
            <InputField label="Nachname" name="lastName" icon={User} required placeholder="Mustermann" value={formData.lastName} onChange={handleChange} />
            
            <InputField label="E-Mail Adresse" name="email" icon={Mail} type="email" required placeholder="max@muster.de" value={formData.email} onChange={handleChange} />
            <InputField label="Telefon / Mobil" name="phone" icon={Phone} placeholder="+49 170 1234567" value={formData.phone} onChange={handleChange} />
          </div>
        </div>

        {/* Card 2: Adresse */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                <MapPin size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Anschrift</h3>
          </div>

          <div className="space-y-6">
            <InputField label="Straße & Hausnummer" name="street" icon={MapPin} required placeholder="Hauptstraße 1" value={formData.street} onChange={handleChange} />
            
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1">
                <InputField label="PLZ" name="zipCode" icon={MapPin} required placeholder="12345" value={formData.zipCode} onChange={handleChange} />
              </div>
              <div className="col-span-2">
                <InputField label="Stadt" name="city" icon={MapPin} required placeholder="Berlin" value={formData.city} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/dashboard/customers')}
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
                    Speichere...
                </>
            ) : (
                <>
                    <Save className="h-5 w-5" />
                    Kunde anlegen
                </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}