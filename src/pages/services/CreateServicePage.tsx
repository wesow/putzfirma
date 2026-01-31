import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, Euro, Briefcase, Tag, Loader2, ListTodo, 
  Plus, Sparkles, Layers, Trash2, Copy, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

export default function CreateServicePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', priceNet: '', unit: 'hour' });
  const [checklist, setChecklist] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
        try {
            const res = await api.get('/services');
            setTemplates(res.data);
        } catch (e) {
            console.error("Konnte Vorlagen nicht laden", e);
        }
    };
    fetchTemplates();
  }, []);

  const applyTemplate = (service: any) => {
    setFormData({ 
        name: service.name + ' (Kopie)', 
        description: service.description || '', 
        priceNet: service.priceNet, 
        unit: service.unit 
    });
    
    let parsedChecklist = [];
    if (Array.isArray(service.checklist)) {
        parsedChecklist = service.checklist;
    } else if (typeof service.checklist === 'string') {
        try {
            parsedChecklist = JSON.parse(service.checklist);
        } catch { parsedChecklist = []; }
    }
    
    setChecklist(parsedChecklist);
    toast.success(`Daten übernommen`, { icon: '✨' });
  };

  const addChecklistItem = () => {
    if (!newItem.trim()) return;
    setChecklist([...checklist, newItem.trim()]);
    setNewItem('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading('Erstelle Leistung...');
    try {
      await api.post('/services', { 
        ...formData, 
        priceNet: parseFloat(String(formData.priceNet).replace(',', '.')), 
        checklist 
      });
      toast.success('Dienstleistung erstellt', { id: tid });
      navigate('/dashboard/services');
    } catch { 
        toast.error('Fehler beim Speichern', { id: tid }); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="page-container">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/services')} 
            className="btn-secondary !p-2"
            title="Zurück"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="page-title text-base">Leistung konfigurieren</h1>
            <p className="page-subtitle">Definieren Sie neue Services oder nutzen Sie Vorlagen.</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Katalog-Editor
            </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 pb-24">
        
        {/* --- TEMPLATES SECTION --- */}
        {templates.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <Sparkles size={120} className="text-blue-900" />
                </div>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                            <Copy size={20} />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Schnell-Vorlage</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Existierende Daten als Basis kopieren</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {templates.slice(0, 4).map((tmpl) => (
                            <button 
                                key={tmpl.id} 
                                type="button" 
                                onClick={() => applyTemplate(tmpl)} 
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                            >
                                <Plus size={12} className="opacity-40"/> {tmpl.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- MAIN CONTENT GRID --- */}
        <div className="content-grid lg:grid-cols-12 gap-4">

            {/* LINKS: BASIS DATEN */}
            <div className="lg:col-span-7 space-y-4">
                <div className="form-card">
                    <div className="form-section-title">
                        <Layers size={14} /> 1. Basis-Informationen
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="label-caps">Leistungsbezeichnung *</label>
                            <div className="relative group">
                                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    required 
                                    className="input-standard pl-10 font-bold text-sm" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    placeholder="z.B. Unterhaltsreinigung Standard" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label-caps">Beschreibung</label>
                            <textarea 
                                rows={4} 
                                className="input-standard resize-none font-medium text-xs leading-relaxed" 
                                value={formData.description || ''} 
                                onChange={e => setFormData({...formData, description: e.target.value})} 
                                placeholder="Detaillierte Beschreibung der Tätigkeit für das Angebot..." 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="label-caps text-emerald-600">Netto-Preis *</label>
                                <div className="relative">
                                    <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        required 
                                        className="input-standard pl-10 font-bold text-emerald-700" 
                                        value={formData.priceNet} 
                                        onChange={e => setFormData({...formData, priceNet: e.target.value})} 
                                        placeholder="0,00" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label-caps">Einheit</label>
                                <div className="relative">
                                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select 
                                        className="input-standard pl-10 cursor-pointer appearance-none" 
                                        value={formData.unit} 
                                        onChange={e => setFormData({...formData, unit: e.target.value})}
                                    >
                                        <option value="hour">pro Stunde (Std.)</option>
                                        <option value="sqm">pro Quadratmeter (m²)</option>
                                        <option value="flat">Pauschalbetrag (Stck.)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RECHTS: CHECKLISTE */}
            <div className="lg:col-span-5 space-y-4">
                <div className="form-card h-full flex flex-col border-l-2 border-l-blue-500">
                    <div className="form-section-title">
                        <ListTodo size={14} /> 2. Operative Checkliste
                    </div>
                    
                    <p className="text-[10px] text-slate-400 mb-4 italic">
                        Diese Aufgaben erscheinen in der Mitarbeiter-App für diesen Service.
                    </p>

                    <div className="flex gap-2 mb-4">
                        <input 
                            placeholder="Aufgabe hinzufügen..." 
                            className="input-standard flex-1" 
                            value={newItem} 
                            onChange={e => setNewItem(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())} 
                        />
                        <button 
                            type="button" 
                            onClick={addChecklistItem} 
                            className="btn-primary !p-2 shrink-0"
                        >
                            <Plus size={18}/>
                        </button>
                    </div>

                    <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar max-h-[350px] pr-1">
                        {checklist.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-50 rounded-xl">
                                <ListTodo size={24} className="text-slate-200 mb-2" />
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center">
                                    Checkliste leer
                                </p>
                            </div>
                        ) : (
                            checklist.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg group hover:bg-white hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-400 shrink-0">
                                            {idx + 1}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700 truncate">{item}</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setChecklist(checklist.filter((_, i) => i !== idx))} 
                                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14}/>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* --- FOOTER ACTION BAR --- */}
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[450px] z-50">
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xl flex items-center gap-2">
                <button 
                    type="button" 
                    onClick={() => navigate('/dashboard/services')} 
                    className="flex-1 px-4 py-2.5 rounded-xl text-slate-500 font-bold text-[11px] uppercase tracking-wider hover:bg-slate-100 transition-colors"
                >
                    Abbrechen
                </button>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn-primary flex-[2] py-2.5 shadow-lg shadow-blue-600/20"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={16} />
                    ) : (
                        <><Save size={16} /> Konfiguration speichern</>
                    )}
                </button>
            </div>
        </div>

      </form>
    </div>
  );
}