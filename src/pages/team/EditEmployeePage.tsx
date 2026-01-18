import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function EditEmployeePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
      if(!confirm("Mitarbeiter wirklich löschen? Das kann nicht rückgängig gemacht werden!")) return;
      try {
          await api.delete(`/employees/${id}`);
          toast.success("Mitarbeiter gelöscht");
          navigate('/dashboard/team');
      } catch(err) {
          toast.error("Löschen fehlgeschlagen (evtl. noch aktive Jobs?)");
      }
  }

  if (loading) return <div className="p-10 text-center text-slate-400">Lade Daten...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
            <button onClick={() => navigate('/dashboard/team')} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Mitarbeiter bearbeiten</h1>
        </div>
        <button onClick={handleDelete} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Löschen">
            <Trash2 size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vorname</label>
            <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nachname</label>
            <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Dienst-Email</label>
          <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Personalnummer</label>
                <input required name="personnelNumber" value={formData.personnelNumber} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stundenlohn (€)</label>
                <input type="number" step="0.01" name="hourlyWage" value={formData.hourlyWage} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rolle</label>
          <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="Reinigungskraft">Reinigungskraft</option>
            <option value="Vorarbeiter">Vorarbeiter</option>
            <option value="Büro">Büro / Verwaltung</option>
            <option value="Manager">Manager</option>
          </select>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Save className="h-5 w-5" /> Speichern</>}
        </button>
      </form>
    </div>
  );
}