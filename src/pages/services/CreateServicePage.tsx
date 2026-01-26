import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Euro, 
  Briefcase, 
  Tag, 
  Loader2, 
  ListTodo, 
  Plus, 
  Trash2, 
  Sparkles, 
  Clock,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const SERVICE_TEMPLATES = [
  {
    label: "Büroreinigung",
    data: {
      name: "Unterhaltsreinigung Büro",
      description: "Regelmäßige Reinigung der Büroflächen, Sanitäranlagen und Teeküche.",
      priceNet: "35.00",
      unit: "hour",
      checklist: ["Müllentsorgung", "Oberflächen feucht abwischen", "Böden saugen/wischen", "Sanitärreinigung", "Teeküche reinigen"]
    }
  },
  {
    label: "Glasreinigung",
    data: {
      name: "Glas- & Rahmenreinigung",
      description: "Reinigung der Glasflächen inklusive Rahmen und Fensterbänke.",
      priceNet: "4.50",
      unit: "sqm",
      checklist: ["Glas einwaschen", "Abziehen", "Rahmen reinigen", "Fensterbänke wischen"]
    }
  },
  {
    label: "Treppenhaus",
    data: {
      name: "Treppenhausreinigung",
      description: "Komplette Reinigung des Treppenhauses vom Dachgeschoss bis Keller.",
      priceNet: "45.00",
      unit: "flat",
      checklist: ["Fegen & Wischen", "Handläufe desinfizieren", "Eingangstür reinigen", "Spinnweben entfernen"]
    }
  }
];

export default function CreateServicePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', priceNet: '', unit: 'hour' });
  const [checklist, setChecklist] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  const applyTemplate = (index: number) => {
    const tmpl = SERVICE_TEMPLATES[index];
    setFormData({ name: tmpl.data.name, description: tmpl.data.description, priceNet: tmpl.data.priceNet, unit: tmpl.data.unit });
    setChecklist(tmpl.data.checklist);
    toast.success(`Vorlage "${tmpl.label}" geladen!`, { icon: '✨' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading('Erstelle Leistung...');
    try {
      await api.post('/services', { ...formData, priceNet: parseFloat(String(formData.priceNet)), checklist });
      toast.success('Dienstleistung erstellt!', { id: tid });
      navigate('/dashboard/services');
    } catch { toast.error('Fehler beim Speichern', { id: tid }); }
    finally { setLoading(false); }
  };

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
            <h1 className="page-title text-3xl font-black">Leistung konfigurieren</h1>
            <p className="page-subtitle text-lg">Definieren Sie neue Services und standardisierte Aufgaben-Checklisten.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* QUICKSTART TEMPLATES (MODERNIZED) */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Sparkles size={120} className="text-blue-400" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-5 text-white text-left w-full md:w-auto">
              <div className="bg-blue-600 p-3.5 rounded-2xl shadow-lg shadow-blue-600/20"><Sparkles size={28} /></div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-widest leading-none mb-1">Schnellstart</h4>
                <p className="text-slate-400 text-xs font-bold tracking-tight">Vordefinierte Branchen-Vorlagen</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {SERVICE_TEMPLATES.map((tmpl, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  onClick={() => applyTemplate(idx)} 
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:border-blue-600 transition-all active:scale-95"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* INFO CARD */}
        <div className="form-card space-y-10">
          <div className="form-section-title">
            <Layers size={16} className="text-blue-500" /> 1. Basis-Konfiguration
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-1.5 text-left">
              <label className="label-caps">Bezeichnung der Dienstleistung *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Briefcase size={20} />
                </div>
                <input 
                  required 
                  className="input-standard pl-12 font-black text-lg" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="z.B. Grundreinigung Büro" 
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5 text-left">
              <label className="label-caps">Kurzbeschreibung (Katalog-Vorschau)</label>
              <textarea 
                rows={2} 
                className="input-standard resize-none min-h-[100px] font-medium" 
                value={formData.description || ''} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Detaillierte Informationen zum Leistungsumfang für Ihre Kunden..." 
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="label-caps">Standard Netto-Preis *</label>
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
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="label-caps">Kalkulationsbasis / Einheit</label>
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
                    placeholder="Neue Aufgabe für das Team vor Ort..." 
                    className="input-standard font-bold" 
                    value={newItem} 
                    onChange={e => setNewItem(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), newItem.trim() && (setChecklist([...checklist, newItem.trim()]), setNewItem('')))} 
                  />
              </div>
              <button 
                type="button" 
                onClick={() => newItem.trim() && (setChecklist([...checklist, newItem.trim()]), setNewItem(''))} 
                className="btn-primary !px-6 shadow-xl shadow-blue-200"
              >
                <Plus size={22}/>
              </button>
            </div>

            <div className="space-y-2.5">
              {checklist.map((item, idx) => (
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
              ))}
              
              {checklist.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <div className="stat-icon-wrapper bg-white text-slate-300 mx-auto mb-4 opacity-50"><ListTodo size={24} /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Keine operativen Aufgaben definiert</p>
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
            disabled={loading} 
            className="btn-primary min-w-[240px] shadow-xl shadow-blue-500/20 py-4 uppercase tracking-[0.2em] font-black text-[10px]"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                <Save size={18} /> 
                Leistung im System speichern
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}