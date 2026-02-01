import {
    Briefcase,
    CheckCircle,
    ChevronLeft,
    Euro,
    Info,
    Layers,
    ListTodo,
    Loader2,
    Plus,
    Save,
    Tag,
    Trash2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';

// --- TYPES ---
type BillingType = 'FIXED' | 'HOURLY' | 'QM';

export default function EditServicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // FORM STATE
  const [formData, setFormData] = useState({ 
      name: '', 
      description: '', 
      priceNet: '', 
      unit: 'Stunde', 
      billingType: 'HOURLY' as BillingType 
  });
  
  const [checklist, setChecklist] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  // 1. DATEN LADEN
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/services/${id}`);
        const data = res.data;
        
        setFormData({ 
          name: data.name || '', 
          description: data.description || '', 
          priceNet: data.priceNet || '0', 
          unit: data.unit || 'Stunde',
          billingType: (data.billingType as BillingType) || 'HOURLY'
        });

        if (data.checklist) {
            try {
                setChecklist(typeof data.checklist === 'string' ? JSON.parse(data.checklist) : data.checklist);
            } catch { setChecklist([]); }
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

  // 2. SPEICHERN
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tid = toast.loading('Speichere Änderungen...');
    
    try {
      const price = parseFloat(String(formData.priceNet).replace(',', '.'));
      if (isNaN(price) || price < 0) throw new Error("Ungültiger Preis");

      await api.put(`/services/${id}`, { 
        ...formData, 
        priceNet: price, 
        checklist 
      });
      
      toast.success('Leistung aktualisiert', { id: tid });
      navigate('/dashboard/services');
    } catch (e: any) { 
        toast.error(e.message || 'Fehler beim Speichern', { id: tid }); 
    } finally { 
        setSaving(false); 
    }
  };

  const addChecklistItem = () => {
    if (!newItem.trim()) return;
    setChecklist([...checklist, newItem.trim()]);
    setNewItem('');
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Lade Konfiguration...</span>
      </div>
    );
  }

  return (
    <div className="page-container">
      
      {/* --- HEADER --- */}
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
            <h1 className="page-title text-base">Leistung bearbeiten</h1>
            <p className="page-subtitle">Anpassung von <span className="text-slate-900 font-bold">{formData.name}</span></p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Service-ID: {id?.substring(0, 8)}...
            </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 pb-24">
        
        <div className="content-grid lg:grid-cols-12 gap-4">

            {/* LINKS: BASIS DATEN */}
            <div className="lg:col-span-7 space-y-4">
                
                {/* 1. ABRECHNUNGSMODELL */}
                <div className="form-card">
                    <div className="form-section-title">
                        <Tag size={14} /> 1. Abrechnungsmodell
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className={`cursor-pointer border rounded-xl p-4 transition-all relative flex flex-col gap-2 ${formData.billingType === 'FIXED' ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'}`}>
                            <input type="radio" name="billingType" value="FIXED" className="hidden" checked={formData.billingType === 'FIXED'} onChange={() => setFormData({...formData, billingType: 'FIXED', unit: 'Pauschal'})} />
                            <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-black uppercase tracking-widest ${formData.billingType === 'FIXED' ? 'text-emerald-700' : 'text-slate-600'}`}>Festpreis</span>
                                {formData.billingType === 'FIXED' && <CheckCircle size={16} className="text-emerald-500"/>}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-snug">
                                Fixer Betrag pro Auftrag. Ideal für Pauschalen.
                            </p>
                        </label>

                        <label className={`cursor-pointer border rounded-xl p-4 transition-all relative flex flex-col gap-2 ${formData.billingType === 'HOURLY' ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'}`}>
                            <input type="radio" name="billingType" value="HOURLY" className="hidden" checked={formData.billingType === 'HOURLY'} onChange={() => setFormData({...formData, billingType: 'HOURLY', unit: 'Stunde'})} />
                            <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-black uppercase tracking-widest ${formData.billingType === 'HOURLY' ? 'text-blue-700' : 'text-slate-600'}`}>Nach Aufwand</span>
                                {formData.billingType === 'HOURLY' && <CheckCircle size={16} className="text-blue-500"/>}
                            </div>
                            <p className="text-[10px] text-slate-500 leading-snug">
                                Abrechnung nach Stunden. Ideal für Regiearbeiten.
                            </p>
                        </label>
                    </div>
                </div>

                {/* 2. STAMMDATEN */}
                <div className="form-card">
                    <div className="form-section-title">
                        <Layers size={14} /> 2. Leistungsdaten
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="label-caps">Bezeichnung</label>
                            <div className="relative group">
                                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    required 
                                    className="input-standard pl-10 font-bold" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    placeholder="z.B. Büroreinigung Standard" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="label-caps">Beschreibung (für Angebot)</label>
                            <textarea 
                                rows={3} 
                                className="input-standard resize-none text-xs leading-relaxed" 
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})} 
                                placeholder="Detaillierte Beschreibung der Tätigkeit..." 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="label-caps text-emerald-600">Preis (Netto)</label>
                                <div className="relative group">
                                    <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                    <input 
                                        type="number" step="0.01" required 
                                        className="input-standard pl-10 font-black text-emerald-700" 
                                        value={formData.priceNet} 
                                        onChange={e => setFormData({...formData, priceNet: e.target.value})} 
                                        placeholder="0.00" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="label-caps">Einheit</label>
                                <div className="relative group">
                                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        className="input-standard pl-10" 
                                        value={formData.unit} 
                                        onChange={e => setFormData({...formData, unit: e.target.value})} 
                                        placeholder={formData.billingType === 'FIXED' ? 'Pauschal' : 'Stunde'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RECHTS: CHECKLISTE */}
            <div className="lg:col-span-5 space-y-4">
                <div className="form-card h-full flex flex-col border-l-2 border-l-indigo-500">
                    <div className="form-section-title !text-indigo-600">
                        <ListTodo size={14} /> 3. Mitarbeiter Checkliste
                    </div>
                    
                    <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 mb-4 flex items-start gap-2">
                        <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-indigo-800 leading-snug">
                            Diese Aufgaben müssen vom Mitarbeiter in der App abgehakt werden.
                        </p>
                    </div>

                    <div className="flex gap-2 mb-4">
                        <input 
                            placeholder="Neue Aufgabe..." 
                            className="input-standard flex-1 text-xs" 
                            value={newItem} 
                            onChange={e => setNewItem(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())} 
                        />
                        <button type="button" onClick={addChecklistItem} className="btn-primary !p-2 shrink-0"><Plus size={18}/></button>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar max-h-[400px]">
                        {checklist.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                                <ListTodo size={24} className="text-slate-200 mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Keine Aufgaben</span>
                            </div>
                        ) : (
                            checklist.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-lg group hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500">{idx + 1}</div>
                                        <span className="text-xs font-medium text-slate-700">{item}</span>
                                    </div>
                                    <button type="button" onClick={() => setChecklist(checklist.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>

        {/* --- FLOATING ACTION FOOTER --- */}
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
                    disabled={saving} 
                    className="btn-primary flex-[2] py-2.5 shadow-lg shadow-blue-600/20"
                >
                    {saving ? (
                        <Loader2 className="animate-spin" size={16} />
                    ) : (
                        <><Save size={16} /> Änderungen speichern</>
                    )}
                </button>
            </div>
        </div>

      </form>
    </div>
  );
}