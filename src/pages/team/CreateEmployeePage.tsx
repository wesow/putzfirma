import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personnelNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/employees', formData);
      navigate('/dashboard/team');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Fehler beim Speichern.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/team')}
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Neuen Mitarbeiter anlegen</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vorname *</label>
            <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nachname *</label>
            <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Personalnummer *</label>
          <input 
            required 
            name="personnelNumber" 
            value={formData.personnelNumber} 
            onChange={handleChange} 
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="z.B. P-1001"
          />
          <p className="text-xs text-slate-500 mt-1">Muss eindeutig sein.</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="h-5 w-5" />
          {loading ? 'Speichere...' : 'Mitarbeiter erstellen'}
        </button>

      </form>
    </div>
  );
}