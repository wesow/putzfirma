import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useParams wichtig für ID
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';

export default function EditEmployeePage() {
  const navigate = useNavigate();
  const { id } = useParams(); // ID aus der URL holen
  const [loading, setLoading] = useState(true); // Erstmal laden wir
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personnelNumber: '',
    email: '',
    role: 'Reinigungskraft'
  });

  // Beim Start: Daten laden
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        setFormData({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            personnelNumber: res.data.personnelNumber,
            email: res.data.email || '',
            role: res.data.role || 'Reinigungskraft'
        });
      } catch (error) {
        alert("Mitarbeiter nicht gefunden!");
        navigate('/dashboard/team');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // PUT statt POST
      await api.put(`/employees/${id}`, formData);
      navigate('/dashboard/team');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Fehler beim Speichern.');
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Lade Daten...</div>;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/team')}
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Mitarbeiter bearbeiten</h1>
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Dienst-Email</label>
          <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Personalnummer</label>
          <input required name="personnelNumber" value={formData.personnelNumber} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Position / Rolle</label>
          <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="Reinigungskraft">Reinigungskraft</option>
            <option value="Vorarbeiter">Vorarbeiter</option>
            <option value="Büro">Büro / Verwaltung</option>
            <option value="Manager">Manager</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <Save className="h-5 w-5" />
          {loading ? 'Speichere...' : 'Änderungen speichern'}
        </button>

      </form>
    </div>
  );
}