import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Euro, Briefcase, Tag, Loader2, ListTodo, Plus, Trash2, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

export default function EditServicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', description: '', priceNet: '', unit: 'hour' });
  const [checklist, setChecklist] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/services/${id}`);
        const data = res.data;
        
        setFormData({ 
          name: data.name || '', 
          description: data.description || '', 
          priceNet: data.priceNet || '0', 
          unit: data.unit || 'hour' 
        });

        if (data.checklist && Array.isArray(data.checklist)) {
          setChecklist(data.checklist);
        } else if (typeof data.checklist === 'string') {
            try {
                setChecklist(JSON.parse(data.checklist));
            } catch {
                setChecklist([]);
            }
        } else {
          setChecklist([]);
        }
      } catch (err) { 
        toast.error("Fehler beim Laden der Leistung"); 
        navigate('/dashboard/services'); 
      } finally { 
        setLoading(false); 
      }
    };
    if (id) load();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tid = toast.loading('Speichere Änderungen...');
    try {
      await api.put(`/services/${id}`, { 
        ...formData, 
        priceNet: parseFloat(String(formData.priceNet).replace(',', '.')), 
        checklist 
      });
      toast.success('Dienstleistung aktualisiert', { id: tid });
      navigate('/dashboard/services');
    } catch (error) { 
      toast.error('Speichern fehlgeschlagen', { id: tid }); 
    } finally { 
      setSaving(false); 
    }
  };

  const addChecklistItem = () => {
    if (!newItem.trim()) return;
    setChecklist(prev => [...prev, newItem.trim()]);
    setNewItem('');
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Lade Konfiguration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      
      {/* HEADER & NAV */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/services')} 
          className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-2 mb-4 transition-all font-black uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"
        >
          <ArrowLeft size={14} /> Zurück zum Katalog
        </button>
        <div className="header-section !bg-transparent !border-none !p-0 !shadow-none">
          <div className="text-left">
            <h1 className="page-title text-3xl font-black">Leistung editieren</h1>
            <p className="page-subtitle text-lg">Passen Sie die Stammdaten und die operative Checkliste an.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* INFO CARD */}
        <div className="form-card space-y-10">
          <div className="form-section-title">
            <Layers size={16} className="text-blue-500" /> 1. Basis-Informationen
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-1.5 text-left">
              <label className="label-caps">Bezeichnung *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Briefcase size={20} />
                </div>
                <input 
                  required 
                  className="input-standard pl-12 font-black text-lg" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Name der Dienstleistung"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5 text-left">
              <label className="label-caps">Leistungsbeschreibung</label>
              <textarea 
                rows={2} 
                className="input-standard resize-none min-h-[100px] font-medium" 
                value={formData.description || ''} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Was beinhaltet diese Leistung genau?"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="label-caps">Preis (Netto €) *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Euro size={20} />
                </div>
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  className="input-standard pl-12 font-black" 
                  value={formData.priceNet} 
                  onChange={e => setFormData({...formData, priceNet: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="label-caps">Abrechnungseinheit</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Tag size={20} />
                </div>
                <select 
                  className="input-standard pl-12 appearance-none cursor-pointer" 
                  value={formData.unit} 
                  onChange={e => setFormData({...formData, unit: e.target.value})}
                >
                  <option value="hour">pro Arbeitsstunde (Std.)</option>
                  <option value="sqm">pro Quadratmeter (m²)</option>
                  <option value="flat">Festpreis / Pauschale</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CHECKLIST CARD */}
        <div className="form-card space-y-10">
          <div className="form-section-title">
            <ListTodo size={16} className="text-blue-500" /> 2. Operative Aufgaben-Checkliste
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1 group">
                  <input 
                    placeholder="Aufgabe hinzufügen..." 
                    className="input-standard font-bold" 
                    value={newItem} 
                    onChange={e => setNewItem(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())} 
                  />
              </div>
              <button 
                type="button" 
                onClick={addChecklistItem} 
                className="btn-primary !px-6 shadow-xl shadow-blue-200"
              >
                <Plus size={22}/>
              </button>
            </div>

            <div className="space-y-2.5">
              {Array.isArray(checklist) && checklist.length > 0 ? (
                checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-[1.25rem] group hover:bg-blue-50 hover:border-blue-100 transition-all animate-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 shadow-sm transition-all italic">
                        #{idx + 1}
                      </div>
                      <span className="text-sm font-black text-slate-700 tracking-tight">{item}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setChecklist(checklist.filter((_, i) => i !== idx))} 
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <div className="stat-icon-wrapper bg-white text-slate-300 mx-auto mb-4 opacity-50"><ListTodo size={24} /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Keine Aufgaben definiert</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-4 bg-slate-100/50 p-6 rounded-[2.5rem] border border-slate-100">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard/services')} 
            className="btn-secondary !shadow-none border-transparent hover:bg-slate-200"
          >
            Abbrechen
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className="btn-primary min-w-[240px] shadow-xl shadow-blue-500/20 py-4 uppercase tracking-[0.2em] font-black text-[10px]"
          >
            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save size={18} /> Änderungen speichern</>}
          </button>
        </div>
      </form>
    </div>
  );
}