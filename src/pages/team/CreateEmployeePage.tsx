import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, User, Mail, CreditCard, Briefcase, Badge } from 'lucide-react';
import toast from 'react-hot-toast'; // Bessere Notifications
import api from '../../lib/api';

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    personnelNumber: '',
    role: 'Reinigungskraft',
    hourlyWage: '12.50' // Standardwert
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validierung
    if (!formData.email.includes('@')) {
        toast.error("Bitte eine gültige E-Mail angeben");
        setLoading(false);
        return;
    }

    try {
      await api.post('/employees', {
          ...formData,
          hourlyWage: Number(formData.hourlyWage) // Als Zahl senden
      });
      
      toast.success('Mitarbeiter erfolgreich angelegt!');
      navigate('/dashboard/team');
    } catch (error: any) {
      console.error(error);
      // Zeigt die echte Fehlermeldung vom Backend an (z.B. "Email existiert schon")
      toast.error(error.response?.data?.message || 'Fehler beim Speichern.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <div>
            <button 
            onClick={() => navigate('/dashboard/team')}
            className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2 transition-colors"
            >
            <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Neuen Mitarbeiter anlegen</h1>
            <p className="text-slate-500 text-sm">Erfasse die Stammdaten für dein Team.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-8">
        
        {/* Sektion 1: Persönliche Daten */}
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="text-blue-500 w-5 h-5" /> Persönliche Daten
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vorname *</label>
                    <input required name="firstName" value={formData.firstName} onChange={handleChange} 
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Max" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nachname *</label>
                    <input required name="lastName" value={formData.lastName} onChange={handleChange} 
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Mustermann" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dienst-Email *</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                        <input 
                            required type="email" name="email" value={formData.email} onChange={handleChange} 
                            className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                            placeholder="mitarbeiter@cleanops.de"
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Wird für den Login und Benachrichtigungen benötigt.</p>
                </div>
            </div>
        </div>

        {/* Sektion 2: Firmendaten */}
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Briefcase className="text-blue-500 w-5 h-5" /> Vertragsdaten
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Personalnummer *</label>
                    <div className="relative">
                        <Badge className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                        <input 
                            required name="personnelNumber" value={formData.personnelNumber} onChange={handleChange} 
                            className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                            placeholder="P-001"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stundenlohn (€)</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                        <input 
                            type="number" step="0.01" name="hourlyWage" value={formData.hourlyWage} onChange={handleChange} 
                            className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                        />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Position / Rolle</label>
                    <select name="role" value={formData.role} onChange={handleChange} 
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer">
                        <option value="Reinigungskraft">Reinigungskraft</option>
                        <option value="Vorarbeiter">Vorarbeiter</option>
                        <option value="Büro">Büro / Verwaltung</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="pt-4">
            <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Save className="h-5 w-5" /> Mitarbeiter anlegen</>}
            </button>
        </div>

      </form>
    </div>
  );
}