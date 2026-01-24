import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Trash2, 
  User, 
  Mail, 
  CreditCard, 
  Briefcase, 
  Badge, 
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function EditEmployeePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personnelNumber: '',
    email: '',
    role: 'Reinigungskraft',
    hourlyWage: '12.50'
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        setFormData({
            firstName: res.data.firstName || '',
            lastName: res.data.lastName || '',
            personnelNumber: res.data.personnelNumber || '',
            email: res.data.email || '',
            role: res.data.role || 'Reinigungskraft',
            hourlyWage: res.data.hourlyWage ? String(res.data.hourlyWage) : '12.50'
        });
      } catch (error) {
        toast.error("Mitarbeiter nicht gefunden!");
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
    setSaving(true);
    try {
      await api.put(`/employees/${id}`, {
          ...formData,
          hourlyWage: Number(formData.hourlyWage)
      });
      toast.success('Änderungen gespeichert');
      navigate('/dashboard/team');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Speichern.');
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async () => {
      if(!confirm("Mitarbeiter wirklich löschen? Dies kann nicht rückgängig gemacht werden!")) return;
      
      setDeleting(true);
      const toastId = toast.loading("Lösche Mitarbeiter...");

      try {
          await api.delete(`/employees/${id}`);
          toast.success("Mitarbeiter gelöscht", { id: toastId });
          navigate('/dashboard/team');
      } catch(err) {
          toast.error("Löschen fehlgeschlagen (evtl. noch aktive Jobs?)", { id: toastId });
          setDeleting(false);
      }
  }

  if (loading) return <div className="p-20 text-center text-slate-400 flex flex-col items-center"><Loader2 className="animate-spin mb-2"/> Lade Daten...</div>;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-start">
        <div>
            <button 
            onClick={() => navigate('/dashboard/team')}
            className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-1 transition-colors"
            >
            <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
            </button>
            <h1 className="text-3xl font-bold text-slate-800">Mitarbeiter bearbeiten</h1>
        </div>
        
        <button 
            onClick={handleDelete} 
            disabled={deleting}
            className="group flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 hover:border-red-200 transition-all disabled:opacity-50"
            title="Mitarbeiter löschen"
        >
            {deleting ? <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18} />}
            <span className="text-sm font-bold hidden sm:inline">Löschen</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-8">
        
        {/* Sektion 1: Persönliche Daten */}
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="text-indigo-500 w-5 h-5" /> Persönliche Daten
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vorname *</label>
                    <input required name="firstName" value={formData.firstName} onChange={handleChange} 
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nachname *</label>
                    <input required name="lastName" value={formData.lastName} onChange={handleChange} 
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dienst-Email *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Mail size={18} />
                        </div>
                        <input 
                            required type="email" name="email" value={formData.email} onChange={handleChange} 
                            className="w-full pl-10 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" 
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Sektion 2: Vertragsdaten */}
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Briefcase className="text-indigo-500 w-5 h-5" /> Vertragsdaten
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Personalnummer</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Badge size={18} />
                        </div>
                        <input required name="personnelNumber" value={formData.personnelNumber} onChange={handleChange} 
                            className="w-full pl-10 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stundenlohn (€)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <CreditCard size={18} />
                        </div>
                        <input type="number" step="0.01" name="hourlyWage" value={formData.hourlyWage} onChange={handleChange} 
                            className="w-full pl-10 p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Position / Rolle</label>
                    <select name="role" value={formData.role} onChange={handleChange} 
                        className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition cursor-pointer appearance-none">
                        <option value="Reinigungskraft">Reinigungskraft</option>
                        <option value="Vorarbeiter">Vorarbeiter</option>
                        <option value="Büro">Büro / Verwaltung</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
                type="submit" 
                disabled={saving} 
                className="w-full md:w-auto px-8 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Änderungen speichern</>}
            </button>
        </div>

      </form>
    </div>
  );
}