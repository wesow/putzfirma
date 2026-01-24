import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Euro, 
  Briefcase, 
  Tag, 
  Loader2, 
  ListTodo, 
  Plus, 
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

// --- HELPER COMPONENTS ---
const FormInput = ({ label, name, value, onChange, type="text", required, placeholder, icon: Icon, step }: any) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label} {required && '*'}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Icon size={18} />
        </div>
      )}
      <input 
        required={required} 
        type={type}
        step={step}
        name={name} 
        value={value} 
        onChange={onChange} 
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium`} 
        placeholder={placeholder}
      />
    </div>
  </div>
);

const FormTextArea = ({ label, name, value, onChange, placeholder }: any) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
    <textarea 
        name={name} 
        value={value} 
        onChange={onChange} 
        rows={2}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" 
        placeholder={placeholder}
    />
  </div>
);

const FormSelect = ({ label, name, value, onChange, icon: Icon, options }: any) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
        {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icon size={18} />
            </div>
        )}
        <select 
            name={name} 
            value={value} 
            onChange={onChange} 
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer`}
        >
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
  </div>
);

export default function EditServicePage() {
  const navigate = useNavigate();
  const { id } = useParams(); // ID aus der URL holen

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceNet: '',
    unit: 'hour'
  });

  const [checklist, setChecklist] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  // DATEN LADEN
  useEffect(() => {
    const loadService = async () => {
        try {
            const res = await api.get(`/services/${id}`);
            const data = res.data;
            
            setFormData({
                name: data.name,
                description: data.description || '',
                priceNet: data.priceNet,
                unit: data.unit
            });
            // Checklist laden (falls vorhanden)
            if (Array.isArray(data.checklist)) {
                setChecklist(data.checklist);
            }
        } catch (error) {
            toast.error("Konnte Leistung nicht laden.");
            navigate('/dashboard/services');
        } finally {
            setLoadingData(false);
        }
    };
    if (id) loadService();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addChecklistItem = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!newItem.trim()) return;
    setChecklist([...checklist, newItem.trim()]);
    setNewItem('');
  };

  const removeChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChecklistItem();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Speichere Änderungen...');
    
    try {
      const priceFloat = parseFloat(String(formData.priceNet).replace(',', '.'));
      
      const payload = {
        ...formData,
        priceNet: priceFloat,
        checklist: checklist 
      };

      await api.put(`/services/${id}`, payload); // PUT statt POST
      
      toast.success('Gespeichert!', { id: toastId });
      navigate('/dashboard/services');
    } catch (error: any) {
      toast.error('Fehler beim Speichern.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) return <div className="min-h-screen flex items-center justify-center text-slate-400"><Loader2 className="animate-spin mr-2"/> Lade Daten...</div>;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/dashboard/services')}
          className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Liste
        </button>
        <h1 className="text-3xl font-bold text-slate-800">Leistung bearbeiten</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* CARD 1: BASIS DATEN */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Briefcase className="text-blue-500" size={20}/> Allgemeines
            </h3>

            <FormInput 
                label="Bezeichnung" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
            />

            <FormTextArea 
                label="Beschreibung" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput 
                    label="Preis (Netto)" 
                    name="priceNet" 
                    type="number" 
                    step="0.01" 
                    value={formData.priceNet} 
                    onChange={handleChange} 
                    required 
                    icon={Euro} 
                />

                <FormSelect 
                    label="Abrechnung *" 
                    name="unit" 
                    value={formData.unit} 
                    onChange={handleChange} 
                    icon={Tag}
                    options={[
                        { value: 'hour', label: 'pro Stunde' },
                        { value: 'sqm', label: 'pro m²' },
                        { value: 'flat', label: 'Pauschal' }
                    ]} 
                />
            </div>
        </div>

        {/* CARD 2: CHECKLISTE */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ListTodo className="text-purple-500" size={20}/> Aufgaben-Checkliste
                </h3>
                {checklist.length > 0 && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">
                        {checklist.length} Schritte
                    </span>
                )}
            </div>
            
            <div className="flex gap-2">
                <input 
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Neue Aufgabe hinzufügen..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
                <button 
                    type="button"
                    onClick={addChecklistItem}
                    disabled={!newItem.trim()}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={24} />
                </button>
            </div>

            <ul className="space-y-2">
                {checklist.map((item, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-purple-200 transition-colors">
                        <span className="text-slate-700 flex items-center gap-3">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-600 text-xs font-bold">
                                {index + 1}
                            </span>
                            {item}
                        </span>
                        <button 
                            type="button" 
                            onClick={() => removeChecklistItem(index)}
                            className="text-slate-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition"
                        >
                            <Trash2 size={16} />
                        </button>
                    </li>
                ))}
                {checklist.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                        <ListTodo className="mx-auto text-slate-300 mb-2" size={32} />
                        <span className="text-slate-400 text-sm">Keine Aufgaben in der Liste.</span>
                    </div>
                )}
            </ul>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/services')}
            className="px-6 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors"
          >
            Abbrechen
          </button>
          
          <button 
            type="submit" 
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-70 active:scale-95"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Änderungen speichern
          </button>
        </div>

      </form>
    </div>
  );
}