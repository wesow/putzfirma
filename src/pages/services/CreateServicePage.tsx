import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Euro } from 'lucide-react';
import api from '../../lib/api';

export default function CreateServicePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceNet: '',
    unit: 'hour' // Standardwert
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Preis in Zahl umwandeln (wichtig für Backend)
      const payload = {
        ...formData,
        priceNet: parseFloat(formData.priceNet.replace(',', '.')) // Komma zu Punkt machen
      };

      await api.post('/services', payload);
      navigate('/dashboard/services');
    } catch (error) {
      console.error(error);
      alert('Fehler beim Speichern.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/services')}
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Liste
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Neue Dienstleistung</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Bezeichnung *</label>
          <input 
            required 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="z.B. Büroreinigung Standard"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Beschreibung</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows={3}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Details zur Leistung..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Preis (Netto) *</label>
            <div className="relative">
              <Euro className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input 
                required 
                type="number"
                step="0.01" // Erlaubt Kommastellen
                name="priceNet" 
                value={formData.priceNet} 
                onChange={handleChange} 
                className="w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Einheit *</label>
            <select 
              name="unit" 
              value={formData.unit} 
              onChange={handleChange} 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="hour">pro Stunde</option>
              <option value="sqm">pro m²</option>
              <option value="flat">Pauschal</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="h-5 w-5" />
          {loading ? 'Speichere...' : 'Leistung erstellen'}
        </button>

      </form>
    </div>
  );
}