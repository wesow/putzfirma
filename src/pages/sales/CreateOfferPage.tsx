import {
  CalendarDays,
  ChevronLeft,
  Clock,
  Euro,
  Info,
  ListTodo,
  Loader2,
  MapPin,
  Plus,
  Repeat,
  Save,
  Sparkles,
  Trash2, User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function CreateOfferPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [availableAddresses, setAvailableAddresses] = useState<any[]>([]);

    // Formular State
    const [formData, setFormData] = useState({
        customerId: '',
        addressId: '',
        description: '',
        price: '',
        quantity: '1',
        interval: 'WEEKLY',
        preferredTime: '08:00',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Standard: 14 Tage
    });
    
    const [checklist, setChecklist] = useState<string[]>([]);
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resCust, resServ] = await Promise.all([
                    api.get('/customers'),
                    api.get('/services')
                ]);
                setCustomers(resCust.data);
                setServices(resServ.data);
            } catch (e) {
                toast.error("Stammdaten konnten nicht geladen werden.");
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (formData.customerId) {
            const cust = customers.find(c => c.id === formData.customerId);
            setAvailableAddresses(cust?.addresses || []);
        }
    }, [formData.customerId, customers]);

    const applyServiceTemplate = (serviceId: string) => {
        const s = services.find(srv => srv.id === serviceId);
        if (!s) return;

        setFormData(prev => ({
            ...prev,
            description: s.name,
            price: s.priceNet.toString()
        }));

        let importedChecklist = [];
        try {
            importedChecklist = typeof s.checklist === 'string' 
                ? JSON.parse(s.checklist) 
                : (s.checklist || []);
        } catch (e) {
            importedChecklist = [];
        }
        
        setChecklist(importedChecklist);
        toast.success("Leistungsdaten & Checkliste importiert", { icon: '✨' });
    };

    const addChecklistItem = () => {
        if (!newItem.trim()) return;
        setChecklist([...checklist, newItem.trim()]);
        setNewItem('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerId || !formData.description) return toast.error("Pflichtfelder fehlen");

        setLoading(true);
        const tid = toast.loading('Angebot wird generiert...');
        try {
            await api.post('/offers', {
                customerId: formData.customerId,
                addressId: formData.addressId || undefined,
                validUntil: new Date(formData.validUntil), // Das Datum aus dem Formular nutzen
                interval: formData.interval,
                preferredTime: formData.preferredTime,
                checklist: checklist, 
                items: [{
                    description: formData.description,
                    quantity: parseFloat(formData.quantity),
                    unit: 'Psch',
                    unitPrice: parseFloat(formData.price.replace(',', '.'))
                }]
            });
            toast.success('Angebot erfolgreich erstellt', { id: tid });
            navigate('/dashboard/offers');
        } catch (err) {
            toast.error('Fehler beim Speichern', { id: tid });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container pb-safe">
            
            {/* --- HEADER SECTION --- */}
            <div className="header-section">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/dashboard/offers')} 
                        className="btn-secondary !p-1.5"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div>
                        <h1 className="page-title text-base">Neues Angebot</h1>
                        <p className="page-subtitle">Kalkulation und operative Planung.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 pb-32">
                
                {/* --- TEMPLATE IMPORT --- */}
                <div className="bg-slate-900 p-4 rounded-xl shadow-lg shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Sparkles size={18} className="text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-widest leading-none">Katalog-Import</h4>
                            <p className="text-[10px] text-slate-400 mt-1">Leistung laden, um Preis & Checkliste zu füllen</p>
                        </div>
                    </div>
                    <select 
                        className="input-standard !w-full md:!w-72 !bg-white/5 !border-white/10 !text-white font-bold cursor-pointer"
                        onChange={(e) => applyServiceTemplate(e.target.value)}
                        defaultValue=""
                    >
                        <option value="" className="text-slate-900">Leistung wählen...</option>
                        {services.map(s => (
                            <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="content-grid lg:grid-cols-12 gap-4">
                    
                    {/* LINKS: STAMMDATEN */}
                    <div className="lg:col-span-7 space-y-4">
                        
                        {/* 1. EMPFÄNGER */}
                        <div className="form-card">
                            <div className="form-section-title"><User size={14} /> 1. Empfänger & Objekt</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="label-caps">Kunde wählen *</label>
                                    <select 
                                        className="input-standard font-bold" 
                                        value={formData.customerId} 
                                        onChange={e => setFormData({...formData, customerId: e.target.value})}
                                        required
                                    >
                                        <option value="">Bitte wählen...</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.lastName}, ${c.firstName}`}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="label-caps">Objekt / Adresse</label>
                                    <div className="relative group">
                                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <select 
                                            className="input-standard pl-10" 
                                            value={formData.addressId} 
                                            onChange={e => setFormData({...formData, addressId: e.target.value})}
                                            disabled={!formData.customerId}
                                        >
                                            <option value="">Hauptanschrift</option>
                                            {availableAddresses.map(a => <option key={a.id} value={a.id}>{a.street}, {a.city}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. LEISTUNG */}
                        <div className="form-card">
                            <div className="form-section-title"><Euro size={14} /> 2. Konditionen & Kalkulation</div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="label-caps">Angebotstext (Leistung) *</label>
                                    <input 
                                        className="input-standard font-bold" 
                                        value={formData.description} 
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        placeholder="z.B. Unterhaltsreinigung Büroetage"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="label-caps">Menge</label>
                                        <input 
                                            type="number" 
                                            className="input-standard font-bold text-center" 
                                            value={formData.quantity} 
                                            onChange={e => setFormData({...formData, quantity: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="label-caps text-blue-600">Einzelpreis Netto (€)</label>
                                        <div className="relative group">
                                            <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                className="input-standard pl-10 font-black text-blue-700" 
                                                value={formData.price} 
                                                onChange={e => setFormData({...formData, price: e.target.value})}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. PLANUNG */}
                        <div className="form-card">
                            <div className="form-section-title"><Repeat size={14} /> 3. Turnus & Zeitplanung</div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {['ONCE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'].map(int => (
                                        <button 
                                            key={int} 
                                            type="button" 
                                            onClick={() => setFormData({...formData, interval: int})}
                                            className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${formData.interval === int ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                        >
                                            {int === 'ONCE' ? 'Einmal' : int === 'WEEKLY' ? 'Woche' : int === 'BIWEEKLY' ? '14-Tage' : 'Monat'}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="label-caps">Gültig bis</label>
                                        <div className="relative">
                                            <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input 
                                                type="date" 
                                                className="input-standard pl-10 font-bold" 
                                                value={formData.validUntil} 
                                                onChange={e => setFormData({...formData, validUntil: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="label-caps">Startzeit (Planung)</label>
                                        <div className="relative">
                                            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input 
                                                type="time" 
                                                className="input-standard pl-10 font-bold" 
                                                value={formData.preferredTime} 
                                                onChange={e => setFormData({...formData, preferredTime: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RECHTS: CHECKLISTE */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="form-card h-full border-l-[3px] border-l-blue-500 flex flex-col">
                            <div className="form-section-title flex justify-between items-center w-full">
                                <div className="flex items-center gap-2"><ListTodo size={14} /> 4. Operative Checkliste</div>
                                <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 italic">Optional</span>
                            </div>
                            
                            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 mb-4 flex items-start gap-2">
                                <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-blue-800 leading-snug font-medium uppercase tracking-tighter">
                                    Diese Punkte definieren das Leistungsverzeichnis im Angebot.
                                </p>
                            </div>

                            <div className="flex gap-2 mb-4">
                                <input 
                                    placeholder="Aufgabe hinzufügen..." 
                                    className="input-standard flex-1 text-[12px] font-medium" 
                                    value={newItem} 
                                    onChange={e => setNewItem(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                                />
                                <button type="button" onClick={addChecklistItem} className="btn-primary !p-2 shrink-0"><Plus size={20}/></button>
                            </div>

                            <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar max-h-[500px]">
                                {checklist.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-100 rounded-xl text-slate-300">
                                        <ListTodo size={24} className="mb-2 opacity-50" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Checkliste leer</span>
                                    </div>
                                ) : (
                                    checklist.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg group hover:border-blue-200 transition-all">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[9px] font-black text-blue-600 shadow-sm shrink-0">{idx + 1}</div>
                                                <span className="text-[11px] font-bold text-slate-700 truncate">{item}</span>
                                            </div>
                                            <button type="button" onClick={() => setChecklist(checklist.filter((_, i) => i !== idx))} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FLOATING ACTION FOOTER --- */}
                <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 md:left-auto md:w-auto z-30">
                    <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
                        <button 
                            type="button" 
                            onClick={() => navigate('/dashboard/offers')} 
                            className="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="btn-primary flex-[2] md:flex-none py-2.5 px-8 shadow-lg shadow-blue-600/20 min-w-[160px] text-[11px] uppercase tracking-widest font-black"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <><Save size={16} /> Angebot erstellen</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}