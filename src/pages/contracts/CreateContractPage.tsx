import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';

export default function CreateContractPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Daten für die Dropdowns
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    startDate: '',
    interval: 'WEEKLY'
  });

  // Beim Laden der Seite: Kunden und Services holen
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
        console.error("Fehler beim Laden der Listen", e);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Wir müssen die Adresse des Kunden finden (Automatisieren wir erstmal)
      const selectedCustomer = customers.find(c => c.id === formData.customerId);
      if (!selectedCustomer || selectedCustomer.addresses.length === 0) {
        alert("Dieser Kunde hat keine Adresse hinterlegt!");
        setLoading(false);
        return;
      }

      // Daten senden
      await api.post('/contracts', {
        customerId: formData.customerId,
        serviceId: formData.serviceId,
        addressId: selectedCustomer.addresses[0].id, // Nimm automatisch die erste Adresse
        startDate: new Date(formData.startDate).toISOString(),
        interval: formData.interval
      });

      navigate('/dashboard/contracts');
    } catch (error) {
      console.error(error);
      alert('Fehler beim Erstellen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/contracts')}
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Neuen Vertrag anlegen</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        
        {/* Kunde auswählen */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kunde *</label>
          <select 
            required
            className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.customerId}
            onChange={e => setFormData({...formData, customerId: e.target.value})}
          >
            <option value="">-- Bitte wählen --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.companyName || `${c.lastName}, ${c.firstName}`}
              </option>
            ))}
          </select>
        </div>

        {/* Service auswählen */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Dienstleistung *</label>
          <select 
            required
            className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.serviceId}
            onChange={e => setFormData({...formData, serviceId: e.target.value})}
          >
            <option value="">-- Bitte wählen --</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.priceNet} € / {s.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Startdatum */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Startdatum *</label>
          <input 
            required
            type="date"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.startDate}
            onChange={e => setFormData({...formData, startDate: e.target.value})}
          />
        </div>

        {/* Intervall */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reinigungs-Intervall *</label>
          <select 
            required
            className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.interval}
            onChange={e => setFormData({...formData, interval: e.target.value})}
          >
            <option value="WEEKLY">Wöchentlich (Jede Woche)</option>
            <option value="BIWEEKLY">Alle 2 Wochen</option>
            <option value="MONTHLY">Monatlich</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="h-5 w-5" />
          {loading ? 'Erstelle Vertrag...' : 'Vertrag speichern'}
        </button>

      </form>
    </div>
  );
}