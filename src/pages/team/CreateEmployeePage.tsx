import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, User, Mail, CreditCard, Briefcase, Badge, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

// --- HELPER COMPONENTS (AUSSERHALB) ---
// Optional: Du könntest diese Helper in eine separate Datei (z.B. components/Form.tsx) auslagern
const FormInput = ({ label, icon: Icon, name, type = "text", value, onChange, placeholder, required = false, step }: any) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label} {required && '*'}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        step={step}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
      />
    </div>
  </div>
);

const FormSelect = ({ label, name, value, onChange, options }: any) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
        <select 
            name={name} 
            value={value} 
            onChange={onChange} 
            className="w-full pl-4 pr-10 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
        >
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
        </div>
    </div>
  </div>
);

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    personnelNumber: '',
    role: 'Reinigungskraft',
    hourlyWage: '12.50'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/employees', {
          ...formData,
          hourlyWage: Number(formData.hourlyWage)
      });
      
      toast.success('Mitarbeiter angelegt!');
      navigate('/dashboard/team');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Speichern.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* HEADER */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/dashboard/team')}
          className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 mb-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
        </button>
        <h1 className="text-3xl font-bold text-slate-800">Mitarbeiter anlegen</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
        
        {/* Sektion 1: Persönliche Daten */}
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="text-indigo-500 w-5 h-5" /> Persönliche Daten
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Vorname" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Max" />
                <FormInput label="Nachname" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Mustermann" />
                <div className="md:col-span-2">
                    <FormInput label="Dienst-Email" icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="mitarbeiter@firma.de" />
                </div>
            </div>
        </div>

        {/* Sektion 2: Vertragsdaten */}
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Briefcase className="text-indigo-500 w-5 h-5" /> Vertragsdaten
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Personalnummer" icon={Badge} name="personnelNumber" value={formData.personnelNumber} onChange={handleChange} required placeholder="P-001" />
                <FormInput label="Stundenlohn (€)" icon={CreditCard} type="number" step="0.01" name="hourlyWage" value={formData.hourlyWage} onChange={handleChange} />
                
                <div className="md:col-span-2">
                    <FormSelect 
                        label="Position / Rolle" 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange} 
                        options={[
                            { value: 'Reinigungskraft', label: 'Reinigungskraft' },
                            { value: 'Vorarbeiter', label: 'Vorarbeiter' },
                            { value: 'Büro', label: 'Büro / Verwaltung' },
                            { value: 'Manager', label: 'Manager' }
                        ]} 
                    />
                </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto px-8 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Mitarbeiter anlegen</>}
            </button>
        </div>

      </form>
    </div>
  );
}