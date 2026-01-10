import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    // Adresse direkt mit aufnehmen
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
    
    try {
      // Wir müssen die Daten so formatieren, wie das Backend sie erwartet
      // (Adresse ist ein verschachteltes Objekt im Backend)
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName || undefined,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.street,
          zipCode: formData.zipCode,
          city: formData.city
        }
      };

      await api.post('/customers', payload);
      navigate('/dashboard/customers'); // Zurück zur Liste
    } catch (error) {
      console.error(error);
      alert('Fehler beim Erstellen. Email vielleicht schon vergeben?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/customers')}
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Neuen Kunden anlegen</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        
        {/* Sektion: Persönliche Daten */}
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4 border-b pb-2">Basisdaten</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Firma (Optional)</label>
              <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Muster GmbH" />
            </div>
            <div className="hidden md:block"></div> {/* Spacer */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vorname *</label>
              <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nachname *</label>
              <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Sektion: Adresse */}
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4 border-b pb-2">Hauptadresse</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Straße & Hausnummer *</label>
              <input required name="street" value={formData.street} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">PLZ *</label>
                <input required name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Stadt *</label>
                <input required name="city" value={formData.city} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Speichere...' : 'Kunde anlegen'}
          </button>
        </div>

      </form>
    </div>
  );
}